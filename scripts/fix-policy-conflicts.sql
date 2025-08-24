-- =====================================================
-- 快速修复：解决 RLS 策略冲突错误
-- =====================================================
-- 专门解决 "policy already exists" 错误
-- 在执行主升级脚本前运行此脚本

-- =====================================================
-- 清理所有可能冲突的 profiles 表策略
-- =====================================================

-- 删除旧的策略名称
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 删除中文策略名称
DROP POLICY IF EXISTS "用户可以查看所有档案" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的档案" ON profiles;
DROP POLICY IF EXISTS "用户可以插入自己的档案" ON profiles;

-- 删除其他可能的策略名称
DROP POLICY IF EXISTS "enable_read_access_for_all" ON profiles;
DROP POLICY IF EXISTS "allow_all_operations" ON profiles;
DROP POLICY IF EXISTS "temporary_full_access" ON profiles;
DROP POLICY IF EXISTS "emergency_read_all" ON profiles;
DROP POLICY IF EXISTS "emergency_insert_own" ON profiles;
DROP POLICY IF EXISTS "emergency_update_own" ON profiles;

-- 删除新的策略名称（可能已存在）
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- =====================================================
-- 清理 oracles 表策略（如果表存在）
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles' AND table_schema = 'public') THEN
        -- 删除 oracles 表的策略
        DROP POLICY IF EXISTS "oracles_select_policy" ON oracles;
        DROP POLICY IF EXISTS "oracles_insert_policy" ON oracles;
        DROP POLICY IF EXISTS "oracles_update_policy" ON oracles;
        DROP POLICY IF EXISTS "oracles_delete_policy" ON oracles;
        
        RAISE NOTICE '✅ 已清理 oracles 表策略';
    ELSE
        RAISE NOTICE 'ℹ️ oracles 表尚不存在';
    END IF;
END $$;

-- =====================================================
-- 清理 categories 表策略（如果表存在）
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        -- 删除 categories 表的策略
        DROP POLICY IF EXISTS "categories_select_policy" ON categories;
        DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
        DROP POLICY IF EXISTS "categories_update_policy" ON categories;
        DROP POLICY IF EXISTS "categories_delete_policy" ON categories;
        
        RAISE NOTICE '✅ 已清理 categories 表策略';
    ELSE
        RAISE NOTICE 'ℹ️ categories 表尚不存在';
    END IF;
END $$;

-- =====================================================
-- 清理触发器（必须在删除函数之前）
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- 清理可能存在的函数（在触发器删除后）
-- =====================================================

DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS promote_user_role(UUID, archetype_role);
DROP FUNCTION IF EXISTS get_table_policies(text);
DROP FUNCTION IF EXISTS get_user_statistics();
DROP FUNCTION IF EXISTS security_audit();

-- =====================================================
-- 验证清理结果
-- =====================================================

-- 检查 profiles 表剩余策略
SELECT 
    '🔍 profiles 表策略检查' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 所有策略已清理'
        ELSE '⚠️ 仍有 ' || COUNT(*) || ' 个策略存在'
    END as result,
    string_agg(policyname, ', ') as remaining_policies
FROM pg_policies 
WHERE tablename = 'profiles';

-- 检查函数清理结果
SELECT 
    '🔍 函数清理检查' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 所有相关函数已清理'
        ELSE '⚠️ 仍有 ' || COUNT(*) || ' 个函数存在'
    END as result,
    string_agg(routine_name, ', ') as remaining_functions
FROM information_schema.routines 
WHERE routine_name IN (
    'handle_new_user', 
    'promote_user_role',
    'get_table_policies',
    'get_user_statistics',
    'security_audit'
);

-- 检查触发器清理结果
SELECT 
    '🔍 触发器清理检查' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 相关触发器已清理'
        ELSE '⚠️ 仍有 ' || COUNT(*) || ' 个触发器存在'
    END as result
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

/*
🛠️ 快速修复脚本执行完成！

✅ 已清理内容：
- 所有可能冲突的 profiles 表 RLS 策略
- oracles 和 categories 表策略（如果存在）
- 相关函数和触发器

🚀 下一步：
现在可以安全地执行主升级脚本：
scripts/complete-database-upgrade.sql

💡 建议：
1. 先运行此修复脚本
2. 确认所有策略已清理
3. 再运行完整升级脚本
*/