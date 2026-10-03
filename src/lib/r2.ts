import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

/** Base URL publik R2 tanpa slash di akhir, mis. https://pub-xxxx.r2.dev */
export function getR2PublicBase(): string {
  const raw = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** Ambil object key R2 dari URL publik; null bila bukan URL R2 kita. */
export function r2KeyFromUrl(url: string | null | undefined): string | null {
  const base = getR2PublicBase();
  if (!url || !base || !url.startsWith(base + '/')) return null;
  return decodeURIComponent(url.slice(base.length + 1));
}

/** Hapus file di R2 berdasarkan URL publiknya (diabaikan bila bukan URL R2). */
export async function deleteR2FileByUrl(url: string | null | undefined): Promise<void> {
  const key = r2KeyFromUrl(url);
  if (!key) return;
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
  } catch (err) {
    console.error('Gagal menghapus file R2:', key, err);
  }
}
