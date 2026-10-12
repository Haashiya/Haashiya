import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/lib/r2';

export interface ChatMeta {
  id: string;
  title: string;
  isPinned?: boolean;
  project?: string | null;
  group?: string | null;
  createdAt?: number;
  updatedAt: number;
}

export interface ChatSession extends ChatMeta {
  messages: any[];
  attachedBooks?: any[];
}

const BUCKET = process.env.R2_BUCKET_NAME || 'haashiya';

function sanitizeUserId(userId: string): string {
  return (userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * 📂 Ambil daftar indeks riwayat chat user dari Cloudflare R2
 */
export async function getUserChatIndex(userId: string): Promise<ChatMeta[]> {
  const safeUser = sanitizeUserId(userId);
  const key = `chats/${safeUser}/index.json`;

  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const res = await r2.send(cmd);
    const bodyStr = await res.Body?.transformToString();
    if (!bodyStr) return [];
    const list = JSON.parse(bodyStr);
    return Array.isArray(list) ? list : [];
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return [];
    }
    console.error('[R2 Chat] Gagal membaca index chat:', err?.message || err);
    return [];
  }
}

/**
 * 💾 Simpan daftar indeks riwayat chat user ke Cloudflare R2
 */
export async function saveUserChatIndex(userId: string, index: ChatMeta[]): Promise<void> {
  const safeUser = sanitizeUserId(userId);
  const key = `chats/${safeUser}/index.json`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(index, null, 2),
    ContentType: 'application/json',
  });

  await r2.send(cmd);
}

/**
 * 📖 Ambil satu sesi percakapan chat lengkap dari Cloudflare R2
 */
export async function getChatSession(userId: string, chatId: string): Promise<ChatSession | null> {
  const safeUser = sanitizeUserId(userId);
  const key = `chats/${safeUser}/${chatId}.json`;

  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const res = await r2.send(cmd);
    const bodyStr = await res.Body?.transformToString();
    if (!bodyStr) return null;
    return JSON.parse(bodyStr) as ChatSession;
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    console.error(`[R2 Chat] Gagal membaca sesi chat ${chatId}:`, err?.message || err);
    return null;
  }
}

/**
 * 💾 Simpan sesi percakapan chat lengkap ke Cloudflare R2 dan perbarui indeks
 */
export async function saveChatSession(userId: string, session: ChatSession): Promise<void> {
  const safeUser = sanitizeUserId(userId);
  const key = `chats/${safeUser}/${session.id}.json`;

  session.updatedAt = Date.now();
  if (!session.createdAt) session.createdAt = Date.now();

  // 1. Simpan detail percakapan
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(session, null, 2),
    ContentType: 'application/json',
  });
  await r2.send(cmd);

  // 2. Perbarui file index.json
  const currentIndex = await getUserChatIndex(userId);
  const existingIndex = currentIndex.findIndex(item => item.id === session.id);

  const meta: ChatMeta = {
    id: session.id,
    title: session.title || 'محادثة جديدة',
    isPinned: Boolean(session.isPinned),
    project: session.project || null,
    group: session.group || null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };

  if (existingIndex >= 0) {
    currentIndex[existingIndex] = { ...currentIndex[existingIndex], ...meta };
  } else {
    currentIndex.unshift(meta);
  }

  // Sort: yang dipin di atas, lalu berdasarkan updatedAt terbaru
  currentIndex.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  await saveUserChatIndex(userId, currentIndex);
}

/**
 * ✏️ Update sebagian metadata chat (rename, pin, group) di Cloudflare R2
 */
export async function updateChatMeta(
  userId: string,
  chatId: string,
  patch: Partial<ChatMeta>
): Promise<ChatMeta[]> {
  const currentIndex = await getUserChatIndex(userId);
  const target = currentIndex.find(item => item.id === chatId);

  if (target) {
    Object.assign(target, patch);
    target.updatedAt = Date.now();
    await saveUserChatIndex(userId, currentIndex);

    // Update juga di file session jika ada
    const session = await getChatSession(userId, chatId);
    if (session) {
      Object.assign(session, patch);
      session.updatedAt = Date.now();
      const safeUser = sanitizeUserId(userId);
      await r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: `chats/${safeUser}/${chatId}.json`,
        Body: JSON.stringify(session, null, 2),
        ContentType: 'application/json',
      }));
    }
  }

  return currentIndex;
}

/**
 * 🗑️ Hapus sesi percakapan chat dari Cloudflare R2
 */
export async function deleteChatSession(userId: string, chatId: string): Promise<ChatMeta[]> {
  const safeUser = sanitizeUserId(userId);
  const key = `chats/${safeUser}/${chatId}.json`;

  // 1. Hapus file session
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.warn(`[R2 Chat] File ${key} mungkin sudah tidak ada:`, err);
  }

  // 2. Hapus dari index.json
  const currentIndex = await getUserChatIndex(userId);
  const updatedIndex = currentIndex.filter(item => item.id !== chatId);
  await saveUserChatIndex(userId, updatedIndex);

  return updatedIndex;
}
