-- =====================================================
-- 教學生態系感知藍圖 - 測試帳號創建 SQL 腳本 (修復版)
-- =====================================================
-- 此腳本將一次性創建四種原型角色的完整測試帳號
-- 跳過郵箱驗證，確保能夠順利登入
-- 使用安全的條件插入方式，避免約束衝突

-- ⚠️ 使用說明：
-- 1. 在 Supabase Dashboard 中點擊 "SQL Editor"
-- 2. 將以下整個腳本貼上並執行
-- 3. 腳本會自動檢查並創建必要的表結構

-- =====================================================
-- 第一步：確保必要的擴展和類型存在
-- =====================================================

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建原型角色枚舉（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_role') THEN
        CREATE TYPE archetype_role AS ENUM ('voyager', 'luminary', 'catalyst', 'guardian');
    END IF;
END$$;

-- =====================================================
-- 第二步：檢查並創建 profiles 表（如果不存在或缺少欄位）
-- =====================================================

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

-- 添加缺少的欄位（如果不存在）
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

-- =====================================================
-- 第三步：創建測試帳號（安全條件插入方式）
-- =====================================================

-- 首先清理可能存在的舊測試帳號
DELETE FROM profiles WHERE username IN ('guardian_test', 'luminary_test', 'catalyst_test', 'voyager_test');
DELETE FROM auth.users WHERE email IN (
  'guardian.test@voyager.com', 
  'luminary.test@voyager.com', 
  'catalyst.test@voyager.com', 
  'voyager.test@voyager.com'
);

-- 創建守護者認證用戶
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
  created_at, updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
  'authenticated', 'authenticated', 'guardian.test@voyager.com',
  crypt('TestPassword123!', gen_salt('bf')), NOW(),
  '{"provider":"email"}', '{"username":"guardian_test"}',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'guardian.test@voyager.com');

-- 創建守護者檔案
INSERT INTO profiles (id, username, bio, role, display_name, created_at, updated_at)
SELECT 
  u.id, 'guardian_test',
  '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。',
  'guardian'::archetype_role, '守護者·測試', NOW(), NOW()
FROM auth.users u 
WHERE u.email = 'guardian.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- 創建啟明者認證用戶
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
  created_at, updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
  'authenticated', 'authenticated', 'luminary.test@voyager.com',
  crypt('TestPassword123!', gen_salt('bf')), NOW(),
  '{"provider":"email"}', '{"username":"luminary_test"}',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'luminary.test@voyager.com');

-- 創建啟明者檔案
INSERT INTO profiles (id, username, bio, role, luminary_expertise, display_name, created_at, updated_at)
SELECT 
  u.id, 'luminary_test',
  '我是啟明者測試帳號，專注於創造和分享知識的光芒。',
  'luminary'::archetype_role, ARRAY['前端開發', 'UI/UX設計', 'TypeScript'], 
  '啟明者·測試', NOW(), NOW()
FROM auth.users u 
WHERE u.email = 'luminary.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- 創建領航者認證用戶
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
  created_at, updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
  'authenticated', 'authenticated', 'catalyst.test@voyager.com',
  crypt('TestPassword123!', gen_salt('bf')), NOW(),
  '{"provider":"email"}', '{"username":"catalyst_test"}',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'catalyst.test@voyager.com');

-- 創建領航者檔案
INSERT INTO profiles (id, username, bio, role, catalyst_communities, display_name, created_at, updated_at)
SELECT 
  u.id, 'catalyst_test',
  '我是領航者測試帳號，致力於連接不同學習者並促進協作。',
  'catalyst'::archetype_role, ARRAY['前端開發社群', '設計師聯盟', '新手導航'], 
  '領航者·測試', NOW(), NOW()
FROM auth.users u 
WHERE u.email = 'catalyst.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- 創建遠行者認證用戶
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
  created_at, updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
  'authenticated', 'authenticated', 'voyager.test@voyager.com',
  crypt('TestPassword123!', gen_salt('bf')), NOW(),
  '{"provider":"email"}', '{"username":"voyager_test"}',
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'voyager.test@voyager.com');

-- 創建遠行者檔案
INSERT INTO profiles (id, username, bio, role, voyager_manifesto, display_name, created_at, updated_at)
SELECT 
  u.id, 'voyager_test',
  '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。',
  'voyager'::archetype_role, 
  '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。',
  '遠行者·測試', NOW(), NOW()
FROM auth.users u 
WHERE u.email = 'voyager.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- =====================================================
-- 第四步：驗證創建結果
-- =====================================================

-- 驗證創建結果
SELECT 
  u.email, p.username, p.display_name, p.role,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ 已確認' ELSE '❌ 未確認' END as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com'
ORDER BY CASE p.role WHEN 'guardian' THEN 1 WHEN 'luminary' THEN 2 WHEN 'catalyst' THEN 3 ELSE 4 END;

/*
🎆 測試帳號創建完成！

🔑 登入資訊（已跳過郵箱驗證）：
• 🛡️ 守護者: guardian.test@voyager.com / TestPassword123!
• ✨ 啟明者: luminary.test@voyager.com / TestPassword123!
• 🚀 領航者: catalyst.test@voyager.com / TestPassword123!
• 🌌 遠行者: voyager.test@voyager.com / TestPassword123!

🧹 清理命令（測試完成後）：
DELETE FROM profiles WHERE username LIKE '%_test';
DELETE FROM auth.users WHERE email LIKE '%.test@voyager.com';

✅ 特點：
• 完全避免 ON CONFLICT 約束問題
• 使用 WHERE NOT EXISTS 確保安全插入
• 自動檢查並創建表結構
• 支持多次執行而不出錯
• 包含完整的 display_name 欄位
*/