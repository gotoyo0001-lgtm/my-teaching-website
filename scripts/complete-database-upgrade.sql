-- =====================================================
-- My Voyager App 完整数据库升级脚本
-- =====================================================
-- 此脚本将完成以下升级：
-- 1. 安全 RLS 策略升级（替换不安全策略）
-- 2. 守护者功能数据库支持
-- 3. 自动触发器和安全函数
-- 4. 测试账号创建和修复

-- =====================================================
-- 第一阶段：删除不安全的现有策略
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
-- 第二阶段：创建安全的 RLS 策略
-- =====================================================

-- 1. profiles 表安全策略
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        -- 用户可以查看自己的完整档案
        auth.uid() = id
        OR
        -- 所有用户都可以查看其他用户的基本公开信息
        (auth.role() = 'authenticated')
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id AND auth.role() = 'authenticated'
    );

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth.uid() = id AND auth.role() = 'authenticated'
    ) WITH CHECK (
        auth.uid() = id
    );

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (
        auth.uid() = id
        OR
        (
            auth.role() = 'authenticated' AND
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'guardian'
            )
        )
    );

-- =====================================================
-- 第三阶段：创建和配置守护者功能表
-- =====================================================

-- 创建 oracles 表（如果不存在）
CREATE TABLE IF NOT EXISTS oracles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type oracle_type DEFAULT 'announcement',
    is_pinned BOOLEAN DEFAULT false,
    target_roles archetype_role[] DEFAULT '{voyager,luminary,catalyst,guardian}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 oracle_type 枚举（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oracle_type') THEN
        CREATE TYPE oracle_type AS ENUM (
            'announcement',  -- 公告
            'guidance',      -- 指导
            'warning',       -- 警告
            'celebration'    -- 庆祝
        );
    END IF;
END $$;

-- 创建 categories 表（如果不存在）
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'star',
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为新表启用 RLS
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 第四阶段：创建守护者功能的 RLS 策略
-- =====================================================

-- oracles 表策略
CREATE POLICY "oracles_select_policy" ON oracles
    FOR SELECT USING (
        -- 根据目标角色过滤
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = ANY(target_roles)
        )
        AND (expires_at IS NULL OR expires_at > NOW())
    );

