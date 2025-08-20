import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';

export async function POST(req) {
  await connectDB();

  // ✅ Await the cookies function
  const cookieStore = await cookies(); 
  const sessionCookie = cookieStore.get('session')?.value;

  let sessionUser = null;

  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
  }

  if (!sessionUser?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    title,
    description,
    category,
    type,
    size,
    condition,
    tags,
    imageUrl = '',
    points = 0,
  } = await req.json();

  const user = await rewear_User.findOne({ email: sessionUser.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Store with pending status (until approved by admin)
  const newItem = await tbl_item.create({
    title,
    description,
    category,
    type,
    size,
    condition,
    tags,
    imageUrl,
    points: Math.max(0, Number(points) || 0),
    uploadedBy: user._id,
    status: 'pending', // default status
    createdAt: new Date(),
  });
  // Emit realtime event (best-effort)
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'item:created', payload: { id: String(newItem._id) } });
    }
  } catch {}

  return NextResponse.json({ message: 'Item submitted for admin approval', item: newItem });
}
