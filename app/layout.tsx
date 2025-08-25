// app/layout.tsx - 教学生态系感知蓝图根布局
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";

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
            {/* 简化的宇宙背景效果 */}
            <div className="fixed inset-0 bg-gradient-to-b from-cosmic-void via-cosmic-deep to-cosmic-void">
              {/* 简化的星辰效果 - 减少动画 */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cosmic-star rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-cosmic-star rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-cosmic-star rounded-full"></div>
                <div className="absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-cosmic-star rounded-full"></div>
              </div>
            </div>
            
            {/* 主要内容 */}
            <div className="relative z-10">
              <Navigation />
              <main className="pt-16">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}