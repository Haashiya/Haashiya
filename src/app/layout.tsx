import type { Metadata, Viewport } from "next";
import { Work_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-primary" });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '600', '700'],
  subsets: ["arabic"],
  variable: "--font-arabic"
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "حاشية  - بوابتنا لتعلم اللغة العربية",
  description: "بوابتنا لتعلم اللغة العربية",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${workSans.variable} ${ibmPlexSansArabic.variable}`}>
      <head>
        <Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></Script>
        <Script id="supabase-init" strategy="beforeInteractive">
          {`
            // 1. SYNC MOCK: Define db immediately so legacy scripts don't crash
            window.firebase = {
              firestore: { FieldValue: { serverTimestamp: function() { return new Date().toISOString(); } } }
            };

            const waitForSupabase = async () => {
              while (!window.supabaseClient) {
                await new Promise(r => setTimeout(r, 50));
              }
              return window.supabaseClient;
            };

            window.db = {
              collection: function(colName) {
                return {
                  _colName: colName,
                  _whereClauses: [],
                  _orderClauses: [],
                  where: function(field, op, value) {
                    this._whereClauses.push({ field, op, value });
                    return this;
                  },
                  orderBy: function(field, direction = 'asc') {
                    this._orderClauses.push({ field, direction });
                    return this;
                  },
                  get: async function() {
                    const sb = await waitForSupabase();
                    let query = sb.from(this._colName).select('*');
                    this._whereClauses.forEach(w => {
                      if (w.op === '==') query = query.eq(w.field, w.value);
                    });
                    this._orderClauses.forEach(o => {
                      query = query.order(o.field, { ascending: o.direction !== 'desc' });
                    });
                    const { data, error } = await query;
                    if (error) { console.error('Supabase Query Error:', error); throw error; }
                    return {
                      empty: !data || data.length === 0,
                      docs: (data || []).map(d => ({ id: d.id || d.username, exists: true, data: () => d })),
                      forEach: function(cb) { this.docs.forEach(cb); }
                    };
                  },
                  add: async function(data) {
                    const sb = await waitForSupabase();
                    const { data: res, error } = await sb.from(this._colName).insert(data).select().single();
                    if (error) throw error;
                    return { id: res?.id };
                  },
                  onSnapshot: function(callback) {
                    let isSubscribed = true;
                    let channel = null;
                    const fetchAndNotify = async () => {
                      const sb = await waitForSupabase();
                      let query = sb.from(this._colName).select('*');
                      this._whereClauses.forEach(w => {
                        if (w.op === '==') query = query.eq(w.field, w.value);
                      });
                      this._orderClauses.forEach(o => {
                        query = query.order(o.field, { ascending: o.direction !== 'desc' });
                      });
                      const { data } = await query;
                      if (isSubscribed && data) {
                        callback({
                          docs: data.map(d => ({ id: d.id, data: () => d })),
                          forEach: function(cb) { this.docs.forEach(cb); }
                        });
                      }
                    };
                    fetchAndNotify(); // Initial fetch
                    
                    // Subscribe to realtime changes
                    waitForSupabase().then(sb => {
                      if (!isSubscribed) return;
                      channel = sb.channel('public:' + this._colName)
                        .on('postgres_changes', { event: '*', schema: 'public', table: this._colName }, payload => {
                           fetchAndNotify();
                        })
                        .subscribe();
                    });
                      
                    return () => { 
                      isSubscribed = false; 
                      if (channel && window.supabaseClient) window.supabaseClient.removeChannel(channel); 
                    };
                  },
                  doc: function(docId) {
                    const col = this._colName;
                    return {
                      get: async function() {
                        const sb = await waitForSupabase();
                        // For users table, use username column, otherwise id
                        const pk = col === 'users' ? 'username' : 'id';
                        const { data, error } = await sb.from(col).select('*').eq(pk, docId).maybeSingle();
                        if (error) throw error;
                        return { exists: !!data, id: docId, data: () => data || {} };
                      },
                      set: async function(data, options) {
                        const sb = await waitForSupabase();
                        const pk = col === 'users' ? 'username' : 'id';
                        const { error } = await sb.from(col).upsert({ [pk]: docId, ...data });
                        if (error) throw error;
                      },
                      delete: async function() {
                        const sb = await waitForSupabase();
                        const pk = col === 'users' ? 'username' : 'id';
                        const { error } = await sb.from(col).delete().eq(pk, docId);
                        if (error) throw error;
                      }
                    };
                  }
                };
              }
            };

            // 2. ASYNC INIT: Wait for CDN to load
            const initSupabase = () => {
              if (window.supabase) {
                window.supabaseClient = window.supabase.createClient(
                  '${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}',
                  '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}'
                );
              } else {
                setTimeout(initSupabase, 50);
              }
            };
            initSupabase();
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
