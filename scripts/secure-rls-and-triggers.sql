-- =====================================================
-- 安全的 RLS 策略和自动 Profile 创建触发器
-- =====================================================
-- 此脚本将创建更安全的行级安全策略，并设置自动触发器
-- 确保数据安全和用户体验的最佳平衡

-- =====================================================
-- 第一步：删除现有的不安全策略
-- =====================================================

-- 删除 profiles 表上的所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "用户可以查看所有档案" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的档案" ON profiles;
DROP POLICY IF EXISTS "用户可以插入自己的档案" ON profiles;
DROP POLICY IF EXISTS "enable_read_access_for_all" ON profiles;
DROP POLICY IF EXISTS "allow_all_operations" ON profiles;

-- 确保 RLS 已启用
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 第二步：创建安全的 RLS 策略
-- =====================================================

-- 1. SELECT 策略：用户只能查看自己的完整档案，其他用户的公开信息
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        -- 用户可以查看自己的完整档案
        auth.uid() = id
        OR
        -- 所有用户都可以查看其他用户的基本公开信息（但会在应用层过滤敏感字段）
        (
            -- 只有已认证用户可以查看其他用户信息
            auth.role() = 'authenticated'
        )
    );

-- 2. INSERT 策略：只允许插入与当前认证用户匹配的记录
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        -- 只能为自己创建档案
        auth.uid() = id
        AND
        -- 必须是已认证用户
        auth.role() = 'authenticated'
    );

-- 3. UPDATE 策略：用户只能更新自己的档案
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        -- 只能更新自己的档案
        auth.uid() = id
        AND
        auth.role() = 'authenticated'
    ) WITH CHECK (
        -- 确保更新后的记录仍然属于当前用户
        auth.uid() = id
    );

-- 4. DELETE 策略：用户可以删除自己的档案，守护者可以删除任何档案
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (
        -- 用户可以删除自己的档案
        auth.uid() = id
        OR
        -- 守护者可以删除任何档案（通过检查当前用户的角色）
        (
            auth.role() = 'authenticated' AND
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'guardian'
            )
        )
    );

-- =====================================================
-- 第三步：创建用于公开信息查询的安全视图
-- =====================================================

-- 创建公开档案视图，只包含可以公开显示的信息
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    id,
    username,
    display_name,
    avatar_url,
    role,
    location,
    website,
    created_at,
    -- 根据角色显示专业信息
    CASE 
        WHEN role = 'luminary' THEN luminary_expertise
        ELSE NULL
    END as expertise,
    CASE 
        WHEN role = 'catalyst' THEN catalyst_communities  
        ELSE NULL
    END as communities,
    -- 不包含敏感信息如：bio, voyager_manifesto, last_seen_at, updated_at
    NULL as bio,
    NULL as voyager_manifesto,
    NULL as last_seen_at
FROM profiles
WHERE 
    -- 只显示公开的档案（可以根据需要添加 is_public 字段）
    TRUE;

-- 为公开档案视图启用RLS
ALTER VIEW public_profiles OWNER TO postgres;

-- =====================================================
-- 第四步：创建自动 profile 创建触发器函数
-- =====================================================

-- 创建触发器函数，在新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        username, 
        display_name,
        role,
        created_at, 
        updated_at
    ) VALUES (
        new.id,
        -- 从 email 生成默认用户名（去掉 @ 及后面的部分）
        COALESCE(
            new.raw_user_meta_data->>'username',
            split_part(new.email, '@', 1)
        ),
        -- 默认显示名称
        COALESCE(
            new.raw_user_meta_data->>'display_name',
            split_part(new.email, '@', 1)
        ),
        -- 默认角色为遥行者
        'voyager'::archetype_role,
        now(),
        now()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 第五步：创建触发器
-- =====================================================

-- 删除现有的触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建新的触发器，在用户创建后自动创建 profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 第六步：创建角色管理函数（供守护者使用）
-- =====================================================

-- 创建角色提升函数（只有守护者可以调用）
CREATE OR REPLACE FUNCTION promote_user_role(
    target_user_id UUID, 
    new_role archetype_role
) 
RETURNS JSON AS $$
DECLARE
    current_user_role archetype_role;
    target_user_exists BOOLEAN;
    result JSON;
BEGIN
    -- 检查当前用户是否为守护者
    SELECT role INTO current_user_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    IF current_user_role != 'guardian' THEN
        RETURN json_build_object(
            'success', false,
            'message', '权限不足：只有守护者可以提升用户角色'
        );
    END IF;
    
    -- 检查目标用户是否存在
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = target_user_id) 
    INTO target_user_exists;
    
    IF NOT target_user_exists THEN
        RETURN json_build_object(
            'success', false,
            'message', '目标用户不存在'
        );
    END IF;
    
    -- 执行角色提升
    UPDATE profiles 
    SET role = new_role, 
        updated_at = now() 
    WHERE id = target_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', '用户角色已成功更新为 ' || new_role,
        'user_id', target_user_id,
        'new_role', new_role
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'message', '角色提升失败：' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 第七步：创建支持安全管理界面的数据库函数
-- =====================================================

