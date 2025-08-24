'use client';

// app/discussions/page.tsx - 活跃讨论页面  
// 宇宙中所有思想共振的汇聚地

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';

interface Discussion {
  comment_id: string;
  content: string;
  content_type: string;
  upvotes: number;
  downvotes: number;
  net_score: number;
  author_name: string;
  author_role: string;
  course_title: string;
  context_type: string;
  created_at: string;
}

export default function DiscussionsPage() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hot' | 'recent'>('recent');

  useEffect(() => {
    loadDiscussions();
  }, [filter]);

  const loadDiscussions = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('active_discussions').select('*');
      
      // 根据筛选条件排序
      switch (filter) {
        case 'hot':
          query = query.order('net_score', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('加载讨论失败:', error);
        return;
      }

      setDiscussions(data || []);
    } catch (error) {
      console.error('加载讨论时发生错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取评论类型样式
  const getCommentTypeStyle = (type: string) => {
    switch (type) {
      case 'question':
        return {
          icon: '❓',
          class: 'text-cosmic-energy',
          label: '疑问'
        };
      case 'insight':
        return {
          icon: '💡',
          class: 'text-cosmic-accent',
          label: '洞察'
        };
      case 'beacon':
        return {
          icon: '🌟',
          class: 'text-cosmic-warm',
          label: '信标'
        };
      default:
        return {
          icon: '💭',
          class: 'text-cosmic-light',
          label: '评论'
        };
    }
  };

  // 获取角色样式
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'luminary':
        return { label: '启明者', class: 'bg-luminary/20 text-luminary' };
      case 'catalyst':
        return { label: '领航者', class: 'bg-catalyst/20 text-catalyst' };
      case 'guardian':
        return { label: '守护者', class: 'bg-guardian/20 text-guardian' };
      default:
        return { label: '遥行者', class: 'bg-voyager/20 text-voyager' };
    }
  };

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

            <div className="flex items-center space-x-4">
              <Link href="/my-constellation" className="text-cosmic-light hover:text-cosmic-accent transition-colors">
                我的星座
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cosmic-star mb-4 flex items-center justify-center space-x-3">
            <span>🌌</span>
            <span>活跃讨论</span>
            <span>🌌</span>
          </h1>
          <p className="text-cosmic-light/70 text-lg">
            宇宙中所有思想共振的汇聚地
          </p>
        </div>

        {/* 筛选器 */}
        <div className="cosmic-glass p-6 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setFilter('recent')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                filter === 'recent'
                  ? 'bg-cosmic-accent text-white'
                  : 'bg-cosmic-glass-light text-cosmic-light hover:bg-cosmic-glass-medium'
              }`}
            >
              🕒 最新
            </button>
            <button
              onClick={() => setFilter('hot')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                filter === 'hot'
                  ? 'bg-cosmic-accent text-white'
                  : 'bg-cosmic-glass-light text-cosmic-light hover:bg-cosmic-glass-medium'
              }`}
            >
              🔥 热门
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-cosmic-accent text-white'
                  : 'bg-cosmic-glass-light text-cosmic-light hover:bg-cosmic-glass-medium'
              }`}
            >
              🌟 全部
            </button>
          </div>
        </div>

        {/* 讨论列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="cosmic-loading inline-block mb-4"></div>
            <p className="text-cosmic-light/60">加载思想共振中...</p>
          </div>
        ) : discussions.length > 0 ? (
          <div className="space-y-6">
            {discussions.map((discussion) => {
              const typeStyle = getCommentTypeStyle(discussion.content_type);
              const roleStyle = getRoleStyle(discussion.author_role);

              return (
                <div key={discussion.comment_id} className="cosmic-glass p-6 hover:bg-cosmic-glass-medium transition-all duration-200">
                  {/* 讨论头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-accent to-cosmic-energy flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {discussion.author_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-cosmic-star">
                            {discussion.author_name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyle.class}`}>
                            {roleStyle.label}
                          </span>
                          <span className={`text-sm ${typeStyle.class}`}>
                            {typeStyle.icon} {typeStyle.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-cosmic-light/60">
                          <span>在</span>
                          <span className="text-cosmic-accent hover:underline cursor-pointer">
                            {discussion.course_title}
                          </span>
                          <span>·</span>
                          <span>{new Date(discussion.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* 投票分数 */}
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                        discussion.net_score > 0 
                          ? 'bg-cosmic-success/20 text-cosmic-success'
                          : discussion.net_score < 0
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-cosmic-glass-light text-cosmic-light/60'
                      }`}>
                        <span className="text-sm font-medium">
                          {discussion.net_score > 0 ? '+' : ''}{discussion.net_score}
                        </span>
                        <span className="text-xs">共鸣</span>
                      </div>
                    </div>
                  </div>

                  {/* 讨论内容 */}
                  <div className="text-cosmic-light mb-4 leading-relaxed">
                    {discussion.content.length > 200 
                      ? discussion.content.substring(0, 200) + '...'
                      : discussion.content
                    }
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-cosmic-light/60">
                      <span>👍 {discussion.upvotes}</span>
                      <span>👎 {discussion.downvotes}</span>
                      <span className="capitalize">{discussion.context_type}</span>
                    </div>
                    
                    <button className="text-cosmic-accent hover:text-cosmic-accent/80 text-sm transition-colors">
                      查看详情 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-cosmic-glass-light rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl">🌌</span>
            </div>
            <h3 className="text-xl font-semibold text-cosmic-light mb-2">宇宙很静谧</h3>
            <p className="text-cosmic-light/60 mb-6">
              还没有思想共振产生，去课程中开始第一次探讨吧！
            </p>
            <Link href="/constellation" className="cosmic-button">
              探索星图
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}