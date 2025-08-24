// lib/supabase-safe.ts - 类型安全的Supabase客户端包装器
// 解决TypeScript类型错误和提供更好的开发体验

import { createClient } from '@supabase/supabase-js';

// 创建类型安全的Supabase客户端
export const supabaseSafe = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'voyager-universe-safe@1.0.0',
      },
    },
  }
);

// 类型安全的数据库操作封装
export const safeDb = {
  // 用户档案操作
  profiles: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('profiles').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async insert(data: any) {
      return supabaseSafe.from('profiles').insert(data);
    },

    async update(id: string, data: any) {
      return supabaseSafe.from('profiles').update(data).eq('id', id);
    },

    async delete(id: string) {
      return supabaseSafe.from('profiles').delete().eq('id', id);
    }
  },

  // 课程操作
  courses: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('courses').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async insert(data: any) {
      return supabaseSafe.from('courses').insert(data);
    },

    async update(id: string, data: any) {
      return supabaseSafe.from('courses').update(data).eq('id', id);
    },

    async delete(id: string) {
      return supabaseSafe.from('courses').delete().eq('id', id);
    }
  },

  // 评论操作
  comments: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('comments').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async insert(data: any) {
      return supabaseSafe.from('comments').insert(data);
    },

    async update(id: string, data: any) {
      return supabaseSafe.from('comments').update(data).eq('id', id);
    },

    async delete(id: string) {
      return supabaseSafe.from('comments').delete().eq('id', id);
    }
  },

  // 分类操作
  categories: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('categories').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async insert(data: any) {
      return supabaseSafe.from('categories').insert(data);
    },

    async update(id: string, data: any) {
      return supabaseSafe.from('categories').update(data).eq('id', id);
    },

    async delete(id: string) {
      return supabaseSafe.from('categories').delete().eq('id', id);
    }
  },

  // 注册操作
  enrollments: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('enrollments').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async insert(data: any) {
      return supabaseSafe.from('enrollments').insert(data);
    },

    async update(id: string, data: any) {
      return supabaseSafe.from('enrollments').update(data).eq('id', id);
    },

    async delete(id: string) {
      return supabaseSafe.from('enrollments').delete().eq('id', id);
    }
  },

  // 神谕操作
  oracles: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('oracles').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async insert(data: any) {
      return supabaseSafe.from('oracles').insert(data);
    },

    async update(id: string, data: any) {
      return supabaseSafe.from('oracles').update(data).eq('id', id);
    },

    async delete(id: string) {
      return supabaseSafe.from('oracles').delete().eq('id', id);
    }
  },

  // 投票操作
  votes: {
    async select(query = '*', conditions?: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('votes').select(query);
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return queryBuilder;
    },

    async upsert(data: any) {
      return supabaseSafe.from('votes').upsert(data);
    },

    async delete(conditions: Record<string, any>) {
      let queryBuilder = supabaseSafe.from('votes').delete();
      
      Object.entries(conditions).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      return queryBuilder;
    }
  }
};

// 认证操作
export const safeAuth = {
  async signIn(email: string, password: string) {
    return supabaseSafe.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string) {
    return supabaseSafe.auth.signUp({ email, password });
  },

  async signOut() {
    return supabaseSafe.auth.signOut();
  },

  async getSession() {
    return supabaseSafe.auth.getSession();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabaseSafe.auth.onAuthStateChange(callback);
  }
};

// 常用查询函数
export const safeQueries = {
  // 获取用户档案
  async getUserProfile(userId: string) {
    const { data, error } = await safeDb.profiles.select('*', { id: userId }).single();
    return { data, error };
  },

  // 获取用户角色
  async getUserRole(userId: string) {
    const { data, error } = await safeDb.profiles.select('role', { id: userId }).single();
    return { data: data?.role, error };
  },

  // 获取已发布的课程
  async getPublishedCourses() {
    const { data, error } = await safeDb.courses
      .select(`
        *,
        creator:profiles!creator_id(
          username,
          display_name,
          avatar_url
        )
      `, { status: 'published' })
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // 获取用户学习记录
  async getUserEnrollments(userId: string) {
    const { data, error } = await safeDb.enrollments
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
      `, { user_id: userId })
      .order('last_accessed_at', { ascending: false });
    
    return { data, error };
  },

  // 获取课程详情
  async getCourseDetails(courseId: string) {
    const { data, error } = await safeDb.courses
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
      `, { id: courseId })
      .single();
    
    return { data, error };
  }
};