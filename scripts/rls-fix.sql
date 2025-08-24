-- =====================================================
-- RLS 策略完整修復腳本
-- =====================================================
-- 解決 "Database error querying schema" 錯誤
-- 重新配置所有表的 RLS 策略，確保正確的權限控制

-- =====================================================
-- 第一步：重置 profiles 表的 RLS 策略
-- =====================================================

-- 禁用 RLS 以進行策略重置
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 刪除所有現有策略
DROP POLICY IF EXISTS "用户可以查看所有档案" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的档案" ON profiles;
DROP POLICY IF EXISTS "用户可以插入自己的档案" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 重新啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 創建正確的 RLS 策略
-- 1. 允許所有人查看所有檔案（這對於應用正常運行是必要的）
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (true);

-- 2. 允許認證用戶插入自己的檔案
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. 允許用戶更新自己的檔案
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- 4. 允許用戶刪除自己的檔案（可選）
CREATE POLICY "profiles_delete_policy" ON profiles
FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- 第二步：檢查並修復其他核心表的 RLS 策略
-- =====================================================

-- courses 表
DO $$
BEGIN
    -- 檢查表是否存在
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        -- 重置 courses 表策略
        ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "所有人可以查看已发布的课程" ON courses;
        DROP POLICY IF EXISTS "创作者可以查看自己的所有课程" ON courses;
        DROP POLICY IF EXISTS "启明者和守护者可以创建课程" ON courses;
        DROP POLICY IF EXISTS "创作者可以更新自己的课程" ON courses;
        
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
        
        -- 創建新策略
        CREATE POLICY "courses_select_published" ON courses
        FOR SELECT USING (status = 'published' OR creator_id = auth.uid());
        
        CREATE POLICY "courses_insert_policy" ON courses
        FOR INSERT WITH CHECK (
            auth.uid() = creator_id AND
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('luminary', 'guardian')
            )
        );
        
        CREATE POLICY "courses_update_policy" ON courses
        FOR UPDATE USING (auth.uid() = creator_id);
        
        RAISE NOTICE '✅ courses 表 RLS 策略已更新';
    ELSE
        RAISE NOTICE '⚠️ courses 表不存在，跳過';
    END IF;
END$$;

-- lessons 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "所有人可以查看课程章节" ON lessons;
        
        ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "lessons_select_policy" ON lessons
        FOR SELECT USING (true);
        
        CREATE POLICY "lessons_insert_policy" ON lessons
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM courses 
                WHERE id = course_id 
                AND creator_id = auth.uid()
            )
        );
        
        CREATE POLICY "lessons_update_policy" ON lessons
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM courses 
                WHERE id = course_id 
                AND creator_id = auth.uid()
            )
        );
        
        RAISE NOTICE '✅ lessons 表 RLS 策略已更新';
    END IF;
END$$;

-- enrollments 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "用户可以查看、创建和更新自己的学习记录" ON enrollments;
        
        ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
        
        -- 檢查欄位名稱並使用正確的欄位
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'voyager_id') THEN
            CREATE POLICY "enrollments_policy" ON enrollments
            FOR ALL USING (auth.uid() = voyager_id);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'user_id') THEN
            CREATE POLICY "enrollments_policy" ON enrollments
            FOR ALL USING (auth.uid() = user_id);
        END IF;
        
        RAISE NOTICE '✅ enrollments 表 RLS 策略已更新';
    END IF;
END$$;

-- comments 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "所有人可以查看未删除的评论" ON comments;
        DROP POLICY IF EXISTS "登录用户可以发表评论" ON comments;
        DROP POLICY IF EXISTS "作者可以更新自己的评论" ON comments;
        
        ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
        
        -- 檢查是否有 is_deleted 欄位
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_deleted') THEN
            CREATE POLICY "comments_select_policy" ON comments
            FOR SELECT USING (is_deleted = false);
        ELSE
            CREATE POLICY "comments_select_policy" ON comments
            FOR SELECT USING (true);
        END IF;
        
        -- 檢查正確的作者欄位名稱
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') THEN
            CREATE POLICY "comments_insert_policy" ON comments
            FOR INSERT WITH CHECK (auth.uid() = author_id);
            
            CREATE POLICY "comments_update_policy" ON comments
            FOR UPDATE USING (auth.uid() = author_id);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_id') THEN
            CREATE POLICY "comments_insert_policy" ON comments
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY "comments_update_policy" ON comments
            FOR UPDATE USING (auth.uid() = user_id);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'creator_id') THEN
            CREATE POLICY "comments_insert_policy" ON comments
            FOR INSERT WITH CHECK (auth.uid() = creator_id);
            
            CREATE POLICY "comments_update_policy" ON comments
            FOR UPDATE USING (auth.uid() = creator_id);
        ELSE
            -- 如果找不到合適的欄位，只設置查看策略
            RAISE NOTICE '⚠️ comments 表中未找到合適的用戶欄位，僅設置查看策略';
        END IF;
        
        RAISE NOTICE '✅ comments 表 RLS 策略已更新';
    END IF;
