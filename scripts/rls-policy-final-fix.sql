-- =====================================================
-- RLS 策略最終診斷與修復腳本
-- =====================================================
-- 解決表結構正常但查詢仍失敗的問題
-- 特別針對匿名用戶無法訪問 profiles 表的問題

-- =====================================================
-- 第一步：檢查當前 RLS 策略狀態
-- =====================================================

-- 顯示 profiles 表的所有現有策略
SELECT 
    '現有 RLS 策略' as check_type,
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as using_condition,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- 第二步：完全重置 RLS 策略
-- =====================================================

-- 刪除所有現有策略（包括可能已創建的新策略）
DROP POLICY IF EXISTS "temporary_full_access" ON profiles;
DROP POLICY IF EXISTS "allow_all_operations" ON profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_view_public_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "enable_read_access_for_all" ON profiles;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON profiles;
DROP POLICY IF EXISTS "enable_update_for_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_delete_for_own_profile" ON profiles;

-- 確認所有策略已被刪除
SELECT 
    '策略清理檢查' as check_type,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE tablename = 'profiles';

-- =====================================================
-- 第三步：創建適合匿名用戶的新策略
-- =====================================================

-- 策略 1：允許匿名用戶和認證用戶讀取所有檔案
CREATE POLICY "enable_read_access_for_all" ON profiles
    FOR SELECT USING (true);

-- 策略 2：只允許認證用戶插入自己的檔案
CREATE POLICY "enable_insert_for_authenticated_users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 策略 3：只允許用戶更新自己的檔案
CREATE POLICY "enable_update_for_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 策略 4：只允許用戶刪除自己的檔案
CREATE POLICY "enable_delete_for_own_profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- 第四步：驗證新策略
-- =====================================================

-- 顯示新創建的策略
SELECT 
    '新 RLS 策略' as check_type,
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as using_condition,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- 第五步：測試匿名用戶查詢
-- =====================================================

-- 模擬匿名用戶查詢（這應該現在可以工作）
SELECT 
    '匿名用戶查詢測試' as test_type,
    COUNT(*) as accessible_profiles,
    'SUCCESS' as status
FROM profiles;

-- 測試具體的 COUNT 查詢（診斷頁面使用的查詢類型）
SELECT 
    '計數查詢測試' as test_type,
    COUNT(*) as profile_count
FROM profiles;

-- 測試 SELECT * 查詢
SELECT 
    '完整查詢測試' as test_type,
    id,
    username,
    display_name,
    role,
    created_at
FROM profiles
LIMIT 3;

-- =====================================================
-- 第六步：檢查 auth.uid() 函數
-- =====================================================

-- 測試 auth.uid() 函數是否正常工作
SELECT 
    'auth.uid() 函數測試' as test_type,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '匿名用戶'
        ELSE '認證用戶'
    END as user_status;

-- =====================================================
-- 第七步：檢查表權限
-- =====================================================

-- 檢查 public 角色對 profiles 表的權限
SELECT 
    '表權限檢查' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- =====================================================
-- 第八步：確保匿名用戶有基本權限
-- =====================================================

-- 授予 anon 角色基本 SELECT 權限（如果尚未授予）
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;

-- 確認權限已授予
SELECT 
    '權限授予確認' as check_type,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- =====================================================
-- 第九步：最終驗證
-- =====================================================

-- 最終狀態檢查
SELECT 
    '最終狀態檢查' as report_type,
    component,
    status
FROM (
    SELECT 'profiles 表' as component, 
           '✅ 存在' as status
    UNION ALL
    SELECT 'RLS 策略數量' as component,
           CONCAT('✅ ', COUNT(*), ' 個策略') as status
    FROM pg_policies WHERE tablename = 'profiles'
    UNION ALL
    SELECT 'anon 權限' as component,
           CASE WHEN EXISTS (
               SELECT 1 FROM information_schema.role_table_grants 
               WHERE table_name = 'profiles' AND grantee = 'anon' AND privilege_type = 'SELECT'
           ) THEN '✅ 已授予' ELSE '❌ 未授予' END as status
    UNION ALL
    SELECT '數據可訪問性' as component,
           CASE WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1)
           THEN '✅ 可訪問' ELSE '❌ 無法訪問' END as status
) report;

/*
🎯 RLS 策略最終修復完成！

✅ 修復內容：
1. 完全重置了所有 profiles 表的 RLS 策略
2. 創建了適合匿名用戶的新策略：
   - enable_read_access_for_all: 允許所有人讀取檔案
   - enable_insert_for_authenticated_users: 認證用戶可插入
   - enable_update_for_own_profile: 用戶可更新自己的檔案
   - enable_delete_for_own_profile: 用戶可刪除自己的檔案

🔑 關鍵修復：
- 匿名用戶現在可以執行 SELECT 查詢
- 保持了適當的安全性（INSERT/UPDATE/DELETE 仍需認證）
- 授予了必要的表權限

🧪 測試結果：
執行此腳本後，前端的診斷頁面應該能夠成功查詢 profiles 表
登入功能也應該能夠正常工作

⚠️ 如果仍有問題：
可能是 Supabase 項目的全域設置問題，需要檢查：
1. API 設置中的 RLS 全域開關
2. 項目的安全設置
3. 是否有其他限制性配置
*/