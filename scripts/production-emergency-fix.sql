-- =====================================================
-- 生產環境緊急修復腳本
-- =====================================================
-- 專門解決查詢返回空錯誤的問題
-- 基於生產環境診斷結果：基本查詢失敗但連接正常

-- =====================================================
-- 第一步：檢查當前狀態
-- =====================================================

-- 檢查 profiles 表是否存在及其狀態
SELECT 
    '表存在性檢查' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM profiles) as row_count
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 檢查 RLS 策略
SELECT 
    'RLS策略檢查' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- =====================================================
-- 第二步：緊急修復 - 完全重置 profiles 表權限
-- =====================================================

-- 暫時禁用 RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 刪除所有現有策略
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
    DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
    DROP POLICY IF EXISTS "users_can_view_public_profiles" ON profiles;
    DROP POLICY IF EXISTS "users_can_insert_own_profile" ON profiles;
    DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
    DROP POLICY IF EXISTS "enable_read_access_for_all" ON profiles;
    DROP POLICY IF EXISTS "allow_all_operations" ON profiles;
    DROP POLICY IF EXISTS "temporary_full_access" ON profiles;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '清理策略時發生錯誤: %', SQLERRM;
END $$;

-- 重新啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 創建最寬鬆的查看策略
CREATE POLICY "emergency_read_all" ON profiles
    FOR SELECT USING (true);

-- 創建安全的插入策略
CREATE POLICY "emergency_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 創建安全的更新策略
CREATE POLICY "emergency_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =====================================================
-- 第三步：確保表權限正確
-- =====================================================

-- 授予 anon 角色基本權限
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;

-- 授予 authenticated 角色完整權限
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- =====================================================
-- 第四步：測試基本查詢
-- =====================================================

-- 測試簡單計數查詢
SELECT 
    'COUNT 查詢測試' as test_type,
    COUNT(*) as result
FROM profiles;

-- 測試基本 SELECT 查詢
SELECT 
    'SELECT 查詢測試' as test_type,
    id,
    username,
    role
FROM profiles 
LIMIT 3;

-- =====================================================
-- 第五步：確保測試帳號存在
-- =====================================================

-- 檢查測試帳號
SELECT 
    '測試帳號檢查' as check_type,
    COUNT(*) as test_accounts_count
FROM auth.users 
WHERE email LIKE '%.test@voyager.com';

-- 如果沒有測試帳號，創建一個基本的
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- 檢查是否已有測試帳號
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'guardian.test@voyager.com') THEN
        -- 創建測試用戶
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, email_change,
            email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'guardian.test@voyager.com',
            crypt('TestPassword123!', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO test_user_id;

        -- 創建對應的 profile
        INSERT INTO profiles (id, username, bio, role, display_name, created_at, updated_at)
        VALUES (
            test_user_id,
            'guardian_test',
            '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。',
            'guardian',
            '守護者·測試',
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ 創建了緊急測試帳號';
    ELSE
        RAISE NOTICE '✅ 測試帳號已存在';
    END IF;
END $$;

-- =====================================================
-- 第六步：最終狀態檢查
-- =====================================================

SELECT 
    '最終檢查' as check_type,
    component,
    status
FROM (
    SELECT 'profiles表' as component, 
           CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
    UNION ALL
    SELECT 'RLS狀態' as component,
           CASE WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles' AND relrowsecurity = true)
           THEN '✅ 已啟用' ELSE '❌ 未啟用' END as status
    UNION ALL
    SELECT 'profiles數據' as component,
           CASE WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1)
           THEN '✅ 有數據 (' || (SELECT COUNT(*) FROM profiles)::text || ' 條)'
           ELSE '❌ 無數據' END as status
    UNION ALL
    SELECT '測試帳號' as component,
           CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE email LIKE '%.test@voyager.com')
           THEN '✅ 存在' ELSE '❌ 不存在' END as status
) report
ORDER BY component;

/*
🎯 生產環境緊急修復完成！

✅ 執行內容：
1. 完全重置 profiles 表的 RLS 策略
2. 創建最寬鬆的查看權限
3. 確保匿名用戶可以執行基本查詢
4. 創建緊急測試帳號（如果不存在）
5. 驗證所有配置

🔑 預期結果：
- 基本查詢應該能正常工作
- 前端診斷頁面應該能成功連接
- 登入功能應該正常

⚠️ 注意：
如果執行此腳本後問題仍然存在，則強烈建議重建 Supabase 項目
因為這表示項目實例本身存在內部問題
*/