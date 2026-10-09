import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

// 1️⃣ Inisialisasi Provider (Google & OpenAI)
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const google = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

const openaiApiKey = process.env.OPENAI_API_KEY || '';
const openai = createOpenAI({
  apiKey: openaiApiKey,
});

export type DifficultyLevel = 1 | 2 | 3;

/**
 * 🤖 TOTAL 10 AI POOL (Dari 2 Provider: Google & OpenAI)
 * 1 Satpam + 3 di Level 1 + 3 di Level 2 + 3 di Level 3
 */
const AI_POOL = {
  // 🛡️ AI 1: SATPAM (Sangat Cepat & Murah untuk routing)
  SATPAM: openaiApiKey ? openai('gpt-4o-mini') : google('gemini-3.8-flash'), 

  // 🟢 LEVEL 1: Ringan (3 AI)
  LEVEL_1_AI_1: openaiApiKey ? openai('gpt-4o-mini') : google('gemini-3.8-flash'),
  LEVEL_1_AI_2: google('gemini-3.8-flash'),
  LEVEL_1_AI_3: openai('gpt-4o-mini'),

  // 🟡 LEVEL 2: Sedang (3 AI)
  LEVEL_2_AI_1: openaiApiKey ? openai('gpt-4o-mini') : google('gemini-3.8-flash'),
  LEVEL_2_AI_2: google('gemini-3.1-pro'),
  LEVEL_2_AI_3: openai('gpt-4o'),

  // 🔴 LEVEL 3: Tinggi / Kompleks (3 AI)
  LEVEL_3_AI_1: openaiApiKey ? openai('gpt-4o') : google('gemini-3.1-pro'),
  LEVEL_3_AI_2: google('gemini-3.8-flash'),
  LEVEL_3_AI_3: openai('gpt-4o'),
};

/**
 * 🛡️ SATPAM AI (AI Ke-1)
 * Menganalisis tingkat kesulitan pertanyaan user secara cepat.
 */
export async function classifyDifficulty(userPrompt: string): Promise<DifficultyLevel> {
  const lower = userPrompt.trim().toLowerCase();
  
  // Rule Base: Jika sangat pendek langsung lempar ke Level 1 tanpa buang kuota AI Satpam
  if (
    lower.length < 15 || 
    /^(halo|hi|assalamu|سلام|أهلا|مرحبا|siapa kamu|siapa anda|ping|tes|test)/i.test(lower)
  ) {
    return 1;
  }

  try {
    const { text } = await generateText({
      model: AI_POOL.SATPAM,
      system: `Kamu adalah Satpam & Klasifikator Pintar untuk aplikasi Hasyiyah (Studi Islam & Bahasa Arab).
Tugasmu HANYA menentukan tingkat kesulitan pertanyaan user.
Kembalikan HANYA angka 1, 2, atau 3.

Kriteria:
- 1 = Pertanyaan ringan, basa-basi, menyapa, info umum dasar, tanya nama/fitur.
- 2 = Pertanyaan tingkat sedang (Penjelasan matan ringkas, terjemahan Indonesia-Arab/Malay, ilmu sharaf dasar, soal umum fiqih ibadah harian).
- 3 = Pertanyaan tingkat tinggi/sulit (I'rab kalimat kompleks, bedah kitab turats klasik, perbandingan mazhab fiqih mendalam, analisis kaidah ushul fiqih/musthalah hadits).`,
      prompt: userPrompt,
    });

    const parsed = parseInt(text.trim(), 10);
    if (parsed === 1 || parsed === 2 || parsed === 3) {
      return parsed;
    }
  } catch (err) {
    console.warn('Satpam AI gagal klasifikasi (kemungkinan API Key kosong). Fallback ke Level 1:', err);
  }

  return 1; // Default
}

/**
 * Dapatkan daftar 3 Model AI per Tingkat Kesulitan untuk Load Balancing & Fallback
 */
export function getModelsForLevel(level: DifficultyLevel) {
  switch (level) {
    case 1:
      return [AI_POOL.LEVEL_1_AI_1, AI_POOL.LEVEL_1_AI_2, AI_POOL.LEVEL_1_AI_3];
    case 2:
      return [AI_POOL.LEVEL_2_AI_1, AI_POOL.LEVEL_2_AI_2, AI_POOL.LEVEL_2_AI_3];
    case 3:
      return [AI_POOL.LEVEL_3_AI_1, AI_POOL.LEVEL_3_AI_2, AI_POOL.LEVEL_3_AI_3];
  }
}

/**
 * 🔄 SMART STREAMING EXECUTION WITH 3-AI FALLBACK PER LEVEL
 */
export async function streamTextWithFallback(
  level: DifficultyLevel,
  messages: any[]
) {
  const models = getModelsForLevel(level);

  let systemPrompt = `Anta Al-Hasyiyah (حاشية), pemandu AI spesialis kitab kuning, studi Islam, dan bahasa Arab.`;
  if (level === 1) {
    systemPrompt += ` Jawablah secara ramah, singkat, jelas, dan lugas.`;
  } else if (level === 2) {
    systemPrompt += ` Jawablah secara rinci, terstruktur, ilmiah dengan rujukan harakat dan penjelasan yang mudah dipahami.`;
  } else {
    systemPrompt += ` Jawablah secara mendalam, berbasis metodologi keilmuan Islam (Fiqih, Nahwu/Sharaf, Ushul Fiqh), berikan i'rab/hujjah jika relevan, serta kutipan matan klasik secara rinci.`;
  }

  let lastError: any = null;

  // Lakukan iterasi pada ke-3 AI di level ini. 
  // Jika AI ke-1 gagal, otomatis lanjut ke AI ke-2, dst.
  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      console.log(`[Satpam AI Router] Menyalurkan ke AI #${i + 1} di Level ${level}`);
      
      const result = streamText({
        model: currentModel,
        system: systemPrompt,
        messages,
      });

      return result;
    } catch (err) {
      console.error(`[Satpam AI Router] AI #${i + 1} di Level ${level} gagal (kemungkinan API Key kosong atau Quota Limit). Otomatis fallback ke AI berikutnya...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error(`Ke-3 AI di Level ${level} gagal merespons. Pastikan API Keys di .env.local terisi.`);
}
