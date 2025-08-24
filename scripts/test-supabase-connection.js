// scripts/test-supabase-connection.js
// Supabase 连接测试脚本

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 开始 Supabase 连接测试...\n');

  // 1. 检查环境变量
  console.log('📋 环境变量检查:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`   URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Key: ${supabaseKey ? '✅ 已配置' : '❌ 未配置'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ 环境变量未正确配置，请检查 .env.local 文件');
    return;
  }

  // 2. 创建客户端
  console.log('\n🔌 创建 Supabase 客户端...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 3. 测试基础连接
    console.log('\n🌐 测试基础连接...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ❌ 连接失败: ${sessionError.message}`);
    } else {
      console.log('   ✅ 连接成功');
      console.log(`   会话状态: ${session ? '已登录' : '未登录'}`);
    }

    // 4. 测试数据库查询
    console.log('\n🗄️  测试数据库查询...');
    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (queryError) {
      console.log(`   ❌ 查询失败: ${queryError.message}`);
      if (queryError.message.includes('permission denied')) {
        console.log('   💡 这可能是 RLS (行级安全) 策略导致的，属于正常情况');
      }
    } else {
      console.log('   ✅ 数据库查询成功');
    }

    // 5. 测试认证功能
    console.log('\n🔐 测试认证功能...');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'invalidpassword'
      });
      
      if (authError && authError.message.includes('Invalid login credentials')) {
        console.log('   ✅ 认证服务正常 (预期的登录失败)');
      } else {
        console.log('   ⚠️  认证响应异常');
      }
    } catch (error) {
      console.log(`   ❌ 认证测试失败: ${error.message}`);
    }

    // 6. 测试实时连接
    console.log('\n⚡ 测试实时连接...');
    const channel = supabase.channel('test-channel');
    
    const subscriptionPromise = new Promise((resolve) => {
      const subscription = channel
        .on('presence', { event: 'sync' }, () => {
          console.log('   ✅ 实时连接正常');
          resolve(true);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('   ✅ 实时订阅成功');
            resolve(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.log('   ❌ 实时连接失败');
            resolve(false);
          }
        });

      // 5秒超时
      setTimeout(() => {
        console.log('   ⚠️  实时连接测试超时');
        supabase.removeChannel(channel);
        resolve(false);
      }, 5000);
    });

    await subscriptionPromise;

  } catch (error) {
    console.log(`\n❌ 测试过程中发生错误: ${error.message}`);
  }

  console.log('\n🏁 Supabase 连接测试完成');
}

// 运行测试
testSupabaseConnection().catch(console.error);