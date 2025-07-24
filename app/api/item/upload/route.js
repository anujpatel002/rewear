// app/api/item/upload/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';

async function getSessionUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  try {
    return sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  await connectDB();
  const formData = await req.formData();
  const sessionUser = await getSessionUser();

  if (!sessionUser || !sessionUser.email) {
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
  } = Object.fromEntries(formData);

  const file = formData.get('image');
  let imageUrl = '';

  if (
    file &&
    typeof file === 'object' &&
    file.name &&
    file.size > 0 &&
    file.type?.startsWith('image/')
  ) {
    const buffer = Buffer.from(await file.arrayBuffer());
    imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
  }

  if (!imageUrl) {
    return NextResponse.json({ error: 'Invalid or missing image file' }, { status: 400 });
  }

  const user = await rewear_User.findOne({ email: sessionUser.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 🔒 Improved Duplicate Check: Include imageUrl hash or fields combo
  const duplicate = await tbl_item.findOne({
    title,
    description,
    category,
    type,
    size,
    condition,
    uploadedBy: user._id,
    status: 'pending',
  });

  if (duplicate) {
    return NextResponse.json({ message: 'Duplicate item already pending for approval' }, { status: 409 });
  }

  const newItem = await tbl_item.create({
    title,
    description,
    category,
    type,
    size,
    condition,
    tags,
    imageUrl,
    uploadedBy: user._id,
    status: 'pending',
    createdAt: new Date(),
  });

  return NextResponse.json({ message: 'Item submitted for approval', item: newItem });
}
