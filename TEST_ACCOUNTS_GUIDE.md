# 教學生態系感知藍圖 - 測試帳號創建指南

## 🌟 四種原型角色測試帳號

由於 Supabase 的郵箱驗證限制，建議您手動在 Supabase 控制台中創建測試帳號，或使用真實的郵箱地址。

### 📋 測試帳號信息

#### 1. 守護者 (Guardian) 測試帳號
- **郵箱**: `guardian.voyager@gmail.com` (請使用您的真實郵箱)
- **密碼**: `TestPassword123!`
- **用戶名**: `guardian_test`
- **顯示名稱**: `守護者·測試`
- **角色**: `guardian`
- **簡介**: 我是守護者測試帳號，負責維護教學生態系的平衡與秩序。

#### 2. 啟明者 (Luminary) 測試帳號
- **郵箱**: `luminary.voyager@gmail.com` (請使用您的真實郵箱)
- **密碼**: `TestPassword123!`
- **用戶名**: `luminary_test`
- **顯示名稱**: `啟明者·測試`
- **角色**: `luminary`
- **專業領域**: `["前端開發", "UI/UX設計", "TypeScript"]`
- **簡介**: 我是啟明者測試帳號，專注於創造和分享知識的光芒。

#### 3. 領航者 (Catalyst) 測試帳號
- **郵箱**: `catalyst.voyager@gmail.com` (請使用您的真實郵箱)
- **密碼**: `TestPassword123!`
- **用戶名**: `catalyst_test`
- **顯示名稱**: `領航者·測試`
- **角色**: `catalyst`
- **社群**: `["前端開發社群", "設計師聯盟", "新手導航"]`
- **簡介**: 我是領航者測試帳號，致力於連接不同學習者並促進協作。

#### 4. 遠行者 (Voyager) 測試帳號
- **郵箱**: `voyager.test@gmail.com` (請使用您的真實郵箱)
- **密碼**: `TestPassword123!`
- **用戶名**: `voyager_test`
- **顯示名稱**: `遠行者·測試`
- **角色**: `voyager`
- **宣言**: 我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。我的目標是在這個無垠的知識宇宙中，找到屬於自己的星座。
- **簡介**: 我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。

## 🚀 創建方法

### 方法一：手動在 Supabase 控制台創建

1. 打開 [Supabase 控制台](https://supabase.com/dashboard)
2. 進入您的項目
3. 點擊左側導航中的 "Authentication" → "Users"
4. 點擊 "Create a new user" 按鈕
5. 輸入郵箱和密碼
6. 創建成功後，手動在 `profiles` 表中添加對應的用戶檔案

### 方法二：使用真實郵箱運行腳本

如果您有真實的郵箱地址，可以編輯 `scripts/create-test-accounts.js` 文件：

```javascript
// 將郵箱地址替換為真實的郵箱
const testAccounts = [
  {
    role: 'guardian',
    username: 'guardian_test',
    email: 'your.real.email+guardian@gmail.com', // 使用您的真實郵箱
    password: 'TestPassword123!',
    // ... 其他配置
  },
  // ... 其他帳號
];
```

然後運行：
```bash
npm run create-test-accounts
```

### 方法三：在應用中註冊

您也可以直接在您的應用 https://my-voyager.netlify.app 中註冊這些測試帳號：

1. 訪問登錄頁面
2. 點擊註冊
3. 使用上述信息註冊帳號
4. 註冊後，需要手動更新用戶的角色

## 🔧 手動更新用戶角色

註冊帳號後，需要在 Supabase 控制台中手動更新用戶角色：

1. 進入 "Table Editor" → "profiles"
2. 找到對應的用戶記錄
3. 編輯 `role` 欄位，設置為對應的角色：
   - `guardian` (守護者)
   - `luminary` (啟明者)
   - `catalyst` (領航者)
   - `voyager` (遠行者)

## 🎯 測試建議

創建測試帳號後，您可以測試以下功能：

- **守護者**: 管理平台設置、查看所有用戶數據
- **啟明者**: 創建課程、發布內容
- **領航者**: 組織活動、建立社群連接
- **遠行者**: 學習課程、參與討論

---

## 📝 注意事項

- 請確保使用強密碼
- 測試完成後可以刪除測試帳號
- 在生產環境中請不要使用這些測試帳號
- 記得定期更新測試數據