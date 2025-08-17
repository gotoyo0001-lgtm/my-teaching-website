import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(6, '密碼至少需要6個字符'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn(data.email, data.password)
      
      if (result.success) {
        // 根據用戶角色導向到不同頁面
        const userRole = result.user?.profile?.role
        
        switch (userRole) {
          case 'student':
            // 探索者 → 我的課程頁面
            navigate('/my-courses')
            break
          case 'teacher':
            // 創造者 → 我的課程頁面 (未來可改為課程管理頁面)
            navigate('/my-courses')
            break
          case 'admin':
            // 管理者 → 管理者控制台
            navigate('/admin')
            break
          default:
            // 預設導向我的課程頁面
            navigate('/my-courses')
        }
      } else {
        setError(result.error || '登入失敗，請檢查您的帳號密碼')
      }
    } catch (err) {
      setError('登入過程中發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo 和標題 */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">
            歡迎回到
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              學習平台
            </span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            登入您的帳戶繼續學習之旅
          </p>
        </div>

        {/* 登入表單 */}
        <Card>
          <CardHeader>
            <CardTitle>登入</CardTitle>
            <CardDescription>
              輸入您的電子郵件和密碼來登入帳戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="請輸入您的電子郵件"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="請輸入您的密碼"
                    {...register('password')}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  忘記密碼？
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登入中...
                  </>
                ) : (
                  '登入'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    或
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  還沒有帳戶？{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    立即註冊
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 測試帳戶提示 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">測試帳戶</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>探索者:</strong> student@test.com / password123</p>
              <p><strong>創造者:</strong> teacher@test.com / password123</p>
              <p><strong>管理者:</strong> admin@test.com / password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

