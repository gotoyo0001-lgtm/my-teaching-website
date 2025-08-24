-- =====================================================
-- 教學生態系感知藍圖 - 測試帳號完整創建 SQL 腳本
-- =====================================================
-- 此腳本將創建四種原型角色的完整測試帳號
-- 包含認證用戶和用戶檔案的完整設置

-- 設置腳本變數（請替換為您想使用的郵箱前綴）
-- 建議使用您的真實郵箱，例如：your.email+guardian@gmail.com

-- =====================================================
-- 1. 創建認證用戶（使用 Supabase Auth Admin API）
-- =====================================================

-- 注意：此部分需要在 Supabase Dashboard > Authentication > Users 中手動創建
-- 或使用以下資訊在應用中註冊：

-- 守護者帳號資訊：
-- 郵箱: guardian.test@yourdomain.com
-- 密碼: TestPassword123!
-- 用戶名: guardian_test

-- 啟明者帳號資訊：
-- 郵箱: luminary.test@yourdomain.com  
-- 密碼: TestPassword123!
-- 用戶名: luminary_test

-- 領航者帳號資訊：
-- 郵箱: catalyst.test@yourdomain.com
-- 密碼: TestPassword123!
-- 用戶名: catalyst_test

-- 遠行者帳號資訊：
-- 郵箱: voyager.test@yourdomain.com
-- 密碼: TestPassword123!
-- 用戶名: voyager_test

-- =====================================================
-- 2. 創建用戶檔案（運行以下 SQL）
-- =====================================================

-- 首先，我們需要獲取剛創建的用戶 ID
-- 請先手動創建認證用戶，然後運行以下查詢獲取用戶 ID：

/*
SELECT 
    id,
    email,
    raw_user_meta_data->>'username' as username,
    created_at
FROM auth.users 
WHERE email IN (
    'guardian.test@yourdomain.com',
    'luminary.test@yourdomain.com', 
    'catalyst.test@yourdomain.com',
    'voyager.test@yourdomain.com'
)
ORDER BY created_at DESC;
*/

-- =====================================================
-- 3. 插入用戶檔案（請先替換為實際的用戶 ID）
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
) VALUES (
  'REPLACE_WITH_GUARDIAN_USER_ID'::uuid, -- 請替換為守護者的實際用戶 ID
  'guardian_test',
  '守護者·測試',
  '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。擁有管理員權限，可以管理平台設置、用戶權限和內容審核。',
  'guardian',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
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
) VALUES (
  'REPLACE_WITH_LUMINARY_USER_ID'::uuid, -- 請替換為啟明者的實際用戶 ID
  'luminary_test',
  '啟明者·測試',
  '我是啟明者測試帳號，專注於創造和分享知識的光芒。擅長前端開發、設計和技術指導，可以創建和發布課程內容。',
  'luminary',
  ARRAY['前端開發', 'UI/UX設計', 'TypeScript', 'React', 'Next.js', '教學設計'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
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
) VALUES (
  'REPLACE_WITH_CATALYST_USER_ID'::uuid, -- 請替換為領航者的實際用戶 ID
  'catalyst_test',
  '領航者·測試',
  '我是領航者測試帳號，致力於連接不同學習者並促進協作。專長社群建設、活動組織和學習導向，幫助新手快速融入學習社群。',
  'catalyst',
  ARRAY['前端開發社群', '設計師聯盟', '新手導航', '學習小組', '技術分享會', '線上講座'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
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
) VALUES (
  'REPLACE_WITH_VOYAGER_USER_ID'::uuid, -- 請替換為遠行者的實際用戶 ID
  'voyager_test',
  '遠行者·測試',
  '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。熱愛學習新技術、參與討論交流，希望通過不斷學習成為更好的自己。',
  'voyager',
  '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。我的目標是在這個無垠的知識宇宙中，找到屬於自己的星座。我將以開放的心態接受挑戰，以好奇的眼光探索未知，以持續的努力追求卓越。',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  voyager_manifesto = EXCLUDED.voyager_manifesto,
  updated_at = NOW();


-- =====================================================
-- 4. 驗證創建結果
-- =====================================================

-- 查詢所有測試帳號檔案
SELECT 
  id,
  username,
  display_name,
  role,
  CASE role 
    WHEN 'guardian' THEN '🛡️ 守護者 - 系統管理員'
    WHEN 'luminary' THEN '✨ 啟明者 - 知識創造者'
    WHEN 'catalyst' THEN '🚀 領航者 - 社群建設者'
    WHEN 'voyager' THEN '🌌 遠行者 - 知識探索者'
    ELSE role
  END as role_description,
  bio,
  luminary_expertise,
  catalyst_communities,
  CASE WHEN voyager_manifesto IS NOT NULL 
    THEN SUBSTRING(voyager_manifesto FROM 1 FOR 50) || '...'
    ELSE NULL 
  END as manifesto_preview,
  created_at
FROM profiles 
WHERE username IN ('guardian_test', 'luminary_test', 'catalyst_test', 'voyager_test')
ORDER BY 
  CASE role 
    WHEN 'guardian' THEN 1 
    WHEN 'luminary' THEN 2 
    WHEN 'catalyst' THEN 3 
    WHEN 'voyager' THEN 4 
  END;

-- 查詢測試帳號的認證狀態
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at as auth_created_at,
    p.username,
    p.display_name,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.username IN ('guardian_test', 'luminary_test', 'catalyst_test', 'voyager_test')
ORDER BY 
  CASE p.role 
    WHEN 'guardian' THEN 1 
    WHEN 'luminary' THEN 2 
    WHEN 'catalyst' THEN 3 
    WHEN 'voyager' THEN 4 
  END;

-- =====================================================
-- 5. 使用說明
-- =====================================================

/*
🎆 教學生態系感知藍圖 - 測試帳號創建完成！

🔑 測試帳號登入資訊：
• 守護者: guardian.test@yourdomain.com / TestPassword123!
• 啟明者: luminary.test@yourdomain.com / TestPassword123!
• 領航者: catalyst.test@yourdomain.com / TestPassword123!
• 遠行者: voyager.test@yourdomain.com / TestPassword123!

🎯 測試建議：
1. 守護者 - 測試管理員功能、用戶權限管理
2. 啟明者 - 測試課程創建、內容發布功能
3. 領航者 - 測試社群建設、活動組織功能
4. 遠行者 - 測試學習功能、課程完成流程

⚠️ 清理提醒：
測試完成後，請在 Supabase Dashboard 中刪除測試帳號：
- Authentication > Users 中刪除認證用戶
- Table Editor > profiles 中刪除用戶檔案

使用 SQL 刪除命令：
DELETE FROM profiles WHERE username IN ('guardian_test', 'luminary_test', 'catalyst_test', 'voyager_test');
*/