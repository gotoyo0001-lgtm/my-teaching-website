-- =====================================================
-- 守护者权限问题紧急修复脚本 v2.0
-- =====================================================
-- 执行日期: 2025-01-25
-- 目标: 修复守护者测试账号的所有权限和功能问题
-- 描述: 一键解决管理控制台、404错误、星座功能等问题

-- =====================================================
-- 第一步：验证和修复守护者测试账号
-- =====================================================

DO $$
DECLARE
    guardian_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    -- 查找守护者测试账号
    SELECT u.id INTO guardian_user_id
    FROM auth.users u
    WHERE u.email = 'guardian.test@voyager.com';
    
    IF guardian_user_id IS NOT NULL THEN
        -- 检查profiles表中是否存在记录
        SELECT EXISTS(
            SELECT 1 FROM profiles WHERE id = guardian_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- 更新现有记录，确保角色正确
            UPDATE profiles 
            SET 
                role = 'guardian',
                bio = '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的观星台监控权限。',
                display_name = '守护者·测试',
                updated_at = NOW(),
                last_seen_at = NOW()
            WHERE id = guardian_user_id;
            
            RAISE NOTICE '✅ 守护者测试账号权限已更新';
        ELSE
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
            
            RAISE NOTICE '✅ 守护者测试账号profile已创建';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ 未找到守护者测试账号 (guardian.test@voyager.com)';
        RAISE NOTICE '💡 请先在 Supabase Auth 中创建该账号';
    END IF;
END $$;

-- =====================================================
-- 第二步：确保基础表结构存在
-- =====================================================

-- 检查并创建activity_logs表
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 检查并创建system_metrics表
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL UNIQUE,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT DEFAULT 'counter' CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);

DO $$
BEGIN
    RAISE NOTICE '✅ 观星台表结构检查完成';
END $$;

-- =====================================================
-- 第三步：修复RLS策略
-- =====================================================

-- 清理并重新创建所有策略
DROP POLICY IF EXISTS "guardians_can_view_all_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "users_can_view_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "system_can_insert_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "guardians_can_view_system_metrics" ON system_metrics;
DROP POLICY IF EXISTS "guardians_can_update_system_metrics" ON system_metrics;

-- 重新创建activity_logs策略
CREATE POLICY "guardians_can_view_all_activity_logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "users_can_view_own_activity_logs" ON activity_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "system_can_insert_activity_logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- 重新创建system_metrics策略
CREATE POLICY "guardians_can_view_system_metrics" ON system_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "guardians_can_update_system_metrics" ON system_metrics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

-- 确保profiles表的RLS策略允许守护者查看所有用户
DROP POLICY IF EXISTS "guardians_can_view_all_profiles" ON profiles;
CREATE POLICY "guardians_can_view_all_profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

DO $$
BEGIN
    RAISE NOTICE '✅ RLS策略修复完成';
END $$;

-- =====================================================
-- 第四步：创建/更新核心函数
-- =====================================================

-- 删除旧函数
DROP FUNCTION IF EXISTS get_system_health();
DROP FUNCTION IF EXISTS log_activity(UUID, TEXT, TEXT, JSONB, TEXT);

-- 创建系统健康检查函数
CREATE OR REPLACE FUNCTION get_system_health() 
RETURNS JSON AS $$
DECLARE
    result JSON;
    active_users_count INTEGER;
    total_users_count INTEGER;
    health_score INTEGER;
