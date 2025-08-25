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
  const [fieldErrors, setFieldErrors] = useState<{email?: string, password?: string, username?: string}>({});

  // 字段验证函数
  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'email':
        if (!value) {
          errors.email = '请输入邮箱地址';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = '请输入有效的邮箱地址';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = '请输入密码';
        } else if (value.length < 6) {
          errors.password = '密码至少需要6位字符';
        } else {
          delete errors.password;
        }
        break;
      case 'username':
        if (isSignUp && !value.trim()) {
          errors.username = '请输入用户名';
        } else {
          delete errors.username;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 表单验证
  const validateForm = () => {
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    const usernameValid = isSignUp ? validateField('username', username) : true;
    
    return emailValid && passwordValid && usernameValid;
  };

  // 如果用户已登入，重定向到主页
  useEffect(() => {
    if (user && !isLoading) {
      console.log('🎆 用户已登录，跳转到星座图');
      router.push('/constellation');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 表单提交触发:', { email, password: '••••••', isSignUp });
    
    // 验证表单
    if (!validateForm()) {
      console.warn('⚠️ 表单验证失败', fieldErrors);
      return;
    }
    
    console.log('✅ 表单验证通过，开始提交...');
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // 注册新遥行者
        console.log('🚀 开始注册用户:', { email, username });
        const { error } = await signUp(email, password, username);
        if (error) {
          console.error('❌ 注册失败:', error);
          setError('创建账户失败：' + error.message);
        } else {
          console.log('✅ 注册成功');
          setSuccess('欢迎来到宇宙！请检查邮箱验证链接。');
        }
      } else {
        // 登入现有遥行者
        console.log('🚀 开始登录用户:', { email });
        console.log('🔗 调用 signIn 函数...');
        
        const signInResult = await signIn(email, password);
        console.log('🔍 signIn 结果:', signInResult);
        
        if (signInResult.error) {
          console.error('❌ 登录失败:', signInResult.error);
          setError('登入失败：' + signInResult.error.message);
        } else {
          console.log('✅ 登录成功，准备跳转');
          // 成功后由认证上下文自动处理跳转
          setSuccess('登录成功！正在进入宇宙...');
        }
      }
    } catch (error) {
      console.error('❌ 认证过程中发生错误:', error);
      setError('发生了未知错误，请稍后再试');
    } finally {
      console.log('🏁 提交流程结束，重置状态');
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
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      validateField('username', e.target.value);
                    }
                  }}
                  onBlur={() => validateField('username', username)}
                  className={`cosmic-input ${fieldErrors.username ? 'border-cosmic-danger' : ''}`}
                  placeholder="输入你在宇宙中的名字"
                  required={isSignUp}
                />
                {fieldErrors.username && (
                  <p className="text-cosmic-danger text-sm mt-1">{fieldErrors.username}</p>
                )}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    validateField('email', e.target.value);
                  }
                }}
                onBlur={() => validateField('email', email)}
                className={`cosmic-input ${fieldErrors.email ? 'border-cosmic-danger' : ''}`}
                placeholder="your@email.com"
                required
              />
              {fieldErrors.email && (
                <p className="text-cosmic-danger text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cosmic-light mb-2">
                宇宙密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    validateField('password', e.target.value);
                  }
                }}
                onBlur={() => validateField('password', password)}
                className={`cosmic-input ${fieldErrors.password ? 'border-cosmic-danger' : ''}`}
                placeholder="输入你的宇宙密码"
                required
                minLength={6}
              />
              {fieldErrors.password && (
                <p className="text-cosmic-danger text-sm mt-1">{fieldErrors.password}</p>
              )}
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
                setFieldErrors({});
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