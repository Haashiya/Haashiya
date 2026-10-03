import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Manual ENV loader to avoid dotenv dependency issues
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

async function uploadFileToR2(localPath: string, contentType: string, folder: string): Promise<string | null> {
  if (!localPath) return null;
  const fullPath = path.resolve(process.cwd(), 'public', localPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[WARN] File not found: ${fullPath}, using local URL instead.`);
    return localPath;
  }
  
  const fileContent = fs.readFileSync(fullPath);
  const ext = path.extname(localPath);
  const fileName = path.basename(localPath);
  const objectKey = `migrated/${folder}/${Date.now()}-${fileName}`;
  
  try {
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
      Body: fileContent,
      ContentType: contentType,
    }));
    return `${R2_PUBLIC_BASE}/${objectKey}`;
  } catch (e) {
    console.error(`[ERROR] Failed to upload ${localPath}:`, e);
    return localPath;
  }
}

function getContentType(filePath: string) {
  if (filePath.endsWith('.pdf')) return 'application/pdf';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

async function migrateUsers() {
  console.log('\n--- Migrating Users ---');
  const raw = fs.readFileSync(path.resolve(process.cwd(), 'public/data/users.json'), 'utf-8');
  const users = JSON.parse(raw);
  
  for (const u of users) {
    const { error } = await supabase.from('users').insert({
      id: crypto.randomUUID(),
      username: u.username,
      email: u.email,
      name: u.name,
      gender: u.gender,
      role: u.role,
      avatar: u.avatar,
      pass: u.pass
    });
    if (error) {
      if (error.code === '23505') console.log(`User ${u.username} already exists.`);
      else console.error(`Error inserting user ${u.username}:`, error.message);
    } else {
      console.log(`Inserted user: ${u.username}`);
    }
  }
}

async function migrateBooks() {
  console.log('\n--- Migrating Educational Books ---');
  const raw = fs.readFileSync(path.resolve(process.cwd(), 'public/data/books.json'), 'utf-8');
  const books = JSON.parse(raw);
  
  for (const b of books) {
    console.log(`Uploading: ${b.title}...`);
    const coverUrl = await uploadFileToR2(b.coverUrl, getContentType(b.coverUrl), 'covers');
    const pdfUrl = await uploadFileToR2(b.pdfUrl, 'application/pdf', 'pdfs');
    
    const { error } = await supabase.from('educational_books').insert({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      meta: b.meta,
      coverurl: coverUrl,
      pdfurl: pdfUrl
    });
    
    if (error) console.error(`Error inserting book ${b.title}:`, error.message);
    else console.log(`Success DB Insert: ${b.title}`);
  }
}

async function main() {
  await migrateUsers();
  await migrateBooks();
  console.log('\n🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
}

main();
