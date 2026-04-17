"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0d0e12", display: "flex", minHeight: "100vh", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", gap: "20px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: "#f8514918", border: "1px solid #f8514930", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={20} color="#f85149" />
          </div>

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#e6edf3", margin: "0 0 4px" }}>
              Critical error
            </h2>
            <p style={{ fontSize: 12, color: "#6e7681", margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
              Clicking encountered a fatal error. Refresh to restart, or go home.
            </p>
            {error.digest && (
              <p style={{ fontSize: 10, color: "#484f58", marginTop: 4, fontFamily: "monospace" }}>ref: {error.digest}</p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={reset}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, background: "#7c6af7", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            >
              <RefreshCw size={13} />
              Retry
            </button>
            <a
              href="/"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, background: "transparent", color: "#8b949e", border: "1px solid #30363d", cursor: "pointer", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
            >
              <Home size={13} />
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
