import type { NextConfig } from "next";

// 教學生態系感知蓝图 - Next.js 配置
const nextConfig: NextConfig = {
  // 針對 Netlify 部署優化（移除 output: 'export' 以支援中間件）
  trailingSlash: true,
  
  // 伺服器外部套件：確保 Supabase 在 Netlify 上正常運行
  serverExternalPackages: [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/realtime-js'
  ],
  
  // Webpack 配置：處理 Supabase 模組兼容性
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // 客戶端：排除 Node.js 特定模組
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  
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
    ignoreBuildErrors: true,
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
