'use client';

// app/page.tsx - 宇宙入口
// 教学生态系感知蓝图的首页

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 简化首页加载逻辑，不自动跳转
    // 让用户手动选择是否进入星座图
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100); // 快速显示内容
    
    return () => clearTimeout(timer);
  }, []);

  // 优化加载状态 - 只在必要时显示
  if (!mounted || !showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-void">
        <div className="text-center">
          {/* 简化的加载动画 */}
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cosmic-accent/30 animate-ping"></div>
            <div className="relative rounded-full border-2 border-cosmic-accent animate-spin">
              <div className="w-12 h-12 rounded-full border-l-2 border-transparent"></div>
            </div>
          </div>
          <span className="text-cosmic-light text-sm">正在连接宇宙...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 宇宙动态背景 */}
      <div className="absolute inset-0">
        {/* 主色调渐变 */}
        <div className="absolute inset-0 bg-gradient-radial from-cosmic-accent/5 via-cosmic-void to-cosmic-deep"></div>
        
        {/* 浮动的星云 */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cosmic-energy/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cosmic-warm/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* 优化的星星效果 - 减少DOM元素数量 */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cosmic-star rounded-full opacity-40"
              style={{
                left: `${20 + i * 10}%`,
                top: `${15 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 导航栏 */}
        <nav className="p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-cosmic-star">
                Voyager Universe
              </h1>
            </div>
            
            <div className="space-x-4">
              {/* 根据用户状态显示不同按钮 */}
              {user ? (
                <Link 
                  href="/constellation" 
                  className="cosmic-button"
                >
                  进入星座图
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="cosmic-button"
                >
                  进入宇宙
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 主要内容区域 */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* 主标题 */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cosmic-accent via-cosmic-energy to-cosmic-warm bg-clip-text text-transparent">
                  教学生态系
                </span>
                <br />
                <span className="text-cosmic-star">
                  感知蓝图
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-cosmic-light/80 mb-8 leading-relaxed">
                培育一个<span className="text-cosmic-warm font-semibold">活的宇宙</span>，
                在这里知识如同星云，<br />
                在个体的碰撞、诠释与再创造中，<br />
                不断凝聚、爆发，誕生出新的<span className="text-cosmic-accent font-semibold">恒星</span>
              </p>
            </div>

            {/* 四种原型介绍 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="cosmic-glass p-6 group hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-guardian to-cosmic-energy rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-guardian mb-2">守护者</h3>
                <p className="text-sm text-cosmic-light/70">
                  宇宙平衡的感知者，维护核心的物理法则
                </p>
              </div>
              
              <div className="cosmic-glass p-6 group hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-luminary mb-2">启明者</h3>
                <p className="text-sm text-cosmic-light/70">
                  思想的恒星，用光与热点燃周围的星尘
                </p>
              </div>
              
              <div className="cosmic-glass p-6 group hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-catalyst to-cosmic-success rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-catalyst mb-2">领航者</h3>
                <p className="text-sm text-cosmic-light/70">
                  引力的编织者，牵引并编织成璀璨的星河
                </p>
              </div>
              
              <div className="cosmic-glass p-6 group hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-voyager to-cosmic-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-voyager mb-2">遥行者</h3>
                <p className="text-sm text-cosmic-light/70">
                  宇宙的探索家，驾驶意识的飞船开辟航线
                </p>
              </div>
            </div>

            {/* 行动召唤 */}
            <div className="space-y-6">
              <div className="space-x-4">
                {/* 根据用户状态显示不同按钮 */}
                {user ? (
                  <>
                    <Link 
                      href="/constellation" 
                      className="cosmic-button text-lg px-8 py-4"
                    >
                      探索知识星图
                    </Link>
                    <Link 
                      href="/my-constellation" 
                      className="cosmic-button-secondary text-lg px-8 py-4"
                    >
                      我的星座
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="cosmic-button text-lg px-8 py-4"
                    >
                      开始你的星际之旅
                    </Link>
                    <Link 
                      href="/login" 
                      className="cosmic-button-secondary text-lg px-8 py-4"
                    >
                      了解更多
                    </Link>
                  </>
                )}
              </div>
              
              <p className="text-cosmic-light/60 text-sm">
                {user ? (
                  `欢迎回来，${profile?.display_name || profile?.username || '遥行者'}！继续你的星际探索之旅`
                ) : (
                  '加入宇宙，发现你的星座，点亮你的知识恒星'
                )}
              </p>
            </div>
          </div>
        </main>

        {/* 底部信息 */}
        <footer className="p-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="border-t border-cosmic-glass-medium pt-6">
              <p className="text-cosmic-light/50 text-sm">
                "我们的使命不是构建一个“平台”，而是培育一片能自我演化、充满生命力的知识宇宙。"
              </p>
              <p className="text-cosmic-light/30 text-xs mt-2">
                Voyager Universe © 2025 - 教学生态系感知蓝图 v4.0
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}