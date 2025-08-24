-- =====================================================
-- 紧急修复脚本 - 恢复网站访问
-- =====================================================
-- 当网站无法访问时使用此脚本临时恢复功能
-- 适用于登录页面一直加载的问题

-- =====================================================
-- 诊断当前状态
-- =====================================================

-- 检查 profiles 表是否存在
SELECT 
    '📋 表检查' as check_type,
    tablename,
    schemaname,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 检查当前 RLS 策略
SELECT 
    '🔐 策略检查' as check_type,
    tablename,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 检查是否有数据
SELECT 
    '📊 数据检查' as check_type,
    COUNT(*) as profile_count,
    'profiles 表记录数' as description
FROM profiles;

-- =====================================================
-- 紧急修复：临时放宽 profiles 表策略
-- =====================================================

-- 删除所有现有策略
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 创建临时宽松策略（仅用于紧急恢复）
CREATE POLICY "emergency_profiles_select" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "emergency_profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "emergency_profiles_update" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 确保基本权限
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- =====================================================
-- 检查并修复基础数据
-- =====================================================

-- 检查是否有守护者账号
SELECT 
    '👑 守护者检查' as check_type,
    COUNT(*) as guardian_count,
    string_agg(username, ', ') as guardian_users
FROM profiles 
WHERE role = 'guardian';

-- 如果没有守护者，创建一个
DO $$
BEGIN
    -- 检查是否有 guardian.test@voyager.com 的认证记录
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'guardian.test@voyager.com'
    ) THEN
        -- 确保有对应的 profile 记录
        INSERT INTO profiles (
            id, username, display_name, bio, role, created_at, updated_at
        )
        SELECT 
            u.id,
            'guardian_test',
            '守护者·测试',
            '我是守护者测试账号，负责维护教学生态系的平衡与秩序。',
            'guardian'::archetype_role,
            NOW(),
            NOW()
        FROM auth.users u
        WHERE u.email = 'guardian.test@voyager.com'
          AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id)
        ON CONFLICT (id) DO UPDATE SET
            role = 'guardian',
            updated_at = NOW();
            
        RAISE NOTICE '✅ 守护者账号已确认/创建';
    ELSE
        RAISE NOTICE '⚠️ 未找到 guardian.test@voyager.com 认证账号';
    END IF;
END $$;

-- =====================================================
-- 验证修复结果
-- =====================================================

-- 验证策略状态
SELECT 
    '✅ 修复验证' as check_type,
    'RLS 策略' as component,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'profiles';

-- 验证数据访问
SELECT 
    '✅ 数据访问测试' as check_type,
    COUNT(*) as accessible_profiles,
    'profiles 查询测试' as description
FROM profiles;

-- 验证守护者账号
SELECT 
    '✅ 守护者验证' as check_type,
    username,
    display_name,
    role,
    created_at
FROM profiles 
WHERE role = 'guardian'
LIMIT 3;

/*
🚑 紧急修复完成！

✅ 已执行修复：
- 临时放宽了 profiles 表的 RLS 策略
- 确保了基本的数据库访问权限
- 验证/创建了守护者测试账号

⚠️ 重要说明：
- 这是临时修复，用于恢复网站访问
- 修复后请重新测试登录功能
- 稍后可以重新应用更严格的安全策略

🔄 下一步：
1. 清除浏览器缓存
2. 重新访问 https://my-voyager.netlify.app/login/
3. 尝试使用测试账号登录
4. 确认功能正常后，可重新应用安全策略
*/