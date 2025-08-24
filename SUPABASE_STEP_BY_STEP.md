# 🔥 Supabase 詳細設置指南

## 第一步：準備工作

1. **打開兩個瀏覽器標籤頁**：
   - 標籤頁 1：https://imidprdspztfqabdzqrr.supabase.co （您的 Supabase 項目）
   - 標籤頁 2：本地項目文件夾，找到 `supabase-setup.sql` 文件

## 第二步：執行數據庫腳本（分段執行）

### 🚀 階段一：基礎類型定義（第1-30行）

在 Supabase SQL 編輯器中執行：

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 原型角色枚举
CREATE TYPE archetype_role AS ENUM ('voyager', 'luminary', 'catalyst', 'guardian');

-- 课程状态枚举
CREATE TYPE course_status AS ENUM ('incubating', 'published', 'archived');

-- 学习状态枚举
CREATE TYPE enrollment_status AS ENUM ('exploring', 'completed', 'paused');

-- 评论类型枚举
CREATE TYPE comment_type AS ENUM ('text', 'question', 'insight', 'beacon');

-- 神谕类型枚举
CREATE TYPE oracle_type AS ENUM ('announcement', 'guidance', 'warning', 'celebration');

-- 投票类型枚举
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');
```

**執行步驟**：
1. 複製上面的 SQL 代碼
2. 粘貼到 Supabase SQL Editor
3. 點擊 **"Run"** 按鈕
4. 確認看到 "Success" 消息

---

### 🏗️ 階段二：核心表結構（第31-200行）

執行 profiles 表：

```sql
-- 用户档案表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    role archetype_role DEFAULT 'voyager',
    voyager_manifesto TEXT,
    luminary_expertise TEXT[],
    catalyst_communities TEXT[],
    location TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE
);
```

執行 courses 表：

```sql
-- 课程表 (courses)
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    objectives TEXT[],
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status course_status DEFAULT 'incubating',
    estimated_duration INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    category TEXT,
    tags TEXT[],
    cover_image_url TEXT,
    preview_video_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);
```

**一個一個表執行，每執行一個表後確認成功！**

---

### 🔐 階段三：權限設置（RLS）

在所有表創建完成後，執行權限設置：

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;

-- 用户档案策略
CREATE POLICY "用户可以查看所有档案" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的档案" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的档案" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 课程策略
CREATE POLICY "所有人可以查看已发布的课程" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "创作者可以查看自己的所有课程" ON courses FOR SELECT USING (auth.uid() = creator_id);
```

---

## 第三步：驗證設置

1. **檢查表格**：
   - 去到 Supabase 控制台的 **Table Editor**
   - 確認看到以下表格：
     - ✅ profiles
     - ✅ courses  
     - ✅ lessons
     - ✅ enrollments
     - ✅ comments
     - ✅ comment_votes
     - ✅ categories
     - ✅ oracles

2. **檢查 RLS**：
   - 在每個表格頁面，確認 **"Enable RLS"** 已開啟

## 第四步：身份驗證設置

1. **進入 Authentication 設置**：
   - 點擊左側菜單 **"Authentication"**
   - 點擊 **"Settings"**

2. **配置 Site URL**：
   - Site URL: `http://localhost:3000`
   - 點擊 **"Save"**

3. **配置 Redirect URLs**：
   - 添加: `http://localhost:3000/auth/callback`
   - 點擊 **"Save"**

4. **確認 Email 認證已啟用**：
   - 在 **Providers** 頁面確認 Email 已啟用

## 🎯 完成檢查清單

- [ ] 數據類型（enums）創建成功
- [ ] 8個核心表格創建成功  
- [ ] RLS 策略設置完成
- [ ] 身份驗證配置完成
- [ ] Site URL 和 Redirect URLs 設置正確

**如果有任何步驟失敗，請告訴我具體的錯誤消息！**