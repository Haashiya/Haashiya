import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

// 1️⃣ Inisialisasi Provider (Google, OpenAI, & DeepSeek) dengan Deteksi Cerdas
const rawGoogleKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
const rawOpenaiKey = (process.env.OPENAI_API_KEY || '').trim();
const rawDeepseekKey = (process.env.DEEPSEEK_API_KEY || '').trim();

let deepseekApiKey = rawDeepseekKey;
let openaiApiKey = rawOpenaiKey;
let googleApiKey = rawGoogleKey;

// 💡 Cerdas: Jika user menaruh kunci 'sk-...' (DeepSeek/OpenAI) di variabel Google, selamatkan & petakan otomatis
if (!deepseekApiKey && googleApiKey.startsWith('sk-') && googleApiKey.length >= 50) {
  console.warn('[AI Router] Terdeteksi kunci berawalan sk- di GOOGLE_GENERATIVE_AI_API_KEY. Kunci ini dialihkan otomatis sebagai DEEPSEEK_API_KEY.');
  deepseekApiKey = googleApiKey;
  googleApiKey = ''; // Kosongkan karena bukan kunci Google yang valid (kunci Google berawalan AIzaSy)
}

const google = createGoogleGenerativeAI({
  apiKey: googleApiKey || 'dummy-key',
});

const openai = createOpenAI({
  apiKey: openaiApiKey || 'dummy-key',
});

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: deepseekApiKey || 'dummy-key',
});

// 2️⃣ Circuit Breaker: Catat jika provider mengalami error fatal (401 invalid key, 402 saldo habis, 429 limit)
// agar tidak terus-menerus menabrak server yang sama
const providerFailures: Record<string, { failedAt: number; reason: string }> = {};

export function isProviderAvailable(provider: 'deepseek' | 'openai' | 'google'): boolean {
  const fail = providerFailures[provider];
  if (fail) {
    // Cooldown 5 menit sebelum mencoba lagi
    if (Date.now() - fail.failedAt < 5 * 60 * 1000) {
      return false;
    }
    delete providerFailures[provider];
  }

  if (provider === 'deepseek') return Boolean(deepseekApiKey && deepseekApiKey !== 'dummy-key');
  if (provider === 'openai') return Boolean(openaiApiKey && openaiApiKey !== 'dummy-key');
  if (provider === 'google') return Boolean(googleApiKey && !googleApiKey.startsWith('sk-') && googleApiKey !== 'dummy-key');

  return false;
}

export function markProviderFailed(provider: 'deepseek' | 'openai' | 'google', reason: string) {
  providerFailures[provider] = { failedAt: Date.now(), reason };
  console.warn(`[AI Router Circuit Breaker] Provider '${provider}' dinonaktifkan sementara (5 menit). Alasan: ${reason}`);
}

export type DifficultyLevel = 1 | 2 | 3;

/**
 * 🛡️ Model untuk Satpam Router
 * Memilih model dari provider yang benar-benar aktif & memiliki kuota
 */
function getSatpamModel() {
  if (isProviderAvailable('deepseek')) return { model: deepseek('deepseek-chat'), provider: 'deepseek' as const };
  if (isProviderAvailable('google')) return { model: google('gemini-3.5-flash'), provider: 'google' as const };
  if (isProviderAvailable('openai')) return { model: openai('gpt-4o-mini'), provider: 'openai' as const };
  return null;
}

/**
 * 🛡️ SATPAM AI
 * Menganalisis tingkat kesulitan pertanyaan user secara cepat & hemat kuota.
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

  const satpam = getSatpamModel();
  if (!satpam) {
    // Tidak ada satpam yang aktif, gunakan default level 1
    return 1;
  }

  try {
    const { text } = await generateText({
      model: satpam.model,
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
      return parsed as DifficultyLevel;
    }
  } catch (err: any) {
    console.warn(`Satpam AI (${satpam.provider}) gagal klasifikasi. Fallback ke Level 1:`, err?.message || err);
    if (err?.statusCode === 401 || err?.statusCode === 402 || err?.statusCode === 429) {
      markProviderFailed(satpam.provider, err?.message || 'Authentication/Balance error');
    }
  }

  return 1; // Default
}

/**
 * 🎯 Bangun kandidat model AI yang TERSEDIA berdasarkan tingkat kesulitan
 */
