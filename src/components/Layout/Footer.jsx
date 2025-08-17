import { Link } from 'react-router-dom'
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌資訊 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                全方位教學互動平台
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              打造最優質的線上學習體驗，讓每個人都能在這裡找到適合自己的學習路徑，
              從探索者成長為創造者。
            </p>
          </div>

          {/* 快速連結 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">快速連結</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-primary transition-colors">
                  瀏覽課程
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  關於我們
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  聯絡我們
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  幫助中心
                </Link>
              </li>
            </ul>
          </div>

          {/* 學習者資源 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">學習者資源</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  學習儀表板
                </Link>
              </li>
              <li>
                <Link to="/my-courses" className="text-muted-foreground hover:text-primary transition-colors">
                  我的課程
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="text-muted-foreground hover:text-primary transition-colors">
                  作業中心
                </Link>
              </li>
              <li>
                <Link to="/discussions" className="text-muted-foreground hover:text-primary transition-colors">
                  討論區
                </Link>
              </li>
            </ul>
          </div>

          {/* 聯絡資訊 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">聯絡我們</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@learning-platform.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+886-2-1234-5678</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>台北市信義區信義路五段7號</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部分隔線和版權資訊 */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 全方位教學互動平台. 保留所有權利.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                隱私政策
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                服務條款
              </Link>
              <Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie 政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

