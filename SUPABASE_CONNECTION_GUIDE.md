# Supabase 连接状态检查指南

## 🔍 检查方法总览

### 1. 在线诊断工具 (推荐)
- **详细诊断**: https://my-voyager.netlify.app/debug/production
- **快速检查**: https://my-voyager.netlify.app/debug/connection
- **本地测试**: `node scripts/test-supabase-connection.js`

## ✅ 正常状态指标

### 环境变量
- ✅ NEXT_PUBLIC_SUPABASE_URL: `https://imidprdspztfqabdzqrr.supabase.co`
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: 应该以 `eyJ` 开头

### 连接状态
- ✅ 基础连接: "连接正常"
- ✅ 认证服务: "认证服务正常"
- ✅ 数据库查询: "查询成功" 或 "RLS正常工作"

## ❌ 常见问题和解决方案

### 1. 环境变量未配置
**现象**: `URL: ❌` 或 `Key: ❌`
**解决**:
```bash
# 检查 .env.local 文件
cat .env.local

# 或在 Netlify 检查环境变量设置
# Site Settings > Environment Variables
```

### 2. 连接失败
**现象**: "连接失败: fetch failed"
**可能原因**:
- 网络问题
- Supabase URL 错误
- DNS 解析问题

**解决**:
```bash
# 测试网络连接
ping imidprdspztfqabdzqrr.supabase.co

# 检查 URL 格式
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 3. 认证失败
**现象**: "Invalid API key" 或 "Unauthorized"
**解决**:
- 检查 anon key 是否正确
- 确认 Supabase 项目状态
- 检查 API 配额是否超限

### 4. 数据库权限错误
**现象**: "permission denied for table profiles"
**说明**: 这通常是正常的，表示 RLS (行级安全) 策略正确工作

### 5. 实时连接超时
**现象**: "实时连接测试超时"
**说明**: 实时功能是可选的，超时通常不影响核心功能

## 🔧 高级诊断命令

### 本地环境测试
```bash
# 1. 安装依赖并测试
npm install
node scripts/test-supabase-connection.js

# 2. 检查网络连接
curl -I https://imidprdspztfqabdzqrr.supabase.co

# 3. 验证环境变量
npm run dev
# 然后访问 http://localhost:3000/debug/connection
```

### 生产环境测试
```bash
# 1. 访问诊断页面
# https://my-voyager.netlify.app/debug/connection

# 2. 检查部署日志
# https://app.netlify.com/sites/my-voyager/deploys

# 3. 测试 API 端点
curl -X POST 'https://imidprdspztfqabdzqrr.supabase.co/auth/v1/token?grant_type=password' \
-H "apikey: YOUR_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{"email": "test@invalid.com", "password": "invalid"}'
```

## 📊 状态码含义

| 状态 | 含义 | 行动 |
|------|------|------|
| ✅ 连接正常 | Supabase 服务可达 | 继续其他测试 |
| ✅ 认证服务正常 | Auth API 工作正常 | 可以进行登录测试 |
| ✅ RLS正常工作 | 安全策略按预期工作 | 这是好现象 |
| ❌ 连接失败 | 网络或配置问题 | 检查环境变量和网络 |
| ❌ 认证测试失败 | Auth 配置问题 | 检查 API key 和项目设置 |
| ⚠️ 异常响应 | 意外的响应 | 需要进一步调查 |

## 🚨 紧急故障排除

如果所有连接都失败：

1. **检查 Supabase 服务状态**: https://status.supabase.com/
2. **验证项目配置**: 登录 Supabase Dashboard 检查项目状态
3. **重置环境变量**: 重新获取 URL 和 anon key
4. **清除缓存**: 清理浏览器缓存和 CDN 缓存
5. **回滚代码**: 如果最近有更改，考虑回滚到之前的工作版本

## 📞 获取帮助

- 检查 Supabase 文档: https://supabase.com/docs
- 查看项目日志: Netlify Functions 日志
- 使用内置诊断工具: `/debug/production` 和 `/debug/connection`

最后更新: 2025-08-24