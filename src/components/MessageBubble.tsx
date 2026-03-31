import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/hooks/use-chat-state";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className={`group relative max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? "bg-chat-user text-primary-foreground rounded-tr-sm"
              : "bg-chat-bot text-card-foreground shadow-sm border border-border rounded-tl-sm"
            }
          `}
        >
          <div className={`markdown-content ${isUser ? "text-primary-foreground" : "text-card-foreground"}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              <p className="w-full text-xs text-muted-foreground font-medium mb-1">المصادر القانونية:</p>
              {message.sources.map((source, i) => (
                <div 
                  key={i}
                  className="bg-gold-light/20 hover:bg-gold-light/30 border border-gold/20 rounded-md px-2 py-1 text-[11px] text-foreground flex items-center gap-1.5 transition-colors cursor-default"
                  title={`${source.title}: ${source.payload?.content || source.payload?.text}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <span className="font-medium">المادة {source.article}</span>
                </div>
              ))}
            </div>
          )}
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
