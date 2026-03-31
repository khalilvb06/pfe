import { Mistral } from '@mistralai/mistralai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { NextResponse } from 'next/server';

// ==================== CONFIGURATION ====================
// Next.js يقوم تلقائياً بتحميل ملف .env في بيئة Node.js
const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
const QDRANT_KEY = process.env.QDRANT_API_KEY;
const QDRANT_URL = "https://6aa25697-b7f9-4908-8bb1-ca2d4eaee2d9.europe-west3-0.gcp.cloud.qdrant.io:6333";

const COLLECTION_NAME = "Code Civil Algerien";
const EMBEDDING_MODEL = "mistral-embed";
const LLM_MODEL = "mistral-small-latest";

// التحقق من تحميل المتغيرات
if (!MISTRAL_KEY  !QDRANT_KEY) {
  console.error("❌ Error: API Keys not found. Check your .env file.");
}

// ==================== CLIENTS INIT ====================
const mistral = new Mistral({ apiKey: MISTRAL_KEY  "" });

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_KEY  "",
  checkCompatibility: false,
});

const SYSTEM_PROMPT = `أنت مساعد قانوني خبير في القانون المدني الجزائري.
استخدم المواد القانونية التالية للإجابة على سؤال المستخدم بدقة وموثوقية.

المواد القانونية:
{context}

سؤال المستخدم: {question}

الإجابة:`;

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "الرجاء إرسال سؤال صالح" }, { status: 400 });
    }

    // 1. التضمين (Embedding)
    const embResponse = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_KEY}`
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: [question]
      })
    });

    if (!embResponse.ok) {
      throw new Error("Mistral API Authentication failed. Check your .env file.");
    }

    const embData = await embResponse.json();
    const queryVector = embData.data[0].embedding;

    // 2. البحث في Qdrant
    const points = await qdrant.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: 5,
      with_payload: true,
      score_threshold: 0.3
    });

    if (!points  points.length === 0) {
      return NextResponse.json({
        answer: "عذراً، لم يتم العثور على مواد قانونية مطابقة في قاعدة البيانات."
      });
    }

    // 3. بناء السياق (استخراج البيانات من الـ Payload)
    const context = points
      .map((p: any) => المادة ${p.payload?.article_number} (${p.payload?.title || ''}): ${p.payload?.content || p.payload?.text})
      .join("\n\n");

    const finalPrompt = SYSTEM_PROMPT
      .replace('{context}', context)
      .replace('{question}', question);

    // 4. توليد الإجابة
    const chatResponse = await mistral.chat.complete({
      model: LLM_MODEL,
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.2
    });

    return NextResponse.json({
      answer: chatResponse.choices?.[0]?.message?.content,
      sources: points.map(p => ({
        article: p.payload?.article_number,
        title: p.payload?.title,
        score: p.score,
        payload: p.payload
      }))
    });

  } catch (error: any) {
    console.error("🚨 CRITICAL ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
