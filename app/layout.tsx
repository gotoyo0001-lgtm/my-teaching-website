// app/layout.tsx - 教学生态系感知蓝图根布局
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Voyager Universe - 遥行者宇宙",
  description: "一个充满诗意的知识宇宙，在这里每个学习者都是遥行者，每份知识都是星辰",
  keywords: ["学习", "教育", "知识分享", "在线课程", "遥行者"],
  authors: [{ name: "Voyager Universe Team" }],
  openGraph: {
    title: "Voyager Universe - 遥行者宇宙",
    description: "探索浩瀚的知识星海，点亮属于你的星座",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} bg-cosmic-void text-cosmic-light min-h-screen`}>
        <AuthProvider>
          <div className="relative min-h-screen overflow-hidden">
            {/* 宇宙背景效果 */}
            <div className="fixed inset-0 bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
              {/* 星辰效果 */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cosmic-star rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-cosmic-star rounded-full animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-cosmic-star rounded-full animate-pulse delay-2000"></div>
                <div className="absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-cosmic-star rounded-full animate-pulse delay-3000"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cosmic-star rounded-full animate-pulse delay-4000"></div>
              </div>
            </div>
            
            {/* 主要内容 */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}