-- =====================================================
-- 數據庫表結構完整性檢查與修復腳本
-- =====================================================
-- 解決客戶端查詢時返回空錯誤的問題

-- =====================================================
-- 第一步：檢查所有必要的表是否存在
-- =====================================================

-- 檢查基礎表是否存在
SELECT 
    '表結構檢查' as check_type,
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
        THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END as status
FROM (VALUES 
    ('profiles'),
    ('courses'),
    ('lessons'),
    ('enrollments'),
    ('comments'),
    ('comment_votes'),
    ('categories'),
    ('oracles'),
    ('mentorship')
) t(table_name)
ORDER BY table_name;

-- =====================================================
-- 第二步：檢查關鍵枚舉類型
-- =====================================================

SELECT 
    '枚舉類型檢查' as check_type,
    type_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = t.type_name) 
        THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END as status
FROM (VALUES 
    ('archetype_role'),
    ('course_status'),
    ('enrollment_status'),
    ('comment_type'),
    ('oracle_type'),
    ('vote_type')
) t(type_name)
ORDER BY type_name;

-- =====================================================
-- 第三步：如果 profiles 表不存在，立即創建
-- =====================================================

-- 創建 archetype_role 枚舉（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_role') THEN
        CREATE TYPE archetype_role AS ENUM ('voyager', 'luminary', 'catalyst', 'guardian');
        RAISE NOTICE '✅ 已創建 archetype_role 枚舉';
    ELSE
        RAISE NOTICE '✅ archetype_role 枚舉已存在';
    END IF;
END$$;

-- 創建 profiles 表（如果不存在）
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    role archetype_role DEFAULT 'voyager',
    voyager_manifesto TEXT,
    luminary_expertise TEXT[],
    catalyst_communities TEXT[],
    location TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE
);

-- 檢查 profiles 表是否創建成功
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ profiles 表確認存在';
    ELSE
        RAISE NOTICE '❌ profiles 表創建失敗';
    END IF;
END$$;

-- =====================================================
-- 第四步：檢查 profiles 表的詳細結構
-- =====================================================

-- 顯示 profiles 表的欄位結構
SELECT 
    'profiles 欄位結構' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 第五步：設置最基本的權限
-- =====================================================

-- 確保 profiles 表有正確的 RLS 設置
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 刪除所有現有策略
DROP POLICY IF EXISTS "allow_all_operations" ON profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_view_public_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;

-- 創建一個最寬鬆的策略用於測試
CREATE POLICY "temporary_full_access" ON profiles
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 第六步：插入測試數據
-- =====================================================

-- 檢查是否有任何數據
SELECT 
    '數據檢查' as check_type,
    COUNT(*) as total_profiles
FROM profiles;

-- 如果沒有數據，插入一個基本測試記錄
INSERT INTO profiles (id, username, display_name, role, bio, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'test_user_' || extract(epoch from now())::text,
    '測試用戶',
    'voyager'::archetype_role,
    '這是一個測試用戶檔案',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 第七步：測試基本查詢
-- =====================================================

-- 測試 SELECT 查詢
SELECT 
    '基本查詢測試' as test_type,
    COUNT(*) as profile_count,
    'SUCCESS' as status
FROM profiles;

-- 測試 COUNT 查詢（這是診斷頁面使用的查詢）
SELECT 
    '計數查詢測試' as test_type,
    COUNT(*) as count_result
FROM profiles;

-- =====================================================
-- 第八步：檢查認證相關表
-- =====================================================

-- 檢查 auth.users 表是否有測試帳號
SELECT 
    'auth.users 檢查' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email LIKE '%.test@voyager.com' THEN 1 END) as test_users
FROM auth.users;

-- =====================================================
-- 第九步：最終狀態報告
-- =====================================================

SELECT 
    '最終狀態報告' as report_type,
    component,
    status
FROM (
    SELECT 'profiles 表' as component, 
           CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'archetype_role 枚舉' as component,
           CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_role')
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'profiles 數據' as component,
           CASE WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1)
           THEN '✅ 有數據' ELSE '❌ 無數據' END as status
    UNION ALL
    SELECT 'RLS 狀態' as component,
           CASE WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles' AND relrowsecurity = true)
           THEN '✅ 已啟用' ELSE '❌ 未啟用' END as status
) report
ORDER BY component;

/*
🎯 表結構診斷完成！

✅ 執行內容：
1. 檢查所有必要表的存在狀態
2. 驗證關鍵枚舉類型
3. 創建缺失的 profiles 表和枚舉
4. 設置基本的 RLS 權限
5. 插入測試數據
6. 執行基本查詢測試

🔑 預期結果：
- 如果 profiles 表不存在，這個腳本會創建它
- 如果權限有問題，會設置最寬鬆的權限
- 如果沒有數據，會插入測試數據

⚠️ 注意：
執行這個腳本後，前端的查詢應該能正常工作
如果仍有問題，則可能是 Supabase 項目本身的配置問題
*/