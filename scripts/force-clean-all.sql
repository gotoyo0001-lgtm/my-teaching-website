-- =====================================================
-- 强力清理脚本 - 解决所有依赖关系问题
-- =====================================================
-- 此脚本使用 CASCADE 删除处理所有依赖关系
-- 适用于解决复杂的依赖关系错误

-- =====================================================
-- 第一步：强制删除所有触发器
-- =====================================================

-- 删除用户相关触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- 查看并删除其他可能的触发器
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- 查找所有与我们函数相关的触发器
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', 
                      trigger_record.trigger_name, 
                      trigger_record.event_object_table);
        RAISE NOTICE '🗑️ 删除触发器: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- =====================================================
-- 第二步：强制删除所有相关函数
-- =====================================================

-- 使用 CASCADE 强制删除函数（处理所有依赖）
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS promote_user_role(UUID, archetype_role) CASCADE;
DROP FUNCTION IF EXISTS get_table_policies(text) CASCADE;
DROP FUNCTION IF EXISTS get_user_statistics() CASCADE;
DROP FUNCTION IF EXISTS security_audit() CASCADE;

-- 删除其他可能的函数变体
DROP FUNCTION IF EXISTS handle_new_user(RECORD) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =====================================================
-- 第三步：清理所有 RLS 策略
-- =====================================================

-- 清理 profiles 表的所有策略
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', 
                      policy_record.policyname);
        RAISE NOTICE '🛡️ 删除策略: %', policy_record.policyname;
    END LOOP;
END $$;

-- 清理 oracles 表的所有策略（如果存在）
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles' AND table_schema = 'public') THEN
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'oracles'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON oracles', 
                          policy_record.policyname);
            RAISE NOTICE '📢 删除 oracles 策略: %', policy_record.policyname;
        END LOOP;
    END IF;
END $$;

-- 清理 categories 表的所有策略（如果存在）
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'categories'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON categories', 
                          policy_record.policyname);
            RAISE NOTICE '📁 删除 categories 策略: %', policy_record.policyname;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- 第四步：清理视图（如果存在）
-- =====================================================

DROP VIEW IF EXISTS public_profiles CASCADE;

-- =====================================================
-- 第五步：清理可能的枚举类型冲突
-- =====================================================

-- 注意：这里不删除 archetype_role 和 oracle_type，因为可能被其他地方使用
-- 如果需要重新创建，主脚本会处理

-- =====================================================
-- 第六步：验证清理结果
-- =====================================================

-- 检查剩余的策略
SELECT 
    '🔍 策略清理检查' as check_type,
    tablename,
    COUNT(*) as remaining_policies,
    string_agg(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename IN ('profiles', 'oracles', 'categories')
GROUP BY tablename
UNION ALL
SELECT 
    '🔍 策略清理检查' as check_type,
    'TOTAL' as tablename,
    COUNT(*) as remaining_policies,
    'See above' as policy_names
FROM pg_policies 
WHERE tablename IN ('profiles', 'oracles', 'categories');

-- 检查剩余的函数
SELECT 
    '🔍 函数清理检查' as check_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN (
    'handle_new_user', 
    'promote_user_role',
    'get_table_policies',
    'get_user_statistics',
    'security_audit'
)
UNION ALL
SELECT 
    '🔍 函数清理总结' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 所有相关函数已清理'
        ELSE '⚠️ 仍有函数存在'
    END as routine_name,
    '' as routine_type,
    COUNT(*)::text as security_type
FROM information_schema.routines 
WHERE routine_name IN (
    'handle_new_user', 
    'promote_user_role',
    'get_table_policies',
    'get_user_statistics',
    'security_audit'
);

-- 检查剩余的触发器
SELECT 
    '🔍 触发器清理检查' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 所有相关触发器已清理'
        ELSE '⚠️ 仍有 ' || COUNT(*) || ' 个触发器存在'
    END as result,
    string_agg(trigger_name, ', ') as remaining_triggers
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%';

-- 检查表状态
SELECT 
    '📊 表状态检查' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS 已启用'
        ELSE '🔓 RLS 已禁用'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('profiles', 'oracles', 'categories')
    AND schemaname = 'public';

/*
🚀 强力清理完成！

✅ 已清理内容：
- 🗑️ 所有相关触发器（使用 CASCADE）
- ⚙️ 所有相关函数（使用 CASCADE）
- 🛡️ 所有 RLS 策略（动态删除）
- 👁️ 相关视图
- 🔍 完整的验证检查

🎯 下一步：
现在可以安全地执行主升级脚本：
scripts/complete-database-upgrade.sql

⚠️ 重要提醒：
- 此脚本使用了 CASCADE 删除，会处理所有依赖关系
- 所有相关的数据库对象都会被重新创建
- 请确保在执行前备份重要数据
*/