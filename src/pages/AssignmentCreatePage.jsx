import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useAssignmentStore } from '../store/assignmentStore'
import { useCourseStore } from '../store/courseStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { ArrowLeft, Plus, Calendar, FileText, Upload, X } from 'lucide-react'

export default function AssignmentCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createAssignment } = useAssignmentStore()
  const { courses, fetchCourses } = useCourseStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    course_id: '',
    due_date: '',
    max_score: 100
  })
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...selectedFiles])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 表單驗證
    if (!formData.title.trim()) {
      setError('請輸入作業標題')
      return
    }
    if (!formData.description.trim()) {
      setError('請輸入作業說明')
      return
    }
    if (!formData.course_id) {
      setError('請選擇課程')
      return
    }
    if (!formData.due_date) {
      setError('請設定截止時間')
      return
    }
    if (new Date(formData.due_date) <= new Date()) {
      setError('截止時間必須是未來時間')
      return
    }
    if (formData.max_score <= 0) {
      setError('滿分必須大於0')
      return
    }

    setLoading(true)
    setError('')

    try {
      const assignmentData = {
        ...formData,
        attachments: attachments
      }
      
      const newAssignment = await createAssignment(assignmentData)
      
      navigate(`/assignments/${newAssignment.id}`, {
        state: { message: '作業發布成功！' }
      })
    } catch (error) {
      console.error('發布作業失敗:', error)
      setError('發布作業失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 獲取最小日期時間（當前時間 + 1小時）
  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link to="/assignments">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回作業列表
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  發布新作業
                </CardTitle>
                <CardDescription>
                  創建一個新的作業任務給學生完成
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本資訊 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">基本資訊</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">作業標題 *</Label>
                      <Input
                        id="title"
                        placeholder="請輸入作業標題"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course">選擇課程 *</Label>
                      <Select
                        value={formData.course_id}
                        onValueChange={(value) => handleInputChange('course_id', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇課程" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.course_id} value={course.course_id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="due_date">截止時間 *</Label>
                        <Input
                          id="due_date"
                          type="datetime-local"
                          min={getMinDateTime()}
                          value={formData.due_date}
                          onChange={(e) => handleInputChange('due_date', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_score">滿分 *</Label>
                        <Input
                          id="max_score"
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="100"
                          value={formData.max_score}
                          onChange={(e) => handleInputChange('max_score', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 作業內容 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">作業內容</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">作業說明 *</Label>
                      <Textarea
                        id="description"
                        placeholder="請詳細描述作業內容、目標和要求..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        字數：{formData.description.length}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">作業要求</Label>
                      <Textarea
                        id="requirements"
                        placeholder="請列出具體的作業要求、評分標準等..."
                        value={formData.requirements}
                        onChange={(e) => handleInputChange('requirements', e.target.value)}
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        字數：{formData.requirements.length}
                      </p>
                    </div>
                  </div>

                  {/* 附件上傳 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">相關檔案</h3>
                    
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="mt-2">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80">
                            點擊上傳檔案
                          </span>
                          <span className="text-muted-foreground"> 或拖拽檔案到此處</span>
                        </Label>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        支援格式：PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (最大 10MB)
                      </p>
                    </div>

                    {/* 已上傳檔案列表 */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <Label>已上傳檔案：</Label>
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 提交按鈕 */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          發布中...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          發布作業
                        </>
                      )}
                    </Button>
                    
                    <Link to="/assignments">
                      <Button type="button" variant="outline">
                        取消
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 發布須知 */}
            <Card>
              <CardHeader>
                <CardTitle>發布須知</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• 請確保作業說明清晰明確</p>
                  <p>• 設定合理的截止時間</p>
                  <p>• 提供必要的參考資料</p>
                  <p>• 明確評分標準和要求</p>
                  <p>• 發布後學生將收到通知</p>
                </div>
              </CardContent>
            </Card>

            {/* 評分建議 */}
            <Card>
              <CardHeader>
                <CardTitle>評分建議</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>基礎要求：</span>
                    <span>60-70分</span>
                  </div>
                  <div className="flex justify-between">
                    <span>良好完成：</span>
                    <span>70-85分</span>
                  </div>
                  <div className="flex justify-between">
                    <span>優秀表現：</span>
                    <span>85-95分</span>
                  </div>
                  <div className="flex justify-between">
                    <span>卓越創新：</span>
                    <span>95-100分</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速設定 */}
            <Card>
              <CardHeader>
                <CardTitle>快速設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const oneWeek = new Date()
                    oneWeek.setDate(oneWeek.getDate() + 7)
                    handleInputChange('due_date', oneWeek.toISOString().slice(0, 16))
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  一週後截止
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const twoWeeks = new Date()
                    twoWeeks.setDate(twoWeeks.getDate() + 14)
                    handleInputChange('due_date', twoWeeks.toISOString().slice(0, 16))
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  兩週後截止
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const oneMonth = new Date()
                    oneMonth.setMonth(oneMonth.getMonth() + 1)
                    handleInputChange('due_date', oneMonth.toISOString().slice(0, 16))
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  一個月後截止
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

