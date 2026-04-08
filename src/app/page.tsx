"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (cancelled) return;
        if (res.ok) {
          router.replace("/evento");
        } else {
          router.replace("/login");
        }
      } catch {
        if (!cancelled) router.replace("/login");
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-triart-bg">
      <div className="w-8 h-8 border-2 border-triart-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
