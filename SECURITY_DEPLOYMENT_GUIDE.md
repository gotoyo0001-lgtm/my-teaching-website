# 安全策略部署指南

## 📋 概述

此文档指导您如何部署新的安全 RLS 策略和自动 Profile 创建功能，解决现有的安全隐患问题。

## 🚨 重要提醒

⚠️ **在执行前请务必：**
1. 在测试环境先验证
2. 备份现有数据
3. 确认有守护者权限的账号可以正常登录

## 🚀 部署步骤

### 步骤 1: 执行安全策略脚本

1. 打开 Supabase Dashboard
2. 进入 **SQL Editor**
3. 复制并执行 `scripts/secure-rls-and-triggers.sql` 的完整内容
4. 等待执行完成（大约 30-60 秒）

### 步骤 2: 验证部署结果

执行以下 SQL 查询验证部署：

```sql
-- 检查 RLS 策略
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY cmd;

-- 检查触发器
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 检查函数
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'handle_new_user', 
    'promote_user_role',
    'get_table_policies',
    'security_audit'
);
```

### 步骤 3: 访问安全管理界面

1. 使用守护者账号登录
2. 访问 `/admin/security` 页面
3. 验证可以看到：
   - 安全状态概览
   - RLS 策略详情
   - 用户角色管理
   - 系统统计

### 步骤 4: 测试新用户注册

1. 注册一个新的测试账号
2. 验证 profiles 表中自动创建了对应记录
3. 确认新用户默认角色为 "voyager"

## 🔍 安全改进内容

### 原来的问题
- ❌ `SELECT USING (true)` - 允许任何人查看所有信息
- ❌ 缺乏精确的权限控制
- ❌ 没有自动创建 profiles 的机制

### 新的安全策略
- ✅ **SELECT**: 用户只能查看自己的完整档案 + 其他用户的公开信息
- ✅ **INSERT**: 只能为自己创建档案
- ✅ **UPDATE**: 只能更新自己的档案
- ✅ **DELETE**: 用户可删除自己档案，守护者可删除任何档案

### 新增功能
- ✅ **自动触发器**: 新用户注册时自动创建 profile 记录
- ✅ **公开视图**: `public_profiles` 视图只显示安全的公开信息
- ✅ **角色管理**: 守护者可通过界面提升用户角色
- ✅ **安全审计**: 实时监控系统安全状态

## 🧪 测试清单

### 基础功能测试
- [ ] 现有用户可以正常登录
- [ ] 现有用户可以查看/编辑自己的档案
- [ ] 新用户注册时自动创建 profile
- [ ] 用户无法查看其他用户的敏感信息

### 权限测试
- [ ] 非守护者无法访问 `/admin/security`
- [ ] 守护者可以正常访问安全管理界面
- [ ] 角色提升功能正常工作
- [ ] 安全状态检查显示正确

### 安全测试
- [ ] 尝试直接数据库查询被正确限制
- [ ] RLS 策略阻止越权访问
- [ ] 公开视图不泄露敏感信息

## 🛠️ 故障排除

### 问题 1: 用户无法登录
**可能原因**: RLS 策略过于严格
**解决方案**: 
```sql
-- 临时放宽 SELECT 策略
ALTER POLICY "profiles_select_policy" ON profiles 
USING (true);
```

### 问题 2: 新用户档案未自动创建
**检查触发器**:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 问题 3: 守护者权限失效
**验证角色**:
```sql
SELECT username, role FROM profiles 
WHERE role = 'guardian';
```

## 📞 支持

如果遇到问题，请：
1. 检查浏览器控制台错误
2. 查看 Supabase 日志
3. 对照本文档的测试清单
4. 确认所有 SQL 脚本都已正确执行

## 📈 后续优化建议

1. **添加审计日志**: 记录敏感操作
2. **实现双重验证**: 对角色提升等操作
3. **定期安全检查**: 自动化安全状态监控
4. **权限细化**: 根据实际需求进一步细化权限

---

**最后更新**: 2025-08-24
**适用版本**: My Voyager App v4.0+