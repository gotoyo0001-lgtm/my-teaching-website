'use client';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GuardianCheckPage() {
  const { user, profile, isLoading } = useAuth();
  const permissions = usePermissions();
  const router = useRouter();
  const [clickTest, setClickTest] = useState('未测试');
  const [navigationTest, setNavigationTest] = useState('未测试');
  const [eventDetails, setEventDetails] = useState<any[]>([]);

  // 记录所有事件详情
  const logEvent = (type: string, details: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventDetails(prev => [...prev.slice(-9), { timestamp, type, details }]);
  };

  useEffect(() => {
    logEvent('页面加载', { 
      isLoading, 
      hasUser: !!user, 
      hasProfile: !!profile,
      role: profile?.role 
    });
  }, [isLoading, user, profile]);

  const testBasicClick = () => {
    try {
      setClickTest('✅ 基础点击事件正常');
      logEvent('基础点击测试', '成功');
    } catch (err) {
      setClickTest(`❌ 基础点击失败: ${err}`);
      logEvent('基础点击测试', `失败: ${err}`);
    }
  };

  const testNavigation = () => {
    try {
      logEvent('导航测试开始', '/admin');
      router.push('/admin');
      setNavigationTest('✅ 导航功能正常');
    } catch (err) {
      setNavigationTest(`❌ 导航失败: ${err}`);
      logEvent('导航测试', `失败: ${err}`);
    }
  };

  const testLinkClick = (href: string, label: string) => {
    logEvent('链接点击测试', { href, label, timestamp: new Date().toISOString() });
    console.log(`🔗 测试链接点击: ${label} -> ${href}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>正在检查守护者权限...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🛡️ 守护者权限诊断工具</h1>
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 认证状态 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-400">👤 认证状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>用户登录:</strong> {user ? '✅ 已登录' : '❌ 未登录'}
            </div>
            <div>
              <strong>用户邮箱:</strong> {user?.email || '无'}
            </div>
            <div>
              <strong>档案加载:</strong> {profile ? '✅ 已加载' : '❌ 未加载'}
            </div>
            <div>
              <strong>用户角色:</strong> {profile?.role || '无'}
            </div>
            <div>
              <strong>显示名称:</strong> {profile?.display_name || '无'}
            </div>
            <div>
              <strong>用户名:</strong> {profile?.username || '无'}
            </div>
          </div>
        </div>

        {/* 权限检查 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">🔐 权限检查</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {Object.entries(permissions).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className={value ? 'text-green-400' : 'text-red-400'}>
                  {value ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 功能测试 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">🧪 功能测试</h2>
          <div className="space-y-4">
            <div>
              <button 
                onClick={testBasicClick}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-4"
              >
                测试基础点击事件
              </button>
              <span>{clickTest}</span>
            </div>
            
            <div>
              <button 
                onClick={testNavigation}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-4"
              >
                测试导航功能
              </button>
              <span>{navigationTest}</span>
            </div>
          </div>
        </div>

        {/* 模拟导航链接测试 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-purple-400">🔗 导航链接测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/admin', label: '管理控制台' },
              { href: '/admin/users', label: '用户管理' },
              { href: '/admin/oracles', label: '神谕管理' },
              { href: '/admin/observatory', label: '观星台' },
              { href: '/my-constellation', label: '我的星座' },
              { href: '/constellation', label: '知识星图' }
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => testLinkClick(href, label)}
                className="block bg-blue-600 hover:bg-blue-700 text-center py-3 px-4 rounded transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* 事件日志 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-orange-400">📝 事件日志</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {eventDetails.length === 0 ? (
              <p className="text-gray-400">暂无事件记录</p>
            ) : (
              eventDetails.map((event, index) => (
                <div key={index} className="text-xs bg-gray-700 p-2 rounded">
                  <strong>{event.timestamp}</strong> - {event.type}: {' '}
                  <span className="text-gray-300">
                    {typeof event.details === 'object' 
                      ? JSON.stringify(event.details) 
                      : event.details}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 环境和浏览器测试 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">🌐 环境和浏览器测试</h2>
          <div className="space-y-4">
            <div>
              <button 
                onClick={() => {
                  console.log('🧪 Console测试消息:', new Date().toISOString());
                  alert('控制台测试完成，请检查浏览器开发者工具');
                }}
                className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded mr-4"
              >
                测试浏览器控制台
              </button>
              <span className="text-gray-400">检查控制台输出功能</span>
            </div>
            
            <div>
              <button 
                onClick={() => {
                  const isSecure = window.location.protocol === 'https:';
                  const isDev = process.env.NODE_ENV === 'development';
                  const hasLocalStorage = typeof Storage !== 'undefined';
                  
                  console.log('🔍 环境检查结果:', {
                    isSecure,
                    isDev,
                    hasLocalStorage,
                    origin: window.location.origin,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                  });
                  
                  alert(`环境检查完成:\n安全连接: ${isSecure}\n开发模式: ${isDev}\n存储可用: ${hasLocalStorage}`);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded mr-4"
              >
                环境检查
              </button>
              <span className="text-gray-400">验证运行环境</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-400">🌐 浏览器信息</h2>
          <div className="text-sm space-y-2">
            <div><strong>用户代理:</strong> {navigator.userAgent}</div>
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Referrer:</strong> {document.referrer || '无'}</div>
            <div><strong>Cookie:</strong> {document.cookie ? '已启用' : '已禁用'}</div>
            <div><strong>Local Storage:</strong> {localStorage ? '可用' : '不可用'}</div>
          </div>
        </div>

        {/* 实际链接测试 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-indigo-400">🔗 实际管理链接测试</h2>
          <p className="text-gray-400 mb-4">这些是实际的管理功能链接，应该与导航栏中的链接行为一致。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin"
              onClick={() => logEvent('管理控制台链接点击', '/admin')}
              className="block bg-red-600 hover:bg-red-700 text-center py-4 px-6 rounded transition-colors"
            >
              🛡️ 管理控制台
            </Link>
            
            <Link
              href="/admin/users"
              onClick={() => logEvent('用户管理链接点击', '/admin/users')}
              className="block bg-blue-600 hover:bg-blue-700 text-center py-4 px-6 rounded transition-colors"
            >
              👥 用户管理
            </Link>
            
            <Link
              href="/admin/oracles"
              onClick={() => logEvent('神谕管理链接点击', '/admin/oracles')}
              className="block bg-green-600 hover:bg-green-700 text-center py-4 px-6 rounded transition-colors"
            >
              📢 神谕管理
            </Link>
            
            <Link
              href="/admin/observatory"
              onClick={() => logEvent('观星台链接点击', '/admin/observatory')}
              className="block bg-purple-600 hover:bg-purple-700 text-center py-4 px-6 rounded transition-colors"
            >
              🔭 观星台
            </Link>
            
            <Link
              href="/my-constellation"
              onClick={() => logEvent('我的星座链接点击', '/my-constellation')}
              className="block bg-yellow-600 hover:bg-yellow-700 text-center py-4 px-6 rounded transition-colors"
            >
              ⭐ 我的星座
            </Link>
            
            <Link
              href="/constellation"
              onClick={() => logEvent('知识星图链接点击', '/constellation')}
              className="block bg-indigo-600 hover:bg-indigo-700 text-center py-4 px-6 rounded transition-colors"
            >
              🗺️ 知识星图
            </Link>
          </div>
        </div>
        <div className="text-center">
          <Link 
            href="/admin" 
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded inline-block"
          >
            返回管理控制台
          </Link>
        </div>
      </div>
    </div>
  );
}