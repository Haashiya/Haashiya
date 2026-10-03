import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getServerSupabase } from '@/lib/supabase-server';

/** Admin menyetujui buku: pindah dari pending_books ke approved_books. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing book ID' }, { status: 400 });

    const supabase = getServerSupabase();

    const { data: pending, error: fetchError } = await supabase
      .from('pending_books')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !pending) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Catatan: tabel approved_books memakai kolom "category" (bukan "theme")
    const { error: insertError } = await supabase.from('approved_books').insert([
      {
        title: pending.title,
        author: pending.author,
        category: pending.theme,
        pdfUrl: pending.pdfUrl,
        coverUrl: pending.coverUrl,
        createdAt: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error('Error approving book:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabase.from('pending_books').delete().eq('id', id);
    if (deleteError) {
      console.error('Buku sudah disetujui tapi gagal dihapus dari pending:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, title: pending.title, uploader: pending.uploader });
  } catch (error) {
    console.error('Error in approve route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
