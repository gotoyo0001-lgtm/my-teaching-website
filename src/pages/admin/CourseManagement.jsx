import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCourseStore } from '../../store/courseStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ArrowLeft,
  Eye,
  EyeOff,
  Users,
  Clock,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function CourseManagement() {
  const { user } = useAuthStore()
  const { courses, fetchCourses } = useCourseStore()
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      await fetchCourses()
      setLoading(false)
    }
    loadCourses()
  }, [fetchCourses])

  useEffect(() => {
    setFilteredCourses(courses)
  }, [courses])

  useEffect(() => {
    // 篩選課程
    let filtered = courses

    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 分類篩選
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    // 狀態篩選
    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published'
      filtered = filtered.filter(course => course.is_published === isPublished)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, categoryFilter, statusFilter])

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'programming': '程式設計',
      'design': '設計',
      'business': '商業',
      'language': '語言',
      'science': '科學',
      'art': '藝術'
    }
    return categoryNames[category] || category
  }

  const getDifficultyBadge = (level) => {
    const variants = {
      'beginner': { variant: 'success', text: '初級' },
      'intermediate': { variant: 'warning', text: '中級' },
      'advanced': { variant: 'destructive', text: '高級' }
    }
    const config = variants[level] || { variant: 'secondary', text: level }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getStatusBadge = (isPublished) => {
    return isPublished ? (
      <Badge variant="success">已發布</Badge>
    ) : (
      <Badge variant="secondary">草稿</Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleTogglePublish = (courseId) => {
    // 這裡應該調用 API 來切換發布狀態
    console.log('Toggle publish status for course:', courseId)
  }

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('確定要刪除此課程嗎？此操作無法復原。')) {
      // 這裡應該調用 API 來刪除課程
      console.log('Delete course:', courseId)
    }
  }

  const getInstructorName = (course) => {
    if (course.instructor?.user_profiles) {
      return `${course.instructor.user_profiles.first_name} ${course.instructor.user_profiles.last_name}`
    }
    return '未知講師'
  }

  const getEnrollmentCount = (course) => {
    return course.enrollments?.[0]?.count || 0
  }

  const getTotalDuration = (course) => {
    if (!course.lessons) return 0
    return course.lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0)
  }

  // 檢查是否為管理者
  if (user?.profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">權限不足</h3>
            <p className="text-muted-foreground mb-4">
              您需要管理者權限才能訪問此頁面。
            </p>
            <Link to="/">
              <Button>返回首頁</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入課程資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回管理者控制台
            </Button>
          </Link>
        </div>

        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            課程管理
          </h1>
          <p className="text-muted-foreground">
            管理平台上的所有課程，包括審核、發布和內容監督。
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總課程數</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已發布</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => c.is_published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">草稿</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => !c.is_published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總學員數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((total, course) => total + getEnrollmentCount(course), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜尋和篩選 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>搜尋和篩選</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">搜尋課程</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="搜尋課程標題或描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>分類篩選</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分類</SelectItem>
                    <SelectItem value="programming">程式設計</SelectItem>
                    <SelectItem value="design">設計</SelectItem>
                    <SelectItem value="business">商業</SelectItem>
                    <SelectItem value="language">語言</SelectItem>
                    <SelectItem value="science">科學</SelectItem>
                    <SelectItem value="art">藝術</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>狀態篩選</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有狀態</SelectItem>
                    <SelectItem value="published">已發布</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Link to="/admin/courses/new">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    新增課程
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 課程列表 */}
        <Card>
          <CardHeader>
            <CardTitle>課程列表</CardTitle>
            <CardDescription>
              找到 {filteredCourses.length} 門課程
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div key={course.course_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        {getStatusBadge(course.is_published)}
                        {getDifficultyBadge(course.difficulty_level)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>講師：{getInstructorName(course)}</span>
                        <span>分類：{getCategoryDisplayName(course.category)}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {getEnrollmentCount(course)} 學員
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTotalDuration(course)} 分鐘
                        </span>
                        <span>建立：{formatDate(course.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 查看課程 */}
                    <Link to={`/courses/${course.course_id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* 編輯課程 */}
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* 發布/取消發布 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(course.course_id)}
                    >
                      {course.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>

                    {/* 刪除課程 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.course_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">沒有找到課程</h3>
                <p className="text-muted-foreground">
                  請調整搜尋條件或篩選設定。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

