'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SimpleSupabaseTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runSimpleTest = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      addResult('🚀 開始簡化測試...');
      
      // 創建 Supabase 客戶端
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      if (!supabaseUrl || !supabaseKey) {
        addResult('❌ 環境變數缺失！');
        return;
      }

      addResult('📝 環境變數檢查完成');
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      addResult('✅ Supabase 客戶端創建成功');

      // 測試 1: 最基本的 SELECT 查詢
      addResult('🔍 測試 1: 基本 SELECT 查詢...');
      try {
        const { data: basicData, error: basicError } = await supabase
          .from('profiles')
          .select('id, username, role')
          .limit(3);
          
        if (basicError) {
          addResult(`❌ SELECT 失敗: ${basicError.message}`);
          addResult(`❌ 錯誤碼: ${basicError.code || '無'}`);
          addResult(`❌ 錯誤詳情: ${basicError.details || '無'}`);
          addResult(`❌ 錯誤提示: ${basicError.hint || '無'}`);
        } else {
          addResult(`✅ SELECT 成功，找到 ${basicData?.length || 0} 條記錄`);
          if (basicData && basicData.length > 0) {
            addResult(`📄 示例數據: ${JSON.stringify(basicData[0], null, 2)}`);
          }
        }
      } catch (selectError: any) {
        addResult(`💥 SELECT 異常: ${selectError.message}`);
        addResult(`💥 堆疊: ${selectError.stack}`);
      }

      // 測試 2: 計數查詢（使用不同方法）
      addResult('🔢 測試 2: 計數查詢...');
      try {
        const { data: countData, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });
          
        if (countError) {
          addResult(`❌ COUNT 失敗: ${countError.message}`);
        } else {
          addResult(`✅ COUNT 成功，總記錄數: ${countData?.length || 0}`);
        }
      } catch (countErrorException: any) {
        addResult(`💥 COUNT 異常: ${countErrorException.message}`);
      }

      // 測試 3: 認證狀態檢查
      addResult('🔐 測試 3: 認證狀態檢查...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addResult(`❌ 認證檢查失敗: ${sessionError.message}`);
        } else if (session) {
          addResult(`✅ 用戶已登入: ${session.user.email}`);
        } else {
          addResult(`ℹ️ 用戶未登入（匿名狀態）`);
        }
      } catch (authError: any) {
        addResult(`💥 認證檢查異常: ${authError.message}`);
      }

      // 測試 4: 直接 HTTP API 測試
      addResult('🌐 測試 4: 直接 HTTP API...');
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const httpData = await response.json();
          addResult(`✅ HTTP API 成功: ${JSON.stringify(httpData)}`);
        } else {
          const errorText = await response.text();
          addResult(`❌ HTTP API 失敗 (${response.status}): ${errorText}`);
        }
      } catch (httpError: any) {
        addResult(`💥 HTTP API 異常: ${httpError.message}`);
      }

      addResult('🎯 測試完成！');

    } catch (error: any) {
      addResult(`💥 測試過程中發生嚴重錯誤: ${error.message}`);
      addResult(`💥 錯誤堆疊: ${error.stack}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 簡化 Supabase 測試</h1>
        <p className="text-gray-300 mb-6">
          此頁面使用修復後的查詢方法測試 Supabase 連接
        </p>
        
        <div className="mb-6">
          <button
            onClick={runSimpleTest}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            {isLoading ? '🔄 測試中...' : '🚀 運行簡化測試'}
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">測試結果</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-400">點擊上方按鈕開始測試...</p>
            ) : (
              results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm font-mono break-all ${
                    result.includes('❌') || result.includes('💥') ? 'bg-red-900/50 text-red-200' :
                    result.includes('✅') ? 'bg-green-900/50 text-green-200' :
                    result.includes('ℹ️') ? 'bg-blue-900/50 text-blue-200' :
                    'bg-gray-700/50'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
          <h3 className="font-semibold text-yellow-200 mb-2">🔧 修復說明</h3>
          <ul className="text-sm text-yellow-100 space-y-1">
            <li>• 移除了 count(*) 查詢，改用 select() 後計算 length</li>
            <li>• 添加了詳細的錯誤信息輸出</li>
            <li>• 使用了多種測試方法驗證連接</li>
            <li>• 改善了異常處理機制</li>
          </ul>
        </div>
      </div>
    </div>
  );
}