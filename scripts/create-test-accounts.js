/**
 * 教學生態系感知藍圖 - 測試帳號創建腳本
 * 為四種原型角色創建測試帳號：守護者、啟明者、領航者、遠行者
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 請確保在 .env.local 中設置了 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 使用匿名密鑰創建 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 測試帳號配置
const testAccounts = [
  {
    role: 'guardian',
    username: 'guardian_test',
    email: 'guardian.test@example.com',
    password: 'TestPassword123!',
    display_name: '守護者·測試',
    bio: '我是守護者測試帳號，負責維護教學生態系的平衡與秩序。',
    luminary_expertise: null,
    catalyst_communities: null,
    voyager_manifesto: null
  },
  {
    role: 'luminary',
    username: 'luminary_test',
    email: 'luminary.test@example.com',
    password: 'TestPassword123!',
    display_name: '啟明者·測試',
    bio: '我是啟明者測試帳號，專注於創造和分享知識的光芒。',
    luminary_expertise: ['前端開發', 'UI/UX設計', 'TypeScript'],
    catalyst_communities: null,
    voyager_manifesto: null
  },
  {
    role: 'catalyst',
    username: 'catalyst_test',
    email: 'catalyst.test@example.com',
    password: 'TestPassword123!',
    display_name: '領航者·測試',
    bio: '我是領航者測試帳號，致力於連接不同學習者並促進協作。',
    luminary_expertise: null,
    catalyst_communities: ['前端開發社群', '設計師聯盟', '新手導航'],
    voyager_manifesto: null
  },
  {
    role: 'voyager',
    username: 'voyager_test',
    email: 'voyager.test@example.com',
    password: 'TestPassword123!',
    display_name: '遠行者·測試',
    bio: '我是遠行者測試帳號，在知識的宇宙中不斷探索和學習。',
    luminary_expertise: null,
    catalyst_communities: null,
    voyager_manifesto: '我相信每一次學習都是一次星際旅行，每個知識點都是一顆新星。我的目標是在這個無垠的知識宇宙中，找到屬於自己的星座。'
  }
];

async function createTestAccount(account) {
  try {
    console.log(`\n🚀 正在創建 ${account.display_name} (${account.role}) 測試帳號...`);

    // 1. 創建認證用戶（使用一般註冊方式）
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          username: account.username,
          display_name: account.display_name
        }
      }
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log(`⚠️ 用戶已存在，嘗試登入以更新檔案...`);
        
        // 嘗試登入以獲取用戶 ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password
        });
        
        if (signInError) {
          console.error(`❌ 無法登入現有用戶:`, signInError.message);
          return false;
        }
        
        // 更新用戶檔案
        const userId = signInData.user.id;
        await updateUserProfile(userId, account);
        
        console.log(`✅ 用戶檔案更新成功`);
        console.log(`📧 郵箱: ${account.email}`);
        console.log(`🔑 密碼: ${account.password}`);
        console.log(`👤 用戶名: ${account.username}`);
        console.log(`🌟 角色: ${account.role}`);
        
        return true;
      } else {
        console.error(`❌ 創建認證用戶失敗:`, authError.message);
        return false;
      }
    }

    if (!authData.user) {
      console.error(`❌ 無法獲取用戶數據`);
      return false;
    }

    console.log(`✅ 認證用戶創建成功: ${authData.user.id}`);

    // 2. 創建用戶檔案
    await updateUserProfile(authData.user.id, account);

    console.log(`✅ 用戶檔案創建成功`);
    console.log(`📧 郵箱: ${account.email}`);
    console.log(`🔑 密碼: ${account.password}`);
    console.log(`👤 用戶名: ${account.username}`);
    console.log(`🌟 角色: ${account.role}`);

    return true;
  } catch (error) {
    console.error(`❌ 創建 ${account.display_name} 失敗:`, error.message);
    return false;
  }
}

async function updateUserProfile(userId, account) {
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      username: account.username,
      display_name: account.display_name,
      bio: account.bio,
      role: account.role,
      luminary_expertise: account.luminary_expertise,
      catalyst_communities: account.catalyst_communities,
      voyager_manifesto: account.voyager_manifesto,
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error(`❌ 創建/更新用戶檔案失敗:`, profileError.message);
    throw profileError;
  }
}

async function main() {
  console.log('🌌 教學生態系感知藍圖 - 測試帳號創建工具');
  console.log('=' .repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const account of testAccounts) {
    const success = await createTestAccount(account);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 創建結果統計:');
  console.log(`✅ 成功: ${successCount} 個帳號`);
  console.log(`❌ 失敗: ${failCount} 個帳號`);

  if (successCount > 0) {
    console.log('\n🎉 測試帳號創建完成！');
    console.log('💡 您現在可以使用以下帳號登入測試不同角色的功能：');
    console.log('');
    testAccounts.forEach(account => {
      console.log(`${account.role.toUpperCase()}: ${account.email} / ${account.password}`);
    });
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// 執行腳本
main().catch(error => {
  console.error('❌ 腳本執行失敗:', error);
  process.exit(1);
});