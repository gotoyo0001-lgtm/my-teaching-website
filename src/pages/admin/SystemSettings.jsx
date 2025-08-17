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
import { Separator } from '../../components/ui/separator'
import { 
  Settings, 
  Shield, 
  ArrowLeft,
  Save,
  RefreshCw,
  Database,
  Mail,
  Globe,
  Palette,
  Bell,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

export default function SystemSettings() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // 系統設定狀態
  const [settings, setSettings] = useState({
    // 基本設定
    site_name: '全方位教學互動平台',
    site_description: '一個創新的線上學習平台，提供豐富的課程和互動學習體驗。',
    site_url: 'https://learning-platform.example.com',
    admin_email: 'admin@example.com',
    
    // 用戶設定
    allow_registration: true,
    require_email_verification: true,
    default_user_role: 'student',
    max_file_upload_size: 10, // MB
    
    // 課程設定
    require_course_approval: false,
    allow_course_rating: true,
    max_course_duration: 120, // 分鐘
    
    // 通知設定
    email_notifications: true,
    push_notifications: false,
    notification_frequency: 'daily',
    
    // 安全設定
    session_timeout: 30, // 分鐘
    password_min_length: 8,
    require_strong_password: true,
    enable_two_factor: false,
    
    // 外觀設定
    theme: 'light',
    primary_color: '#FF6B35',
    secondary_color: '#00D4FF',
    accent_color: '#00E676',
    
    // 功能開關
    enable_assignments: true,
    enable_discussions: true,
    enable_certificates: false,
    enable_analytics: true,
    
    // 維護模式
    maintenance_mode: false,
    maintenance_message: '系統正在維護中，請稍後再試。'
  })

  useEffect(() => {
    // 模擬載入設定
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async (section) => {
    setSaving(true)
    try {
      // 模擬保存設定
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveMessage(`${section} 設定已成功保存！`)
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('保存失敗，請重試。')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
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
          <p className="text-muted-foreground">載入系統設定中...</p>
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
            系統設定
          </h1>
          <p className="text-muted-foreground">
            配置和管理平台的各項系統設定。
          </p>
        </div>

        {/* 保存訊息 */}
        {saveMessage && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 基本設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                基本設定
              </CardTitle>
              <CardDescription>
                網站的基本資訊和配置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">網站名稱</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_description">網站描述</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_url">網站網址</Label>
                <Input
                  id="site_url"
                  value={settings.site_url}
                  onChange={(e) => handleInputChange('site_url', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin_email">管理員信箱</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                />
              </div>
              
              <Button onClick={() => handleSave('基本')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                保存基本設定
              </Button>
            </CardContent>
          </Card>

          {/* 用戶設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                用戶設定
              </CardTitle>
              <CardDescription>
                用戶註冊和權限相關設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allow_registration">允許用戶註冊</Label>
                <input
                  id="allow_registration"
                  type="checkbox"
                  checked={settings.allow_registration}
                  onChange={() => handleToggle('allow_registration')}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require_email_verification">需要信箱驗證</Label>
                <input
                  id="require_email_verification"
                  type="checkbox"
                  checked={settings.require_email_verification}
                  onChange={() => handleToggle('require_email_verification')}
                  className="rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label>預設用戶角色</Label>
                <Select 
                  value={settings.default_user_role} 
                  onValueChange={(value) => handleInputChange('default_user_role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">探索者</SelectItem>
                    <SelectItem value="teacher">創造者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_file_upload_size">最大檔案上傳大小 (MB)</Label>
                <Input
                  id="max_file_upload_size"
                  type="number"
                  value={settings.max_file_upload_size}
                  onChange={(e) => handleInputChange('max_file_upload_size', parseInt(e.target.value))}
                />
              </div>
              
              <Button onClick={() => handleSave('用戶')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                保存用戶設定
              </Button>
            </CardContent>
          </Card>

          {/* 安全設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                安全設定
              </CardTitle>
              <CardDescription>
                系統安全和密碼相關設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session_timeout">會話超時時間 (分鐘)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password_min_length">密碼最小長度</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={settings.password_min_length}
                  onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require_strong_password">需要強密碼</Label>
                <input
                  id="require_strong_password"
                  type="checkbox"
                  checked={settings.require_strong_password}
                  onChange={() => handleToggle('require_strong_password')}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_two_factor">啟用雙重驗證</Label>
                <input
                  id="enable_two_factor"
                  type="checkbox"
                  checked={settings.enable_two_factor}
                  onChange={() => handleToggle('enable_two_factor')}
                  className="rounded"
                />
              </div>
              
              <Button onClick={() => handleSave('安全')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                保存安全設定
              </Button>
            </CardContent>
          </Card>

          {/* 外觀設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                外觀設定
              </CardTitle>
              <CardDescription>
                網站主題和顏色配置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>主題</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => handleInputChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">淺色主題</SelectItem>
                    <SelectItem value="dark">深色主題</SelectItem>
                    <SelectItem value="auto">自動</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary_color">主要顏色</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    placeholder="#FF6B35"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondary_color">次要顏色</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    placeholder="#00D4FF"
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSave('外觀')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                保存外觀設定
              </Button>
            </CardContent>
          </Card>

          {/* 功能開關 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                功能開關
              </CardTitle>
              <CardDescription>
                啟用或停用平台功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_assignments">作業系統</Label>
                <input
                  id="enable_assignments"
                  type="checkbox"
                  checked={settings.enable_assignments}
                  onChange={() => handleToggle('enable_assignments')}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_discussions">討論區</Label>
                <input
                  id="enable_discussions"
                  type="checkbox"
                  checked={settings.enable_discussions}
                  onChange={() => handleToggle('enable_discussions')}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_certificates">證書系統</Label>
                <input
                  id="enable_certificates"
                  type="checkbox"
                  checked={settings.enable_certificates}
                  onChange={() => handleToggle('enable_certificates')}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enable_analytics">數據分析</Label>
                <input
                  id="enable_analytics"
                  type="checkbox"
                  checked={settings.enable_analytics}
                  onChange={() => handleToggle('enable_analytics')}
                  className="rounded"
                />
              </div>
              
              <Button onClick={() => handleSave('功能')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                保存功能設定
              </Button>
            </CardContent>
          </Card>

          {/* 維護模式 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                維護模式
              </CardTitle>
              <CardDescription>
                系統維護和緊急設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance_mode">啟用維護模式</Label>
                <input
                  id="maintenance_mode"
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={() => handleToggle('maintenance_mode')}
                  className="rounded"
                />
              </div>
              
              {settings.maintenance_mode && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    維護模式已啟用，一般用戶將無法訪問網站。
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="maintenance_message">維護訊息</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={() => handleSave('維護')} 
                disabled={saving}
                variant={settings.maintenance_mode ? "destructive" : "default"}
              >
                <Save className="w-4 h-4 mr-2" />
                保存維護設定
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 系統狀態 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              系統狀態
            </CardTitle>
            <CardDescription>
              當前系統運行狀況
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">資料庫連接</span>
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
  )
}

