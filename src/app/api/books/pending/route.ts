import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getServerSupabase } from '@/lib/supabase-server';
import { getR2PublicBase } from '@/lib/r2';

/**
 * User login mengirim permintaan penambahan buku.
 * PDF & cover sudah di-upload ke R2; di sini hanya URL-nya yang disimpan ke Supabase.
 */
export async function POST(req: NextRequest) {
  const auth = requireUser(req);
  if (!auth.ok) return auth.response;

  try {
    const { title, author, theme, pdfUrl, coverUrl } = await req.json();

    if (!title?.trim() || !author?.trim() || !theme || !pdfUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // URL file harus berasal dari bucket R2 kita
    const base = getR2PublicBase();
    const isOurs = (u?: string) => !u || (!!base && u.startsWith(base + '/'));
    if (!isOurs(pdfUrl) || !isOurs(coverUrl)) {
      return NextResponse.json({ error: 'URL file tidak valid' }, { status: 400 });
    }

    const { error } = await getServerSupabase().from('pending_books').insert([
      {
        title: title.trim(),
        author: author.trim(),
        theme,
        pdfUrl,
        coverUrl: coverUrl || null,
        uploader: auth.username,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving to pending_books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
