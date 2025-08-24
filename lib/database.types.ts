// lib/database.types.ts - 教学生态系感知蓝图数据库类型定义
// 根据数据库 schema 自动生成的类型，确保类型安全

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// 原型角色枚举
export type ArchetypeRole = 'voyager' | 'luminary' | 'catalyst' | 'guardian'

// 课程状态枚举
export type CourseStatus = 'incubating' | 'published' | 'archived'

// 学习状态枚举
export type EnrollmentStatus = 'exploring' | 'completed' | 'paused'

// 评论类型枚举
export type CommentType = 'text' | 'question' | 'insight' | 'beacon'

// 神谕类型枚举
export type OracleType = 'announcement' | 'guidance' | 'warning' | 'celebration'

// 投票类型枚举
export type VoteType = 'upvote' | 'downvote'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          role: ArchetypeRole
          voyager_manifesto: string | null
          luminary_expertise: string[] | null
          catalyst_communities: string[] | null
          location: string | null
          website: string | null
          created_at: string
          updated_at: string
          last_seen_at: string | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: ArchetypeRole
          voyager_manifesto?: string | null
          luminary_expertise?: string[] | null
          catalyst_communities?: string[] | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: ArchetypeRole
          voyager_manifesto?: string | null
          luminary_expertise?: string[] | null
          catalyst_communities?: string[] | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          objectives: string[] | null
          creator_id: string
          status: CourseStatus
          estimated_duration: number | null
          difficulty_level: number | null
          category: string | null
          tags: string[] | null
          cover_image_url: string | null
          preview_video_url: string | null
          is_premium: boolean
          price: number | null
          enrollment_count: number
          completion_count: number
          average_rating: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          objectives?: string[] | null
          creator_id: string
          status?: CourseStatus
          estimated_duration?: number | null
          difficulty_level?: number | null
          category?: string | null
          tags?: string[] | null
          cover_image_url?: string | null
          preview_video_url?: string | null
          is_premium?: boolean
          price?: number | null
          enrollment_count?: number
          completion_count?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          objectives?: string[] | null
          creator_id?: string
          status?: CourseStatus
          estimated_duration?: number | null
          difficulty_level?: number | null
          category?: string | null
          tags?: string[] | null
          cover_image_url?: string | null
          preview_video_url?: string | null
          is_premium?: boolean
          price?: number | null
          enrollment_count?: number
          completion_count?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: Json | null
          order_index: number
          learning_objectives: string[] | null
          video_url: string | null
          audio_url: string | null
          documents: Json | null
          quiz_data: Json | null
          exercise_data: Json | null
          estimated_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content?: Json | null
          order_index: number
          learning_objectives?: string[] | null
          video_url?: string | null
          audio_url?: string | null
          documents?: Json | null
          quiz_data?: Json | null
          exercise_data?: Json | null
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: Json | null
          order_index?: number
          learning_objectives?: string[] | null
          video_url?: string | null
          audio_url?: string | null
          documents?: Json | null
          quiz_data?: Json | null
          exercise_data?: Json | null
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      enrollments: {
        Row: {
          id: string
          voyager_id: string
          course_id: string
          status: EnrollmentStatus
          progress_percentage: number
          completed_lessons: string[] | null
          started_at: string
          completed_at: string | null
          last_accessed_at: string | null
          total_study_time: number
          notes: Json | null
          rating: number | null
          review: string | null
          review_date: string | null
        }
        Insert: {
          id?: string
          voyager_id: string
          course_id: string
          status?: EnrollmentStatus
          progress_percentage?: number
          completed_lessons?: string[] | null
          started_at?: string
          completed_at?: string | null
          last_accessed_at?: string | null
          total_study_time?: number
          notes?: Json | null
          rating?: number | null
          review?: string | null
          review_date?: string | null
        }
        Update: {
          id?: string
          voyager_id?: string
          course_id?: string
          status?: EnrollmentStatus
          progress_percentage?: number
          completed_lessons?: string[] | null
          started_at?: string
          completed_at?: string | null
          last_accessed_at?: string | null
          total_study_time?: number
          notes?: Json | null
          rating?: number | null
          review?: string | null
          review_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_voyager_id_fkey"
            columns: ["voyager_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          author_id: string
          course_id: string | null
          lesson_id: string | null
          parent_comment_id: string | null
          content: string
          content_type: CommentType
          upvotes: number
          downvotes: number
          highlighted_by_catalyst: string | null
          highlight_reason: string | null
          is_pinned: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          course_id?: string | null
          lesson_id?: string | null
          parent_comment_id?: string | null
          content: string
          content_type?: CommentType
          upvotes?: number
          downvotes?: number
          highlighted_by_catalyst?: string | null
          highlight_reason?: string | null
          is_pinned?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          course_id?: string | null
          lesson_id?: string | null
          parent_comment_id?: string | null
          content?: string
          content_type?: CommentType
          upvotes?: number
          downvotes?: number
          highlighted_by_catalyst?: string | null
          highlight_reason?: string | null
          is_pinned?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_lesson_id_fkey"
            columns: ["lesson_id"]
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      comment_votes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          vote_type: VoteType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          vote_type: VoteType
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          vote_type?: VoteType
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_category_id: string | null
          icon: string | null
          color: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_category_id?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_category_id?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      oracles: {
        Row: {
          id: string
          guardian_id: string
          title: string
          content: string
          oracle_type: OracleType
          priority: number
          target_roles: ArchetypeRole[] | null
          is_active: boolean
          display_from: string | null
          display_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guardian_id: string
          title: string
          content: string
          oracle_type: OracleType
          priority?: number
          target_roles?: ArchetypeRole[] | null
          is_active?: boolean
          display_from?: string | null
          display_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guardian_id?: string
          title?: string
          content?: string
          oracle_type?: OracleType
          priority?: number
          target_roles?: ArchetypeRole[] | null
          is_active?: boolean
          display_from?: string | null
          display_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracles_guardian_id_fkey"
            columns: ["guardian_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      course_stats: {
        Row: {
          id: string | null
          title: string | null
          category: string | null
          status: CourseStatus | null
          creator_name: string | null
          enrollment_count: number | null
          completion_count: number | null
          average_rating: number | null
          completion_rate: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      user_learning_stats: {
        Row: {
          id: string | null
          username: string | null
          display_name: string | null
          role: ArchetypeRole | null
          total_enrollments: number | null
          completed_courses: number | null
          active_courses: number | null
          total_study_minutes: number | null
          average_rating_given: number | null
          joined_at: string | null
          last_seen_at: string | null
        }
      }
      active_discussions: {
        Row: {
          comment_id: string | null
          content: string | null
          content_type: CommentType | null
          upvotes: number | null
          downvotes: number | null
          net_score: number | null
          author_name: string | null
          author_role: ArchetypeRole | null
          course_title: string | null
          context_type: string | null
          created_at: string | null
        }
      }
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_course_enrollment_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_course_completion_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      promote_to_guardian: {
        Args: { user_email: string }
        Returns: boolean
      }
      promote_to_luminary: {
        Args: { user_email: string; expertise?: string[] }
        Returns: boolean
      }
      promote_to_catalyst: {
        Args: { user_email: string; communities?: string[] }
        Returns: boolean
      }
      create_sample_course: {
        Args: { 
          creator_email: string; 
          course_title: string; 
          course_description: string; 
          course_category?: string 
        }
        Returns: string
      }
      initialize_voyager_universe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      archetype_role: ArchetypeRole
      course_status: CourseStatus
      enrollment_status: EnrollmentStatus
      comment_type: CommentType
      oracle_type: OracleType
      vote_type: VoteType
    }
  }
}