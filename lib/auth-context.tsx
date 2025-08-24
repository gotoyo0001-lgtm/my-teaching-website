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

  // 获取用户档案
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await safeQueries.getUserProfile(userId);
      if (error) {
        console.error('获取用户档案失败:', error);
        return null;
      }
      // 类型断言，确保数据符合 UserProfile 类型
      return data ? (data as unknown as UserProfile) : null;
    } catch (error) {
      console.error('获取用户档案时发生错误:', error);
      return null;
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
      const { error } = await safeAuth.signIn(email, password);
      return { error };
    } catch (err) {
      console.error('登录时发生错误:', err);
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

  // 监听认证状态变化
  useEffect(() => {
    const {
      data: { subscription },
    } = safeAuth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        // 用户登录，获取档案
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
        
        // 更新最后访问时间
        if (profileData) {
          const updateData = {
            last_seen_at: new Date().toISOString()
          };
          
          await safeDb.profiles.update(session.user.id, updateData);
        }
      } else {
        // 用户登出
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 初始化时获取当前会话
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await safeAuth.getSession();
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      }

      setIsLoading(false);
    };

    getSession();
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

// 自定义钩子：检查用户权限
export function usePermissions() {
  const { role, isGuardian, isLuminary, isCatalyst, profile } = useAuth();

  return {
    // 检查是否可以创建课程
    canCreateCourse: isLuminary || isGuardian,
    
    // 检查是否可以报名课程（所有已认证用户）
    canEnrollCourse: !!profile,
    
    // 检查是否可以管理用户
    canManageUsers: isGuardian,
    
    // 检查是否可以发布神谕
    canCreateOracle: isGuardian,
    
    // 检查是否可以高亮评论
    canHighlightComments: isCatalyst || isGuardian,
    
    // 检查是否可以管理分类
    canManageCategories: isGuardian,
    
    // 检查是否可以查看分析数据
    canViewAnalytics: isLuminary || isCatalyst || isGuardian,
    
    // 检查是否可以提名领航者
    canNominateCatalyst: isLuminary || isGuardian,
  };
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
          { label: '观星台', href: '/observatory', icon: 'eye' },
          { label: '神谕管理', href: '/oracles', icon: 'message-square' },
          { label: '用户管理', href: '/users', icon: 'users' },
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