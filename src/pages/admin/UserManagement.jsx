import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ArrowLeft,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
  Compass
} from 'lucide-react'

export default function UserManagement() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // 模擬用戶資料
  const mockUsers = [
    {
      id: '1',
      email: 'explorer@test.com',
      profile: {
        first_name: '探索者',
        last_name: '測試',
        role: 'student',
        avatar_url: null,
        created_at: '2024-01-15T00:00:00Z',
        last_login: '2025-08-17T10:30:00Z',
        status: 'active'
      },
      stats: {
        courses_enrolled: 5,
        assignments_completed: 12,
        total_study_time: 45
      }
    },
    {
      id: '2',
      email: 'creator@test.com',
      profile: {
        first_name: '創造者',
        last_name: '測試',
        role: 'teacher',
        avatar_url: null,
        created_at: '2024-01-10T00:00:00Z',
        last_login: '2025-08-17T09:15:00Z',
        status: 'active'
      },
      stats: {
        courses_created: 8,
        students_taught: 156,
        assignments_graded: 89
      }
    },
    {
      id: '3',
      email: 'admin@test.com',
      profile: {
        first_name: '管理者',
        last_name: '測試',
        role: 'admin',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2025-08-17T11:00:00Z',
        status: 'active'
      },
      stats: {
        total_users_managed: 1247,
        system_actions: 234,
        announcements_sent: 15
      }
    },
    {
      id: '4',
      email: 'john.doe@example.com',
      profile: {
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        avatar_url: null,
        created_at: '2024-03-15T00:00:00Z',
        last_login: '2025-08-16T14:20:00Z',
        status: 'active'
      },
      stats: {
        courses_enrolled: 3,
        assignments_completed: 8,
        total_study_time: 22
      }
    },
    {
      id: '5',
      email: 'jane.smith@example.com',
      profile: {
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'teacher',
        avatar_url: null,
        created_at: '2024-02-20T00:00:00Z',
        last_login: '2025-08-15T16:45:00Z',
        status: 'inactive'
      },
      stats: {
        courses_created: 3,
        students_taught: 67,
        assignments_graded: 34
      }
    }
  ]

  useEffect(() => {
    // 模擬載入用戶資料
    setTimeout(() => {
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // 篩選用戶
    let filtered = users

    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.profile.first_name} ${user.profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 角色篩選
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.profile.role === roleFilter)
    }

    // 狀態篩選
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.profile.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />
      case 'teacher':
        return <GraduationCap className="w-4 h-4" />
      case 'student':
        return <Compass className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': '管理者',
      'teacher': '創造者',
      'student': '探索者'
    }
    return roleNames[role] || role
  }

  const getRoleBadgeVariant = (role) => {
    const variants = {
      'admin': 'destructive',
      'teacher': 'default',
      'student': 'secondary'
    }
    return variants[role] || 'outline'
  }

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge variant="success">活躍</Badge>
    ) : (
      <Badge variant="secondary">非活躍</Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, profile: { ...user.profile, role: newRole } }
        : user
    ))
  }

  const handleStatusToggle = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            profile: { 
              ...user.profile, 
              status: user.profile.status === 'active' ? 'inactive' : 'active' 
            } 
          }
        : user
    ))
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('確定要刪除此用戶嗎？此操作無法復原。')) {
      setUsers(users.filter(user => user.id !== userId))
    }
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
          <p className="text-muted-foreground">載入用戶資料中...</p>
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
            用戶管理
          </h1>
          <p className="text-muted-foreground">
            管理平台上的所有用戶，包括角色分配和狀態控制。
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">探索者</CardTitle>
              <Compass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.profile.role === 'student').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">創造者</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.profile.role === 'teacher').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理者</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.profile.role === 'admin').length}
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
                <Label htmlFor="search">搜尋用戶</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="搜尋姓名或電子郵件..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>角色篩選</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有角色</SelectItem>
                    <SelectItem value="student">探索者</SelectItem>
                    <SelectItem value="teacher">創造者</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
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
                    <SelectItem value="active">活躍</SelectItem>
                    <SelectItem value="inactive">非活躍</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  新增用戶
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用戶列表 */}
        <Card>
          <CardHeader>
            <CardTitle>用戶列表</CardTitle>
            <CardDescription>
              找到 {filteredUsers.length} 位用戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRoleIcon(userData.profile.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {userData.profile.first_name} {userData.profile.last_name}
                        </h3>
                        <Badge variant={getRoleBadgeVariant(userData.profile.role)}>
                          {getRoleDisplayName(userData.profile.role)}
                        </Badge>
                        {getStatusBadge(userData.profile.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                      <p className="text-xs text-muted-foreground">
                        註冊時間：{formatDate(userData.profile.created_at)} | 
                        最後登入：{formatDate(userData.profile.last_login)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 角色變更 */}
                    <Select 
                      value={userData.profile.role} 
                      onValueChange={(value) => handleRoleChange(userData.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">探索者</SelectItem>
                        <SelectItem value="teacher">創造者</SelectItem>
                        <SelectItem value="admin">管理者</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* 狀態切換 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(userData.id)}
                    >
                      {userData.profile.status === 'active' ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </Button>

                    {/* 刪除用戶 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(userData.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">沒有找到用戶</h3>
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

