"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/components/auth/AuthProvider";

function LoginContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/evento");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-triart-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-triart-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-triart-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-dark rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-triart-green rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Triart
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Estandes e Eventos
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Triart Estandes e Eventos
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
