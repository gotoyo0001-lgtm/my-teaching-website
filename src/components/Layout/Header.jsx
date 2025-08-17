import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  BookOpen, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X
} from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getUserRole = () => {
    if (!user?.profile) return 'explorer'
    
    // 根據資料庫的 role 欄位映射到新的等級系統
    const roleMap = {
      'student': 'explorer',
      'teacher': 'creator', 
      'admin': 'administrator'
    }
    return roleMap[user.profile.role] || 'explorer'
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'explorer': '探索者',
      'navigator': '導航者', 
      'creator': '創造者',
      'administrator': '管理者'
    }
    return roleNames[role] || '探索者'
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      'explorer': 'bg-blue-100 text-blue-800',
      'navigator': 'bg-green-100 text-green-800',
      'creator': 'bg-purple-100 text-purple-800', 
      'administrator': 'bg-red-100 text-red-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo 和網站名稱 */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              全方位教學互動平台
            </span>
          </Link>

          {/* 桌面導航 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/courses" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              課程
            </Link>
            <Link 
              to="/assignments" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              作業中心
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              關於我們
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              聯絡我們
            </Link>
          </nav>

          {/* 用戶區域 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* 用戶信息顯示 */}
                <div className="hidden md:flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.profile?.avatar_url} 
                      alt={`${user.profile?.first_name} ${user.profile?.last_name}`} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getRoleDisplayName(getUserRole())[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getRoleDisplayName(getUserRole())}
                    </span>
                  </div>
                </div>
                
                {/* 移動端用戶頭像 */}
                <div className="md:hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.profile?.avatar_url} 
                      alt={`${user.profile?.first_name} ${user.profile?.last_name}`} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getRoleDisplayName(getUserRole())[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* 導航按鈕 */}
                {user.profile?.role === 'admin' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="hidden md:flex"
                  >
                    管理者控制台
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="hidden md:flex"
                  >
                    進入學習中心
                  </Button>
                )}
                
                {/* 登出按鈕 */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">登出</span>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  登入
                </Button>
                <Button onClick={() => navigate('/register')}>
                  註冊
                </Button>
              </div>
            )}

            {/* 手機菜單按鈕 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* 手機導航菜單 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/courses" 
                className="px-2 py-1 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                課程
              </Link>
              <Link 
                to="/assignments" 
                className="px-2 py-1 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                作業中心
              </Link>
              <Link 
                to="/about" 
                className="px-2 py-1 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                關於我們
              </Link>
              <Link 
                to="/contact" 
                className="px-2 py-1 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                聯絡我們
              </Link>
              {!user && (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => {
                      navigate('/login')
                      setMobileMenuOpen(false)
                    }}
                  >
                    登入
                  </Button>
                  <Button 
                    className="justify-start"
                    onClick={() => {
                      navigate('/register')
                      setMobileMenuOpen(false)
                    }}
                  >
                    註冊
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

