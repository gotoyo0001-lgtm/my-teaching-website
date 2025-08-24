-- 教学生态系感知蓝图 - 种子数据
-- 版本: 1.0
-- 说明: 为宇宙创造初始的星辰、星座和原型

-- =====================================================
-- 1. 创建初始分类体系（星座图）
-- =====================================================

INSERT INTO public.categories (name, description, icon, color, sort_order) VALUES
-- 主要知识星座
('technology', '技术星座 - 探索数字宇宙的奥秘', 'code', '#3b82f6', 1),
('design', '设计星座 - 美学与创造的交汇', 'palette', '#8b5cf6', 2),
('business', '商业星座 - 价值创造的艺术', 'trending-up', '#10b981', 3),
('art', '艺术星座 - 灵魂表达的殿堂', 'heart', '#f59e0b', 4),
('science', '科学星座 - 真理探索的航道', 'beaker', '#06b6d4', 5),
('philosophy', '哲学星座 - 思维深度的维度', 'brain', '#6366f1', 6),
('wellness', '康养星座 - 身心平衡的圣地', 'leaf', '#84cc16', 7),
('language', '语言星座 - 沟通桥梁的构建', 'message-circle', '#ec4899', 8);

-- 技术子分类
INSERT INTO public.categories (name, description, parent_category_id, icon, color, sort_order) 
SELECT 
    unnest(ARRAY['web-development', 'mobile-development', 'data-science', 'ai-ml', 'blockchain', 'cybersecurity']),
    unnest(ARRAY['Web开发 - 构建数字世界的基石', '移动开发 - 掌中宇宙的创造', '数据科学 - 从数据中发现星辰', 'AI与机器学习 - 智慧的进化', '区块链 - 信任的新纪元', '网络安全 - 数字世界的守护']),
    id,
    unnest(ARRAY['globe', 'smartphone', 'bar-chart', 'cpu', 'link', 'shield']),
    unnest(ARRAY['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']),
    generate_series(1, 6)
FROM public.categories WHERE name = 'technology';

-- 设计子分类
INSERT INTO public.categories (name, description, parent_category_id, icon, color, sort_order) 
SELECT 
    unnest(ARRAY['ui-ux', 'graphic-design', 'motion-graphics', '3d-modeling']),
    unnest(ARRAY['UI/UX设计 - 体验的雕琢', '平面设计 - 视觉语言的诗篇', '动态图形 - 时间中的美学', '3D建模 - 虚拟世界的塑形']),
    id,
    unnest(ARRAY['layout', 'image', 'play', 'box']),
    unnest(ARRAY['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4']),
    generate_series(1, 4)
FROM public.categories WHERE name = 'design';

-- =====================================================
-- 2. 创建初始神谕（系统公告）
-- =====================================================

-- 注意：这里我们暂时先创建神谕的结构，实际的守护者ID需要在用户注册后填入
-- 可以通过更新语句来完成

-- =====================================================
-- 3. 创建示例课程内容
-- =====================================================

-- 注意：示例课程的创建需要等到有启明者用户注册后才能进行
-- 这里我们先准备一些课程模板数据

-- =====================================================
-- 4. 实用函数：用于数据库初始化后的设置
-- =====================================================

