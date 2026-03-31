import { useState, useRef } from "react";
import { Send, Paperclip, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <div className="border border-border bg-card rounded-2xl shadow-sm flex items-end gap-2 p-2 transition-shadow focus-within:shadow-md focus-within:border-primary/30">
      {/* Attachment button */}
      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted" title="رفع ملف">
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="اكتب سؤالك القانوني هنا..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed py-2 px-1 max-h-40 placeholder:text-muted-foreground"
        dir="rtl"
      />

      {/* Voice button */}
      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted" title="إدخال صوتي">
        <Mic className="w-5 h-5" />
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        title="إرسال"
      >
        <Send className="w-5 h-5 rotate-180" />
      </button>
    </div>
  );
}
