'use client';

// app/debug/quick-check/page.tsx - 快速连接检查
import { useEffect, useState } from 'react';
import { supabaseSafe } from '@/lib/supabase-safe';

export default function QuickCheck() {
  const [status, setStatus] = useState<{
    connection: string;
    auth: string;
    profiles: string;
    details: any;
  }>({
    connection: '检查中...',
    auth: '检查中...',
    profiles: '检查中...',
    details: null
  });

  useEffect(() => {
    const checkAll = async () => {
      // 1. 检查基础连接
      try {
        const { data, error } = await supabaseSafe.from('profiles').select('count').limit(1);
        if (error) {
          setStatus(prev => ({ 
            ...prev, 
            connection: `❌ 连接失败: ${error.message}`,
            details: { ...error, timestamp: new Date().toISOString() }
          }));
        } else {
          setStatus(prev => ({ ...prev, connection: '✅ 数据库连接正常' }));
        }
      } catch (err: any) {
        setStatus(prev => ({ 
          ...prev, 
          connection: `❌ 连接异常: ${err.message}`,
          details: { ...err, timestamp: new Date().toISOString() }
        }));
      }

      // 2. 检查认证状态
      try {
        const { data: { session }, error } = await supabaseSafe.auth.getSession();
        if (error) {
          setStatus(prev => ({ ...prev, auth: `❌ 认证错误: ${error.message}` }));
        } else {
          setStatus(prev => ({ 
            ...prev, 
            auth: session ? `✅ 已登录: ${session.user.email}` : '⚠️ 未登录'
          }));
        }
      } catch (err: any) {
        setStatus(prev => ({ ...prev, auth: `❌ 认证异常: ${err.message}` }));
      }

      // 3. 检查 profiles 表
      try {
        const { data, error } = await supabaseSafe
          .from('profiles')
          .select('id, username, role')
          .limit(5);
        
        if (error) {
          setStatus(prev => ({ ...prev, profiles: `❌ Profiles 错误: ${error.message}` }));
        } else {
          setStatus(prev => ({ 
            ...prev, 
            profiles: `✅ Profiles 正常 (${data?.length || 0} 条记录)`
          }));
        }
      } catch (err: any) {
        setStatus(prev => ({ ...prev, profiles: `❌ Profiles 异常: ${err.message}` }));
      }
    };

    checkAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 快速连接检查</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-bold">数据库连接</h3>
          <p>{status.connection}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-bold">认证状态</h3>
          <p>{status.auth}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-bold">Profiles 表</h3>
          <p>{status.profiles}</p>
        </div>

        {status.details && (
          <div className="bg-red-900 p-4 rounded">
            <h3 className="font-bold">错误详情</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(status.details, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-bold">环境变量检查</h3>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置'}</p>
          <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已配置' : '❌ 未配置'}</p>
        </div>

        <div className="bg-blue-900 p-4 rounded">
          <h3 className="font-bold">快速修复建议</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>如果连接失败，检查 Supabase URL 和 Key</li>
            <li>如果 Profiles 错误，可能需要临时放宽 RLS 策略</li>
            <li>清除浏览器缓存重试</li>
            <li>检查 Supabase 项目是否暂停</li>
            <li>尝试执行紧急修复脚本：scripts/quick-emergency-fix.sql</li>
          </ul>
        </div>

        <div className="bg-green-900 p-4 rounded">
          <h3 className="font-bold">实时诊断</h3>
          <p className="text-sm mb-2">检查时间: {new Date().toLocaleString('zh-CN')}</p>
          <div className="space-y-1 text-sm">
            <div>🌐 网站状态: https://my-voyager.netlify.app</div>
            <div>🔍 诊断页面: /debug/quick-check</div>
            <div>🛡️ 守护者测试: /admin/guardian-test</div>
            <div>⚡ 紧急修复: scripts/quick-emergency-fix.sql</div>
          </div>
        </div>
      </div>
    </div>
  );
}