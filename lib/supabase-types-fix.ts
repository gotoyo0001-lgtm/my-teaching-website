// lib/supabase-types-fix.ts
// 全域 Supabase 類型修復方案
// 解決 Supabase 2.56.0 類型推斷問題

import { supabase } from './supabaseClient';
import type { Database } from './database.types';

// 類型安全的 Supabase 查詢包裝器
export const safeSupabaseQueries = {
  // 用戶檔案查詢
  profiles: {
    getAll: async () => {
      const result = await supabase.from('profiles').select('*');
      return result as { 
        data: Database['public']['Tables']['profiles']['Row'][] | null; 
        error: any; 
      };
    },
    
    getWithRoleAndDates: async () => {
      const result = await supabase
        .from('profiles')
        .select('role, created_at, last_seen_at');
      return result as {
        data: Array<{
          role: Database['public']['Tables']['profiles']['Row']['role'];
          created_at: string;
          last_seen_at: string | null;
        }> | null;
        error: any;
      };
    },

    update: async (id: string, data: Database['public']['Tables']['profiles']['Update']) => {
      return await supabase.from('profiles').update(data as any).eq('id', id);
    },

    insert: async (data: Database['public']['Tables']['profiles']['Insert']) => {
      return await supabase.from('profiles').insert(data as any);
    }
  },

  // 課程查詢
  courses: {
    getAll: async () => {
      const result = await supabase.from('courses').select('*');
      return result as { 
        data: Database['public']['Tables']['courses']['Row'][] | null; 
        error: any; 
      };
    },

    getWithStatusAndDates: async () => {
      const result = await supabase
        .from('courses')
        .select('status, created_at');
      return result as {
        data: Array<{
          status: Database['public']['Tables']['courses']['Row']['status'];
          created_at: string;
        }> | null;
        error: any;
      };
    },

    insert: async (data: Database['public']['Tables']['courses']['Insert']) => {
      return await supabase.from('courses').insert(data as any);
    },

    update: async (id: string, data: Database['public']['Tables']['courses']['Update']) => {
      return await supabase.from('courses').update(data as any).eq('id', id);
    }
  },

  // 評論查詢
  comments: {
    getWithAuthor: async () => {
      const result = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(username, display_name, role, avatar_url)
        `);
      return result as { data: any[] | null; error: any; };
    },

    getBasicInfo: async () => {
      const result = await supabase
        .from('comments')
        .select('created_at, is_deleted');
      return result as {
        data: Array<{
          created_at: string;
          is_deleted: boolean;
        }> | null;
        error: any;
      };
    },

    insert: async (data: Database['public']['Tables']['comments']['Insert']) => {
      return await supabase.from('comments').insert([data as any]);
    },

    update: async (id: string, data: Database['public']['Tables']['comments']['Update']) => {
      return await supabase.from('comments').update(data as any).eq('id', id);
    }
  },

  // 投票查詢
  commentVotes: {
    getByUserAndComments: async (userId: string, commentIds: string[]) => {
      const result = await supabase
        .from('comment_votes')
        .select('comment_id, vote_type')
        .eq('user_id', userId)
        .in('comment_id', commentIds);
      return result as {
        data: Array<{
          comment_id: string;
          vote_type: 'upvote' | 'downvote';
        }> | null;
        error: any;
      };
    },

    upsert: async (data: Database['public']['Tables']['comment_votes']['Insert']) => {
      return await supabase.from('comment_votes').upsert(data as any);
    },

    delete: async (userId: string, commentId: string) => {
      return await supabase
        .from('comment_votes')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId);
    }
  },

  // 分類查詢
  categories: {
    getAll: async () => {
      const result = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      return result as {
        data: Array<{
          id: string;
          name: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          parent_id: string | null;
          created_at: string;
        }> | null;
        error: any;
      };
    },

    insert: async (data: Database['public']['Tables']['categories']['Insert']) => {
      return await supabase.from('categories').insert([data as any]);
    },

    update: async (id: string, data: Database['public']['Tables']['categories']['Update']) => {
      return await supabase.from('categories').update(data as any).eq('id', id);
    },

    delete: async (id: string) => {
      return await supabase.from('categories').delete().eq('id', id);
    }
  },

  // 報名記錄查詢
  enrollments: {
    getAll: async () => {
      const result = await supabase.from('enrollments').select('enrolled_at');
      return result as { data: any[] | null; error: any; };
    },

    insert: async (data: Database['public']['Tables']['enrollments']['Insert']) => {
      return await supabase.from('enrollments').insert(data as any);
    }
  }
};

// 預設導出
export default safeSupabaseQueries;