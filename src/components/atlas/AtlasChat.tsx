"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatMessage } from "@/app/api/atlas/route";
import dynamic from "next/dynamic";
import { MessageBubble } from "./MessageBubble";
const SuggestedPrompts = dynamic(() => import("./SuggestedPrompts").then(m => ({ default: m.SuggestedPrompts })), { ssr: false });
import { Send, Square, Sparkles, Zap, Globe, TrendingUp, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Floating orb for empty state background
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { x: "20%", y: "25%", size: 180, color: "#7c6af7", delay: "0s" },
        { x: "75%", y: "35%", size: 140, color: "#00d2e6", delay: "1.5s" },
        { x: "45%", y: "70%", size: 120, color: "#00e5a0", delay: "0.8s" },
        { x: "85%", y: "70%", size: 100, color: "#f5c518", delay: "2.2s" },
        { x: "10%", y: "65%", size: 90,  color: "#ff6b6b", delay: "1.1s" },
      ].map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl opacity-[0.07] animate-pulse"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            animationDuration: `${3 + i * 0.7}s`,
            animationDelay: orb.delay,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

const CAPABILITY_CARDS = [
  { icon: Globe,       color: "#7c6af7", text: "Analyze any narrative or token — whale signals, thesis, and risk flags" },
  { icon: TrendingUp,  color: "#00e5a0", text: "Find yield opportunities and assess risk across crypto protocols" },
  { icon: Zap,         color: "#f5c518", text: "Explain crypto × AI intersections — which AI news moves which tokens" },
  { icon: Sparkles,    color: "#00d2e6", text: "Review your trade decisions and build your Decision Quality Score" },
];

function AtlasChatInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didAutoSendRef = useRef(false);

  // Abort any in-flight stream on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // Auto-send pre-filled question from ?q= param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !didAutoSendRef.current) {
      didAutoSendRef.current = true;
      setTimeout(() => send(q), 400);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);
      setStreamingText("");

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const res = await fetch("/api/atlas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
          signal: abort.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "API error");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) { accumulated += parsed.text; setStreamingText(accumulated); }
            } catch {}
          }
        }

        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again in a moment." },
        ]);
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        abortRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const stop = () => abortRef.current?.abort();

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isEmpty = messages.length === 0 && !isStreaming && !streamingText;

  return (
    <div className={cn("flex flex-col h-full transition-all duration-300", expanded && "bg-[#0d0e12]")}>
      {/* Expand toggle + New Chat */}
      <div className="flex items-center justify-between px-4 pt-2 pb-0 pointer-events-none">
        <div className="pointer-events-auto">
          {!isEmpty && (
            <button
              onClick={() => { setMessages([]); setInput(""); setStreamingText(""); }}
              title="New chat"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all text-[#484f58] hover:text-[#e6edf3] hover:bg-white/[0.04]"
            >
              <RotateCcw size={10} />
              NEW CHAT
            </button>
          )}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? "Collapse" : "Expand (⤢)"}
          className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all text-[#484f58] hover:text-[#e6edf3] hover:bg-white/[0.04]"
        >
          {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          {expanded ? "COLLAPSE" : "EXPAND"}
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto relative">
        {isEmpty ? (
          <div className="relative flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <FloatingOrbs />

            <div className="relative z-10 flex flex-col items-center">
              {/* Atlas avatar with glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 scale-110" style={{ backgroundColor: "#00d2e6" }} />
                <div className="relative w-16 h-16 rounded-2xl bg-[#00d2e615] border border-[#00d2e630] flex items-center justify-center">
                  <Sparkles size={28} className="text-[#00d2e6]" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                Ask Atlas anything.
              </h2>
              <p className="text-sm text-[#6b6b80] max-w-sm leading-relaxed mb-8" suppressHydrationWarning>
                Your intelligence layer for crypto and AI. Signals, narratives, trades, yield — ask anything.
              </p>

              {/* Capability cards */}
              <div className="grid grid-cols-2 gap-2 mb-8 w-full max-w-md">
                {CAPABILITY_CARDS.map(({ icon: Icon, color, text }) => (
                  <div
                    key={text}
                    className="flex items-start gap-2.5 p-3 rounded-xl border text-left cursor-default transition-all duration-150"
                    style={{ borderColor: "#21262d", background: "#161b2208" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = color + "50";
                      (e.currentTarget as HTMLElement).style.background = color + "08";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#21262d";
                      (e.currentTarget as HTMLElement).style.background = "#161b2208";
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: color + "20", color }}
                    >
                      <Icon size={12} />
                    </div>
                    <p className="text-[11px] text-[#6b6b80] leading-snug" suppressHydrationWarning>{text}</p>
                  </div>
                ))}
              </div>

              <SuggestedPrompts onSelect={send} />
            </div>
          </div>
        ) : (
          <div className={cn("mx-auto px-4 py-6 space-y-6 transition-all duration-300", expanded ? "max-w-5xl" : "max-w-3xl")}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isStreaming && (
              <MessageBubble
                message={{ role: "assistant", content: streamingText }}
                isStreaming={true}
              />
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t px-4 py-4" style={{ borderColor: "#21262d", background: "#0d0e12f0", backdropFilter: "blur(8px)" }}>
        <div className={cn("mx-auto transition-all duration-300", expanded ? "max-w-5xl" : "max-w-3xl")}>
          {messages.length > 0 && !isStreaming && (
            <div className="mb-3">
              <SuggestedPrompts onSelect={send} compact />
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask Atlas anything about crypto or AI..."
                rows={1}
                disabled={isStreaming}
                className={cn(
                  "w-full resize-none rounded-xl px-4 py-3 pr-4 text-sm text-white placeholder-[#484f58]",
                  "outline-none transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{ background: "#161b22", border: "1px solid #30363d" }}
                onFocus={(e) => (e.target.style.borderColor = "#00d2e640")}
                onBlur={(e) => (e.target.style.borderColor = "#30363d")}
              />
            </div>

            {isStreaming ? (
              <button
                onClick={stop}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#ff6b6b20] border border-[#ff6b6b30] text-[#ff6b6b] hover:bg-[#ff6b6b30] transition-colors"
                title="Stop generating"
              >
                <Square size={14} fill="#ff6b6b" />
              </button>
            ) : (
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className={cn(
                  "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all",
                  input.trim()
                    ? "bg-[#00d2e6] text-[#0b0b0f] hover:bg-[#00bdd0] shadow-[0_0_20px_rgba(0,210,230,0.3)]"
                    : "bg-white/[0.05] text-[#4a4a5a] cursor-not-allowed"
                )}
                title="Send"
              >
                <Send size={14} />
              </button>
            )}
          </div>

          <p className="text-[10px] text-[#4a4a5a] text-center mt-2">
            Atlas provides information, not financial advice. Always DYOR.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AtlasChat() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#3a3a55] text-sm">Loading Atlas...</div>}>
      <AtlasChatInner />
    </Suspense>
  );
}
