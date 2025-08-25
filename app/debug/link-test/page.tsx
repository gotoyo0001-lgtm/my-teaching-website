'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminTestPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const testLinks = [
    { href: '/admin', label: '管理控制台', emoji: '🛡️' },
    { href: '/admin/users', label: '用户管理', emoji: '👥' },
    { href: '/admin/oracles', label: '神谕管理', emoji: '📢' },
    { href: '/admin/observatory', label: '观星台', emoji: '🔭' },
    { href: '/my-constellation', label: '我的星座', emoji: '⭐' },
    { href: '/constellation', label: '知识星图', emoji: '🗺️' }
  ];

  const handleLinkClick = (href: string, label: string) => {
    console.log(`🔗 测试链接点击: ${label} -> ${href}`, {
      timestamp: new Date().toISOString(),
      userRole: profile?.role,
      userEmail: user?.email
    });
    
    // 手动导航测试
    router.push(href);
  };

  const handleButtonNavigation = (href: string, label: string) => {
    console.log(`🔘 按钮导航测试: ${label} -> ${href}`);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🧪 守护者链接测试页面</h1>
        
        {/* 用户信息 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">👤 当前用户信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>邮箱:</strong> {user?.email || '未登录'}</div>
            <div><strong>角色:</strong> {profile?.role || '无档案'}</div>
            <div><strong>显示名:</strong> {profile?.display_name || '无'}</div>
            <div><strong>用户名:</strong> {profile?.username || '无'}</div>
          </div>
        </div>

        {/* Link组件测试 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">🔗 Next.js Link 组件测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testLinks.map(({ href, label, emoji }) => (
              <Link
                key={href}
                href={href}
                onClick={() => console.log(`🔗 Link点击: ${label} -> ${href}`)}
                className="block bg-blue-600 hover:bg-blue-700 text-center py-3 px-4 rounded transition-colors"
              >
                {emoji} {label}
              </Link>
            ))}
          </div>
        </div>

        {/* 手动点击事件测试 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">🔘 手动点击事件测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testLinks.map(({ href, label, emoji }) => (
              <button
                key={`btn-${href}`}
                onClick={() => handleLinkClick(href, label)}
                className="bg-green-600 hover:bg-green-700 text-center py-3 px-4 rounded transition-colors"
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* 路由器测试 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">🧭 Router.push 测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testLinks.map(({ href, label, emoji }) => (
              <button
                key={`router-${href}`}
                onClick={() => handleButtonNavigation(href, label)}
                className="bg-purple-600 hover:bg-purple-700 text-center py-3 px-4 rounded transition-colors"
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* 权限检查结果 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🔐 权限状态</h2>
          <div className="text-sm space-y-2">
            <div>
              <strong>是否守护者:</strong> 
              <span className={profile?.role === 'guardian' ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
                {profile?.role === 'guardian' ? '✅ 是' : '❌ 否'}
              </span>
            </div>
            <div>
              <strong>预期可访问的页面:</strong>
              <ul className="ml-4 mt-1">
                <li>✅ 知识星图</li>
                <li>✅ 我的星座</li>
                {profile?.role === 'guardian' && (
                  <>
                    <li>✅ 管理控制台</li>
                    <li>✅ 用户管理</li>
                    <li>✅ 神谕管理</li>
                    <li>✅ 观星台</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* 返回链接 */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}