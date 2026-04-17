"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting in production
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 text-center gap-5">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "#f8514918", border: "1px solid #f8514930" }}
      >
        <AlertTriangle size={20} className="text-[#f85149]" />
      </div>

      <div>
        <h2
          className="text-[16px] font-bold text-[#e6edf3] mb-1"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          Something went wrong
        </h2>
        <p className="text-[12px] text-[#6e7681] max-w-xs leading-relaxed">
          An unexpected error occurred. Your data is safe — try refreshing.
        </p>
        {error.digest && (
          <p className="text-[10px] text-[#484f58] mt-1 font-mono">ref: {error.digest}</p>
        )}
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:opacity-90"
        style={{ background: "#7c6af7", color: "#fff" }}
      >
        <RefreshCw size={13} />
        Try again
      </button>
    </div>
  );
}
