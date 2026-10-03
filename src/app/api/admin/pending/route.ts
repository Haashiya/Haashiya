import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getServerSupabase } from '@/lib/supabase-server';

/** Daftar antrean buku pending (khusus admin). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await getServerSupabase()
    .from('pending_books')
    .select('id, title, author, theme, pdfUrl, coverUrl, uploader, status, createdAt')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
