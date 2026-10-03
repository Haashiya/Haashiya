import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('archive_items')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching archive items:', error);
      return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 });
    }

    const result: Record<string, unknown[]> = { assignments: [], whiteboards: [], photos: [] };
    for (const row of data || []) {
      if (row.type === 'assignment') {
        result.assignments.push({
          id: row.id,
          title: row.title,
          author: row.author,
          meta: row.meta,
          category: row.category,
          coverUrl: row.imageurl,
          pdfUrl: row.pdfurl,
        });
      } else if (row.type === 'whiteboard' || row.type === 'photo') {
        result[row.type === 'whiteboard' ? 'whiteboards' : 'photos'].push({
          id: row.id,
          date: row.datelabel,
          meta: row.meta,
          category: row.category,
          imageUrl: row.imageurl,
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in archive route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
