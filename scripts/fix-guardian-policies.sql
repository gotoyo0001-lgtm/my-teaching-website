-- =====================================================
-- 守护者策略修复脚本
-- =====================================================
-- 此脚本专门用于修复重复策略问题
-- 执行此脚本可以安全地清理并重新创建所有必要的 RLS 策略

-- =====================================================
-- 第一步：清理现有策略
-- =====================================================

-- 删除 activity_logs 表的所有策略
DROP POLICY IF EXISTS "guardians_can_view_all_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "users_can_view_own_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "system_can_insert_activity_logs" ON activity_logs;

-- 删除 system_metrics 表的所有策略
DROP POLICY IF EXISTS "guardians_can_view_system_metrics" ON system_metrics;
DROP POLICY IF EXISTS "guardians_can_update_system_metrics" ON system_metrics;

-- =====================================================
-- 第二步：确保表存在并启用 RLS
-- =====================================================

-- 检查并创建 activity_logs 表（如果不存在）
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

-- 检查并创建 system_metrics 表（如果不存在）
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL UNIQUE,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT DEFAULT 'counter' CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 确保启用 RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 第三步：重新创建策略
-- =====================================================

-- activity_logs 表的策略
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

-- system_metrics 表的策略
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

-- =====================================================
-- 第四步：验证策略创建
-- =====================================================

-- 验证 activity_logs 策略
SELECT 
    '🔐 activity_logs 策略验证' as check_type,
    policyname,
    '✅ 策略已创建' as status
FROM pg_policies 
WHERE tablename = 'activity_logs'
ORDER BY policyname;

-- 验证 system_metrics 策略
SELECT 
    '🔐 system_metrics 策略验证' as check_type,
    policyname,
    '✅ 策略已创建' as status
FROM pg_policies 
WHERE tablename = 'system_metrics'
ORDER BY policyname;

-- 检查策略数量
SELECT 
    '📊 策略统计' as check_type,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('activity_logs', 'system_metrics')
GROUP BY tablename;

/*
🎉 守护者策略修复完成！

✅ 清理内容:
- 删除所有可能重复的策略
- 确保表结构正确
- 重新启用 RLS

✅ 创建策略:
- guardians_can_view_all_activity_logs
- users_can_view_own_activity_logs  
- system_can_insert_activity_logs
- guardians_can_view_system_metrics
- guardians_can_update_system_metrics

🚀 下一步:
现在可以安全地运行完整的 guardian-observatory-update.sql 脚本
*/