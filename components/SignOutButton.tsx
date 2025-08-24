// src/components/SignOutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh(); // 刷新頁面以更新會話狀態
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      登出
    </button>
  );
}
