import { create } from 'zustand'

// 模擬作業資料
const mockAssignments = [
  {
    id: '1',
    title: 'Python 基礎程式設計作業',
    description: '請完成以下 Python 程式設計練習：\n\n1. 編寫一個計算機程式，支援基本四則運算\n2. 實作一個簡單的學生成績管理系統\n3. 使用 Python 處理文字檔案讀寫\n\n請將程式碼和執行結果截圖一併提交。',
    requirements: '• 程式碼需要有適當的註解\n• 變數命名要有意義\n• 需要處理基本的錯誤情況\n• 提交 .py 檔案和執行結果截圖',
    course_id: '1',
    course_title: 'Python 程式設計入門',
    teacher_name: '張教授',
    due_date: '2025-09-15T23:59:00',
    max_score: 100,
    status: 'pending',
    created_at: '2024-08-20T10:00:00',
    attachments: [
      {
        name: '作業範例.py',
        size: 2048,
        url: '/files/example.py'
      }
    ]
  },
  {
    id: '2',
    title: '網頁設計實作專案',
    description: '設計並實作一個個人作品集網站，展示您的設計和開發技能。\n\n要求包含：\n- 響應式設計\n- 至少5個頁面\n- 使用現代CSS技術\n- 包含互動效果',
    requirements: '• 使用 HTML5 語義化標籤\n• CSS3 動畫和過渡效果\n• 支援手機和桌面瀏覽\n• 程式碼結構清晰\n• 提交完整專案檔案',
    course_id: '2',
    course_title: '網頁設計與開發',
    teacher_name: '李老師',
    due_date: '2025-09-20T23:59:00',
    max_score: 100,
    status: 'submitted',
    created_at: '2024-08-25T14:30:00',
    attachments: []
  },
  {
    id: '3',
    title: '資料分析報告',
    description: '使用提供的銷售資料集，進行深入的資料分析並撰寫報告。\n\n分析內容應包含：\n- 資料清理和預處理\n- 探索性資料分析\n- 視覺化圖表\n- 結論和建議',
    requirements: '• 使用 Python pandas 和 matplotlib\n• 報告格式為 PDF\n• 包含程式碼和圖表\n• 分析結論要有數據支撐\n• 字數不少於2000字',
    course_id: '3',
    course_title: '數據分析與視覺化',
    teacher_name: '王博士',
    due_date: '2025-09-25T23:59:00',
    max_score: 100,
    status: 'completed',
    created_at: '2024-08-30T09:15:00',
    attachments: [
      {
        name: '銷售資料.csv',
        size: 1024000,
        url: '/files/sales_data.csv'
      },
      {
        name: '分析範本.ipynb',
        size: 512000,
        url: '/files/analysis_template.ipynb'
      }
    ]
  },
  {
    id: '4',
    title: '逾期測試作業',
    description: '這是一個用於測試逾期功能的作業。此作業的截止時間已過，應該無法提交。',
    requirements: '• 這是測試用作業\n• 截止時間已過\n• 應該無法提交',
    course_id: '1',
    course_title: 'Python 程式設計入門',
    teacher_name: '張教授',
    due_date: '2025-08-10T23:59:00',
    max_score: 100,
    status: 'overdue',
    created_at: '2025-08-01T10:00:00',
    attachments: []
  }
]

