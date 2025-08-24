-- 教学生态系感知蓝图 - 核心数据结构
-- 版本: 1.0
-- 说明: 构建支持四种原型（守护者、启明者、领航者、遥行者）的宇宙地基

-- =====================================================
-- 1. 启用必要的扩展
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. 创建枚举类型
-- =====================================================

-- 原型角色枚举
CREATE TYPE archetype_role AS ENUM (
    'voyager',      -- 遥行者：宇宙的探索家
    'luminary',     -- 启明者：思想的恒星
    'catalyst',     -- 领航者：引力的编织者
    'guardian'      -- 守护者：宇宙平衡的感知者
);

-- 课程状态枚举
CREATE TYPE course_status AS ENUM (
    'incubating',   -- 孕育中（仅创建者可见）
    'published',    -- 已启明（向全宇宙广播）
    'archived'      -- 已封存（移入时间黑洞）
);

-- 学习状态枚举
CREATE TYPE enrollment_status AS ENUM (
    'exploring',    -- 探索中
    'completed',    -- 已完成
    'paused'        -- 暂停
);

-- =====================================================
-- 3. 用户档案表 (profiles) - 原型的身份记录
-- =====================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- 基础身份信息
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    
    -- 原型角色
    role archetype_role DEFAULT 'voyager' NOT NULL,
    
    -- 遥行者专属：个人宣言
    voyager_manifesto TEXT,
    
    -- 启明者专属：专业领域
    luminary_expertise TEXT[],
    
    -- 领航者专属：引导社群列表
    catalyst_communities TEXT[],
    
    -- 宇宙坐标（地理位置，可选）
    location VARCHAR(100),
    website VARCHAR(255),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- 最后活跃时间
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. 知识恒星表 (courses) - 思想的载体
-- =====================================================
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 基础信息
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objectives TEXT[],
    
    -- 创造者（启明者）
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- 状态和可见性
    status course_status DEFAULT 'incubating' NOT NULL,
    
    -- 内容结构
    estimated_duration INTEGER, -- 预估学习时长（分钟）
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    
    -- 分类和标签
    category VARCHAR(100),
    tags TEXT[],
    
    -- 媒体资源
    cover_image_url TEXT,
    preview_video_url TEXT,
    
    -- 价值交换
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    
    -- 统计数据
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 5. 知识单元表 (lessons) - 恒星的组成部分
-- =====================================================
CREATE TABLE public.lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 所属课程
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    
    -- 基础信息
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB, -- 支持富文本、视频、互动元素等
    
    -- 排序和结构
    order_index INTEGER NOT NULL,
    
    -- 学习目标
    learning_objectives TEXT[],
    
    -- 媒体资源
    video_url TEXT,
    audio_url TEXT,
    documents JSONB, -- 文档列表
    
    -- 互动元素
    quiz_data JSONB, -- 测验数据
    exercise_data JSONB, -- 练习数据
    
    -- 估算时长
    estimated_duration INTEGER, -- 分钟
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 6. 学习注册表 (enrollments) - 遥行者的航线记录
-- =====================================================
CREATE TABLE public.enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 关联关系
    voyager_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    
    -- 学习状态
    status enrollment_status DEFAULT 'exploring' NOT NULL,
    
    -- 进度追踪
    progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_lessons UUID[], -- 已完成的课程单元ID数组
    
    -- 时间记录
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 学习数据
    total_study_time INTEGER DEFAULT 0, -- 总学习时间（分钟）
    notes JSONB, -- 个人笔记，按lesson_id组织
    
    -- 评价
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    
    -- 确保每个用户对每门课程只能注册一次
    UNIQUE(voyager_id, course_id)
);

-- =====================================================
-- 7. 共鸣空间表 (comments) - 思想的碰撞与交流
-- =====================================================
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 作者
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- 关联内容
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- 内容
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'question', 'insight', 'beacon')),
    
    -- 互动数据
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- 领航者标记
    highlighted_by_catalyst UUID REFERENCES public.profiles(id),
    highlight_reason TEXT,
    
    -- 状态
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- 确保评论必须关联到课程或课程单元
    CHECK (
        (course_id IS NOT NULL AND lesson_id IS NULL) OR 
        (course_id IS NULL AND lesson_id IS NOT NULL)
    )
);

-- =====================================================
-- 8. 投票记录表 (comment_votes) - 记录遥行者的共鸣
-- =====================================================
CREATE TABLE public.comment_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 关联关系
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    
    -- 投票类型
    vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- 确保每个用户对每条评论只能投票一次
    UNIQUE(user_id, comment_id)
);

-- =====================================================
-- 9. 分类体系表 (categories) - 宇宙的星座分类
-- =====================================================
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 基础信息
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- 层次结构
    parent_category_id UUID REFERENCES public.categories(id),
    
    -- 视觉元素
    icon VARCHAR(50), -- 图标名称
    color VARCHAR(7), -- 十六进制颜色
    
    -- 排序
    sort_order INTEGER DEFAULT 0,
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 10. 系统神谕表 (oracles) - 守护者的全域广播
-- =====================================================
CREATE TABLE public.oracles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 发布者（守护者）
    guardian_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- 内容
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- 类型和优先级
    oracle_type VARCHAR(20) CHECK (oracle_type IN ('announcement', 'guidance', 'warning', 'celebration')) NOT NULL,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    
    -- 可见性控制
    target_roles archetype_role[],
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 显示时间
    display_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_until TIMESTAMP WITH TIME ZONE,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 11. 创建索引以优化查询性能
-- =====================================================

-- profiles 表索引
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_last_seen ON public.profiles(last_seen_at);

-- courses 表索引
CREATE INDEX idx_courses_creator_id ON public.courses(creator_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);
CREATE INDEX idx_courses_tags ON public.courses USING GIN(tags);

-- lessons 表索引
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);

-- enrollments 表索引
CREATE INDEX idx_enrollments_voyager_id ON public.enrollments(voyager_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);
CREATE INDEX idx_enrollments_last_accessed ON public.enrollments(last_accessed_at DESC);

-- comments 表索引
CREATE INDEX idx_comments_course_id ON public.comments(course_id);
CREATE INDEX idx_comments_lesson_id ON public.comments(lesson_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- comment_votes 表索引
CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_id ON public.comment_votes(user_id);

-- categories 表索引
CREATE INDEX idx_categories_parent_id ON public.categories(parent_category_id);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- oracles 表索引
CREATE INDEX idx_oracles_guardian_id ON public.oracles(guardian_id);
CREATE INDEX idx_oracles_display_period ON public.oracles(display_from, display_until);
CREATE INDEX idx_oracles_target_roles ON public.oracles USING GIN(target_roles);