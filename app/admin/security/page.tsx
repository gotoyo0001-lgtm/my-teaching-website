'use client';

// app/admin/security/page.tsx - 安全策略管理界面
// 守护者专用：监控 RLS 策略和用户角色管理

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabaseSafe, safeQueries } from '@/lib/supabase-safe';
import type { ArchetypeRole } from '@/lib/database.types';

interface RLSPolicy {
  policyname: string;
  cmd: string;
  permissive: string;
  roles: string[];
  qual: string;
  with_check: string;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: ArchetypeRole;
  email: string;
  created_at: string;
}

interface SecurityCheck {
  check_type: string;
  component: string;
  status: string;
  level: 'safe' | 'warning' | 'danger';
}

export default function SecurityManagement() {
  const { user, isGuardian, isLoading } = useAuth();
  const [policies, setPolicies] = useState<RLSPolicy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newRole, setNewRole] = useState<ArchetypeRole>('voyager');
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // 获取 RLS 策略信息
  const fetchPolicies = async () => {
    try {
      const { data, error } = await safeQueries.getTablePolicies('profiles');
      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('获取策略失败:', error);
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await safeQueries.getAllProfiles();
      if (profilesError) throw profilesError;
      
      if (!profilesData) {
        setUsers([]);
        return;
      }

      // 获取用户邮箱信息
      const { data: usersData, error: usersError } = await supabaseSafe
        .from('auth.users')
        .select('id, email, created_at')
        .limit(50);

      if (usersError) {
        console.warn('无法获取邮箱信息，使用档案数据:', usersError);
        // 如果无法获取auth.users，只使用profiles数据
        setUsers(profilesData.map((profile: any) => ({
          ...profile,
          email: 'N/A'
        })));
        return;
      }

      // 合并用户数据和档案数据
      const mergedUsers = profilesData.map((profile: any) => ({
        ...profile,
        email: usersData?.find((u: any) => u.id === profile.id)?.email || 'N/A'
      }));

      setUsers(mergedUsers);
    } catch (error) {
      console.error('获取用户数据失败:', error);
    }
  };

  // 执行安全检查
  const performSecurityChecks = async () => {
    const checks: SecurityCheck[] = [
      {
        check_type: 'RLS策略',
        component: 'profiles SELECT',
        status: policies.some(p => p.cmd === 'SELECT' && p.qual !== 'true') ? 
          '✅ 安全策略已启用' : '⚠️ 存在不安全策略',
        level: policies.some(p => p.cmd === 'SELECT' && p.qual !== 'true') ? 'safe' : 'warning'
      },
      {
        check_type: 'RLS策略',
        component: 'profiles INSERT',
        status: policies.some(p => p.cmd === 'INSERT' && p.qual?.includes('auth.uid()')) ? 
          '✅ 插入权限受限' : '❌ 插入权限过宽',
        level: policies.some(p => p.cmd === 'INSERT' && p.qual?.includes('auth.uid()')) ? 'safe' : 'danger'
      },
      {
        check_type: 'RLS策略',
        component: 'profiles UPDATE',
        status: policies.some(p => p.cmd === 'UPDATE' && p.qual?.includes('auth.uid()')) ? 
          '✅ 更新权限受限' : '❌ 更新权限过宽',
        level: policies.some(p => p.cmd === 'UPDATE' && p.qual?.includes('auth.uid()')) ? 'safe' : 'danger'
      },
      {
        check_type: '用户角色',
        component: '守护者账号',
        status: users.filter(u => u.role === 'guardian').length > 0 ? 
          `✅ ${users.filter(u => u.role === 'guardian').length} 个守护者` : 
          '⚠️ 没有守护者账号',
        level: users.filter(u => u.role === 'guardian').length > 0 ? 'safe' : 'warning'
      }
    ];

    setSecurityChecks(checks);
  };

  // 提升用户角色
  const promoteUser = async () => {
    if (!selectedUser || !newRole) {
      setActionMessage({ type: 'error', message: '请选择用户和角色' });
      return;
    }

    try {
      const { data, error } = await safeQueries.promoteUserRole(selectedUser, newRole);

      if (error) throw error;

      const result = data as { success: boolean, message: string };
      
      if (result.success) {
        setActionMessage({ type: 'success', message: result.message });
        await fetchUsers(); // 刷新用户列表
        setSelectedUser('');
      } else {
        setActionMessage({ type: 'error', message: result.message });
      }
    } catch (error: any) {
      console.error('角色提升失败:', error);
      setActionMessage({ type: 'error', message: `操作失败: ${error.message}` });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      await Promise.all([
        fetchPolicies(),
        fetchUsers()
      ]);
      setIsLoadingData(false);
    };

    if (user && isGuardian) {
      loadData();
    }
  }, [user, isGuardian]);

  useEffect(() => {
    if (policies.length > 0 && users.length > 0) {
      performSecurityChecks();
    }
  }, [policies, users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!isGuardian) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">访问受限</h1>
          <p>只有守护者可以访问安全策略管理界面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部导航 */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🔐 安全策略管理中心
            </h1>
            <div className="text-sm text-purple-300">
              守护者专用控制台
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            actionMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
            'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}>
            {actionMessage.message}
            <button 
              onClick={() => setActionMessage(null)}
              className="float-right text-2xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {isLoadingData ? (
          <div className="text-center text-white py-12">
            <div className="text-xl mb-4">🔍 正在扫描安全策略...</div>
            <div className="text-purple-300">请稍候，正在分析系统安全状态</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 安全状态概览 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                🛡️ 安全状态概览
              </h2>
              <div className="space-y-3">
                {securityChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div>
                      <div className="text-purple-300 text-sm">{check.check_type}</div>
                      <div className="text-white font-medium">{check.component}</div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      check.level === 'safe' ? 'bg-green-500/20 text-green-300' :
                      check.level === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {check.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RLS 策略详情 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                📋 RLS 策略详情
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {policies.map((policy, index) => (
                  <div key={index} className="p-3 rounded-lg bg-slate-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-purple-300 font-medium">{policy.policyname}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        policy.cmd === 'SELECT' ? 'bg-blue-500/20 text-blue-300' :
                        policy.cmd === 'INSERT' ? 'bg-green-500/20 text-green-300' :
                        policy.cmd === 'UPDATE' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {policy.cmd}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {policy.qual || 'No conditions'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 用户角色管理 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                👥 用户角色管理
              </h2>
              
              {/* 角色提升操作 */}
              <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-purple-300 font-medium mb-3">提升用户角色</h3>
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="bg-slate-600 text-white rounded px-3 py-2 border border-purple-500/30 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">选择用户...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as ArchetypeRole)}
                    className="bg-slate-600 text-white rounded px-3 py-2 border border-purple-500/30 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="voyager">🚀 遥行者 (Voyager)</option>
                    <option value="luminary">💡 启明者 (Luminary)</option>
                    <option value="catalyst">⚡ 领航者 (Catalyst)</option>
                    <option value="guardian">🛡️ 守护者 (Guardian)</option>
                  </select>
                  
                  <button
                    onClick={promoteUser}
                    disabled={!selectedUser}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    提升角色
                  </button>
                </div>
              </div>

              {/* 用户列表 */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      user.role === 'guardian' ? 'bg-red-500/20 text-red-300' :
                      user.role === 'catalyst' ? 'bg-yellow-500/20 text-yellow-300' :
                      user.role === 'luminary' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {user.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 系统统计 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                📊 系统统计
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{users.length}</div>
                  <div className="text-sm text-gray-400">总用户数</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{policies.length}</div>
                  <div className="text-sm text-gray-400">RLS 策略数</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.role === 'guardian').length}
                  </div>
                  <div className="text-sm text-gray-400">守护者</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {securityChecks.filter(c => c.level === 'safe').length}/{securityChecks.length}
                  </div>
                  <div className="text-sm text-gray-400">安全通过率</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}