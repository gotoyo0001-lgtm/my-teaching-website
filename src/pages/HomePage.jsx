import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useCourseStore } from '../store/courseStore'
import { useAuthStore } from '../store/authStore'
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Star,
  Clock,
  Play,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { courses, fetchCourses, loading } = useCourseStore()
  const [featuredCourses, setFeaturedCourses] = useState([])

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    // 取前6個課程作為推薦課程
    if (courses.length > 0) {
      setFeaturedCourses(courses.slice(0, 6))
    }
  }, [courses])

  const stats = [
    {
      icon: BookOpen,
      label: '課程總數',
      value: '500+',
      description: '涵蓋各領域專業課程'
    },
    {
      icon: Users,
      label: '學習者',
      value: '10,000+',
      description: '活躍的學習社群'
    },
    {
      icon: Award,
      label: '完課率',
      value: '95%',
      description: '高品質教學成果'
    },
    {
      icon: TrendingUp,
      label: '滿意度',
      value: '4.8/5',
      description: '學員真實評價'
    }
  ]

  const features = [
    {
      icon: Play,
      title: '互動式學習',
      description: '豐富的影片內容、實作練習和即時回饋，讓學習更有趣更有效'
    },
    {
      icon: Users,
      title: '社群討論',
      description: '與同學和老師互動交流，分享學習心得，共同成長進步'
    },
    {
      icon: Award,
      title: '等級系統',
      description: '從探索者到創造者，清晰的成長路徑讓你看見自己的進步'
    },
    {
      icon: CheckCircle,
      title: '認證證書',
      description: '完成課程獲得專業認證，為你的履歷增添亮點'
    }
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

  return (
    <div className="min-h-screen">
      {/* 英雄區塊 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              開啟你的
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                學習之旅
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              在全方位教學互動平台，每個人都能找到適合自己的學習路徑。
              從探索者成長為創造者，讓知識改變你的未來。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/dashboard')}
                  className="text-lg px-8 py-6"
                >
                  進入學習中心
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/register')}
                    className="text-lg px-8 py-6"
                  >
                    立即開始學習
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/courses')}
                    className="text-lg px-8 py-6"
                  >
                    瀏覽課程
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 統計數據 */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">為什麼選擇我們？</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              我們提供最先進的學習工具和最優質的教學內容，讓你的學習之旅更加精彩
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 推薦課程 */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">熱門課程推薦</h2>
              <p className="text-xl text-muted-foreground">
                精選優質課程，開始你的學習之旅
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/courses')}>
              查看全部課程
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.course_id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/60" />
                  </div>
                  <CardHeader>
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
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
                        講師: {course.instructor?.user_profiles?.first_name} {course.instructor?.user_profiles?.last_name}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/courses/${course.course_id}`)}
                      >
                        查看詳情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA 區塊 */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            準備好開始學習了嗎？
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            加入我們的學習社群，與千萬學習者一起成長，讓知識改變你的人生
          </p>
          {!user && (
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register')}
              className="text-lg px-8 py-6"
            >
              免費註冊開始學習
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

