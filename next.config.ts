import type { NextConfig } from "next";

// 教學生態系感知蓝图 - Next.js Jamstack 配置
const nextConfig: NextConfig = {
  // 靜態輸出配置 (適用於 Netlify)
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // 圖片優化配置
  images: {
    unoptimized: true, // Netlify 自動圖片優化
    domains: [
      'imidprdspztfqabdzqrr.supabase.co', // Supabase Storage
      'via.placeholder.com', // 佔位圖片
    ],
  },
  
  // 環境變數配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack 配置優化
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // SVG 支援
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },
  
  // TypeScript 配置
  typescript: {
    // 在生產建置時忽略 TypeScript 錯誤
    ignoreBuildErrors: false,
  },
  
  // ESLint 配置
  eslint: {
    // 在生產建置時忽略 ESLint 錯誤
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
