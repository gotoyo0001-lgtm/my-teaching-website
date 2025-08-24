'use client';

// app/debug/fix-profiles/page.tsx - 修复用户档案数据工具
// 解决"会话存在但档案缺失"问题

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { safeDb, safeAuth } from '@/lib/supabase-safe';

export default function FixProfilesPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [testAccounts, setTestAccounts] = useState([
    { email: 'guardian.test@voyager.com', username: 'guardian_test', displayName: '守护者·测试', role: 'guardian' },
    { email: 'luminary.test@voyager.com', username: 'luminary_test', displayName: '启明者·测试', role: 'luminary' },
    { email: 'catalyst.test@voyager.com', username: 'catalyst_test', displayName: '领航者·测试', role: 'catalyst' },
    { email: 'voyager.test@voyager.com', username: 'voyager_test', displayName: '遥行者·测试', role: 'voyager' }
  ]);

  const log = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fixCurrentUserProfile = async () => {
    if (!user) {
      log('❌ 没有活跃的用户会话');
      return;
    }

    setIsFixing(true);
    log('🔧 开始修复当前用户档案...');

    try {
      // 检查当前用户的档案是否存在
      const { data: existingProfile, error: checkError } = await safeDb.profiles
        .select('*', { id: user.id })
        .single();

      if (existingProfile) {
        log('✅ 用户档案已存在，无需修复');
        return;
      }

      if (checkError && !checkError.message.includes('No rows')) {
        log(`❌ 检查档案时出错: ${checkError.message}`);
        return;
      }

      // 根据邮箱确定角色和信息
      const testAccount = testAccounts.find(acc => acc.email === user.email);
      if (!testAccount) {
        log('❌ 不是测试账号，无法自动修复');
        return;
      }

      // 创建档案数据
      const profileData = {
        id: user.id,
        username: testAccount.username,
        display_name: testAccount.displayName,
        role: testAccount.role,
        bio: getBioByRole(testAccount.role),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(testAccount.role === 'luminary' && {
          luminary_expertise: ['前端开发', 'UI/UX设计', 'TypeScript']
        }),
        ...(testAccount.role === 'catalyst' && {
          catalyst_communities: ['前端开发社群', '设计师联盟', '新手导航']
        }),
        ...(testAccount.role === 'voyager' && {
          voyager_manifesto: '我相信每一次学习都是一次星际旅行，每个知识点都是一颗新星。'
        })
      };

      // 插入档案数据
      const { error: insertError } = await safeDb.profiles.insert(profileData);

      if (insertError) {
        log(`❌ 创建档案失败: ${insertError.message}`);
        return;
      }

      log('✅ 档案创建成功！');
      
      // 刷新认证上下文中的档案数据
      await refreshProfile();
      log('✅ 档案数据已刷新');

    } catch (error) {
      log(`❌ 修复过程中发生错误: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  const getBioByRole = (role: string): string => {
    switch (role) {
      case 'guardian':
        return '我是守护者测试账号，负责维护教学生态系的平衡与秩序。';
      case 'luminary':
        return '我是启明者测试账号，专注于创造和分享知识的光芒。';
      case 'catalyst':
        return '我是领航者测试账号，致力于连接不同学习者并促进协作。';
      case 'voyager':
        return '我是遥行者测试账号，在知识的宇宙中不断探索和学习。';
      default:
        return '测试账号';
    }
  };

  const checkAllTestAccounts = async () => {
    setIsFixing(true);
    log('🔍 检查所有测试账号状态...');

    try {
      for (const account of testAccounts) {
        // 尝试登录并检查档案
        log(`检查 ${account.email}...`);
        
        // 这里只能检查当前登录用户的状态
        if (user?.email === account.email) {
          if (profile) {
            log(`✅ ${account.email}: 档案正常`);
          } else {
            log(`❌ ${account.email}: 档案缺失`);
          }
        } else {
          log(`⚠️ ${account.email}: 需要登录该账号才能检查`);
        }
      }
    } catch (error) {
      log(`❌ 检查过程中发生错误: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-cosmic-void p-6">
      <div className="max-w-4xl mx-auto">
        <div className="cosmic-glass p-8">
          <h1 className="text-3xl font-bold text-cosmic-star mb-6">
            🔧 用户档案修复工具
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cosmic-accent mb-4">问题说明</h2>
            <div className="cosmic-glass p-4 bg-cosmic-warning/10">
              <p className="text-cosmic-light/80">
                当显示"会话存在但档案缺失"时，表明用户可以登录但在 profiles 表中没有对应的记录。
                这会导致无法访问需要用户档案的页面。此工具可以自动修复这个问题。
              </p>
            </div>
          </div>

          {/* 当前用户状态 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cosmic-energy mb-4">当前用户状态</h2>
            <div className="cosmic-glass p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>邮箱:</strong> {user?.email || '未登录'}</div>
                <div><strong>用户ID:</strong> {user?.id || '无'}</div>
                <div><strong>档案状态:</strong> 
                  <span className={profile ? 'text-cosmic-success' : 'text-cosmic-danger'}>
                    {profile ? ' ✅ 正常' : ' ❌ 缺失'}
                  </span>
                </div>
                <div><strong>用户名:</strong> {profile?.username || '无'}</div>
                <div><strong>角色:</strong> {profile?.role || '无'}</div>
                <div><strong>显示名:</strong> {profile?.display_name || '无'}</div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cosmic-warm mb-4">修复操作</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={fixCurrentUserProfile}
                disabled={isFixing || !user}
                className="cosmic-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFixing ? '修复中...' : '修复当前用户档案'}
              </button>
              
              <button
                onClick={checkAllTestAccounts}
                disabled={isFixing}
                className="px-4 py-2 bg-cosmic-energy text-white rounded hover:bg-cosmic-energy/80 disabled:opacity-50"
              >
                检查所有测试账号
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-cosmic-danger text-white rounded hover:bg-cosmic-danger/80"
              >
                清除日志
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cosmic-success text-white rounded hover:bg-cosmic-success/80"
              >
                刷新页面
              </button>
            </div>
          </div>

          {/* 测试账号列表 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cosmic-accent mb-4">测试账号列表</h2>
            <div className="cosmic-glass p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {testAccounts.map((account, index) => (
                  <div key={index} className="p-3 bg-cosmic-deep rounded">
                    <div><strong>{account.displayName}</strong></div>
                    <div>邮箱: {account.email}</div>
                    <div>角色: {account.role}</div>
                    <div>密码: TestPassword123!</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 操作日志 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cosmic-star mb-4">操作日志</h2>
            <div className="cosmic-glass p-4 bg-cosmic-deep max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-cosmic-light/50">暂无日志记录</p>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className="font-mono text-sm text-cosmic-light">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 手动修复说明 */}
          <div>
            <h2 className="text-xl font-semibold text-cosmic-warning mb-4">手动修复说明</h2>
            <div className="cosmic-glass p-4 bg-cosmic-warning/10">
              <div className="space-y-2 text-sm text-cosmic-light/80">
                <p><strong>1. 如果自动修复失败:</strong></p>
                <p>• 在 Supabase 控制台的 SQL Editor 中运行 scripts/fix-profiles-data.sql</p>
                <p><strong>2. 检查RLS策略:</strong></p>
                <p>• 确保 profiles 表的行级安全策略允许用户访问自己的档案</p>
                <p><strong>3. 权限问题:</strong></p>
                <p>• 检查 auth.users 表和 public.profiles 表的关联是否正确</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}