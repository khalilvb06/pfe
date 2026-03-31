import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/hooks/use-chat-state";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 animate-fade-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ animationDelay: "0.05s" }}
    >
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold
          ${isUser ? "bg-primary text-primary-foreground" : "bg-gold-light text-accent-foreground"}
        `}
      >
        {isUser ? "أ" : "⚖️"}
      </div>

      {/* Bubble */}
      <div className={`group relative max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? "bg-chat-user text-primary-foreground rounded-tr-sm"
              : "bg-chat-bot text-card-foreground shadow-sm border border-border rounded-tl-sm"
            }
          `}
        >
          {message.content.split("\n").map((line, i) => {
            // Simple bold markdown
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <span key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
                {i < message.content.split("\n").length - 1 && <br />}
              </span>
            );
          })}
        </div>

        {/* Copy button for bot messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 start-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>نسخ</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm bg-gold-light text-accent-foreground">
        ⚖️
      </div>
      <div className="bg-chat-bot shadow-sm border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
