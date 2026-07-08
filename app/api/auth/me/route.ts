import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'firebase-session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);

    return NextResponse.json({
      authenticated: true,
      uid: decoded.uid,
      email: decoded.email || null,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}