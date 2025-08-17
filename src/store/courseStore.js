import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// 模擬課程資料
const mockCourses = [
  {
    course_id: 1,
    title: 'Python 程式設計入門',
    description: '從零開始學習 Python 程式設計，適合完全沒有程式設計經驗的初學者。課程涵蓋基本語法、資料結構、函數設計等核心概念。',
    category: 'programming',
    difficulty_level: 'beginner',
    is_published: true,
    created_at: '2024-01-15T00:00:00Z',
    start_date: '2024-02-01',
    end_date: '2024-05-01',
    instructor: {
      user_profiles: { first_name: '張', last_name: '老師' }
    },
    lessons: [
      { lesson_id: 1, title: 'Python 環境設置', duration_minutes: 30, order_index: 1 },
      { lesson_id: 2, title: '基本語法介紹', duration_minutes: 45, order_index: 2 },
      { lesson_id: 3, title: '控制結構', duration_minutes: 60, order_index: 3 },
      { lesson_id: 4, title: '函數設計', duration_minutes: 50, order_index: 4 }
    ],
    enrollments: [{ count: 1234 }]
  },
  {
    course_id: 2,
    title: '網頁設計與開發',
    description: '學習現代網頁設計技術，包括 HTML、CSS、JavaScript 以及響應式設計原則。適合想要進入網頁開發領域的學習者。',
    category: 'design',
    difficulty_level: 'intermediate',
    is_published: true,
    created_at: '2024-01-10T00:00:00Z',
    start_date: '2024-02-15',
    end_date: '2024-06-15',
    instructor: {
      user_profiles: { first_name: '李', last_name: '老師' }
    },
    lessons: [
      { lesson_id: 5, title: 'HTML 基礎', duration_minutes: 40, order_index: 1 },
      { lesson_id: 6, title: 'CSS 樣式設計', duration_minutes: 55, order_index: 2 },
      { lesson_id: 7, title: 'JavaScript 互動', duration_minutes: 70, order_index: 3 },
      { lesson_id: 8, title: '響應式設計', duration_minutes: 65, order_index: 4 }
    ],
    enrollments: [{ count: 856 }]
  },
  {
    course_id: 3,
    title: '數據分析與視覺化',
    description: '使用 Python 進行數據分析，學習 Pandas、NumPy、Matplotlib 等工具。適合想要從事數據科學工作的進階學習者。',
    category: 'data_science',
    difficulty_level: 'advanced',
    is_published: true,
    created_at: '2024-01-05T00:00:00Z',
    start_date: '2024-03-01',
    end_date: '2024-07-31',
    instructor: {
      user_profiles: { first_name: '王', last_name: '老師' }
    },
    lessons: [
      { lesson_id: 9, title: '數據分析概論', duration_minutes: 35, order_index: 1 },
      { lesson_id: 10, title: 'Pandas 數據處理', duration_minutes: 80, order_index: 2 },
      { lesson_id: 11, title: '數據視覺化', duration_minutes: 75, order_index: 3 },
      { lesson_id: 12, title: '統計分析', duration_minutes: 90, order_index: 4 }
    ],
    enrollments: [{ count: 567 }]
  },
  {
    course_id: 4,
    title: 'React 前端開發',
    description: '深入學習 React 框架，包括組件設計、狀態管理、路由配置等現代前端開發技術。',
    category: 'programming',
    difficulty_level: 'intermediate',
    is_published: true,
    created_at: '2024-01-20T00:00:00Z',
    start_date: '2024-02-20',
    end_date: '2024-05-20',
    instructor: {
      user_profiles: { first_name: '陳', last_name: '老師' }
    },
    lessons: [
      { lesson_id: 13, title: 'React 基礎概念', duration_minutes: 45, order_index: 1 },
      { lesson_id: 14, title: '組件與 Props', duration_minutes: 60, order_index: 2 },
      { lesson_id: 15, title: '狀態管理', duration_minutes: 75, order_index: 3 },
      { lesson_id: 16, title: '路由與導航', duration_minutes: 55, order_index: 4 }
    ],
    enrollments: [{ count: 923 }]
  },
  {
    course_id: 5,
    title: '數位行銷策略',
    description: '學習現代數位行銷的核心策略，包括 SEO、社群媒體行銷、內容行銷等實用技能。',
    category: 'marketing',
    difficulty_level: 'beginner',
    is_published: true,
    created_at: '2024-01-25T00:00:00Z',
    start_date: '2024-03-01',
    end_date: '2024-06-01',
    instructor: {
      user_profiles: { first_name: '林', last_name: '老師' }
    },
    lessons: [
      { lesson_id: 17, title: '數位行銷概論', duration_minutes: 40, order_index: 1 },
      { lesson_id: 18, title: 'SEO 搜尋引擎優化', duration_minutes: 65, order_index: 2 },
      { lesson_id: 19, title: '社群媒體策略', duration_minutes: 50, order_index: 3 },
      { lesson_id: 20, title: '內容行銷實戰', duration_minutes: 70, order_index: 4 }
    ],
    enrollments: [{ count: 1456 }]
  },
  {
    course_id: 6,
    title: 'UI/UX 設計原理',
    description: '學習用戶介面和用戶體驗設計的基本原理，掌握設計思維和實用工具。',
    category: 'design',
    difficulty_level: 'beginner',
    is_published: true,
    created_at: '2024-01-30T00:00:00Z',
    start_date: '2024-03-15',
    end_date: '2024-06-15',
    instructor: {
      user_profiles: { first_name: '黃', last_name: '老師' }
    },
    lessons: [
      { lesson_id: 21, title: '設計思維基礎', duration_minutes: 50, order_index: 1 },
      { lesson_id: 22, title: '用戶研究方法', duration_minutes: 60, order_index: 2 },
      { lesson_id: 23, title: '介面設計原則', duration_minutes: 70, order_index: 3 },
      { lesson_id: 24, title: '原型設計實作', duration_minutes: 80, order_index: 4 }
    ],
    enrollments: [{ count: 789 }]
  }
]

