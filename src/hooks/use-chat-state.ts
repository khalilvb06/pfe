import { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export function useChatState() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createConversation = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: "محادثة جديدة",
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  };

  const sendMessage = (content: string) => {
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const updated = { ...c, messages: [...c.messages, userMsg] };
        if (c.messages.length === 0) {
          updated.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
        }
        return updated;
      })
    );

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: getBotResponse(content),
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, botMsg] } : c
        )
      );
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isTyping,
    setActiveConversationId,
    createConversation,
    sendMessage,
    deleteConversation,
  };
}

function getBotResponse(question: string): string {
  const responses: Record<string, string> = {
    طلاق:
      "وفقاً لقانون الأسرة الجزائري (الأمر رقم 05-02)، يمكن للزوجة طلب التطليق لعدة أسباب منها:\n\n1. **عدم الإنفاق** بعد صدور حكم قضائي\n2. **العيوب** التي تحول دون تحقيق الهدف من الزواج\n3. **الغيبة** بعد مرور سنة بدون عذر\n4. **الحكم بالحبس** المشين\n\nللمزيد من التفاصيل، يُنصح بمراجعة محامٍ متخصص في قانون الأسرة.",
    عمل:
      "ينظم قانون العمل الجزائري (القانون 90-11) العلاقات بين العمال وأصحاب العمل. من أبرز أحكامه:\n\n- **مدة العمل**: 40 ساعة أسبوعياً\n- **الإجازة السنوية**: 30 يوماً تقويمياً\n- **التسريح التعسفي**: يحق للعامل المطالبة بالتعويض\n- **الأجر الوطني الأدنى المضمون (SNMG)**\n\nهل لديك سؤال محدد حول قانون العمل؟",
    دعوى:
      "لرفع دعوى قضائية في الجزائر، يجب اتباع الخطوات التالية:\n\n1. **تحرير عريضة افتتاحية** تتضمن بيانات المدعي والمدعى عليه وموضوع الدعوى\n2. **إيداع العريضة** لدى أمانة ضبط المحكمة المختصة\n3. **دفع الرسوم القضائية**\n4. **تبليغ المدعى عليه** عن طريق محضر قضائي\n5. **حضور الجلسة** في التاريخ المحدد\n\nالمحكمة المختصة تحدد حسب طبيعة النزاع ومحل إقامة المدعى عليه.",
  };

  for (const [key, value] of Object.entries(responses)) {
    if (question.includes(key)) return value;
  }

  return "شكراً لسؤالك. بناءً على القانون الجزائري، يمكنني مساعدتك في فهم الأحكام القانونية المتعلقة بموضوعك.\n\nيُرجى تقديم تفاصيل أكثر حتى أتمكن من تقديم إجابة دقيقة ومفيدة.\n\n**ملاحظة:** هذه المعلومات استرشادية ولا تغني عن استشارة محامٍ مختص.";
}
