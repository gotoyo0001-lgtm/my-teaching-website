'use client';

// app/debug/connection/page.tsx - 简化的连接状态检查

import { useState, useEffect } from 'react';
import { supabaseSafe, safeAuth } from '@/lib/supabase-safe';

export default function ConnectionDebugPage() {
  const [results, setResults] = useState({
    envVars: '检查中...',
    connection: '检查中...',
    auth: '检查中...',
    database: '检查中...'
  });

  useEffect(() => {
    runQuickTests();
  }, []);

  const runQuickTests = async () => {
    // 1. 环境变量检查
    const envCheck = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      return `URL: ${url ? '✅' : '❌'} | Key: ${key ? '✅' : '❌'}`;
    };

    // 2. 连接测试
    const connectionTest = async () => {
      try {
        const { data, error } = await safeAuth.getSession();
        return error ? `❌ ${error.message}` : '✅ 连接正常';
      } catch (err) {
        return `❌ 连接失败: ${err}`;
      }
    };

    // 3. 认证测试
    const authTest = async () => {
      try {
        // 尝试无效登录，应该返回预期错误
        const { error } = await supabaseSafe.auth.signInWithPassword({
          email: 'test@invalid.com',
          password: 'invalid'
        });
        return error?.message.includes('Invalid') ? '✅ 认证服务正常' : '⚠️ 异常响应';
      } catch (err) {
        return `❌ 认证测试失败: ${err}`;
      }
    };

    // 4. 数据库测试
    const databaseTest = async () => {
      try {
        const { error } = await supabaseSafe.from('profiles').select('count').limit(1);
        return error ? 
          (error.message.includes('permission') ? '✅ RLS正常工作' : `❌ ${error.message}`) : 
          '✅ 查询成功';
      } catch (err) {
        return `❌ 数据库测试失败: ${err}`;
      }
    };

    // 执行所有测试
    setResults({
      envVars: envCheck(),
      connection: await connectionTest(),
      auth: await authTest(),
      database: await databaseTest()
    });
  };

  return (
    <div className="min-h-screen bg-cosmic-void p-6">
      <div className="max-w-2xl mx-auto">
        <div className="cosmic-glass p-6">
          <h1 className="text-2xl font-bold text-cosmic-star mb-6">
            🔍 Supabase 连接状态检查
          </h1>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-cosmic-deep rounded">
              <span className="font-medium">环境变量:</span>
              <span className="font-mono text-sm">{results.envVars}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-cosmic-deep rounded">
              <span className="font-medium">基础连接:</span>
              <span className="font-mono text-sm">{results.connection}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-cosmic-deep rounded">
              <span className="font-medium">认证服务:</span>
              <span className="font-mono text-sm">{results.auth}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-cosmic-deep rounded">
              <span className="font-medium">数据库查询:</span>
              <span className="font-mono text-sm">{results.database}</span>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={runQuickTests}
              className="cosmic-button"
            >
              重新测试
            </button>
            
            <button
              onClick={() => window.location.href = '/debug/production'}
              className="px-4 py-2 bg-cosmic-energy text-white rounded hover:bg-cosmic-energy/80"
            >
              详细诊断
            </button>
          </div>

          <div className="mt-6 p-4 bg-cosmic-accent/10 rounded text-sm">
            <h3 className="font-semibold mb-2">快速诊断说明:</h3>
            <ul className="space-y-1 text-cosmic-light/70">
              <li>• ✅ 表示功能正常</li>
              <li>• ❌ 表示存在问题</li>
              <li>• ⚠️ 表示需要注意但可能正常</li>
              <li>• "RLS正常工作" 表示行级安全策略按预期阻止未授权访问</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}