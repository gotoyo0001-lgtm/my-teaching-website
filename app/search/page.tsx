'use client';

// app/search/page.tsx - 高级搜索页面
// 星图导航系统的核心搜索引擎

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type Course = Database['public']['Tables']['courses']['Row'] & {
  creator: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

type SearchResult = {
  type: 'course' | 'discussion' | 'creator';
  data: any;
  relevance: number;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'discussions' | 'creators'>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
    // 加载搜索历史
    const history = localStorage.getItem('search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // 搜索课程
      if (activeTab === 'all' || activeTab === 'courses') {
        const { data: courses, error } = await supabase
          .from('courses')
          .select(`
            *,
            creator:profiles!creator_id(username, display_name, avatar_url)
          `)
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20);

        if (!error && courses) {
          courses.forEach(course => {
            let relevance = 0;
            if (course.title.toLowerCase().includes(query.toLowerCase())) relevance += 10;
            if (course.description?.toLowerCase().includes(query.toLowerCase())) relevance += 5;
            if (course.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))) relevance += 3;
            
            searchResults.push({
              type: 'course',
              data: course,
              relevance
            });
          });
        }
      }

      // 搜索讨论
      if (activeTab === 'all' || activeTab === 'discussions') {
        const { data: discussions } = await supabase
          .from('active_discussions')
          .select('*')
          .ilike('content', `%${query}%`)
          .limit(10);

        if (discussions) {
          discussions.forEach(discussion => {
            searchResults.push({
              type: 'discussion',
              data: discussion,
              relevance: discussion.net_score || 0
            });
          });
        }
      }

      // 搜索创作者
      if (activeTab === 'all' || activeTab === 'creators') {
        const { data: creators, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .in('role', ['luminary', 'catalyst'])
          .limit(10);

        if (!error && creators) {
          creators.forEach(creator => {
            let relevance = 0;
            if (creator.username.toLowerCase().includes(query.toLowerCase())) relevance += 8;
            if (creator.display_name?.toLowerCase().includes(query.toLowerCase())) relevance += 8;
            
            searchResults.push({
              type: 'creator',
              data: creator,
              relevance
            });
          });
        }
      }

      // 按相关度排序
      searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(searchResults);

      // 保存搜索历史
      saveSearchHistory(query);

    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearchHistory = (searchQuery: string) => {
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch();
    }
  };

  const filteredResults = activeTab === 'all' ? results : results.filter(r => r.type === activeTab.slice(0, -1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
      {/* 导航栏 */}
      <nav className="cosmic-glass m-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/constellation" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cosmic-accent to-cosmic-energy rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-cosmic-star">返回星图</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* 搜索标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cosmic-star mb-4">
            🔍 星图导航系统
          </h1>
          <p className="text-cosmic-light/70">
            探索宇宙中的知识、讨论和创作者
          </p>
        </div>

        {/* 搜索框 */}
        <div className="cosmic-glass p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入搜索关键词..."
                className="w-full p-4 pr-12 bg-cosmic-glass border border-cosmic-light/20 rounded-lg text-cosmic-light placeholder-cosmic-light/50 text-lg focus:outline-none focus:ring-2 focus:ring-cosmic-accent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-cosmic-accent rounded-lg hover:bg-cosmic-accent/80 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* 搜索历史 */}
            {searchHistory.length > 0 && !query && (
              <div>
                <p className="text-sm text-cosmic-light/60 mb-2">最近搜索：</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyQuery, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(historyQuery)}
                      className="px-3 py-1 bg-cosmic-glass-light text-cosmic-light rounded-full text-sm hover:bg-cosmic-glass-medium transition-colors"
                    >
                      {historyQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 搜索结果 */}
        {query && (
          <div>
            {/* 标签页 */}
            <div className="cosmic-glass p-1 mb-6 inline-flex rounded-lg">
              {[
                { key: 'all', label: '全部', count: results.length },
                { key: 'courses', label: '课程', count: results.filter(r => r.type === 'course').length },
                { key: 'discussions', label: '讨论', count: results.filter(r => r.type === 'discussion').length },
                { key: 'creators', label: '创作者', count: results.filter(r => r.type === 'creator').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'bg-cosmic-accent text-white'
                      : 'text-cosmic-light hover:bg-cosmic-glass-light'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-cosmic-light/20 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 搜索结果列表 */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="cosmic-loading inline-block mb-4"></div>
                <p className="text-cosmic-light/60">搜索中...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-6">
                {filteredResults.map((result, index) => (
                  <div key={index} className="cosmic-glass p-6">
                    {result.type === 'course' && (
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cosmic-nebula to-cosmic-deep rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-cosmic-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-cosmic-accent/20 text-cosmic-accent rounded-full text-xs">课程</span>
                            <span className="text-cosmic-light/60 text-sm">{result.data.category}</span>
                          </div>
                          <Link 
                            href={`/course/${result.data.id}`}
                            className="text-xl font-semibold text-cosmic-star hover:text-cosmic-accent transition-colors"
                          >
                            {result.data.title}
                          </Link>
                          <p className="text-cosmic-light/70 mt-2 line-clamp-2">
                            {result.data.description}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-4 text-sm text-cosmic-light/60">
                              <span>👤 {result.data.creator.display_name || result.data.creator.username}</span>
                              <span>📊 {result.data.enrollment_count} 学员</span>
                              {result.data.average_rating > 0 && (
                                <span>⭐ {result.data.average_rating.toFixed(1)}</span>
                              )}
                            </div>
                            <div className="text-xs text-cosmic-light/50">
                              相关度: {result.relevance}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.type === 'discussion' && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-cosmic-energy/20 text-cosmic-energy rounded-full text-xs">讨论</span>
                          <span className="text-cosmic-light/60 text-sm">在 {result.data.course_title}</span>
                        </div>
                        <p className="text-cosmic-light leading-relaxed mb-3">
                          {result.data.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center justify-between text-sm text-cosmic-light/60">
                          <span>👤 {result.data.author_name}</span>
                          <span>💫 {result.data.net_score} 共鸣</span>
                        </div>
                      </div>
                    )}

                    {result.type === 'creator' && (
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-luminary to-cosmic-warm flex items-center justify-center">
                          {result.data.avatar_url ? (
                            <img 
                              src={result.data.avatar_url} 
                              alt={result.data.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {(result.data.display_name || result.data.username).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              result.data.role === 'luminary' 
                                ? 'bg-luminary/20 text-luminary' 
                                : 'bg-catalyst/20 text-catalyst'
                            }`}>
                              {result.data.role === 'luminary' ? '启明者' : '领航者'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-cosmic-star">
                            {result.data.display_name || result.data.username}
                          </h3>
                          {result.data.bio && (
                            <p className="text-cosmic-light/70 mt-1">
                              {result.data.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cosmic-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cosmic-light mb-2">未找到相关结果</h3>
                <p className="text-cosmic-light/60">
                  尝试使用不同的关键词或检查拼写
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}