# 🚀 my-voyager-app 完整同步部署流程

## 📋 完整部署清单

每次完成代码修改后，请按照以下步骤进行**三平台同步部署**：

### 🔄 **一键同步部署流程**

#### **步骤 1: Git 提交并推送到 GitHub**

```bash
# 1. 检查修改状态
git status

# 2. 添加所有修改
git add .

# 3. 提交修改（使用规范的提交信息）
git commit -m "类型: 简短描述

详细描述修改内容:
- 修改项1
- 修改项2  
- 修改项3

解决的问题:
1. 问题描述1
2. 问题描述2"

# 4. 推送到 GitHub（触发 Netlify 自动部署）
git push origin main
```

#### **步骤 2: Netlify 自动部署验证**

推送到 GitHub 后，Netlify 会自动触发部署：

1. **监控部署状态**
   - 访问 [Netlify Dashboard](https://app.netlify.com)
   - 查看部署进度和日志
   - 确认构建成功

2. **验证前端部署**
   - 访问生产环境 URL
   - 测试关键功能是否正常
   - 检查新功能是否生效

#### **步骤 3: Supabase 数据库更新**

如果修改涉及数据库结构、权限或功能：

1. **选择合适的 SQL 脚本**
   - 🔥 **快速修复**: `supabase-hotfix.sql`
   - 📦 **完整更新**: `supabase-deployment-update.sql`
   - 🆕 **新功能**: 创建新的版本化脚本

2. **在 Supabase 控制台执行**
   - 登录 [Supabase Dashboard](https://supabase.com/dashboard)
   - 选择 my-voyager-app 项目
   - 导航到 `SQL Editor`
   - 复制粘贴对应脚本内容
   - 点击 `Run` 执行

3. **验证数据库更新**
   - 检查表结构创建
   - 验证 RLS 策略生效
   - 测试新增函数功能
   - 确认权限配置正确

## 📝 提交信息规范

使用以下类型前缀：

- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 样式修改
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具链修改

## 🗂️ SQL 脚本管理

### 脚本命名规范

```
supabase-deployment-[版本号]-[日期].sql
例如: supabase-deployment-v1.1.0-20250125.sql
```

### 脚本内容结构

每个 SQL 脚本都应包含：

1. **头部信息**
   - 执行日期
   - 版本号
   - 修改描述

2. **安全检查**
   - 环境验证
   - 依赖检查
   - 备份提醒

3. **主要更新内容**
   - 表结构修改
   - RLS 策略更新
   - 函数创建/更新
   - 触发器管理

4. **验证步骤**
   - 创建结果验证
   - 功能测试
   - 权限检查

5. **回滚信息**
   - 回滚步骤（如适用）
   - 注意事项

## 🔒 数据库脚本安全规范

遵循项目规范，确保所有脚本可重复执行：

```sql
-- ✅ 正确做法
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...

DROP FUNCTION IF EXISTS function_name(param_types);
CREATE OR REPLACE FUNCTION function_name(...) ...

-- ❌ 错误做法
CREATE POLICY "policy_name" ON table_name ... -- 可能导致重复错误
```

## 📊 部署后验证清单

### 前端功能验证
- [ ] 登录/登出功能正常
- [ ] 权限控制正确（不同角色看到对应功能）
- [ ] 页面路由正常工作
- [ ] 管理控制台可访问（守护者）
- [ ] 知识星图功能响应
- [ ] 我的星座功能正常

### 后端功能验证
- [ ] 数据库连接正常
- [ ] RLS 策略生效
- [ ] 用户权限正确
- [ ] API 端点响应正常
- [ ] 观星台功能完整

### 错误处理验证
- [ ] 无权限访问时显示正确错误信息
- [ ] 网络错误时有适当提示
- [ ] 登录失效时正确重定向

## 🛠️ 故障排查

### 常见问题解决

1. **权限问题**
   ```sql
   -- 检查用户角色
   SELECT id, username, role FROM profiles WHERE email = 'user@example.com';
   
   -- 检查 RLS 策略
   SELECT * FROM pg_policies WHERE tablename = 'table_name';
   ```

2. **函数错误**
   ```sql
   -- 查看函数定义
   SELECT routine_name, routine_definition 
   FROM information_schema.routines 
   WHERE routine_name = 'function_name';
   ```

3. **登录问题**
   - 检查 Supabase Auth 配置
   - 验证环境变量设置
   - 查看浏览器控制台错误

## 📞 紧急处理

如果部署后发现严重问题：

1. **立即回滚 Git**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **数据库回滚**
   - 执行准备好的回滚脚本
   - 或手动删除有问题的对象

3. **通知相关人员**
   - 记录问题详情
   - 制定修复计划

---

## 📚 相关文档

- [项目介绍文档](./README.md)
- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [故障排查指南](./LOGIN_TROUBLESHOOTING.md)
- [安全部署指南](./SECURITY_DEPLOYMENT_GUIDE.md)

---

**最后更新**: 2025-01-25  
**维护者**: my-voyager-app 开发团队