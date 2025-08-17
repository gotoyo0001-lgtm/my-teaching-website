import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useAssignmentStore } from '../store/assignmentStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Calendar, Clock, FileText, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AssignmentsPage() {
  const { user } = useAuthStore()
  const { assignments, fetchAssignments } = useAssignmentStore()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const isTeacherOrAdmin = user?.profile?.role === 'teacher' || user?.profile?.role === 'admin'

  const getStatusBadge = (assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    
    if (assignment.status === 'completed') {
      return <Badge variant="success">已完成</Badge>
    } else if (assignment.status === 'submitted') {
      return <Badge variant="info">已提交</Badge>
    } else if (dueDate < now) {
      return <Badge variant="destructive">已逾期</Badge>
    } else {
      return <Badge variant="warning">進行中</Badge>
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    switch (activeTab) {
      case 'pending':
        return assignment.status === 'pending'
      case 'submitted':
        return assignment.status === 'submitted'
      case 'completed':
        return assignment.status === 'completed'
      default:
        return true
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              作業中心
            </h1>
            <p className="text-muted-foreground mt-2">
              {isTeacherOrAdmin ? '管理和評分作業' : '查看和提交作業'}
            </p>
          </div>
          
          {isTeacherOrAdmin && (
            <Link to="/assignments/create">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                發布作業
              </Button>
            </Link>
          )}
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">總作業數</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-warning" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">進行中</p>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-info" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">已提交</p>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.status === 'submitted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">已完成</p>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 作業列表 */}
        <Card>
          <CardHeader>
            <CardTitle>作業列表</CardTitle>
            <CardDescription>
              {isTeacherOrAdmin ? '管理您發布的作業' : '查看您的作業任務'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="pending">進行中</TabsTrigger>
                <TabsTrigger value="submitted">已提交</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                      沒有作業
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isTeacherOrAdmin ? '開始發布第一個作業吧！' : '目前沒有待完成的作業。'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAssignments.map((assignment) => (
                      <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                {getStatusBadge(assignment)}
                              </div>
                              
                              <p className="text-muted-foreground mb-4 line-clamp-2">
                                {assignment.description}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>截止：{new Date(assignment.due_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>課程：{assignment.course_title}</span>
                                </div>
                                {assignment.max_score && (
                                  <div className="flex items-center gap-1">
                                    <span>滿分：{assignment.max_score}分</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Link to={`/assignments/${assignment.id}`}>
                                <Button variant="outline" size="sm">
                                  查看詳情
                                </Button>
                              </Link>
                              
                              {assignment.status === 'pending' && !isTeacherOrAdmin && (
                                <Link to={`/assignments/${assignment.id}/submit`}>
                                  <Button size="sm">
                                    提交作業
                                  </Button>
                                </Link>
                              )}
                              
                              {isTeacherOrAdmin && (
                                <Link to={`/assignments/${assignment.id}/grade`}>
                                  <Button variant="secondary" size="sm">
                                    評分管理
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