export function getActiveModelsForLevel(level: DifficultyLevel) {
  const list: { model: any; name: string; provider: 'deepseek' | 'openai' | 'google' }[] = [];

  // Urutan prioritas per level
  // Level 1: DeepSeek -> OpenAI -> Google Gemini
  // Level 2: OpenAI -> DeepSeek -> Google Gemini
  // Level 3: Google Gemini -> OpenAI -> DeepSeek

  const addDeepSeek = () => {
    if (isProviderAvailable('deepseek')) {
      list.push({ model: deepseek('deepseek-chat'), name: 'DeepSeek Chat #1', provider: 'deepseek' });
      list.push({ model: deepseek('deepseek-chat'), name: 'DeepSeek Chat #2', provider: 'deepseek' });
    }
  };

  const addOpenAI = () => {
    if (isProviderAvailable('openai')) {
      list.push({ model: openai('gpt-4o-mini'), name: 'OpenAI GPT-4o-mini', provider: 'openai' });
      list.push({ model: openai('gpt-4o'), name: 'OpenAI GPT-4o', provider: 'openai' });
    }
  };

  const addGoogle = () => {
    if (isProviderAvailable('google')) {
      list.push({ model: google('gemini-3.5-flash'), name: 'Google Gemini 3.5 Flash', provider: 'google' });
      list.push({ model: google('gemini-flash-latest'), name: 'Google Gemini Flash Latest', provider: 'google' });
      list.push({ model: google('gemini-3.5-flash-lite'), name: 'Google Gemini 3.5 Flash Lite', provider: 'google' });
    }
  };

  if (level === 1) {
    addDeepSeek();
    addOpenAI();
    addGoogle();
  } else if (level === 2) {
    addOpenAI();
    addDeepSeek();
    addGoogle();
  } else {
    addGoogle();
    addOpenAI();
    addDeepSeek();
  }

  return list;
}

/**
 * 🔄 SMART STREAMING EXECUTION WITH MULTI-LEVEL FALLBACK
 */
export async function streamTextWithFallback(
  initialLevel: DifficultyLevel,
  messages: any[]
) {
  let lastError: any = null;

  for (let currentLevel = initialLevel; currentLevel <= 3; currentLevel++) {
    const candidateModels = getActiveModelsForLevel(currentLevel as DifficultyLevel);

    if (candidateModels.length === 0) {
      console.warn(`[AI Router] Tidak ada provider aktif di Level ${currentLevel}. Mencoba naik ke level berikutnya...`);
      continue;
    }

    let systemPrompt = `Anta Al-Hasyiyah (حاشية), pemandu AI spesialis kitab kuning, studi Islam, dan bahasa Arab.`;
    if (currentLevel === 1) {
      systemPrompt += ` Jawablah secara ramah, singkat, jelas, dan lugas.`;
    } else if (currentLevel === 2) {
      systemPrompt += ` Jawablah secara rinci, terstruktur, ilmiah dengan rujukan harakat dan penjelasan yang mudah dipahami.`;
    } else {
      systemPrompt += ` Jawablah secara mendalam, berbasis metodologi keilmuan Islam (Fiqih, Nahwu/Sharaf, Ushul Fiqh), berikan i'rab/hujjah jika relevan, serta kutipan matan klasik secara rinci.`;
    }

    for (let i = 0; i < candidateModels.length; i++) {
      const candidate = candidateModels[i];
      try {
        console.log(`[AI Router] Mengarahkan ke ${candidate.name} (${candidate.provider}) di Level ${currentLevel}`);
        
        const result = streamText({
          model: candidate.model,
          system: systemPrompt,
          messages,
          maxRetries: 0,
          onError: ({ error }: { error: any }) => {
            console.error(`[AI Router] Error saat streaming ${candidate.name}:`, error?.message || error);
            if (error?.statusCode === 401 || error?.statusCode === 402 || error?.statusCode === 429 || error?.statusCode === 404) {
              markProviderFailed(candidate.provider, error?.message || 'Stream error');
            }
          }
        });

        return result;
      } catch (err: any) {
        console.error(`[AI Router] ${candidate.name} gagal diinisialisasi:`, err?.message || err);
        lastError = err;
        if (err?.statusCode === 401 || err?.statusCode === 402 || err?.statusCode === 429) {
          markProviderFailed(candidate.provider, err?.message || 'Init auth/balance error');
        }
      }
    }
  }

  // Jika semua provider di semua level tidak ada atau gagal
  const availableProviders = ['deepseek', 'openai', 'google'].filter(p => isProviderAvailable(p as any));
  const errMessage = availableProviders.length === 0
    ? 'Belum ada API Key yang aktif atau saldo Anda telah habis. Harap periksa file .env.local: isi GOOGLE_GENERATIVE_AI_API_KEY (Google AI Studio) atau DEEPSEEK_API_KEY (pastikan sudah top-up saldo).'
    : `Seluruh AI (${availableProviders.join(', ')}) gagal merespons. Silakan periksa koneksi internet atau status API.`;

  throw lastError || new Error(errMessage);
}
