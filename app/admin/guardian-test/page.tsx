'use client';

// app/admin/guardian-test/page.tsx - 守护者测试工具页面
// 完整的守护者功能测试和验证工具

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabaseSafe, safeQueries } from '@/lib/supabase-safe';
import type { ArchetypeRole } from '@/lib/database.types';

interface TestResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  message: string;
  details?: string;
}

interface TestAccount {
  email: string;
  password: string;
  role: ArchetypeRole;
  username: string;
  display_name: string;
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'guardian.test@voyager.com',
    password: 'TestPassword123!',
    role: 'guardian',
    username: 'guardian_test',
    display_name: '守护者·测试'
  },
  {
    email: 'luminary.test@voyager.com',
    password: 'TestPassword123!',
    role: 'luminary',
    username: 'luminary_test',
    display_name: '启明者·测试'
  },
  {
    email: 'catalyst.test@voyager.com',
    password: 'TestPassword123!',
    role: 'catalyst',
    username: 'catalyst_test',
    display_name: '领航者·测试'
  },
  {
    email: 'voyager.test@voyager.com',
    password: 'TestPassword123!',
    role: 'voyager',
    username: 'voyager_test',
    display_name: '遥行者·测试'
  }
];

export default function GuardianTestTool() {
  const { user, isGuardian, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState<string>('all');

  // 添加测试结果
  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  // 清空测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  // 数据库连接测试
  const testDatabaseConnection = async () => {
    addTestResult({
      category: '数据库连接',
      test: 'Supabase 连接测试',
      status: 'running',
      message: '正在测试数据库连接...'
    });

    try {
      const { data, error } = await supabaseSafe
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) throw error;

      addTestResult({
        category: '数据库连接',
        test: 'Supabase 连接测试',
        status: 'pass',
        message: '数据库连接正常',
        details: '成功连接到 Supabase 数据库'
      });
    } catch (error: any) {
      addTestResult({
        category: '数据库连接',
        test: 'Supabase 连接测试',
        status: 'fail',
        message: '数据库连接失败',
        details: error.message
      });
    }
  };

  // 测试账号验证
  const testAccountProfiles = async () => {
    addTestResult({
      category: '测试账号',
      test: '账号档案检查',
      status: 'running',
      message: '正在检查测试账号档案...'
    });

    try {
      // 获取所有测试账号的档案
      const { data: profiles, error } = await supabaseSafe
        .from('profiles')
        .select('*')
        .in('username', TEST_ACCOUNTS.map(acc => acc.username));

      if (error) throw error;

      const missingAccounts = TEST_ACCOUNTS.filter(acc => 
        !profiles?.some(p => p.username === acc.username)
      );

      if (missingAccounts.length === 0) {
        addTestResult({
          category: '测试账号',
          test: '账号档案检查',
          status: 'pass',
          message: `所有 ${TEST_ACCOUNTS.length} 个测试账号档案完整`,
          details: profiles?.map(p => `${p.display_name} (${p.role})`).join(', ')
        });
      } else {
        addTestResult({
          category: '测试账号',
          test: '账号档案检查',
          status: 'warning',
          message: `${missingAccounts.length} 个账号档案缺失`,
          details: missingAccounts.map(acc => acc.display_name).join(', ')
        });
      }
    } catch (error: any) {
      addTestResult({
        category: '测试账号',
        test: '账号档案检查',
        status: 'fail',
        message: '测试账号检查失败',
        details: error.message
      });
    }
  };

  // RLS 策略测试
  const testRLSPolicies = async () => {
    addTestResult({
      category: 'RLS 策略',
      test: '策略安全性检查',
      status: 'running',
      message: '正在检查 RLS 策略...'
    });

    try {
      const { data: policies, error } = await safeQueries.getTablePolicies('profiles');
      if (error) throw error;

      // 检查是否存在不安全的策略
      const unsafePolicies = policies?.filter((p: any) => 
        p.cmd === 'SELECT' && p.qual === 'true'
      );

      const secureSelectPolicies = policies?.filter((p: any) => 
        p.cmd === 'SELECT' && p.qual !== 'true' && p.qual?.includes('auth.uid()')
      );

      if (secureSelectPolicies && secureSelectPolicies.length > 0) {
        addTestResult({
          category: 'RLS 策略',
          test: '策略安全性检查',
          status: 'pass',
          message: '安全策略已正确配置',
          details: `发现 ${policies?.length} 个策略，其中 ${secureSelectPolicies.length} 个安全 SELECT 策略`
        });
      } else if (unsafePolicies && unsafePolicies.length > 0) {
        addTestResult({
          category: 'RLS 策略',
          test: '策略安全性检查',
          status: 'fail',
          message: '发现不安全的策略',
          details: `${unsafePolicies.length} 个策略使用 USING (true)`
        });
      } else {
        addTestResult({
          category: 'RLS 策略',
          test: '策略安全性检查',
          status: 'warning',
          message: '未发现 SELECT 策略',
          details: '可能需要创建 RLS 策略'
        });
      }
    } catch (error: any) {
      addTestResult({
        category: 'RLS 策略',
        test: '策略安全性检查',
        status: 'fail',
        message: 'RLS 策略检查失败',
        details: error.message
      });
    }
  };

  // 守护者功能测试
  const testGuardianFeatures = async () => {
    addTestResult({
      category: '守护者功能',
      test: '管理功能访问',
      status: 'running',
      message: '正在测试守护者功能...'
    });

    try {
      // 测试角色提升函数
      const { data: statsData, error: statsError } = await safeQueries.getUserStatistics();
      if (statsError) throw statsError;

      // 测试安全审计函数
      const { data: auditData, error: auditError } = await safeQueries.performSecurityAudit();
      if (auditError) throw auditError;

      addTestResult({
        category: '守护者功能',
        test: '管理功能访问',
        status: 'pass',
        message: '守护者管理功能正常',
        details: `用户统计：${JSON.stringify(statsData)} | 安全审计：${auditData?.length} 项检查`
      });
    } catch (error: any) {
      addTestResult({
        category: '守护者功能',
        test: '管理功能访问',
        status: 'fail',
        message: '守护者功能测试失败',
        details: error.message
      });
    }
  };

  // 触发器测试
  const testTriggers = async () => {
    addTestResult({
      category: '系统触发器',
      test: '自动 Profile 创建',
      status: 'running',
      message: '正在检查触发器配置...'
    });

    try {
      const { data, error } = await supabaseSafe
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, action_timing')
        .eq('trigger_name', 'on_auth_user_created');

      if (error) throw error;

      if (data && data.length > 0) {
        addTestResult({
          category: '系统触发器',
          test: '自动 Profile 创建',
          status: 'pass',
          message: '触发器配置正确',
          details: `触发器 ${data[0].trigger_name} 已启用`
        });
      } else {
        addTestResult({
          category: '系统触发器',
          test: '自动 Profile 创建',
          status: 'warning',
          message: '未找到触发器配置',
          details: '新用户可能需要手动创建档案'
        });
      }
    } catch (error: any) {
      addTestResult({
        category: '系统触发器',
        test: '自动 Profile 创建',
        status: 'fail',
        message: '触发器检查失败',
        details: error.message
      });
    }
  };

  // 运行完整测试套件
  const runFullTestSuite = async () => {
    setIsRunningTests(true);
    clearResults();

    try {
      await testDatabaseConnection();
      await new Promise(resolve => setTimeout(resolve, 500)); // 小延迟让用户看到进度

      await testAccountProfiles();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testRLSPolicies();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isGuardian) {
        await testGuardianFeatures();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await testTriggers();

      addTestResult({
        category: '测试总结',
        test: '完整测试套件',
        status: 'pass',
        message: '测试套件执行完成',
        details: `共执行 ${testResults.length + 1} 项测试`
      });
    } catch (error: any) {
      addTestResult({
        category: '测试总结',
        test: '完整测试套件',
        status: 'fail',
        message: '测试套件执行失败',
        details: error.message
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  // 修复测试账号
  const fixTestAccounts = async () => {
    addTestResult({
      category: '修复操作',
      test: '账号档案修复',
      status: 'running',
      message: '正在修复测试账号档案...'
    });

    try {
      // 这里可以调用修复脚本或 RPC 函数
      // 目前显示提示信息
      addTestResult({
        category: '修复操作',
        test: '账号档案修复',
        status: 'warning',
        message: '请在 Supabase SQL Editor 中执行修复脚本',
        details: '执行 scripts/complete-database-upgrade.sql 中的第八阶段'
      });
    } catch (error: any) {
      addTestResult({
        category: '修复操作',
        test: '账号档案修复',
        status: 'fail',
        message: '修复操作失败',
        details: error.message
      });
    }
  };

  // 获取测试结果统计
  const getTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'pass').length;
    const failed = testResults.filter(r => r.status === 'fail').length;
    const warnings = testResults.filter(r => r.status === 'warning').length;
    const running = testResults.filter(r => r.status === 'running').length;

    return { total, passed, failed, warnings, running };
  };

  const stats = getTestStats();

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
          <p>只有守护者可以访问测试工具</p>
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
              🧪 守护者测试工具
            </h1>
            <div className="text-sm text-purple-300">
              完整功能验证和诊断工具
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 测试控制面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 测试统计 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
            <h2 className="text-lg font-bold text-white mb-4">测试统计</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">总计</span>
                <span className="text-white font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">通过</span>
                <span className="text-green-400 font-medium">{stats.passed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">失败</span>
                <span className="text-red-400 font-medium">{stats.failed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">警告</span>
                <span className="text-yellow-400 font-medium">{stats.warnings}</span>
              </div>
              {stats.running > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-400">运行中</span>
                  <span className="text-blue-400 font-medium">{stats.running}</span>
                </div>
              )}
            </div>
          </div>

          {/* 测试控制 */}
          <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
            <h2 className="text-lg font-bold text-white mb-4">测试控制</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={runFullTestSuite}
                disabled={isRunningTests}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                {isRunningTests ? '运行中...' : '运行完整测试'}
              </button>
              
              <button
                onClick={testDatabaseConnection}
                disabled={isRunningTests}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                数据库连接
              </button>
              
              <button
                onClick={testAccountProfiles}
                disabled={isRunningTests}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                测试账号
              </button>
              
              <button
                onClick={testRLSPolicies}
                disabled={isRunningTests}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                RLS 策略
              </button>
              
              <button
                onClick={fixTestAccounts}
                disabled={isRunningTests}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                修复账号
              </button>
              
              <button
                onClick={clearResults}
                disabled={isRunningTests}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
              >
                清空结果
              </button>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4">测试结果</h2>
          
          {testResults.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">🧪</div>
              <p>点击上方按钮开始测试</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-700/30 border-l-4 border-l-purple-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-300 text-sm font-medium">
                          {result.category}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-white font-medium">{result.test}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          result.status === 'pass' ? 'bg-green-400' :
                          result.status === 'fail' ? 'bg-red-400' :
                          result.status === 'warning' ? 'bg-yellow-400' :
                          'bg-blue-400 animate-pulse'
                        }`}></div>
                        <span className={`text-sm ${
                          result.status === 'pass' ? 'text-green-300' :
                          result.status === 'fail' ? 'text-red-300' :
                          result.status === 'warning' ? 'text-yellow-300' :
                          'text-blue-300'
                        }`}>
                          {result.message}
                        </span>
                      </div>
                      
                      {result.details && (
                        <div className="text-xs text-gray-400 font-mono bg-slate-900/30 p-2 rounded">
                          {result.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 测试账号信息 */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4">测试账号信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEST_ACCOUNTS.map((account, index) => (
              <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    account.role === 'guardian' ? 'bg-red-400' :
                    account.role === 'catalyst' ? 'bg-yellow-400' :
                    account.role === 'luminary' ? 'bg-blue-400' :
                    'bg-purple-400'
                  }`}></div>
                  <span className="text-white font-medium">{account.display_name}</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>邮箱: {account.email}</div>
                  <div>密码: {account.password}</div>
                  <div>角色: {account.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}