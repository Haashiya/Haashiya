import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { r2, getR2PublicBase } from '@/lib/r2';

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB batas lampiran chat

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, size } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required' }, { status: 400 });
    }

    if (size && size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10 MB' }, { status: 413 });
    }

    const publicBase = getR2PublicBase();
    if (!publicBase) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_R2_PUBLIC_URL belum diatur' }, { status: 500 });
    }

    // Ekstensi yang aman
    const ext = filename.split('.').pop() || 'bin';
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const objectKey = `chats/attachments/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'haashiya',
      Key: objectKey,
      ContentType: contentType,
    });

    // Presigned URL upload ke Cloudflare R2 berlaku 15 menit
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 900 });

    return NextResponse.json({
      uploadUrl: signedUrl,
      objectKey,
      publicUrl: `${publicBase}/${objectKey}`,
    });
  } catch (err: any) {
    console.error('[API Chat Upload Error]', err);
    return NextResponse.json({ error: 'Gagal membuat URL upload Cloudflare R2', details: err?.message }, { status: 500 });
  }
}
