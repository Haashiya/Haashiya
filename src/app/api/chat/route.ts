import { convertToModelMessages } from 'ai';
import { classifyDifficulty, streamTextWithFallback } from '@/lib/ai-router';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages payload is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. 🛡️ Ubah UIMessages dari klien ke ModelMessages yang bisa dibaca streamText
    const modelMessages = await convertToModelMessages(messages);

    // Ambil pesan terakhir dari user
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userPrompt = typeof lastUserMessage?.content === 'string' 
      ? lastUserMessage.content 
      : (Array.isArray(lastUserMessage?.parts) 
          ? lastUserMessage.parts.map((p: any) => p.text || '').join('') 
          : '');

    // 2. 🛡️ Klasifikasi oleh Satpam AI
    const difficultyLevel = await classifyDifficulty(userPrompt);

    // 3. 🔄 Jalankan Streaming dengan 3 Fallback AI Candidate di Tier tersebut
    const result = await streamTextWithFallback(difficultyLevel, modelMessages);

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal memproses AI. Pastikan API Key sudah diset di .env.local',
      details: error?.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

