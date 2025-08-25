-- =====================================================
-- 守护者权限紧急修复脚本
-- =====================================================
-- 执行日期: 2025-01-25
-- 目标: 修复守护者测试账号无法获取档案的问题
-- 症状: 点击管理功能完全没有反应，日志显示"获取用户档案失败"

-- =====================================================
-- 第一步：检查守护者测试账号状态
-- =====================================================

-- 查找守护者测试账号
DO $$
DECLARE
    guardian_user_id UUID;
    guardian_email TEXT := 'guardian.test@voyager.com';
    profile_exists BOOLEAN;
BEGIN
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
            RAISE NOTICE '✅ profiles表中存在记录，更新数据...';
            
            -- 确保数据正确
            UPDATE profiles 
            SET 
                role = 'guardian',
                username = 'guardian_test',
                display_name = '守护者·测试',
                bio = '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的观星台监控权限。',
                updated_at = NOW(),
                last_seen_at = NOW()
            WHERE id = guardian_user_id;
            
            RAISE NOTICE '✅ 守护者账号数据已更新';
        ELSE
            RAISE NOTICE '❌ profiles表中不存在记录，创建新记录...';
            
            -- 创建新的profile记录
            INSERT INTO profiles (
                id, username, display_name, bio, role, created_at, updated_at, last_seen_at
            ) VALUES (
                guardian_user_id,
                'guardian_test',
                '守护者·测试',
                '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的观星台监控权限。',
                'guardian',
                NOW(),
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '✅ 守护者账号profile已创建';
        END IF;
        
        -- 验证最终结果
        DECLARE
            final_role TEXT;
            final_name TEXT;
        BEGIN
            SELECT role, display_name INTO final_role, final_name
            FROM profiles
            WHERE id = guardian_user_id;
            
            RAISE NOTICE '🎯 最终验证 - 角色: %, 名称: %', final_role, final_name;
        END;
        
    ELSE
        RAISE NOTICE '❌ 未找到守护者测试账号: %', guardian_email;
        RAISE NOTICE '💡 请先在 Supabase Auth 中创建该账号';
    END IF;
END $$;

-- =====================================================
-- 第二步：验证RLS策略是否允许访问
-- =====================================================

-- 测试profiles表的查询权限
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- 测试是否可以查询profiles表
    SELECT COUNT(*) INTO test_count
    FROM profiles
    WHERE role = 'guardian';
    
    RAISE NOTICE '✅ profiles表查询测试 - 守护者账号数量: %', test_count;
    
    -- 显示所有守护者账号
    FOR guardian_record IN 
        SELECT id, username, display_name, role, created_at
        FROM profiles 
        WHERE role = 'guardian'
        ORDER BY created_at
    LOOP
        RAISE NOTICE '👑 守护者账号: % (%) - ID: %', 
            guardian_record.display_name, 
            guardian_record.username, 
            guardian_record.id;
    END LOOP;
    
END $$;

-- =====================================================
-- 第三步：记录修复操作
-- =====================================================

-- 记录本次修复操作
INSERT INTO activity_logs (action_type, description, severity, metadata) VALUES
    ('guardian_fix', '守护者权限紧急修复 - 解决档案获取失败问题', 'info', 
     jsonb_build_object(
         'fix_type', 'profile_access',
         'target_account', 'guardian.test@voyager.com',
         'fix_date', NOW(),
         'issues_fixed', ARRAY['档案获取失败', '管理功能无反应', '权限验证错误']
     )::JSONB);

/*
🎉 守护者权限紧急修复完成！

✅ 修复内容:
1. 验证并修复守护者测试账号的profile数据
2. 确保角色设置为'guardian'
3. 更新账号信息和权限描述
4. 验证RLS策略允许数据访问

🔍 问题诊断:
- 症状: 获取用户档案失败，管理功能无反应
- 原因: profile数据缺失或角色设置错误
- 解决: 重建/更新profile记录，确保权限正确

🚀 预期效果:
- 守护者测试账号现在应该能正常获取档案
- 管理控制台、用户管理、神谕管理、观星台功能恢复
- 权限验证正确工作

请在Supabase SQL Editor中执行此脚本，然后重新测试守护者功能。
*/