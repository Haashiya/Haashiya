import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Client Supabase untuk dipakai di server (API route).
 * Memakai SUPABASE_SERVICE_ROLE_KEY bila tersedia (disarankan, agar RLS bisa
 * dikunci dari publik); jika belum ada, memakai anon key.
 */
export function getServerSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
