import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useAssignmentStore } from '../store/assignmentStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { ArrowLeft, Upload, FileText, X, Calendar, Clock } from 'lucide-react'

export default function AssignmentSubmitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getAssignmentById, submitAssignment, getSubmissionByAssignmentId } = useAssignmentStore()
  
  const [assignment, setAssignment] = useState(null)
  const [existingSubmission, setExistingSubmission] = useState(null)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const assignmentData = await getAssignmentById(id)
        setAssignment(assignmentData)
        
        // 檢查是否已有提交記錄
        const submissionData = await getSubmissionByAssignmentId(id, user.id)
        if (submissionData) {
          setExistingSubmission(submissionData)
          setContent(submissionData.content || '')
        }
      } catch (error) {
        console.error('載入作業資料失敗:', error)
        setError('載入作業資料失敗')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, user.id, getAssignmentById, getSubmissionByAssignmentId])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() && files.length === 0) {
      setError('請輸入作業內容或上傳檔案')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await submitAssignment(id, {
        content: content.trim(),
        files: files
      })
      
      navigate(`/assignments/${id}`, {
        state: { message: '作業提交成功！' }
      })
    } catch (error) {
      console.error('提交作業失敗:', error)
      setError('提交作業失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = assignment && new Date(assignment.due_date) < new Date()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">作業不存在</h3>
          <p className="mt-1 text-muted-foreground">找不到指定的作業。</p>
          <Link to="/assignments">
            <Button className="mt-4">返回作業列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link to={`/assignments/${id}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回作業詳情
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {existingSubmission ? '重新提交作業' : '提交作業'}
                </CardTitle>
                <CardDescription>
                  {assignment.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isOverdue && (
                  <Alert variant="destructive" className="mb-6">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      此作業已逾期，提交後可能會影響成績。
                    </AlertDescription>
                  </Alert>
                )}

                {existingSubmission && (
                  <Alert className="mb-6">
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      您已於 {formatDate(existingSubmission.submitted_at)} 提交過此作業。
                      重新提交將覆蓋之前的內容。
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 作業內容 */}
                  <div className="space-y-2">
                    <Label htmlFor="content">作業內容</Label>
                    <Textarea
                      id="content"
                      placeholder="請輸入您的作業內容..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      字數：{content.length}
                    </p>
                  </div>

                  {/* 檔案上傳 */}
                  <div className="space-y-4">
                    <Label>附件檔案</Label>
                    
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
                          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        支援格式：PDF, DOC, DOCX, TXT, ZIP, RAR (最大 10MB)
                      </p>
                    </div>

                    {/* 已選檔案列表 */}
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <Label>已選檔案：</Label>
                        {files.map((file, index) => (
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
                              onClick={() => removeFile(index)}
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
                      disabled={submitting || (!content.trim() && files.length === 0)}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          提交中...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {existingSubmission ? '重新提交' : '提交作業'}
                        </>
                      )}
                    </Button>
                    
                    <Link to={`/assignments/${id}`}>
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
            {/* 作業資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>作業資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">作業標題</p>
                  <p className="text-sm text-muted-foreground">{assignment.title}</p>
                </div>
                
                <div>
                  <p className="font-medium">課程</p>
                  <p className="text-sm text-muted-foreground">{assignment.course_title}</p>
                </div>
                
                <div>
                  <p className="font-medium">截止時間</p>
                  <p className={`text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formatDate(assignment.due_date)}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">滿分</p>
                  <p className="text-sm text-muted-foreground">{assignment.max_score} 分</p>
                </div>
              </CardContent>
            </Card>

            {/* 作業說明 */}
            <Card>
              <CardHeader>
                <CardTitle>作業說明</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{assignment.description}</p>
              </CardContent>
            </Card>

            {/* 提交須知 */}
            <Card>
              <CardHeader>
                <CardTitle>提交須知</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <p>• 請確保作業內容完整且符合要求</p>
                  <p>• 檔案大小不得超過 10MB</p>
                  <p>• 支援多種檔案格式</p>
                  <p>• 提交後可在截止時間前重新提交</p>
                  <p>• 逾期提交可能影響成績</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

