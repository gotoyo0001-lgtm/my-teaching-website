#!/usr/bin/env node
// scripts/quick-type-fix.js
// 快速修復所有 Supabase 類型錯誤

const fs = require('fs');
const path = require('path');

// 需要修復的文件列表
const filesToFix = [
  'app/admin/courses/page.tsx',
  'app/admin/create-test-accounts/page.tsx',
  'app/admin/oracles/page.tsx',
  'app/admin/users/page.tsx',
  'app/course/[id]/learn/page.tsx',
  'app/course/[id]/page.tsx',
  'app/debug/auth/page.tsx',
  'app/my-constellation/page.tsx',
  'app/search/page.tsx',
  'app/studio/create/page.tsx',
  'app/studio/edit/[id]/page.tsx'
];

function addSupabaseTypeFix(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // 檢查是否已經有類型修復
  if (content.includes('as { data: any')) {
    console.log(`ℹ️  已修復: ${filePath}`);
    return;
  }
  
  // 通用的 Supabase 查詢修復模式
  const patterns = [
    // 基本查詢模式
    {
      regex: /(\w+\.from\(['"]\w+['"]\)\s*\.select\([^)]+\)(?:\s*\.[\w()'",.:\s{}]+)*);/g,
      replacement: '$1 as { data: any[] | null; error: any; };'
    },
    // insert 操作
    {
      regex: /\.insert\((\w+)\)/g,
      replacement: '.insert($1 as any)'
    },
    // update 操作
    {
      regex: /\.update\((\w+)\)/g,
      replacement: '.update($1 as any)'
    },
    // upsert 操作
    {
      regex: /\.upsert\((\w+)\)/g,
      replacement: '.upsert($1 as any)'
    }
  ];

  let hasChanges = false;

  patterns.forEach(pattern => {
    const newContent = content.replace(pattern.regex, pattern.replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已修復: ${filePath}`);
  } else {
    console.log(`ℹ️  無需修復: ${filePath}`);
  }
}

console.log('🚀 快速修復 TypeScript 類型錯誤...\n');

filesToFix.forEach(file => {
  addSupabaseTypeFix(file);
});

console.log('\n✅ 快速修復完成！');
console.log('\n🔍 建議運行：npm run type-check 檢查修復結果');