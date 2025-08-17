import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCourseStore } from '../../store/courseStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

export default function CourseCreatePage() {
  const navigate = useNavigate()
  const { createCourse } = useCourseStore()
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'programming',
    difficulty_level: 'beginner',
    price: 0,
    is_published: false,
    image_url: '',
    video_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (key, value) => {
    setCourseData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      // 模擬創建課程 API 調用
      await createCourse(courseData)
      setSuccessMessage('課程已成功新增！')
      setTimeout(() => {
        navigate('/admin/courses')
      }, 2000)
    } catch (err) {
      setError('新增課程失敗，請重試。')
      console.error('新增課程錯誤:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link to="/admin/courses">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回課程管理
            </Button>
          </Link>
        </div>

        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            新增課程
          </h1>
          <p className="text-muted-foreground">
            填寫課程資訊以建立新課程。
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>課程基本資訊</CardTitle>
            <CardDescription>填寫課程的標題、描述、分類和難度。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">課程標題</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="輸入課程標題"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">課程描述</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="輸入課程描述"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>課程分類</Label>
                  <Select 
                    value={courseData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">程式設計</SelectItem>
                      <SelectItem value="design">設計</SelectItem>
                      <SelectItem value="business">商業</SelectItem>
                      <SelectItem value="language">語言</SelectItem>
                      <SelectItem value="science">科學</SelectItem>
                      <SelectItem value="art">藝術</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>難度等級</Label>
                  <Select 
                    value={courseData.difficulty_level} 
                    onValueChange={(value) => handleInputChange('difficulty_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇難度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">初級</SelectItem>
                      <SelectItem value="intermediate">中級</SelectItem>
                      <SelectItem value="advanced">高級</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">價格</Label>
                <Input
                  id="price"
                  type="number"
                  value={courseData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  placeholder="輸入課程價格 (0為免費)"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">課程圖片 URL</Label>
                <Input
                  id="image_url"
                  value={courseData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="輸入課程圖片的 URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">課程影片 URL</Label>
                <Input
                  id="video_url"
                  value={courseData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  placeholder="輸入課程影片的 URL"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={courseData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_published">立即發布</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '正在新增...' : '新增課程'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


