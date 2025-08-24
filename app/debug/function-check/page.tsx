'use client';

// app/debug/function-check/page.tsx - 功能响应诊断工具
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function FunctionCheck() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const [checks, setChecks] = useState<{
    authContext: string;
    jsErrors: string[];
    clickEvents: string;
    navigation: string;
    permissions: string;
  }>({
    authContext: '检查中...',
    jsErrors: [],
    clickEvents: '检查中...',
    navigation: '检查中...',
    permissions: '检查中...'
  });

  useEffect(() => {
    runDiagnostics();
    
    // 监听JavaScript错误
    const errorHandler = (event: ErrorEvent) => {
      setChecks(prev => ({
        ...prev,
        jsErrors: [...prev.jsErrors, `${event.error?.message || event.message} (${event.filename}:${event.lineno})`]
      }));
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [user, profile]);

  const runDiagnostics = () => {
    // 1. 检查认证上下文
    if (isLoading) {
      setChecks(prev => ({ ...prev, authContext: '⏳ 正在加载认证状态...' }));
    } else if (!user) {
      setChecks(prev => ({ ...prev, authContext: '❌ 用户未登录' }));
    } else if (!profile) {
      setChecks(prev => ({ ...prev, authContext: '⚠️ 用户已登录但档案缺失' }));
    } else {
      setChecks(prev => ({ 
        ...prev, 
        authContext: `✅ 认证正常 - ${profile.display_name} (${profile.role})` 
      }));
    }

    // 2. 检查点击事件
    try {
      const testButton = document.createElement('button');
      testButton.addEventListener('click', () => {});
      setChecks(prev => ({ ...prev, clickEvents: '✅ 事件监听器正常' }));
    } catch (err) {
      setChecks(prev => ({ ...prev, clickEvents: `❌ 事件监听器错误: ${err}` }));
    }

    // 3. 检查导航功能
    try {
      if (router) {
        setChecks(prev => ({ ...prev, navigation: '✅ Next.js Router 可用' }));
      } else {
        setChecks(prev => ({ ...prev, navigation: '❌ Next.js Router 不可用' }));
      }
    } catch (err) {
      setChecks(prev => ({ ...prev, navigation: `❌ 导航错误: ${err}` }));
    }

    // 4. 检查权限
    if (profile?.role === 'guardian') {
      setChecks(prev => ({ ...prev, permissions: '✅ 守护者权限确认' }));
    } else {
      setChecks(prev => ({ ...prev, permissions: `⚠️ 当前角色: ${profile?.role || '未知'}` }));
    }
  };

  const testNavigation = () => {
    try {
      console.log('测试导航到管理页面...');
      router.push('/admin');
    } catch (err) {
      console.error('导航测试失败:', err);
    }
  };

  const testConsoleLog = () => {
    console.log('控制台测试消息:', new Date().toISOString());
    console.log('用户信息:', { user: user?.email, profile: profile?.username });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 功能响应诊断工具</h1>
      
      <div className="space-y-6 max-w-4xl">
        {/* 认证状态 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">👤 认证状态</h3>
          <p>{checks.authContext}</p>
          {user && (
            <div className="mt-2 text-sm text-gray-300">
              <div>用户ID: {user.id}</div>
              <div>邮箱: {user.email}</div>
              {profile && (
                <>
                  <div>用户名: {profile.username}</div>
                  <div>角色: {profile.role}</div>
                  <div>显示名: {profile.display_name}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* JavaScript错误检查 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">🐛 JavaScript 错误</h3>
          {checks.jsErrors.length === 0 ? (
            <p className="text-green-400">✅ 无 JavaScript 错误</p>
          ) : (
            <div className="space-y-2">
              {checks.jsErrors.map((error, index) => (
                <div key={index} className="text-red-400 text-sm font-mono bg-red-900/20 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 点击事件测试 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">🖱️ 点击事件测试</h3>
          <p className="mb-4">{checks.clickEvents}</p>
          
          <div className="space-x-4">
            <button 
              onClick={testConsoleLog}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              测试控制台输出
            </button>
            
            <button 
              onClick={testNavigation}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
            >
              测试导航功能
            </button>
            
            <button 
              onClick={() => alert('按钮点击测试成功！')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
            >
              测试弹窗
            </button>
          </div>
        </div>

        {/* 导航状态 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">🧭 导航状态</h3>
          <p>{checks.navigation}</p>
        </div>

        {/* 权限检查 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">🔐 权限检查</h3>
          <p>{checks.permissions}</p>
        </div>

        {/* 浏览器信息 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">🌐 浏览器信息</h3>
          <div className="text-sm text-gray-300 space-y-1">
            {typeof window !== 'undefined' && navigator ? (
              <>
                <div>用户代理: {navigator.userAgent}</div>
                <div>语言: {navigator.language}</div>
                <div>在线状态: {navigator.onLine ? '✅ 在线' : '❌ 离线'}</div>
                <div>JavaScript 启用: ✅ 是</div>
                <div>本地存储: {typeof localStorage !== 'undefined' ? '✅ 可用' : '❌ 不可用'}</div>
              </>
            ) : (
              <div>⏳ 正在加载浏览器信息...</div>
            )}
          </div>
        </div>

        {/* 修复建议 */}
        <div className="bg-blue-900 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">💡 修复建议</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>如果点击无响应，请检查浏览器控制台是否有错误</li>
            <li>尝试硬刷新页面 (Ctrl+Shift+R)</li>
            <li>清除浏览器缓存和 Cookie</li>
            <li>禁用浏览器扩展并重试</li>
            <li>检查网络连接状态</li>
            <li>确认 JavaScript 已启用</li>
          </ul>
        </div>

        {/* 快速链接测试 */}
        <div className="bg-gray-800 p-6 rounded">
          <h3 className="text-xl font-bold mb-3">🔗 快速链接测试</h3>
          <div className="space-x-4">
            <a href="/admin" className="text-blue-400 hover:underline">普通链接到管理页</a>
            <a href="/debug/quick-check" className="text-green-400 hover:underline">诊断页面</a>
            <a href="/" className="text-purple-400 hover:underline">首页</a>
          </div>
        </div>
      </div>
    </div>
  );
}