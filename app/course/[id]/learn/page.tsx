'use client';

// app/course/[id]/learn/page.tsx - 知识探索页面
// 遥行者深入恒星内部，探索知识矿藏的核心体验

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import CommentSection from '@/components/CommentSection';
import type { Database } from '@/lib/database.types.js';

type Course = Database['public']['Tables']['courses']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export default function CourseLearnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载课程和学习数据
  useEffect(() => {
    const loadLearningData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // 加载课程信息
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .eq('status', 'published')
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // 检查报名状态
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('voyager_id', user.id)
          .eq('course_id', params.id)
          .single();

        if (enrollmentError) {
          setError('您还未报名此课程');
          return;
        }
        setEnrollment(enrollmentData);

        // 加载课程内容
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', params.id)
          .order('order_index', { ascending: true });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        // 设置当前课程（第一个未完成的或第一个）
        if (lessonsData && lessonsData.length > 0) {
          const completedLessons = enrollmentData.completed_lessons || [];
          const nextLesson = lessonsData.find(lesson => !completedLessons.includes(lesson.id));
          setCurrentLesson(nextLesson || lessonsData[0]);
        }

      } catch (error) {
        console.error('加载学习数据失败:', error);
        setError('加载学习内容失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadLearningData();
  }, [params.id, user, router]);

  // 标记课程完成
  const markLessonComplete = async (lessonId: string) => {
    if (!enrollment || !currentLesson) return;

    try {
      const completedLessons = enrollment.completed_lessons || [];
      const newCompletedLessons = [...completedLessons, lessonId];
      const progressPercentage = Math.round((newCompletedLessons.length / lessons.length) * 100);

      const { error } = await supabase
        .from('enrollments')
        .update({
          completed_lessons: newCompletedLessons,
          progress_percentage: progressPercentage,
          last_accessed_at: new Date().toISOString(),
          ...(progressPercentage === 100 && {
            status: 'completed',
            completed_at: new Date().toISOString()
          })
        })
        .eq('id', enrollment.id);

      if (error) throw error;

      // 更新本地状态
      setEnrollment(prev => prev ? {
        ...prev,
        completed_lessons: newCompletedLessons,
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'completed' : prev.status
      } : null);

      // 移动到下一课
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }

    } catch (error) {
      console.error('标记课程完成失败:', error);
    }
  };

  // 更新最后访问时间
  const updateLastAccessed = async () => {
    if (!enrollment) return;

    await supabase
      .from('enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollment.id);
  };

  // 页面访问时更新最后访问时间
  useEffect(() => {
    if (enrollment) {
      updateLastAccessed();
    }
  }, [enrollment]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在进入恒星内部...</span>
      </div>
    );
  }

  // 错误状态
  if (error || !course || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-cosmic-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-cosmic-light mb-2">无法进入恒星</h3>
          <p className="text-cosmic-light/60 mb-6">{error || '访问被拒绝'}</p>
          <Link href={`/course/${params.id}`} className="cosmic-button">
            返回恒星详情
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
      {/* 学习导航栏 */}
      <nav className="cosmic-glass m-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/course/${params.id}`} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-cosmic-star">{course.title}</span>
              </Link>
            </div>

            {/* 进度指示器 */}
            <div className="flex items-center space-x-4">
              <div className="text-cosmic-light/70 text-sm">
                进度: {Math.round(enrollment.progress_percentage || 0)}%
              </div>
              <div className="w-32 h-2 bg-cosmic-glass-medium rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cosmic-accent to-cosmic-energy transition-all duration-500"
                  style={{ width: `${enrollment.progress_percentage || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 课程大纲 */}
          <div className="lg:col-span-1">
            <div className="cosmic-glass p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-cosmic-star mb-4">课程大纲</h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const isCompleted = enrollment.completed_lessons?.includes(lesson.id);
                  const isCurrent = currentLesson?.id === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        isCurrent
                          ? 'bg-cosmic-accent/20 border-2 border-cosmic-accent'
                          : isCompleted
                          ? 'bg-cosmic-success/20 text-cosmic-success'
                          : 'bg-cosmic-glass-light hover:bg-cosmic-glass-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-cosmic-success text-white'
                            : isCurrent
                            ? 'bg-cosmic-accent text-white'
                            : 'bg-cosmic-glass-medium text-cosmic-light/60'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${
                            isCurrent ? 'text-cosmic-accent' : 'text-cosmic-light'
                          }`}>
                            {lesson.title}
                          </div>
                          {lesson.estimated_duration && (
                            <div className="text-cosmic-light/50 text-xs">
                              {lesson.estimated_duration}分钟
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 学习内容 */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <>
                <div className="cosmic-glass p-8">
                  {/* 课程标题 */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-cosmic-star mb-4">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.description && (
                      <p className="text-cosmic-light/70 text-lg">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>

                  {/* 学习目标 */}
                  {currentLesson.learning_objectives && currentLesson.learning_objectives.length > 0 && (
                    <div className="mb-8 p-6 bg-cosmic-glass-light rounded-lg">
                      <h3 className="text-lg font-semibold text-cosmic-star mb-4">本节学习目标</h3>
                      <ul className="space-y-2">
                        {currentLesson.learning_objectives.map((objective, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-cosmic-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-cosmic-accent text-xs">•</span>
                            </div>
                            <span className="text-cosmic-light">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 课程内容 */}
                  <div className="mb-8">
                    {currentLesson.video_url && (
                      <div className="mb-6">
                        <div className="aspect-video bg-cosmic-deep rounded-lg overflow-hidden">
                          <video 
                            controls 
                            className="w-full h-full"
                            src={currentLesson.video_url}
                          >
                            您的浏览器不支持视频播放
                          </video>
                        </div>
                      </div>
                    )}

                    {currentLesson.audio_url && (
                      <div className="mb-6">
                        <audio controls className="w-full">
                          <source src={currentLesson.audio_url} />
                          您的浏览器不支持音频播放
                        </audio>
                      </div>
                    )}

                    {/* 文本内容 */}
                    <div className="prose prose-invert max-w-none">
                      {currentLesson.content ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: typeof currentLesson.content === 'string' 
                            ? currentLesson.content 
                            : JSON.stringify(currentLesson.content)
                        }} />
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-cosmic-glass-light rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <p className="text-cosmic-light/60">此节课内容正在完善中...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 课程操作 */}
                  <div className="flex items-center justify-between pt-8 border-t border-cosmic-glass-medium">
                    <div className="flex items-center space-x-4">
                      {lessons.findIndex(l => l.id === currentLesson.id) > 0 && (
                        <button
                          onClick={() => {
                            const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                            setCurrentLesson(lessons[currentIndex - 1]);
                          }}
                          className="px-6 py-3 bg-cosmic-glass-medium text-cosmic-light rounded-lg hover:bg-cosmic-glass-heavy transition-all duration-200"
                        >
                          ← 上一节
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      {!enrollment.completed_lessons?.includes(currentLesson.id) && (
                        <button
                          onClick={() => markLessonComplete(currentLesson.id)}
                          className="cosmic-button"
                        >
                          ✓ 标记完成
                        </button>
                      )}

                      {lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1 && (
                        <button
                          onClick={() => {
                            const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                            setCurrentLesson(lessons[currentIndex + 1]);
                          }}
                          className="cosmic-button"
                        >
                          下一节 →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 评论区域 - 针对当前课程单元 */}
                <CommentSection lessonId={currentLesson.id} className="mt-8" />
              </>
            ) : (
              <div className="cosmic-glass p-8 text-center">
                <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cosmic-light mb-2">暂无学习内容</h3>
                <p className="text-cosmic-light/60">
                  这颗恒星的知识内容正在孕育中...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}