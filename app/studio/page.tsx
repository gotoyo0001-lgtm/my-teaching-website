'use client';

// app/studio/page.tsx - 启明者工作室
// 启明者创建和管理知识恒星的核心空间

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, usePermissions } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'];

export default function StudioPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const { canCreateCourse } = usePermissions();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // 权限检查
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!canCreateCourse) {
        router.push('/constellation');
        return;
      }
    }
  }, [user, isLoading, canCreateCourse, router]);

  // 加载用户的课程
  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('creator_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('加载课程失败:', error);
        } else {
          setCourses(data || []);
        }
      } catch (error) {
        console.error('加载课程时发生错误:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [user]);

  // 渲染加载状态
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在连接工作室...</span>
      </div>
    );
  }

  if (!canCreateCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-7V6a3 3 0 00-3-3H6a3 3 0 00-3 3v1.5M6 20.25h12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-cosmic-light mb-2">权限不足</h3>
          <p className="text-cosmic-light/60 mb-6">
            只有启明者和守护者才能访问创作工作室
          </p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/constellation" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-cosmic-star">启明者工作室</span>
              </Link>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-luminary to-cosmic-warm"></div>
                <span className="text-cosmic-light/70 text-sm">
                  {profile?.display_name || profile?.username}
                </span>
                <span className="text-luminary text-xs">启明者</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/constellation" 
                className="text-cosmic-light hover:text-cosmic-accent transition-colors"
              >
                返回星图
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-luminary via-cosmic-warm to-cosmic-energy bg-clip-text text-transparent">
              思想工作室
            </span>
          </h1>
          <p className="text-cosmic-light/70 text-lg">
            在这里孕育新的恒星，点亮宇宙的智慧之光
          </p>
        </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-luminary mb-2">{courses.length}</div>
            <div className="text-cosmic-light/70">总恒星数</div>
          </div>
          
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-success mb-2">
              {courses.filter(c => c.status === 'published').length}
            </div>
            <div className="text-cosmic-light/70">已启明</div>
          </div>
          
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-warning mb-2">
              {courses.filter(c => c.status === 'incubating').length}
            </div>
            <div className="text-cosmic-light/70">孕育中</div>
          </div>
          
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-energy mb-2">
              {courses.reduce((total, course) => total + (course.enrollment_count || 0), 0)}
            </div>
            <div className="text-cosmic-light/70">总遥行者</div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="cosmic-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-cosmic-star">我的恒星</h2>
            <Link 
              href="/studio/create" 
              className="cosmic-button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              孕育新恒星
            </Link>
          </div>
        </div>

        {/* 课程列表 */}
        {isLoadingCourses ? (
          <div className="flex justify-center items-center py-20">
            <div className="cosmic-loading"></div>
            <span className="ml-3 text-cosmic-light">正在加载你的恒星...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cosmic-light mb-2">还没有创造任何恒星</h3>
            <p className="text-cosmic-light/60 mb-6">
              开始你的第一次创作，将智慧凝聚成璀璨的知识恒星
            </p>
            <Link href="/studio/create" className="cosmic-button">
              创造第一颗恒星
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {courses.map(course => (
              <div key={course.id} className="constellation-card">
                {/* 课程状态指示器 */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'published' 
                      ? 'bg-cosmic-success/20 text-cosmic-success' 
                      : course.status === 'incubating'
                      ? 'bg-cosmic-warning/20 text-cosmic-warning'
                      : 'bg-cosmic-glass-medium text-cosmic-light/70'
                  }`}>
                    {course.status === 'published' && '✨ 已启明'}
                    {course.status === 'incubating' && '🥚 孕育中'}
                    {course.status === 'archived' && '📦 已封存'}
                  </span>
                  <div className="flex items-center space-x-1 text-cosmic-light/50 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{course.enrollment_count || 0}</span>
                  </div>
                </div>

                {/* 课程信息 */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-cosmic-star mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-cosmic-light/70 text-sm line-clamp-3">
                    {course.description || '还未添加描述...'}
                  </p>
                </div>

                {/* 课程统计 */}
                <div className="flex items-center justify-between text-cosmic-light/50 text-xs mb-4">
                  <span>分类: {course.category || '未分类'}</span>
                  <span>更新: {new Date(course.updated_at).toLocaleDateString()}</span>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-4 border-t border-cosmic-glass-medium">
                  <Link 
                    href={`/studio/edit/${course.id}`}
                    className="text-cosmic-accent hover:text-cosmic-energy text-sm font-medium transition-colors"
                  >
                    编辑 →
                  </Link>
                  <div className="flex items-center space-x-2">
                    {course.status === 'published' && (
                      <Link 
                        href={`/course/${course.id}`}
                        className="text-cosmic-success hover:text-cosmic-success/80 text-sm transition-colors"
                      >
                        预览
                      </Link>
                    )}
                    <button className="text-cosmic-light/50 hover:text-cosmic-light transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}