import { NextResponse } from 'next/server';
import { SwapRequest } from '@/models/Item';
import connectDB from '@/utils/db';
import { cookies } from 'next/headers';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User';

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
  // Transfer points: requester pays item.points to owner
  const item = await tbl_item.findById(swap.item);
  const points = Math.max(0, Number(item?.points || 0));
  const requester = await rewear_User.findById(swap.requester);
  const owner = await rewear_User.findById(swap.owner);
  if (!item || !requester || !owner) {
    return NextResponse.json({ error: 'Data inconsistency' }, { status: 500 });
  }
  if ((requester.points || 0) < points) {
    return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
  }
  requester.points = (requester.points || 0) - points;
  owner.points = (owner.points || 0) + points;
  await requester.save();
  await owner.save();
  swap.status = 'approved';
  await swap.save();
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'swap:status', payload: { id, status: 'approved' } });
    }
  } catch {}
  return NextResponse.json({ message: 'Swap approved', swap });
}
