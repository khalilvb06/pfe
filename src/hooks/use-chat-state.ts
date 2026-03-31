import { useState, useCallback, useEffect } from "react";
import { getRAGResponse, RAGResponse } from "@/lib/rag-client";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  sources?: Array<{
    article: string;
    title: string;
    score: number;
    payload: Record<string, any>;
  }>;
}

export interface Conversation {
  id: string; // This will correspond to DB id
  title: string;
  messages: Message[];
  createdAt: Date;
}

export function useChatState() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch conversations from Supabase
  useEffect(() => {
    const fetchConversations = async () => {
      if (!profile) {
        setConversations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chats")
          .select("*")
          .eq("profile_id", profile.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        const formattedConvs: Conversation[] = (data || []).map((chat) => ({
          id: chat.id,
          title: chat.conversation.title,
          messages: chat.conversation.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
          createdAt: new Date(chat.created_at),
        }));

        setConversations(formattedConvs);
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("فشل في تحميل المحادثات");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [profile]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createConversation = async () => {
    if (!profile) return null;

    const tempId = crypto.randomUUID();
    const newConv: Conversation = {
      id: tempId,
      title: "محادثة جديدة",
      messages: [],
      createdAt: new Date(),
    };

    try {
      const { data, error } = await supabase
        .from("chats")
        .insert([
          {
            profile_id: profile.id,
            conversation: {
              title: newConv.title,
              messages: [],
            },
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const createdConv: Conversation = {
          ...newConv,
          id: data[0].id,
        };
        setConversations((prev) => [createdConv, ...prev]);
        setActiveConversationId(createdConv.id);
        return createdConv.id;
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("فشل في إنشاء محادثة جديدة");
    }
    return null;
  };

  const updateConversationInDB = async (conv: Conversation) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("chats")
        .update({
          conversation: {
            title: conv.title,
            messages: conv.messages,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", conv.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!profile) return;

    let convId = activeConversationId;
    let currentConv = conversations.find(c => c.id === convId);

    if (!convId || !currentConv) {
      convId = await createConversation();
      if (!convId) return;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    let updatedConv: Conversation | null = null;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const updated = { ...c, messages: [...c.messages, userMsg] };
        if (c.messages.length === 0) {
          updated.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
        }
        updatedConv = updated;
        return updated;
      })
    );

    // Save user message to DB immediately
    if (updatedConv) {
      await updateConversationInDB(updatedConv);
    }

    // Get bot response from RAG
    setIsTyping(true);
    try {
      const ragResponse: RAGResponse = await getRAGResponse(content);

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: ragResponse.answer,
        timestamp: new Date(),
        sources: ragResponse.sources,
      };

      let finalUpdatedConv: Conversation | null = null;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const updated = { ...c, messages: [...c.messages, botMsg] };
            finalUpdatedConv = updated;
            return updated;
          }
          return c;
        })
      );

      // Save bot response to DB
      if (finalUpdatedConv) {
        await updateConversationInDB(finalUpdatedConv);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.",
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, errorMsg] } : c
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [activeConversationId, conversations, profile]);

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      toast.success("تم حذف المحادثة");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("فشل في حذف المحادثة");
    }
  };

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    loading,
    setActiveConversationId,
    createConversation,
    sendMessage,
    deleteConversation,
  };
}
