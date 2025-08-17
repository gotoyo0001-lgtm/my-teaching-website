import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ArrowLeft,
  Send,
  Eye,
  EyeOff,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react'

export default function Announcements() {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  // 表單狀態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'normal',
    target_audience: 'all',
    is_published: false,
    expires_at: ''
  })

  // 模擬公告資料
  const mockAnnouncements = [
    {
      id: '1',
      title: '系統維護通知',
      content: '系統將於 2025年8月20日 凌晨2:00-4:00 進行例行維護，期間可能會有短暫的服務中斷。造成不便敬請見諒。',
      type: 'warning',
      priority: 'high',
      target_audience: 'all',
      is_published: true,
      created_at: '2025-08-15T10:00:00Z',
      expires_at: '2025-08-21T00:00:00Z',
      views: 1247,
      author: '系統管理員'
    },
    {
      id: '2',
      title: '新功能上線：作業系統',
      content: '我們很高興地宣布，全新的作業系統功能已經正式上線！現在創造者可以發布作業，探索者可以提交作業並獲得回饋。',
      type: 'success',
      priority: 'normal',
      target_audience: 'all',
      is_published: true,
      created_at: '2025-08-10T14:30:00Z',
      expires_at: null,
      views: 892,
      author: '產品團隊'
    },
    {
      id: '3',
      title: '課程品質提升計劃',
      content: '為了提供更好的學習體驗，我們將對所有課程進行品質審核。請創造者確保課程內容的完整性和準確性。',
      type: 'info',
      priority: 'normal',
      target_audience: 'teacher',
      is_published: true,
      created_at: '2025-08-08T09:15:00Z',
      expires_at: '2025-09-08T00:00:00Z',
      views: 234,
      author: '教學團隊'
    },
    {
      id: '4',
      title: '學習獎勵活動開始',
      content: '完成任意3門課程的探索者將獲得特殊徽章和證書！活動期間：8月1日至8月31日。',
      type: 'success',
      priority: 'normal',
      target_audience: 'student',
      is_published: false,
      created_at: '2025-08-05T16:45:00Z',
      expires_at: '2025-08-31T23:59:00Z',
      views: 0,
      author: '活動小組'
    }
  ]

  useEffect(() => {
    // 模擬載入公告資料
    setTimeout(() => {
      setAnnouncements(mockAnnouncements)
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'error':
        return <X className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type) => {
    const variants = {
      'info': 'default',
      'success': 'success',
      'warning': 'warning',
      'error': 'destructive'
    }
    const labels = {
      'info': '資訊',
      'success': '成功',
      'warning': '警告',
      'error': '錯誤'
    }
    return <Badge variant={variants[type]}>{labels[type]}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      'low': 'secondary',
      'normal': 'outline',
      'high': 'destructive'
    }
    const labels = {
      'low': '低',
      'normal': '普通',
      'high': '高'
    }
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>
  }

  const getAudienceLabel = (audience) => {
    const labels = {
      'all': '所有用戶',
      'student': '探索者',
      'teacher': '創造者',
      'admin': '管理者'
    }
    return labels[audience] || audience
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingAnnouncement) {
      // 更新公告
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { 
              ...ann, 
              ...formData,
              updated_at: new Date().toISOString()
            }
          : ann
      ))
      setEditingAnnouncement(null)
    } else {
      // 創建新公告
      const newAnnouncement = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        views: 0,
        author: `${user?.profile?.first_name} ${user?.profile?.last_name}`
      }
      setAnnouncements([newAnnouncement, ...announcements])
    }

    // 重置表單
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'normal',
      target_audience: 'all',
      is_published: false,
      expires_at: ''
    })
    setShowCreateForm(false)
  }

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      is_published: announcement.is_published,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ''
    })
    setEditingAnnouncement(announcement)
    setShowCreateForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('確定要刪除此公告嗎？此操作無法復原。')) {
      setAnnouncements(announcements.filter(ann => ann.id !== id))
    }
  }

  const handleTogglePublish = (id) => {
    setAnnouncements(announcements.map(ann => 
      ann.id === id 
        ? { ...ann, is_published: !ann.is_published }
        : ann
    ))
  }

  const cancelEdit = () => {
    setEditingAnnouncement(null)
    setShowCreateForm(false)
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'normal',
      target_audience: 'all',
      is_published: false,
      expires_at: ''
    })
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
          <p className="text-muted-foreground">載入公告資料中...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              公告管理
            </h1>
            <p className="text-muted-foreground">
              發布和管理全站公告，與用戶保持溝通。
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            新增公告
          </Button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總公告數</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已發布</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {announcements.filter(a => a.is_published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">草稿</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {announcements.filter(a => !a.is_published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總瀏覽數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {announcements.reduce((total, ann) => total + ann.views, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 創建/編輯表單 */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAnnouncement ? '編輯公告' : '新增公告'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">公告標題</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="輸入公告標題..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>公告類型</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">資訊</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                        <SelectItem value="warning">警告</SelectItem>
                        <SelectItem value="error">錯誤</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>優先級</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="normal">普通</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>目標受眾</Label>
                    <Select value={formData.target_audience} onValueChange={(value) => setFormData({...formData, target_audience: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有用戶</SelectItem>
                        <SelectItem value="student">探索者</SelectItem>
                        <SelectItem value="teacher">創造者</SelectItem>
                        <SelectItem value="admin">管理者</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires_at">過期時間（可選）</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                      />
                      立即發布
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">公告內容</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="輸入公告內容..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingAnnouncement ? '更新公告' : '創建公告'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 公告列表 */}
        <Card>
          <CardHeader>
            <CardTitle>公告列表</CardTitle>
            <CardDescription>
              管理所有平台公告
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        {getTypeBadge(announcement.type)}
                        {getPriorityBadge(announcement.priority)}
                        {announcement.is_published ? (
                          <Badge variant="success">已發布</Badge>
                        ) : (
                          <Badge variant="secondary">草稿</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>作者：{announcement.author}</span>
                        <span>目標：{getAudienceLabel(announcement.target_audience)}</span>
                        <span>瀏覽：{announcement.views} 次</span>
                        <span>創建：{formatDate(announcement.created_at)}</span>
                        {announcement.expires_at && (
                          <span>過期：{formatDate(announcement.expires_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(announcement.id)}
                      >
                        {announcement.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {announcements.length === 0 && (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">還沒有公告</h3>
                <p className="text-muted-foreground">
                  點擊上方的「新增公告」按鈕來創建第一個公告。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

