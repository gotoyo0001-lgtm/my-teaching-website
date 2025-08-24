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

  const { data: { session } } = await supabase.auth.getSession();

  // 如果用戶沒有會話且嘗試訪問受保護的路由，則重定向到登入頁面
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
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
     * - Any other public routes you want to exclude from authentication check
     */
    
    // 匹配所有路徑，除了以下例外
    
    // 排除 Next.js 內部路徑
    '/((?!_next/static|_next/image|favicon.ico).*)/',
    
    // 排除登入和認證回調路徑
    '/((?!login|auth/callback).*)/',
    
    // 確保只匹配需要保護的路徑，例如 /dashboard
    // 這裡的邏輯是，如果路徑以 /dashboard 開頭，則應用中間件
    // 但上面的排除規則會優先執行，所以實際上是保護 /dashboard 且不重定向 /login
    // 更精確的寫法是只包含需要保護的路徑，並在中間件內部處理重定向
    // 例如：'/dashboard/:path*'
  ],
};