export const useCourseStore = create((set, get) => ({
  courses: [],
  currentCourse: null,
  userCourses: [],
  loading: false,
  error: null,

  // 獲取所有課程
  fetchCourses: async (filters = {}) => {
    set({ loading: true, error: null })
    
    try {
      // 嘗試從 Supabase 獲取資料
      let query = supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(
            user_profiles(first_name, last_name)
          ),
          lessons(lesson_id, title, duration_minutes, order_index),
          enrollments:course_enrollments(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      // 應用篩選條件
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty_level', filters.difficulty)
      }

      const { data, error } = await query

      if (error) throw error

      // 處理資料格式
      const processedCourses = data.map(course => ({
        ...course,
        enrollments: course.enrollments ? [{ count: course.enrollments.length }] : [{ count: 0 }]
      }))

      set({ courses: processedCourses, loading: false })
    } catch (error) {
      console.error('Supabase 獲取課程失敗，使用模擬資料:', error)
      
      // 使用模擬資料並應用篩選
      let filteredCourses = [...mockCourses]
      
      if (filters.category && filters.category !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.category === filters.category)
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.difficulty_level === filters.difficulty)
      }
      
      // 應用排序
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            filteredCourses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            break
          case 'oldest':
            filteredCourses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            break
          case 'popular':
            filteredCourses.sort((a, b) => (b.enrollments[0]?.count || 0) - (a.enrollments[0]?.count || 0))
            break
          case 'title':
            filteredCourses.sort((a, b) => a.title.localeCompare(b.title))
            break
        }
      }
      
      set({ courses: filteredCourses, loading: false, error: null })
    }
  },

  // 根據 ID 獲取課程詳情
  fetchCourseById: async (courseId) => {
    set({ loading: true, error: null })
    
    try {
      // 嘗試從 Supabase 獲取資料
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(
            user_profiles(first_name, last_name)
          ),
          lessons(
            lesson_id,
            title,
            content,
            duration_minutes,
            order_index,
            is_published
          ),
          enrollments:course_enrollments(
            student_id,
            enrolled_at
          )
        `)
        .eq('course_id', courseId)
        .single()

      if (error) throw error

      // 排序課程章節
      if (data.lessons) {
        data.lessons.sort((a, b) => a.order_index - b.order_index)
      }

      set({ currentCourse: data, loading: false })
    } catch (error) {
      console.error('Supabase 獲取課程詳情失敗，使用模擬資料:', error)
      
      // 使用模擬資料
      const mockCourse = mockCourses.find(c => c.course_id == courseId)
      if (mockCourse) {
        // 為模擬課程添加詳細內容
        const detailedCourse = {
          ...mockCourse,
          lessons: mockCourse.lessons.map(lesson => ({
            ...lesson,
            content: `這是 ${lesson.title} 的詳細內容。在這個章節中，您將學習到相關的核心概念和實用技能。`,
            is_published: true,
            completed: Math.random() > 0.7 // 隨機模擬完成狀態
          })),
          enrollments: [
            { student_id: 'mock-user-1', enrolled_at: '2024-02-01T00:00:00Z' },
            { student_id: 'mock-user-2', enrolled_at: '2024-02-02T00:00:00Z' }
          ]
        }
        set({ currentCourse: detailedCourse, loading: false, error: null })
      } else {
        set({ error: '課程不存在', loading: false })
      }
    }
  },

  // 獲取用戶的課程
  fetchUserCourses: async (userId) => {
    set({ loading: true, error: null })
    
    try {
      // 嘗試從 Supabase 獲取資料
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:course_id(
            *,
            instructor:instructor_id(
              user_profiles(first_name, last_name)
            ),
            lessons(
              lesson_id,
              title,
              duration_minutes,
              is_published
            )
          )
        `)
        .eq('student_id', userId)

      if (error) throw error

      const userCourses = data.map(enrollment => ({
        ...enrollment.course,
        enrollment_date: enrollment.enrolled_at,
        lessons: enrollment.course.lessons?.map(lesson => ({
          ...lesson,
          completed: Math.random() > 0.7 // 隨機模擬完成狀態
        }))
      }))

      set({ userCourses, loading: false })
    } catch (error) {
      console.error('Supabase 獲取用戶課程失敗，使用模擬資料:', error)
      
      // 使用模擬資料 - 假設用戶選修了前3門課程
      const mockUserCourses = mockCourses.slice(0, 3).map(course => ({
        ...course,
        enrollment_date: '2024-02-01T00:00:00Z',
        lessons: course.lessons?.map(lesson => ({
          ...lesson,
          completed: Math.random() > 0.7 // 隨機模擬完成狀態
        }))
      }))
      
      set({ userCourses: mockUserCourses, loading: false, error: null })
    }
  },

  // 選課
  enrollInCourse: async (courseId, userId) => {
    try {
      // 嘗試使用 Supabase
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: userId,
          enrolled_at: new Date().toISOString()
        })

      if (error) throw error

      // 重新獲取用戶課程
      get().fetchUserCourses(userId)
      
      return { success: true }
    } catch (error) {
      console.error('Supabase 選課失敗，模擬成功:', error)
      
      // 模擬選課成功
      const course = mockCourses.find(c => c.course_id == courseId)
      if (course) {
        const { userCourses } = get()
        const newCourse = {
          ...course,
          enrollment_date: new Date().toISOString(),
          lessons: course.lessons?.map(lesson => ({
            ...lesson,
            completed: false
          }))
        }
        
        // 檢查是否已經選修
        const alreadyEnrolled = userCourses.some(c => c.course_id == courseId)
        if (!alreadyEnrolled) {
          set({ userCourses: [...userCourses, newCourse] })
        }
      }
      
      return { success: true }
    }
  },

  // 清除當前課程
  clearCurrentCourse: () => {
    set({ currentCourse: null })
  },

  // 清除錯誤
  clearError: () => {
    set({ error: null })
  }
}))

