// src/app/dashboard/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user ? (
        <>
          <p className="mb-6">歡迎，{user.email}</p>
          <SignOutButton />
        </>
      ) : (
        <p>尚未登入</p>
      )}
    </main>
  );
}
