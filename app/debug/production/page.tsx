'use client';

// app/debug/production/page.tsx - 生产环境诊断工具
// 用于调试部署后的认证和数据库连接问题

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabaseSafe, safeAuth } from '@/lib/supabase-safe';

export default function ProductionDebugPage() {
  const { user, profile, isLoading } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
    sessionStatus: 'checking...',
    profileStatus: 'checking...',
    connectionTest: 'checking...',
    authTest: 'checking...',
    environment: '',
    timestamp: ''
  });
  const [testEmail, setTestEmail] = useState('guardian.test@voyager.com');
  const [testPassword, setTestPassword] = useState('TestPassword123!');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    runDiagnostics();
  }, [user, profile]);

  const runDiagnostics = async () => {
    const timestamp = new Date().toISOString();
    
    // 基础环境检查
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '未设置';
    const environment = process.env.NODE_ENV || '未知';

    // 会话状态检查
    let sessionStatus = '无会话';
    let profileStatus = '无档案';
    
    if (user) {
      sessionStatus = `已登录: ${user.email}`;
      if (profile) {
        profileStatus = `档案正常: ${profile.username} (${profile.role})`;
      } else {
        profileStatus = '会话存在但档案缺失';
      }
    }

    // 连接测试
    let connectionTest = '连接失败';
    try {
      const { data, error } = await safeAuth.getSession();
      if (error) {
        connectionTest = `连接错误: ${error.message}`;
      } else {
        connectionTest = '连接正常';
      }
    } catch (error) {
      connectionTest = `连接异常: ${error}`;
    }

    setDiagnostics({
      supabaseUrl,
      supabaseAnonKey: supabaseAnonKey.substring(0, 20) + '...',
      sessionStatus,
      profileStatus,
      connectionTest,
      authTest: '未测试',
      environment,
      timestamp
    });
  };

  const testLogin = async () => {
    setTestResult('正在测试登录...');
    
    try {
      const { error } = await safeAuth.signIn(testEmail, testPassword);
      
      if (error) {
        setTestResult(`登录失败: ${error.message}`);
      } else {
        setTestResult('登录成功! 页面将自动刷新...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setTestResult(`登录异常: ${error}`);
    }
  };

  const clearSession = async () => {
    try {
      await safeAuth.signOut();
      setTestResult('会话已清除，页面将刷新...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setTestResult(`清除会话失败: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-void p-6">
      <div className="max-w-4xl mx-auto">
        <div className="cosmic-glass p-8">
          <h1 className="text-3xl font-bold text-cosmic-star mb-6">
            🔍 生产环境诊断工具
          </h1>
          
          <div className="space-y-6">
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="cosmic-glass p-4">
                <h3 className="text-lg font-semibold text-cosmic-accent mb-3">环境配置</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>环境:</strong> {diagnostics.environment}</div>
                  <div><strong>Supabase URL:</strong> {diagnostics.supabaseUrl}</div>
                  <div><strong>Anon Key:</strong> {diagnostics.supabaseAnonKey}</div>
                  <div><strong>检查时间:</strong> {diagnostics.timestamp}</div>
                </div>
              </div>

              <div className="cosmic-glass p-4">
                <h3 className="text-lg font-semibold text-cosmic-energy mb-3">认证状态</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>会话状态:</strong> <span className={user ? 'text-cosmic-success' : 'text-cosmic-warning'}>{diagnostics.sessionStatus}</span></div>
                  <div><strong>档案状态:</strong> <span className={profile ? 'text-cosmic-success' : 'text-cosmic-warning'}>{diagnostics.profileStatus}</span></div>
                  <div><strong>连接测试:</strong> <span className={diagnostics.connectionTest.includes('正常') ? 'text-cosmic-success' : 'text-cosmic-danger'}>{diagnostics.connectionTest}</span></div>
                  <div><strong>加载状态:</strong> {isLoading ? '加载中...' : '已完成'}</div>
                </div>
              </div>
            </div>

            {/* 用户信息详情 */}
            {user && (
              <div className="cosmic-glass p-4">
                <h3 className="text-lg font-semibold text-cosmic-warm mb-3">用户详情</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>用户ID:</strong> {user.id}
                  </div>
                  <div>
                    <strong>邮箱:</strong> {user.email}
                  </div>
                  <div>
                    <strong>邮箱已验证:</strong> {user.email_confirmed_at ? '是' : '否'}
                  </div>
                  <div>
                    <strong>最后登录:</strong> {user.last_sign_in_at}
                  </div>
                  {profile && (
                    <>
                      <div>
                        <strong>用户名:</strong> {profile.username}
                      </div>
                      <div>
                        <strong>显示名:</strong> {profile.display_name || '未设置'}
                      </div>
                      <div>
                        <strong>角色:</strong> {profile.role}
                      </div>
                      <div>
                        <strong>创建时间:</strong> {profile.created_at}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 测试工具 */}
            <div className="cosmic-glass p-4">
              <h3 className="text-lg font-semibold text-cosmic-star mb-3">测试工具</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cosmic-light mb-1">
                      测试邮箱
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-cosmic-deep border border-cosmic-accent/30 rounded text-cosmic-light"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cosmic-light mb-1">
                      测试密码
                    </label>
                    <input
                      type="password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-cosmic-deep border border-cosmic-accent/30 rounded text-cosmic-light"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={testLogin}
                    className="cosmic-button"
                  >
                    测试登录
                  </button>
                  <button
                    onClick={clearSession}
                    className="px-4 py-2 bg-cosmic-danger text-white rounded hover:bg-cosmic-danger/80 transition-colors"
                  >
                    清除会话
                  </button>
                  <button
                    onClick={runDiagnostics}
                    className="px-4 py-2 bg-cosmic-energy text-white rounded hover:bg-cosmic-energy/80 transition-colors"
                  >
                    重新检查
                  </button>
                </div>

                {testResult && (
                  <div className={`p-3 rounded text-sm ${
                    testResult.includes('成功') ? 'bg-cosmic-success/20 text-cosmic-success' :
                    testResult.includes('失败') || testResult.includes('异常') ? 'bg-cosmic-danger/20 text-cosmic-danger' :
                    'bg-cosmic-warning/20 text-cosmic-warning'
                  }`}>
                    {testResult}
                  </div>
                )}
              </div>
            </div>

            {/* 预设测试账号 */}
            <div className="cosmic-glass p-4">
              <h3 className="text-lg font-semibold text-cosmic-accent mb-3">预设测试账号</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>守护者:</strong> guardian.test@voyager.com</div>
                <div><strong>启明者:</strong> luminary.test@voyager.com</div>
                <div><strong>领航者:</strong> catalyst.test@voyager.com</div>
                <div><strong>遥行者:</strong> voyager.test@voyager.com</div>
                <div className="md:col-span-2"><strong>通用密码:</strong> TestPassword123!</div>
              </div>
            </div>

            {/* 故障排除指南 */}
            <div className="cosmic-glass p-4">
              <h3 className="text-lg font-semibold text-cosmic-warning mb-3">故障排除指南</h3>
              <div className="space-y-2 text-sm">
                <div><strong>1. 无法连接Supabase:</strong> 检查环境变量NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div><strong>2. 登录失败:</strong> 确认测试账号已在数据库中创建</div>
                <div><strong>3. 档案缺失:</strong> 检查profiles表和RLS策略</div>
                <div><strong>4. 重定向循环:</strong> 清除浏览器cookie和localStorage</div>
                <div><strong>5. 权限错误:</strong> 检查用户角色和权限配置</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}