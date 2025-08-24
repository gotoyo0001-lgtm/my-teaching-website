// src/app/dashboard/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase-server";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
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