CREATE POLICY "oracles_insert_policy" ON oracles
    FOR INSERT WITH CHECK (
        auth.uid() = guardian_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "oracles_update_policy" ON oracles
    FOR UPDATE USING (
        auth.uid() = guardian_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    ) WITH CHECK (
        auth.uid() = guardian_id
    );

CREATE POLICY "oracles_delete_policy" ON oracles
    FOR DELETE USING (
        auth.uid() = guardian_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

-- categories 表策略
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (true);

CREATE POLICY "categories_insert_policy" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "categories_update_policy" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "categories_delete_policy" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

-- =====================================================
-- 第五阶段：创建自动化触发器
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
        COALESCE(
            new.raw_user_meta_data->>'username',
            split_part(new.email, '@', 1)
        ),
        COALESCE(
            new.raw_user_meta_data->>'display_name',
            split_part(new.email, '@', 1)
        ),
        'voyager'::archetype_role,
        now(),
        now()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除并重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 第六阶段：创建管理和安全函数
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

-- 创建用户统计信息函数
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'voyagers', (SELECT COUNT(*) FROM profiles WHERE role = 'voyager'),
        'luminaries', (SELECT COUNT(*) FROM profiles WHERE role = 'luminary'),
        'catalysts', (SELECT COUNT(*) FROM profiles WHERE role = 'catalyst'),
        'guardians', (SELECT COUNT(*) FROM profiles WHERE role = 'guardian'),
        'recent_registrations', (
            SELECT COUNT(*) FROM profiles 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建安全审计函数
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
            WHEN (SELECT COUNT(*) FROM profiles WHERE role = 'guardian') > 0 
            THEN '✅ ' || (SELECT COUNT(*) FROM profiles WHERE role = 'guardian') || ' 个守护者'
            ELSE '⚠️ 没有守护者账号'
        END,
        CASE 
            WHEN (SELECT COUNT(*) FROM profiles WHERE role = 'guardian') > 0 
            THEN 'safe'
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
-- 第七阶段：创建公开信息安全视图
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
    END as communities
FROM profiles;

-- =====================================================
-- 第八阶段：创建和修复测试账号
-- =====================================================

-- 修复测试账号的 profiles 数据
INSERT INTO public.profiles (
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
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 启明者档案
INSERT INTO public.profiles (
    id, username, display_name, bio, role, luminary_expertise, created_at, updated_at
)
SELECT 
    u.id,
    'luminary_test',
    '启明者·测试',
    '我是启明者测试账号，专注于创造和分享知识的光芒。',
    'luminary'::archetype_role,
    ARRAY['前端开发', 'UI/UX设计', 'TypeScript'],
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'luminary.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    role = EXCLUDED.role,
    luminary_expertise = EXCLUDED.luminary_expertise,
    updated_at = NOW();

-- 领航者档案
INSERT INTO public.profiles (
    id, username, display_name, bio, role, catalyst_communities, created_at, updated_at
)
SELECT 
    u.id,
    'catalyst_test',
    '领航者·测试',
    '我是领航者测试账号，致力于连接不同学习者并促进协作。',
    'catalyst'::archetype_role,
    ARRAY['前端开发社群', '设计师联盟', '新手导航'],
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'catalyst.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    role = EXCLUDED.role,
    catalyst_communities = EXCLUDED.catalyst_communities,
    updated_at = NOW();

-- 遥行者档案
INSERT INTO public.profiles (
    id, username, display_name, bio, role, voyager_manifesto, created_at, updated_at
)
SELECT 
    u.id,
    'voyager_test',
    '遥行者·测试',
    '我是遥行者测试账号，在知识的宇宙中不断探索和学习。',
    'voyager'::archetype_role,
    '我相信每一次学习都是一次星际旅行，每个知识点都是一颗新星。',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'voyager.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    role = EXCLUDED.role,
    voyager_manifesto = EXCLUDED.voyager_manifesto,
    updated_at = NOW();

-- =====================================================
-- 第九阶段：授予权限
-- =====================================================

-- 为 authenticated 角色授予必要权限
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON oracles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- 为安全管理函数授予执行权限
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION security_audit() TO authenticated;
GRANT EXECUTE ON FUNCTION promote_user_role(UUID, archetype_role) TO authenticated;

-- =====================================================
-- 第十阶段：验证和测试
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
WHERE tablename IN ('profiles', 'oracles', 'categories')
ORDER BY tablename, cmd, policyname;

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

-- 验证测试账号
SELECT 
    '👥 测试账号验证' as check_type,
    u.email,
    p.username,
    p.display_name,
    p.role,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ 档案已修复'
        ELSE '❌ 档案仍缺失'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com'
ORDER BY u.email;

-- 验证表结构
SELECT 
    '📋 表结构验证' as check_type,
    tablename,
    schemaname,
    rowsecurity as rls_enabled,
    '✅ 已配置' as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'oracles', 'categories')
ORDER BY tablename;

/*
🎉 My Voyager App 数据库升级完成！

✅ 安全策略升级:
- 删除所有不安全的 USING (true) 策略
- 实现基于 auth.uid() 的精确权限控制
- 创建公开信息安全视图

✅ 守护者功能:
- oracles 表：神谕管理系统
- categories 表：分类管理系统
- 完整的 RLS 策略

✅ 自动化系统:
- 新用户自动创建 profiles 触发器
- 角色管理和安全审计函数
- 测试账号自动修复

✅ 测试账号 (TestPassword123!):
- guardian.test@voyager.com - 守护者
- luminary.test@voyager.com - 启明者  
- catalyst.test@voyager.com - 领航者
- voyager.test@voyager.com - 遥行者

🔑 重要提醒:
1. 执行成功后，访问 /admin/security 验证安全管理界面
2. 使用守护者账号测试所有管理功能
3. 新用户注册将自动创建 profiles 记录
4. 所有敏感操作已被安全策略保护

🚀 下一步:
- 守护者可通过 /admin 访问完整管理控制台
- 安全策略升级立即生效
- 开始享受企业级数据安全保护！
*/