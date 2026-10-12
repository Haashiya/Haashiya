import { NextRequest, NextResponse } from 'next/server';
import {
  getUserChatIndex,
  getChatSession,
  saveChatSession,
  updateChatMeta,
  deleteChatSession,
  ChatSession,
} from '@/lib/r2-chat';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'guest';
    const chatId = searchParams.get('chatId');

    if (chatId) {
      const session = await getChatSession(userId, chatId);
      if (!session) {
        return NextResponse.json({ error: 'Chat tidak ditemukan di Cloudflare R2' }, { status: 404 });
      }
      return NextResponse.json({ chat: session });
    }

    const chats = await getUserChatIndex(userId);
    return NextResponse.json({ chats });
  } catch (err: any) {
    console.error('[API Chat History GET Error]', err);
    return NextResponse.json({ error: 'Gagal mengambil data chat dari Cloudflare R2', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'guest';

    // Jika hanya patch metadata (rename, pin, group)
    if (body.action === 'patch' && body.chatId && body.patch) {
      const updatedIndex = await updateChatMeta(userId, body.chatId, body.patch);
      return NextResponse.json({ ok: true, chats: updatedIndex });
    }

    // Jika simpan sesi penuh
    const session: ChatSession = body.session;
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Payload sesi chat tidak valid' }, { status: 400 });
    }

    await saveChatSession(userId, session);
    return NextResponse.json({ ok: true, session });
  } catch (err: any) {
    console.error('[API Chat History POST Error]', err);
    return NextResponse.json({ error: 'Gagal menyimpan chat ke Cloudflare R2', details: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'guest';
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Parameter chatId diperlukan' }, { status: 400 });
    }

    const updatedIndex = await deleteChatSession(userId, chatId);
    return NextResponse.json({ ok: true, chats: updatedIndex });
  } catch (err: any) {
    console.error('[API Chat History DELETE Error]', err);
    return NextResponse.json({ error: 'Gagal menghapus chat dari Cloudflare R2', details: err?.message }, { status: 500 });
  }
}
