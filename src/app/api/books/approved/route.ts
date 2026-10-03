import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('approved_books')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching approved books:', error);
      return NextResponse.json({ error: 'Failed to fetch approved books' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in approved books route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
