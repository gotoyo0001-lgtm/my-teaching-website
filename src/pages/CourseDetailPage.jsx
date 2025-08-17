import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCourseStore } from '../store/courseStore'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Calendar,
  User,
  PlayCircle,
  CheckCircle,
  Lock,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare
} from 'lucide-react'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const { user } = useAuthStore()
  const { currentCourse, fetchCourseById, enrollInCourse, loading } = useCourseStore()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId)
    }
  }, [courseId])

  useEffect(() => {
    if (currentCourse && user) {
      // 檢查用戶是否已選課
      const enrollment = currentCourse.enrollments?.find(
        e => e.student_id === user.id
      )
      setIsEnrolled(!!enrollment)
    }
  }, [currentCourse, user])

  const handleEnroll = async () => {
    if (!user) {
      // 重定向到登入頁面
      return
    }

    setEnrollmentLoading(true)
    try {
      await enrollInCourse(courseId, user.id)
      setIsEnrolled(true)
    } catch (error) {
      console.error('選課失敗:', error)
    } finally {
      setEnrollmentLoading(false)
    }
  }

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
    const categories = {
      'programming': '程式設計',
      'design': '設計',
      'business': '商業',
      'data_science': '數據科學',
      'marketing': '行銷',
      'language': '語言學習'
    }
    return categories[category] || category
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalDuration = currentCourse?.lessons?.reduce(
    (total, lesson) => total + (lesson.duration_minutes || 0), 0
  ) || 0

  const completedLessons = currentCourse?.lessons?.filter(
    lesson => lesson.completed
  ).length || 0

  const progress = currentCourse?.lessons?.length > 0 
    ? (completedLessons / currentCourse.lessons.length) * 100 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">課程不存在</h2>
          <p className="text-muted-foreground mb-4">
            抱歉，找不到您要查看的課程
          </p>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回課程列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link to="/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回課程列表
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容區域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 課程標題和基本資訊 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getDifficultyColor(currentCourse.difficulty_level)}>
                  {getDifficultyText(currentCourse.difficulty_level)}
                </Badge>
                <Badge variant="outline">
                  {getCategoryText(currentCourse.category)}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {currentCourse.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {currentCourse.description}
              </p>

              {/* 課程統計 */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  4.8 (1,234 評價)
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {currentCourse.enrollments?.[0]?.count || 0} 學員
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(totalDuration / 60)} 小時 {totalDuration % 60} 分鐘
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(currentCourse.created_at)}
                </div>
              </div>
            </div>

            {/* 進度條 (僅已選課學員可見) */}
            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">學習進度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>已完成 {completedLessons} / {currentCourse.lessons?.length || 0} 章節</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 標籤頁內容 */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">課程概述</TabsTrigger>
                <TabsTrigger value="curriculum">課程大綱</TabsTrigger>
                <TabsTrigger value="instructor">講師介紹</TabsTrigger>
                <TabsTrigger value="reviews">學員評價</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>課程介紹</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{currentCourse.description}</p>
                      <h4>您將學到什麼：</h4>
                      <ul>
                        <li>掌握核心概念和技能</li>
                        <li>實際動手練習項目</li>
                        <li>獲得實用的工作經驗</li>
                        <li>建立專業作品集</li>
                      </ul>
                      <h4>適合對象：</h4>
                      <ul>
                        <li>對該領域感興趣的初學者</li>
                        <li>希望提升技能的從業者</li>
                        <li>準備轉換職業跑道的人</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>課程大綱</CardTitle>
                    <CardDescription>
                      共 {currentCourse.lessons?.length || 0} 個章節，總時長 {Math.floor(totalDuration / 60)} 小時 {totalDuration % 60} 分鐘
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentCourse.lessons?.map((lesson, index) => (
                        <div 
                          key={lesson.lesson_id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {lesson.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : isEnrolled ? (
                                <PlayCircle className="h-5 w-5 text-primary" />
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {index + 1}. {lesson.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {lesson.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {lesson.duration_minutes || 0} 分鐘
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>講師介紹</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {currentCourse.instructor?.user_profiles?.first_name} {currentCourse.instructor?.user_profiles?.last_name}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          資深講師 • 5 年教學經驗
                        </p>
                        <p className="text-sm">
                          擁有豐富的實務經驗和教學熱忱，致力於幫助學員掌握實用技能，
                          已指導超過 10,000 名學員成功完成學習目標。
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div>課程數量: 12</div>
                          <div>學員總數: 15,678</div>
                          <div>平均評分: 4.9</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>學員評價</CardTitle>
                    <CardDescription>
                      來自 1,234 位學員的真實評價
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">學員 {review}</span>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            這門課程內容豐富，講師講解清晰，實作練習很有幫助。
                            推薦給想要學習這個領域的朋友！
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 選課卡片 */}
            <Card className="sticky top-4">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-primary/60" />
                </div>
                <CardTitle className="text-2xl">免費課程</CardTitle>
                <CardDescription>
                  立即開始您的學習之旅
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="space-y-3">
                    <Link to="/register">
                      <Button className="w-full" size="lg">
                        註冊並選課
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        已有帳戶？登入
                      </Button>
                    </Link>
                  </div>
                ) : isEnrolled ? (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      繼續學習
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      您已選修此課程
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                  >
                    {enrollmentLoading ? '選課中...' : '立即選課'}
                  </Button>
                )}

                <div className="flex justify-center space-x-4 pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    收藏
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 課程資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>課程資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">難度等級</span>
                  <Badge className={getDifficultyColor(currentCourse.difficulty_level)}>
                    {getDifficultyText(currentCourse.difficulty_level)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">課程分類</span>
                  <span>{getCategoryText(currentCourse.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">章節數量</span>
                  <span>{currentCourse.lessons?.length || 0} 章節</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">總時長</span>
                  <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">開課日期</span>
                  <span>{formatDate(currentCourse.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">結課日期</span>
                  <span>{formatDate(currentCourse.end_date)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

