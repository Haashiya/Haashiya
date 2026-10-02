require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function importUsers() {
  const raw = fs.readFileSync('public/data/users.json', 'utf8');
  const users = JSON.parse(raw);

  console.log(`Found ${users.length} users to import...`);

  for (const u of users) {
    const row = {
      id: u.username.toLowerCase(),
      username: u.username,
      email: u.email || '',
      name: u.name || '',
      gender: u.gender || 'male',
      role: u.role || 'user',
      avatar: u.avatar || '',
      pass: u.pass || u.password || '123',
      password: u.pass || u.password || '123',
      "studentId": u.studentId || ''
    };

    const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error(`FAILED: ${u.username} =>`, error.message);
    } else {
      console.log(`OK: ${u.username}`);
    }
  }

  console.log('\nDone!');
}

importUsers();
