'use client';

import type { Database } from '@/lib/database.types';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  email?: string;
  role: 'voyager' | 'luminary' | 'catalyst' | 'guardian';
  created_at: string;
  last_seen_at: string | null;
  bio: string | null;
}

export default function UserManagement() {
  const { profile, isLoading } = useAuth();
  const { canManageUsers } = usePermissions();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!profile || !canManageUsers)) {
      router.push('/admin');
    }
  }, [profile, isLoading, canManageUsers, router]);

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
    }
  }, [canManageUsers]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // 獲取用戶檔案信息
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('載入用戶檔案失敗:', profilesError);
        return;
      }

      // 獲取用戶認證信息
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('載入認證用戶失敗:', authError);
        // 如果無法獲取認證信息，只使用檔案信息
        setUsers(profilesData || []);
        return;
      }

      // 合併檔案和認證信息
      const combinedUsers = profilesData?.map(profile => {
        const authUser = authData.users.find(auth => auth.id === profile.id);
        return {
          ...profile,
          email: authUser?.email
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('載入用戶數據時發生錯誤:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'guardian': return 'text-cosmic-danger bg-cosmic-danger/20';
      case 'luminary': return 'text-cosmic-accent bg-cosmic-accent/20';
      case 'catalyst': return 'text-cosmic-energy bg-cosmic-energy/20';
      case 'voyager': return 'text-cosmic-info bg-cosmic-info/20';
      default: return 'text-cosmic-light bg-cosmic-light/20';
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handlePromoteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowPromoteModal(true);
  };

  const promoteToRole = async (newRole: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) {
        console.error('角色提升失敗:', error);
        alert('角色提升失敗，請稍後再試');
        return;
      }

      alert(`成功將 ${selectedUser.username} 提升為 ${getRoleName(newRole)}`);
      setShowPromoteModal(false);
      setSelectedUser(null);
      loadUsers(); // 重新載入用戶列表
    } catch (error) {
      console.error('角色提升時發生錯誤:', error);
      alert('角色提升時發生錯誤');
    }
  };

  if (isLoading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在載入用戶管理...</span>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">權限不足</h1>
          <p className="text-cosmic-light mb-6">只有守護者可以管理用戶</p>
          <Link href="/admin" className="cosmic-button">
            返回控制台
          </Link>
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
          <h1 className="text-4xl font-bold text-cosmic-star mb-2">用戶管理</h1>
          <p className="text-cosmic-light/70">管理所有用戶、角色提升和權限設置</p>
        </div>

        {/* 搜索和篩選 */}
        <div className="cosmic-glass p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索用戶名、顯示名稱或郵箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cosmic-input w-full"
              />
            </div>
            <div className="md:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="cosmic-input w-full"
              >
                <option value="all">所有角色</option>
                <option value="voyager">遥行者</option>
                <option value="luminary">啟明者</option>
                <option value="catalyst">領航者</option>
                <option value="guardian">守護者</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-cosmic-light/60">
            找到 {filteredUsers.length} 位用戶
          </div>
        </div>

        {/* 用戶列表 */}
        <div className="cosmic-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cosmic-accent/10">
                <tr>
                  <th className="px-6 py-4 text-left text-cosmic-light font-medium">用戶</th>
                  <th className="px-6 py-4 text-left text-cosmic-light font-medium">角色</th>
                  <th className="px-6 py-4 text-left text-cosmic-light font-medium">註冊時間</th>
                  <th className="px-6 py-4 text-left text-cosmic-light font-medium">最後活動</th>
                  <th className="px-6 py-4 text-left text-cosmic-light font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-cosmic-accent/5' : ''}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-cosmic-star">
                          {user.display_name || user.username}
                        </div>
                        <div className="text-sm text-cosmic-light/60">
                          @{user.username}
                        </div>
                        {user.email && (
                          <div className="text-sm text-cosmic-light/60">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cosmic-light/70">
                      {new Date(user.created_at).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 text-cosmic-light/70">
                      {user.last_seen_at ? 
                        new Date(user.last_seen_at).toLocaleDateString('zh-TW') : 
                        '從未'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePromoteUser(user)}
                          className="cosmic-button-sm bg-cosmic-accent text-white hover:bg-cosmic-accent/80"
                          disabled={user.role === 'guardian'}
                        >
                          {user.role === 'guardian' ? '已是守護者' : '提升角色'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 角色提升模態框 */}
        {showPromoteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="cosmic-glass p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-cosmic-star mb-4">
                提升 {selectedUser.username} 的角色
              </h3>
              <p className="text-cosmic-light/70 mb-6">
                當前角色：{getRoleName(selectedUser.role)}
              </p>
              <div className="space-y-3">
                {['voyager', 'luminary', 'catalyst', 'guardian'].map(role => (
                  <button
                    key={role}
                    onClick={() => promoteToRole(role)}
                    disabled={role === selectedUser.role}
                    className={`w-full text-left p-3 rounded-lg border transition-colors duration-200 ${
                      role === selectedUser.role
                        ? 'border-cosmic-accent/50 bg-cosmic-accent/10 cursor-not-allowed'
                        : 'border-cosmic-light/20 hover:border-cosmic-accent hover:bg-cosmic-accent/10 cursor-pointer'
                    }`}
                  >
                    <div className="font-medium text-cosmic-star">{getRoleName(role)}</div>
                    <div className="text-sm text-cosmic-light/70">
                      {role === 'voyager' && '基礎學習者角色'}
                      {role === 'luminary' && '可創建和管理課程'}
                      {role === 'catalyst' && '可引導社群討論'}
                      {role === 'guardian' && '系統最高權限'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="flex-1 cosmic-button bg-cosmic-light/20 text-cosmic-light"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}