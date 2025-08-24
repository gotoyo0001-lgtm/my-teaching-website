'use client';

// app/constellation/page.tsx - 知识星图
// 遥行者探索宇宙的主要界面

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabaseQueries } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'] & {
  creator: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

type Category = Database['public']['Tables']['categories']['Row'];

export default function ConstellationPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  
  // 新增的筛选状态
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating' | 'duration'>('latest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 如果用户未登录，重定向到登录页
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // 加载课程和分类数据
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // 并行加载课程和分类
        const [coursesResult, categoriesResult] = await Promise.all([
          supabaseQueries.getPublishedCourses(),
          // 直接查询分类
          fetch('/api/categories').then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        if (coursesResult.data) {
          setCourses(coursesResult.data as Course[]);
        }
        
        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadData();
  }, [user]);

  // 过滤和排序课程
  const filteredAndSortedCourses = (() => {
    // 首先过滤
    let filtered = courses.filter(course => {
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.creator.display_name || course.creator.username).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = !difficultyFilter || course.difficulty_level === difficultyFilter;
      
      return matchesCategory && matchesSearch && matchesDifficulty;
    });
    
    // 然后排序
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.enrollment_count || 0) - (a.enrollment_count || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'duration':
          return (a.estimated_duration || 0) - (b.estimated_duration || 0);
        case 'latest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  })();

  // 渲染加载状态
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-loading"></div>
        <span className="ml-3 text-cosmic-light">正在连接宇宙...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
      {/* 导航栏 */}
      <nav className="cosmic-glass m-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-cosmic-star">知识星图</span>
              </Link>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-2 ml-8">
                <div className={`w-3 h-3 rounded-full role-${profile?.role || 'voyager'}`}></div>
                <span className="text-cosmic-light/70 text-sm">
                  {profile?.display_name || profile?.username}
                </span>
                <span className="text-cosmic-accent text-xs capitalize">
                  {profile?.role === 'voyager' && '遥行者'}
                  {profile?.role === 'luminary' && '启明者'}
                  {profile?.role === 'catalyst' && '领航者'}
                  {profile?.role === 'guardian' && '守护者'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/search" 
                className="text-cosmic-light hover:text-cosmic-accent transition-colors"
              >
                高级搜索
              </Link>
              <Link 
                href="/discussions" 
                className="text-cosmic-light hover:text-cosmic-accent transition-colors"
              >
                活跃讨论
              </Link>
              <Link 
                href="/my-constellation" 
                className="text-cosmic-light hover:text-cosmic-accent transition-colors"
              >
                我的星座
              </Link>
              {(profile?.role === 'luminary' || profile?.role === 'guardian') && (
                <Link 
                  href="/studio" 
                  className="cosmic-button"
                >
                  创作工作室
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cosmic-accent via-cosmic-energy to-cosmic-warm bg-clip-text text-transparent">
              知识星图
            </span>
          </h1>
          <p className="text-cosmic-light/70 text-lg">
            在浩瀚的宇宙中探索，发现属于你的知识恒星
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="cosmic-glass p-6 mb-8">
          <div className="space-y-4">
            {/* 主要搜索和分类 */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="搜索知识恒星（标题、描述、标签、创作者）..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cosmic-input pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* 高级筛选器切换 */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  showAdvancedFilters
                    ? 'bg-cosmic-accent text-white'
                    : 'bg-cosmic-glass-light text-cosmic-light hover:bg-cosmic-glass-medium'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span>高级筛选</span>
              </button>
            </div>
            
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === null 
                    ? 'bg-cosmic-accent text-white' 
                    : 'bg-cosmic-glass-light text-cosmic-light hover:bg-cosmic-glass-medium'
                }`}
              >
                全部分类
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.name 
                      ? 'bg-cosmic-accent text-white' 
                      : 'bg-cosmic-glass-light text-cosmic-light hover:bg-cosmic-glass-medium'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* 高级筛选选项 */}
            {showAdvancedFilters && (
              <div className="p-4 bg-cosmic-glass-light rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 难度筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-cosmic-light mb-2">难度等级</label>
                    <select
                      value={difficultyFilter || ''}
                      onChange={(e) => setDifficultyFilter(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-2 bg-cosmic-glass border border-cosmic-light/20 rounded-lg text-cosmic-light"
                    >
                      <option value="">全部</option>
                      <option value="1">★ 新手向导</option>
                      <option value="2">★★ 基础入门</option>
                      <option value="3">★★★ 中级进阶</option>
                      <option value="4">★★★★ 高级深入</option>
                      <option value="5">★★★★★ 专家精通</option>
                    </select>
                  </div>
                  
                  {/* 排序方式 */}
                  <div>
                    <label className="block text-sm font-medium text-cosmic-light mb-2">排序方式</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-2 bg-cosmic-glass border border-cosmic-light/20 rounded-lg text-cosmic-light"
                    >
                      <option value="latest">🕰️ 最新创建</option>
                      <option value="popular">🔥 最受欢迎</option>
                      <option value="rating">⭐ 最高评分</option>
                      <option value="duration">⏱️ 时间最短</option>
                    </select>
                  </div>
                  
                  {/* 搜索结果统计 */}
                  <div className="flex items-end">
                    <div className="text-sm text-cosmic-light/70">
                      共找到 <span className="text-cosmic-accent font-semibold">{filteredAndSortedCourses.length}</span> 颗恒星
                    </div>
                  </div>
                </div>
                
                {/* 快速筛选标签 */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-cosmic-light/70 mr-2">快速筛选：</span>
                  <button
                    onClick={() => {
                      setDifficultyFilter(1);
                      setSortBy('latest');
                    }}
                    className="px-3 py-1 bg-voyager/20 text-voyager rounded-full text-xs hover:bg-voyager/30 transition-colors"
                  >
                    🌱 新手友好
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('popular');
                      setDifficultyFilter(null);
                    }}
                    className="px-3 py-1 bg-cosmic-energy/20 text-cosmic-energy rounded-full text-xs hover:bg-cosmic-energy/30 transition-colors"
                  >
                    🔥 热门推荐
                  </button>
                  <button
                    onClick={() => {
                      setDifficultyFilter(null);
                      setSortBy('rating');
                    }}
                    className="px-3 py-1 bg-cosmic-warm/20 text-cosmic-warm rounded-full text-xs hover:bg-cosmic-warm/30 transition-colors"
                  >
                    ⭐ 高评优质
                  </button>
                  <button
                    onClick={() => {
                      setDifficultyFilter(null);
                      setSortBy('duration');
                    }}
                    className="px-3 py-1 bg-cosmic-accent/20 text-cosmic-accent rounded-full text-xs hover:bg-cosmic-accent/30 transition-colors"
                  >
                    ⏱️ 快速学习
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 课程网格 */}
        {isLoadingCourses ? (
          <div className="flex justify-center items-center py-20">
            <div className="cosmic-loading"></div>
            <span className="ml-3 text-cosmic-light">正在加载星辰...</span>
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-cosmic-light mb-2">未找到匹配的恒星</h3>
            <p className="text-cosmic-light/60">
              尝试调整搜索条件或浏览其他分类
            </p>
            {(searchTerm || selectedCategory || difficultyFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setDifficultyFilter(null);
                }}
                className="cosmic-button mt-4"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {filteredAndSortedCourses.map(course => (
              <Link 
                key={course.id}
                href={`/course/${course.id}`}
                className="knowledge-star group"
              >
                {/* 课程封面 */}
                <div className="relative h-48 bg-gradient-to-br from-cosmic-nebula to-cosmic-deep rounded-lg mb-4 overflow-hidden">
                  {course.cover_image_url ? (
                    <img 
                      src={course.cover_image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-cosmic-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  
                  {/* 难度标识 */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-cosmic-glass-heavy backdrop-blur-md rounded-full px-3 py-1">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < (course.difficulty_level || 1) 
                                ? 'bg-cosmic-warm' 
                                : 'bg-cosmic-light/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 课程信息 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cosmic-accent text-sm font-medium">
                      {course.category}
                    </span>
                    <span className="text-cosmic-light/50 text-sm">
                      {course.estimated_duration ? `${Math.floor(course.estimated_duration / 60)}h` : ''}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-cosmic-star group-hover:text-cosmic-accent transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-cosmic-light/70 text-sm line-clamp-2">
                    {course.description}
                  </p>
                  
                  {/* 创建者信息 */}
                  <div className="flex items-center space-x-3 pt-2 border-t border-cosmic-glass-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-luminary to-cosmic-warm rounded-full flex items-center justify-center">
                      {course.creator.avatar_url ? (
                        <img 
                          src={course.creator.avatar_url} 
                          alt={course.creator.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {(course.creator.display_name || course.creator.username).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-cosmic-light text-sm font-medium">
                        {course.creator.display_name || course.creator.username}
                      </p>
                      <p className="text-cosmic-light/50 text-xs">启明者</p>
                    </div>
                  </div>
                  
                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-cosmic-light/50 text-xs">
                    <span>{course.enrollment_count} 位遥行者</span>
                    {course.average_rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3 text-cosmic-warm" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{course.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}