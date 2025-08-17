import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useAssignmentStore } from '../store/assignmentStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Calendar, Clock, FileText, Download, Upload, ArrowLeft, User } from 'lucide-react'

export default function AssignmentDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const { getAssignmentById, getSubmissionByAssignmentId } = useAssignmentStore()
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        const assignmentData = await getAssignmentById(id)
        setAssignment(assignmentData)
        
        // 如果是學生，獲取提交記錄
        if (user?.profile?.role === 'student') {
          const submissionData = await getSubmissionByAssignmentId(id, user.id)
          setSubmission(submissionData)
        }
      } catch (error) {
        console.error('載入作業資料失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssignmentData()
  }, [id, user, getAssignmentById, getSubmissionByAssignmentId])

  const isTeacherOrAdmin = user?.profile?.role === 'teacher' || user?.profile?.role === 'admin'

  const getStatusBadge = () => {
    if (!assignment) return null
    
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    
    if (submission) {
      if (submission.status === 'graded') {
        return <Badge variant="success">已評分</Badge>
      } else {
        return <Badge variant="info">已提交</Badge>
      }
    } else if (dueDate < now) {
      return <Badge variant="destructive">已逾期</Badge>
    } else {
      return <Badge variant="warning">進行中</Badge>
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
          <Link to="/assignments">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回作業列表
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 作業標題和狀態 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                    <CardDescription className="mt-2">
                      課程：{assignment.course_title}
                    </CardDescription>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
            </Card>

            {/* 作業描述 */}
            <Card>
              <CardHeader>
                <CardTitle>作業說明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{assignment.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* 作業要求 */}
            {assignment.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>作業要求</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{assignment.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 附件 */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>相關檔案</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assignment.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{file.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          下載
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 提交記錄 (學生視角) */}
            {!isTeacherOrAdmin && submission && (
              <Card>
                <CardHeader>
                  <CardTitle>我的提交</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">提交時間：</span>
                      <span>{formatDate(submission.submitted_at)}</span>
                    </div>
                    
                    {submission.score !== null && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">得分：</span>
                        <span className="text-lg font-bold text-primary">
                          {submission.score} / {assignment.max_score}
                        </span>
                      </div>
                    )}
                    
                    {submission.feedback && (
                      <div>
                        <span className="font-medium">教師回饋：</span>
                        <p className="mt-2 p-3 bg-muted rounded-lg">{submission.feedback}</p>
                      </div>
                    )}
                    
                    {submission.files && submission.files.length > 0 && (
                      <div>
                        <span className="font-medium">提交檔案：</span>
                        <div className="mt-2 space-y-2">
                          {submission.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span>{file.name}</span>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                下載
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 作業資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>作業資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">截止時間</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assignment.due_date)}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">滿分</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.max_score} 分
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">發布者</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.teacher_name}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">發布時間</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assignment.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作按鈕 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {!isTeacherOrAdmin && !submission && new Date(assignment.due_date) > new Date() && (
                    <Link to={`/assignments/${assignment.id}/submit`} className="block">
                      <Button className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        提交作業
                      </Button>
                    </Link>
                  )}
                  
                  {!isTeacherOrAdmin && submission && submission.status !== 'graded' && new Date(assignment.due_date) > new Date() && (
                    <Link to={`/assignments/${assignment.id}/submit`} className="block">
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        重新提交
                      </Button>
                    </Link>
                  )}
                  
                  {isTeacherOrAdmin && (
                    <>
                      <Link to={`/assignments/${assignment.id}/edit`} className="block">
                        <Button variant="outline" className="w-full">
                          編輯作業
                        </Button>
                      </Link>
                      <Link to={`/assignments/${assignment.id}/grade`} className="block">
                        <Button className="w-full">
                          評分管理
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

