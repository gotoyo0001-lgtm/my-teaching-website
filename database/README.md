# 🌌 教学生态系感知蓝图 - 数据库初始化指南

## 概述

本指南将帮助您在 Supabase 中初始化支持"教学生态系感知蓝图"的完整数据库结构，包括四种原型（守护者、启明者、领航者、遥行者）的信任法则和权限边界。

## 🚀 快速开始

### 1. 准备工作

确保您已经：
- 创建了 Supabase 项目
- 获得了项目的 URL 和 API Key
- 配置了 `.env.local` 文件

### 2. 数据库初始化步骤

#### 步骤一：创建核心数据结构
在 Supabase Dashboard 的 SQL Editor 中，按顺序执行以下文件：

```sql
-- 1. 执行核心数据表结构
-- 复制并执行 database/schema.sql 的内容
```

#### 步骤二：设置行级安全策略
```sql
-- 2. 执行 RLS 策略
-- 复制并执行 database/rls_policies.sql 的内容
```

#### 步骤三：初始化基础数据
```sql
-- 3. 执行种子数据
-- 复制并执行 database/seed_data.sql 的内容
```

#### 步骤四：完成初始化
```sql
-- 4. 运行初始化函数
SELECT initialize_voyager_universe();
```

### 3. 创建第一个守护者

在完成数据库初始化后，您需要创建第一个守护者账户：

```sql
-- 假设您的管理员邮箱是 admin@yourplatform.com
-- 首先通过应用注册一个普通账户，然后执行：
SELECT promote_to_guardian('admin@yourplatform.com');
```

### 4. 创建示例内容（可选）

```sql
-- 创建一个启明者用户
SELECT promote_to_luminary('teacher@yourplatform.com', ARRAY['web-development', 'design']);

-- 创建示例课程
SELECT create_sample_course(
    'teacher@yourplatform.com', 
    '遥行者指南：开始你的知识远征', 
    '这是一门专为新加入宇宙的遥行者设计的入门课程，将帮助你理解这个充满诗意的学习生态系统。'
);
```

## 📊 数据表结构说明

### 核心表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `profiles` | 用户档案和原型角色 | `role`, `username`, `bio` |
| `courses` | 知识恒星（课程） | `creator_id`, `status`, `category` |
| `lessons` | 知识单元 | `course_id`, `order_index`, `content` |
| `enrollments` | 学习记录 | `voyager_id`, `course_id`, `status` |
| `comments` | 共鸣空间（评论系统） | `author_id`, `course_id`, `lesson_id` |
| `comment_votes` | 投票记录 | `user_id`, `comment_id`, `vote_type` |
| `categories` | 星座分类 | `name`, `parent_category_id` |
| `oracles` | 守护者神谕 | `guardian_id`, `target_roles` |

### 原型角色枚举

- `voyager` - 遥行者：宇宙的探索家
- `luminary` - 启明者：思想的恒星  
- `catalyst` - 领航者：引力的编织者
- `guardian` - 守护者：宇宙平衡的感知者

## 🔐 权限体系说明

### 遥行者 (Voyager)
- ✅ 查看所有已发布的课程和内容
- ✅ 注册课程，更新自己的学习进度
- ✅ 发表评论和回复
- ✅ 为评论投票
- ✅ 管理自己的档案信息

### 启明者 (Luminary)  
- ✅ 遥行者的所有权限
- ✅ 创建和管理自己的课程
- ✅ 查看自己课程的学习数据
- ✅ 管理自己课程下的评论
- ✅ 提名优秀的遥行者成为领航者

### 领航者 (Catalyst)
- ✅ 遥行者的所有权限  
- ✅ 查看负责社群的学习数据
- ✅ 高亮和管理社群课程的评论
- ✅ 引导新人适应社群

### 守护者 (Guardian)
- ✅ 系统的最高权限
- ✅ 管理所有用户的角色
- ✅ 管理所有课程内容
- ✅ 发布系统神谕
- ✅ 管理分类体系

## 🛠️ 实用函数

### 角色提升函数
```sql
-- 提升为守护者
SELECT promote_to_guardian('user@example.com');

-- 提升为启明者（可指定专业领域）
SELECT promote_to_luminary('user@example.com', ARRAY['technology', 'design']);

-- 提升为领航者（可指定负责社群）
SELECT promote_to_catalyst('user@example.com', ARRAY['web-development', 'ai-ml']);
```

### 内容创建函数
```sql
-- 创建示例课程
SELECT create_sample_course(
    'creator@example.com',
    '课程标题',
    '课程描述',
    'technology'  -- 可选，默认为 technology
);
```

## 📈 管理和监控

### 有用的查询视图

```sql
-- 查看课程统计
SELECT * FROM course_stats;

-- 查看用户学习统计  
SELECT * FROM user_learning_stats;

-- 查看活跃讨论
SELECT * FROM active_discussions;
```

### 系统健康检查

```sql
-- 检查各原型角色的分布
SELECT role, COUNT(*) as count 
FROM public.profiles 
GROUP BY role;

-- 检查课程状态分布
SELECT status, COUNT(*) as count 
FROM public.courses 
GROUP BY status;

-- 检查最活跃的分类
SELECT c.name, COUNT(co.id) as course_count 
FROM public.categories c
LEFT JOIN public.courses co ON c.name = co.category
GROUP BY c.name
ORDER BY course_count DESC;
```

## 🚨 注意事项

1. **安全第一**：RLS 策略已经配置，但请确保在生产环境中定期审查权限设置。

2. **性能考虑**：数据库已添加必要的索引，但随着数据增长，可能需要进一步优化。

3. **备份策略**：建议设置定期数据库备份，特别是在生产环境中。

4. **监控告警**：建议设置数据库性能和容量监控。

## 🔄 更新和迁移

当需要更新数据库结构时：

1. 创建新的迁移文件
2. 在开发环境中测试
3. 备份生产数据库
4. 执行迁移
5. 验证数据完整性

## 📚 相关文档

- [Supabase 行级安全文档](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 函数文档](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [教学生态系感知蓝图完整文档](../README.md)

---

**🌟 宇宙已准备就绪，等待第一批遥行者的到来！**