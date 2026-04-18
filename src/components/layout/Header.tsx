"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName?: string | null;
  isAdmin?: boolean;
}

export function Header({ userName, isAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#FEFCF8] border-b border-[#e8ddd5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-xl font-light tracking-widest text-[#6B4F3A]">
              Living Me
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-[#C07052] text-[#C07052] hover:bg-[#C07052] hover:text-white"
                >
                  管理画面
                </Button>
              </Link>
            )}
            <span className="hidden sm:block text-sm text-[#9a8070]">
              {userName ?? "メンバー"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[#9a8070] hover:text-[#6B4F3A]"
            >
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
