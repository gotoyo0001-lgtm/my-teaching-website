-- =====================================================
-- 🚑 快速紧急修复 - 恢复网站登录功能
-- =====================================================
-- 直接复制此脚本到 Supabase SQL Editor 执行

-- 第一步：删除可能冲突的策略
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 第二步：创建临时宽松策略
CREATE POLICY "emergency_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "emergency_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "emergency_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 第三步：确保基本权限
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- 第四步：验证修复
SELECT '✅ 紧急修复完成' as status, COUNT(*) as profiles_count FROM profiles;

-- 检查策略状态
SELECT 
    '策略检查' as type,
    policyname, 
    cmd 
FROM pg_policies 
WHERE tablename = 'profiles';