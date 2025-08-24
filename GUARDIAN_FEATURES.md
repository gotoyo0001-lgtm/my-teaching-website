# 守護者功能完整指南

## 🛡️ 概述

守護者（Guardian）是 Voyager Universe 中擁有最高權限的用戶角色，負責維護整個教學生態系統的平衡與秩序。本文檔詳細說明了為守護者角色實現的所有管理功能。

## 🎯 核心功能

### 1. 管理控制台 (`/admin`)
- **位置**: `app/admin/page.tsx`
- **功能**: 統一的管理入口，提供系統概覽和快速訪問
- **特色**:
  - 即時系統統計數據
  - 快速操作按鈕
  - 近期活動記錄
  - 響應式設計

### 2. 用戶管理 (`/admin/users`)
- **位置**: `app/admin/users/page.tsx`
- **功能**: 管理所有用戶和角色提升
- **特色**:
  - 查看所有用戶列表
  - 按角色和活動狀態篩選
  - 一鍵角色提升功能
  - 用戶搜索和排序

### 3. 神諭管理 (`/admin/oracles`)
- **位置**: `app/admin/oracles/page.tsx`
- **功能**: 發布和管理系統公告
- **特色**:
  - 多種神諭類型（公告、指導、警告、慶祝）
  - 目標角色設定
  - 置頂和過期時間控制
  - 富文本內容編輯

### 4. 分類管理 (`/admin/categories`)
- **位置**: `app/admin/categories/page.tsx`
- **功能**: 管理課程分類體系
- **特色**:
  - 層次化分類結構
  - 自定義圖標和顏色
  - 父子分類關係
  - 視覺化預覽

### 5. 系統統計 (`/admin/analytics`)
- **位置**: `app/admin/analytics/page.tsx`
- **功能**: 查看平台數據分析
- **特色**:
  - 用戶和課程統計
  - 角色分布圖表
  - 增長趨勢分析
  - 系統健康度監控

### 6. 課程管理 (`/admin/courses`)
- **位置**: `app/admin/courses/page.tsx`
- **功能**: 管理所有課程內容
- **特色**:
  - 課程狀態管理（孵化中/已發布/已歸檔）
  - 批量操作功能
  - 課程審核和批准
  - 統計信息展示

## 🏗️ 技術架構

### 權限控制
```typescript
// 使用 usePermissions 鉤子進行權限檢查
const { canManageUsers, canCreateOracle, canManageCategories } = usePermissions();

// 守護者專用權限
- canManageUsers: true
- canCreateOracle: true  
- canManageCategories: true
- canViewAnalytics: true
```

### 數據庫結構
```sql
-- 核心表結構
profiles (用戶檔案)
├── role: archetype_role (guardian/luminary/catalyst/voyager)
├── username, display_name, bio
└── created_at, updated_at, last_seen_at

oracles (神諭系統)
├── guardian_id → profiles(id)
├── title, content, type
├── is_pinned, target_roles, expires_at
└── created_at, updated_at

categories (分類體系)
├── name, description
├── color, icon, parent_id
└── created_at

courses (課程管理)
├── creator_id → profiles(id)
├── title, description, status
├── enrollment_count, difficulty_level
└── created_at, published_at
```

### RLS 安全策略
- **profiles**: 所有人可查看，用戶可更新自己的檔案
- **oracles**: 根據 target_roles 限制查看，只有守護者可管理
- **categories**: 所有人可查看，只有守護者可管理
- **courses**: 基於狀態和創建者的查看權限

## 🔧 安裝和配置

### 1. 數據庫設置
```bash
# 執行數據庫兼容性檢查腳本
psql -d your_database -f scripts/guardian-features-db-check.sql
```

### 2. 角色提升
```sql
-- 將用戶提升為守護者
UPDATE profiles 
SET role = 'guardian', updated_at = NOW() 
WHERE id = 'user_uuid';
```

### 3. 環境變數
確保以下環境變數正確配置：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 UI/UX 設計

### 設計原則
- **唤起敬畏感**: 使用宇宙主題和星空背景
- **追求無痕感**: 流暢的交互和過渡效果
- **一致性**: 統一的 cosmic 設計語言

### 組件庫
```css
/* 核心樣式類 */
.cosmic-glass     /* 玻璃態效果 */
.cosmic-button    /* 按鈕樣式 */
.cosmic-input     /* 輸入框樣式 */
.cosmic-loading   /* 載入動畫 */
```

### 響應式設計
- 移動端優化的導航菜單
- 自適應的表格和卡片布局
- 觸摸友好的交互元素

## 🔒 安全考量

### 權限驗證
- 前端和後端雙重權限檢查
- 基於 JWT 的身份驗證
- RLS 策略保護數據庫操作

### 數據保護
- 敏感操作需要確認提示
- 軟刪除機制保護重要數據
- 操作日誌記錄（規劃中）

## 📱 使用指南

### 成為守護者
1. 註冊普通遥行者帳號
2. 聯繫現有守護者提升角色
3. 或使用數據庫直接更新角色

### 訪問管理功能
1. 登入守護者帳號
2. 點擊導航欄的「管理控制台」
3. 選擇需要的管理功能

### 日常管理任務
- **每日**: 檢查系統統計和用戶活動
- **每週**: 審核新課程和處理用戶反饋
- **每月**: 更新分類結構和發布重要神諭

## 🚀 功能擴展

### 規劃中的功能
- 操作日誌和審計追蹤
- 批量用戶操作
- 自動化審核規則
- 數據導出功能
- 郵件通知系統

### 自定義開發
所有組件都採用模組化設計，可以輕鬆：
- 添加新的管理頁面
- 擴展現有功能
- 自定義權限規則
- 整合第三方服務

## 🐛 故障排除

### 常見問題
1. **權限不足錯誤**
   - 檢查用戶角色是否為 guardian
   - 確認 RLS 策略配置正確

2. **數據載入失敗**
   - 檢查 Supabase 連接
   - 確認表結構完整

3. **操作失敗**
   - 查看瀏覽器控制台錯誤
   - 檢查網絡連接

### 調試工具
- 瀏覽器開發者工具
- Supabase 控制台日誌
- `/simple-supabase-test` 連接測試頁面

## 📞 支持

### 技術支持
- 查看項目 README.md
- 檢查 GitHub Issues
- 聯繫開發團隊

### 社群支持
- 遥行者社群討論
- 知識分享會
- 最佳實踐交流

---

**注意**: 守護者角色擁有系統最高權限，請謹慎使用所有管理功能，確保教學生態系統的穩定運行。