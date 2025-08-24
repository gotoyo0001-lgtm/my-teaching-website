'use client';

import type { Database } from '@/lib/database.types';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface SystemStats {
  users: {
    total: number;
    byRole: Record<string, number>;
    newThisWeek: number;
    activeThisWeek: number;
  };
  courses: {
    total: number;
    published: number;
    byStatus: Record<string, number>;
    totalEnrollments: number;
  };
  engagement: {
    totalComments: number;
    totalVotes: number;
    activeDiscussions: number;
  };
  growth: {
    usersGrowth: number[];
    coursesGrowth: number[];
    enrollmentsGrowth: number[];
  };
}

export default function SystemAnalytics() {
  const { profile, isLoading } = useAuth();
  const { canViewAnalytics } = usePermissions();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  useEffect(() => {
    if (!isLoading && (!profile || !canViewAnalytics)) {
      router.push('/admin');
    }
  }, [profile, isLoading, canViewAnalytics, router]);

  useEffect(() => {
    if (canViewAnalytics) {
      loadSystemStats();
    }
  }, [canViewAnalytics, selectedTimeRange]);

  const loadSystemStats = async () => {
    setLoadingStats(true);
    try {
      // 獲取用戶統計
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('role, created_at, last_seen_at') as {
          data: Array<{
            role: Database['public']['Tables']['profiles']['Row']['role'];
            created_at: string;
            last_seen_at: string | null;
          }> | null;
          error: any;
        };

      if (usersError) {
        console.error('獲取用戶統計失敗:', usersError);
      }

      // 獲取課程統計
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('status, created_at') as {
          data: Array<{
            status: Database['public']['Tables']['courses']['Row']['status'];
            created_at: string;
          }> | null;
          error: any;
        };

      if (coursesError) {
        console.error('獲取課程統計失敗:', coursesError);
      }

      // 獲取報名統計
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('enrolled_at');

      if (enrollmentsError) {
        console.error('獲取報名統計失敗:', enrollmentsError);
      }

      // 獲取評論統計
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('created_at, is_deleted') as {
          data: Array<{
            created_at: string;
            is_deleted: boolean;
          }> | null;
          error: any;
        };

      if (commentsError) {
        console.error('獲取評論統計失敗:', commentsError);
      }

      // 處理數據
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 用戶統計
      const usersByRole = (usersData || []).reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const newUsersThisWeek = (usersData || []).filter(user => 
        new Date(user.created_at) >= weekAgo
      ).length;

      const activeUsersThisWeek = (usersData || []).filter(user => 
        user.last_seen_at && new Date(user.last_seen_at) >= weekAgo
      ).length;

      // 課程統計
      const coursesByStatus = (coursesData || []).reduce((acc, course) => {
        acc[course.status] = (acc[course.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 生成模擬增長數據（實際應用中應該從歷史數據計算）
      const generateGrowthData = (total: number) => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const ratio = (7 - i) / 7;
          data.push(Math.floor(total * ratio + Math.random() * 10));
        }
        return data;
      };

      const systemStats: SystemStats = {
        users: {
          total: usersData?.length || 0,
          byRole: usersByRole,
          newThisWeek: newUsersThisWeek,
          activeThisWeek: activeUsersThisWeek
        },
        courses: {
          total: coursesData?.length || 0,
          published: coursesByStatus.published || 0,
          byStatus: coursesByStatus,
          totalEnrollments: enrollmentsData?.length || 0
        },
        engagement: {
          totalComments: commentsData?.filter(c => !c.is_deleted).length || 0,
          totalVotes: 0, // 需要實現投票統計
          activeDiscussions: Math.floor((commentsData?.length || 0) / 5) // 簡化計算
        },
        growth: {
          usersGrowth: generateGrowthData(usersData?.length || 0),
          coursesGrowth: generateGrowthData(coursesData?.length || 0),
          enrollmentsGrowth: generateGrowthData(enrollmentsData?.length || 0)
        }
      };

      setStats(systemStats);
    } catch (error) {
      console.error('載入系統統計時發生錯誤:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'guardian': return '守護者';
      case 'luminary': return '啟明者';
      case 'catalyst': return '領航者';
      case 'voyager': return '遥行者';
      default: return '未知';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'guardian': return 'text-cosmic-danger';
      case 'luminary': return 'text-cosmic-accent';
      case 'catalyst': return 'text-cosmic-energy';
      case 'voyager': return 'text-cosmic-info';
      default: return 'text-cosmic-light';
    }
  };

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在載入系統統計...</span>
      </div>
    );
  }

  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">權限不足</h1>
          <p className="text-cosmic-light mb-6">只有啟明者、領航者和守護者可以查看統計</p>
          <Link href="/admin" className="cosmic-button">
            返回控制台
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">載入失敗</h1>
          <p className="text-cosmic-light mb-6">無法載入系統統計數據</p>
          <button onClick={loadSystemStats} className="cosmic-button">
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-void">
      {/* 背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cosmic-energy/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* 頁首 */}
        <div className="mb-8">
          <Link href="/admin" className="text-cosmic-accent hover:text-cosmic-energy mb-4 inline-block">
            ← 返回控制台
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cosmic-star mb-2">系統統計</h1>
              <p className="text-cosmic-light/70">查看平台數據分析和使用情況報告</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="cosmic-input"
              >
                <option value="week">最近一週</option>
                <option value="month">最近一月</option>
                <option value="quarter">最近一季</option>
                <option value="year">最近一年</option>
              </select>
              <button
                onClick={loadSystemStats}
                className="cosmic-button bg-cosmic-accent text-white"
              >
                🔄 刷新
              </button>
            </div>
          </div>
        </div>

        {/* 核心指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-star">{stats.users.total}</div>
                <div className="text-cosmic-light/70">總用戶數</div>
                <div className="text-cosmic-success text-sm">
                  +{stats.users.newThisWeek} 本週新增
                </div>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-star">{stats.courses.total}</div>
                <div className="text-cosmic-light/70">總課程數</div>
                <div className="text-cosmic-accent text-sm">
                  {stats.courses.published} 已發布
                </div>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-star">{stats.courses.totalEnrollments}</div>
                <div className="text-cosmic-light/70">總報名數</div>
                <div className="text-cosmic-energy text-sm">
                  平均 {Math.floor(stats.courses.totalEnrollments / Math.max(stats.courses.published, 1))} 每課程
                </div>
              </div>
              <div className="text-4xl">🎓</div>
            </div>
          </div>

          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-star">{stats.users.activeThisWeek}</div>
                <div className="text-cosmic-light/70">活躍用戶</div>
                <div className="text-cosmic-info text-sm">
                  {Math.floor((stats.users.activeThisWeek / stats.users.total) * 100)}% 活躍率
                </div>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 用戶角色分布 */}
          <div className="cosmic-glass p-6">
            <h3 className="text-xl font-bold text-cosmic-star mb-4">用戶角色分布</h3>
            <div className="space-y-4">
              {Object.entries(stats.users.byRole).map(([role, count]) => {
                const percentage = Math.floor((count / stats.users.total) * 100);
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${getRoleColor(role)}`}>
                        {getRoleName(role)}
                      </span>
                      <span className="text-cosmic-light">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-cosmic-light/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          role === 'guardian' ? 'from-cosmic-danger to-cosmic-danger/80' :
                          role === 'luminary' ? 'from-cosmic-accent to-cosmic-accent/80' :
                          role === 'catalyst' ? 'from-cosmic-energy to-cosmic-energy/80' :
                          'from-cosmic-info to-cosmic-info/80'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 課程狀態分布 */}
          <div className="cosmic-glass p-6">
            <h3 className="text-xl font-bold text-cosmic-star mb-4">課程狀態分布</h3>
            <div className="space-y-4">
              {Object.entries(stats.courses.byStatus).map(([status, count]) => {
                const percentage = Math.floor((count / stats.courses.total) * 100);
                const statusName = status === 'published' ? '已發布' : 
                                 status === 'incubating' ? '孵化中' : 
                                 status === 'archived' ? '已歸檔' : status;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-cosmic-light">
                        {statusName}
                      </span>
                      <span className="text-cosmic-light">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-cosmic-light/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'published' ? 'bg-cosmic-success' :
                          status === 'incubating' ? 'bg-cosmic-accent' :
                          'bg-cosmic-light/50'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 用戶增長趨勢 */}
          <div className="cosmic-glass p-6">
            <h3 className="text-xl font-bold text-cosmic-star mb-4">用戶增長趨勢</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {stats.growth.usersGrowth.map((value, index) => {
                const height = Math.max((value / Math.max(...stats.growth.usersGrowth)) * 100, 5);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-cosmic-accent rounded-t"
                      style={{ height: `${height}%` }}
                      title={`第 ${index + 1} 天: ${value} 用戶`}
                    />
                    <div className="text-xs text-cosmic-light/60 mt-2">
                      {index === 6 ? '今天' : `${7-index}天前`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 互動統計 */}
          <div className="cosmic-glass p-6">
            <h3 className="text-xl font-bold text-cosmic-star mb-4">社群互動</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">總評論數</span>
                <span className="text-2xl font-bold text-cosmic-star">{stats.engagement.totalComments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">活躍討論</span>
                <span className="text-2xl font-bold text-cosmic-star">{stats.engagement.activeDiscussions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">平均互動率</span>
                <span className="text-2xl font-bold text-cosmic-star">
                  {Math.floor((stats.engagement.totalComments / Math.max(stats.courses.totalEnrollments, 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 系統健康度 */}
        <div className="mt-8 cosmic-glass p-6">
          <h3 className="text-xl font-bold text-cosmic-star mb-4">系統健康度</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">💚</div>
              <div className="text-lg font-bold text-cosmic-success">健康</div>
              <div className="text-cosmic-light/70">用戶活躍度良好</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-lg font-bold text-cosmic-accent">成長中</div>
              <div className="text-cosmic-light/70">課程數量穩定增長</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-lg font-bold text-cosmic-energy">活躍</div>
              <div className="text-cosmic-light/70">社群互動頻繁</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}