// 模擬提交記錄
const mockSubmissions = [
  {
    id: '1',
    assignment_id: '1',
    student_id: 'user1',
    content: '我已經完成了所有的程式設計練習。計算機程式支援加減乘除運算，學生成績管理系統可以新增、查詢和統計成績，文字檔案處理功能也已實作完成。',
    files: [
      {
        name: '計算機.py',
        size: 2048,
        url: '/submissions/calculator.py'
      },
      {
        name: '成績管理.py',
        size: 3072,
        url: '/submissions/grade_manager.py'
      }
    ],
    submitted_at: '2024-09-10T15:30:00',
    status: 'submitted',
    score: null,
    feedback: null
  },
  {
    id: '2',
    assignment_id: '2',
    student_id: 'user1',
    content: '個人作品集網站已完成，包含首頁、關於我、作品展示、技能介紹和聯絡方式五個頁面。使用了 CSS Grid 和 Flexbox 進行佈局，添加了平滑滾動和淡入動畫效果。',
    files: [
      {
        name: 'portfolio.zip',
        size: 5120000,
        url: '/submissions/portfolio.zip'
      }
    ],
    submitted_at: '2024-09-18T20:45:00',
    status: 'graded',
    score: 92,
    feedback: '網站設計美觀，功能完整。響應式設計做得很好，動畫效果自然。建議可以加入更多互動元素提升用戶體驗。'
  },
  {
    id: '3',
    assignment_id: '3',
    student_id: 'user1',
    content: '資料分析報告已完成，對銷售資料進行了全面分析。發現了季節性銷售趨勢、產品類別表現差異，並提出了提升銷售的具體建議。',
    files: [
      {
        name: '資料分析報告.pdf',
        size: 2048000,
        url: '/submissions/analysis_report.pdf'
      },
      {
        name: '分析程式碼.py',
        size: 4096,
        url: '/submissions/analysis_code.py'
      }
    ],
    submitted_at: '2024-09-22T16:20:00',
    status: 'graded',
    score: 95,
    feedback: '分析深入且全面，視覺化圖表清晰易懂。結論有理有據，建議具有實用價值。是一份優秀的分析報告。'
  }
]

export const useAssignmentStore = create((set, get) => ({
  assignments: [],
  submissions: [],
  loading: false,
  error: null,

  // 獲取所有作業
  fetchAssignments: async () => {
    set({ loading: true, error: null })
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 500))
      set({ assignments: mockAssignments, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 根據 ID 獲取作業
  getAssignmentById: async (id) => {
    const { assignments } = get()
    let assignment = assignments.find(a => a.id === id)
    
    if (!assignment) {
      // 如果本地沒有，嘗試從模擬資料中獲取
      assignment = mockAssignments.find(a => a.id === id)
    }
    
    return assignment
  },

  // 創建新作業
  createAssignment: async (assignmentData) => {
    set({ loading: true, error: null })
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newAssignment = {
        id: Date.now().toString(),
        ...assignmentData,
        teacher_name: '當前用戶', // 實際應該從用戶資料獲取
        status: 'pending',
        created_at: new Date().toISOString(),
        course_title: '選定課程' // 實際應該從課程資料獲取
      }
      
      set(state => ({
        assignments: [newAssignment, ...state.assignments],
        loading: false
      }))
      
      return newAssignment
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // 提交作業
  submitAssignment: async (assignmentId, submissionData) => {
    set({ loading: true, error: null })
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newSubmission = {
        id: Date.now().toString(),
        assignment_id: assignmentId,
        student_id: 'current_user', // 實際應該從認證狀態獲取
        ...submissionData,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        score: null,
        feedback: null
      }
      
      set(state => ({
        submissions: [newSubmission, ...state.submissions],
        loading: false
      }))
      
      return newSubmission
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // 獲取學生的作業提交記錄
  getSubmissionByAssignmentId: async (assignmentId, studentId) => {
    const { submissions } = get()
    let submission = submissions.find(s => s.assignment_id === assignmentId && s.student_id === studentId)
    
    if (!submission) {
      // 如果本地沒有，嘗試從模擬資料中獲取
      submission = mockSubmissions.find(s => s.assignment_id === assignmentId)
    }
    
    return submission
  },

  // 評分作業
  gradeAssignment: async (submissionId, score, feedback) => {
    set({ loading: true, error: null })
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      set(state => ({
        submissions: state.submissions.map(submission =>
          submission.id === submissionId
            ? { ...submission, score, feedback, status: 'graded' }
            : submission
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // 獲取作業的所有提交記錄（教師視角）
  getSubmissionsByAssignmentId: async (assignmentId) => {
    // 模擬獲取該作業的所有學生提交
    const assignmentSubmissions = mockSubmissions.filter(s => s.assignment_id === assignmentId)
    return assignmentSubmissions
  },

  // 更新作業
  updateAssignment: async (assignmentId, updateData) => {
    set({ loading: true, error: null })
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      set(state => ({
        assignments: state.assignments.map(assignment =>
          assignment.id === assignmentId
            ? { ...assignment, ...updateData }
            : assignment
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // 刪除作業
  deleteAssignment: async (assignmentId) => {
    set({ loading: true, error: null })
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        assignments: state.assignments.filter(assignment => assignment.id !== assignmentId),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // 清除錯誤
  clearError: () => set({ error: null })
}))

