import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';
import { SwapRequest } from '@/models/Item';

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

  if (!sessionUser || !sessionUser.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await rewear_User.findOne({ email: sessionUser.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Fetch all user items, including their status
  const items = await tbl_item.find({ uploadedBy: user._id }).lean();

  // Fetch swaps where user is owner (received requests)
  const swapsAsOwner = await SwapRequest.find({ owner: user._id })
    .populate('item requester', 'title name email')
    .lean();
  // Fetch swaps where user is requester (sent requests)
  const swapsAsRequester = await SwapRequest.find({ requester: user._id })
    .populate('item owner', 'title name email')
    .lean();

  return NextResponse.json({ items, swapsAsOwner, swapsAsRequester });
}
