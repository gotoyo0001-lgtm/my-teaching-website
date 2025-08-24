'use client';

// app/studio/create/page.tsx - 恒星孕育页面
// 启明者创建新课程的核心界面

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, usePermissions } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty_level: number;
  estimated_duration: number;
  objectives: string[];
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

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canCreateCourse } = usePermissions();
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: 'technology',
    tags: [],
    difficulty_level: 1,
    estimated_duration: 60,
    objectives: [''],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 权限检查
  if (!user || !canCreateCourse) {
    router.push('/constellation');
    return null;
  }

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

  const handleSubmit = async (e: React.FormEvent, status: 'incubating' | 'published') => {
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

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          tags: formData.tags,
          difficulty_level: formData.difficulty_level,
          estimated_duration: formData.estimated_duration,
          objectives: validObjectives,
          creator_id: user.id,
          status: status,
          published_at: status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 成功创建后跳转
      if (status === 'published') {
        router.push(`/course/${data.id}`);
      } else {
        router.push('/studio');
      }
    } catch (error) {
      console.error('创建课程失败:', error);
      setError(error instanceof Error ? error.message : '创建失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
      {/* 导航栏 */}
      <nav className="cosmic-glass m-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/studio" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-cosmic-star">孕育新恒星</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-luminary via-cosmic-warm to-cosmic-energy bg-clip-text text-transparent">
              孕育知识恒星
            </span>
          </h1>
          <p className="text-cosmic-light/70">
            将你的智慧凝聚成璀璨的恒星，照亮遥行者的求知之路
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="cosmic-glass mb-8 p-4 border-l-4 border-cosmic-danger">
            <div className="text-cosmic-danger text-sm">{error}</div>
          </div>
        )}

        {/* 创建表单 */}
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
            <Link 
              href="/studio"
              className="text-cosmic-light/70 hover:text-cosmic-light transition-colors"
            >
              ← 返回工作室
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'incubating')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-cosmic-glass-medium text-cosmic-light rounded-lg hover:bg-cosmic-glass-heavy transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? '保存中...' : '保存草稿'}
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={isSubmitting}
                className="cosmic-button disabled:opacity-50"
              >
                {isSubmitting ? '发布中...' : '🌟 启明恒星'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}