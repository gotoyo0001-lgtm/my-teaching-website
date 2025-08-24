'use client';

// app/my-constellation/page.tsx - 个人星座图
// 遥行者查看自己学习历程的仪表板

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type Enrollment = Database['public']['Tables']['enrollments']['Row'] & {
  course: {
    id: string;
    title: string;
    estimated_duration: number | null;
  } | null;
};

export default function MyConstellationPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    averageProgress: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('⚠️ 我的星座: 用户未登录，重定向到登录页');
      router.push('/login?redirectedFrom=/my-constellation');
    }
  }, [user, isLoading, router]);

  // 加载学习统计数据 - 优化性能和错误处理
  useEffect(() => {
    const loadStats = async () => {
      if (!user || !profile) {
        console.log('⚠️ 我的星座: 等待用户认证完成');
        return;
      }

      try {
        setError(null);
        console.log('🔄 开始加载学习统计数据...');
        
        // 获取所有报名记录
        const { data: enrollmentData, error } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(
              id,
              title,
              estimated_duration
            )
          `)
          .eq('voyager_id', user.id);

        if (error) {
          console.error('加载学习统计失败:', error);
          setError('加载学习数据失败，请刷新页面重试');
          return;
        }

        setEnrollments(enrollmentData || []);
        console.log('✅ 学习数据加载成功:', enrollmentData?.length || 0, '门课程');

        // 计算统计数据
        const totalEnrollments = enrollmentData?.length || 0;
        const completedCourses = enrollmentData?.filter((e: any) => e.status === 'completed').length || 0;
        const totalProgress = enrollmentData?.reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) || 0;
        const averageProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;
        const totalStudyTime = enrollmentData?.reduce((sum: number, e: any) => {
          const duration = e.course?.estimated_duration || 0;
          const progress = (e.progress_percentage || 0) / 100;
          return sum + (duration * progress);
        }, 0) || 0;

        setStats({
          totalEnrollments,
          completedCourses,
          totalStudyTime: Math.round(totalStudyTime / 60), // 转换为小时
          averageProgress
        });
        
        console.log('✅ 统计数据计算完成:', {
          totalEnrollments,
          completedCourses,
          totalStudyTime: Math.round(totalStudyTime / 60),
          averageProgress
        });
      } catch (error) {
        console.error('加载统计数据时发生错误:', error);
        setError('加载统计数据失败，请刷新页面重试');
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [user, profile]);

  if (isLoading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-void">
        <div className="text-center">
          <div className="cosmic-loading mb-4"></div>
          <span className="text-cosmic-light">正在连接你的星座...</span>
          <div className="text-cosmic-light/60 text-sm mt-2">
            {!user ? '验证身份...' : !profile ? '加载用户档案...' : '初始化星座...'}
          </div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-void">
        <div className="text-center max-w-md">
          <div className="text-cosmic-danger text-xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-cosmic-danger mb-4">加载失败</h2>
          <p className="text-cosmic-light mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="cosmic-button"
          >
            刷新页面
          </button>
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
                <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-cosmic-star">我的星座</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/constellation" 
                className="text-cosmic-light hover:text-cosmic-accent transition-colors cursor-pointer"
              >
                返回星图
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        {/* 用户信息卡片 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-voyager to-cosmic-accent rounded-full flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-cosmic-star">
                {profile?.display_name || profile?.username || '匿名遥行者'}
              </h1>
              <p className="text-cosmic-accent">遥行者</p>
              {profile?.voyager_manifesto && (
                <p className="text-cosmic-light/70 text-sm mt-1 max-w-md">
                  {profile.voyager_manifesto}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-accent mb-2">
              {isLoadingStats ? '-' : stats.totalEnrollments}
            </div>
            <div className="text-cosmic-light/70">已加入的远征</div>
          </div>
          
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-success mb-2">
              {isLoadingStats ? '-' : stats.completedCourses}
            </div>
            <div className="text-cosmic-light/70">完成的恒星</div>
          </div>
          
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-warm mb-2">
              {isLoadingStats ? '-' : `${stats.totalStudyTime}h`}
            </div>
            <div className="text-cosmic-light/70">总学习时间</div>
          </div>
          
          <div className="cosmic-glass p-6 text-center">
            <div className="text-3xl font-bold text-cosmic-energy mb-2">
              {isLoadingStats ? '-' : `${stats.averageProgress}%`}
            </div>
            <div className="text-cosmic-light/70">平均进度</div>
          </div>
        </div>

        {/* 学习记录 */}
        {enrollments.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cosmic-star mb-6">我的星际航行记录</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="cosmic-glass group hover:scale-105 transition-all duration-300">
                  <div className="p-6">
                    {/* 课程标题 */}
                    <h3 className="text-lg font-semibold text-cosmic-star mb-3 group-hover:text-cosmic-accent transition-colors">
                      {enrollment.course?.title || '未知恒星'}
                    </h3>
                    
                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-cosmic-light/70">学习进度</span>
                        <span className="text-sm font-medium text-cosmic-accent">
                          {Math.round(enrollment.progress_percentage || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-cosmic-glass-light rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cosmic-accent to-cosmic-energy h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progress_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* 状态标签 */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'completed' 
                          ? 'bg-cosmic-success/20 text-cosmic-success'
                          : enrollment.status === 'exploring'
                          ? 'bg-cosmic-accent/20 text-cosmic-accent'
                          : 'bg-cosmic-light/20 text-cosmic-light'
                      }`}>
                        {enrollment.status === 'completed' ? '已完成' : 
                         enrollment.status === 'exploring' ? '学习中' : '已报名'}
                      </span>
                      
                      <div className="text-xs text-cosmic-light/50">
                        {new Date(enrollment.started_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <Link 
                        href={`/course/${enrollment.course?.id}`}
                        className="flex-1 px-4 py-2 bg-cosmic-accent/20 text-cosmic-accent rounded-lg text-center text-sm font-medium hover:bg-cosmic-accent/30 transition-colors"
                      >
                        查看详情
                      </Link>
                      
                      {enrollment.status !== 'completed' && (
                        <Link 
                          href={`/course/${enrollment.course?.id}/learn`}
                          className="flex-1 px-4 py-2 bg-cosmic-energy/20 text-cosmic-energy rounded-lg text-center text-sm font-medium hover:bg-cosmic-energy/30 transition-colors"
                        >
                          继续学习
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 空状态 - 还没有开始学习 */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cosmic-light mb-2">还没有开始任何远征</h3>
            <p className="text-cosmic-light/60 mb-6">
              前往知识星图，开始你的第一次星际旅行吧！
            </p>
            <Link href="/constellation" className="cosmic-button">
              探索星图
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}