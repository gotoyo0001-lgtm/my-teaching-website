# 🚨 登入問題快速修復指南

## ⚡ 立即可嘗試的解決方案

### 1. 使用診斷工具
訪問：`https://my-voyager.netlify.app/debug/auth` 或 `http://localhost:3000/debug/auth`

這個診斷工具可以：
- ✅ 測試 Supabase 連接
- ✅ 檢查測試帳號是否存在
- ✅ 自動創建測試帳號
- ✅ 診斷具體的登入問題

### 2. 檢查 Supabase 認證設置

#### 在 Supabase 控制台中檢查：

1. **Authentication → Settings**
   - 確保 "Enable email confirmations" 設為 **OFF**（測試階段）
   - 或者確保測試帳號的 email 已經確認

2. **Authentication → Users**
   - 檢查是否有測試用戶
   - 確認用戶的 "Email Confirmed" 狀態

3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`（本地）或 `https://my-voyager.netlify.app`（線上）
   - Redirect URLs: 添加上述兩個 URL + `/auth/callback`

### 3. 手動創建測試帳號

如果自動腳本不工作，可以手動創建：

#### 在 Supabase Dashboard → Authentication → Users 中：

**守護者帳號：**
```
Email: guardian.test@yourdomain.com
Password: TestPassword123!
Confirm: ✅ (手動確認)
```

**啟明者帳號：**
```
Email: luminary.test@yourdomain.com
Password: TestPassword123!
Confirm: ✅ (手動確認)
```

**領航者帳號：**
```
Email: catalyst.test@yourdomain.com
Password: TestPassword123!
Confirm: ✅ (手動確認)
```

**遠行者帳號：**
```
Email: voyager.test@yourdomain.com
Password: TestPassword123!
Confirm: ✅ (手動確認)
```

### 4. 使用真實郵箱測試

如果測試帳號有問題，嘗試用您的真實郵箱註冊：

```
Email: your.real.email@gmail.com
Password: TestPassword123!
```

### 5. 檢查錯誤詳情

常見的 "Invalid login credentials" 原因：

1. **用戶不存在** → 需要先註冊
2. **密碼錯誤** → 檢查密碼是否正確
3. **Email 未確認** → 在 Supabase 中手動確認或關閉 email confirmation
4. **帳號被禁用** → 在 Supabase Users 中檢查狀態

### 6. 緊急修復 SQL

如果需要，可以在 Supabase SQL Editor 中運行：

```sql
-- 檢查現有用戶
SELECT 
    id, 
    email, 
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 手動確認用戶郵箱（將 EMAIL 替換為實際郵箱）
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'YOUR_EMAIL_HERE';

-- 檢查用戶檔案
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;
```

### 7. 重新啟動開發服務器

有時候環境變數緩存會導致問題：

```bash
# 停止開發服務器 (Ctrl+C)
# 然後重新啟動
npm run dev
```

### 8. 檢查網絡和瀏覽器

- 清除瀏覽器 localStorage：打開開發者工具 → Application → Local Storage → 清空
- 檢查網絡連接到 Supabase
- 嘗試無痕模式瀏覽器

## 🎯 最快的解決方法

1. **第一步**：訪問診斷工具 `/debug/auth`
2. **第二步**：點擊 "創建所有測試帳號"
3. **第三步**：點擊 "測試所有測試帳號"
4. **第四步**：查看診斷結果，根據提示修復問題

## 📞 如果問題仍然存在

請提供以下信息：

1. 診斷工具的輸出結果
2. Supabase 控制台中 Users 的截圖
3. 您嘗試登入的具體郵箱和是否為新註冊
4. 瀏覽器控制台的錯誤信息

這樣我可以提供更精確的解決方案！