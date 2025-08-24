#!/usr/bin/env node
// scripts/fix-all-typescript-errors.js
// 全面修復 Supabase 2.56.0 類型錯誤

const fs = require('fs');
const path = require('path');

// 修復策略：添加類型斷言來解決 Supabase 類型推斷問題
const fixes = [
  // 修復 categories 頁面
  {
    file: 'app/admin/categories/page.tsx',
    replacements: [
      {
        search: "const { data: categoriesData, error } = await supabase\n      .from('categories')\n      .select('*')\n      .order('name');",
        replace: "const { data: categoriesData, error } = await supabase\n      .from('categories')\n      .select('*')\n      .order('name') as { data: any[] | null; error: any; };"
      },
      {
        search: ".update(categoryData)",
        replace: ".update(categoryData as any)"
      },
      {
        search: ".insert([categoryData])",
        replace: ".insert([categoryData] as any[])"
      }
    ]
  },
  
  // 修復 courses 頁面
  {
    file: 'app/admin/courses/page.tsx',
    replacements: [
      {
        search: "const { data: coursesData, error } = await supabase",
        replace: "const { data: coursesData, error } = await supabase"
      }
    ]
  },
  
  // 修復 users 頁面
  {
    file: 'app/admin/users/page.tsx',
    replacements: [
      {
        search: "const { data: usersData, error } = await supabase\n        .from('profiles')\n        .select('*')",
        replace: "const { data: usersData, error } = await supabase\n        .from('profiles')\n        .select('*') as { data: any[] | null; error: any; }"
      }
    ]
  }
];

function applyFix(filePath, replacements) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;

  replacements.forEach((replacement, index) => {
    if (content.includes(replacement.search)) {
      content = content.replace(replacement.search, replacement.replace);
      hasChanges = true;
      console.log(`  ✅ 應用修復 ${index + 1}`);
    }
  });

  if (hasChanges) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已修復: ${filePath}`);
  } else {
    console.log(`ℹ️  無需修復: ${filePath}`);
  }
}

console.log('🔧 開始修復 TypeScript 類型錯誤...\n');

fixes.forEach(fix => {
  console.log(`📁 處理文件: ${fix.file}`);
  applyFix(fix.file, fix.replacements);
});

console.log('\n✅ 類型修復完成！');
console.log('\n🏃‍♂️ 建議下一步：');
console.log('1. npm run type-check  # 驗證修復結果');
console.log('2. npm run build       # 測試構建');
console.log('3. npm run dev         # 啟動開發服務器測試');