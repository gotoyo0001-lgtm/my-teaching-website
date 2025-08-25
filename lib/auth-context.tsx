'use client';

// lib/auth-context.tsx - 教学生态系认证上下文
// 管理用户状态、原型角色和宇宙中的身份

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabaseSafe, safeAuth, safeQueries, safeDb } from './supabase-safe';
import type { ArchetypeRole } from './database.types';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: ArchetypeRole;
  voyager_manifesto: string | null;
  luminary_expertise: string[] | null;
  catalyst_communities: string[] | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

interface AuthContextType {
  // 基础认证状态
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  
  // 角色相关
  role: ArchetypeRole | null;
  isVoyager: boolean;
  isLuminary: boolean;
  isCatalyst: boolean;
  isGuardian: boolean;
  
  // 认证操作
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 计算角色相关的布尔值
  const role = profile?.role || null;
  const isVoyager = role === 'voyager';
  const isLuminary = role === 'luminary';
  const isCatalyst = role === 'catalyst';
  const isGuardian = role === 'guardian';
  
  // 添加详细的调试日志（只在客户端环境下）
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🎯 当前认证状态:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      role, 
      isGuardian,
      userEmail: user?.email,
      profileLoaded: !!profile,
      isLoading
    });
  }

  // 获取用户档案 - 优化性能和错误处理，减少超时时间
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('🔍 正在获取用户档案, userId:', userId);
      }
      
      // 使用Promise.race实现超时机制
      const queryPromise = supabaseSafe
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 2000); // 2秒超时
      });
      
      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          if (typeof window !== 'undefined') {
            console.error('❌ 获取用户档案失败:', error);
          }
          return null;
        }
        
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('✅ 用户档案获取成功:', data);
        }
        
        return data ? (data as UserProfile) : null;
      } catch (timeoutError: unknown) {
        if (timeoutError instanceof Error && timeoutError.message === 'Timeout') {
          console.warn('⚠️ 用户档案查询超时（2秒），使用缓存或默认值');
          // 超时后返回基本用户信息，允许用户正常登录
          return {
            id: userId,
            username: 'loading...',
            display_name: '加载中...',
            role: 'voyager', // 默认角色
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserProfile;
        }
        throw timeoutError;
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('❌ 获取用户档案时发生错误:', error);
      }
      // 即使出错也返回基本信息，确保用户能正常登录
      return {
        id: userId,
        username: 'user_' + userId.slice(0, 8),
        display_name: '遥行者',
        role: 'voyager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }
  };

  // 刷新用户档案
  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchUserProfile(user.id);
    setProfile(profileData);
  };

  // 登录
  const signIn = async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
    try {
      console.log('🔐 认证上下文：开始 signIn 调用:', { email });
      console.log('🔗 调用 safeAuth.signIn...');
      
      const result = await safeAuth.signIn(email, password);
      console.log('📋 safeAuth.signIn 结果:', result);
      
      if (result.error) {
        console.error('❌ safeAuth.signIn 返回错误:', result.error);
      } else {
        console.log('✅ safeAuth.signIn 成功');
      }
      
      return { error: result.error };
    } catch (err) {
      console.error('💥 signIn 函数捕获异常:', err);
      return { error: err as Error };
    }
  };

  // 注册
  const signUp = async (email: string, password: string, username: string): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { data, error } = await safeAuth.signUp(email, password);

      if (error) return { error };

      // 如果注册成功，创建用户档案
      if (data.user) {
        const profileData = {
          id: data.user.id,
          username,
          role: 'voyager' as const, // 默认角色为遥行者
        };
        
        const { error: profileError } = await safeDb.profiles.insert(profileData);

        if (profileError) {
          console.error('创建用户档案失败:', profileError);
          return { error: new Error(`创建用户档案失败: ${profileError.message}`) };
        }
      }

      return { error: null };
    } catch (err) {
      console.error('注册时发生错误:', err);
      return { error: err as Error };
    }
  };

  // 登出
  const signOut = async () => {
    await safeAuth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // 更新档案
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: AuthError | Error | null }> => {
    if (!user) return { error: new Error('用户未登录') };

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error } = await safeDb.profiles.update(user.id, updateData);

      if (!error) {
        await refreshProfile();
      }

      return { error };
    } catch (err) {
      console.error('更新档案时发生错误:', err);
      return { error: err as Error };
    }
  };

  // 监听认证状态变化 - 高度优化性能，非阻塞式加载
  useEffect(() => {
    let mounted = true;
    
    const {
      data: { subscription },
    } = safeAuth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 认证状态变化:', event, '用户:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        console.log('🚀 用户登录成功，异步获取档案...');
        
        // 立即设置加载完成，不等待档案加载
        setIsLoading(false);
        
        // 异步获取档案，不阻塞UI
        fetchUserProfile(session.user.id)
          .then(profileData => {
            if (mounted && profileData) {
              console.log('✅ 用户档案加载完成:', profileData.display_name, '角色:', profileData.role);
              setProfile(profileData);
              
              // 异步更新最后访问时间，不等待结果
              const updateData = {
                last_seen_at: new Date().toISOString()
              };
              
              safeDb.profiles.update(session.user.id, updateData).catch(err => {
                console.warn('更新最后访问时间失败:', err);
              });
            }
          })
          .catch(err => {
            console.warn('获取用户档案失败，检查是否为守护者账号:', err);
            if (mounted) {
              // 特殊处理：如果是守护者测试账号，设置正确的角色
              const isGuardianTestAccount = session.user.email === 'guardian.test@voyager.com';
              
              setProfile({
                id: session.user.id,
                username: isGuardianTestAccount ? 'guardian_test' : 'user_' + session.user.id.slice(0, 8),
                display_name: isGuardianTestAccount ? '守护者·测试' : '遥行者',
                role: isGuardianTestAccount ? 'guardian' : 'voyager',
                bio: isGuardianTestAccount ? '我是守护者测试账号，负责维护教学生态系的平衡与秩序。' : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as UserProfile);
              
              console.log('🛡️ 已为账号设置', isGuardianTestAccount ? '守护者' : '默认', '权限');
            }
          });
      } else {
        // 用户登出
        console.log('🚪 用户登出');
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 初始化时获取当前会话 - 优化性能
  useEffect(() => {
    let mounted = true;
    
    const getSession = async () => {
      try {
        const { data: { session } } = await safeAuth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          // 异步获取用户档案，不阻塞初始加载
          fetchUserProfile(session.user.id).then(profileData => {
            if (mounted) {
              setProfile(profileData);
            }
          }).catch(err => {
            console.warn('初始化时获取用户档案失败:', err);
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('获取会话失败:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();
    
    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    user,
    session,
    profile,
    isLoading,
    role,
    isVoyager,
    isLuminary,
    isCatalyst,
    isGuardian,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}

// 自定义钩子：检查用户权限 - 优化性能和准确性
export function usePermissions() {
  const { role, isGuardian, isLuminary, isCatalyst, profile, isLoading } = useAuth();
  
  // 添加调试信息（只在开发环境下）
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔐 权限检查详情:', {
      hasProfile: !!profile,
      profileRole: profile?.role,
      computedRole: role,
      isGuardian,
      isLuminary,
      isCatalyst,
      userId: profile?.id,
      isLoading
    });
  }
  
  // 确保权限检查基于实际的用户档案，并处理加载状态
  if (isLoading || !profile) {
    return {
      canCreateCourse: false,
      canEnrollCourse: false,
      canManageUsers: false,
      canCreateOracle: false,
      canHighlightComments: false,
      canManageCategories: false,
      canViewAnalytics: false,
      canNominateCatalyst: false,
      canAccessAdmin: false,
      canAccessObservatory: false
    };
  }
  
  const actualRole = profile.role;
  const actualIsGuardian = actualRole === 'guardian';
  const actualIsLuminary = actualRole === 'luminary';
  const actualIsCatalyst = actualRole === 'catalyst';
  
  const permissions = {
    // 检查是否可以创建课程
    canCreateCourse: actualIsLuminary || actualIsGuardian,
    
    // 检查是否可以报名课程（所有已认证用户）
    canEnrollCourse: !!profile,
    
    // 检查是否可以管理用户
    canManageUsers: actualIsGuardian,
    
    // 检查是否可以发布神谕
    canCreateOracle: actualIsGuardian,
    
    // 检查是否可以高亮评论
    canHighlightComments: actualIsCatalyst || actualIsGuardian,
    
    // 检查是否可以管理分类
    canManageCategories: actualIsGuardian,
    
    // 检查是否可以查看分析数据
    canViewAnalytics: actualIsLuminary || actualIsCatalyst || actualIsGuardian,
    
    // 检查是否可以提名领航者
    canNominateCatalyst: actualIsLuminary || actualIsGuardian,
    
    // 检查是否可以访问管理功能
    canAccessAdmin: actualIsGuardian,
    
    // 检查是否可以访问观星台
    canAccessObservatory: actualIsGuardian
  };
  
  // 添加调试信息（只在开发环境下）
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('✅ 最终权限结果:', permissions);
  }
  
  return permissions;
}

// 自定义钩子：获取角色特定的导航项
export function useRoleNavigation() {
  const { role } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { label: '知识星图', href: '/constellation', icon: 'map' },
      { label: '我的星座', href: '/my-constellation', icon: 'star' },
    ];

    switch (role) {
      case 'guardian':
        return [
          ...baseItems,
          { label: '观星台', href: '/admin/observatory', icon: 'eye' },
          { label: '神谕管理', href: '/admin/oracles', icon: 'message-square' },
          { label: '用户管理', href: '/admin/users', icon: 'users' },
          { label: '管理控制台', href: '/admin', icon: 'shield' },
        ];
      
      case 'luminary':
        return [
          ...baseItems,
          { label: '我的工作室', href: '/studio', icon: 'edit' },
          { label: '思想漣漪', href: '/ripples', icon: 'radio' },
        ];
      
      case 'catalyst':
        return [
          ...baseItems,
          { label: '营火地图', href: '/campfire', icon: 'flame' },
          { label: '社群引导', href: '/mentoring', icon: 'compass' },
        ];
      
      case 'voyager':
      default:
        return baseItems;
    }
  };

  return { navigationItems: getNavigationItems() };
}