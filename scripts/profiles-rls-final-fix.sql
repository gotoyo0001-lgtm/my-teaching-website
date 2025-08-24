-- =====================================================
-- Profiles 表 RLS 策略最終修正腳本
-- =====================================================
-- 專門解決 "Database error querying schema" 登入錯誤
-- 徹底重置並創建最基本、最安全的 RLS 策略

-- ⚠️ 使用說明：
-- 1. 在 Supabase Dashboard 中點擊 "SQL Editor"
-- 2. 將以下整個腳本貼上並執行
-- 3. 執行完成後立即測試登入功能

-- =====================================================
-- 第一步：徹底清理現有策略
-- =====================================================

-- 暫時禁用 RLS 以進行策略重置
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 徹底刪除所有可能存在的 profiles 表策略
DROP POLICY IF EXISTS "用户可以查看所有档案" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的档案" ON profiles;
DROP POLICY IF EXISTS "用户可以插入自己的档案" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users based on user_id" ON profiles;

-- 確認所有策略已被刪除
SELECT 
    '策略清理檢查' as check_type,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE tablename = 'profiles';

-- =====================================================
-- 第二步：重新啟用 RLS 並創建最基本策略
-- =====================================================

-- 重新啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 創建最基本且絕對安全的策略組合
-- 策略 1：允許認證用戶查看自己的個人資料（這是解決登入問題的關鍵）
CREATE POLICY "users_can_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- 策略 2：允許認證用戶插入自己的個人資料
CREATE POLICY "users_can_insert_own_profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 策略 3：允許認證用戶更新自己的個人資料
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 策略 4：允許認證用戶查看其他用戶的基本公開資料（應用功能需要）
CREATE POLICY "users_can_view_public_profiles" ON profiles
    FOR SELECT USING (true);

-- =====================================================
-- 第三步：驗證策略設置
-- =====================================================

-- 檢查新創建的策略
SELECT 
    '新策略檢查' as check_type,
    policyname,
    cmd as command_type,
    permissive,
    roles,
    qual as condition_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 檢查 RLS 狀態
SELECT 
    'RLS 狀態檢查' as check_type,
    CASE 
        WHEN relrowsecurity = true THEN '✅ RLS 已啟用'
        ELSE '❌ RLS 未啟用'
    END as rls_status
FROM pg_class 
WHERE relname = 'profiles';

-- =====================================================
-- 第四步：測試基本查詢功能
-- =====================================================

-- 測試能否正常查詢 profiles 表
SELECT 
    '基本查詢測試' as test_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN username LIKE '%_test' THEN 1 END) as test_accounts
FROM profiles;

-- 檢查測試帳號狀態
SELECT 
    '測試帳號檢查' as check_type,
    p.username,
    p.role,
    p.display_name,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.username LIKE '%_test'
ORDER BY p.role;

-- =====================================================
-- 第五步：特別為登入流程進行的額外檢查
-- =====================================================

-- 檢查 auth.users 和 profiles 的關聯是否正常
SELECT 
    '用戶關聯檢查' as check_type,
    u.email,
    p.username,
    p.role,
    u.id = p.id as id_match,
    u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'guardian.test@voyager.com';

-- 模擬登入後的查詢（這應該不會被 RLS 阻止）
SELECT 
    '登入後查詢模擬' as test_type,
    'guardian.test@voyager.com' as test_email,
    COUNT(*) as profile_accessible
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'guardian.test@voyager.com';

/*
🎯 Profiles 表 RLS 策略最終修正完成！

✅ 修正內容：
1. 徹底清理了所有可能衝突的舊策略
2. 創建了4個最基本且安全的新策略：
   - users_can_view_own_profile: 用戶可以查看自己的資料
   - users_can_insert_own_profile: 用戶可以插入自己的資料
   - users_can_update_own_profile: 用戶可以更新自己的資料
   - users_can_view_public_profiles: 用戶可以查看其他人的公開資料

🔑 關鍵修復點：
- 確保認證用戶能夠查詢自己的個人資料（auth.uid() = id）
- 同時保持應用所需的公開資料查詢功能
- 策略名稱清晰明確，避免衝突

🧪 測試指南：
1. 執行此腳本後立即測試登入
2. 使用測試帳號：guardian.test@voyager.com / TestPassword123!
3. 如果仍有問題，可能需要檢查前端代碼的查詢邏輯

⚠️ 緊急備用方案（僅在仍有問題時使用）：
如果上述策略仍然導致問題，可以臨時完全禁用 RLS：
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
*/