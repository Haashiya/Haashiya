import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { r2, getR2PublicBase } from "@/lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // batas maksimal 2 MB per file

export async function POST(req: NextRequest) {
  // Hanya user yang sudah login yang boleh meminta URL upload
  const auth = requireUser(req);
  if (!auth.ok) return auth.response;

  try {
    const { filename, contentType, size } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    if (!Number.isInteger(size) || size <= 0) {
      return NextResponse.json({ error: "Missing file size" }, { status: 400 });
    }
    if (size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Ukuran file maksimal 2 MB" }, { status: 413 });
    }

    const extension = ALLOWED_TYPES[contentType];
    if (!extension) {
      return NextResponse.json({ error: "Tipe file tidak diizinkan (hanya PDF, PNG, JPG, WEBP)" }, { status: 400 });
    }

    const publicBase = getR2PublicBase();
    if (!publicBase) {
      return NextResponse.json({ error: "NEXT_PUBLIC_R2_PUBLIC_URL belum diatur di .env.local" }, { status: 500 });
    }

    // Nama file unik agar tidak bertabrakan
    const folder = contentType === "application/pdf" ? "books/pdf" : "books/cover";
    const objectKey = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
      ContentLength: size, // ditandatangani: R2 menolak bila ukuran upload berbeda
    });

    // Presigned URL berlaku 15 menit (900 detik)
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 900 });

    return NextResponse.json({
      url: signedUrl,
      objectKey,
      publicUrl: `${publicBase}/${objectKey}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
