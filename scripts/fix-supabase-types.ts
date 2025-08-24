// scripts/fix-supabase-types.ts
// 修復 Supabase 2.56.0 類型兼容性問題

import type { Database } from '../lib/database.types';

// 定義準確的類型別名
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];

export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type VoteRow = Database['public']['Tables']['comment_votes']['Row'];
export type VoteInsert = Database['public']['Tables']['comment_votes']['Insert'];
export type VoteUpdate = Database['public']['Tables']['comment_votes']['Update'];

export type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
export type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert'];
export type EnrollmentUpdate = Database['public']['Tables']['enrollments']['Update'];

// 類型守護函數
export const isValidProfileData = (data: unknown): data is ProfileRow => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'username' in data &&
    'role' in data
  );
};

export const isValidCourseData = (data: unknown): data is CourseRow => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'status' in data
  );
};

export const isValidCommentData = (data: unknown): data is CommentRow => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'content' in data &&
    'author_id' in data
  );
};

// 用於類型轉換的助手函數
export const safeProfileCast = (data: any): ProfileRow | null => {
  if (isValidProfileData(data)) {
    return data;
  }
  return null;
};

export const safeCoursesCast = (data: any[]): CourseRow[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(isValidCourseData);
};

export const safeCommentsCast = (data: any[]): CommentRow[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(isValidCommentData);
};