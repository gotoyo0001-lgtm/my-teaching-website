import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCourseStore } from '../store/courseStore'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  BookOpen, 
  Clock, 
  PlayCircle,
  CheckCircle,
  Trophy,
  Calendar,
  TrendingUp,
  Target,
  Award
} from 'lucide-react'

export default function MyCoursesPage() {
  const { user } = useAuthStore()
  const { userCourses, fetchUserCourses, loading } = useCourseStore()
  const [activeTab, setActiveTab] = useState('in-progress')

  useEffect(() => {
    if (user) {
      fetchUserCourses(user.id)
    }
  }, [user])

  const getProgressPercentage = (course) => {
    if (!course.lessons || course.lessons.length === 0) return 0
    const completedLessons = course.lessons.filter(lesson => lesson.completed).length
    return Math.round((completedLessons / course.lessons.length) * 100)
  }

  const getCompletedLessons = (course) => {
    if (!course.lessons) return 0
    return course.lessons.filter(lesson => lesson.completed).length
  }

  const getTotalDuration = (course) => {
    if (!course.lessons) return 0
    return course.lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0)
  }

  const getStatusBadge = (progress) => {
    if (progress === 100) {
      return <Badge className="bg-green-100 text-green-800">已完成</Badge>
    } else if (progress > 0) {
      return <Badge className="bg-blue-100 text-blue-800">進行中</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">未開始</Badge>
    }
  }

  const inProgressCourses = userCourses.filter(course => {
    const progress = getProgressPercentage(course)
    return progress > 0 && progress < 100
  })

  const completedCourses = userCourses.filter(course => {
    const progress = getProgressPercentage(course)
    return progress === 100
  })

  const notStartedCourses = userCourses.filter(course => {
    const progress = getProgressPercentage(course)
    return progress === 0
  })

  const totalCoursesCompleted = completedCourses.length
  const totalLearningTime = userCourses.reduce((total, course) => {
    return total + getTotalDuration(course)
  }, 0)
  const averageProgress = userCourses.length > 0 
    ? Math.round(userCourses.reduce((total, course) => total + getProgressPercentage(course), 0) / userCourses.length)
    : 0

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">請先登入</h2>
          <p className="text-muted-foreground mb-4">
            您需要登入才能查看您的課程
          </p>
          <Link to="/login">
            <Button>立即登入</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">我的課程</h1>
          <p className="text-xl text-muted-foreground">
            追蹤您的學習進度，繼續您的成長之旅
          </p>
        </div>

        {/* 學習統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總課程數</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                已選修課程
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCoursesCompleted}</div>
              <p className="text-xs text-muted-foreground">
                完成的課程
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">學習時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(totalLearningTime / 60)}h</div>
              <p className="text-xs text-muted-foreground">
                總學習時長
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均進度</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <p className="text-xs text-muted-foreground">
                整體完成度
              </p>
            </CardContent>
          </Card>
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
        ) : userCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">還沒有選修任何課程</h3>
            <p className="text-muted-foreground mb-4">
              開始探索我們的課程，開啟您的學習之旅
            </p>
            <Link to="/courses">
              <Button>瀏覽課程</Button>
            </Link>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="in-progress">
                進行中 ({inProgressCourses.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                已完成 ({completedCourses.length})
              </TabsTrigger>
              <TabsTrigger value="not-started">
                未開始 ({notStartedCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in-progress" className="mt-6">
              {inProgressCourses.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">沒有進行中的課程</h3>
                  <p className="text-muted-foreground">
                    開始學習您已選修的課程，或探索新的課程
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressCourses.map((course) => (
                    <CourseCard key={course.course_id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedCourses.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">還沒有完成的課程</h3>
                  <p className="text-muted-foreground">
                    繼續學習您的課程，完成第一個學習里程碑
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map((course) => (
                    <CourseCard key={course.course_id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="not-started" className="mt-6">
              {notStartedCourses.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">所有課程都已開始</h3>
                  <p className="text-muted-foreground">
                    太棒了！您已經開始學習所有選修的課程
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedCourses.map((course) => (
                    <CourseCard key={course.course_id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }) {
  const progress = getProgressPercentage(course)
  const completedLessons = getCompletedLessons(course)
  const totalLessons = course.lessons?.length || 0
  const totalDuration = getTotalDuration(course)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <BookOpen className="h-16 w-16 text-primary/60" />
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          {getStatusBadge(progress)}
          <div className="text-sm text-muted-foreground">
            {progress}% 完成
          </div>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 進度條 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>進度</span>
            <span>{completedLessons} / {totalLessons} 章節</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 課程資訊 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {totalLessons} 章節
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-2 pt-2">
          <Link to={`/courses/${course.course_id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              查看詳情
            </Button>
          </Link>
          <Link to={`/learn/${course.course_id}`} className="flex-1">
            <Button size="sm" className="w-full">
              {progress === 0 ? (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  開始學習
                </>
              ) : progress === 100 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  重新學習
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  繼續學習
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function getProgressPercentage(course) {
  if (!course.lessons || course.lessons.length === 0) return 0
  const completedLessons = course.lessons.filter(lesson => lesson.completed).length
  return Math.round((completedLessons / course.lessons.length) * 100)
}

function getCompletedLessons(course) {
  if (!course.lessons) return 0
  return course.lessons.filter(lesson => lesson.completed).length
}

function getTotalDuration(course) {
  if (!course.lessons) return 0
  return course.lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0)
}

function getStatusBadge(progress) {
  if (progress === 100) {
    return <Badge className="bg-green-100 text-green-800">已完成</Badge>
  } else if (progress > 0) {
    return <Badge className="bg-blue-100 text-blue-800">進行中</Badge>
  } else {
    return <Badge className="bg-gray-100 text-gray-800">未開始</Badge>
  }
}

