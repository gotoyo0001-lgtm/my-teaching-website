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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { BookOpen, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

const registerSchema = z.object({
  firstName: z.string().min(1, '請輸入名字'),
  lastName: z.string().min(1, '請輸入姓氏'),
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(6, '密碼至少需要6個字符'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher'], {
    required_error: '請選擇您的角色',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼確認不匹配',
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const watchedRole = watch('role')

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      })
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(result.error || '註冊失敗，請稍後再試')
      }
    } catch (err) {
      setError('註冊過程中發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleInfo = (role) => {
    const roleInfo = {
      student: {
        title: '探索者',
        description: '開始您的學習之旅，探索各種知識領域',
        features: ['瀏覽和選修課程', '參與討論和互動', '追蹤學習進度', '獲得學習認證']
      },
      teacher: {
        title: '創造者', 
        description: '分享您的知識，創造優質的學習內容',
        features: ['創建和管理課程', '設計作業和評估', '與學生互動指導', '分析學習數據']
      }
    }
    return roleInfo[role] || roleInfo.student
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">註冊成功！</h2>
            <p className="text-muted-foreground mb-4">
              歡迎加入全方位教學互動平台！請檢查您的電子郵件以驗證帳戶。
            </p>
            <p className="text-sm text-muted-foreground">
              正在跳轉到登入頁面...
            </p>
          </CardContent>
        </Card>
      </div>
    )
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
            加入
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              學習社群
            </span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            創建您的帳戶，開始精彩的學習之旅
          </p>
        </div>

        {/* 註冊表單 */}
        <Card>
          <CardHeader>
            <CardTitle>註冊新帳戶</CardTitle>
            <CardDescription>
              填寫以下資訊來創建您的學習帳戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 姓名欄位 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">名字</Label>
                  <Input
                    id="firstName"
                    placeholder="名字"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">姓氏</Label>
                  <Input
                    id="lastName"
                    placeholder="姓氏"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* 電子郵件 */}
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

              {/* 角色選擇 */}
              <div className="space-y-2">
                <Label>選擇您的角色</Label>
                <Select onValueChange={(value) => setValue('role', value)}>
                  <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="請選擇您的角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">探索者 (學習者)</SelectItem>
                    <SelectItem value="teacher">創造者 (教學者)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
                
                {/* 角色說明 */}
                {watchedRole && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-1">
                      {getRoleInfo(watchedRole).title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {getRoleInfo(watchedRole).description}
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {getRoleInfo(watchedRole).features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 密碼 */}
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="請輸入密碼 (至少6個字符)"
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

              {/* 確認密碼 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認密碼</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="請再次輸入密碼"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    註冊中...
                  </>
                ) : (
                  '創建帳戶'
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
                  已經有帳戶了？{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    立即登入
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

