'use client';

// app/admin/create-test-accounts/page.tsx - 測試帳號創建頁面
// 管理員專用：批量創建四種原型角色的測試帳號

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface TestAccount {
  role: 'guardian' | 'luminary' | 'catalyst' | 'voyager';
  username: string;
  email: string;
  password: string;
  display_name: string;
  bio: string;
  luminary_expertise?: string[] | null;
  catalyst_communities?: string[] | null;
  voyager_manifesto?: string | null;
}

const testAccounts: TestAccount[] = [
  {
    role: 'guardian',
    username: 'guardian_test',
    email: '', // 用戶需要填入真實郵箱
    password: 'TestPassword123!',
    display_name: '守護者·測試',
    bio: '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。'
  },
  {
    role: 'luminary',
    username: 'luminary_test',
    email: '', // 用戶需要填入真實郵箱
    password: 'TestPassword123!',
    display_name: '啟明者·測試',
    bio: '我是啟明者測試帳號，專注於創造和分享知識的光芒。',
    luminary_expertise: ['前端開發', 'UI/UX設計', 'TypeScript']
  },
  {
    role: 'catalyst',
    username: 'catalyst_test',
    email: '', // 用戶需要填入真實郵箱
    password: 'TestPassword123!',
    display_name: '領航者·測試',
    bio: '我是領航者測試帳號，致力於連接不同學習者並促進協作。',
    catalyst_communities: ['前端開發社群', '設計師聯盟', '新手導航']
  },
  {
    role: 'voyager',
    username: 'voyager_test',
    email: '', // 用戶需要填入真實郵箱
    password: 'TestPassword123!',
    display_name: '遠行者·測試',
    bio: '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。',
    voyager_manifesto: '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。我的目標是在這個無垠的知識宇宙中，找到屬於自己的星座。'
  }
];

export default function CreateTestAccountsPage() {
  const [accounts, setAccounts] = useState<TestAccount[]>(testAccounts);
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const updateEmail = (index: number, email: string) => {
    const updated = [...accounts];
    updated[index].email = email;
    setAccounts(updated);
  };

  const createAccount = async (account: TestAccount) => {
    try {
      // 1. 創建認證用戶
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            username: account.username,
            display_name: account.display_name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('無法創建用戶');
      }

      // 2. 創建用戶檔案
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username: account.username,
          display_name: account.display_name,
          bio: account.bio,
          role: account.role,
          luminary_expertise: account.luminary_expertise,
          catalyst_communities: account.catalyst_communities,
          voyager_manifesto: account.voyager_manifesto,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }

      return {
        success: true,
        account: account,
        userId: authData.user.id,
        message: '創建成功'
      };
    } catch (error: any) {
      return {
        success: false,
        account: account,
        error: error.message,
        message: `創建失敗: ${error.message}`
      };
    }
  };

  const createAllAccounts = async () => {
    setIsCreating(true);
    setResults([]);

    const results = [];
    
    for (const account of accounts) {
      if (!account.email.trim()) {
        results.push({
          success: false,
          account: account,
          message: '請填入郵箱地址'
        });
        continue;
      }

      const result = await createAccount(account);
      results.push(result);
    }

    setResults(results);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void p-6">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-luminary via-cosmic-warm to-cosmic-energy bg-clip-text text-transparent">
              測試帳號創建工具
            </span>
          </h1>
          <p className="text-cosmic-light/70">
            為教學生態系創建四種原型角色的測試帳號
          </p>
        </div>

        {/* 帳號表單 */}
        <div className="cosmic-glass p-6 mb-6">
          <h2 className="text-xl font-semibold text-cosmic-star mb-6">測試帳號配置</h2>
          
          <div className="space-y-6">
            {accounts.map((account, index) => (
              <div key={account.role} className="border border-cosmic-glass-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-cosmic-light">
                    {account.display_name} ({account.role})
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.role === 'guardian' 
                      ? 'bg-cosmic-energy/20 text-cosmic-energy'
                      : account.role === 'luminary'
                      ? 'bg-luminary/20 text-luminary'
                      : account.role === 'catalyst'
                      ? 'bg-cosmic-warm/20 text-cosmic-warm'
                      : 'bg-cosmic-light/20 text-cosmic-light'
                  }`}>
                    {account.role.toUpperCase()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cosmic-light/70 mb-1">郵箱地址 *</label>
                    <input
                      type="email"
                      value={account.email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="cosmic-input text-sm"
                      placeholder="請輸入真實的郵箱地址"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cosmic-light/70 mb-1">密碼</label>
                    <input
                      type="text"
                      value={account.password}
                      readOnly
                      className="cosmic-input text-sm bg-cosmic-glass-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cosmic-light/70 mb-1">用戶名</label>
                    <input
                      type="text"
                      value={account.username}
                      readOnly
                      className="cosmic-input text-sm bg-cosmic-glass-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cosmic-light/70 mb-1">顯示名稱</label>
                    <input
                      type="text"
                      value={account.display_name}
                      readOnly
                      className="cosmic-input text-sm bg-cosmic-glass-medium"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-cosmic-light/70 mb-1">簡介</label>
                  <textarea
                    value={account.bio}
                    readOnly
                    rows={2}
                    className="cosmic-input text-sm bg-cosmic-glass-medium resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 創建按鈕 */}
        <div className="text-center mb-6">
          <button
            onClick={createAllAccounts}
            disabled={isCreating || accounts.some(acc => !acc.email.trim())}
            className="cosmic-button-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? '正在創建...' : '創建所有測試帳號'}
          </button>
        </div>

        {/* 創建結果 */}
        {results.length > 0 && (
          <div className="cosmic-glass p-6">
            <h3 className="text-lg font-semibold text-cosmic-star mb-4">創建結果</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'border-cosmic-success bg-cosmic-success/10' 
                      : 'border-cosmic-danger bg-cosmic-danger/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {result.account.display_name} ({result.account.role})
                    </span>
                    <span className={`text-sm ${
                      result.success ? 'text-cosmic-success' : 'text-cosmic-danger'
                    }`}>
                      {result.success ? '✅ 成功' : '❌ 失敗'}
                    </span>
                  </div>
                  <div className={`text-sm mt-1 ${
                    result.success ? 'text-cosmic-success/80' : 'text-cosmic-danger/80'
                  }`}>
                    {result.message}
                  </div>
                  {result.userId && (
                    <div className="text-xs text-cosmic-light/60 mt-1">
                      用戶 ID: {result.userId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <div className="cosmic-glass p-4 mt-6">
          <h4 className="text-sm font-medium text-cosmic-warning mb-2">⚠️ 重要提示</h4>
          <ul className="text-sm text-cosmic-light/70 space-y-1">
            <li>• 請使用真實的郵箱地址，系統會發送確認郵件</li>
            <li>• 密碼為 <code className="bg-cosmic-glass-medium px-1 rounded">TestPassword123!</code></li>
            <li>• 創建成功後可在用戶管理面板中查看</li>
            <li>• 測試完成後請及時清理測試數據</li>
          </ul>
        </div>
      </div>
    </div>
  );
}