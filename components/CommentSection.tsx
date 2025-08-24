'use client';

// components/CommentSection.tsx - 共鸣空间组件
// 宇宙中的思想共振系统

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: {
    username: string;
    display_name: string | null;
    role: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
  user_vote?: 'upvote' | 'downvote' | null;
};

interface CommentSectionProps {
  courseId?: string;
  lessonId?: string;
  className?: string;
}

export default function CommentSection({ courseId, lessonId, className = '' }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'text' | 'question' | 'insight' | 'beacon'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 加载评论
  useEffect(() => {
    loadComments();
  }, [courseId, lessonId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      
      const query = supabase
        .from('comments')
        .select(`
          *,
          author:profiles(username, display_name, role, avatar_url)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (courseId) {
        query.eq('course_id', courseId).is('lesson_id', null);
      } else if (lessonId) {
        query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('加载评论失败:', error);
        return;
      }

      // 组织评论结构（主评论和回复）
      const mainComments = data?.filter(c => !c.parent_comment_id) || [];
      const replies = data?.filter(c => c.parent_comment_id) || [];

      const commentsWithReplies = mainComments.map(comment => ({
        ...comment,
        replies: replies.filter(reply => reply.parent_comment_id === comment.id)
      }));

      // 如果用户已登录，加载投票状态
      if (user) {
        await loadUserVotes(commentsWithReplies);
      }

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('加载评论时发生错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载用户投票状态
  const loadUserVotes = async (commentsData: Comment[]) => {
    if (!user) return;

    const allCommentIds = [
      ...commentsData.map(c => c.id),
      ...commentsData.flatMap(c => c.replies?.map(r => r.id) || [])
    ];

    const { data: votes } = await supabase
      .from('comment_votes')
      .select('comment_id, vote_type')
      .eq('user_id', user.id)
      .in('comment_id', allCommentIds) as {
        data: Array<{
          comment_id: string;
          vote_type: 'upvote' | 'downvote';
        }> | null;
        error: any;
      };

    const voteMap = new Map(votes?.map(v => [v.comment_id, v.vote_type]) || []);

    // 更新评论投票状态
    const updateVotes = (comments: Comment[]): Comment[] => {
      return comments.map(comment => ({
        ...comment,
        user_vote: voteMap.get(comment.id) || null,
        replies: comment.replies ? updateVotes(comment.replies) : undefined
      }));
    };

    setComments(updateVotes(commentsData));
  };

  // 提交新评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const commentData: Database['public']['Tables']['comments']['Insert'] = {
        author_id: user.id,
        content: newComment.trim(),
        content_type: commentType,
        ...(courseId ? { course_id: courseId } : {}),
        ...(lessonId ? { lesson_id: lessonId } : {})
      };

      const { error } = await supabase
        .from('comments')
        .insert([commentData]);

      if (error) {
        console.error('提交评论失败:', error);
        alert('提交评论失败，请重试');
        return;
      }

      setNewComment('');
      setCommentType('text');
      await loadComments();
    } catch (error) {
      console.error('提交评论时发生错误:', error);
      alert('提交评论时发生错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交回复
  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const replyData: Database['public']['Tables']['comments']['Insert'] = {
        author_id: user.id,
        content: replyContent.trim(),
        content_type: 'text',
        parent_comment_id: parentId,
        ...(courseId ? { course_id: courseId } : {}),
        ...(lessonId ? { lesson_id: lessonId } : {})
      };

      const { error } = await supabase
        .from('comments')
        .insert([replyData]);

      if (error) {
        console.error('提交回复失败:', error);
        alert('提交回复失败，请重试');
        return;
      }

      setReplyTo(null);
      setReplyContent('');
      await loadComments();
    } catch (error) {
      console.error('提交回复时发生错误:', error);
      alert('提交回复时发生错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 投票处理
  const handleVote = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return;

    try {
      const comment = findCommentById(commentId);
      if (!comment) return;

      const currentVote = comment.user_vote;
      
      if (currentVote === voteType) {
        // 取消投票
        await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        // 新投票或更改投票
        const voteData: Database['public']['Tables']['comment_votes']['Insert'] = {
          user_id: user.id,
          comment_id: commentId,
          vote_type: voteType
        };
        
        await supabase
          .from('comment_votes')
          .upsert(voteData);
      }

      await loadComments();
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  // 查找评论
  const findCommentById = (id: string): Comment | null => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const reply = comment.replies.find(r => r.id === id);
        if (reply) return reply;
      }
    }
    return null;
  };

  // 获取评论类型图标和样式
  const getCommentTypeStyle = (type: string) => {
    switch (type) {
      case 'question':
        return {
          icon: '❓',
          class: 'border-l-4 border-cosmic-energy bg-cosmic-energy/10',
          label: '疑问'
        };
      case 'insight':
        return {
          icon: '💡',
          class: 'border-l-4 border-cosmic-accent bg-cosmic-accent/10',
          label: '洞察'
        };
      case 'beacon':
        return {
          icon: '🌟',
          class: 'border-l-4 border-cosmic-warm bg-cosmic-warm/10',
          label: '信标'
        };
      default:
        return {
          icon: '💭',
          class: 'border-l-4 border-cosmic-light/30 bg-cosmic-glass-light',
          label: '评论'
        };
    }
  };

  // 渲染单个评论
  const renderComment = (comment: Comment, isReply = false) => {
    const typeStyle = getCommentTypeStyle(comment.content_type);
    
    return (
      <div key={comment.id} className={`${typeStyle.class} rounded-lg p-4 ${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
        {/* 作者信息 */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-accent to-cosmic-energy flex items-center justify-center">
            {comment.author.avatar_url ? (
              <img 
                src={comment.author.avatar_url} 
                alt={comment.author.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {comment.author.display_name?.charAt(0) || comment.author.username.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-cosmic-star">
                {comment.author.display_name || comment.author.username}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-cosmic-accent/20 text-cosmic-accent">
                {comment.author.role === 'voyager' ? '遥行者' :
                 comment.author.role === 'luminary' ? '启明者' :
                 comment.author.role === 'catalyst' ? '领航者' : '守护者'}
              </span>
              <span className="text-xs text-cosmic-light/60">
                {typeStyle.icon} {typeStyle.label}
              </span>
            </div>
            <div className="text-xs text-cosmic-light/50">
              {new Date(comment.created_at).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>

        {/* 评论内容 */}
        <div className="text-cosmic-light mb-3 leading-relaxed">
          {comment.content}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-4 text-sm">
          {/* 投票按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote(comment.id, 'upvote')}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                comment.user_vote === 'upvote' 
                  ? 'bg-cosmic-success/20 text-cosmic-success' 
                  : 'text-cosmic-light/60 hover:text-cosmic-success'
              }`}
              disabled={!user}
            >
              <span>👍</span>
              <span>{comment.upvotes}</span>
            </button>
            
            <button
              onClick={() => handleVote(comment.id, 'downvote')}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                comment.user_vote === 'downvote' 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'text-cosmic-light/60 hover:text-red-400'
              }`}
              disabled={!user}
            >
              <span>👎</span>
              <span>{comment.downvotes}</span>
            </button>
          </div>

          {/* 回复按钮 */}
          {!isReply && user && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-cosmic-accent hover:text-cosmic-accent/80 transition-colors"
            >
              回复
            </button>
          )}
        </div>

        {/* 回复表单 */}
        {replyTo === comment.id && (
          <div className="mt-4 p-3 bg-cosmic-void/30 rounded-lg">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              className="w-full p-3 bg-cosmic-glass border border-cosmic-light/20 rounded-lg text-cosmic-light placeholder-cosmic-light/50 resize-none focus:outline-none focus:ring-2 focus:ring-cosmic-accent"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setReplyTo(null)}
                className="px-4 py-2 text-cosmic-light/60 hover:text-cosmic-light transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim() || isSubmitting}
                className="px-4 py-2 bg-cosmic-accent text-white rounded-lg hover:bg-cosmic-accent/80 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '提交中...' : '回复'}
              </button>
            </div>
          </div>
        )}

        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`cosmic-glass p-6 ${className}`}>
      <h3 className="text-xl font-bold text-cosmic-star mb-6 flex items-center space-x-2">
        <span>🌌</span>
        <span>共鸣空间</span>
        <span className="text-sm font-normal text-cosmic-light/60">
          ({comments.length} 条思想共振)
        </span>
      </h3>

      {/* 发表新评论 */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as any)}
              className="px-3 py-2 bg-cosmic-glass border border-cosmic-light/20 rounded-lg text-cosmic-light text-sm"
            >
              <option value="text">💭 一般评论</option>
              <option value="question">❓ 疑问求解</option>
              <option value="insight">💡 洞察分享</option>
              <option value="beacon">🌟 重要信标</option>
            </select>
          </div>
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="分享你的思想，让宇宙产生共鸣..."
            className="w-full p-4 bg-cosmic-glass border border-cosmic-light/20 rounded-lg text-cosmic-light placeholder-cosmic-light/50 resize-none focus:outline-none focus:ring-2 focus:ring-cosmic-accent"
            rows={4}
          />
          
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-6 py-2 bg-cosmic-accent text-white rounded-lg hover:bg-cosmic-accent/80 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '发送中...' : '发送思想'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-cosmic-glass-light rounded-lg text-center">
          <p className="text-cosmic-light/70">
            请<a href="/login" className="text-cosmic-accent hover:underline">登录</a>后参与思想共振
          </p>
        </div>
      )}

      {/* 评论列表 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="cosmic-loading inline-block"></div>
          <p className="text-cosmic-light/60 mt-2">加载共鸣中...</p>
        </div>
      ) : comments.length > 0 ? (
        <div>
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-cosmic-glass-light rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🌌</span>
          </div>
          <h4 className="text-lg font-semibold text-cosmic-light mb-2">还没有思想共振</h4>
          <p className="text-cosmic-light/60">
            成为第一个在此处分享想法的遥行者吧！
          </p>
        </div>
      )}
    </div>
  );
}