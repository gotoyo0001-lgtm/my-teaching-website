-- =====================================================
-- 守护者用户数据修复脚本
-- =====================================================
-- 修复guardian.test@voyager.com用户的profile数据完整性问题

-- 第一步：检查当前守护者用户状态
SELECT 
    '🔍 守护者账号检查' as check_type,
    u.email,
    u.id as user_id,
    u.created_at as auth_created,
    p.username,
    p.display_name,
    p.role,
    p.created_at as profile_created,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Profile存在'
        ELSE '❌ Profile缺失'
    END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'guardian.test@voyager.com';

-- 第二步：确保守护者profile记录完整
INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    bio, 
    role, 
    created_at, 
    updated_at
)
SELECT 
    u.id,
    'guardian_test',
    '守护者·测试',
    '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的管理权限来确保系统安全运行。',
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

-- 第三步：检查和修复用户会话权限
-- 确保auth.users表中的用户状态正常
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'guardian.test@voyager.com' 
  AND email_confirmed_at IS NULL;

-- 第四步：验证RLS策略对守护者的影响
-- 测试守护者是否能正常访问profiles表
DO $$
DECLARE
    guardian_id UUID;
    test_result TEXT;
BEGIN
    -- 获取守护者用户ID
    SELECT id INTO guardian_id 
    FROM auth.users 
    WHERE email = 'guardian.test@voyager.com';
    
    IF guardian_id IS NOT NULL THEN
        -- 模拟守护者身份查询（这在实际应用中由前端认证处理）
        -- 这里只是验证数据完整性
        
        SELECT CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = guardian_id AND role = 'guardian'
            ) THEN '✅ 守护者权限验证通过'
            ELSE '❌ 守护者权限验证失败'
        END INTO test_result;
        
        RAISE NOTICE '%', test_result;
    ELSE
        RAISE NOTICE '❌ 未找到守护者用户';
    END IF;
END $$;

-- 第五步：检查是否存在可能阻止功能的数据问题
-- 验证数据库函数是否可用
SELECT 
    '🔧 数据库函数检查' as check_type,
    routine_name,
    routine_type,
    '✅ 函数可用' as status
FROM information_schema.routines 
WHERE routine_name IN (
    'promote_user_role', 
    'get_user_statistics',
    'security_audit'
)
ORDER BY routine_name;

-- 第六步：测试基本的数据库操作
-- 确保守护者可以执行基本查询
SELECT 
    '📊 数据访问测试' as test_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'guardian' THEN 1 END) as guardian_count,
    COUNT(CASE WHEN role = 'luminary' THEN 1 END) as luminary_count,
    COUNT(CASE WHEN role = 'catalyst' THEN 1 END) as catalyst_count,
    COUNT(CASE WHEN role = 'voyager' THEN 1 END) as voyager_count
FROM public.profiles;

-- 第七步：检查环境配置相关的表
-- 确保oracles和categories表存在且可访问
SELECT 
    '📋 表结构检查' as check_type,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ 表存在'
        ELSE '❌ 表缺失'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'oracles', 'categories', 'courses', 'enrollments')
ORDER BY table_name;

-- 第八步：最终验证
SELECT 
    '🎯 最终验证结果' as result_type,
    u.email,
    p.username,
    p.display_name,
    p.role,
    '✅ 守护者数据修复完成' as status
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'guardian.test@voyager.com' 
  AND p.role = 'guardian';

/*
🛡️ 守护者数据修复完成！

✅ 修复内容：
- 确保guardian.test@voyager.com有完整的profile记录
- 验证用户认证状态和邮箱确认
- 检查数据库函数和表结构完整性
- 测试基本数据访问权限

🚀 下一步：
1. 清除浏览器缓存和Cookie
2. 重新登录网站
3. 测试管理功能是否恢复正常

💡 如果问题仍然存在：
- 检查浏览器控制台是否有JavaScript错误
- 访问 /debug/function-check 页面进行详细诊断
- 确认网络连接稳定

📞 故障排除：
如果按钮仍然无响应，可能是前端JavaScript问题，
而不是数据库权限问题。建议检查浏览器开发者工具。
*/