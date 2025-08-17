import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  TrendingUp, 
  Bell,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    totalCourses: 156,
    totalAssignments: 89,
    activeUsers: 342,
    pendingApprovals: 12,
    systemHealth: 'healthy'
  })

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'user_registration',
      message: '新用戶註冊：張小明',
      timestamp: '2025-08-17T10:30:00Z',
      status: 'info'
    },
    {
      id: 2,
      type: 'course_published',
      message: '課程發布：React 進階開發',
      timestamp: '2025-08-17T09:15:00Z',
      status: 'success'
    },
    {
      id: 3,
      type: 'system_alert',
      message: '系統負載較高，建議檢查',
      timestamp: '2025-08-17T08:45:00Z',
      status: 'warning'
    },
    {
      id: 4,
      type: 'content_report',
      message: '內容舉報：需要審核',
      timestamp: '2025-08-17T08:20:00Z',
      status: 'error'
    }
  ])

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <Users className="w-4 h-4" />
      case 'course_published':
        return <BookOpen className="w-4 h-4" />
      case 'system_alert':
        return <AlertTriangle className="w-4 h-4" />
      case 'content_report':
        return <Shield className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'destructive'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            管理者控制台
          </h1>
          <p className="text-muted-foreground">
            歡迎回來，{user?.profile?.first_name} {user?.profile?.last_name}！
            管理和監控您的教學平台。
          </p>
        </div>

        {/* 系統狀態警告 */}
        {systemStats.systemHealth !== 'healthy' && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              系統狀態異常，請檢查系統設定或聯繫技術支援。
            </AlertDescription>
          </Alert>
        )}

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% 較上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總課程數</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                +8 本月新增
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活躍用戶</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                過去7天
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待審核項目</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                需要處理
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 快速操作 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
                <CardDescription>
                  常用的管理功能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    用戶管理
                  </Button>
                </Link>
                <Link to="/admin/courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    課程管理
                  </Button>
                </Link>
                <Link to="/admin/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    數據分析
                  </Button>
                </Link>
                <Link to="/admin/announcements" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    公告管理
                  </Button>
                </Link>
                <Link to="/admin/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    系統設定
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* 最近活動 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>最近活動</CardTitle>
                <CardDescription>
                  系統最新的活動記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/admin/activities">
                    <Button variant="outline" size="sm">
                      查看所有活動
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 系統健康狀態 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                系統狀態
              </CardTitle>
              <CardDescription>
                平台各項服務運行狀況
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">資料庫</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">檔案儲存</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">郵件服務</span>
                  <Badge variant="warning">警告</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

