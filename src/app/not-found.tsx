import Link from "next/link";
import { Home, ArrowLeft, Globe } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0d0e12" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
        {/* Code */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="text-[72px] font-black leading-none tabular-nums"
            style={{
              background: "linear-gradient(135deg, #7c6af7 0%, #00d2e6 60%, #00e5a0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            404
          </div>
        </div>

        <div>
          <h1
            className="text-[22px] font-black text-[#e6edf3] mb-2"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Signal not found.
          </h1>
          <p className="text-[13px] text-[#6e7681] leading-relaxed">
            This page doesn&apos;t exist or may have moved. Head back to the feed — opportunities are live.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/feed"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #7c6af7, #6a5ae0)" }}
          >
            <Home size={14} />
            Go to Feed
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-[#161b22] transition-all"
          >
            <ArrowLeft size={13} />
            Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-4 pt-2">
          {[
            { href: "/scope",  label: "Scope",  color: "#7c6af7" },
            { href: "/atlas",  label: "Atlas",  color: "#a78bfa" },
            { href: "/yield",  label: "Yield",  color: "#fbbf24" },
            { href: "/scan",   label: "Scan",   color: "#00DCC8" },
          ].map(({ href, label, color }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] font-semibold transition-opacity hover:opacity-80"
              style={{ color }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
