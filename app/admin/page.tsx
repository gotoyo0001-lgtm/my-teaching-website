'use client';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, profile, isLoading } = useAuth();
  const { canManageUsers, canCreateOracle, canManageCategories, canViewAnalytics } = usePermissions();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeDiscussions: 0
  });

  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== 'guardian')) {
      router.push('/');
    }
  }, [profile, isLoading, router]);

  useEffect(() => {
    // 載入統計數據
    loadStats();
  }, []);

  const loadStats = async () => {
    // 這裡會從 API 載入統計數據
    // 暫時使用模擬數據
    setStats({
      totalUsers: 156,
      totalCourses: 23,
      totalEnrollments: 312,
      activeDiscussions: 45
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在載入守護者控制台...</span>
      </div>
    );
  }

  if (!profile || profile.role !== 'guardian') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">訪問被拒絕</h1>
          <p className="text-cosmic-light mb-6">只有守護者可以訪問此頁面</p>
          <Link href="/" className="cosmic-button">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const managementCards = [
    {
      title: '用戶管理',
      description: '管理所有用戶、角色提升和權限設置',
      icon: '👥',
      href: '/admin/users',
      permission: canManageUsers,
      stats: `${stats.totalUsers} 位用戶`
    },
    {
      title: '神諭管理',
      description: '發布系統公告、重要通知和指導信息',
      icon: '📢',
      href: '/admin/oracles',
      permission: canCreateOracle,
      stats: '管理系統公告'
    },
    {
      title: '分類管理',
      description: '管理課程分類體系和知識星座結構',
      icon: '📁',
      href: '/admin/categories',
      permission: canManageCategories,
      stats: '管理知識分類'
    },
    {
      title: '系統統計',
      description: '查看平台數據分析和使用情況報告',
      icon: '📊',
      href: '/admin/analytics',
      permission: canViewAnalytics,
      stats: `${stats.totalCourses} 門課程`
    },
    {
      title: '課程管理',
      description: '管理所有課程內容和審核狀態',
      icon: '📚',
      href: '/admin/courses',
      permission: true,
      stats: `${stats.totalEnrollments} 次報名`
    },
    {
      title: '討論管理',
      description: '管理社群討論、評論和互動內容',
      icon: '💬',
      href: '/admin/discussions',
      permission: true,
      stats: `${stats.activeDiscussions} 個活躍討論`
    },
    {
      title: '安全策略管理',
      description: '監控 RLS 策略、管理用戶角色和系統安全狀態',
      icon: '🔐',
      href: '/admin/security',
      permission: true,
      stats: '企業級安全保護'
    },
    {
      title: '守護者測試工具',
      description: '完整的功能驗證和診斷工具',
      icon: '🧪',
      href: '/admin/guardian-test',
      permission: true,
      stats: '功能完整性驗證'
    }
  ];

  return (
    <div className="min-h-screen bg-cosmic-void">
      {/* 背景星雲效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cosmic-energy/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* 頁首 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cosmic-star mb-2">
                守護者控制台
              </h1>
              <p className="text-cosmic-light/70">
                歡迎，{profile.display_name || profile.username}。管理知識宇宙的平衡與秩序。
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-cosmic-light/60">當前時間</div>
              <div className="text-cosmic-light font-mono">
                {new Date().toLocaleString('zh-TW')}
              </div>
            </div>
          </div>
        </div>

        {/* 快速統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cosmic-star">{stats.totalUsers}</div>
                <div className="text-cosmic-light/70">總用戶數</div>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cosmic-star">{stats.totalCourses}</div>
                <div className="text-cosmic-light/70">總課程數</div>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cosmic-star">{stats.totalEnrollments}</div>
                <div className="text-cosmic-light/70">總報名數</div>
              </div>
              <div className="text-3xl">🎓</div>
            </div>
          </div>
          <div className="cosmic-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cosmic-star">{stats.activeDiscussions}</div>
                <div className="text-cosmic-light/70">活躍討論</div>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </div>
        </div>

        {/* 管理功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className={`cosmic-glass p-6 hover:scale-105 transition-all duration-300 group ${
                !card.permission ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cosmic-accent/5'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <div className="text-xs text-cosmic-light/60 bg-cosmic-accent/20 px-2 py-1 rounded">
                  {card.stats}
                </div>
              </div>
              <h3 className="text-xl font-bold text-cosmic-star mb-2 group-hover:text-cosmic-accent transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-cosmic-light/70 text-sm">
                {card.description}
              </p>
              {!card.permission && (
                <div className="mt-2 text-xs text-cosmic-danger">
                  權限不足
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* 快速操作區域 */}
        <div className="mt-8 cosmic-glass p-6">
          <h2 className="text-xl font-bold text-cosmic-star mb-4">快速操作</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users/promote" className="cosmic-button bg-cosmic-accent text-white">
              提升用戶角色
            </Link>
            <Link href="/admin/oracles/create" className="cosmic-button bg-cosmic-energy text-white">
              發布神諭
            </Link>
            <Link href="/admin/categories/create" className="cosmic-button bg-cosmic-success text-white">
              新增分類
            </Link>
            <Link href="/admin/analytics/reports" className="cosmic-button bg-cosmic-info text-white">
              生成報告
            </Link>
          </div>
        </div>

        {/* 近期活動 */}
        <div className="mt-8 cosmic-glass p-6">
          <h2 className="text-xl font-bold text-cosmic-star mb-4">近期活動</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-cosmic-accent/20">
              <div>
                <div className="text-cosmic-light font-medium">新用戶註冊</div>
                <div className="text-cosmic-light/60 text-sm">3 位新遥行者加入宇宙</div>
              </div>
              <div className="text-cosmic-light/60 text-sm">2 小時前</div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cosmic-accent/20">
              <div>
                <div className="text-cosmic-light font-medium">新課程發布</div>
                <div className="text-cosmic-light/60 text-sm">啟明者發布了新課程</div>
              </div>
              <div className="text-cosmic-light/60 text-sm">5 小時前</div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-cosmic-light font-medium">系統維護</div>
                <div className="text-cosmic-light/60 text-sm">數據庫優化完成</div>
              </div>
              <div className="text-cosmic-light/60 text-sm">1 天前</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}