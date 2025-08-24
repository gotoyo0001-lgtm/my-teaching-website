-- =====================================================
-- 教学生态系感知蓝图 - Supabase 数据库设置脚本
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 数据类型定义 (ENUMS)
-- =====================================================

-- 原型角色枚举
CREATE TYPE archetype_role AS ENUM ('voyager', 'luminary', 'catalyst', 'guardian');

-- 课程状态枚举
CREATE TYPE course_status AS ENUM ('incubating', 'published', 'archived');

-- 学习状态枚举
CREATE TYPE enrollment_status AS ENUM ('exploring', 'completed', 'paused');

-- 评论类型枚举
CREATE TYPE comment_type AS ENUM ('text', 'question', 'insight', 'beacon');

-- 神谕类型枚举
CREATE TYPE oracle_type AS ENUM ('announcement', 'guidance', 'warning', 'celebration');

-- 投票类型枚举
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');

-- =====================================================
-- 2. 核心数据表
-- =====================================================

-- 用户档案表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    role archetype_role DEFAULT 'voyager',
    voyager_manifesto TEXT, -- 遥行者宣言
    luminary_expertise TEXT[], -- 启明者专业领域
    catalyst_communities TEXT[], -- 领航者社群
    location TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE
);

-- 课程表 (courses)
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    objectives TEXT[], -- 学习目标
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status course_status DEFAULT 'incubating',
    estimated_duration INTEGER, -- 预估时长（分钟）
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

-- 课程章节表 (lessons)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB, -- 课程内容（支持富文本）
    order_index INTEGER NOT NULL,
    learning_objectives TEXT[], -- 本节学习目标
    video_url TEXT,
    audio_url TEXT,
    documents JSONB, -- 文档附件
    quiz_data JSONB, -- 测验数据
    exercise_data JSONB, -- 练习数据
    estimated_duration INTEGER, -- 预估时长（分钟）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- 学习记录表 (enrollments)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voyager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    status enrollment_status DEFAULT 'exploring',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_lessons TEXT[], -- 已完成的课程ID数组
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    total_study_time INTEGER DEFAULT 0, -- 总学习时间（分钟）
    notes JSONB, -- 学习笔记
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    UNIQUE(voyager_id, course_id)
);

-- 评论表 (comments)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type comment_type DEFAULT 'text',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    highlighted_by_catalyst UUID REFERENCES profiles(id), -- 被领航者高亮
    highlight_reason TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (course_id IS NOT NULL OR lesson_id IS NOT NULL) -- 至少关联一个
);

-- 评论投票表 (comment_votes)
CREATE TABLE IF NOT EXISTS comment_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 分类表 (categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- 图标名称或URL
    color TEXT, -- 主题色
    parent_id UUID REFERENCES categories(id), -- 支持多级分类
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 神谕表 (oracles) - 系统公告和指导
CREATE TABLE IF NOT EXISTS oracles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    oracle_type oracle_type NOT NULL,
    target_roles archetype_role[], -- 目标角色
    is_global BOOLEAN DEFAULT FALSE, -- 是否全局公告
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. 索引优化
-- =====================================================

-- 用户档案索引
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 课程索引
CREATE INDEX IF NOT EXISTS idx_courses_creator ON courses(creator_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- 课程章节索引
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- 学习记录索引
CREATE INDEX IF NOT EXISTS idx_enrollments_voyager ON enrollments(voyager_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- 评论索引
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_course ON comments(course_id);
CREATE INDEX IF NOT EXISTS idx_comments_lesson ON comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 评论投票索引
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user ON comment_votes(user_id);

-- =====================================================
-- 4. 行级安全策略 (RLS)
-- =====================================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;

-- 用户档案策略
CREATE POLICY "用户可以查看所有档案" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的档案" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的档案" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 课程策略
CREATE POLICY "所有人可以查看已发布的课程" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "创作者可以查看自己的所有课程" ON courses FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "启明者和守护者可以创建课程" ON courses FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('luminary', 'guardian')
    )
);
CREATE POLICY "创作者可以更新自己的课程" ON courses FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "创作者可以删除自己的课程" ON courses FOR DELETE USING (auth.uid() = creator_id);

-- 课程章节策略
CREATE POLICY "所有人可以查看已发布课程的章节" ON lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE id = lessons.course_id 
        AND status = 'published'
    )
);
CREATE POLICY "课程创作者可以管理自己课程的章节" ON lessons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE id = lessons.course_id 
        AND creator_id = auth.uid()
    )
);

