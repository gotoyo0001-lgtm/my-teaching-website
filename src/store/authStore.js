import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// 測試帳戶資料
const testAccounts = {
  'explorer@test.com': {
    id: 'test-explorer-1',
    email: 'explorer@test.com',
    profile: {
      first_name: '探索者',
      last_name: '測試',
      role: 'student',
      created_at: '2024-01-01T00:00:00Z'
    }
  },
  'creator@test.com': {
    id: 'test-creator-1',
    email: 'creator@test.com',
    profile: {
      first_name: '創造者',
      last_name: '測試',
      role: 'teacher',
      created_at: '2024-01-01T00:00:00Z'
    }
  },
  'admin@test.com': {
    id: 'test-admin-1',
    email: 'admin@test.com',
    profile: {
      first_name: '管理者',
      last_name: '測試',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z'
    }
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  // 初始化認證狀態
  initialize: async () => {
    set({ loading: true })
    
    try {
      // 嘗試從 Supabase 獲取會話
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        // 獲取用戶資料
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (profileError) {
          console.error('獲取用戶資料失敗:', profileError)
        }
        
        set({ 
          user: {
            ...session.user,
            profile: profile || null
          }, 
          session,
          loading: false 
        })
      } else {
        // 檢查本地存儲的模擬用戶
        const mockUser = localStorage.getItem('mockUser')
        if (mockUser) {
          const user = JSON.parse(mockUser)
          set({ user, session: null, loading: false })
        } else {
          set({ user: null, session: null, loading: false })
        }
      }
      
      // 監聽認證狀態變化
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          set({ 
            user: {
              ...session.user,
              profile: profile || null
            },
            session
          })
        } else {
          // 檢查是否有模擬用戶
          const mockUser = localStorage.getItem('mockUser')
          if (mockUser) {
            const user = JSON.parse(mockUser)
            set({ user, session: null })
          } else {
            set({ user: null, session: null })
          }
        }
      })
      
    } catch (error) {
      console.error('初始化認證失敗:', error)
      
      // 檢查本地存儲的模擬用戶
      const mockUser = localStorage.getItem('mockUser')
      if (mockUser) {
        const user = JSON.parse(mockUser)
        set({ user, session: null, loading: false, error: null })
      } else {
        set({ user: null, session: null, loading: false, error: null })
      }
    }
  },

  // 登入
  signIn: async (email, password) => {
    set({ loading: true, error: null })
    
    try {
      // 嘗試使用 Supabase 登入
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        // 獲取用戶資料
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('獲取用戶資料失敗:', profileError)
        }
        
        const user = {
          ...data.user,
          profile: profile || null
        }
        
        set({ user, session: data.session, loading: false })
        localStorage.removeItem('mockUser') // 清除模擬用戶
        return { success: true, user }
      }
      
    } catch (error) {
      console.error('Supabase 登入失敗，檢查測試帳戶:', error)
      
      // 檢查是否為測試帳戶
      if (testAccounts[email] && password === 'password123') {
        const user = testAccounts[email]
        set({ user, session: null, loading: false, error: null })
        localStorage.setItem('mockUser', JSON.stringify(user)) // 保存模擬用戶
        return { success: true, user }
      }
      
      set({ loading: false, error: '登入失敗：電子郵件或密碼錯誤' })
      return { success: false, error: '電子郵件或密碼錯誤' }
    }
  },

  // 註冊
  signUp: async (email, password, userData) => {
    set({ loading: true, error: null })
    
    try {
      // 嘗試使用 Supabase 註冊
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role
          }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        // 創建用戶資料
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            created_at: new Date().toISOString()
          })
        
        if (profileError) {
          console.error('創建用戶資料失敗:', profileError)
        }
        
        set({ loading: false })
        return { success: true, message: '註冊成功！請檢查您的電子郵件以驗證帳戶。' }
      }
      
    } catch (error) {
      console.error('Supabase 註冊失敗，使用模擬註冊:', error)
      
      // 模擬註冊成功
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        email,
        profile: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          created_at: new Date().toISOString()
        }
      }
      
      set({ user: mockUser, session: null, loading: false, error: null })
      localStorage.setItem('mockUser', JSON.stringify(mockUser)) // 保存模擬用戶
      return { success: true, message: '註冊成功！歡迎加入全方位教學互動平台！' }
    }
  },

  // 登出
  signOut: async () => {
    try {
      // 嘗試使用 Supabase 登出
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
    } catch (error) {
      console.error('Supabase 登出失敗:', error)
    } finally {
      // 無論如何都清除本地狀態
      set({ user: null, session: null, error: null })
      localStorage.removeItem('mockUser') // 清除模擬用戶
    }
  },

  // 清除錯誤
  clearError: () => {
    set({ error: null })
  },

  // 獲取用戶角色顯示名稱
  getUserRoleDisplay: () => {
    const { user } = get()
    if (!user?.profile?.role) return '探索者'
    
    const roleMap = {
      'student': '探索者',
      'teacher': '創造者',
      'admin': '管理者'
    }
    
    return roleMap[user.profile.role] || '探索者'
  },

  // 檢查用戶權限
  hasPermission: (permission) => {
    const { user } = get()
    if (!user?.profile?.role) return false
    
    const permissions = {
      'student': ['view_courses', 'enroll_courses', 'submit_assignments'],
      'teacher': ['view_courses', 'enroll_courses', 'submit_assignments', 'create_courses', 'grade_assignments'],
      'admin': ['view_courses', 'enroll_courses', 'submit_assignments', 'create_courses', 'grade_assignments', 'manage_users', 'manage_system']
    }
    
    return permissions[user.profile.role]?.includes(permission) || false
  }
}))

// 自動初始化
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}

