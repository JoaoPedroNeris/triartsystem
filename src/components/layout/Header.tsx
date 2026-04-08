"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-black/5">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-[1920px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-triart-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold text-triart-black leading-tight">Triart</h1>
            <p className="text-[11px] text-triart-gray leading-tight">Estandes e Eventos</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-triart-gray-light transition-apple cursor-pointer outline-none">
              <div className="w-7 h-7 bg-triart-green/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-triart-green" />
              </div>
              <span className="hidden md:block text-sm font-medium text-triart-black">
                {user?.name || user?.email?.split("@")[0] || "Usuario"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
              <div className="px-2 py-1.5 text-xs text-triart-gray">{user?.email}</div>
              {user?.role && (
                <div className="px-2 py-1 text-xs text-triart-gray capitalize">{user.role}</div>
              )}
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
