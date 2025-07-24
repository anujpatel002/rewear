import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';

export async function PUT(req) {
  await connectDB();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }
  if (!sessionUser?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { profilePic, address } = await req.json();
  const user = await rewear_User.findOneAndUpdate(
    { email: sessionUser.email },
    { profilePic, address },
    { new: true }
  );
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Profile updated', user });
} 