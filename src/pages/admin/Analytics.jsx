import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  BookOpen, 
  Clock, 
  Shield, 
  ArrowLeft,
  Calendar,
  Target,
  Award,
  Activity,
  Eye,
  Download
} from 'lucide-react'

export default function Analytics() {
  const { user } = useAuthStore()
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  // 模擬分析資料
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 1247,
      activeUsers: 342,
      totalCourses: 156,
      completionRate: 68.5,
      userGrowth: 12.3,
      courseGrowth: 8.7,
      engagementRate: 75.2,
      avgStudyTime: 45
    },
    userStats: {
      newRegistrations: [
        { date: '2025-08-10', count: 15 },
        { date: '2025-08-11', count: 23 },
        { date: '2025-08-12', count: 18 },
        { date: '2025-08-13', count: 31 },
        { date: '2025-08-14', count: 27 },
        { date: '2025-08-15', count: 19 },
        { date: '2025-08-16', count: 25 },
        { date: '2025-08-17', count: 22 }
      ],
      roleDistribution: {
        student: 1089,
        teacher: 145,
        admin: 13
      }
    },
    courseStats: {
      popularCourses: [
        { id: 1, title: 'Python 程式設計入門', enrollments: 234, rating: 4.8 },
        { id: 2, title: '網頁設計與開發', enrollments: 189, rating: 4.6 },
        { id: 3, title: '數據分析與視覺化', enrollments: 156, rating: 4.7 },
        { id: 4, title: 'JavaScript 進階開發', enrollments: 134, rating: 4.5 },
        { id: 5, title: 'UI/UX 設計原理', enrollments: 98, rating: 4.4 }
      ],
      categoryStats: {
        programming: 45,
        design: 32,
        business: 28,
        language: 21,
        science: 18,
        art: 12
      }
    },
    engagement: {
      dailyActiveUsers: [
        { date: '2025-08-10', count: 298 },
        { date: '2025-08-11', count: 312 },
        { date: '2025-08-12', count: 287 },
        { date: '2025-08-13', count: 345 },
        { date: '2025-08-14', count: 356 },
        { date: '2025-08-15', count: 289 },
        { date: '2025-08-16', count: 334 },
        { date: '2025-08-17', count: 342 }
      ],
      avgSessionTime: 28,
      bounceRate: 24.5,
      returnRate: 67.8
    }
  })

  useEffect(() => {
    // 模擬載入分析資料
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const formatNumber = (num) => {
    return num.toLocaleString()
  }

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`
  }

  const getTrendIcon = (value) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getTrendColor = (value) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500'
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
          <p className="text-muted-foreground">載入分析資料中...</p>
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

        {/* 頁面標題和時間範圍選擇 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              數據分析
            </h1>
            <p className="text-muted-foreground">
              平台使用情況和趨勢分析
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">過去 7 天</SelectItem>
                <SelectItem value="30d">過去 30 天</SelectItem>
                <SelectItem value="90d">過去 90 天</SelectItem>
                <SelectItem value="1y">過去 1 年</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              匯出報告
            </Button>
          </div>
        </div>

        {/* 概覽統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalUsers)}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analyticsData.overview.userGrowth)}
                <span className={`ml-1 ${getTrendColor(analyticsData.overview.userGrowth)}`}>
                  {formatPercentage(analyticsData.overview.userGrowth)} 較上期
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活躍用戶</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.activeUsers)}</div>
              <div className="flex items-center text-xs">
                <span className="text-muted-foreground">
                  參與率 {formatPercentage(analyticsData.overview.engagementRate)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總課程數</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalCourses)}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analyticsData.overview.courseGrowth)}
                <span className={`ml-1 ${getTrendColor(analyticsData.overview.courseGrowth)}`}>
                  {formatPercentage(analyticsData.overview.courseGrowth)} 較上期
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">完成率</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(analyticsData.overview.completionRate)}</div>
              <div className="flex items-center text-xs">
                <span className="text-muted-foreground">
                  平均學習時間 {analyticsData.overview.avgStudyTime} 分鐘
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 用戶角色分布 */}
          <Card>
            <CardHeader>
              <CardTitle>用戶角色分布</CardTitle>
              <CardDescription>
                不同角色的用戶數量統計
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">探索者</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(analyticsData.userStats.roleDistribution.student)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((analyticsData.userStats.roleDistribution.student / analyticsData.overview.totalUsers) * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">創造者</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(analyticsData.userStats.roleDistribution.teacher)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((analyticsData.userStats.roleDistribution.teacher / analyticsData.overview.totalUsers) * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">管理者</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(analyticsData.userStats.roleDistribution.admin)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((analyticsData.userStats.roleDistribution.admin / analyticsData.overview.totalUsers) * 100)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 課程分類統計 */}
          <Card>
            <CardHeader>
              <CardTitle>課程分類統計</CardTitle>
              <CardDescription>
                各分類的課程數量分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.courseStats.categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{category}</span>
                    <div className="text-right">
                      <div className="font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage((count / analyticsData.overview.totalCourses) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 熱門課程 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>熱門課程</CardTitle>
            <CardDescription>
              根據註冊人數和評分排序的熱門課程
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.courseStats.popularCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollments} 學員
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {course.rating} 評分
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 用戶參與度指標 */}
        <Card>
          <CardHeader>
            <CardTitle>用戶參與度指標</CardTitle>
            <CardDescription>
              用戶行為和參與度相關數據
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {analyticsData.engagement.avgSessionTime}分鐘
                </div>
                <div className="text-sm text-muted-foreground">平均會話時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-2">
                  {formatPercentage(analyticsData.engagement.returnRate)}
                </div>
                <div className="text-sm text-muted-foreground">回訪率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500 mb-2">
                  {formatPercentage(analyticsData.engagement.bounceRate)}
                </div>
                <div className="text-sm text-muted-foreground">跳出率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

