-- 教學生態系感知藍圖 - 測試帳號檔案 SQL 腳本
-- 注意：運行此腳本前，請先在 Supabase 認證面板中手動創建對應的用戶帳號

-- 假設您已經手動創建了四個認證用戶，這裡是示例 UUID
-- 請將這些 UUID 替換為實際創建的用戶 ID

-- 插入守護者測試檔案
INSERT INTO profiles (
  id, 
  username, 
  display_name, 
  bio, 
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- 請替換為實際的用戶 ID
  'guardian_test',
  '守護者·測試',
  '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。',
  'guardian',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 插入啟明者測試檔案
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
  '00000000-0000-0000-0000-000000000002'::uuid, -- 請替換為實際的用戶 ID
  'luminary_test',
  '啟明者·測試',
  '我是啟明者測試帳號，專注於創造和分享知識的光芒。',
  'luminary',
  ARRAY['前端開發', 'UI/UX設計', 'TypeScript'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  luminary_expertise = EXCLUDED.luminary_expertise,
  updated_at = NOW();

-- 插入領航者測試檔案
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
  '00000000-0000-0000-0000-000000000003'::uuid, -- 請替換為實際的用戶 ID
  'catalyst_test',
  '領航者·測試',
  '我是領航者測試帳號，致力於連接不同學習者並促進協作。',
  'catalyst',
  ARRAY['前端開發社群', '設計師聯盟', '新手導航'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  catalyst_communities = EXCLUDED.catalyst_communities,
  updated_at = NOW();

-- 插入遠行者測試檔案
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
  '00000000-0000-0000-0000-000000000004'::uuid, -- 請替換為實際的用戶 ID
  'voyager_test',
  '遠行者·測試',
  '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。',
  'voyager',
  '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。我的目標是在這個無垠的知識宇宙中，找到屬於自己的星座。',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  voyager_manifesto = EXCLUDED.voyager_manifesto,
  updated_at = NOW();

-- 查詢結果確認
SELECT 
  username,
  display_name,
  role,
  bio,
  luminary_expertise,
  catalyst_communities,
  voyager_manifesto,
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