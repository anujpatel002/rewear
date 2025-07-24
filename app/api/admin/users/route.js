// GET: Fetch users | POST: Add user | DELETE: Delete user
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import rewear_User from '@/models/User';
import tbl_item from '@/models/Item';

export async function GET() {
  await connectDB();
  const users = await rewear_User.find({}, 'name email isActive');
  return NextResponse.json({ users });
}

export async function POST(req) {
  await connectDB();
  const { name, email } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await rewear_User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const newUser = await rewear_User.create({ name, email, isActive: false });
  return NextResponse.json({ message: 'User added', user: newUser });
}

export async function DELETE(req) {
  await connectDB();
  const { email } = await req.json();

  const user = await rewear_User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Delete user's items
  await tbl_item.deleteMany({ uploadedBy: user._id });
  // Delete user
  await rewear_User.deleteOne({ email });

  return NextResponse.json({ message: 'User and their items deleted' });
}
