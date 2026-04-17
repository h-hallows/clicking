"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Radio, Globe, Bot, Zap, LayoutDashboard, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Radio,           color: "#00DCC8", label: "Signal Feed",  desc: "Whale moves, narratives, on-chain flow"  },
  { icon: Globe,           color: "#7c6af7", label: "The Scope",    desc: "Visual narrative ecosystem map"          },
  { icon: Bot,             color: "#a78bfa", label: "Atlas AI",     desc: "Intelligence at the crypto × AI cross"   },
  { icon: Zap,             color: "#fbbf24", label: "The Yield",    desc: "See what your idle USDC could earn"      },
  { icon: LayoutDashboard, color: "#00d2e6", label: "Portfolio",    desc: "Health score + narrative alignment"      },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple, signUp, user, loading } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  // Redirect if already logged in (wait for hydration)
  useEffect(() => {
    if (hydrated && user) router.push("/feed");
  }, [hydrated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    try {
      if (mode === "signup") await signUp(name, email, password);
      else await signIn(email, password);
      router.push("/feed");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogle = async () => {
    setError("");
    await signInWithGoogle();
    router.push("/feed");
  };

  const handleApple = async () => {
    setError("");
    await signInWithApple();
    router.push("/feed");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0d0e12" }}>
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {[
            { x: "20%", y: "30%", s: 500, c: "#7c6af7" },
            { x: "75%", y: "60%", s: 400, c: "#00d2e6" },
            { x: "40%", y: "75%", s: 350, c: "#00e5a0" },
          ].map((o, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-[100px] animate-pulse"
              style={{
                left: o.x, top: o.y,
                width: o.s, height: o.s,
                backgroundColor: o.c,
                opacity: 0.06,
                transform: "translate(-50%, -50%)",
                animationDuration: `${4 + i}s`,
              }}
            />
          ))}
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="text-[17px] font-black tracking-[0.12em] text-[#e6edf3] uppercase"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Clicking
            </span>
          </Link>

          {/* Main text */}
          <div className="flex-1 flex flex-col justify-center">
            <h2
              className="text-[40px] font-black leading-[1.1] tracking-[-0.03em] text-[#e6edf3] mb-4"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Your edge in
              <br />
              <span style={{
                background: "linear-gradient(135deg, #7c6af7, #00d2e6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Crypto + AI.
              </span>
            </h2>
            <p className="text-[14px] text-[#6e7681] leading-relaxed mb-10 max-w-sm">
              One account. Ten powerful tools for signals, narratives, AI intelligence, and yield — everything the modern crypto investor needs.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: f.color + "18", color: f.color }}
                    >
                      <Icon size={13} />
                    </div>
                    <div>
                      <span className="text-[12px] font-bold text-[#e6edf3]">{f.label}</span>
                      <span className="text-[12px] text-[#6e7681]"> — {f.desc}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-[#484f58]" suppressHydrationWarning>© {new Date().getFullYear()} Clicking. Not financial advice.</p>
        </div>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] transition-colors text-[12px]">
            <ArrowLeft size={13} />
            Back
          </Link>
        </div>

        {/* Divider (desktop only) */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-[#21262d]" />

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-7">
            <h1
              className="text-[24px] font-black text-[#e6edf3] mb-1.5"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              {mode === "signin" ? "Welcome back." : "Create your account."}
            </h1>
            <p className="text-[13px] text-[#6e7681]">
              {mode === "signin"
                ? "Sign in to access your Clicking suite."
                : "Start exploring crypto + AI with Clicking."}
            </p>
          </div>

          {/* Social buttons */}
          <div className="space-y-2.5 mb-5">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#30363d] bg-[#161b22] text-[13px] font-semibold text-[#e6edf3] hover:bg-[#21262d] hover:border-[#484f58] transition-all duration-[80ms] disabled:opacity-50"
            >
              {/* Google icon */}
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleApple}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#30363d] bg-[#161b22] text-[13px] font-semibold text-[#e6edf3] hover:bg-[#21262d] hover:border-[#484f58] transition-all duration-[80ms] disabled:opacity-50"
            >
              {/* Apple icon */}
              <svg width="14" height="15" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.8 0 303.8 0 202.2 0 91.2 59.9 5.2 163.2 5.2c53.1 0 97.2 34.5 132.5 34.5 33.8 0 87-36.9 152.5-36.9 24.6 0 108.2 2.6 168.9 80.6zm-107.4-98.6c-7.7 36.2-28.5 70.7-54.4 94.9-29.3 27-59.7 46.1-94.4 46.1-4.5 0-9-.6-13.5-1.3-.3-4.5-.6-9-.6-14.2 0-34.5 16.6-70.1 42.5-94.3 26.8-24.8 72.7-43.2 109.8-43.8 1.6 4.5 2.5 9 2.5 12.6z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#21262d]" />
            <span className="text-[11px] text-[#484f58] font-medium">or</span>
            <div className="flex-1 h-px bg-[#21262d]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#30363d] bg-[#161b22] text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors duration-[80ms]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#30363d] bg-[#161b22] text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors duration-[80ms]"
            />

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#30363d] bg-[#161b22] text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c6af7]/50 transition-colors duration-[80ms]"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {mode === "signin" && (
              <div className="text-right">
                {forgotSent ? (
                  <span className="text-[11px] text-[#3fb950]">Reset link sent — check your inbox.</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { if (email) setForgotSent(true); else setError("Enter your email first."); }}
                    className="text-[11px] text-[#6e7681] hover:text-[#e6edf3] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-[11px] text-[#f85149] bg-[#f8514915] border border-[#f8514925] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all duration-[80ms]",
                "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{ background: "linear-gradient(135deg, #7c6af7, #6a5ae0)" }}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-[12px] text-[#6e7681] mt-5">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-[#7c6af7] hover:text-[#a78bfa] font-semibold transition-colors"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-[10px] text-[#484f58] mt-4 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br />No financial advice is provided.
          </p>
        </div>
      </div>
    </div>
  );
}
