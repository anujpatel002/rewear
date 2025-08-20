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
  let swapsAsOwner = await SwapRequest.find({ owner: user._id })
    .populate('item requester', 'title name email')
    .lean();
  // Fetch swaps where user is requester (sent requests)
  let swapsAsRequester = await SwapRequest.find({ requester: user._id })
    .populate('item owner', 'title name email')
    .lean();

  // Remove orphaned swaps referencing deleted items and filter them out from the response
  const orphanOwnerIds = swapsAsOwner.filter(s => !s.item).map(s => s._id);
  const orphanRequesterIds = swapsAsRequester.filter(s => !s.item).map(s => s._id);
  const orphanIds = [...new Set([...orphanOwnerIds, ...orphanRequesterIds])];
  if (orphanIds.length > 0) {
    try {
      await SwapRequest.deleteMany({ _id: { $in: orphanIds } });
    } catch (e) {
      console.error('Failed to cleanup orphaned swaps', e);
    }
  }
  swapsAsOwner = swapsAsOwner.filter(s => s.item);
  swapsAsRequester = swapsAsRequester.filter(s => s.item);

  return NextResponse.json({ items, swapsAsOwner, swapsAsRequester });
}
