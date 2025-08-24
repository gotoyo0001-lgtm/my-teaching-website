// lib/supabase-server.ts - 服務端 Supabase 客戶端配置
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from './database.types.js';

// 服務端 Supabase 實例（用於服務端組件和 API 路由）
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// 常用的數據庫查詢工具函數（服務端）
export const supabaseServerQueries = {
  // 獲取用戶檔案
  getUserProfile: async (userId: string) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // 獲取用戶的原型角色
  getUserRole: async (userId: string) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    return { data: data?.role, error };
  },

  // 獲取已發布的課程列表
  getPublishedCourses: async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        creator:profiles!creator_id(
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 獲取用戶的學習記錄
  getUserEnrollments: async (userId: string) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          id,
          title,
          description,
          cover_image_url,
          category,
          creator:profiles!creator_id(
            username,
            display_name
          )
        )
      `)
      .eq('voyager_id', userId)
      .order('last_accessed_at', { ascending: false });
    
    return { data, error };
  },

  // 獲取課程詳情
  getCourseDetails: async (courseId: string) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        creator:profiles!creator_id(
          username,
          display_name,
          avatar_url,
          bio
        ),
        lessons(
          id,
          title,
          description,
          order_index,
          estimated_duration
        )
      `)
      .eq('id', courseId)
      .single();
    
    return { data, error };
  },
};