-- 学习记录策略
CREATE POLICY "用户可以查看自己的学习记录" ON enrollments FOR SELECT USING (auth.uid() = voyager_id);
CREATE POLICY "用户可以创建自己的学习记录" ON enrollments FOR INSERT WITH CHECK (auth.uid() = voyager_id);
CREATE POLICY "用户可以更新自己的学习记录" ON enrollments FOR UPDATE USING (auth.uid() = voyager_id);

-- 评论策略
CREATE POLICY "所有人可以查看未删除的评论" ON comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "登录用户可以发表评论" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "作者可以更新自己的评论" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "作者和领航者可以删除评论" ON comments FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('catalyst', 'guardian')
    )
);

-- 评论投票策略
CREATE POLICY "用户可以查看自己的投票" ON comment_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "登录用户可以投票" ON comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以修改自己的投票" ON comment_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户可以删除自己的投票" ON comment_votes FOR DELETE USING (auth.uid() = user_id);

-- 分类策略
CREATE POLICY "所有人可以查看活跃分类" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "守护者可以管理分类" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'guardian'
    )
);

-- 神谕策略
CREATE POLICY "所有人可以查看活跃的神谕" ON oracles FOR SELECT USING (is_active = true);
CREATE POLICY "守护者可以管理神谕" ON oracles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'guardian'
    )
);

-- =====================================================
-- 5. 触发器和函数
-- =====================================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracles_updated_at BEFORE UPDATE ON oracles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 评论投票统计更新函数
CREATE OR REPLACE FUNCTION update_comment_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 更新投票类型
        IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
            UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.comment_id;
        ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
            UPDATE comments SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 评论投票触发器
CREATE TRIGGER comment_votes_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comment_votes
    FOR EACH ROW EXECUTE FUNCTION update_comment_votes();

-- =====================================================
-- 6. 视图 (Views)
-- =====================================================

-- 活跃讨论视图
CREATE OR REPLACE VIEW active_discussions AS
SELECT 
    c.id,
    c.content,
    c.content_type,
    c.upvotes,
    c.downvotes,
    (c.upvotes - c.downvotes) as net_score,
    c.created_at,
    p.username as author_name,
    p.display_name as author_display_name,
    p.role as author_role,
    co.title as course_title,
    l.title as lesson_title
FROM comments c
JOIN profiles p ON c.author_id = p.id
LEFT JOIN courses co ON c.course_id = co.id
LEFT JOIN lessons l ON c.lesson_id = l.id
WHERE c.is_deleted = false
ORDER BY (c.upvotes - c.downvotes) DESC, c.created_at DESC;

-- =====================================================
-- 7. 初始数据
-- =====================================================

-- 默认分类
INSERT INTO categories (name, description, icon, color) VALUES
('技术开发', '编程、开发工具、框架学习', '💻', '#3B82F6'),
('设计创意', 'UI/UX、平面设计、创意思维', '🎨', '#8B5CF6'),
('商业管理', '项目管理、团队协作、商业思维', '📈', '#10B981'),
('个人成长', '自我提升、学习方法、生活技能', '🌱', '#F59E0B'),
('科学探索', '科学知识、研究方法、前沿技术', '🔬', '#EF4444'),
('艺术人文', '文学、历史、哲学、艺术', '📚', '#EC4899');

-- =====================================================
-- 完成设置
-- =====================================================

-- 刷新模式
NOTIFY pgrst, 'reload schema';