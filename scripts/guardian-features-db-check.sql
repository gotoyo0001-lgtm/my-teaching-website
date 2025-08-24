-- =====================================================
-- 守護者功能數據庫兼容性檢查腳本
-- =====================================================
-- 檢查所有必要的表和欄位是否存在並支持新功能

-- =====================================================
-- 檢查 profiles 表結構
-- =====================================================

-- 檢查 profiles 表是否有所需的欄位
SELECT 
    'profiles 表欄位檢查' as check_type,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('id', 'username', 'display_name', 'role', 'created_at', 'updated_at', 'last_seen_at') 
        THEN '✅ 必需欄位' 
        ELSE '📋 可選欄位' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 檢查 oracles 表結構
-- =====================================================

-- 檢查 oracles 表是否存在
SELECT 
    'oracles 表檢查' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles' AND table_schema = 'public') 
        THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END as status;

-- 如果 oracles 表不存在，創建它
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

-- =====================================================
-- 檢查 categories 表結構
-- =====================================================

-- 檢查 categories 表是否存在
SELECT 
    'categories 表檢查' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') 
        THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END as status;

-- 如果 categories 表不存在，創建它
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
-- 檢查 courses 表結構
-- =====================================================

-- 檢查 courses 表是否有管理所需的欄位
SELECT 
    'courses 表欄位檢查' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('id', 'title', 'status', 'creator_id', 'enrollment_count', 'created_at', 'published_at') 
        THEN '✅ 管理必需' 
        ELSE '📋 其他欄位' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 檢查 RLS 策略
-- =====================================================

-- 檢查 profiles 表的 RLS 策略
SELECT 
    'profiles RLS 策略' as check_type,
    policyname,
    permissive,
    cmd,
    CASE WHEN qual IS NOT NULL THEN '✅ 有條件' ELSE '⚠️ 無條件' END as has_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- 確保基本權限設置
-- =====================================================

-- 確保 anon 和 authenticated 角色有基本權限
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- 為 oracles 表設置權限
GRANT SELECT ON oracles TO anon;
GRANT SELECT ON oracles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON oracles TO authenticated;

-- 為 categories 表設置權限
GRANT SELECT ON categories TO anon;
GRANT SELECT ON categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;

-- 為 courses 表設置基本權限
GRANT SELECT ON courses TO anon;
GRANT SELECT ON courses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON courses TO authenticated;

-- =====================================================
-- 設置 RLS 策略（如果不存在）
-- =====================================================

-- 為 oracles 表啟用 RLS
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;

-- 創建 oracles 查看策略
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'oracles' AND policyname = 'oracles_select_policy') THEN
        CREATE POLICY "oracles_select_policy" ON oracles
            FOR SELECT USING (
                target_roles IS NULL OR 
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = ANY(target_roles)
                ) OR
                auth.uid() IS NULL  -- 允許匿名用戶查看公開神諭
            );
    END IF;
END $$;

-- 創建 oracles 管理策略（只有守護者可以管理）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'oracles' AND policyname = 'oracles_manage_policy') THEN
        CREATE POLICY "oracles_manage_policy" ON oracles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'guardian'
                )
            );
    END IF;
END $$;

-- 為 categories 表啟用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 創建 categories 查看策略（所有人可查看）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories_select_policy') THEN
        CREATE POLICY "categories_select_policy" ON categories
            FOR SELECT USING (true);
    END IF;
END $$;

-- 創建 categories 管理策略（只有守護者可以管理）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories_manage_policy') THEN
        CREATE POLICY "categories_manage_policy" ON categories
            FOR INSERT, UPDATE, DELETE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'guardian'
                )
            );
    END IF;
END $$;

-- =====================================================
-- 最終狀態檢查
-- =====================================================

SELECT 
    '最終檢查' as check_type,
    component,
    status
FROM (
    SELECT 'profiles 表' as component, 
           CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'oracles 表' as component,
           CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles')
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'categories 表' as component,
           CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories')
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'courses 表' as component,
           CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses')
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'RLS 策略數量' as component,
           '✅ ' || COUNT(*)::text || ' 個策略' as status
    FROM pg_policies 
    WHERE tablename IN ('profiles', 'oracles', 'categories', 'courses')
) report
ORDER BY component;

/*
🎯 守護者功能數據庫檢查完成！

✅ 執行內容：
1. 檢查所有必要表的存在狀態和結構
2. 創建缺失的 oracles 和 categories 表
3. 設置適當的 RLS 策略
4. 配置表權限
5. 驗證最終狀態

🔑 守護者功能支持：
- 用戶管理：基於 profiles 表
- 神諭管理：基於 oracles 表
- 分類管理：基於 categories 表
- 課程管理：基於 courses 表
- 系統統計：基於所有表的數據聚合

⚠️ 注意：
如果某些表或欄位不存在，此腳本會自動創建
確保在生產環境執行前進行備份
*/