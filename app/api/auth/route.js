import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_NAME = 'shittodo_session';
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

export async function POST(request) {
  const { password } = await request.json();
  const correctPassword = process.env.SITE_PASSWORD || 'shittodo123';

  if (password === correctPassword) {
    const cookieStore = await cookies();
    const token = Buffer.from(`authenticated:${Date.now()}`).toString('base64');

    cookieStore.set(SESSION_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
  return NextResponse.json({ success: true });
}
