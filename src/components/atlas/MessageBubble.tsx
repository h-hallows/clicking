"use client";

import { useState, useEffect } from "react";
import { ChatMessage } from "@/app/api/atlas/route";
import { Bot, User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn("flex gap-3 group", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser ? "bg-[#7c6af720] text-[#7c6af7]" : "bg-[#00d2e620] text-[#00d2e6]"
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className="max-w-[85%] relative">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm text-[#e6edf3]"
              : "rounded-tl-sm text-[#c9d1d9]"
          )}
          style={isUser
            ? { background: "#7c6af718", border: "1px solid #7c6af730" }
            : { background: "#161b22", border: "1px solid #21262d" }
          }
        >
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#00d2e6] opacity-60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
                />
              ))}
            </div>
          ) : (
            <MarkdownText text={message.content} isStreaming={isStreaming && !!message.content} />
          )}
        </div>

        {/* Copy button — only for assistant messages with content */}
        {!isUser && message.content && !isStreaming && (
          <button
            onClick={handleCopy}
            className={cn(
              "absolute -bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all opacity-0 group-hover:opacity-100",
              copied
                ? "bg-[#3fb95020] text-[#3fb950] border border-[#3fb95030]"
                : "text-[#6e7681] hover:text-[#e6edf3]"
            )}
            style={!copied ? { background: "#21262d", border: "1px solid #30363d" } : undefined}
          >
            {copied ? <Check size={9} /> : <Copy size={9} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function StreamingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      className="inline-block w-[2px] h-[1em] align-middle ml-0.5 rounded-sm"
      style={{ background: "#00d2e6", opacity: visible ? 1 : 0, transition: "opacity 0.1s" }}
    />
  );
}

// ─── Segment types ───────────────────────────────────────────────────────────
type LineSegment = { type: "lines"; items: Array<{ line: string; idx: number }> };
type CodeSegment = { type: "code"; lang: string; code: string; idx: number };
type Segment = LineSegment | CodeSegment;

function buildSegments(lines: string[]): Segment[] {
  const segments: Segment[] = [];
  let lineAccum: Array<{ line: string; idx: number }> = [];

  const flushLines = () => {
    if (lineAccum.length > 0) {
      segments.push({ type: "lines", items: lineAccum });
      lineAccum = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushLines();
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      // i now points at closing fence (or past end if unclosed during streaming)
      segments.push({ type: "code", lang, code: codeLines.join("\n"), idx: i });
    } else {
      lineAccum.push({ line, idx: i });
    }
    i++;
  }

  flushLines();
  return segments;
}

// ─── Code block renderer ─────────────────────────────────────────────────────
function CodeBlock({
  lang,
  code,
  isLastAndStreaming,
}: {
  lang: string;
  code: string;
  isLastAndStreaming?: boolean;
}) {
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1800);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] my-2.5 text-[12px]">
      {/* header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0d0e12] border-b border-[#21262d]">
        <span className="font-mono font-semibold text-[10px] text-[#6e7681] uppercase tracking-widest select-none">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 text-[10px] font-medium transition-all duration-150 px-2 py-0.5 rounded-md",
            codeCopied
              ? "text-[#3fb950] bg-[#3fb95015]"
              : "text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d]"
          )}
        >
          {codeCopied ? <Check size={9} /> : <Copy size={9} />}
          {codeCopied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* code body */}
      <pre className="p-4 overflow-x-auto bg-[#0d1117] leading-relaxed font-mono text-[#e6edf3] whitespace-pre">
        <code>
          {code}
          {isLastAndStreaming && <StreamingCursor />}
        </code>
      </pre>
    </div>
  );
}

// ─── Main markdown renderer ───────────────────────────────────────────────────
function MarkdownText({ text, isStreaming }: { text: string; isStreaming?: boolean }) {
  if (!text) return null;
  const lines = text.split("\n");
  const segments = buildSegments(lines);
  const lastSegIdx = segments.length - 1;

  return (
    <div className="space-y-1.5">
      {segments.map((seg, si) => {
        const isLastSeg = si === lastSegIdx;

        if (seg.type === "code") {
          return (
            <CodeBlock
              key={seg.idx}
              lang={seg.lang}
              code={seg.code}
              isLastAndStreaming={isLastSeg && isStreaming}
            />
          );
        }

        // lines segment
        return seg.items.map(({ line, idx }, li) => {
          const isLastLine = isLastSeg && li === seg.items.length - 1;

          if (line.startsWith("# ")) {
            return (
              <p key={idx} className="font-black text-white text-[17px] mt-4 first:mt-0">
                {renderInline(line.slice(2))}
              </p>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <p key={idx} className="font-bold text-white text-[15px] mt-3 first:mt-0">
                {renderInline(line.slice(3))}
              </p>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <p key={idx} className="font-semibold text-white mt-2 first:mt-0">
                {renderInline(line.slice(4))}
              </p>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <div key={idx} className="flex gap-2">
                <span className="text-[#00d2e6] mt-0.5 flex-shrink-0">•</span>
                <span>{renderInline(line.slice(2))}</span>
              </div>
            );
          }
          const numMatch = line.match(/^(\d+)\.\s(.+)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex gap-2">
                <span className="text-[#00d2e6] flex-shrink-0 font-semibold">{numMatch[1]}.</span>
                <span>{renderInline(numMatch[2])}</span>
              </div>
            );
          }
          if (line.startsWith("> ")) {
            return (
              <div
                key={idx}
                className="border-l-2 pl-3 py-0.5 my-1"
                style={{ borderColor: "#00d2e640" }}
              >
                <p className="text-[#8b949e] italic">{renderInline(line.slice(2))}</p>
              </div>
            );
          }
          if (line.startsWith("---")) return <hr key={idx} className="border-[#21262d] my-2" />;
          if (!line.trim()) return <div key={idx} className="h-1" />;
          return (
            <p key={idx}>
              {renderInline(line)}
              {isLastLine && isStreaming && <StreamingCursor />}
            </p>
          );
        });
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-[#a0a0b8]">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/[0.08] text-[#00d2e6]">
          {part.slice(1, -1)}
        </code>
      );
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch)
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00d2e6] underline underline-offset-2 hover:text-[#00bdd0] transition-colors duration-[80ms]"
        >
          {linkMatch[1]}
        </a>
      );
    return part;
  });
}