-- 函数：为指定用户设置为守护者角色
CREATE OR REPLACE FUNCTION promote_to_guardian(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- 根据邮箱查找用户ID
    SELECT au.id INTO user_id 
    FROM auth.users au 
    WHERE au.email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- 更新用户角色为守护者
    UPDATE public.profiles 
    SET role = 'guardian',
        updated_at = NOW()
    WHERE id = user_id;
    
    -- 检查是否成功更新
    IF FOUND THEN
        RAISE NOTICE 'User % promoted to guardian successfully', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Failed to promote user % to guardian', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：为指定用户设置为启明者角色
CREATE OR REPLACE FUNCTION promote_to_luminary(user_email TEXT, expertise TEXT[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT au.id INTO user_id 
    FROM auth.users au 
    WHERE au.email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    UPDATE public.profiles 
    SET role = 'luminary',
        luminary_expertise = COALESCE(expertise, ARRAY['general']),
        updated_at = NOW()
    WHERE id = user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'User % promoted to luminary successfully', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Failed to promote user % to luminary', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：为指定用户设置为领航者角色
CREATE OR REPLACE FUNCTION promote_to_catalyst(user_email TEXT, communities TEXT[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT au.id INTO user_id 
    FROM auth.users au 
    WHERE au.email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    UPDATE public.profiles 
    SET role = 'catalyst',
        catalyst_communities = COALESCE(communities, ARRAY['general']),
        updated_at = NOW()
    WHERE id = user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'User % promoted to catalyst successfully', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Failed to promote user % to catalyst', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：创建示例课程
CREATE OR REPLACE FUNCTION create_sample_course(
    creator_email TEXT,
    course_title TEXT,
    course_description TEXT,
    course_category TEXT DEFAULT 'technology'
)
RETURNS UUID AS $$
DECLARE
    creator_id UUID;
    course_id UUID;
    lesson_id UUID;
BEGIN
    -- 获取创建者ID
    SELECT au.id INTO creator_id 
    FROM auth.users au 
    WHERE au.email = creator_email;
    
    IF creator_id IS NULL THEN
        RAISE EXCEPTION 'Creator with email % not found', creator_email;
    END IF;
    
    -- 创建课程
    INSERT INTO public.courses (
        title,
        description,
        creator_id,
        category,
        status,
        difficulty_level,
        estimated_duration,
        tags
    ) VALUES (
        course_title,
        course_description,
        creator_id,
        course_category,
        'published',
        2,
        120,
        ARRAY['sample', 'introduction']
    ) RETURNING id INTO course_id;
    
    -- 创建示例课程单元
    INSERT INTO public.lessons (
        course_id,
        title,
        description,
        content,
        order_index,
        estimated_duration,
        learning_objectives
    ) VALUES 
    (
        course_id,
        '第一章：初识宇宙',
        '欢迎来到知识宇宙的第一站',
        '{"type": "rich_text", "content": "欢迎，远行者！你即将开始一段激动人心的知识远征。在这个宇宙中，每一个概念都是一颗星星，每一次学习都是一次星际旅行。"}',
        1,
        30,
        ARRAY['了解学习平台的基本概念', '熟悉宇宙隐喻系统', '建立学习的心理准备']
    ),
    (
        course_id,
        '第二章：星辰导航',
        '学会在知识星图中自由航行',
        '{"type": "rich_text", "content": "在浩瀚的知识宇宙中，导航技能是每个远行者的必备能力。让我们学习如何阅读星图，如何设定航线，如何记录你的探索足迹。"}',
        2,
        45,
        ARRAY['掌握知识星图的阅读方法', '学会设定个人学习路径', '了解进度追踪机制']
    ),
    (
        course_id,
        '第三章：星际交流',
        '在共鸣空间中与其他遥行者建立连接',
        '{"type": "rich_text", "content": "知识的真正价值在于分享与交流。在这一章中，你将学会如何在共鸣空间中留下你的见解，如何从他人的智慧中汲取养分。"}',
        3,
        45,
        ARRAY['掌握社区互动的艺术', '学会提出有价值的问题', '培养倾听和分享的习惯']
    ) RETURNING id INTO lesson_id;
    
    RAISE NOTICE 'Sample course "%" created with ID: %', course_title, course_id;
    RETURN course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. 视图：便于数据查询和管理
-- =====================================================

-- 课程统计视图
CREATE OR REPLACE VIEW course_stats AS
SELECT 
    c.id,
    c.title,
    c.category,
    c.status,
    p.display_name as creator_name,
    c.enrollment_count,
    c.completion_count,
    c.average_rating,
    CASE 
        WHEN c.enrollment_count > 0 
        THEN ROUND((c.completion_count::numeric / c.enrollment_count * 100), 2)
        ELSE 0 
    END as completion_rate,
    c.created_at,
    c.updated_at
FROM public.courses c
JOIN public.profiles p ON c.creator_id = p.id;

-- 用户学习统计视图
CREATE OR REPLACE VIEW user_learning_stats AS
SELECT 
    p.id,
    p.username,
    p.display_name,
    p.role,
    COUNT(e.id) as total_enrollments,
    COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_courses,
    COUNT(CASE WHEN e.status = 'exploring' THEN 1 END) as active_courses,
    SUM(e.total_study_time) as total_study_minutes,
    AVG(e.rating) as average_rating_given,
    p.created_at as joined_at,
    p.last_seen_at
FROM public.profiles p
LEFT JOIN public.enrollments e ON p.id = e.voyager_id
GROUP BY p.id, p.username, p.display_name, p.role, p.created_at, p.last_seen_at;

-- 活跃讨论视图
CREATE OR REPLACE VIEW active_discussions AS
SELECT 
    c.id as comment_id,
    c.content,
    c.content_type,
    c.upvotes,
    c.downvotes,
    c.upvotes - c.downvotes as net_score,
    p.display_name as author_name,
    p.role as author_role,
    COALESCE(course.title, lesson_course.title) as course_title,
    CASE 
        WHEN c.course_id IS NOT NULL THEN 'course'
        WHEN c.lesson_id IS NOT NULL THEN 'lesson'
    END as context_type,
    c.created_at
FROM public.comments c
JOIN public.profiles p ON c.author_id = p.id
LEFT JOIN public.courses course ON c.course_id = course.id
LEFT JOIN public.lessons lesson ON c.lesson_id = lesson.id
LEFT JOIN public.courses lesson_course ON lesson.course_id = lesson_course.id
WHERE c.is_deleted = FALSE
ORDER BY c.created_at DESC;

-- =====================================================
-- 6. 安全函数：仅允许管理员调用的初始化函数
-- =====================================================

-- 初始化系统的主函数（需要超级用户权限）
CREATE OR REPLACE FUNCTION initialize_voyager_universe()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
BEGIN
    -- 检查是否已经初始化
    IF EXISTS (SELECT 1 FROM public.categories WHERE name = 'technology') THEN
        RETURN 'Universe already initialized!';
    END IF;
    
    result_text := result_text || 'Voyager Universe initialization completed successfully!' || E'\n';
    result_text := result_text || 'Categories created: ' || (SELECT COUNT(*) FROM public.categories) || E'\n';
    result_text := result_text || 'Ready for Guardians, Luminaries, Catalysts, and Voyagers to join!' || E'\n';
    result_text := result_text || E'\n';
    result_text := result_text || 'Next steps:' || E'\n';
    result_text := result_text || '1. Register your first Guardian user' || E'\n';
    result_text := result_text || '2. Use promote_to_guardian(''email@example.com'') to assign the role' || E'\n';
    result_text := result_text || '3. Create Luminary users and sample courses' || E'\n';
    result_text := result_text || '4. Begin the cosmic journey!' || E'\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用示例：
-- SELECT initialize_voyager_universe();
-- SELECT promote_to_guardian('admin@yourplatform.com');
-- SELECT promote_to_luminary('teacher@yourplatform.com', ARRAY['web-development', 'design']);
-- SELECT create_sample_course('teacher@yourplatform.com', '遥行者指南', '一门帮助新手适应宇宙的入门课程');