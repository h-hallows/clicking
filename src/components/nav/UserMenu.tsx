"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

export function UserMenu() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#30363d] text-[11px] font-semibold text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-white/[0.04] transition-all duration-[80ms]"
      >
        <User size={12} />
        Sign In
      </Link>
    );
  }

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#7c6af7", "#00d2e6", "#00e5a0", "#fbbf24", "#a78bfa"];
  const avatarColor = colors[user.id.charCodeAt(user.id.length - 1) % colors.length];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#161b22] transition-all duration-[80ms] group"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <span className="text-[11px] font-semibold text-[#8b949e] group-hover:text-[#e6edf3] transition-colors hidden sm:block max-w-[80px] truncate">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown size={11} className="text-[#484f58] hidden sm:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[#30363d] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50"
            style={{ background: "#161b22" }}
          >
            {/* User info */}
            <div className="px-3.5 py-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#e6edf3] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#484f58] truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all duration-[60ms]"
              >
                <User size={13} />
                Profile & Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all duration-[60ms]"
              >
                <Settings size={13} />
                Settings
              </Link>
            </div>

            <div className="border-t border-[#21262d] py-1">
              <button
                onClick={() => { signOut(); setOpen(false); router.push("/"); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-[#f85149] hover:bg-[#f8514910] transition-all duration-[60ms] text-left"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
