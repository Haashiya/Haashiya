import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getServerSupabase } from '@/lib/supabase-server';
import { deleteR2FileByUrl } from '@/lib/r2';

/** Admin menghapus buku yang sudah disetujui (baris Supabase + file R2). */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing book ID' }, { status: 400 });

    const supabase = getServerSupabase();

    const { data: book, error: fetchError } = await supabase
      .from('approved_books')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    await deleteR2FileByUrl(book.pdfUrl);
    await deleteR2FileByUrl(book.coverUrl);

    const { error: deleteError } = await supabase.from('approved_books').delete().eq('id', id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
