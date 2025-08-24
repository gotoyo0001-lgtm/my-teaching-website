-- 教学生态系感知蓝图 - RLS信任法则
-- 版本: 1.0
-- 说明: 定义四种原型的感知边界和操作权限

-- =====================================================
-- 启用行级安全策略
-- =====================================================

-- 为所有核心表启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 辅助函数：获取当前用户的原型角色
-- =====================================================
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS archetype_role
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- =====================================================
-- 1. PROFILES 表 - 身份感知法则
-- =====================================================

-- 所有已认证用户都可以查看基础的用户档案信息
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 用户只能更新自己的档案
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 守护者可以查看和更新所有档案（包括角色变更）
CREATE POLICY "Guardians can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- 新用户可以创建自己的档案
CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. COURSES 表 - 知识恒星感知法则
-- =====================================================

-- 所有用户都可以查看已发布的课程
CREATE POLICY "Published courses are viewable by all authenticated users"
ON public.courses FOR SELECT
TO authenticated
USING (status = 'published');

-- 启明者可以查看自己创建的所有课程（包括孕育中的）
CREATE POLICY "Luminaries can view their own courses"
ON public.courses FOR SELECT
TO authenticated
USING (
  creator_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('luminary', 'guardian')
  )
);

-- 启明者可以创建新课程
CREATE POLICY "Luminaries can create courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (
  creator_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('luminary', 'guardian')
  )
);

-- 启明者可以更新自己的课程
CREATE POLICY "Luminaries can update their own courses"
ON public.courses FOR UPDATE
TO authenticated
USING (
  creator_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('luminary', 'guardian')
  )
);

-- 守护者可以管理所有课程
CREATE POLICY "Guardians can manage all courses"
ON public.courses FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- =====================================================
-- 3. LESSONS 表 - 知识单元感知法则
-- =====================================================

-- 所有用户都可以查看已发布课程的单元
CREATE POLICY "Lessons of published courses are viewable"
ON public.lessons FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id AND status = 'published'
  )
);

-- 启明者可以查看自己创建课程的所有单元
CREATE POLICY "Luminaries can view lessons of their courses"
ON public.lessons FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND creator_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('luminary', 'guardian')
    )
  )
);

-- 启明者可以管理自己课程的单元
CREATE POLICY "Luminaries can manage lessons of their courses"
ON public.lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND creator_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('luminary', 'guardian')
    )
  )
);

-- 守护者可以管理所有课程单元
CREATE POLICY "Guardians can manage all lessons"
ON public.lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- =====================================================
-- 4. ENROLLMENTS 表 - 学习记录感知法则
-- =====================================================

-- 遥行者可以查看自己的学习记录
CREATE POLICY "Voyagers can view their own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (voyager_id = auth.uid());

-- 遥行者可以注册课程
CREATE POLICY "Voyagers can enroll in courses"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (
  voyager_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id AND status = 'published'
  )
);

-- 遥行者可以更新自己的学习记录
CREATE POLICY "Voyagers can update their own enrollments"
ON public.enrollments FOR UPDATE
TO authenticated
USING (voyager_id = auth.uid());

-- 启明者可以查看自己课程的所有注册记录
CREATE POLICY "Luminaries can view enrollments of their courses"
ON public.enrollments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND creator_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('luminary', 'guardian')
    )
  )
);

-- 领航者可以查看其负责社群的学习记录
CREATE POLICY "Catalysts can view community enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'catalyst'
    AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND category = ANY(catalyst_communities)
    )
  )
);

-- 守护者可以查看所有学习记录
CREATE POLICY "Guardians can view all enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- =====================================================
-- 5. COMMENTS 表 - 共鸣空间感知法则
-- =====================================================

-- 所有用户都可以查看已发布课程相关的评论
CREATE POLICY "Comments on published content are viewable"
ON public.comments FOR SELECT
TO authenticated
USING (
  NOT is_deleted AND (
    -- 课程评论
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND status = 'published'
    )) OR
    -- 课程单元评论
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.status = 'published'
    ))
  )
);

-- 用户可以创建评论
CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid() AND
  (
    -- 课程评论
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND status = 'published'
    )) OR
    -- 课程单元评论
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.status = 'published'
    ))
  )
);

-- 用户可以更新和删除自己的评论
CREATE POLICY "Users can manage their own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- 启明者可以管理自己课程下的所有评论
CREATE POLICY "Luminaries can manage comments on their courses"
ON public.comments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('luminary', 'guardian')
  ) AND (
    -- 直接课程评论
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.creator_id = auth.uid()
    )) OR
    -- 课程单元评论
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.creator_id = auth.uid()
    ))
  )
);

-- 领航者可以高亮和管理其社群课程的评论
CREATE POLICY "Catalysts can highlight community comments"
ON public.comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'catalyst'
  ) AND (
    -- 课程评论
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND category = ANY(
        SELECT catalyst_communities 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )) OR
    -- 课程单元评论
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id 
      AND c.category = ANY(
        SELECT catalyst_communities 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ))
  )
);

-- 守护者可以管理所有评论
CREATE POLICY "Guardians can manage all comments"
ON public.comments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- =====================================================
-- 6. COMMENT_VOTES 表 - 投票记录感知法则
-- =====================================================

-- 用户可以查看自己的投票记录
CREATE POLICY "Users can view their own votes"
ON public.comment_votes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 用户可以为评论投票
CREATE POLICY "Users can vote on comments"
ON public.comment_votes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 用户可以修改自己的投票
CREATE POLICY "Users can update their own votes"
ON public.comment_votes FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 用户可以删除自己的投票
CREATE POLICY "Users can delete their own votes"
ON public.comment_votes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- 7. CATEGORIES 表 - 星座分类感知法则
-- =====================================================

-- 所有用户都可以查看活跃的分类
CREATE POLICY "Active categories are viewable by all"
ON public.categories FOR SELECT
TO authenticated
USING (is_active = true);

-- 只有守护者可以管理分类
CREATE POLICY "Only guardians can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- =====================================================
-- 8. ORACLES 表 - 神谕感知法则
-- =====================================================

-- 用户可以查看针对其角色的活跃神谕
CREATE POLICY "Users can view oracles for their role"
ON public.oracles FOR SELECT
TO authenticated
USING (
  is_active = true AND
  (display_from IS NULL OR display_from <= NOW()) AND
  (display_until IS NULL OR display_until >= NOW()) AND
  (
    target_roles IS NULL OR 
    auth.get_user_role() = ANY(target_roles)
  )
);

-- 只有守护者可以管理神谕
CREATE POLICY "Only guardians can manage oracles"
ON public.oracles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'guardian'
  )
);

-- =====================================================
-- 9. 数据更新触发器
-- =====================================================

-- 自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracles_updated_at 
    BEFORE UPDATE ON public.oracles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. 自动统计更新触发器
-- =====================================================

-- 更新课程注册数量的函数
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.courses 
        SET enrollment_count = enrollment_count + 1 
        WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.courses 
        SET enrollment_count = enrollment_count - 1 
        WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 为enrollments表添加触发器
CREATE TRIGGER update_enrollment_count_trigger
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- 更新课程完成数量的函数
CREATE OR REPLACE FUNCTION update_course_completion_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- 如果状态从非完成变为完成
        IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
            UPDATE public.courses 
            SET completion_count = completion_count + 1 
            WHERE id = NEW.course_id;
        -- 如果状态从完成变为非完成
        ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
            UPDATE public.courses 
            SET completion_count = completion_count - 1 
            WHERE id = NEW.course_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为enrollments表添加完成状态触发器
CREATE TRIGGER update_completion_count_trigger
    AFTER UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_completion_count();