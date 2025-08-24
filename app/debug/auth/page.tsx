'use client';

// app/debug/auth/page.tsx - 認證問題診斷工具
// 幫助診斷和解決登入問題

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthDebugPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 測試帳號信息
  const testAccounts = [
    { role: 'guardian', email: 'guardian.test@example.com', password: 'TestPassword123!' },
    { role: 'luminary', email: 'luminary.test@example.com', password: 'TestPassword123!' },
    { role: 'catalyst', email: 'catalyst.test@example.com', password: 'TestPassword123!' },
    { role: 'voyager', email: 'voyager.test@example.com', password: 'TestPassword123!' }
  ];

  const addResult = (type: 'success' | 'error' | 'info', message: string, data?: any) => {
    setResults(prev => [...prev, { 
      type, 
      message, 
      data: data ? JSON.stringify(data, null, 2) : null, 
      time: new Date().toLocaleTimeString() 
    }]);
  };

  // 測試連接到 Supabase
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addResult('error', 'Supabase 連接失敗', error);
      } else {
        addResult('success', 'Supabase 連接成功', data);
      }
    } catch (error) {
      addResult('error', 'Supabase 連接異常', error);
    }
    setIsLoading(false);
  };

  // 檢查用戶是否存在
  const checkUserExists = async (email: string) => {
    try {
      // 嘗試重設密碼來檢查用戶是否存在
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        if (error.message.includes('User not found')) {
          addResult('error', `用戶不存在: ${email}`);
          return false;
        } else {
          addResult('info', `用戶存在但重設密碼失敗: ${email}`, error);
          return true;
        }
      } else {
        addResult('success', `用戶存在: ${email} (已發送重設密碼郵件)`);
        return true;
      }
    } catch (error) {
      addResult('error', '檢查用戶時發生錯誤', error);
      return false;
    }
  };

  // 測試登入
  const testLogin = async (testEmail?: string, testPassword?: string) => {
    const loginEmail = testEmail || email;
    const loginPassword = testPassword || password;
    
    if (!loginEmail || !loginPassword) {
      addResult('error', '請輸入郵箱和密碼');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        addResult('error', `登入失敗: ${loginEmail}`, error);
        
        // 檢查用戶是否存在
        await checkUserExists(loginEmail);
      } else {
        addResult('success', `登入成功: ${loginEmail}`, data);
        
        // 檢查用戶檔案
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          addResult('error', '獲取用戶檔案失敗', profileError);
        } else {
          addResult('success', '用戶檔案獲取成功', profile);
        }
      }
    } catch (error) {
      addResult('error', '登入過程發生異常', error);
    }
    setIsLoading(false);
  };

  // 測試所有測試帳號
  const testAllAccounts = async () => {
    setResults([]);
    setIsLoading(true);
    
    for (const account of testAccounts) {
      addResult('info', `測試 ${account.role} 帳號: ${account.email}`);
      await testLogin(account.email, account.password);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 延遲避免過快請求
    }
    
    setIsLoading(false);
  };

  // 創建測試帳號
  const createTestAccount = async (account: typeof testAccounts[0]) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            username: `${account.role}_test`,
            display_name: `${account.role}·測試`
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          addResult('info', `測試帳號已存在: ${account.email}`);
        } else {
          addResult('error', `創建測試帳號失敗: ${account.email}`, error);
        }
      } else {
        addResult('success', `測試帳號創建成功: ${account.email}`, data);
        
        // 創建檔案
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: `${account.role}_test`,
              display_name: `${account.role}·測試`,
              role: account.role,
              bio: `我是${account.role}測試帳號`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (profileError) {
            addResult('error', '創建用戶檔案失敗', profileError);
          } else {
            addResult('success', '用戶檔案創建成功');
          }
        }
      }
    } catch (error) {
      addResult('error', '創建測試帳號時發生異常', error);
    }
  };

  // 創建所有測試帳號
  const createAllTestAccounts = async () => {
    setIsLoading(true);
    for (const account of testAccounts) {
      await createTestAccount(account);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void p-6">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cosmic-danger via-cosmic-warning to-cosmic-success bg-clip-text text-transparent">
              🔧 認證問題診斷工具
            </span>
          </h1>
          <p className="text-cosmic-light/70">
            診斷和解決登入問題，檢查測試帳號狀態
          </p>
        </div>

        {/* 測試區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 手動測試 */}
          <div className="cosmic-glass p-6">
            <h2 className="text-xl font-semibold text-cosmic-star mb-4">手動登入測試</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-cosmic-light/70 mb-1">郵箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cosmic-input"
                  placeholder="輸入郵箱地址"
                />
              </div>
              
              <div>
                <label className="block text-sm text-cosmic-light/70 mb-1">密碼</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cosmic-input"
                  placeholder="輸入密碼"
                />
              </div>
              
              <button
                onClick={() => testLogin()}
                disabled={isLoading}
                className="cosmic-button w-full"
              >
                測試登入
              </button>
            </div>
          </div>

          {/* 快捷測試 */}
          <div className="cosmic-glass p-6">
            <h2 className="text-xl font-semibold text-cosmic-star mb-4">快捷診斷</h2>
            
            <div className="space-y-3">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="cosmic-button w-full"
              >
                測試 Supabase 連接
              </button>
              
              <button
                onClick={testAllAccounts}
                disabled={isLoading}
                className="cosmic-button w-full"
              >
                測試所有測試帳號
              </button>
              
              <button
                onClick={createAllTestAccounts}
                disabled={isLoading}
                className="cosmic-button-primary w-full"
              >
                創建所有測試帳號
              </button>
              
              <button
                onClick={() => setResults([])}
                className="cosmic-button-secondary w-full"
              >
                清空日誌
              </button>
            </div>
          </div>
        </div>

        {/* 測試帳號信息 */}
        <div className="cosmic-glass p-6 mb-6">
          <h3 className="text-lg font-semibold text-cosmic-star mb-4">📋 測試帳號信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testAccounts.map((account) => (
              <div key={account.role} className="bg-cosmic-glass-medium p-3 rounded-lg">
                <div className="font-medium text-cosmic-light">{account.role.toUpperCase()}</div>
                <div className="text-sm text-cosmic-light/70">{account.email}</div>
                <div className="text-xs text-cosmic-light/50">{account.password}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 診斷結果 */}
        <div className="cosmic-glass p-6">
          <h3 className="text-lg font-semibold text-cosmic-star mb-4">
            📊 診斷結果 {isLoading && <span className="text-sm text-cosmic-warning">(進行中...)</span>}
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-cosmic-light/70 text-center py-8">
                點擊上方按鈕開始診斷...
              </p>
            ) : (
              results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.type === 'success' 
                      ? 'bg-cosmic-success/10 border-cosmic-success' 
                      : result.type === 'error'
                      ? 'bg-cosmic-danger/10 border-cosmic-danger'
                      : 'bg-cosmic-warning/10 border-cosmic-warning'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium ${
                      result.type === 'success' ? 'text-cosmic-success' 
                      : result.type === 'error' ? 'text-cosmic-danger'
                      : 'text-cosmic-warning'
                    }`}>
                      {result.type === 'success' ? '✅' : result.type === 'error' ? '❌' : 'ℹ️'} {result.message}
                    </span>
                    <span className="text-xs text-cosmic-light/50">{result.time}</span>
                  </div>
                  {result.data && (
                    <pre className="text-xs text-cosmic-light/70 mt-2 overflow-x-auto">
                      {result.data}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}