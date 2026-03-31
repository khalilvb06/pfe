import { useState } from "react";
import { MessageSquarePlus, Settings, Info, Trash2, MessageCircle, PanelRightClose, PanelRightOpen } from "lucide-react";
import type { Conversation } from "@/hooks/use-chat-state";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Toggle button when collapsed on mobile */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed top-3 right-3 z-40 md:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
        >
          <PanelRightOpen className="w-5 h-5" />
        </button>
      )}

      <aside
        className={`
          fixed md:relative z-40 top-0 right-0 h-full
          bg-sidebar text-sidebar-foreground
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-0 md:w-16 overflow-hidden" : "w-72"}
          border-l border-sidebar-border
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              <h1 className="text-lg font-bold text-gold">القسطاس</h1>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-hover transition-colors"
          >
            {collapsed ? (
              <PanelRightOpen className="w-5 h-5" />
            ) : (
              <PanelRightClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* New conversation button */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-2 justify-center p-2.5 rounded-lg border border-sidebar-border hover:bg-sidebar-hover transition-colors text-sm font-medium"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {!collapsed && <span>محادثة جديدة</span>}
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`
                group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors text-sm
                ${conv.id === activeConversationId ? "bg-sidebar-active" : "hover:bg-sidebar-hover"}
              `}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-sidebar-border transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-sidebar-border space-y-1">
            <button className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-sidebar-hover transition-colors text-sm">
              <Settings className="w-4 h-4" />
              <span>الإعدادات</span>
            </button>
            <button className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-sidebar-hover transition-colors text-sm">
              <Info className="w-4 h-4" />
              <span>حول التطبيق</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
