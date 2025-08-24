#!/usr/bin/env node
// scripts/fix-typescript-errors.js
// 自動修復 Supabase 2.56.0 更新後的 TypeScript 類型錯誤

const fs = require('fs');
const path = require('path');

// 需要修復的文件列表
const filesToFix = [
  'app/admin/analytics/page.tsx',
  'app/admin/categories/page.tsx', 
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

function addDatabaseImport(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // 檢查是否已經導入了 Database 類型
  if (content.includes("type { Database }")) {
    console.log(`已存在 Database 導入: ${filePath}`);
    return;
  }
  
  // 在 'use client' 後添加導入
  if (content.includes("'use client';")) {
    content = content.replace(
      "'use client';",
      "'use client';\n\nimport type { Database } from '@/lib/database.types';"
    );
  } else {
    // 在第一個導入前添加
    const importMatch = content.match(/^import\s/m);
    if (importMatch) {
      const importIndex = content.indexOf(importMatch[0]);
      content = content.slice(0, importIndex) + 
                "import type { Database } from '@/lib/database.types';\n" + 
                content.slice(importIndex);
    } else {
      // 在文件開頭添加
      content = "import type { Database } from '@/lib/database.types';\n\n" + content;
    }
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ 已添加 Database 導入: ${filePath}`);
}

// 修復所有文件
console.log('🔧 開始修復 TypeScript 類型錯誤...\n');

filesToFix.forEach(addDatabaseImport);

console.log('\n✅ 類型修復完成！');
console.log('\n📝 下一步需要手動修復的問題：');
console.log('1. 在每個 Supabase 查詢中添加明確的類型註解');
console.log('2. 使用 Database[\'public\'][\'Tables\'][tableName][\'Insert\'] 等類型');
console.log('3. 運行 npm run type-check 驗證修復結果');