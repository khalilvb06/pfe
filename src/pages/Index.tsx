import { useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { MessageBubble, TypingIndicator } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChatState } from "@/hooks/use-chat-state";

const Index = () => {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    setActiveConversationId,
    createConversation,
    sendMessage,
    deleteConversation,
  } = useChatState();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isTyping]);

  const hasMessages = activeConversation && activeConversation.messages.length > 0;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={createConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <span className="font-semibold text-sm">القسطاس</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">القانون الجزائري</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {!hasMessages ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <SuggestedQuestions onSelect={sendMessage} />
              </div>
            ) : (
              <div className="space-y-6">
                {activeConversation.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <ChatInput onSend={sendMessage} disabled={isTyping} />
            <p className="text-center text-xs text-muted-foreground mt-2">
              هذه الإجابات لأغراض معلوماتية فقط ولا تغني عن استشارة محامٍ.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