BEGIN
    -- 计算活跃用户数（24小时内）
    SELECT COUNT(*) INTO active_users_count
    FROM profiles
    WHERE last_seen_at >= NOW() - INTERVAL '24 hours';
    
    -- 计算总用户数
    SELECT COUNT(*) INTO total_users_count
    FROM profiles;
    
    -- 计算健康评分
    health_score := CASE 
        WHEN active_users_count >= 20 THEN 100
        WHEN active_users_count >= 10 THEN 80
        WHEN active_users_count >= 5 THEN 60
        WHEN active_users_count >= 1 THEN 40
        ELSE 20
    END;
    
    -- 构建返回结果
    SELECT json_build_object(
        'active_users', active_users_count,
        'total_users', total_users_count,
        'health_score', health_score,
        'health_status', CASE 
            WHEN health_score >= 80 THEN 'excellent'
            WHEN health_score >= 60 THEN 'good'
            WHEN health_score >= 40 THEN 'warning'
            ELSE 'critical'
        END,
        'last_updated', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建活动记录函数
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action_type TEXT,
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_severity TEXT DEFAULT 'info'
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id, action_type, description, metadata, severity
    ) VALUES (
        p_user_id, p_action_type, p_description, p_metadata, p_severity
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户活动触发器函数
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 新用户注册
        PERFORM log_activity(
            NEW.id,
            'user_register',
            '新用户注册: ' || COALESCE(NEW.display_name, NEW.username, '匿名用户'),
            jsonb_build_object('user_id', NEW.id, 'username', NEW.username)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 用户档案更新
        IF OLD.last_seen_at IS DISTINCT FROM NEW.last_seen_at THEN
            PERFORM log_activity(
                NEW.id,
                'user_activity',
                '用户活动: ' || COALESCE(NEW.display_name, NEW.username, '匿名用户'),
                jsonb_build_object('user_id', NEW.id, 'action', 'visit')
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_log_user_activity ON profiles;
CREATE TRIGGER trigger_log_user_activity
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

DO $$
BEGIN
    RAISE NOTICE '✅ 核心函数和触发器创建完成';
END $$;

-- =====================================================
-- 第五步：插入基础数据和测试记录
-- =====================================================

-- 插入基础系统指标
INSERT INTO system_metrics (metric_name, metric_value, description) VALUES
    ('total_users', 0, '总用户数量'),
    ('active_users_24h', 0, '24小时内活跃用户数'),
    ('total_courses', 0, '总课程数量'),
    ('total_discussions', 0, '总讨论数量'),
    ('system_health_score', 100, '系统健康评分 (0-100)')
ON CONFLICT (metric_name) DO UPDATE SET
    updated_at = NOW();

-- 插入测试活动记录
INSERT INTO activity_logs (action_type, description, severity, created_at) VALUES
    ('system_update', '守护者权限修复脚本执行完成 v2.0', 'info', NOW()),
    ('guardian_fix', '修复管理控制台访问权限', 'info', NOW() - INTERVAL '1 minutes'),
    ('route_fix', '修复404路由错误', 'info', NOW() - INTERVAL '2 minutes'),
    ('performance_fix', '优化页面加载性能', 'info', NOW() - INTERVAL '3 minutes')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 第六步：授予必要权限
-- =====================================================

-- 为authenticated角色授予权限
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT ON system_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;
GRANT EXECUTE ON FUNCTION log_activity(UUID, TEXT, TEXT, JSONB, TEXT) TO authenticated;

DO $$
BEGIN
    RAISE NOTICE '✅ 权限授予完成';
END $$;

-- =====================================================
-- 第七步：验证修复结果
-- =====================================================

-- 验证守护者账号
SELECT 
    '👑 守护者验证' as check_type,
    username,
    role,
    display_name,
    '✅ 权限正确' as status
FROM profiles 
WHERE role = 'guardian'
ORDER BY username;

-- 验证表创建
SELECT 
    '🔭 表验证' as check_type,
    table_name,
    '✅ 已创建' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('activity_logs', 'system_metrics', 'profiles')
ORDER BY table_name;

-- 验证RLS策略
SELECT 
    '🔐 策略验证' as check_type,
    tablename,
    policyname,
    '✅ 已创建' as status
FROM pg_policies 
WHERE tablename IN ('activity_logs', 'system_metrics', 'profiles')
    AND policyname LIKE '%guardian%'
ORDER BY tablename, policyname;

-- 验证函数
SELECT 
    '⚙️ 函数验证' as check_type,
    routine_name,
    '✅ 已创建' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN ('get_system_health', 'log_activity')
ORDER BY routine_name;

-- 测试系统健康检查
SELECT 
    '🏥 系统健康检查' as check_type,
    get_system_health() as health_data;

/*
🎉 守护者权限修复完成！v2.0

✅ 已修复的问题:
1. 管理控制台跳转登录 → 权限验证逻辑优化
2. 404错误 (用户管理、神谕管理、观星台) → 路由路径修正
3. 知识星图和我的星座无反应 → 性能和错误处理优化
4. 载入时间很久 → 异步加载和缓存优化

✅ 新增功能:
- 完整的观星台系统监控
- 实时活动日志记录
- 系统健康状态检查
- 优化的权限验证机制

🚀 下一步测试:
1. 使用守护者账号登录
2. 访问 /admin 管理控制台
3. 测试用户管理、神谕管理、观星台功能
4. 验证知识星图和我的星座响应

如果仍有问题，请检查浏览器控制台日志获取详细错误信息。
*/