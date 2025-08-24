-- =====================================================
-- 守護者功能數據庫設置腳本 (簡化版)
-- =====================================================
-- 避免類型轉換問題的簡化版本

-- =====================================================
-- 第一步：檢查並創建必要的表
-- =====================================================

-- 檢查並創建 oracles 表
CREATE TABLE IF NOT EXISTS oracles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'announcement' CHECK (type IN ('announcement', 'guidance', 'warning', 'celebration')),
    is_pinned BOOLEAN DEFAULT FALSE,
    target_roles TEXT[],
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 檢查並創建 categories 表
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 第二步：設置基本權限
-- =====================================================

-- 為所有表設置基本權限
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;

GRANT SELECT ON oracles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON oracles TO authenticated;

GRANT SELECT ON categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;

GRANT SELECT ON courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON courses TO authenticated;

-- =====================================================
-- 第三步：啟用 RLS
-- =====================================================

ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 第四步：清理現有策略（避免重複）
-- =====================================================

-- 清理 oracles 表策略
DROP POLICY IF EXISTS "oracles_select_policy" ON oracles;
DROP POLICY IF EXISTS "oracles_insert_policy" ON oracles;
DROP POLICY IF EXISTS "oracles_update_policy" ON oracles;
DROP POLICY IF EXISTS "oracles_delete_policy" ON oracles;
DROP POLICY IF EXISTS "oracles_manage_policy" ON oracles;

-- 清理 categories 表策略
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;
DROP POLICY IF EXISTS "categories_manage_policy" ON categories;

-- =====================================================
-- 第五步：創建簡化的 RLS 策略
-- =====================================================

-- oracles 表策略
-- 1. 查看策略：簡化版本，所有人可查看
CREATE POLICY "oracles_select_policy" ON oracles
    FOR SELECT USING (true);

-- 2. 其他操作：使用字符串比較避免類型問題
CREATE POLICY "oracles_insert_policy" ON oracles
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role::text = 'guardian'
        )
    );

CREATE POLICY "oracles_update_policy" ON oracles
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role::text = 'guardian'
        )
    );

CREATE POLICY "oracles_delete_policy" ON oracles
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role::text = 'guardian'
        )
    );

-- categories 表策略
-- 1. 查看策略：所有人可查看
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (true);

-- 2. 其他操作：只有守護者可以管理
CREATE POLICY "categories_insert_policy" ON categories
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role::text = 'guardian'
        )
    );

CREATE POLICY "categories_update_policy" ON categories
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role::text = 'guardian'
        )
    );

CREATE POLICY "categories_delete_policy" ON categories
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role::text = 'guardian'
        )
    );

-- =====================================================
-- 第六步：最終驗證
-- =====================================================

-- 檢查表狀態
SELECT 
    '表狀態檢查' as check_type,
    table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
    THEN '✅ 存在' ELSE '❌ 不存在' END as status
FROM (VALUES ('profiles'), ('oracles'), ('categories'), ('courses')) as t(table_name);

-- 檢查 RLS 狀態
SELECT 
    'RLS 狀態檢查' as check_type,
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✅ 已啟用' ELSE '❌ 未啟用' END as rls_status
FROM pg_tables 
WHERE tablename IN ('profiles', 'oracles', 'categories', 'courses')
  AND schemaname = 'public';

-- 檢查策略數量
SELECT 
    'RLS 策略檢查' as check_type,
    tablename,
    COUNT(*) as policy_count,
    '✅ ' || COUNT(*)::text || ' 個策略' as status
FROM pg_policies 
WHERE tablename IN ('profiles', 'oracles', 'categories', 'courses')
GROUP BY tablename
ORDER BY tablename;

-- 測試查詢（可選）
SELECT 
    '守護者用戶檢查' as check_type,
    username,
    role::text as role_text,
    '✅ 守護者帳號' as status
FROM profiles 
WHERE role::text = 'guardian'
LIMIT 3;

/*
🎯 守護者功能數據庫設置完成！(簡化版)

✅ 修復內容：
1. 避免了所有類型轉換問題
2. 使用 IN 子查詢替代 EXISTS 和直接比較
3. 簡化了 oracles 的目標角色檢查
4. 確保所有策略語法正確

🔑 策略說明：
- oracles: 4個策略，簡化版本所有人可查看
- categories: 4個策略，所有人可查看
- 只有守護者可以管理內容
- 使用字符串比較避免類型問題

📋 下一步：
執行成功後，所有守護者功能將正常工作
記得創建至少一個守護者用戶進行測試
*/