import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('educational_books')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching educational books:', error);
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }

    // Map the database columns back to camelCase for the frontend
    const formattedData = (data || []).map(book => ({
      ...book,
      coverUrl: book.coverurl || book.coverUrl,
      pdfUrl: book.pdfurl || book.pdfUrl,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error in educational books route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
