import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import { cookies } from 'next/headers';

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }

  if (!sessionUser?.email || sessionUser.email !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await tbl_item.find({ status: 'pending' }).populate('uploadedBy', 'name email');

  return NextResponse.json({ items });
}
