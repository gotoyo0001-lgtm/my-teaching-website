-- =====================================================
-- 教學生態系感知藍圖 - 測試帳號完整創建 SQL 腳本
-- =====================================================
-- 此腳本將一次性創建四種原型角色的完整測試帳號
-- 包含認證用戶和用戶檔案，跳過郵箱驗證步驟
--
-- ⚠️ 重要：此腳本需要在 Supabase SQL Editor 中以管理員身份運行
-- 確保您有足夠的權限訪問 auth.users 表

-- =====================================================
-- 第一步：創建認證用戶（跳過郵箱驗證）
-- =====================================================

-- 創建守護者認證用戶
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'guardian.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(), -- 自動確認郵箱
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"guardian_test","display_name":"守護者·測試"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 創建啟明者認證用戶
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'luminary.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(), -- 自動確認郵箱
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"luminary_test","display_name":"啟明者·測試"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 創建領航者認證用戶
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'catalyst.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(), -- 自動確認郵箱
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"catalyst_test","display_name":"領航者·測試"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 創建遠行者認證用戶
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'voyager.test@voyager.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(), -- 自動確認郵箱
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"voyager_test","display_name":"遠行者·測試"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 第二步：創建用戶檔案（自動匹配用戶 ID）
-- =====================================================

-- 守護者測試檔案
INSERT INTO profiles (
  id, 
  username, 
  display_name, 
  bio, 
  role,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'guardian_test',
  '守護者·測試',
  '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。擁有管理員權限，可以管理平台設置、用戶權限和內容審核。具備系統監控、用戶管理、內容審核等核心功能。',
  'guardian',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'guardian.test@voyager.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 啟明者測試檔案
INSERT INTO profiles (
  id, 
  username, 
  display_name, 
  bio, 
  role,
  luminary_expertise,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'luminary_test',
  '啟明者·測試',
  '我是啟明者測試帳號，專注於創造和分享知識的光芒。擅長前端開發、UI/UX設計和技術指導，可以創建和發布高質量的課程內容，引導學習者探索知識的奧秘。',
  'luminary',
  ARRAY['前端開發', 'UI/UX設計', 'TypeScript', 'React', 'Next.js', '教學設計', '技術寫作', '程序架構'],
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'luminary.test@voyager.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  luminary_expertise = EXCLUDED.luminary_expertise,
  updated_at = NOW();

-- 領航者測試檔案  
INSERT INTO profiles (
  id, 
  username, 
  display_name, 
  bio, 
  role,
  catalyst_communities,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'catalyst_test',
  '領航者·測試',
  '我是領航者測試帳號，致力於連接不同學習者並促進協作。專長社群建設、活動組織和學習導向，幫助新手快速融入學習社群，促進知識分享和協作學習。',
  'catalyst',
  ARRAY['前端開發社群', '設計師聯盟', '新手導航', '學習小組', '技術分享會', '線上講座', '開源項目', '程序員社交'],
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'catalyst.test@voyager.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  catalyst_communities = EXCLUDED.catalyst_communities,
  updated_at = NOW();

-- 遠行者測試檔案
INSERT INTO profiles (
  id, 
  username, 
  display_name, 
  bio, 
  role,
  voyager_manifesto,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'voyager_test',
  '遠行者·測試',
  '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。熱愛學習新技術、參與討論交流，希望通過不斷學習成為更好的自己。始終保持好奇心和探索精神。',
  'voyager',
  '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。我的目標是在這個無垠的知識宇宙中，找到屬於自己的星座。我將以開放的心態接受挑戰，以好奇的眼光探索未知，以持續的努力追求卓越。在學習的道路上，我將與其他遠行者互相支持，共同成長，讓知識的光芒照亮前行的道路。',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'voyager.test@voyager.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  voyager_manifesto = EXCLUDED.voyager_manifesto,
  updated_at = NOW();

-- =====================================================
-- 第三步：驗證創建結果
-- =====================================================

-- 查詢所有測試帳號的認證狀態
SELECT 
    '🔐 認證用戶狀態檢查' as check_type,
    u.id,
    u.email,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ 已確認'
        ELSE '❌ 未確認'
    END as email_status,
    u.created_at as auth_created_at
FROM auth.users u
WHERE u.email IN (
    'guardian.test@voyager.com',
    'luminary.test@voyager.com', 
    'catalyst.test@voyager.com',
    'voyager.test@voyager.com'
)
ORDER BY 
    CASE u.email
        WHEN 'guardian.test@voyager.com' THEN 1
        WHEN 'luminary.test@voyager.com' THEN 2
        WHEN 'catalyst.test@voyager.com' THEN 3
        WHEN 'voyager.test@voyager.com' THEN 4
    END;

-- 查詢所有測試帳號檔案
SELECT 
    '👤 用戶檔案狀態檢查' as check_type,
    p.id,
    p.username,
    p.display_name,
    p.role,
    CASE p.role 
        WHEN 'guardian' THEN '🛡️ 守護者 - 系統管理員'
        WHEN 'luminary' THEN '✨ 啟明者 - 知識創造者'
        WHEN 'catalyst' THEN '🚀 領航者 - 社群建設者'
        WHEN 'voyager' THEN '🌌 遠行者 - 知識探索者'
        ELSE p.role
    END as role_description,
    SUBSTRING(p.bio FROM 1 FOR 60) || '...' as bio_preview,
    p.created_at
FROM profiles p 
WHERE p.username IN ('guardian_test', 'luminary_test', 'catalyst_test', 'voyager_test')
ORDER BY 
    CASE p.role 
        WHEN 'guardian' THEN 1 
        WHEN 'luminary' THEN 2 
        WHEN 'catalyst' THEN 3 
        WHEN 'voyager' THEN 4 
    END;

-- 完整狀態檢查（關聯查詢）
SELECT 
    '🎯 完整狀態檢查' as check_type,
    u.email,
    p.username,
    p.display_name,
    p.role,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL AND p.id IS NOT NULL THEN '✅ 完全就緒'
        WHEN u.email_confirmed_at IS NOT NULL AND p.id IS NULL THEN '⚠️ 缺少檔案'
        WHEN u.email_confirmed_at IS NULL AND p.id IS NOT NULL THEN '⚠️ 郵箱未確認'
        ELSE '❌ 創建失敗'
    END as status,
    u.created_at as created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
    'guardian.test@voyager.com',
    'luminary.test@voyager.com', 
    'catalyst.test@voyager.com',
    'voyager.test@voyager.com'
)
ORDER BY 
    CASE u.email
        WHEN 'guardian.test@voyager.com' THEN 1
        WHEN 'luminary.test@voyager.com' THEN 2
        WHEN 'catalyst.test@voyager.com' THEN 3
        WHEN 'voyager.test@voyager.com' THEN 4
    END;

-- =====================================================
-- 使用說明和測試建議
-- =====================================================

/*
🎆 教學生態系感知藍圖 - 測試帳號創建完成！

🔑 測試帳號登入資訊（已跳過郵箱驗證）：
┌─────────────┬─────────────────────────────┬─────────────────┐
│ 角色        │ 郵箱                        │ 密碼            │
├─────────────┼─────────────────────────────┼─────────────────┤
│ 🛡️ 守護者   │ guardian.test@voyager.com   │ TestPassword123!│
│ ✨ 啟明者   │ luminary.test@voyager.com   │ TestPassword123!│
│ 🚀 領航者   │ catalyst.test@voyager.com   │ TestPassword123!│
│ 🌌 遠行者   │ voyager.test@voyager.com    │ TestPassword123!│
└─────────────┴─────────────────────────────┴─────────────────┘

🎯 測試建議：
1. 🛡️ 守護者 - 測試管理員功能、用戶權限管理、系統設置
2. ✨ 啟明者 - 測試課程創建、內容發布、教學工具功能
3. 🚀 領航者 - 測試社群建設、活動組織、學習引導功能
4. 🌌 遠行者 - 測試學習功能、課程報名、學習進度追踪

🔧 登入測試步驟：
1. 打開應用登入頁面
2. 使用上述任一測試帳號登入
3. 確認角色權限和功能是否正常
4. 測試不同角色間的互動功能

⚠️ 重要提醒：
• 所有測試帳號已自動確認郵箱，可直接登入
• 密碼統一為：TestPassword123!
• 測試完成後請及時清理測試數據
• 不要在生產環境中使用這些測試帳號

🧹 清理腳本（測試完成後運行）：
DELETE FROM profiles WHERE username IN ('guardian_test', 'luminary_test', 'catalyst_test', 'voyager_test');
DELETE FROM auth.users WHERE email IN ('guardian.test@voyager.com', 'luminary.test@voyager.com', 'catalyst.test@voyager.com', 'voyager.test@voyager.com');
*/