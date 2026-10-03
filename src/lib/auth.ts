import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

/**
 * Sesi sederhana bertanda tangan (HMAC-SHA256) agar server bisa memastikan
 * siapa yang memanggil API (user biasa / admin). Token dikirim lewat header
 * `Authorization: Bearer <token>`.
 *
 * Rahasia penanda tangan: SESSION_SECRET (disarankan). Jika belum ada, dipakai
 * R2_SECRET_ACCESS_KEY yang juga hanya ada di server.
 */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

interface SessionPayload {
  u: string; // username / id user di tabel users
  r: string; // role saat login
  exp: number; // kedaluwarsa (ms epoch)
}

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.R2_SECRET_ACCESS_KEY || '';
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function signSession(username: string, role: string): string {
  const payload: SessionPayload = { u: username, r: role, exp: Date.now() + SESSION_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySession(token: string | null | undefined): SessionPayload | null {
  if (!token || !getSecret()) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.u || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getBearer(req: NextRequest | Request): string | null {
  const header = req.headers.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

type AuthResult =
  | { ok: true; username: string; role: string }
  | { ok: false; response: NextResponse };

/** Wajib login (user biasa maupun admin). */
export function requireUser(req: NextRequest | Request): AuthResult {
  const payload = verifySession(getBearer(req));
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized: silakan login ulang' }, { status: 401 }) };
  }
  return { ok: true, username: payload.u, role: payload.r };
}

/** Wajib admin. Role dicek ulang ke tabel users (bukan hanya dari token). */
export async function requireAdmin(req: NextRequest | Request): Promise<AuthResult> {
  const user = requireUser(req);
  if (!user.ok) return user;

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.username.toLowerCase())
    .maybeSingle();

  if (error || !data || data.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden: hanya admin' }, { status: 403 }) };
  }
  return { ok: true, username: user.username, role: 'admin' };
}
