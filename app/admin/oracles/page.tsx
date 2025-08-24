'use client';

import type { Database } from '@/lib/database.types';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Oracle {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'guidance' | 'warning' | 'celebration';
  is_pinned: boolean;
  target_roles: string[] | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  guardian: {
    username: string;
    display_name: string | null;
  };
}

export default function OracleManagement() {
  const { profile, isLoading } = useAuth();
  const { canCreateOracle } = usePermissions();
  const router = useRouter();
  const [oracles, setOracles] = useState<Oracle[]>([]);
  const [loadingOracles, setLoadingOracles] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOracle, setEditingOracle] = useState<Oracle | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as Oracle['type'],
    is_pinned: false,
    target_roles: [] as string[],
    expires_at: ''
  });

  useEffect(() => {
    if (!isLoading && (!profile || !canCreateOracle)) {
      router.push('/admin');
    }
  }, [profile, isLoading, canCreateOracle, router]);

  useEffect(() => {
    if (canCreateOracle) {
      loadOracles();
    }
  }, [canCreateOracle]);

  const loadOracles = async () => {
    setLoadingOracles(true);
    try {
      const { data, error } = await supabase
        .from('oracles')
        .select(`
          *,
          guardian:profiles!guardian_id(username, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入神諭失敗:', error);
        return;
      }

      setOracles(data || []);
    } catch (error) {
      console.error('載入神諭時發生錯誤:', error);
    } finally {
      setLoadingOracles(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'guidance': return '🧭';
      case 'warning': return '⚠️';
      case 'celebration': return '🎉';
      default: return '📢';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'announcement': return '公告';
      case 'guidance': return '指導';
      case 'warning': return '警告';
      case 'celebration': return '慶祝';
      default: return '公告';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'text-cosmic-info bg-cosmic-info/20';
      case 'guidance': return 'text-cosmic-success bg-cosmic-success/20';
      case 'warning': return 'text-cosmic-danger bg-cosmic-danger/20';
      case 'celebration': return 'text-cosmic-energy bg-cosmic-energy/20';
      default: return 'text-cosmic-info bg-cosmic-info/20';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;

    try {
      const oracleData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        is_pinned: formData.is_pinned,
        target_roles: formData.target_roles.length > 0 ? formData.target_roles : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        guardian_id: profile.id,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingOracle) {
        // 更新現有神諭
        ({ error } = await supabase
          .from('oracles')
          .update(oracleData)
          .eq('id', editingOracle.id));
      } else {
        // 創建新神諭
        ({ error } = await supabase
          .from('oracles')
          .insert(oracleData));
      }

      if (error) {
        console.error('保存神諭失敗:', error);
        alert('保存神諭失敗，請稍後再試');
        return;
      }

      alert(editingOracle ? '神諭更新成功！' : '神諭發布成功！');
      resetForm();
      setShowCreateModal(false);
      setEditingOracle(null);
      loadOracles();
    } catch (error) {
      console.error('保存神諭時發生錯誤:', error);
      alert('保存神諭時發生錯誤');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      is_pinned: false,
      target_roles: [],
      expires_at: ''
    });
  };

  const handleEdit = (oracle: Oracle) => {
    setEditingOracle(oracle);
    setFormData({
      title: oracle.title,
      content: oracle.content,
      type: oracle.type,
      is_pinned: oracle.is_pinned,
      target_roles: oracle.target_roles || [],
      expires_at: oracle.expires_at ? oracle.expires_at.slice(0, 16) : ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (oracle: Oracle) => {
    if (!confirm(`確定要刪除神諭「${oracle.title}」嗎？`)) return;

    try {
      const { error } = await supabase
        .from('oracles')
        .delete()
        .eq('id', oracle.id);

      if (error) {
        console.error('刪除神諭失敗:', error);
        alert('刪除神諭失敗，請稍後再試');
        return;
      }

      alert('神諭刪除成功！');
      loadOracles();
    } catch (error) {
      console.error('刪除神諭時發生錯誤:', error);
      alert('刪除神諭時發生錯誤');
    }
  };

  const togglePin = async (oracle: Oracle) => {
    try {
      const { error } = await supabase
        .from('oracles')
        .update({ 
          is_pinned: !oracle.is_pinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', oracle.id);

      if (error) {
        console.error('更新置頂狀態失敗:', error);
        alert('更新置頂狀態失敗');
        return;
      }

      loadOracles();
    } catch (error) {
      console.error('更新置頂狀態時發生錯誤:', error);
    }
  };

  if (isLoading || loadingOracles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在載入神諭管理...</span>
      </div>
    );
  }

  if (!canCreateOracle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">權限不足</h1>
          <p className="text-cosmic-light mb-6">只有守護者可以管理神諭</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cosmic-star mb-2">神諭管理</h1>
              <p className="text-cosmic-light/70">發布系統公告、重要通知和指導信息</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingOracle(null);
                setShowCreateModal(true);
              }}
              className="cosmic-button bg-cosmic-accent text-white"
            >
              📢 發布新神諭
            </button>
          </div>
        </div>

        {/* 神諭列表 */}
        <div className="space-y-4">
          {oracles.map((oracle) => (
            <div key={oracle.id} className="cosmic-glass p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(oracle.type)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(oracle.type)}`}>
                      {getTypeName(oracle.type)}
                    </span>
                    {oracle.is_pinned && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-cosmic-energy bg-cosmic-energy/20">
                        📌 置頂
                      </span>
                    )}
                    {oracle.expires_at && new Date(oracle.expires_at) < new Date() && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-cosmic-danger bg-cosmic-danger/20">
                        已過期
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-cosmic-star mb-2">{oracle.title}</h3>
                  <p className="text-cosmic-light/80 mb-4 whitespace-pre-wrap">{oracle.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-cosmic-light/60">
                    <span>發布者：{oracle.guardian.display_name || oracle.guardian.username}</span>
                    <span>發布時間：{new Date(oracle.created_at).toLocaleString('zh-TW')}</span>
                    {oracle.target_roles && oracle.target_roles.length > 0 && (
                      <span>目標角色：{oracle.target_roles.join(', ')}</span>
                    )}
                    {oracle.expires_at && (
                      <span>過期時間：{new Date(oracle.expires_at).toLocaleString('zh-TW')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => togglePin(oracle)}
                    className={`cosmic-button-sm ${oracle.is_pinned ? 'bg-cosmic-energy' : 'bg-cosmic-light/20'} text-white`}
                  >
                    {oracle.is_pinned ? '取消置頂' : '置頂'}
                  </button>
                  <button
                    onClick={() => handleEdit(oracle)}
                    className="cosmic-button-sm bg-cosmic-accent text-white"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(oracle)}
                    className="cosmic-button-sm bg-cosmic-danger text-white"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {oracles.length === 0 && (
            <div className="cosmic-glass p-12 text-center">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-bold text-cosmic-star mb-2">還沒有神諭</h3>
              <p className="text-cosmic-light/70 mb-6">開始發布第一個神諭來指導宇宙中的遥行者們</p>
              <button
                onClick={() => {
                  resetForm();
                  setEditingOracle(null);
                  setShowCreateModal(true);
                }}
                className="cosmic-button bg-cosmic-accent text-white"
              >
                發布神諭
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 創建/編輯神諭模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="cosmic-glass p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-cosmic-star mb-6">
              {editingOracle ? '編輯神諭' : '發布新神諭'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cosmic-light font-medium mb-2">標題</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="cosmic-input w-full"
                  required
                  placeholder="輸入神諭標題..."
                />
              </div>

              <div>
                <label className="block text-cosmic-light font-medium mb-2">類型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Oracle['type']})}
                  className="cosmic-input w-full"
                >
                  <option value="announcement">📢 公告</option>
                  <option value="guidance">🧭 指導</option>
                  <option value="warning">⚠️ 警告</option>
                  <option value="celebration">🎉 慶祝</option>
                </select>
              </div>

              <div>
                <label className="block text-cosmic-light font-medium mb-2">內容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="cosmic-input w-full"
                  rows={6}
                  required
                  placeholder="輸入神諭內容..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cosmic-light font-medium mb-2">目標角色</label>
                  <div className="space-y-2">
                    {['voyager', 'luminary', 'catalyst', 'guardian'].map(role => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.target_roles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, target_roles: [...formData.target_roles, role]});
                            } else {
                              setFormData({...formData, target_roles: formData.target_roles.filter(r => r !== role)});
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-cosmic-light">
                          {role === 'voyager' && '遥行者'}
                          {role === 'luminary' && '啟明者'}
                          {role === 'catalyst' && '領航者'}
                          {role === 'guardian' && '守護者'}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="text-xs text-cosmic-light/60 mt-1">
                    不選擇則對所有角色可見
                  </div>
                </div>

                <div>
                  <label className="block text-cosmic-light font-medium mb-2">過期時間</label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="cosmic-input w-full"
                  />
                  <div className="text-xs text-cosmic-light/60 mt-1">
                    不設置則永不過期
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData({...formData, is_pinned: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-cosmic-light">置頂此神諭</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOracle(null);
                    resetForm();
                  }}
                  className="flex-1 cosmic-button bg-cosmic-light/20 text-cosmic-light"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 cosmic-button bg-cosmic-accent text-white"
                >
                  {editingOracle ? '更新神諭' : '發布神諭'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}