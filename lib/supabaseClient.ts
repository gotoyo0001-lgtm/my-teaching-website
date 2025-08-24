// lib/supabaseClient.ts - 教学生态系感知蓝图客户端配置
import { createClient } from "@supabase/supabase-js";
import type { Database } from './database.types';

// 客户端 Supabase 实例（用于客户端组件）
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 常用的数据库查询工具函数（客户端）
export const supabaseQueries = {
  // 获取用户档案
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // 获取用户的原型角色
  getUserRole: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    return { data: data?.role as Database['public']['Tables']['profiles']['Row']['role'] | undefined, error };
  },

  // 获取已发布的课程列表
  getPublishedCourses: async () => {
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

  // 获取用户的学习记录
  getUserEnrollments: async (userId: string) => {
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
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false });
    
    return { data, error };
  },

  // 获取课程详情
  getCourseDetails: async (courseId: string) => {
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