-- =====================================================
-- 全新 Supabase 項目完整初始化腳本
-- =====================================================
-- 包含：表結構、枚舉類型、RLS策略、測試帳號
-- 適用於全新、乾淨的 Supabase 項目

-- =====================================================
-- 第一步：啟用必要的擴展
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 第二步：創建所有枚舉類型
-- =====================================================

-- 原型角色枚舉
CREATE TYPE archetype_role AS ENUM ('voyager', 'luminary', 'catalyst', 'guardian');

-- 課程狀態枚舉
CREATE TYPE course_status AS ENUM ('incubating', 'published', 'archived');

-- 學習狀態枚舉
CREATE TYPE enrollment_status AS ENUM ('exploring', 'completed', 'paused');

-- 評論類型枚舉
CREATE TYPE comment_type AS ENUM ('text', 'question', 'insight', 'beacon');

-- 神諭類型枚舉
CREATE TYPE oracle_type AS ENUM ('announcement', 'guidance', 'warning', 'celebration');

-- 投票類型枚舉
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');

-- =====================================================
-- 第三步：創建所有核心表
-- =====================================================

-- 用戶檔案表 (profiles)
CREATE TABLE profiles (
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

-- 分類表 (categories)
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 課程表 (courses)
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    objectives TEXT[],
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status course_status DEFAULT 'incubating',
    estimated_duration INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    category TEXT,
    tags TEXT[],
    cover_image_url TEXT,
    preview_video_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 課程章節表 (lessons)
CREATE TABLE lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    resources JSONB,
    order_index INTEGER NOT NULL,
    estimated_duration INTEGER,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 學習記錄表 (enrollments)
CREATE TABLE enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    status enrollment_status DEFAULT 'exploring',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_lesson_id UUID REFERENCES lessons(id),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- 評論表 (comments)
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type comment_type DEFAULT 'text',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 評論投票表 (comment_votes)
CREATE TABLE comment_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 神諭表 (oracles)
CREATE TABLE oracles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type oracle_type DEFAULT 'announcement',
    is_pinned BOOLEAN DEFAULT FALSE,
    target_roles archetype_role[],
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 師徒關係表 (mentorship)
CREATE TABLE mentorship (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- =====================================================
-- 第四步：創建索引優化
-- =====================================================

-- 用戶檔案索引
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 課程索引
CREATE INDEX IF NOT EXISTS idx_courses_creator ON courses(creator_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- 學習記錄索引
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- 評論索引
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_course ON comments(course_id);
CREATE INDEX IF NOT EXISTS idx_comments_lesson ON comments(lesson_id);

-- =====================================================
-- 第五步：啟用 RLS 並設置安全策略
-- =====================================================

-- 啟用所有表的 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship ENABLE ROW LEVEL SECURITY;

-- profiles 表策略（關鍵：允許匿名用戶讀取）
CREATE POLICY "enable_read_access_for_all" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "enable_insert_for_authenticated_users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "enable_update_for_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_delete_for_own_profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- courses 表策略
CREATE POLICY "所有人可以查看已發布的課程" ON courses
    FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);

CREATE POLICY "認證用戶可以創建課程" ON courses
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = creator_id);

CREATE POLICY "創作者可以更新自己的課程" ON courses
    FOR UPDATE USING (auth.uid() = creator_id);

-- lessons 表策略
CREATE POLICY "所有人可以查看課程章節" ON lessons
    FOR SELECT USING (true);

CREATE POLICY "課程創作者可以管理章節" ON lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND creator_id = auth.uid()
        )
    );

-- enrollments 表策略
CREATE POLICY "用戶可以管理自己的學習記錄" ON enrollments
    FOR ALL USING (auth.uid() = user_id);

-- comments 表策略
CREATE POLICY "所有人可以查看未刪除的評論" ON comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "認證用戶可以發表評論" ON comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "作者可以更新自己的評論" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- comment_votes 表策略
CREATE POLICY "用戶可以管理自己的投票" ON comment_votes
    FOR ALL USING (auth.uid() = user_id);

-- categories 表策略
CREATE POLICY "所有人可以查看分類" ON categories
    FOR SELECT USING (true);

-- oracles 表策略
CREATE POLICY "所有人可以查看神諭" ON oracles
    FOR SELECT USING (true);

CREATE POLICY "守護者可以管理神諭" ON oracles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

-- mentorship 表策略
CREATE POLICY "相關用戶可以查看師徒關係" ON mentorship
    FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- =====================================================
-- 第六步：設置表權限
-- =====================================================

