'use client';

// 前端 Supabase 連接診斷頁面
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // 1. 檢查環境變數
      addResult('🔍 檢查環境變數...');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl) {
        addResult(`✅ SUPABASE_URL: ${supabaseUrl}`);
      } else {
        addResult('❌ SUPABASE_URL 未設置');
      }
      
      if (supabaseKey) {
        addResult(`✅ SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`);
      } else {
        addResult('❌ SUPABASE_ANON_KEY 未設置');
      }

      // 2. 測試基本連接
      addResult('🔗 測試 Supabase 連接...');
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (healthError) {
        addResult(`❌ 連接失敗: ${healthError.message}`);
        addResult(`詳細錯誤: ${JSON.stringify(healthError, null, 2)}`);
      } else {
        addResult('✅ Supabase 連接正常');
      }

      // 3. 測試認證狀態
      addResult('🔐 檢查認證狀態...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`❌ 會話檢查失敗: ${sessionError.message}`);
      } else if (session) {
        addResult(`✅ 已登入用戶: ${session.user.email}`);
      } else {
        addResult('ℹ️ 用戶未登入');
      }

      // 4. 測試登入（使用測試帳號）
      addResult('🎯 測試登入功能...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'guardian.test@voyager.com',
        password: 'TestPassword123!'
      });

      if (signInError) {
        addResult(`❌ 登入失敗: ${signInError.message}`);
        addResult(`錯誤詳情: ${JSON.stringify(signInError, null, 2)}`);
      } else {
        addResult('✅ 登入成功！');
        
        // 5. 測試用戶檔案查詢
        addResult('👤 測試用戶檔案查詢...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (profileError) {
          addResult(`❌ 檔案查詢失敗: ${profileError.message}`);
          addResult(`錯誤詳情: ${JSON.stringify(profileError, null, 2)}`);
        } else {
          addResult('✅ 檔案查詢成功！');
          addResult(`用戶資料: ${JSON.stringify(profileData, null, 2)}`);
        }

        // 登出測試帳號
        await supabase.auth.signOut();
        addResult('🔓 已登出測試帳號');
      }

    } catch (error: any) {
      addResult(`💥 診斷過程中發生異常: ${error.message}`);
      addResult(`異常詳情: ${JSON.stringify(error, null, 2)}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔬 Supabase 連接診斷</h1>
        
        <div className="mb-6">
          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            {isLoading ? '🔄 診斷中...' : '🚀 開始診斷'}
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">診斷結果</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-400">點擊上方按鈕開始診斷...</p>
            ) : (
              results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm font-mono ${
                    result.includes('❌') ? 'bg-red-900/50 text-red-200' :
                    result.includes('✅') ? 'bg-green-900/50 text-green-200' :
                    result.includes('⚠️') ? 'bg-yellow-900/50 text-yellow-200' :
                    'bg-gray-700/50'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>💡 這個頁面會檢查：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>環境變數配置</li>
            <li>Supabase 連接狀態</li>
            <li>認證功能</li>
            <li>數據庫查詢權限</li>
            <li>用戶檔案存取</li>
          </ul>
        </div>
      </div>
    </div>
  );
}