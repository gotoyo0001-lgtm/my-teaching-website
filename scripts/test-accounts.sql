-- =====================================================
-- 教學生態系感知藍圖 - 測試帳號創建 SQL 腳本
-- =====================================================
-- 此腳本將一次性創建四種原型角色的完整測試帳號
-- 跳過郵箱驗證，確保能夠順利登入

-- ⚠️ 使用說明：
-- 1. 在 Supabase Dashboard 中點擊 "SQL Editor"
-- 2. 將以下整個腳本貼上並執行
-- 3. 或使用 scripts/test-accounts-complete.sql 獲取完整版本

-- 守護者測試帳號
WITH guardian_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
    'authenticated', 'authenticated', 'guardian.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')), NOW(),
    '{"provider":"email"}', '{"username":"guardian_test"}',
    NOW(), NOW()
  ) ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
  RETURNING id
)
INSERT INTO profiles (id, username, display_name, bio, role, created_at, updated_at)
SELECT id, 'guardian_test', '守護者·測試',
  '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。',
  'guardian', NOW(), NOW()
FROM guardian_user
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role, updated_at = NOW();

-- 啟明者測試帳號
WITH luminary_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
    'authenticated', 'authenticated', 'luminary.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')), NOW(),
    '{"provider":"email"}', '{"username":"luminary_test"}',
    NOW(), NOW()
  ) ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
  RETURNING id
)
INSERT INTO profiles (id, username, display_name, bio, role, luminary_expertise, created_at, updated_at)
SELECT id, 'luminary_test', '啟明者·測試',
  '我是啟明者測試帳號，專注於創造和分享知識的光芒。',
  'luminary', ARRAY['前端開發', 'UI/UX設計', 'TypeScript'], NOW(), NOW()
FROM luminary_user
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role, luminary_expertise = EXCLUDED.luminary_expertise, updated_at = NOW();

-- 領航者測試帳號
WITH catalyst_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
    'authenticated', 'authenticated', 'catalyst.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')), NOW(),
    '{"provider":"email"}', '{"username":"catalyst_test"}',
    NOW(), NOW()
  ) ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
  RETURNING id
)
INSERT INTO profiles (id, username, display_name, bio, role, catalyst_communities, created_at, updated_at)
SELECT id, 'catalyst_test', '領航者·測試',
  '我是領航者測試帳號，致力於連接不同學習者並促進協作。',
  'catalyst', ARRAY['前端開發社群', '設計師聯盟', '新手導航'], NOW(), NOW()
FROM catalyst_user
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role, catalyst_communities = EXCLUDED.catalyst_communities, updated_at = NOW();

-- 遠行者測試帳號
WITH voyager_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 
    'authenticated', 'authenticated', 'voyager.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')), NOW(),
    '{"provider":"email"}', '{"username":"voyager_test"}',
    NOW(), NOW()
  ) ON CONFLICT (email) DO UPDATE SET email_confirmed_at = NOW()
  RETURNING id
)
INSERT INTO profiles (id, username, display_name, bio, role, voyager_manifesto, created_at, updated_at)
SELECT id, 'voyager_test', '遠行者·測試',
  '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。',
  'voyager', '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。',
  NOW(), NOW()
FROM voyager_user
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role, voyager_manifesto = EXCLUDED.voyager_manifesto, updated_at = NOW();

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
*/