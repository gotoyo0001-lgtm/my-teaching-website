# 🌟 教學生態系感知蓝图 (My Voyager App)

> 基於 Jamstack 架構的現代化教學平台，讓知識在宇宙中自由流動 ✨

## 🚀 技術架構

採用現代化的 **Jamstack 架構**，達到高效能、高安全性、低成本與卓越開發體驗：

### 🔧 核心技術棧

- **🎯 前端框架**: Next.js 15.5.0 + React 19.1.0 + TypeScript
- **🎨 樣式系統**: Tailwind CSS 4 (宇宙主題設計)
- **🔒 身份認證**: Supabase Auth (四種原型角色權限)
- **💾 數據庫**: Supabase PostgreSQL + 行級安全性 (RLS)
- **📁 版本控制**: GitHub (協作次元)
- **🌐 部署託管**: Netlify (宇宙之網 + 全球 CDN)
- **☁️ 後端服務**: Supabase BaaS (中枢神经系统)

### 🌌 四種原型角色

- **🚀 遙行者 (Voyager)**: 探索者，學習課程、參與討論
- **💡 啟明者 (Luminary)**: 智慧導師，創造課程、分享知識  
- **🧭 領航者 (Catalyst)**: 社群引導者，管理討論、激發互動
- **🛡️ 守護者 (Guardian)**: 系統管理員，維護秩序、發布神諭

## 🛠️ 開發環境設置

### 必需工具

- Node.js 18+
- Git
- 現代代碼編輯器 (推薦 VS Code)

### 快速開始

```bash
# 1. 克隆項目
git clone https://github.com/yourusername/my-voyager-app.git
cd my-voyager-app

# 2. 安裝依賴
npm install

# 3. 設置環境變數
cp .env.example .env.local
# 編輯 .env.local 填入實際的 Supabase 配置

# 4. 啟動開發服務器
npm run dev
```

### 🗃️ Supabase 數據庫設置

1. 登入 [Supabase 控制台](https://imidprdspztfqabdzqrr.supabase.co)
2. 進入 **SQL Editor**
3. 執行 `supabase-setup.sql` 中的所有腳本
4. 在 **Authentication > Settings** 中配置：
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

詳細步驟請參考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🚀 Netlify 部署

### 自動部署 (推薦)

1. **連接 GitHub 倉庫**
   - 登入 [Netlify](https://netlify.com)
   - 點擊 \"New site from Git\"
   - 選擇你的 GitHub 倉庫

2. **建置設定**
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`

3. **環境變數設置**
   - 進入 Site Settings > Environment Variables
   - 添加所有必需的環境變數（參考 `.env.example`）

4. **部署**
   - 點擊 \"Deploy site\"
   - 每次推送到 `main` 分支將自動重新部署

### 手動部署

```bash
# 建置靜態文件
npm run build

# 上傳 out/ 目錄到 Netlify
```

## 📁 項目結構

```
my-voyager-app/
├── 📂 app/                    # Next.js App Router
│   ├── 📂 auth/              # 身份認證
│   ├── 📂 constellation/     # 知識星圖
│   ├── 📂 course/           # 課程系統
│   ├── 📂 discussions/      # 討論區
│   ├── 📂 my-constellation/ # 個人空間
│   ├── 📂 search/           # 搜索系統
│   └── 📂 studio/           # 創作工作室
├── 📂 components/            # 共享組件
├── 📂 lib/                  # 核心庫
│   ├── 📄 auth-context.tsx  # 認證上下文
│   ├── 📄 database.types.ts # 數據庫類型
│   └── 📄 supabaseClient.ts # Supabase 客戶端
├── 📂 public/               # 靜態資源
├── 📄 netlify.toml          # Netlify 配置
├── 📄 supabase-setup.sql    # 數據庫設置腳本
└── 📄 tailwind.config.ts    # Tailwind 配置
```

## 🎨 設計系統

### 宇宙主題色彩

- **🌌 虛空**: `#0a0a0f` - 深邃的太空背景
- **⭐ 星光**: `#f7fafc` - 恆星白光
- **💫 宇宙紫**: `#6366f1` - 主色調
- **🔥 能量藍**: `#3b82f6` - 交互色彩
- **☀️ 溫暖金**: `#f59e0b` - 強調色彩

### 設計原則

- **唤起敬畏感**: 讓用戶感受到知識宇宙的浩瀚
- **追求無痕感**: 流暢自然的交互體驗

## 🔒 安全性

- **行級安全性 (RLS)**: 所有數據表都啟用了精細化權限控制
- **身份驗證**: 基於 Supabase Auth 的安全認證
- **內容安全策略**: 防止 XSS 攻擊
- **HTTPS**: 全站 HTTPS 加密

## 📊 性能優化

- **靜態生成**: 利用 Next.js 靜態導出
- **全球 CDN**: Netlify 全球加速
- **圖片優化**: 自動圖片壓縮和格式轉換
- **代碼分割**: 自動按路由分割代碼

## 🧪 測試與質量保證

```bash
# TypeScript 類型檢查
npm run type-check

# ESLint 代碼檢查
npm run lint

# 建置測試
npm run build
```

## 🚀 生產部署檢查清單

- [ ] 環境變數已在 Netlify 中設置
- [ ] Supabase RLS 策略已正確配置
- [ ] 域名已綁定並啟用 HTTPS
- [ ] 性能和安全性測試通過
- [ ] 備份策略已建立

## 🤝 貢獻指南

1. Fork 項目
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打開 Pull Request

## 📄 許可證

本項目採用 MIT 許可證 - 詳見 [LICENSE](LICENSE) 文件

## 🆘 支援

- 📖 [詳細文檔](https://docs.example.com)
- 💬 [Discord 社群](https://discord.gg/example)
- 🐛 [問題回報](https://github.com/yourusername/my-voyager-app/issues)

---

<div align=\"center\">
  <strong>🌟 在知識的宇宙中，每個人都是勇敢的遠航者 🚀</strong>
</div>