'use client';

import { useState } from 'react';

export default function DeepDiagnosticPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDeepDiagnostics = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // 1. 檢查環境變數詳細信息
      addResult('🔍 詳細環境變數檢查...');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addResult(`URL 完整內容: ${supabaseUrl}`);
      addResult(`Key 完整內容: ${supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        addResult('❌ 環境變數缺失！');
        return;
      }

      // 2. 驗證 URL 格式
      addResult('🌐 URL 格式驗證...');
      try {
        const url = new URL(supabaseUrl);
        addResult(`✅ URL 協議: ${url.protocol}`);
        addResult(`✅ URL 主機: ${url.hostname}`);
        addResult(`✅ URL 路徑: ${url.pathname}`);
      } catch (error: any) {
        addResult(`❌ URL 格式錯誤: ${error.message}`);
        return;
      }

      // 3. 驗證 Key 格式
      addResult('🔑 Key 格式驗證...');
      try {
        // JWT token should have 3 parts separated by dots
        const keyParts = supabaseKey.split('.');
        if (keyParts.length === 3) {
          addResult(`✅ JWT 格式正確 (${keyParts.length} 部分)`);
          
          // 嘗試解析 JWT payload (不驗證簽名)
          const payload = JSON.parse(atob(keyParts[1]));
          addResult(`✅ JWT 角色: ${payload.role || '未知'}`);
          addResult(`✅ JWT 發行者: ${payload.iss || '未知'}`);
          addResult(`✅ JWT 專案: ${payload.ref || '未知'}`);
        } else {
          addResult(`❌ JWT 格式錯誤 (${keyParts.length} 部分，應為 3 部分)`);
        }
      } catch (error: any) {
        addResult(`❌ Key 解析錯誤: ${error.message}`);
      }

      // 4. 測試原始 HTTP 請求到 Supabase
      addResult('🔗 原始 HTTP 請求測試...');
      try {
        const healthUrl = `${supabaseUrl}/rest/v1/`;
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        addResult(`HTTP 狀態碼: ${response.status}`);
        addResult(`HTTP 狀態文字: ${response.statusText}`);
        
        if (response.ok) {
          addResult('✅ HTTP 請求成功');
        } else {
          const errorText = await response.text();
          addResult(`❌ HTTP 請求失敗: ${errorText}`);
        }
      } catch (error: any) {
        addResult(`❌ HTTP 請求異常: ${error.message}`);
      }

      // 5. 測試不同的 Supabase 端點
      addResult('🎯 端點可用性測試...');
      const endpoints = [
        { name: 'REST API', path: '/rest/v1/' },
        { name: 'Auth API', path: '/auth/v1/settings' },
        { name: 'Storage API', path: '/storage/v1/' },
        { name: 'Realtime', path: '/realtime/v1/' }
      ];

      for (const endpoint of endpoints) {
        try {
          const testUrl = `${supabaseUrl}${endpoint.path}`;
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          });
          
          if (response.ok) {
            addResult(`✅ ${endpoint.name}: 可用`);
          } else {
            addResult(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
          }
        } catch (error: any) {
          addResult(`❌ ${endpoint.name}: ${error.message}`);
        }
      }

      // 6. 檢查 CORS 和網絡問題
      addResult('🌍 CORS 和網絡檢查...');
      addResult(`當前域名: ${window.location.origin}`);
      addResult(`User Agent: ${navigator.userAgent}`);
      
      // 7. 檢查 Supabase 客戶端創建
      addResult('⚙️ Supabase 客戶端創建測試...');
      try {
        // 動態導入以避免 SSR 問題
        const { createClient } = await import('@supabase/supabase-js');
        const testClient = createClient(supabaseUrl, supabaseKey);
        addResult('✅ Supabase 客戶端創建成功');
        
        // 測試最基本的查詢 - 修復版本
        addResult('🔍 測試基本 SELECT 查詢...');
        const { data: selectData, error: selectError } = await testClient
          .from('profiles')
          .select('id, username')
          .limit(1);
          
        if (selectError) {
          addResult(`❌ SELECT 查詢失敗: ${selectError.message}`);
          addResult(`錯誤詳情: ${JSON.stringify(selectError, null, 2)}`);
        } else {
          addResult('✅ SELECT 查詢成功');
          addResult(`查詢結果: ${JSON.stringify(selectData, null, 2)}`);
        }

        // 測試 COUNT 查詢 - 使用不同的方法
        addResult('🔢 測試 COUNT 查詢...');
        const { data: allProfiles, error: countError } = await testClient
          .from('profiles')
          .select('id');
          
        if (countError) {
          addResult(`❌ COUNT 查詢失敗: ${countError.message}`);
          addResult(`錯誤詳情: ${JSON.stringify(countError, null, 2)}`);
        } else {
          const count = allProfiles ? allProfiles.length : 0;
          addResult(`✅ COUNT 查詢成功，找到 ${count} 條記錄`);
        }
      } catch (error: any) {
        addResult(`❌ 客戶端創建失敗: ${error.message}`);
        addResult(`堆疊追蹤: ${error.stack || '無'}`);
      }

    } catch (error: any) {
      addResult(`💥 診斷過程中發生嚴重錯誤: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔬 深層 Supabase 診斷</h1>
        
        <div className="mb-6">
          <button
            onClick={runDeepDiagnostics}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            {isLoading ? '🔄 深度診斷中...' : '🚀 開始深度診斷'}
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">診斷結果</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-400">點擊上方按鈕開始深度診斷...</p>
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
          <p>💡 這個深度診斷會檢查：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>環境變數的詳細內容和格式</li>
            <li>URL 和 API Key 的有效性</li>
            <li>原始 HTTP 請求到 Supabase</li>
            <li>各個 API 端點的可用性</li>
            <li>CORS 和網絡配置</li>
            <li>Supabase 客戶端創建和基本查詢</li>
          </ul>
        </div>
      </div>
    </div>
  );
}