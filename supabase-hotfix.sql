-- =====================================================
-- Supabase 快速修复脚本 - 守护者权限
-- =====================================================
-- 执行日期: 2025-01-25
-- 版本: v1.1.1-hotfix
-- 描述: 快速修复守护者权限问题的最小化脚本

-- 第一步：验证基础表结构
DO $$
BEGIN
    -- 检查 profiles 表
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE EXCEPTION '错误: profiles 表不存在';
    END IF;
    
    -- 添加 role 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'voyager';
    END IF;
    
    -- 添加 last_seen_at 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_seen_at' AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_seen_at timestamp with time zone;
    END IF;
END $$;

-- 第二步：创建观星台表
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

-- 第三步：清理并重新创建策略
DROP POLICY IF EXISTS "guardians_can_view_all_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "users_can_view_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "system_can_insert_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "guardians_can_view_system_metrics" ON system_metrics;
DROP POLICY IF EXISTS "guardians_can_update_system_metrics" ON system_metrics;

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

-- 第四步：创建核心函数
DROP FUNCTION IF EXISTS log_activity(UUID, TEXT, TEXT, JSONB, TEXT);
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

DROP FUNCTION IF EXISTS get_system_health();
CREATE OR REPLACE FUNCTION get_system_health() 
RETURNS JSON AS $$
DECLARE
    result JSON;
    active_users_count INTEGER;
    total_users_count INTEGER;
    health_score INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_users_count
    FROM profiles
    WHERE last_seen_at >= NOW() - INTERVAL '24 hours';
    
    SELECT COUNT(*) INTO total_users_count
    FROM profiles;
    
    health_score := CASE 
        WHEN active_users_count >= 20 THEN 100
        WHEN active_users_count >= 10 THEN 80
        WHEN active_users_count >= 5 THEN 60
        WHEN active_users_count >= 1 THEN 40
        ELSE 20
    END;
    
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

-- 第五步：确保守护者权限
DO $$
DECLARE
    guardian_user_id UUID;
BEGIN
    SELECT u.id INTO guardian_user_id
    FROM auth.users u
    WHERE u.email = 'guardian.test@voyager.com';
    
    IF guardian_user_id IS NOT NULL THEN
        INSERT INTO profiles (
            id, username, display_name, bio, role, created_at, updated_at
        ) VALUES (
            guardian_user_id,
            'guardian_test',
            '守护者·测试',
            '我是守护者测试账号，负责维护教学生态系的平衡与秩序。',
            'guardian',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'guardian',
            updated_at = NOW();
    END IF;
END $$;

-- 第六步：授予权限
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT ON system_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION log_activity(UUID, TEXT, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;

-- 第七步：插入基础数据
INSERT INTO system_metrics (metric_name, metric_value, description) VALUES
    ('total_users', 0, '总用户数量'),
    ('active_users_24h', 0, '24小时内活跃用户数'),
    ('system_health_score', 100, '系统健康评分')
ON CONFLICT (metric_name) DO NOTHING;

-- 验证完成
SELECT 
    'Database Update Complete' as status,
    COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('activity_logs', 'system_metrics');
    
SELECT 
    'Policies Created' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('activity_logs', 'system_metrics');

/*
✅ 快速修复完成！

修复内容:
1. 观星台表结构 (activity_logs, system_metrics)
2. RLS 安全策略
3. 守护者权限验证
4. 核心系统函数

现在守护者应该可以正常访问管理控制台了。
*/