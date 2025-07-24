import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User';
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

  if (!sessionUser || !sessionUser.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await rewear_User.findOne({ email: sessionUser.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Fetch all user items, including their status
  const items = await tbl_item.find({ uploadedBy: user._id }).lean();

  return NextResponse.json({ items });
}
