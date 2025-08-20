import { NextResponse } from 'next/server';
import { SwapRequest } from '@/models/Item';
import connectDB from '@/utils/db';
import { cookies } from 'next/headers';

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {}
  if (!sessionUser?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const swap = await SwapRequest.findById(id).populate('owner');
  if (!swap) {
    return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
  }
  if (swap.owner.email !== sessionUser.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  swap.status = 'rejected';
  await swap.save();
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'swap:status', payload: { id, status: 'rejected' } });
    }
  } catch {}
  return NextResponse.json({ message: 'Swap rejected', swap });
}
