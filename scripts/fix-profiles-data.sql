-- =====================================================
-- 修复测试账号的 profiles 数据
-- =====================================================
-- 此脚本修复"会话存在但档案缺失"的问题

-- 检查当前状态
SELECT 
    u.email,
    u.id as user_id,
    p.username,
    p.role,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com'
ORDER BY u.email;

-- 为缺失的档案创建记录
-- 如果存在则更新，不存在则插入

-- 守护者档案
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

-- 验证修复结果
SELECT 
    u.email,
    u.id as user_id,
    p.username,
    p.display_name,
    p.role,
    p.created_at as profile_created,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ 档案已修复'
        ELSE '❌ 档案仍缺失'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com'
ORDER BY u.email;

-- 检查RLS策略是否影响查询
-- 确保profiles表的RLS策略允许用户访问自己的档案
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;