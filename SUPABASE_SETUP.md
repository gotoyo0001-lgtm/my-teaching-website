# Supabase 数据库设置指南

## 🌟 快速设置步骤

### 1. 在 Supabase 控制台中执行 SQL

1. 打开您的 Supabase 项目控制台：https://imidprdspztfqabdzqrr.supabase.co
2. 在左侧菜单中点击 **SQL Editor**
3. 点击 **+ New query**
4. 将 `supabase-setup.sql` 文件中的所有内容复制粘贴到编辑器中
5. 点击 **Run** 按钮执行脚本

### 2. 验证设置

执行完成后，您应该能在 **Table Editor** 中看到以下8个核心表：

- ✅ **profiles** - 用户档案表
- ✅ **courses** - 课程表  
- ✅ **lessons** - 课程章节表
- ✅ **enrollments** - 学习记录表
- ✅ **comments** - 评论表
- ✅ **comment_votes** - 评论投票表
- ✅ **categories** - 分类表
- ✅ **oracles** - 神谕表

### 3. 身份验证设置

在 **Authentication** > **Settings** 中：

1. **Site URL**: 设置为 `http://localhost:3000` (开发环境)
2. **Redirect URLs**: 添加 `http://localhost:3000/auth/callback`
3. 启用 **Email** 认证方式

### 4. 存储设置 (可选)

在 **Storage** 中创建以下存储桶：

- `avatars` - 用户头像 (public)
- `course-covers` - 课程封面 (public)  
- `course-videos` - 课程视频 (public)
- `documents` - 文档附件 (public)

### 5. 实时订阅设置

在 **Database** > **Replication** 中启用以下表的实时功能：

- `comments` - 评论实时更新
- `comment_votes` - 投票实时更新
- `enrollments` - 学习进度实时同步

## 🔐 权限说明

系统实现了四种原型角色的精细化权限控制：

- **遥行者 (voyager)** - 默认角色，可以学习课程、发表评论
- **启明者 (luminary)** - 可以创建和管理课程
- **领航者 (catalyst)** - 可以管理社群、高亮优质评论  
- **守护者 (guardian)** - 系统管理员，拥有最高权限

## 🧪 测试连接

设置完成后，您可以通过以下方式测试连接：

1. 运行项目：`npm run dev`
2. 访问 http://localhost:3000
3. 尝试用邮箱注册新用户
4. 检查 Supabase 控制台中是否有新的用户记录

## ❗ 注意事项

1. **不要共享** ANON KEY 以外的密钥
2. 在生产环境中记得更新 Site URL 和 Redirect URLs
3. 定期备份数据库
4. 监控 API 使用量和性能

## 🆘 常见问题

**Q: 执行 SQL 脚本时出错怎么办？**
A: 请确保按顺序执行，如果中途出错，可以删除已创建的表后重新运行。

**Q: 用户注册后没有档案记录？**
A: 检查 RLS 策略是否正确设置，确保用户可以插入自己的档案。

**Q: 无法访问某些数据？**
A: 检查行级安全策略，确保当前用户角色有相应权限。