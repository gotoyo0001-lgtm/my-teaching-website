import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCourseStore } from '../store/courseStore'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react'

export default function CoursesPage() {
  const { user } = useAuthStore()
  const { courses, fetchCourses, loading } = useCourseStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

  useEffect(() => {
    fetchCourses()
  }, [])

  // 更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    setSearchParams(params)
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, setSearchParams])

  // 篩選和排序課程
  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'popular':
          return (b.enrollments?.[0]?.count || 0) - (a.enrollments?.[0]?.count || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const categories = [
    { value: 'all', label: '全部分類' },
    { value: 'programming', label: '程式設計' },
    { value: 'design', label: '設計' },
    { value: 'business', label: '商業' },
    { value: 'data_science', label: '數據科學' },
    { value: 'marketing', label: '行銷' },
    { value: 'language', label: '語言學習' }
  ]

  const difficulties = [
    { value: 'all', label: '全部難度' },
    { value: 'beginner', label: '初級' },
    { value: 'intermediate', label: '中級' },
    { value: 'advanced', label: '高級' }
  ]

  const sortOptions = [
    { value: 'newest', label: '最新課程' },
    { value: 'oldest', label: '最舊課程' },
    { value: 'popular', label: '最受歡迎' },
    { value: 'title', label: '課程名稱' }
  ]

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyText = (difficulty) => {
    const texts = {
      'beginner': '初級',
      'intermediate': '中級',
      'advanced': '高級'
    }
    return texts[difficulty] || '未知'
  }

  const getCategoryText = (category) => {
    const categoryMap = categories.find(c => c.value === category)
    return categoryMap ? categoryMap.label : category
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">探索課程</h1>
          <p className="text-xl text-muted-foreground">
            發現適合您的學習路徑，從探索者成長為創造者
          </p>
        </div>

        {/* 搜索和篩選區域 */}
        <div className="mb-8 space-y-4">
          {/* 搜索欄 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索課程名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-base"
            />
          </div>

          {/* 篩選和排序 */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="難度" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 視圖切換 */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 結果統計 */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            找到 <span className="font-semibold text-foreground">{filteredAndSortedCourses.length}</span> 個課程
          </p>
        </div>

        {/* 課程列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">沒有找到符合條件的課程</h3>
            <p className="text-muted-foreground mb-4">
              請嘗試調整搜索條件或篩選選項
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
              setSortBy('newest')
            }}>
              清除所有篩選
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredAndSortedCourses.map((course) => (
              <Card 
                key={course.course_id} 
                className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
              >
                <div className={`${
                  viewMode === 'list' 
                    ? 'w-48 h-32 flex-shrink-0' 
                    : 'h-48'
                } bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`}>
                  <BookOpen className="h-16 w-16 text-primary/60" />
                </div>
                
                <div className="flex-1">
                  <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getDifficultyColor(course.difficulty_level)}>
                        {getDifficultyText(course.difficulty_level)}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        4.8
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className={viewMode === 'list' ? 'pt-0' : ''}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.enrollments?.[0]?.count || 0} 學員
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.lessons?.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0)} 分鐘
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">分類:</span> {getCategoryText(course.category)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          講師: {course.instructor?.user_profiles?.first_name} {course.instructor?.user_profiles?.last_name}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Link to={`/courses/${course.course_id}`}>
                          <Button size="sm" variant="outline">
                            查看詳情
                          </Button>
                        </Link>
                        {user && (
                          <Button size="sm">
                            立即選課
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

