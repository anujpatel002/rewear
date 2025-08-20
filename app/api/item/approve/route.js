import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import { cookies } from 'next/headers';

export async function POST(req) {
  await connectDB();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  const { id } = await req.json();

  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }

  if (!sessionUser?.email || sessionUser.email !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await tbl_item.findByIdAndUpdate(id, { status: 'approved' });
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'item:status', payload: { id, status: 'approved' } });
    }
  } catch {}
  return NextResponse.json({ message: 'Item approved' });
}
