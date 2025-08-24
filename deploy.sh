#!/bin/bash
# =======================================================
# my-voyager-app 一键同步部署脚本
# =======================================================
# 用法: ./deploy.sh "修改描述" [类型]
# 例如: ./deploy.sh "添加新功能" "feat"
# =======================================================

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认提交类型
COMMIT_TYPE=${2:-"feat"}

# 检查是否提供了提交信息
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供提交信息${NC}"
    echo "用法: ./deploy.sh \"修改描述\" [类型]"
    echo "类型选项: feat, fix, docs, style, refactor, test, chore"
    exit 1
fi

COMMIT_MESSAGE="$1"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo -e "${BLUE}🚀 开始一键同步部署流程...${NC}"
echo -e "${BLUE}⏰ 时间: $TIMESTAMP${NC}"
echo -e "${BLUE}📝 类型: $COMMIT_TYPE${NC}"
echo -e "${BLUE}💬 信息: $COMMIT_MESSAGE${NC}"
echo ""

# =======================================================
# 步骤 1: Git 操作
# =======================================================
echo -e "${YELLOW}📁 步骤 1/4: Git 提交和推送...${NC}"

# 检查工作区状态
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "✓ 检测到文件修改"
    
    # 添加所有文件
    git add .
    echo "✓ 已添加所有修改文件"
    
    # 生成详细的提交信息
    FULL_COMMIT_MESSAGE="$COMMIT_TYPE: $COMMIT_MESSAGE

修改时间: $TIMESTAMP
修改内容:
- $COMMIT_MESSAGE

部署平台:
✓ GitHub (代码仓库)
✓ Netlify (前端部署) 
✓ Supabase (数据库更新)"
    
    # 提交更改
    git commit -m "$FULL_COMMIT_MESSAGE"
    echo "✓ 已提交到本地仓库"
    
    # 推送到远程仓库
    git push origin main
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 已成功推送到 GitHub${NC}"
    else
        echo -e "${RED}✗ GitHub 推送失败${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️ 没有检测到文件修改，跳过 Git 操作${NC}"
fi

echo ""

# =======================================================
# 步骤 2: Netlify 部署监控
# =======================================================
echo -e "${YELLOW}🌐 步骤 2/4: Netlify 部署监控...${NC}"

echo "✓ GitHub 推送已触发 Netlify 自动部署"
echo "📊 请手动检查部署状态:"
echo "   🔗 Netlify Dashboard: https://app.netlify.com"
echo "   ⏳ 通常需要 2-5 分钟完成构建和部署"
echo "   🔍 请验证新功能是否在生产环境中生效"

echo ""

# =======================================================
# 步骤 3: Supabase 更新提醒
# =======================================================
echo -e "${YELLOW}🗄️ 步骤 3/4: Supabase 数据库更新...${NC}"

# 检查是否有 SQL 脚本需要执行
if [ -f "supabase-hotfix.sql" ] || [ -f "supabase-deployment-update.sql" ]; then
    echo "📋 检测到 SQL 脚本文件:"
    [ -f "supabase-hotfix.sql" ] && echo "   🔧 supabase-hotfix.sql (快速修复)"
    [ -f "supabase-deployment-update.sql" ] && echo "   📦 supabase-deployment-update.sql (完整更新)"
    echo ""
    echo "⚠️ 如果此次修改涉及数据库，请手动执行以下步骤:"
    echo "   1. 登录 Supabase Dashboard: https://supabase.com/dashboard"
    echo "   2. 选择 my-voyager-app 项目"
    echo "   3. 进入 SQL Editor"
    echo "   4. 复制并执行对应的 SQL 脚本"
    echo "   5. 验证表结构、策略、函数创建成功"
else
    echo "✓ 未检测到数据库脚本，跳过 Supabase 更新"
fi

echo ""

# =======================================================
# 步骤 4: 部署验证清单
# =======================================================
echo -e "${YELLOW}✅ 步骤 4/4: 部署验证清单${NC}"

echo "请逐项验证以下功能:"
echo "□ 前端应用正常加载"
echo "□ 用户登录/登出功能正常"
echo "□ 权限控制正确（不同角色看到对应功能）"
echo "□ 新功能按预期工作"
echo "□ 管理控制台可访问（守护者）"
echo "□ 知识星图和星座功能响应"
echo "□ 数据库连接和 RLS 策略生效"

echo ""

# =======================================================
# 完成部署
# =======================================================
echo -e "${GREEN}🎉 一键同步部署流程完成！${NC}"
echo ""
echo -e "${BLUE}📊 部署状态总结:${NC}"
echo -e "${GREEN}✓ GitHub:${NC} 代码已推送并同步"
echo -e "${GREEN}✓ Netlify:${NC} 自动部署已触发"
echo -e "${YELLOW}⚠️ Supabase:${NC} 如需要请手动执行数据库脚本"
echo ""
echo -e "${BLUE}🔗 快速链接:${NC}"
echo "   📱 生产环境: [您的 Netlify 域名]"
echo "   🛠️ Netlify Dashboard: https://app.netlify.com"
echo "   🗄️ Supabase Dashboard: https://supabase.com/dashboard"
echo ""
echo -e "${GREEN}祝您部署愉快！🚀${NC}"