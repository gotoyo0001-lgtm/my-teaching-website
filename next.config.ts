import type { NextConfig } from "next";

// 教學生態系感知蓝图 - Next.js 配置
const nextConfig: NextConfig = {
  // 針對 Netlify 部署優化（移除 output: 'export' 以支援中間件）
  trailingSlash: true,
  
  // 圖片優化配置
  images: {
    domains: [
      'imidprdspztfqabdzqrr.supabase.co', // Supabase Storage
      'via.placeholder.com', // 佔位圖片
    ],
  },
  
  // 環境變數配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
