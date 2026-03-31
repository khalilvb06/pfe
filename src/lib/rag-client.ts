// ==================== CONFIGURATION ====================
const MISTRAL_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const QDRANT_KEY = import.meta.env.VITE_QDRANT_API_KEY;
const QDRANT_URL = '/api/qdrant';

const COLLECTION_NAME = "Code Civil Algerien";
const EMBEDDING_MODEL = "mistral-embed";
const LLM_MODEL = "mistral-small-latest";

if (!MISTRAL_KEY || !QDRANT_KEY) {
    console.error("❌ Error: API Keys not found. Check your .env file.");
}

const SYSTEM_PROMPT = `أنت مساعد قانوني خبير في القانون المدني الجزائري.
استخدم المواد القانونية التالية للإجابة على سؤال المستخدم بدقة وموثوقية.

المواد القانونية:
{context}

سؤال المستخدم: {question}

الإجابة:`;

export interface RAGResponse {
    answer: string;
    sources?: Array<{
        article: string;
        title: string;
        score: number;
        payload: Record<string, any>;
    }>;
    error?: string;
}

async function getEmbedding(text: string): Promise<number[]> {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MISTRAL_KEY}`
        },
        body: JSON.stringify({
            model: EMBEDDING_MODEL,
            input: [text]
        })
    });

    if (!response.ok) {
        throw new Error(`Mistral API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

async function searchQdrant(vector: number[]): Promise<any[]> {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": QDRANT_KEY || ""
        },
        body: JSON.stringify({
            vector: vector,
            limit: 5,
            with_payload: true,
            score_threshold: 0.3
        })
    });

    if (!response.ok) {
        throw new Error(`Qdrant API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.result || [];
}

async function generateAnswer(prompt: string): Promise<string> {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MISTRAL_KEY}`
        },
        body: JSON.stringify({
            model: LLM_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2
        })
    });

    if (!response.ok) {
        throw new Error(`Mistral Chat API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

export async function getRAGResponse(question: string): Promise<RAGResponse> {
    try {
        const queryVector = await getEmbedding(question);
        const points = await searchQdrant(queryVector);

        if (!points || points.length === 0) {
            return {
                answer: "عذراً، لم يتم العثور على مواد قانونية مطابقة في قاعدة البيانات."
            };
        }

        const context = points
            .map((p: any) => `المادة ${p.payload?.article_number} (${p.payload?.title || ''}): ${p.payload?.content || p.payload?.text}`)
            .join("\n\n");

        const finalPrompt = SYSTEM_PROMPT
            .replace('{context}', context)
            .replace('{question}', question);

        const answer = await generateAnswer(finalPrompt);

        return {
            answer: answer,
            sources: points.map(p => ({
                article: p.payload?.article_number,
                title: p.payload?.title,
                score: p.score,
                payload: p.payload
            }))
        };

    } catch (error: any) {
        console.error("🚨 CRITICAL ERROR:", error.message);
        return { error: error.message, answer: "حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً." };
    }
}