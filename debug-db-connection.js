// 数据库连接测试脚本
// 用于诊断500错误和用户档案获取失败的问题

// 手动读取环境变量
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// 读取 .env.local 文件
let supabaseUrl, supabaseKey;
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('❌ 无法读取 .env.local 文件:', error.message);
  process.exit(1);
}

console.log('🔍 开始数据库连接诊断...');
console.log('📋 Supabase URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置');
console.log('📋 Supabase Key:', supabaseKey ? '✅ 已配置' : '❌ 未配置');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 环境变量配置不完整！');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('\n🌐 测试基本连接...');
    
    // 1. 测试基本连接
    const { data: basicTest, error: basicError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (basicError) {
      console.error('❌ 基本连接失败:', basicError);
      return false;
    } else {
      console.log('✅ 基本连接成功');
    }

    // 2. 测试表是否存在
    console.log('\n📊 检查表结构...');
    const { data: tableTest, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ profiles表查询失败:', tableError);
      
      if (tableError.code === 'PGRST116') {
        console.log('💡 可能是表不存在或RLS策略问题');
      }
      
      return false;
    } else {
      console.log('✅ profiles表可访问');
      console.log('📋 表结构预览:', JSON.stringify(tableTest, null, 2));
    }

    // 3. 测试认证状态
    console.log('\n🔐 检查认证状态...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ 获取认证会话失败:', authError);
    } else {
      console.log('✅ 认证状态检查完成');
      console.log('👤 当前用户:', authData.session?.user?.email || '未登录');
    }

    // 4. 测试特定查询（模拟实际获取用户档案的操作）
    console.log('\n🎯 测试用户档案查询...');
    if (authData.session?.user?.id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.session.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ 用户档案查询失败:', profileError);
        
        if (profileError.code === 'PGRST116') {
          console.log('💡 很可能是RLS策略阻止了匿名用户访问');
        }
      } else {
        console.log('✅ 用户档案查询成功:', profileData);
      }
    } else {
      console.log('⚠️ 无认证用户，无法测试用户档案查询');
      
      // 测试匿名查询
      const { data: anonData, error: anonError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .limit(1);
      
      if (anonError) {
        console.error('❌ 匿名查询失败:', anonError);
        console.log('💡 这很可能是导致500错误的原因 - RLS策略可能配置过严');
      } else {
        console.log('✅ 匿名查询成功');
      }
    }

    return true;
  } catch (error) {
    console.error('💥 数据库连接测试异常:', error);
    return false;
  }
}

// 运行测试
testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ 数据库连接诊断完成');
  } else {
    console.log('\n❌ 数据库连接存在问题');
  }
  process.exit(success ? 0 : 1);
});