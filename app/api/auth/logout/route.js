// File: app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';

export async function POST() {
  // Get session user
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {}

  if (sessionUser?.email) {
    // Set isActive to false on logout
    await rewear_User.findOneAndUpdate({ email: sessionUser.email }, { isActive: false });
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('session', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
