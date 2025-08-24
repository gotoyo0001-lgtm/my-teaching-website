'use client';

// app/course/[id]/page.tsx - 恒星详情页面
// 遥行者深入探索知识恒星的核心体验

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, usePermissions } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import CommentSection from '@/components/CommentSection';
import type { Database } from '@/lib/database.types.js';

type Course = Database['public']['Tables']['courses']['Row'] & {
  creator: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
  lessons: {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    estimated_duration: number | null;
  }[];
};

type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { canEnrollCourse } = usePermissions();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载课程详情
  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            creator:profiles!creator_id(
              username,
              display_name,
              avatar_url,
              bio
            ),
            lessons(
              id,
              title,
              description,
              order_index,
              estimated_duration
            )
          `)
          .eq('id', params.id)
          .eq('status', 'published')
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('恒星不存在或尚未启明');
          return;
        }

        setCourse(data as Course);

        // 如果用户已登录，检查是否已报名
        if (user) {
          const { data: enrollmentData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('voyager_id', user.id)
            .eq('course_id', params.id)
            .single();

          setEnrollment(enrollmentData);
        }
      } catch (error) {
        console.error('加载课程详情失败:', error);
        setError('加载恒星信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseDetail();
  }, [params.id, user]);

  // 处理报名
  const handleEnrollment = async () => {
    if (!user || !course) return;

    setIsEnrolling(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          voyager_id: user.id,
          course_id: course.id,
          status: 'exploring',
          progress_percentage: 0,
          enrolled_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setEnrollment(data);
      
      // 更新课程报名人数
      await supabase
        .from('courses')
        .update({ enrollment_count: (course.enrollment_count || 0) + 1 })
        .eq('id', course.id);

    } catch (error) {
      console.error('报名失败:', error);
      setError('加入远征失败，请重试');
    } finally {
      setIsEnrolling(false);
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在连接恒星...</span>
      </div>
    );
  }

  // 错误状态
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-cosmic-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-cosmic-light mb-2">恒星不可达</h3>
          <p className="text-cosmic-light/60 mb-6">{error || '这颗恒星似乎已经黯淡了...'}</p>
          <Link href="/constellation" className="cosmic-button">
            返回星图
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
      {/* 导航栏 */}
      <nav className="cosmic-glass m-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/constellation" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-xl font-bold text-cosmic-star">返回星图</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* 恒星头部信息 */}
        <div className="cosmic-glass p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 恒星基本信息 */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-cosmic-star mb-2">{course.title}</h1>
                  <p className="text-cosmic-light/70 text-lg leading-relaxed">
                    {course.description || '这颗恒星还没有添加描述...'}
                  </p>
                </div>
              </div>

              {/* 恒星属性 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cosmic-warm mb-1">
                    {Math.floor((course.estimated_duration || 0) / 60)}h
                  </div>
                  <div className="text-cosmic-light/60 text-sm">预估时长</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cosmic-accent mb-1">
                    {course.difficulty_level || 1}
                  </div>
                  <div className="text-cosmic-light/60 text-sm">难度等级</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cosmic-energy mb-1">
                    {course.enrollment_count || 0}
                  </div>
                  <div className="text-cosmic-light/60 text-sm">遥行者</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cosmic-success mb-1">
                    {course.lessons?.length || 0}
                  </div>
                  <div className="text-cosmic-light/60 text-sm">知识节点</div>
                </div>
              </div>

              {/* 标签 */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cosmic-accent/20 text-cosmic-accent rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 操作面板 */}
            <div className="lg:col-span-1">
              <div className="cosmic-glass p-6">
                {/* 启明者信息 */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full flex items-center justify-center">
                    {course.creator.avatar_url ? (
                      <img 
                        src={course.creator.avatar_url} 
                        alt={course.creator.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {course.creator.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-cosmic-star">
                      {course.creator.display_name || course.creator.username}
                    </div>
                    <div className="text-cosmic-light/60 text-sm">启明者</div>
                  </div>
                </div>

                {/* 报名/继续学习按钮 */}
                {user ? (
                  enrollment ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-cosmic-success/20 rounded-lg">
                        <div className="text-cosmic-success font-semibold mb-2">
                          ✨ 已加入远征
                        </div>
                        <div className="text-cosmic-light/70 text-sm">
                          进度: {Math.round(enrollment.progress_percentage || 0)}%
                        </div>
                      </div>
                      <Link 
                        href={`/course/${course.id}/learn`}
                        className="cosmic-button w-full text-center block"
                      >
                        继续探索 →
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnrollment}
                      disabled={isEnrolling || !canEnrollCourse}
                      className="cosmic-button w-full disabled:opacity-50"
                    >
                      {isEnrolling ? '正在加入...' : '🚀 开始远征'}
                    </button>
                  )
                ) : (
                  <Link 
                    href="/login"
                    className="cosmic-button w-full text-center block"
                  >
                    登录开始探索
                  </Link>
                )}

                {/* 课程信息 */}
                <div className="mt-6 pt-6 border-t border-cosmic-glass-medium">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cosmic-light/60">分类</span>
                      <span className="text-cosmic-light">{course.category || '未分类'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cosmic-light/60">创建时间</span>
                      <span className="text-cosmic-light">
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cosmic-light/60">更新时间</span>
                      <span className="text-cosmic-light">
                        {new Date(course.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 学习目标 */}
        {course.objectives && course.objectives.length > 0 && (
          <div className="cosmic-glass p-8 mb-8">
            <h2 className="text-2xl font-bold text-cosmic-star mb-6">🎯 探索目标</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.objectives.map((objective, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cosmic-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-cosmic-accent text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-cosmic-light">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 课程内容 */}
        <div className="cosmic-glass p-8 mb-8">
          <h2 className="text-2xl font-bold text-cosmic-star mb-6">📚 知识矿藏</h2>
          
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-4">
              {course.lessons
                .sort((a, b) => a.order_index - b.order_index)
                .map((lesson, index) => (
                  <div key={lesson.id} className="cosmic-glass p-6 hover:bg-cosmic-glass-medium transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-cosmic-accent/20 rounded-full flex items-center justify-center">
                          <span className="text-cosmic-accent font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-cosmic-star">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-cosmic-light/70 text-sm mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-cosmic-light/60 text-sm">
                        {lesson.estimated_duration ? `${lesson.estimated_duration}分钟` : ''}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cosmic-glass-light rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-cosmic-light/60">这颗恒星的知识内容正在孕育中...</p>
            </div>
          )}
        </div>

        {/* 评论区域 */}
        <CommentSection courseId={course.id} />
      </div>
    </div>
  );
}