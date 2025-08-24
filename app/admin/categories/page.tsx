'use client';

import type { Database } from '@/lib/database.types';

import { useAuth, usePermissions } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parent_id: string | null;
  created_at: string;
  parent?: Category;
  children?: Category[];
  course_count?: number;
}

export default function CategoryManagement() {
  const { profile, isLoading } = useAuth();
  const { canManageCategories } = usePermissions();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📚',
    parent_id: ''
  });

  const predefinedIcons = [
    '📚', '💻', '🎨', '🧪', '💼', '🏥', '🔧', '🎵', 
    '🌟', '🚀', '💡', '🎯', '📊', '🌍', '🔬', '✨'
  ];

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  useEffect(() => {
    if (!isLoading && (!profile || !canManageCategories)) {
      router.push('/admin');
    }
  }, [profile, isLoading, canManageCategories, router]);

  useEffect(() => {
    if (canManageCategories) {
      loadCategories();
    }
  }, [canManageCategories]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true }) as {
          data: Array<{
            id: string;
            name: string;
            description: string | null;
            color: string | null;
            icon: string | null;
            parent_id: string | null;
            created_at: string;
          }> | null;
          error: any;
        };

      if (error) {
        console.error('載入分類失敗:', error);
        return;
      }

      // 構建分類層次結構
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // 首先創建所有分類的映射
      data?.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // 然後建立父子關係
      data?.forEach(cat => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          const parent = categoryMap.get(cat.parent_id)!;
          category.parent = parent;
          parent.children!.push(category);
        } else {
          rootCategories.push(category);
        }
      });

      setCategories(rootCategories);
      setParentCategories(rootCategories); // 用於表單選擇父分類
    } catch (error) {
      console.error('載入分類時發生錯誤:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        color: formData.color,
        icon: formData.icon,
        parent_id: formData.parent_id || null
      };

      let error;
      if (editingCategory) {
        // 更新現有分類
        ({ error } = await supabase
          .from('categories')
          .update(categoryData as any)
          .eq('id', editingCategory.id));
      } else {
        // 創建新分類
        ({ error } = await supabase
          .from('categories')
          .insert([categoryData] as any[]));
      }

      if (error) {
        console.error('保存分類失敗:', error);
        alert('保存分類失敗，請稍後再試');
        return;
      }

      alert(editingCategory ? '分類更新成功！' : '分類創建成功！');
      resetForm();
      setShowCreateModal(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('保存分類時發生錯誤:', error);
      alert('保存分類時發生錯誤');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '📚',
      parent_id: ''
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '📚',
      parent_id: category.parent_id || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (category: Category) => {
    if (category.children && category.children.length > 0) {
      alert('無法刪除包含子分類的分類，請先刪除或移動子分類');
      return;
    }

    if (!confirm(`確定要刪除分類「${category.name}」嗎？`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) {
        console.error('刪除分類失敗:', error);
        alert('刪除分類失敗，請稍後再試');
        return;
      }

      alert('分類刪除成功！');
      loadCategories();
    } catch (error) {
      console.error('刪除分類時發生錯誤:', error);
      alert('刪除分類時發生錯誤');
    }
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={`${level > 0 ? 'ml-8 border-l-2 border-cosmic-accent/30 pl-4' : ''}`}>
        <div className="cosmic-glass p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl" style={{ color: category.color || '#3B82F6' }}>
                {category.icon || '📚'}
              </span>
              <div>
                <h3 className="text-lg font-bold text-cosmic-star">{category.name}</h3>
                {category.description && (
                  <p className="text-cosmic-light/70 text-sm">{category.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-cosmic-light/60 mt-1">
                  <span>創建時間：{new Date(category.created_at).toLocaleDateString('zh-TW')}</span>
                  {category.parent && (
                    <span>父分類：{category.parent.name}</span>
                  )}
                  {category.children && category.children.length > 0 && (
                    <span>子分類：{category.children.length} 個</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="cosmic-button-sm bg-cosmic-accent text-white"
              >
                編輯
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="cosmic-button-sm bg-cosmic-danger text-white"
                disabled={category.children && category.children.length > 0}
              >
                刪除
              </button>
            </div>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && (
          <div className="mb-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在載入分類管理...</span>
      </div>
    );
  }

  if (!canManageCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cosmic-danger mb-4">權限不足</h1>
          <p className="text-cosmic-light mb-6">只有守護者可以管理分類</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cosmic-star mb-2">分類管理</h1>
              <p className="text-cosmic-light/70">管理課程分類體系和知識星座結構</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingCategory(null);
                setShowCreateModal(true);
              }}
              className="cosmic-button bg-cosmic-accent text-white"
            >
              📁 新增分類
            </button>
          </div>
        </div>

        {/* 分類樹狀結構 */}
        <div>
          {categories.length > 0 ? (
            renderCategoryTree(categories)
          ) : (
            <div className="cosmic-glass p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-cosmic-star mb-2">還沒有分類</h3>
              <p className="text-cosmic-light/70 mb-6">開始創建第一個分類來組織知識結構</p>
              <button
                onClick={() => {
                  resetForm();
                  setEditingCategory(null);
                  setShowCreateModal(true);
                }}
                className="cosmic-button bg-cosmic-accent text-white"
              >
                創建分類
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 創建/編輯分類模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="cosmic-glass p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-cosmic-star mb-6">
              {editingCategory ? '編輯分類' : '創建新分類'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cosmic-light font-medium mb-2">分類名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="cosmic-input w-full"
                  required
                  placeholder="輸入分類名稱..."
                />
              </div>

              <div>
                <label className="block text-cosmic-light font-medium mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="cosmic-input w-full"
                  rows={3}
                  placeholder="輸入分類描述..."
                />
              </div>

              <div>
                <label className="block text-cosmic-light font-medium mb-2">圖標</label>
                <div className="grid grid-cols-8 gap-2 mb-2">
                  {predefinedIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({...formData, icon})}
                      className={`text-2xl p-2 rounded hover:bg-cosmic-accent/20 ${
                        formData.icon === icon ? 'bg-cosmic-accent/30' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="cosmic-input w-full"
                  placeholder="或輸入自定義圖標..."
                />
              </div>

              <div>
                <label className="block text-cosmic-light font-medium mb-2">顏色</label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-8 h-8 rounded border-2 ${
                        formData.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="cosmic-input w-full h-10"
                />
              </div>

              <div>
                <label className="block text-cosmic-light font-medium mb-2">父分類</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                  className="cosmic-input w-full"
                >
                  <option value="">無（根分類）</option>
                  {parentCategories.map(cat => (
                    <option 
                      key={cat.id} 
                      value={cat.id}
                      disabled={editingCategory?.id === cat.id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 預覽 */}
              <div className="bg-cosmic-accent/10 p-4 rounded-lg">
                <label className="block text-cosmic-light font-medium mb-2">預覽</label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" style={{ color: formData.color }}>
                    {formData.icon || '📚'}
                  </span>
                  <div>
                    <div className="font-bold text-cosmic-star">
                      {formData.name || '分類名稱'}
                    </div>
                    {formData.description && (
                      <div className="text-cosmic-light/70 text-sm">
                        {formData.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="flex-1 cosmic-button bg-cosmic-light/20 text-cosmic-light"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 cosmic-button bg-cosmic-accent text-white"
                >
                  {editingCategory ? '更新分類' : '創建分類'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}