'use client';

// app/studio/edit/[id]/page.tsx - 恒星重塑页面
// 启明者编辑现有课程的界面

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, usePermissions } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'];

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty_level: number;
  estimated_duration: number;
  objectives: string[];
  status: 'incubating' | 'published' | 'archived';
}

const CATEGORIES = [
  { value: 'technology', label: '技术星座' },
  { value: 'design', label: '设计星座' },
  { value: 'business', label: '商业星座' },
  { value: 'art', label: '艺术星座' },
  { value: 'science', label: '科学星座' },
  { value: 'philosophy', label: '哲学星座' },
  { value: 'wellness', label: '康养星座' },
  { value: 'language', label: '语言星座' },
];

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { canCreateCourse } = usePermissions();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: 'technology',
    tags: [],
    difficulty_level: 1,
    estimated_duration: 60,
    objectives: [''],
    status: 'incubating',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 权限检查
  useEffect(() => {
    if (!user || !canCreateCourse) {
      router.push('/constellation');
      return;
    }
  }, [user, canCreateCourse, router]);

  // 加载课程数据
  useEffect(() => {
    const loadCourse = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .eq('creator_id', user.id) // 确保只能编辑自己的课程
          .single();

        if (error) {
          console.error('加载课程失败:', error);
          setError('课程不存在或无权限访问');
          return;
        }

        setCourse(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'technology',
          tags: data.tags || [],
          difficulty_level: data.difficulty_level || 1,
          estimated_duration: data.estimated_duration || 60,
          objectives: data.objectives && data.objectives.length > 0 ? data.objectives : [''],
          status: data.status as CourseFormData['status'] || 'incubating',
        });
      } catch (error) {
        console.error('加载课程时发生错误:', error);
        setError('加载课程失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [params.id, user]);

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const handleUpdateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleRemoveObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, newStatus?: 'incubating' | 'published' | 'archived') => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 验证必填字段
      if (!formData.title.trim()) {
        throw new Error('请输入恒星名称');
      }
      if (!formData.description.trim()) {
        throw new Error('请输入恒星描述');
      }

      // 过滤空的学习目标
      const validObjectives = formData.objectives.filter(obj => obj.trim());
      if (validObjectives.length === 0) {
        throw new Error('请至少添加一个学习目标');
      }

      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        difficulty_level: formData.difficulty_level,
        estimated_duration: formData.estimated_duration,
        objectives: validObjectives,
        updated_at: new Date().toISOString(),
      };

      // 如果指定了新状态，则更新状态
      if (newStatus) {
        updateData.status = newStatus;
        if (newStatus === 'published' && formData.status !== 'published') {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', params.id)
        .eq('creator_id', user!.id);

      if (error) {
        throw error;
      }

      // 成功更新后跳转
      router.push('/studio');
    } catch (error) {
      console.error('更新课程失败:', error);
      setError(error instanceof Error ? error.message : '更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这颗恒星吗？此操作不可恢复。')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', params.id)
        .eq('creator_id', user!.id);

      if (error) {
        throw error;
      }

      router.push('/studio');
    } catch (error) {
      console.error('删除课程失败:', error);
      setError('删除失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在加载恒星数据...</span>
      </div>
    );
  }

  // 错误状态
  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-cosmic-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-cosmic-light mb-2">无法加载课程</h3>
          <p className="text-cosmic-light/60 mb-6">{error}</p>
          <Link href="/studio" className="cosmic-button">
            返回工作室
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !canCreateCourse) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
      {/* 导航栏 */}
      <nav className="cosmic-glass m-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/studio" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-cosmic-star">重塑恒星</span>
            </Link>
            {course && (
              <div className="flex items-center space-x-2 ml-8">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  course.status === 'published' 
                    ? 'bg-cosmic-success/20 text-cosmic-success' 
                    : course.status === 'incubating'
                    ? 'bg-cosmic-warning/20 text-cosmic-warning'
                    : 'bg-cosmic-glass-medium text-cosmic-light/70'
                }`}>
                  {course.status === 'published' && '✨ 已启明'}
                  {course.status === 'incubating' && '🥚 孕育中'}
                  {course.status === 'archived' && '📦 已封存'}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-luminary via-cosmic-warm to-cosmic-energy bg-clip-text text-transparent">
              重塑知识恒星
            </span>
          </h1>
          <p className="text-cosmic-light/70">
            调整恒星的光芒，让智慧更加璀璨
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="cosmic-glass mb-8 p-4 border-l-4 border-cosmic-danger">
            <div className="text-cosmic-danger text-sm">{error}</div>
          </div>
        )}

        {/* 编辑表单 */}
        <form className="space-y-8">
          {/* 基础信息 */}
          <div className="cosmic-glass p-8">
            <h2 className="text-xl font-semibold text-cosmic-star mb-6">基础信息</h2>
            
            <div className="space-y-6">
              {/* 恒星名称 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-cosmic-light mb-2">
                  恒星名称 *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="cosmic-input"
                  placeholder="为你的知识恒星起一个富有诗意的名字"
                  required
                />
              </div>

              {/* 恒星描述 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-cosmic-light mb-2">
                  恒星描述 *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="cosmic-input h-32 resize-none"
                  placeholder="描述这颗恒星将为遥行者带来什么样的智慧启发..."
                  required
                />
              </div>

              {/* 星座分类 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-cosmic-light mb-2">
                  所属星座
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="cosmic-input"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 课程状态 */}
              <div>
                <label className="block text-sm font-medium text-cosmic-light mb-2">
                  恒星状态
                </label>
                <div className="flex items-center space-x-4">
                  {[
                    { value: 'incubating', label: '🥚 孕育中', color: 'cosmic-warning' },
                    { value: 'published', label: '✨ 已启明', color: 'cosmic-success' },
                    { value: 'archived', label: '📦 已封存', color: 'cosmic-light' }
                  ].map(status => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleInputChange('status', status.value)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        formData.status === status.value
                          ? `bg-${status.color}/20 text-${status.color} border-2 border-${status.color}/50`
                          : 'bg-cosmic-glass-light text-cosmic-light/70 hover:bg-cosmic-glass-medium'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 难度等级 */}
              <div>
                <label className="block text-sm font-medium text-cosmic-light mb-2">
                  难度等级
                </label>
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('difficulty_level', level)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 ${
                        level <= formData.difficulty_level
                          ? 'bg-cosmic-warm shadow-lg'
                          : 'bg-cosmic-glass-light hover:bg-cosmic-glass-medium'
                      }`}
                    >
                      <span className={level <= formData.difficulty_level ? 'text-white' : 'text-cosmic-light/50'}>
                        {level}
                      </span>
                    </button>
                  ))}
                  <span className="text-cosmic-light/70 text-sm ml-4">
                    {['', '新手', '初级', '中级', '高级', '专家'][formData.difficulty_level]}
                  </span>
                </div>
              </div>

              {/* 预估时长 */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-cosmic-light mb-2">
                  预估学习时长（分钟）
                </label>
                <input
                  id="duration"
                  type="number"
                  min="15"
                  max="600"
                  step="15"
                  value={formData.estimated_duration}
                  onChange={(e) => handleInputChange('estimated_duration', parseInt(e.target.value))}
                  className="cosmic-input"
                />
              </div>
            </div>
          </div>

          {/* 学习目标 */}
          <div className="cosmic-glass p-8">
            <h2 className="text-xl font-semibold text-cosmic-star mb-6">学习目标</h2>
            
            <div className="space-y-4">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleUpdateObjective(index, e.target.value)}
                    className="cosmic-input flex-1"
                    placeholder={`学习目标 ${index + 1}`}
                  />
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(index)}
                      className="text-cosmic-danger hover:text-cosmic-danger/80 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-cosmic-accent hover:text-cosmic-energy transition-colors text-sm font-medium"
              >
                + 添加目标
              </button>
            </div>
          </div>

          {/* 标签 */}
          <div className="cosmic-glass p-8">
            <h2 className="text-xl font-semibold text-cosmic-star mb-6">标签</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="cosmic-input flex-1"
                  placeholder="输入标签，按回车添加"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="cosmic-button"
                >
                  添加
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-cosmic-accent/20 text-cosmic-accent rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-cosmic-accent/70 hover:text-cosmic-accent"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-8">
            <div className="flex items-center space-x-4">
              <Link 
                href="/studio"
                className="text-cosmic-light/70 hover:text-cosmic-light transition-colors"
              >
                ← 返回工作室
              </Link>
              {course?.status === 'published' && (
                <Link 
                  href={`/course/${course.id}`}
                  className="text-cosmic-success hover:text-cosmic-success/80 transition-colors text-sm"
                  target="_blank"
                >
                  预览恒星 ↗
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-cosmic-danger/20 text-cosmic-danger rounded-lg hover:bg-cosmic-danger/30 transition-all duration-200 disabled:opacity-50 text-sm"
              >
                删除恒星
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                disabled={isSubmitting}
                className="px-6 py-3 bg-cosmic-glass-medium text-cosmic-light rounded-lg hover:bg-cosmic-glass-heavy transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? '保存中...' : '保存更改'}
              </button>
              
              {formData.status !== 'published' && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'published')}
                  disabled={isSubmitting}
                  className="cosmic-button disabled:opacity-50"
                >
                  {isSubmitting ? '启明中...' : '🌟 启明恒星'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}