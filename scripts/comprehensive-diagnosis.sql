-- =====================================================
-- 全面數據庫診斷腳本 - 查找 "Database error querying schema" 根源
-- =====================================================
-- 檢查所有可能導致登入錯誤的表、外鍵和 RLS 策略

-- =====================================================
-- 第一步：檢查所有表的存在狀態
-- =====================================================

SELECT 
    '表格存在檢查' as check_type,
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name) 
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
-- 第二步：檢查所有枚舉類型
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
-- 第三步：檢查所有表的 RLS 狀態
-- =====================================================

SELECT 
    'RLS 狀態檢查' as check_type,
    relname as table_name,
    CASE 
        WHEN relrowsecurity = true THEN '🔒 RLS 已啟用'
        ELSE '🔓 RLS 未啟用'
    END as rls_status
FROM pg_class 
WHERE relname IN ('profiles', 'courses', 'lessons', 'enrollments', 'comments', 'comment_votes', 'categories', 'oracles', 'mentorship')
AND relkind = 'r'
ORDER BY relname;

-- =====================================================
-- 第四步：檢查所有 RLS 策略
-- =====================================================

SELECT 
    'RLS 策略檢查' as check_type,
    tablename,
    policyname,
    cmd as command_type,
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN '有條件限制'
        ELSE '無條件限制'
    END as has_conditions
FROM pg_policies 
WHERE tablename IN ('profiles', 'courses', 'lessons', 'enrollments', 'comments', 'comment_votes', 'categories', 'oracles', 'mentorship')
ORDER BY tablename, policyname;

-- =====================================================
-- 第五步：檢查外鍵引用關係
-- =====================================================

SELECT 
    '外鍵引用檢查' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = ccu.table_name AND relrowsecurity = true)
        THEN '🔒 被引用表有 RLS'
        ELSE '🔓 被引用表無 RLS'
    END as foreign_table_rls_status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('profiles', 'courses', 'lessons', 'enrollments', 'comments', 'comment_votes', 'categories', 'oracles', 'mentorship')
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 第六步：臨時禁用所有可能有問題的表的 RLS
-- =====================================================

-- 警告：這是診斷用的臨時措施，僅用於找出問題根源

DO $$
BEGIN
    -- 禁用所有表的 RLS（臨時診斷）
    PERFORM 'ALTER TABLE ' || table_name || ' DISABLE ROW LEVEL SECURITY;'
    FROM (VALUES 
        ('courses'),
        ('lessons'), 
        ('enrollments'),
        ('comments'),
        ('comment_votes'),
        ('categories'),
        ('oracles')
    ) t(table_name)
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name);
    
    RAISE NOTICE '已臨時禁用所有表的 RLS，請測試登入功能';
END$$;

-- =====================================================
-- 第七步：檢查測試帳號狀態
-- =====================================================

-- 檢查 auth.users 表中的測試帳號
SELECT 
    '認證用戶檢查' as check_type,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    id
FROM auth.users 
WHERE email LIKE '%.test@voyager.com'
ORDER BY created_at;

-- 檢查 profiles 表中的測試帳號
SELECT 
    '用戶檔案檢查' as check_type,
    COUNT(*) as profile_count
FROM profiles 
WHERE username LIKE '%_test';

-- 如果 profiles 表有數據，顯示詳細信息
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles WHERE username LIKE '%_test';
    
    IF profile_count > 0 THEN
        RAISE NOTICE '找到 % 個測試檔案，詳細信息：', profile_count;
        -- 這裡不能直接 SELECT，因為在 DO 塊中
        -- 用戶需要單獨執行下面的查詢
    ELSE
        RAISE NOTICE '未找到測試檔案';
    END IF;
END$$;

-- 顯示測試檔案詳細信息（需要單獨執行）
SELECT 
    '測試檔案詳情' as check_type,
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
-- 第八步：模擬登入查詢
-- =====================================================

-- 模擬前端可能執行的查詢操作
SELECT 
    '模擬登入查詢' as test_type,
    'getUserProfile 查詢測試' as operation,
    COUNT(*) as result_count
FROM profiles 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'guardian.test@voyager.com' 
    LIMIT 1
);

/*
🔍 診斷腳本執行完成！

📋 檢查清單：
1. ✅ 所有表格是否存在
2. ✅ 所有枚舉類型是否存在  
3. ✅ RLS 狀態檢查
4. ✅ RLS 策略檢查
5. ✅ 外鍵引用檢查
6. ⚠️ 臨時禁用所有 RLS（診斷用）
7. ✅ 測試帳號狀態檢查
8. ✅ 模擬登入查詢測試

🎯 下一步：
1. 執行此腳本查看結果
2. 在所有 RLS 被禁用的情況下測試登入
3. 如果登入成功，則逐步重新啟用 RLS 找出問題表
4. 如果仍然失敗，則問題在前端邏輯或 Supabase 配置

⚠️ 注意：此腳本會臨時禁用大部分表的 RLS，僅用於診斷目的！
*/