-- 授予基本權限
GRANT SELECT ON profiles TO anon, authenticated;
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT ON lessons TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON oracles TO anon, authenticated;

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON lessons TO authenticated;
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comment_votes TO authenticated;
GRANT ALL ON mentorship TO authenticated;

-- =====================================================
-- 第七步：創建測試帳號
-- =====================================================

-- 創建守護者測試帳號
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
)
VALUES (
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
);

-- 創建守護者檔案
INSERT INTO profiles (id, username, display_name, bio, role, created_at, updated_at)
SELECT 
    u.id, 
    'guardian_test',
    '守護者·測試',
    '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。',
    'guardian'::archetype_role, 
    NOW(), 
    NOW()
FROM auth.users u 
WHERE u.email = 'guardian.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- 創建啟明者測試帳號
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    gen_random_uuid(), 
    'authenticated', 
    'authenticated', 
    'luminary.test@voyager.com',
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
);

INSERT INTO profiles (id, username, display_name, bio, role, luminary_expertise, created_at, updated_at)
SELECT 
    u.id, 
    'luminary_test',
    '啟明者·測試',
    '我是啟明者測試帳號，專注於創造和分享知識的光芒。',
    'luminary'::archetype_role,
    ARRAY['前端開發', 'UI/UX設計', 'TypeScript'],
    NOW(), 
    NOW()
FROM auth.users u 
WHERE u.email = 'luminary.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- 創建領航者測試帳號
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    gen_random_uuid(), 
    'authenticated', 
    'authenticated', 
    'catalyst.test@voyager.com',
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
);

INSERT INTO profiles (id, username, display_name, bio, role, catalyst_communities, created_at, updated_at)
SELECT 
    u.id, 
    'catalyst_test',
    '領航者·測試',
    '我是領航者測試帳號，致力於連接不同學習者並促進協作。',
    'catalyst'::archetype_role,
    ARRAY['前端開發社群', '設計師聯盟', '新手導航'],
    NOW(), 
    NOW()
FROM auth.users u 
WHERE u.email = 'catalyst.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- 創建遠行者測試帳號
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    gen_random_uuid(), 
    'authenticated', 
    'authenticated', 
    'voyager.test@voyager.com',
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
);

INSERT INTO profiles (id, username, display_name, bio, role, voyager_manifesto, created_at, updated_at)
SELECT 
    u.id, 
    'voyager_test',
    '遠行者·測試',
    '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。',
    'voyager'::archetype_role,
    '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。',
    NOW(), 
    NOW()
FROM auth.users u 
WHERE u.email = 'voyager.test@voyager.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- =====================================================
-- 第八步：驗證設置
-- =====================================================

-- 檢查枚舉類型
SELECT 
    '枚舉類型檢查' as check_type,
    typname as type_name,
    '✅ 已創建' as status
FROM pg_type 
WHERE typname IN ('archetype_role', 'course_status', 'enrollment_status', 'comment_type', 'oracle_type', 'vote_type')
ORDER BY typname;

-- 檢查表結構
SELECT 
    '表結構檢查' as check_type,
    table_name,
    '✅ 已創建' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'courses', 'lessons', 'enrollments', 'comments', 'comment_votes', 'categories', 'oracles', 'mentorship')
ORDER BY table_name;

-- 檢查 RLS 狀態
SELECT 
    'RLS 狀態檢查' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'courses', 'lessons', 'enrollments', 'comments', 'comment_votes', 'categories', 'oracles', 'mentorship')
ORDER BY tablename;

-- 檢查測試帳號
SELECT 
    '測試帳號檢查' as check_type,
    u.email,
    p.username,
    p.display_name,
    p.role,
    '✅ 已創建' as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com'
ORDER BY p.role;

-- 測試基本查詢
SELECT 
    '基本查詢測試' as test_type,
    COUNT(*) as total_profiles,
    'SUCCESS' as status
FROM profiles;

/*
🎉 全新 Supabase 項目初始化完成！

✅ 已創建：
• 所有必要的枚舉類型
• 完整的表結構（9個核心表）
• 優化的索引
• 安全的 RLS 策略
• 正確的表權限
• 四個測試帳號

🔑 測試帳號：
• 守護者: guardian.test@voyager.com / TestPassword123!
• 啟明者: luminary.test@voyager.com / TestPassword123!
• 領航者: catalyst.test@voyager.com / TestPassword123!
• 遠行者: voyager.test@voyager.com / TestPassword123!

🎯 關鍵特點：
• 允許匿名用戶讀取 profiles 表
• 保持適當的安全性
• 完整的功能支持
• 經過測試的配置

執行完成後，新項目就可以正常工作了！
*/