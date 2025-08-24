'use client';

// app/login/page.tsx - 登入星门
// 遥行者的宇宙入口

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, isLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 如果用户已登入，重定向到主页
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/constellation');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // 注册新遥行者
        if (!username.trim()) {
          setError('请输入你的星际称号');
          return;
        }
        
        const { error } = await signUp(email, password, username);
        if (error) {
          setError('创建账户失败：' + error.message);
        } else {
          setSuccess('欢迎来到宇宙！请检查邮箱验证链接。');
        }
      } else {
        // 登入现有遥行者
        const { error } = await signIn(email, password);
        if (error) {
          setError('登入失败：' + error.message);
        } else {
          router.push('/constellation');
        }
      }
    } catch (error) {
      setError('发生了未知错误，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在连接宇宙...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 背景星云效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cosmic-energy/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* 主要登入表单 */}
        <div className="cosmic-glass p-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cosmic-star mb-2">
              {isSignUp ? '加入宇宙' : '返回宇宙'}
            </h1>
            <p className="text-cosmic-light/70">
              {isSignUp 
                ? '欢迎成为新的遥行者，开始你的知识远征' 
                : '欢迎回家，继续你的星际之旅'
              }
            </p>
          </div>

          {/* 错误和成功消息 */}
          {error && (
            <div className="mb-4 p-4 bg-cosmic-danger/20 border border-cosmic-danger/50 rounded-lg text-cosmic-danger text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-cosmic-success/20 border border-cosmic-success/50 rounded-lg text-cosmic-success text-sm">
              {success}
            </div>
          )}

          {/* 登入表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-cosmic-light mb-2">
                  星际称号
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="cosmic-input"
                  placeholder="输入你在宇宙中的名字"
                  required={isSignUp}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cosmic-light mb-2">
                星际邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cosmic-input"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cosmic-light mb-2">
                宇宙密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cosmic-input"
                placeholder="输入你的宇宙密码"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="cosmic-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="cosmic-loading mr-2"></div>
                  {isSignUp ? '正在创建账户...' : '正在登入...'}
                </div>
              ) : (
                isSignUp ? '开始遥征' : '进入宇宙'
              )}
            </button>
          </form>

          {/* 切换模式 */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-cosmic-accent hover:text-cosmic-energy transition-colors duration-200"
            >
              {isSignUp 
                ? '已有账户？返回宇宙' 
                : '新遥行者？加入宇宙'
              }
            </button>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-cosmic-light/70 hover:text-cosmic-light transition-colors duration-200"
          >
            ← 返回主页
          </Link>
        </div>
      </div>
    </div>
  );
}