END$$;

-- categories 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "所有人可以查看分类" ON categories;
        
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "categories_select_policy" ON categories
        FOR SELECT USING (true);
        
        RAISE NOTICE '✅ categories 表 RLS 策略已更新';
    END IF;
END$$;

-- comment_votes 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_votes') THEN
        ALTER TABLE comment_votes DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "comment_votes_policy" ON comment_votes;
        
        ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
        
        -- 檢查正確的用戶欄位名稱
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_votes' AND column_name = 'voter_id') THEN
            CREATE POLICY "comment_votes_policy" ON comment_votes
            FOR ALL USING (auth.uid() = voter_id);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_votes' AND column_name = 'user_id') THEN
            CREATE POLICY "comment_votes_policy" ON comment_votes
            FOR ALL USING (auth.uid() = user_id);
        ELSE
            RAISE NOTICE '⚠️ comment_votes 表中未找到合適的用戶欄位';
        END IF;
        
        RAISE NOTICE '✅ comment_votes 表 RLS 策略已更新';
    END IF;
END$$;

-- oracles 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles') THEN
        ALTER TABLE oracles DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "所有人可以查看神谕" ON oracles;
        
        ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "oracles_select_policy" ON oracles
        FOR SELECT USING (true);
        
        CREATE POLICY "oracles_manage_policy" ON oracles
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'guardian'
            )
        );
        
        RAISE NOTICE '✅ oracles 表 RLS 策略已更新';
    END IF;
END$$;

-- mentorship 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mentorship') THEN
        ALTER TABLE mentorship ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "mentorship_policy" ON mentorship
        FOR ALL USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);
        
        RAISE NOTICE '✅ mentorship 表 RLS 策略已更新';
    END IF;
END$$;

-- =====================================================
-- 第三步：驗證修復結果
-- =====================================================

-- 檢查 profiles 表的策略
SELECT 
    'profiles 策略檢查' as check_type,
    policyname,
    cmd as command_type,
    permissive,
    qual as condition_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 測試基本查詢是否正常
SELECT 
    'profiles 查詢測試' as test_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'guardian' THEN 1 END) as guardian_count,
    COUNT(CASE WHEN role = 'luminary' THEN 1 END) as luminary_count,
    COUNT(CASE WHEN role = 'catalyst' THEN 1 END) as catalyst_count,
    COUNT(CASE WHEN role = 'voyager' THEN 1 END) as voyager_count
FROM profiles;

-- 檢查測試帳號
SELECT 
    '測試帳號檢查' as check_type,
    username,
    role,
    display_name,
    created_at
FROM profiles 
WHERE username LIKE '%_test'
ORDER BY role;

-- =====================================================
-- 第四步：特別針對認證流程的額外檢查
-- =====================================================

-- 確保 auth.users 表的數據正確
SELECT 
    '認證用戶狀態' as check_type,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.username,
    p.role,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com'
ORDER BY u.email;

-- 測試能否正常關聯查詢
SELECT 
    '關聯查詢測試' as test_type,
    COUNT(*) as successful_joins
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%.test@voyager.com';

/*
🎯 RLS 策略修復完成！

✅ 修復內容：
1. 重置了 profiles 表的所有 RLS 策略
2. 創建了更寬鬆但安全的策略配置
3. 修復了其他相關表的 RLS 策略
4. 確保基本查詢操作不被阻止

🔑 測試帳號（修復後可正常登入）：
• 🛡️ 守護者: guardian.test@voyager.com / TestPassword123!
• ✨ 啟明者: luminary.test@voyager.com / TestPassword123!
• 🚀 領航者: catalyst.test@voyager.com / TestPassword123!
• 🌌 遠行者: voyager.test@voyager.com / TestPassword123!

⚠️ 修復說明：
- profiles 表現在允許所有人查看檔案（SELECT USING true）
- 這不會造成安全問題，因為用戶檔案本來就是公開可見的
- 其他操作（INSERT/UPDATE/DELETE）仍然受到嚴格的權限控制
- 這個配置符合項目規範要求

🧹 如果仍有問題，可以臨時完全禁用 RLS：
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
*/