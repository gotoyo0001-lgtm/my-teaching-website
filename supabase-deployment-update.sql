-- =====================================================
-- Supabase 数据库更新脚本 - 守护者权限修复
-- =====================================================
-- 执行日期: ${new Date().toISOString().split('T')[0]}
-- 版本: v1.1.0
-- 描述: 修复守护者权限验证问题，确保观星台功能正常运行

-- =====================================================
-- 第一步：验证环境和依赖
-- =====================================================

-- 检查 profiles 表是否存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE EXCEPTION '错误: profiles 表不存在，请先运行基础数据库设置';
    END IF;
    
    -- 检查 role 字段是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'voyager';
        RAISE NOTICE '✅ 添加了 role 字段';
    END IF;
    
    -- 检查 last_seen_at 字段是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_seen_at' AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_seen_at timestamp with time zone;
        RAISE NOTICE '✅ 添加了 last_seen_at 字段';
    END IF;
    
    RAISE NOTICE '✅ 基础表结构验证完成';
END $$;

-- =====================================================
-- 第二步：创建观星台相关表
-- =====================================================

-- 创建活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'login', 'course_create', 'discussion_create', 'user_register' 等
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- 存储额外的活动数据
    ip_address INET,
    user_agent TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建系统指标表
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL UNIQUE,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT DEFAULT 'counter' CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);

RAISE NOTICE '✅ 观星台表结构创建完成';

-- =====================================================
-- 第三步：清理并重新创建 RLS 策略
-- =====================================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "guardians_can_view_all_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "users_can_view_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "system_can_insert_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "guardians_can_view_system_metrics" ON system_metrics;
DROP POLICY IF EXISTS "guardians_can_update_system_metrics" ON system_metrics;

-- 重新创建 activity_logs 策略
CREATE POLICY "guardians_can_view_all_activity_logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "users_can_view_own_activity_logs" ON activity_logs
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "system_can_insert_activity_logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- 重新创建 system_metrics 策略
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

RAISE NOTICE '✅ RLS 策略创建完成';

-- =====================================================
-- 第四步：创建或更新核心函数
-- =====================================================

