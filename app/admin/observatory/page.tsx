'use client';

// app/admin/observatory/page.tsx - 观星台管理页面
// 守护者监控和管理系统整体状态的控制中心

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface SystemMetrics {
  activeUsers: number;
  coursesCreated: number;
  discussionsToday: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

interface ActivityLog {
  id: string;
  type: 'user_action' | 'system_event' | 'security_alert';
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export default function ObservatoryPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    coursesCreated: 0,
    discussionsToday: 0,
    systemHealth: 'good',
    lastUpdated: new Date().toISOString()
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== 'guardian')) {
      router.push('/admin');
    }
  }, [profile, isLoading, router]);

  useEffect(() => {
    if (profile?.role === 'guardian') {
      loadObservatoryData();
    }
  }, [profile]);

  const loadObservatoryData = async () => {
    setIsLoadingData(true);
    try {
      // 加载系统指标数据
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, last_seen_at')
        .order('last_seen_at', { ascending: false });

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // 计算活跃用户数 (最近24小时有活动)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const activeUsers = profilesData?.filter((p: any) => 
        p.last_seen_at && new Date(p.last_seen_at) > yesterday
      ).length || 0;

      setMetrics({
        activeUsers,
        coursesCreated: coursesData?.length || 0,
        discussionsToday: Math.floor(Math.random() * 20), // 模拟数据
        systemHealth: activeUsers > 10 ? 'excellent' : activeUsers > 5 ? 'good' : 'warning',
        lastUpdated: new Date().toISOString()
      });

      // 模拟活动日志数据
      setActivityLogs([
        {
          id: '1',
          type: 'user_action',
          description: '新用户注册: voyager_2024',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '2',
          type: 'system_event',
          description: '课程发布: "React 进阶实战"',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '3',
          type: 'security_alert',
          description: '检测到异常登录尝试',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          severity: 'warning'
        }
      ]);

    } catch (error) {
      console.error('加载观星台数据失败:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-cosmic-success';
      case 'good': return 'text-cosmic-accent';
      case 'warning': return 'text-cosmic-warn';
      case 'critical': return 'text-cosmic-danger';
      default: return 'text-cosmic-light';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '✨';
      case 'good': return '💫';
      case 'warning': return '⚠️';
      case 'critical': return '🔴';
      default: return '🌟';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-cosmic-danger bg-cosmic-danger/10';
      case 'warning': return 'text-cosmic-warn bg-cosmic-warn/10';
      case 'info': return 'text-cosmic-accent bg-cosmic-accent/10';
      default: return 'text-cosmic-light bg-cosmic-light/10';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在连接观星台...</span>
      </div>
    );
  }

  if (!profile || profile.role !== 'guardian') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">访问被拒绝</h1>
          <p className="text-cosmic-light mb-6">只有守护者可以访问观星台</p>
          <Link href="/admin" className="cosmic-button">
            返回管理控制台
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-void">
      {/* 背景星云效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cosmic-energy/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* 导航面包屑 */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/admin" className="text-cosmic-accent hover:text-cosmic-light transition-colors">
              管理控制台
            </Link>
            <span className="text-cosmic-light/50">/</span>
            <span className="text-cosmic-light">观星台</span>
          </nav>
        </div>

        {/* 页首 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cosmic-star mb-2 flex items-center">
                🔭 观星台
              </h1>
              <p className="text-cosmic-light/70">
                监控整个教学宇宙的运行状态和活动节律
              </p>
            </div>
            <div className="text-right">
              <button 
                onClick={loadObservatoryData}
                className="cosmic-button bg-cosmic-accent hover:bg-cosmic-accent/80"
                disabled={isLoadingData}
              >
                {isLoadingData ? '刷新中...' : '刷新数据'}
              </button>
            </div>
          </div>
        </div>

        {/* 系统健康状态 */}
        <div className="cosmic-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getHealthIcon(metrics.systemHealth)}</div>
              <div>
                <h3 className="text-xl font-bold text-cosmic-star">系统状态</h3>
                <p className={`text-lg font-medium ${getHealthColor(metrics.systemHealth)}`}>
                  {metrics.systemHealth === 'excellent' && '运行优秀'}
                  {metrics.systemHealth === 'good' && '运行良好'}
                  {metrics.systemHealth === 'warning' && '需要关注'}
                  {metrics.systemHealth === 'critical' && '需要紧急处理'}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-cosmic-light/60">
              最后更新: {new Date(metrics.lastUpdated).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-accent">{metrics.activeUsers}</div>
                <div className="text-cosmic-light/70">活跃用户</div>
                <div className="text-xs text-cosmic-light/50 mt-1">最近24小时</div>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-energy">{metrics.coursesCreated}</div>
                <div className="text-cosmic-light/70">新增课程</div>
                <div className="text-xs text-cosmic-light/50 mt-1">今日创建</div>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cosmic-warm">{metrics.discussionsToday}</div>
                <div className="text-cosmic-light/70">活跃讨论</div>
                <div className="text-xs text-cosmic-light/50 mt-1">今日新增</div>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </div>
        </div>

        {/* 活动日志 */}
        <div className="cosmic-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-cosmic-star">实时活动日志</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cosmic-accent rounded-full animate-pulse"></div>
              <span className="text-sm text-cosmic-light/70">实时监控</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  log.severity === 'error' ? 'border-cosmic-danger bg-cosmic-danger/5' :
                  log.severity === 'warning' ? 'border-cosmic-warn bg-cosmic-warn/5' :
                  'border-cosmic-accent bg-cosmic-accent/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.type === 'user_action' ? '用户活动' : 
                       log.type === 'system_event' ? '系统事件' : '安全警报'}
                    </span>
                    <span className="text-cosmic-light">{log.description}</span>
                  </div>
                  <span className="text-sm text-cosmic-light/60">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {activityLogs.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌟</div>
              <p className="text-cosmic-light/70">暂无活动记录</p>
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-cosmic-star mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/users" 
              className="cosmic-glass p-4 hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-cosmic-star font-medium">用户管理</div>
              </div>
            </Link>
            
            <Link 
              href="/admin/oracles" 
              className="cosmic-glass p-4 hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📢</div>
                <div className="text-cosmic-star font-medium">神谕管理</div>
              </div>
            </Link>
            
            <Link 
              href="/admin/security" 
              className="cosmic-glass p-4 hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🔐</div>
                <div className="text-cosmic-star font-medium">安全设置</div>
              </div>
            </Link>
            
            <Link 
              href="/admin/analytics" 
              className="cosmic-glass p-4 hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-cosmic-star font-medium">数据分析</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}