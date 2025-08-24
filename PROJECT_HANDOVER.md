# 專案交接手冊：My Voyager App - 教學生態系感知藍圖平台

## 📋 目錄
1. [專案概述](#1-專案概述-project-overview)
2. [技術棧清單](#2-技術棧清單-tech-stack)
3. [核心架構與關鍵檔案說明](#3-核心架構與關鍵檔案說明-core-architecture--key-files)
4. [外部服務配置與金鑰](#4-外部服務配置與金鑰-external-service-configurations)
5. [核心功能與使用者角色](#5-核心功能與使用者角色-core-features--user-roles)
6. [本地開發環境設定指南](#6-本地開發環境設定指南-local-development-setup-guide)
7. [已知問題與未來建議](#7-已知問題與未來建議-known-issues--future-suggestions)

---

## 1. 專案概述 (Project Overview)

### 🌌 核心目標
**My Voyager App** 是一個創新的教學生態系統平台，旨在「培育一個活的宇宙」，在這裡知識如同星云，在個體的碰撞、詮釋與再創造中，不斷凝聚、爆發，誕生出新的恒星。

### 🎯 設計理念
- **唤起敬畏感**：通過宇宙主題設計，讓使用者感受到知識探索的壯闊
- **追求無痕感**：流暢的使用者體驗，讓技術成為知識傳遞的透明媒介
- **生態系統**：不僅是平台，更是一個能自我演化、充滿生命力的知識宇宙

### 🌟 核心價值
1. **知識共創**：鼓勵個體間的知識碰撞與再創造
2. **角色多元**：四種原型角色各司其職，形成完整生態
3. **成長導向**：從探索者到守護者的成長路徑
4. **社群驅動**：以社群力量推動知識傳播與創新

---

## 2. 技術棧清單 (Tech Stack)

### 🚀 前端框架
- **Next.js**: `v15.5.0` - React 全棧框架，支援 SSR 和 API 路由
- **React**: `v19.1.0` - 使用者界面函式庫
- **TypeScript**: `v5.x` - 靜態類型檢查

### 🎨 樣式與 UI
- **Tailwind CSS**: `v4.x` - 原子化 CSS 框架
- **自定義宇宙主題**: 完整的 cosmic 設計系統
- **Responsive Design**: 支援所有設備尺寸

### 🔐 後端服務
- **Supabase**: `v2.55.0` - 後端即服務 (BaaS)
  - PostgreSQL 資料庫
  - 即時認證系統
  - 行級安全 (RLS)
  - 即時訂閱

### 🛠️ 開發工具
- **ESLint**: `v9.x` - 程式碼品質檢查
- **Turbopack**: Next.js 內建高效能打包工具
- **PostCSS**: CSS 後處理器

### 📦 關鍵套件
```json
{
  "@supabase/supabase-js": "^2.55.0",
  "@supabase/ssr": "^0.7.0",
  "@supabase/auth-ui-react": "^0.4.7",
  "@netlify/plugin-nextjs": "^5.12.1",
  "dotenv": "^16.6.1"
}
```

### 🌐 部署平台
- **Netlify**: 前端自動部署和 CDN
- **GitHub**: 版本控制和 CI/CD 觸發
- **Supabase Cloud**: 資料庫和認證服務託管

---

## 3. 核心架構與關鍵檔案說明 (Core Architecture & Key Files)

### 📁 資料夾結構
```
my-voyager-app/
├── app/                          # Next.js 13+ App Router
│   ├── admin/                    # 守護者管理後台
│   │   ├── analytics/           # 系統統計頁面
│   │   ├── categories/          # 分類管理
│   │   ├── courses/            # 課程管理
│   │   ├── oracles/            # 神諭管理
│   │   ├── users/              # 用戶管理
│   │   └── page.tsx            # 管理控制台首頁
│   ├── auth/                    # 認證相關路由
│   │   └── callback/           # OAuth 回調處理
│   ├── constellation/          # 星座圖（主要功能頁面）
│   ├── courses/               # 課程相關頁面
│   ├── login/                 # 登入頁面
│   ├── profile/              # 用戶檔案頁面
│   ├── globals.css           # 全局樣式（宇宙主題）
│   ├── layout.tsx            # 根佈局組件
│   └── page.tsx              # 首頁
├── components/                 # 可重用組件
│   ├── common/               # 通用組件
│   ├── forms/               # 表單組件
│   └── ui/                  # UI 基礎組件
├── lib/                       # 工具函數與配置
│   ├── auth-context.tsx      # 認證狀態管理
│   ├── database.types.ts     # TypeScript 資料庫類型
│   ├── permissions.ts        # 權限檢查邏輯
│   ├── supabase-server.ts    # 服務端 Supabase 客戶端
│   └── supabaseClient.ts     # 客戶端 Supabase 配置
├── scripts/                   # 資料庫腳本和工具
│   ├── guardian-features-db-check.sql  # 守護者功能資料庫檢查
│   ├── guardian-features-simple.sql   # 簡化版資料庫腳本
│   └── test-accounts.sql            # 測試帳號創建腳本
├── middleware.ts              # Next.js 中介軟體（路由保護）
├── next.config.ts            # Next.js 配置
├── netlify.toml             # Netlify 部署配置
└── package.json             # 專案依賴和腳本
```

### 🔑 關鍵檔案詳解

#### `lib/supabaseClient.ts`
**用途**: 客戶端 Supabase 初始化和常用查詢函數
```typescript
// 主要功能：
// 1. 創建 Supabase 客戶端實例
// 2. 提供常用的資料庫查詢工具函數
// 3. 支援 TypeScript 類型安全
```

#### `lib/auth-context.tsx`
**用途**: 全局認證狀態管理
```typescript
// 核心功能：
// 1. 用戶登入/登出狀態管理
// 2. 用戶檔案和角色權限管理
// 3. 四種原型角色的判斷邏輯
// 4. 認證狀態的即時同步
```

#### `middleware.ts`
**用途**: 路由保護和認證檢查
```typescript
// 保護機制：
// 1. 檢查受保護路由的訪問權限
// 2. 未登入用戶自動重定向到登入頁
// 3. 維護認證 cookie 的狀態
// 4. 支援認證回調處理
```

#### `app/layout.tsx`
**用途**: 全站根佈局
```typescript
// 核心職責：
// 1. 提供全局 HTML 結構
// 2. 載入宇宙主題樣式
// 3. 整合認證 Provider
// 4. 設定 meta 標籤和 SEO
```

#### `app/admin/**`
**用途**: 守護者專用管理後台
```
admin/
├── page.tsx          # 管理控制台總覽
├── users/           # 用戶管理和角色提升
├── oracles/         # 神諭（系統公告）管理
├── categories/      # 課程分類管理
├── courses/         # 課程內容管理
└── analytics/       # 系統數據分析
```

---

## 4. 外部服務配置與金鑰 (External Service Configurations)

### 🐙 GitHub
- **倉庫網址**: `https://github.com/gotoyo0001-lgtm/my-teaching-website.git`
- **主要分支**: `main`
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

### 🗄️ Supabase
#### 資料庫結構查詢
```sql
-- 查看所有資料表結構
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 查看所有 RLS 策略
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
ORDER BY tablename, policyname;
```

#### 核心資料表
1. **profiles** - 用戶檔案
2. **courses** - 課程資料
3. **lessons** - 課程章節
4. **enrollments** - 學習記錄
5. **oracles** - 守護者神諭
6. **categories** - 課程分類
7. **comments** - 評論系統
8. **mentorship** - 導師關係

#### 重要提醒
> ⚠️ **新團隊必須**：
> 1. 創建自己的 Supabase 專案
> 2. 執行 `scripts/guardian-features-db-check.sql` 初始化資料庫
> 3. 從 Supabase 控制台獲取新的 `Project URL` 和 `anon key`
> 4. 執行 `scripts/test-accounts.sql` 創建測試帳號

### 🌐 Netlify
- **部署網址**: `https://my-voyager.netlify.app`
- **自動部署**: 連接到 GitHub `main` 分支

#### 必要環境變數
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 建置設定
- **Build command**: `npm run build`
- **Publish directory**: `.next` (由 `@netlify/plugin-nextjs` 自動處理)
- **Node version**: `18`

---

## 5. 核心功能與使用者角色 (Core Features & User Roles)

### 👥 四種原型角色

#### 🚀 遠行者 (Voyager)
- **權限**: 基礎學習者
- **功能**:
  - 瀏覽和參與課程
  - 個人學習記錄
  - 基礎社群互動
- **成長路徑**: 預設角色，可成長為其他角色

#### 💡 啟明者 (Luminary)
- **權限**: 知識創作者
- **功能**:
  - 創建和發佈課程
  - 進階內容管理
  - 學習者指導
- **特色**: 思想的恆星，用光與熱點燃周圍的星塵

#### ⚡ 領航者 (Catalyst)
- **權限**: 社群引導者
- **功能**:
  - 社群管理
  - 學習活動組織
  - 跨領域連結
- **特色**: 引力的編織者，牽引並編織成璀璨的星河

#### 🛡️ 守護者 (Guardian)
- **權限**: 最高管理權限
- **專屬功能**:
  1. **管理控制台** (`/admin`) - 系統總覽和快速操作
  2. **用戶管理** - 查看所有用戶，執行角色提升
  3. **神諭管理** - 發布系統公告和重要通知
  4. **分類管理** - 管理課程分類體系
  5. **課程管理** - 審核、批准和管理所有課程
  6. **系統統計** - 查看平台數據和分析報告

### 🔐 權限檢查邏輯
```typescript
// 使用 lib/permissions.ts 中的 usePermissions hook
const { 
  canManageUsers,     // 只有守護者
  canCreateOracle,    // 只有守護者  
  canManageCategories, // 只有守護者
  canViewAnalytics    // 只有守護者
} = usePermissions();
```

---

## 6. 本地開發環境設定指南 (Local Development Setup Guide)

### 📋 前置需求
- **Node.js**: v18 或更高版本
- **Git**: 最新版本
- **程式碼編輯器**: VS Code (推薦)

### 🚀 快速開始

#### 1. 克隆專案
```bash
git clone https://github.com/gotoyo0001-lgtm/my-teaching-website.git
cd my-voyager-app
```

#### 2. 安裝依賴
```bash
npm install
```

#### 3. 創建環境變數檔案
```bash
# 創建 .env.local 檔案
cp .env.example .env.local  # 如果有範例檔案

# 或手動創建
touch .env.local
```

#### 4. 填入 Supabase 配置
```bash
# .env.local 內容
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 5. 初始化資料庫
```bash
# 在 Supabase SQL Editor 中執行
# 1. scripts/guardian-features-db-check.sql
# 2. scripts/test-accounts.sql
```

#### 6. 啟動開發服務器
```bash
npm run dev
```

#### 7. 開啟瀏覽器
訪問 `http://localhost:3000`

### 🧪 測試帳號
執行資料庫腳本後，可使用以下測試帳號：
- **遠行者**: `voyager@test.com` / `TestPassword123!`
- **啟明者**: `luminary@test.com` / `TestPassword123!`
- **領航者**: `catalyst@test.com` / `TestPassword123!`
- **守護者**: `guardian@test.com` / `TestPassword123!`

### 📦 常用開發命令
```bash
npm run dev          # 開發模式 (含 Turbopack)
npm run build        # 生產建置
npm run start        # 啟動生產版本
npm run lint         # ESLint 檢查
npm run type-check   # TypeScript 類型檢查
npm run clean        # 清理建置快取
```

---

## 7. 已知問題與未來建議 (Known Issues & Future Suggestions)

### ⚠️ 已知問題

#### 1. 首頁性能問題
- **問題**: 載入時間較長（約 3-5 秒）
- **原因**: 
  - 50 個星星動畫元素
  - 複雜的 CSS 動畫和模糊效果
  - 認證檢查導致的延遲
- **短期解決方案**: 考慮減少動畫元素數量
- **長期建議**: 實作動畫元素的懶載入

#### 2. Supabase Storage 警告
- **現象**: 控制台出現 `Storage API: 404` 警告
- **影響**: 不影響功能，僅為日誌噪音
- **建議**: 在未使用 Storage 功能時禁用相關 API 調用

#### 3. TypeScript 嚴格模式
- **問題**: 部分 Supabase 查詢缺少類型註解
- **解決方案**: 已添加類型斷言，但建議長期建立類型安全的查詢包裝器

#### 4. RLS 策略複雜度
- **問題**: PostgreSQL RLS 策略較複雜，維護困難
- **建議**: 建立策略管理工具或簡化策略邏輯

### 🚀 未來發展建議

#### 短期改進 (1-3 個月)
1. **性能優化**
   - 實作首頁動畫的懶載入
   - 優化圖片載入和快取策略
   - 添加頁面載入進度指示器

2. **用戶體驗提升**
   - 添加更多操作反饋
   - 完善錯誤處理和提示
   - 實作離線支援

3. **功能完善**
   - 添加搜尋功能
   - 實作即時通知系統
   - 增加批量操作功能

#### 中期規劃 (3-6 個月)
1. **社群功能擴展**
   - 實作即時聊天系統
   - 添加社群動態牆
   - 建立學習小組功能

2. **內容管理增強**
   - 支援更多內容格式（影片、音頻、互動元素）
   - 實作版本控制系統
   - 添加內容推薦演算法

3. **數據分析深化**
   - 實作詳細的學習分析
   - 建立個人化學習路徑
   - 添加成就系統

#### 長期願景 (6-12 個月)
1. **人工智慧整合**
   - AI 輔助內容創作
   - 智慧學習路徑推薦
   - 自動化內容審核

2. **平台擴展**
   - 多語言支援
   - 移動 App 開發
   - API 開放生態系統

3. **商業模式**
   - 付費課程功能
   - 認證系統
   - 企業解決方案

### 🛠️ 技術債務
1. **依賴管理**: 定期更新依賴套件，特別是安全性更新
2. **測試覆蓋**: 建立完整的單元測試和整合測試
3. **文檔維護**: 保持 API 文檔和用戶手冊的更新
4. **監控系統**: 實作錯誤追蹤和性能監控

---

## 📞 支援與聯絡

### 技術文檔
- **README.md**: 基本安裝和使用說明
- **GUARDIAN_FEATURES.md**: 守護者功能詳細文檔
- **API 文檔**: 待建立

### 社群資源
- **GitHub Issues**: 技術問題和功能請求
- **開發者論壇**: 待建立
- **知識庫**: 待建立

---

**最後更新**: 2025-08-24  
**版本**: v4.0  
**維護者**: 教學生態系感知藍圖開發團隊

> 💫 "我們的使命不是構建一個'平台'，而是培育一片能自我演化、充滿生命力的知識宇宙。"

---

*本文檔將隨著專案發展持續更新，請新團隊在接手後及時維護此文檔。*