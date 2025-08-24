-- =====================================================
-- 守護者功能數據庫修復腳本 (語法修復版)
-- =====================================================
-- 修復 PostgreSQL RLS 策略語法問題

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
-- 第五步：創建正確的 RLS 策略
-- =====================================================

-- oracles 表策略
-- 1. SELECT 策略：根據目標角色或公開神諭
CREATE POLICY "oracles_select_policy" ON oracles
    FOR SELECT USING (
        target_roles IS NULL OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = ANY(target_roles)
        ) OR
        auth.uid() IS NULL  -- 允許匿名用戶查看公開神諭
    );

-- 2. INSERT 策略：只有守護者可以創建
CREATE POLICY "oracles_insert_policy" ON oracles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    );

-- 3. UPDATE 策略：只有守護者可以更新
CREATE POLICY "oracles_update_policy" ON oracles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    );

-- 4. DELETE 策略：只有守護者可以刪除
CREATE POLICY "oracles_delete_policy" ON oracles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    );

-- categories 表策略
-- 1. SELECT 策略：所有人可查看
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (true);

-- 2. INSERT 策略：只有守護者可以創建
CREATE POLICY "categories_insert_policy" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    );

-- 3. UPDATE 策略：只有守護者可以更新
CREATE POLICY "categories_update_policy" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
        )
    );

-- 4. DELETE 策略：只有守護者可以刪除
CREATE POLICY "categories_delete_policy" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role::text = 'guardian'
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

/*
🎯 守護者功能數據庫修復完成！

✅ 修復內容：
1. 修復了 RLS 策略的語法錯誤
2. 將複合操作策略拆分為單獨的 INSERT, UPDATE, DELETE 策略
3. 添加了策略清理邏輯，避免重複創建
4. 確保所有必要的表和權限正確設置

🔑 策略說明：
- oracles: 4個策略 (select, insert, update, delete)
- categories: 4個策略 (select, insert, update, delete)
- 只有守護者可以管理 oracles 和 categories
- 所有人可以查看公開內容

⚠️ 注意：
如果執行成功，所有守護者功能將正常工作
確保至少有一個守護者角色的用戶存在
*/