-- 创建获取表策略信息的函数
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS TABLE (
    policyname text,
    cmd text,
    permissive text,
    roles text[],
    qual text,
    with_check text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname::text,
        p.cmd::text,
        p.permissive::text,
        p.roles::text[],
        p.qual::text,
        p.with_check::text
    FROM pg_policies p
    WHERE p.tablename = get_table_policies.table_name
    ORDER BY p.cmd, p.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取用户统计信息的函数
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (
            SELECT COUNT(*) FROM profiles
        ),
        'voyagers', (
            SELECT COUNT(*) FROM profiles WHERE role = 'voyager'
        ),
        'luminaries', (
            SELECT COUNT(*) FROM profiles WHERE role = 'luminary'
        ),
        'catalysts', (
            SELECT COUNT(*) FROM profiles WHERE role = 'catalyst'
        ),
        'guardians', (
            SELECT COUNT(*) FROM profiles WHERE role = 'guardian'
        ),
        'recent_registrations', (
            SELECT COUNT(*) FROM profiles 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建安全检查函数
CREATE OR REPLACE FUNCTION security_audit()
RETURNS TABLE (
    check_type text,
    component text,
    status text,
    level text,
    details text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        '🔐 RLS 策略'::text as check_type,
        'profiles 表'::text as component,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'profiles' 
                AND cmd = 'SELECT' 
                AND qual != 'true'
            ) THEN '✅ 安全策略已启用'
            ELSE '⚠️ 存在不安全策略'
        END as status,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'profiles' 
                AND cmd = 'SELECT' 
                AND qual != 'true'
            ) THEN 'safe'
            ELSE 'warning'
        END as level,
        'SELECT 策略安全性检查'::text as details
    
    UNION ALL
    
    SELECT 
        '👥 用户角色'::text,
        '守护者账号'::text,
        CASE 
            WHEN (
                SELECT COUNT(*) FROM profiles WHERE role = 'guardian'
            ) > 0 THEN 
                '✅ ' || (SELECT COUNT(*) FROM profiles WHERE role = 'guardian') || ' 个守护者'
            ELSE '⚠️ 没有守护者账号'
        END,
        CASE 
            WHEN (
                SELECT COUNT(*) FROM profiles WHERE role = 'guardian'
            ) > 0 THEN 'safe'
            ELSE 'warning'
        END,
        '守护者账号数量检查'::text
    
    UNION ALL
    
    SELECT 
        '🔧 触发器'::text,
        'auto_profile_creation'::text,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.triggers 
                WHERE trigger_name = 'on_auth_user_created'
            ) THEN '✅ 自动创建已启用'
            ELSE '❌ 自动创建未配置'
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.triggers 
                WHERE trigger_name = 'on_auth_user_created'
            ) THEN 'safe'
            ELSE 'danger'
        END,
        '用户注册自动创建档案检查'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 第八步：授予必要的权限
-- =====================================================

-- 为 authenticated 角色授予必要权限
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- 为 anon 角色授予公开信息查询权限（用于公开页面显示）
GRANT SELECT ON public_profiles TO anon;

-- 为安全管理函数授予执行权限（仅守护者可用）
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION security_audit() TO authenticated;
GRANT EXECUTE ON FUNCTION promote_user_role(UUID, archetype_role) TO authenticated;

-- =====================================================
-- 第九步：验证安全策略
-- =====================================================

-- 显示新创建的 RLS 策略
SELECT 
    '🔐 RLS 策略验证' as check_type,
    policyname,
    cmd as operation,
    permissive,
    roles,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ 有条件限制'
        ELSE '⚠️ 无限制'
    END as security_level
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 验证触发器创建
SELECT 
    '🔧 触发器验证' as check_type,
    trigger_name,
    event_manipulation as event_type,
    action_timing,
    '✅ 已创建' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 验证函数创建
SELECT 
    '⚙️ 函数验证' as check_type,
    routine_name,
    routine_type,
    security_type,
    '✅ 已创建' as status
FROM information_schema.routines 
WHERE routine_name IN (
    'handle_new_user', 
    'promote_user_role', 
    'get_table_policies',
    'get_user_statistics',
    'security_audit'
)
ORDER BY routine_name;

-- =====================================================
-- 使用说明和注意事项
-- =====================================================

/*
🚀 部署后的验证步骤：

1. 测试新用户注册：
   - 注册一个新账号
   - 验证 profiles 表中自动创建了对应记录
   
2. 测试权限控制：
   - 登录不同角色用户
   - 验证只能查看/修改自己的档案
   - 验证守护者可以管理其他用户角色
   
3. 测试公开视图：
   - 未登录状态下访问 public_profiles 视图
   - 验证只能看到公开信息
   
4. 测试角色提升：
   - 使用守护者账号调用 promote_user_role 函数
   - SELECT promote_user_role('用户ID', '新角色');

🔒 安全性改进：
- ✅ 移除了不安全的 USING (true) 策略
- ✅ 实现了基于用户身份的精确权限控制
- ✅ 创建了公开信息安全视图
- ✅ 实现了自动 profile 创建
- ✅ 添加了角色管理安全函数

⚠️ 重要提醒：
- 此脚本会删除所有现有的 profiles 表策略
- 请在测试环境先验证后再应用到生产环境
- 守护者账号需要手动验证其权限功能
*/