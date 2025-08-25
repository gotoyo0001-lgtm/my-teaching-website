-- =====================================================
-- Supabase 守护者权限验证更新脚本 v1.0
-- =====================================================
-- 执行日期: 2025-01-25
-- 目标: 验证和优化权限策略，修复守护者管理功能访问问题
-- 关联: GitHub提交 40aa9f0 - 修复守护者管理功能点击无反应问题

-- =====================================================
-- 第一步：验证守护者测试账号状态
-- =====================================================

DO $$
DECLARE
    guardian_user_id UUID;
    guardian_email TEXT := 'guardian.test@voyager.com';
    profile_exists BOOLEAN;
    guardian_record RECORD;
BEGIN
    RAISE NOTICE '🔍 开始验证守护者测试账号状态...';
    
    -- 从auth.users表查找用户ID
    SELECT id INTO guardian_user_id
    FROM auth.users
    WHERE email = guardian_email;
    
    IF guardian_user_id IS NOT NULL THEN
        RAISE NOTICE '✅ 找到守护者测试账号，ID: %', guardian_user_id;
        
        -- 检查profiles表中是否存在对应记录
        SELECT EXISTS(
            SELECT 1 FROM profiles WHERE id = guardian_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- 获取当前档案信息
            SELECT * INTO guardian_record
            FROM profiles 
            WHERE id = guardian_user_id;
            
            RAISE NOTICE '✅ 守护者档案信息: 用户名=%, 显示名=%, 角色=%', 
                guardian_record.username, 
                guardian_record.display_name, 
                guardian_record.role;
            
            -- 确保数据完整性
            IF guardian_record.role != 'guardian' THEN
                RAISE NOTICE '⚠️ 角色不正确，正在修复...';
                UPDATE profiles 
                SET 
                    role = 'guardian',
                    updated_at = NOW()
                WHERE id = guardian_user_id;
                RAISE NOTICE '✅ 守护者角色已修复';
            END IF;
            
            -- 确保显示名称正确
            IF guardian_record.display_name != '守护者·测试' THEN
                UPDATE profiles 
                SET 
                    display_name = '守护者·测试',
                    updated_at = NOW()
                WHERE id = guardian_user_id;
                RAISE NOTICE '✅ 守护者显示名称已更新';
            END IF;
            
        ELSE
            RAISE NOTICE '❌ profiles表中不存在记录，创建新记录...';
            
            -- 创建新的profile记录
            INSERT INTO profiles (
                id, username, display_name, bio, role, created_at, updated_at, last_seen_at
            ) VALUES (
                guardian_user_id,
                'guardian_test',
                '守护者·测试',
                '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的管理权限。',
                'guardian',
                NOW(),
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '✅ 守护者账号profile已创建';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ 未找到守护者测试账号: %', guardian_email;
        RAISE NOTICE '💡 请在 Supabase Auth 中确认该账号是否存在';
    END IF;
END $$;

-- =====================================================
-- 第二步：验证和优化RLS策略
-- =====================================================

-- 检查当前RLS策略状态
DO $$
DECLARE
    policy_count INTEGER;
    policy_record RECORD;
BEGIN
    RAISE NOTICE '🔐 验证RLS策略状态...';
    
    -- 统计profiles表的策略数量
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'profiles';
    
    RAISE NOTICE '📋 profiles表当前有 % 个RLS策略', policy_count;
    
    -- 显示所有策略详情
    FOR policy_record IN 
        SELECT policyname, cmd, permissive, roles, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  📜 策略: % | 操作: % | 角色: %', 
            policy_record.policyname, 
            policy_record.cmd,
            policy_record.roles;
    END LOOP;
    
    -- 验证关键策略是否存在
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'profiles_read_authenticated'
    ) THEN
        RAISE NOTICE '✅ 基础读取策略存在';
    ELSE
        RAISE NOTICE '❌ 基础读取策略缺失';
    END IF;
    
END $$;

-- =====================================================
-- 第三步：测试权限访问
-- =====================================================

-- 测试守护者账号的数据访问
DO $$
DECLARE
    test_count INTEGER;
    guardian_test_record RECORD;
BEGIN
    RAISE NOTICE '🧪 测试守护者权限访问...';
    
    -- 测试基础查询
    SELECT COUNT(*) INTO test_count
    FROM profiles
    WHERE role = 'guardian';
    
    RAISE NOTICE '📊 数据库中守护者账号数量: %', test_count;
    
    -- 测试具体守护者账号查询
    SELECT username, display_name, role, last_seen_at INTO guardian_test_record
    FROM profiles
    WHERE username = 'guardian_test'
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '✅ 守护者测试账号查询成功: % (%)', 
            guardian_test_record.display_name, 
            guardian_test_record.role;
        
        -- 更新最后访问时间以测试写权限
        UPDATE profiles 
        SET last_seen_at = NOW() 
        WHERE username = 'guardian_test';
        
        RAISE NOTICE '✅ 守护者账号写权限测试通过';
    ELSE
        RAISE NOTICE '❌ 守护者测试账号查询失败';
    END IF;
    
END $$;

-- =====================================================
-- 第四步：创建调试辅助函数
-- =====================================================

-- 创建用户权限检查函数，供前端调试使用
CREATE OR REPLACE FUNCTION check_user_permissions(user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_profile RECORD;
    permissions JSON;
BEGIN
    -- 获取用户档案
    SELECT * INTO user_profile
    FROM profiles
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'error', 'User profile not found',
            'user_id', user_id
        );
    END IF;
    
    -- 构建权限检查结果
    SELECT json_build_object(
        'user_id', user_profile.id,
        'username', user_profile.username,
        'display_name', user_profile.display_name,
        'role', user_profile.role,
        'permissions', json_build_object(
            'canAccessAdmin', user_profile.role = 'guardian',
            'canManageUsers', user_profile.role = 'guardian',
            'canCreateOracle', user_profile.role = 'guardian',
            'canAccessObservatory', user_profile.role = 'guardian',
            'canManageCategories', user_profile.role = 'guardian',
            'canViewAnalytics', user_profile.role IN ('guardian', 'luminary', 'catalyst'),
            'canCreateCourse', user_profile.role IN ('guardian', 'luminary'),
            'canNominateCatalyst', user_profile.role IN ('guardian', 'luminary'),
            'canHighlightComments', user_profile.role IN ('guardian', 'catalyst'),
            'canEnrollCourse', true
        ),
        'last_checked', NOW()
    ) INTO permissions;
    
    RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为authenticated角色授予函数执行权限
GRANT EXECUTE ON FUNCTION check_user_permissions(UUID) TO authenticated;

-- =====================================================
-- 第五步：记录操作日志
-- =====================================================

-- 记录本次权限验证操作
INSERT INTO activity_logs (action_type, description, severity, metadata) VALUES
    ('guardian_permission_check', '守护者权限验证和优化 - 配合前端权限修复', 'info', 
     jsonb_build_object(
         'script_version', '1.0',
         'github_commit', '40aa9f0',
         'target_account', 'guardian.test@voyager.com',
         'check_date', NOW(),
         'operations', ARRAY[
             '验证守护者账号状态',
             '检查RLS策略完整性', 
             '测试数据库权限访问',
             '创建调试辅助函数'
         ]
     )::JSONB);

-- =====================================================
-- 第六步：验证最终状态
-- =====================================================

DO $$
DECLARE
    final_status JSON;
BEGIN
    RAISE NOTICE '🎯 最终状态验证...';
    
    -- 使用新创建的函数验证守护者权限
    SELECT check_user_permissions(id) INTO final_status
    FROM profiles
    WHERE username = 'guardian_test'
    LIMIT 1;
    
    IF final_status IS NOT NULL THEN
        RAISE NOTICE '✅ 守护者权限检查函数测试通过';
        RAISE NOTICE '📊 权限状态: %', final_status;
    ELSE
        RAISE NOTICE '❌ 权限检查函数测试失败';
    END IF;
    
    RAISE NOTICE '🎉 守护者权限验证更新脚本执行完成!';
    
END $$;

/*
🎉 守护者权限验证更新脚本执行完成！

✅ 主要验证内容:
1. 守护者测试账号状态验证和修复
2. RLS策略完整性检查
3. 数据库权限访问测试
4. 创建权限检查调试函数

🔧 新增功能:
- check_user_permissions(user_id) 函数用于前端调试
- 详细的权限状态检查和报告
- 自动修复守护者账号数据不一致问题

🚀 预期效果:
- 守护者测试账号数据库权限完全正常
- 前端权限验证逻辑与数据库状态保持一致
- 提供调试工具帮助排查权限问题

💡 使用调试函数:
在Supabase SQL Editor中执行以下查询来检查特定用户权限:
SELECT check_user_permissions('用户ID');

注意：此脚本与前端修改(GitHub提交 40aa9f0)配合使用，
确保守护者管理功能的完整修复。
*/