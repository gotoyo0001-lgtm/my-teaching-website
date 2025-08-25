'use client';

import { useAuth, usePermissions, useRoleNavigation } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { canManageUsers, canCreateOracle, canManageCategories, canViewAnalytics } = usePermissions();
  const { navigationItems } = useRoleNavigation();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 如果在登入頁面，不顯示導航
  if (pathname === '/login' || pathname === '/auth/callback') {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'guardian': return { name: '守護者', color: 'text-cosmic-danger', icon: '🛡️' };
      case 'luminary': return { name: '啟明者', color: 'text-cosmic-accent', icon: '⭐' };
      case 'catalyst': return { name: '領航者', color: 'text-cosmic-energy', icon: '🧭' };
      case 'voyager': return { name: '遥行者', color: 'text-cosmic-info', icon: '🚀' };
      default: return { name: '訪客', color: 'text-cosmic-light', icon: '👤' };
    }
  };

  const roleDisplay = profile ? getRoleDisplay(profile.role) : getRoleDisplay('guest');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cosmic-void/80 backdrop-blur-md border-b border-cosmic-accent/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-cosmic-star">Voyager Universe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                {/* 基礎導航項目 */}
                {navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-cosmic-accent/20 text-cosmic-accent'
                        : 'text-cosmic-light hover:text-cosmic-accent hover:bg-cosmic-accent/10'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* 守護者專用管理入口 */}
                {profile?.role === 'guardian' && (
                  <Link
                    href="/admin"
                    onClick={(e) => {
                      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                        console.log('🔗 管理控制台链接被点击!', { 
                          href: '/admin', 
                          userRole: profile?.role,
                          timestamp: new Date().toISOString()
                        });
                      }
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActive('/admin')
                        ? 'bg-cosmic-danger/20 text-cosmic-danger'
                        : 'text-cosmic-light hover:text-cosmic-danger hover:bg-cosmic-danger/10'
                    }`}
                  >
                    <span>🛡️</span>
                    <span>管理控制台</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <div className="flex items-center space-x-3">
                {/* 用戶資訊 */}
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-cosmic-star">
                    {profile.display_name || profile.username}
                  </div>
                  <div className={`text-xs ${roleDisplay.color} flex items-center justify-end`}>
                    <span className="mr-1">{roleDisplay.icon}</span>
                    {roleDisplay.name}
                  </div>
                </div>

                {/* 頭像 */}
                <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* 登出按鈕 */}
                <button
                  onClick={signOut}
                  className="text-cosmic-light hover:text-cosmic-accent transition-colors duration-200"
                  title="登出"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="cosmic-button bg-cosmic-accent text-white"
              >
                登入
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-cosmic-light hover:text-cosmic-accent"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cosmic-accent/20">
            {user && (
              <div className="space-y-2">
                {navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-cosmic-accent/20 text-cosmic-accent'
                        : 'text-cosmic-light hover:text-cosmic-accent hover:bg-cosmic-accent/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* 守護者管理選項 */}
                {profile?.role === 'guardian' && (
                  <>
                    <div className="border-t border-cosmic-accent/20 my-2 pt-2">
                      <div className="text-xs text-cosmic-danger font-medium px-3 py-1">守護者管理</div>
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-cosmic-light hover:text-cosmic-danger hover:bg-cosmic-danger/10"
                    >
                      🛡️ 控制台
                    </Link>
                    {canManageUsers && (
                      <Link
                        href="/admin/users"
                        onClick={(e) => {
                          setIsMenuOpen(false);
                          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                            console.log('🔗 用户管理链接被点击!', { 
                              href: '/admin/users', 
                              userRole: profile?.role,
                              canManageUsers,
                              timestamp: new Date().toISOString()
                            });
                          }
                        }}
                        className="block px-3 py-2 rounded-md text-cosmic-light hover:text-cosmic-danger hover:bg-cosmic-danger/10"
                      >
                        👥 用戶管理
                      </Link>
                    )}
                    {canCreateOracle && (
                      <Link
                        href="/admin/oracles"
                        onClick={(e) => {
                          setIsMenuOpen(false);
                          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                            console.log('🔗 神谕管理链接被点击!', { 
                              href: '/admin/oracles', 
                              userRole: profile?.role,
                              canCreateOracle,
                              timestamp: new Date().toISOString()
                            });
                          }
                        }}
                        className="block px-3 py-2 rounded-md text-cosmic-light hover:text-cosmic-danger hover:bg-cosmic-danger/10"
                      >
                        📢 神諭管理
                      </Link>
                    )}
                    {canManageCategories && (
                      <Link
                        href="/admin/categories"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-cosmic-light hover:text-cosmic-danger hover:bg-cosmic-danger/10"
                      >
                        📁 分類管理
                      </Link>
                    )}
                    {canViewAnalytics && (
                      <Link
                        href="/admin/analytics"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-cosmic-light hover:text-cosmic-danger hover:bg-cosmic-danger/10"
                      >
                        📊 系統統計
                      </Link>
                    )}
                  </>
                )}

                {/* 用戶資訊（移動端） */}
                {profile && (
                  <div className="border-t border-cosmic-accent/20 mt-4 pt-4 px-3">
                    <div className="text-sm font-medium text-cosmic-star">
                      {profile.display_name || profile.username}
                    </div>
                    <div className={`text-xs ${roleDisplay.color} flex items-center`}>
                      <span className="mr-1">{roleDisplay.icon}</span>
                      {roleDisplay.name}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}