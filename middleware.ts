// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    // 添加调试日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🛡️ Middleware检查:', {
        path: req.nextUrl.pathname,
        hasSession: !!session,
        sessionError: error,
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
    }

    // 需要认证的路由列表
    const protectedRoutes = [
      '/dashboard',
      '/constellation', 
      '/my-constellation',
      '/studio',
      '/admin',
      '/discussions'
    ];

    // 检查当前路径是否需要认证
    const requiresAuth = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // 如果没有找到受保护的路由，直接通过
    if (!requiresAuth) {
      return res;
    }

    // 对于需要认证的路由，检查session
    if (!session) {
      console.log('🚫 Middleware: 无session，重定向到登录页面:', req.nextUrl.pathname);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 对于守护者测试账号，添加特殊处理
    if (session.user?.email === 'guardian.test@voyager.com') {
      console.log('🛡️ Middleware: 检测到守护者测试账号，允许访问');
    }

  } catch (middlewareError) {
    console.error('❌ Middleware错误:', middlewareError);
    // 在出错时，对于受保护路由重定向到登录页面
    const protectedRoutes = ['/dashboard', '/constellation', '/my-constellation', '/studio', '/admin', '/discussions'];
    const requiresAuth = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));
    
    if (requiresAuth) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * - /login (login page)
     * - /auth/callback (auth callback route)
     * - / (home page)
     * - /api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|auth/callback|api|$).*)'
  ],
};