-- 删除可能存在的旧函数
DROP FUNCTION IF EXISTS log_activity(UUID, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS update_system_metric(TEXT, NUMERIC);
DROP FUNCTION IF EXISTS get_system_health();
DROP FUNCTION IF EXISTS get_recent_activities(INTEGER);

-- 创建记录活动日志的函数
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

-- 创建更新系统指标的函数
CREATE OR REPLACE FUNCTION update_system_metric(
    p_metric_name TEXT,
    p_metric_value NUMERIC
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO system_metrics (metric_name, metric_value, updated_at)
    VALUES (p_metric_name, p_metric_value, NOW())
    ON CONFLICT (metric_name) 
    DO UPDATE SET 
        metric_value = p_metric_value,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取系统健康状态的函数
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
    
    -- 更新系统指标
    PERFORM update_system_metric('active_users_24h', active_users_count);
    PERFORM update_system_metric('total_users', total_users_count);
    PERFORM update_system_metric('system_health_score', health_score);
    
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

-- 创建获取最近活动的函数
CREATE OR REPLACE FUNCTION get_recent_activities(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    action_type TEXT,
    description TEXT,
    severity TEXT,
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.action_type,
        al.description,
        al.severity,
        COALESCE(p.display_name, p.username, '匿名用户') as user_name,
        al.created_at
    FROM activity_logs al
    LEFT JOIN profiles p ON al.user_id = p.id
    ORDER BY al.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

RAISE NOTICE '✅ 核心函数创建完成';

-- =====================================================
-- 第五步：创建触发器
-- =====================================================

-- 删除可能存在的旧触发器
DROP TRIGGER IF EXISTS trigger_log_user_activity ON profiles;
DROP FUNCTION IF EXISTS log_user_activity();

-- 创建记录用户活动的触发器函数
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- 根据不同的操作记录不同的活动
    IF TG_OP = 'INSERT' THEN
        -- 新用户注册
        PERFORM log_activity(
            NEW.id,
            'user_register',
            '新用户注册: ' || COALESCE(NEW.display_name, NEW.username, '匿名用户'),
            json_build_object('user_id', NEW.id, 'username', NEW.username)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 用户档案更新
        IF OLD.last_seen_at IS DISTINCT FROM NEW.last_seen_at THEN
            PERFORM log_activity(
                NEW.id,
                'user_activity',
                '用户活动: ' || COALESCE(NEW.display_name, NEW.username, '匿名用户'),
                json_build_object('user_id', NEW.id, 'action', 'visit')
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER trigger_log_user_activity
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

RAISE NOTICE '✅ 触发器创建完成';

-- =====================================================
-- 第六步：插入基础数据
-- =====================================================

-- 插入基础系统指标
INSERT INTO system_metrics (metric_name, metric_value, description) VALUES
    ('total_users', 0, '总用户数量'),
    ('active_users_24h', 0, '24小时内活跃用户数'),
    ('total_courses', 0, '总课程数量'),
    ('total_discussions', 0, '总讨论数量'),
    ('system_health_score', 100, '系统健康评分 (0-100)')
ON CONFLICT (metric_name) DO NOTHING;

-- 插入一些测试活动日志
INSERT INTO activity_logs (action_type, description, severity, created_at) VALUES
    ('system_start', '观星台系统更新完成', 'info', NOW()),
    ('guardian_fix', '守护者权限修复完成', 'info', NOW() - INTERVAL '5 minutes'),
    ('database_update', '数据库结构更新完成', 'info', NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 第七步：确保守护者测试账号权限
-- =====================================================

-- 确保守护者测试账号具有正确的权限
DO $$
DECLARE
    guardian_user_id UUID;
BEGIN
    -- 查找守护者测试账号
    SELECT u.id INTO guardian_user_id
    FROM auth.users u
    WHERE u.email = 'guardian.test@voyager.com';
    
    IF guardian_user_id IS NOT NULL THEN
        -- 确保 profiles 表中有对应记录且角色正确
        INSERT INTO profiles (
            id, username, display_name, bio, role, created_at, updated_at
        ) VALUES (
            guardian_user_id,
            'guardian_test',
            '守护者·测试',
            '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的观星台监控权限。',
            'guardian',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'guardian',
            bio = '我是守护者测试账号，负责维护教学生态系的平衡与秩序。拥有完整的观星台监控权限。',
            updated_at = NOW();
            
        RAISE NOTICE '✅ 守护者测试账号权限已确认';
    ELSE
        RAISE NOTICE '⚠️ 未找到守护者测试账号，请手动创建';
    END IF;
END $$;

-- =====================================================
-- 第八步：授予权限
-- =====================================================

-- 为 authenticated 角色授予必要权限
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT ON system_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION log_activity(UUID, TEXT, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activities(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_system_metric(TEXT, NUMERIC) TO authenticated;

-- =====================================================
-- 第九步：验证安装
-- =====================================================

-- 验证表创建
SELECT 
    '🔭 表验证' as check_type,
    table_name,
    '✅ 已创建' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('activity_logs', 'system_metrics', 'profiles')
ORDER BY table_name;

-- 验证 RLS 策略
SELECT 
    '🔐 策略验证' as check_type,
    tablename,
    policyname,
    '✅ 已创建' as status
FROM pg_policies 
WHERE tablename IN ('activity_logs', 'system_metrics')
ORDER BY tablename, policyname;

-- 验证函数
SELECT 
    '⚙️ 函数验证' as check_type,
    routine_name,
    '✅ 已创建' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN (
        'log_activity',
        'update_system_metric', 
        'get_system_health',
        'get_recent_activities'
    )
ORDER BY routine_name;

-- 测试系统健康检查
SELECT 
    '🏥 系统健康检查' as check_type,
    get_system_health() as health_data;

-- 验证守护者权限
SELECT 
    '👑 守护者验证' as check_type,
    username,
    role,
    '✅ 权限正确' as status
FROM profiles 
WHERE role = 'guardian'
ORDER BY username;

/*
🎉 Supabase 数据库更新完成！

✅ 已完成的更新:
1. 观星台相关表结构 (activity_logs, system_metrics)
2. 完整的 RLS 安全策略
3. 观星台功能函数 (系统健康检查、活动记录等)
4. 自动化活动记录触发器
5. 守护者权限验证和修复
6. 基础数据初始化

✅ 修复的问题:
1. 守护者权限验证逻辑
2. 管理控制台访问权限
3. 观星台功能完整性
4. 活动日志记录系统

🚀 下一步:
1. 守护者登录后可正常访问 /admin 管理控制台
2. 所有管理功能 (用户管理、神谕管理、观星台) 都应正常工作
3. 知识星图和我的星座功能应响应正常

📊 观星台功能现已完全激活并修复！
*/