'use client';

import type { Database } from '@/lib/database.types';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: 'incubating' | 'published' | 'archived';
  difficulty_level: number;
  estimated_duration: number | null;
  enrollment_count: number;
  created_at: string;
  published_at: string | null;
  creator: {
    username: string;
    display_name: string | null;
    role: string;
  };
}

export default function CourseManagement() {
  const { profile, isLoading } = useAuth();
  const { canViewAnalytics } = usePermissions();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== 'guardian')) {
      router.push('/admin');
    }
  }, [profile, isLoading, router]);

  useEffect(() => {
    if (profile?.role === 'guardian') {
      loadCourses();
    }
  }, [profile, sortBy]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          creator:profiles!creator_id(username, display_name, role)
        `)
        .order(sortBy, { ascending: false });

      if (error) {
        console.error('載入課程失敗:', error);
        return;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('載入課程時發生錯誤:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-cosmic-success bg-cosmic-success/20';
      case 'incubating': return 'text-cosmic-accent bg-cosmic-accent/20';
      case 'archived': return 'text-cosmic-light bg-cosmic-light/20';
      default: return 'text-cosmic-light bg-cosmic-light/20';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'published': return '已發布';
      case 'incubating': return '孵化中';
      case 'archived': return '已歸檔';
      default: return '未知';
    }
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level) + '☆'.repeat(5 - level);
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // 如果是發布，設置發布時間
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseId);

      if (error) {
        console.error('更新課程狀態失敗:', error);
        alert('更新課程狀態失敗，請稍後再試');
        return;
      }

      alert('課程狀態更新成功！');
      loadCourses();
    } catch (error) {
      console.error('更新課程狀態時發生錯誤:', error);
      alert('更新課程狀態時發生錯誤');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`確定要刪除課程「${course.title}」嗎？此操作無法恢復。`)) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      if (error) {
        console.error('刪除課程失敗:', error);
        alert('刪除課程失敗，請稍後再試');
        return;
      }

      alert('課程刪除成功！');
      loadCourses();
    } catch (error) {
      console.error('刪除課程時發生錯誤:', error);
      alert('刪除課程時發生錯誤');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.creator.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在載入課程管理...</span>
      </div>
    );
  }

  if (profile?.role !== 'guardian') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">權限不足</h1>
          <p className="text-cosmic-light mb-6">只有守護者可以管理課程</p>
          <Link href="/admin" className="cosmic-button">
            返回控制台
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-void">
      {/* 背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cosmic-energy/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* 頁首 */}
        <div className="mb-8">
          <Link href="/admin" className="text-cosmic-accent hover:text-cosmic-energy mb-4 inline-block">
            ← 返回控制台
          </Link>
          <h1 className="text-4xl font-bold text-cosmic-star mb-2">課程管理</h1>
          <p className="text-cosmic-light/70">管理所有課程內容和審核狀態</p>
        </div>

        {/* 搜索和篩選 */}
        <div className="cosmic-glass p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索課程標題、描述或創建者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cosmic-input w-full"
              />
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cosmic-input w-full"
              >
                <option value="all">所有狀態</option>
                <option value="published">已發布</option>
                <option value="incubating">孵化中</option>
                <option value="archived">已歸檔</option>
              </select>
            </div>
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cosmic-input w-full"
              >
                <option value="created_at">創建時間</option>
                <option value="published_at">發布時間</option>
                <option value="enrollment_count">報名人數</option>
                <option value="title">課程標題</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-cosmic-light/60">
            找到 {filteredCourses.length} 門課程
          </div>
        </div>

        {/* 課程列表 */}
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="cosmic-glass p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-cosmic-star">{course.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                      {getStatusName(course.status)}
                    </span>
                  </div>
                  
                  {course.description && (
                    <p className="text-cosmic-light/80 mb-4 line-clamp-2">{course.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-cosmic-light/60">
                    <div>
                      <span className="font-medium">創建者：</span>
                      <span className="text-cosmic-accent">
                        {course.creator.display_name || course.creator.username}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">難度：</span>
                      <span>{getDifficultyStars(course.difficulty_level)}</span>
                    </div>
                    <div>
                      <span className="font-medium">報名：</span>
                      <span>{course.enrollment_count} 人</span>
                    </div>
                    <div>
                      <span className="font-medium">創建：</span>
                      <span>{new Date(course.created_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  
                  {course.published_at && (
                    <div className="mt-2 text-sm text-cosmic-success">
                      發布時間：{new Date(course.published_at).toLocaleDateString('zh-TW')}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/course/${course.id}`}
                    className="cosmic-button-sm bg-cosmic-info text-white"
                  >
                    查看課程
                  </Link>
                  
                  {/* 狀態操作按鈕 */}
                  {course.status === 'incubating' && (
                    <button
                      onClick={() => handleStatusChange(course.id, 'published')}
                      className="cosmic-button-sm bg-cosmic-success text-white"
                    >
                      批准發布
                    </button>
                  )}
                  
                  {course.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(course.id, 'archived')}
                      className="cosmic-button-sm bg-cosmic-light/20 text-cosmic-light"
                    >
                      歸檔課程
                    </button>
                  )}
                  
                  {course.status === 'archived' && (
                    <button
                      onClick={() => handleStatusChange(course.id, 'published')}
                      className="cosmic-button-sm bg-cosmic-success text-white"
                    >
                      重新發布
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="cosmic-button-sm bg-cosmic-danger text-white"
                  >
                    刪除課程
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCourses.length === 0 && (
            <div className="cosmic-glass p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-cosmic-star mb-2">沒有找到課程</h3>
              <p className="text-cosmic-light/70">
                {courses.length === 0 ? '系統中還沒有課程' : '沒有符合篩選條件的課程'}
              </p>
            </div>
          )}
        </div>

        {/* 統計信息 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="cosmic-glass p-4 text-center">
            <div className="text-2xl font-bold text-cosmic-star">
              {courses.filter(c => c.status === 'published').length}
            </div>
            <div className="text-cosmic-success text-sm">已發布課程</div>
          </div>
          <div className="cosmic-glass p-4 text-center">
            <div className="text-2xl font-bold text-cosmic-star">
              {courses.filter(c => c.status === 'incubating').length}
            </div>
            <div className="text-cosmic-accent text-sm">孵化中課程</div>
          </div>
          <div className="cosmic-glass p-4 text-center">
            <div className="text-2xl font-bold text-cosmic-star">
              {courses.reduce((sum, c) => sum + c.enrollment_count, 0)}
            </div>
            <div className="text-cosmic-energy text-sm">總報名數</div>
          </div>
          <div className="cosmic-glass p-4 text-center">
            <div className="text-2xl font-bold text-cosmic-star">
              {Math.floor(courses.reduce((sum, c) => sum + c.enrollment_count, 0) / Math.max(courses.filter(c => c.status === 'published').length, 1))}
            </div>
            <div className="text-cosmic-info text-sm">平均報名數</div>
          </div>
        </div>
      </div>
    </div>
  );
}