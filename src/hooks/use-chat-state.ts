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

        const formattedConvs: Conversation[] = (data || []).map((chat) => {
          // Guard against null or malformed conversation data
          const conversationData = chat.conversation || { title: "محادثة", messages: [] };
          const messages = Array.isArray(conversationData.messages) ? conversationData.messages : [];
          
          return {
            id: chat.id,
            title: conversationData.title || "محادثة",
            messages: messages.map((m: any) => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            })),
            createdAt: chat.created_at ? new Date(chat.created_at) : new Date(),
          };
        });

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

  const createConversation = useCallback(async () => {
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
  }, [profile]);

  const updateConversationInDB = useCallback(async (conv: Conversation) => {
    if (!profile) return;

    try {
      // Ensure all Date objects are strings for JSON storage
      const serializedMessages = conv.messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      }));

      const { error } = await supabase
        .from("chats")
        .update({
          conversation: {
            title: conv.title,
            messages: serializedMessages,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", conv.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating chat in DB:", error);
    }
  }, [profile]);

  const sendMessage = useCallback(async (content: string) => {
    if (!profile) return;

    let targetConvId = activeConversationId;
    let targetConv = conversations.find((c) => c.id === targetConvId);

    // If no active conversation or it doesn't exist in state, create one
    if (!targetConvId || !targetConv) {
      targetConvId = await createConversation();
      if (!targetConvId) return;
      
      // Initialize targetConv for the new conversation
      targetConv = {
        id: targetConvId,
        title: "محادثة جديدة",
        messages: [],
        createdAt: new Date(),
      };
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Calculate updated conversation for user message
    const updatedWithUser: Conversation = {
      ...targetConv,
      messages: [...targetConv.messages, userMsg],
    };

    // Update title if it's the first message
    if (targetConv.messages.length === 0) {
      updatedWithUser.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
    }

    // Update state and DB for user message
    setConversations((prev) =>
      prev.map((c) => (c.id === targetConvId ? updatedWithUser : c))
    );
    await updateConversationInDB(updatedWithUser);

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

      // Calculate updated conversation for bot response
      const updatedWithBot: Conversation = {
        ...updatedWithUser,
        messages: [...updatedWithUser.messages, botMsg],
      };

      // Update state and DB for bot message
      setConversations((prev) =>
        prev.map((c) => (c.id === targetConvId ? updatedWithBot : c))
      );
      await updateConversationInDB(updatedWithBot);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.",
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId ? { ...c, messages: [...c.messages, errorMsg] } : c
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [activeConversationId, conversations, profile, createConversation, updateConversationInDB]);

  const deleteConversation = useCallback(async (id: string) => {
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
  }, [activeConversationId]);

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
