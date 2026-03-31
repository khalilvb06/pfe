import { useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { MessageBubble, TypingIndicator } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChatState } from "@/hooks/use-chat-state";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const { profile, signOut } = useAuth();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    loading,
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

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={createConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="القسطاس" className="w-6 h-6 object-contain" />
            <span className="font-semibold text-sm">القسطاس</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">القانون الجزائري</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{profile?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
