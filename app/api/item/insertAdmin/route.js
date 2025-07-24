import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User';

export async function POST(req) {
  await connectDB();
  const { title, description, category, imageUrl = '', email } = await req.json();

  if (!title || !description || !category || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const user = await rewear_User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const newItem = await tbl_item.create({
    title,
    description,
    category,
    imageUrl,
    uploadedBy: user._id,
    status: 'approved',
    createdAt: new Date(),
  });

  return NextResponse.json({ message: 'Product added successfully', item: newItem });
} 