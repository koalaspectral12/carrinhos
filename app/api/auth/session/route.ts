import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'firebase-session';
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken obrigatório.' }, { status: 400 });
    }

    const auth = getFirebaseAdminAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EXPIRES_IN / 1000,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao criar sessão Firebase.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}