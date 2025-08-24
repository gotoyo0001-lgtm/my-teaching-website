-- =====================================================
-- 資料庫診斷和修復 SQL 腳本
-- =====================================================
-- 解決 "Database error querying schema" 問題

-- =====================================================
-- 第一步：檢查基本資料庫結構
-- =====================================================

-- 檢查 profiles 表是否存在
SELECT 
    'profiles 表檢查' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ 表存在' 
        ELSE '❌ 表不存在' 
    END as result;

-- 檢查 profiles 表的欄位結構
SELECT 
    'profiles 欄位檢查' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 檢查 archetype_role 枚舉是否存在
SELECT 
    'archetype_role 枚舉檢查' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_role') 
        THEN '✅ 枚舉存在' 
        ELSE '❌ 枚舉不存在' 
    END as result;

-- =====================================================
-- 第二步：檢查 RLS 策略
-- =====================================================

-- 檢查 profiles 表的 RLS 狀態
SELECT 
    'profiles RLS 檢查' as check_type,
    CASE 
        WHEN relrowsecurity = true THEN '✅ RLS 已啟用'
        ELSE '❌ RLS 未啟用'
    END as result
FROM pg_class 
WHERE relname = 'profiles';

-- 檢查 profiles 表的策略
SELECT 
    'profiles 策略檢查' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- =====================================================
-- 第三步：檢查測試帳號
-- =====================================================

-- 檢查認證用戶
SELECT 
    '認證用戶檢查' as check_type,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email LIKE '%.test@voyager.com'
ORDER BY created_at;

-- 檢查用戶檔案
SELECT 
    '用戶檔案檢查' as check_type,
    COUNT(*) as profile_count
FROM profiles 
WHERE username LIKE '%_test';

-- =====================================================
-- 第四步：修復常見問題
-- =====================================================

-- 確保必要的擴展存在
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建 archetype_role 枚舉（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_role') THEN
        CREATE TYPE archetype_role AS ENUM ('voyager', 'luminary', 'catalyst', 'guardian');
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

-- 添加缺少的欄位
DO $$
BEGIN
    -- 檢查並添加 display_name 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
    END IF;
    
    -- 檢查並添加 role 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role archetype_role DEFAULT 'voyager';
    END IF;
    
    -- 檢查並添加其他重要欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'voyager_manifesto') THEN
        ALTER TABLE profiles ADD COLUMN voyager_manifesto TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'luminary_expertise') THEN
        ALTER TABLE profiles ADD COLUMN luminary_expertise TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'catalyst_communities') THEN
        ALTER TABLE profiles ADD COLUMN catalyst_communities TEXT[];
    END IF;
END$$;

-- 啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 刪除舊的策略（如果存在）
DROP POLICY IF EXISTS "用户可以查看所有档案" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的档案" ON profiles;
DROP POLICY IF EXISTS "用户可以插入自己的档案" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 創建新的 RLS 策略
CREATE POLICY "用户可以查看所有档案" ON profiles 
FOR SELECT USING (true);

CREATE POLICY "用户可以更新自己的档案" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的档案" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 第五步：驗證修復結果
-- =====================================================

-- 最終檢查
SELECT 
    '最終檢查' as check_type,
    'profiles 表' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END as status
UNION ALL
SELECT 
    '最終檢查' as check_type,
    'archetype_role 枚舉' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_role') 
        THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END as status
UNION ALL
SELECT 
    '最終檢查' as check_type,
    'RLS 策略' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') 
        THEN '✅ 已設置' 
        ELSE '❌ 未設置' 
    END as status;

-- 顯示修復後的 profiles 表結構
SELECT 
    '修復後表結構' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;