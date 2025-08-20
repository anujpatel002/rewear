// File: app/api/item/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import { SwapRequest } from '@/models/Item';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    const item = await tbl_item.findById(id).populate('uploadedBy', 'email name');
    if (!item || item.status !== 'approved') {
      return NextResponse.json({ error: 'Item not found or not approved' }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json({ error: 'Error fetching item' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }
  if (!sessionUser?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const requester = await rewear_User.findOne({ email: sessionUser.email });
  if (!requester) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const item = await tbl_item.findById(id).populate('uploadedBy');
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  if (item.status !== 'approved') {
    return NextResponse.json({ error: 'Item is not available for swap' }, { status: 400 });
  }
  if (String(item.uploadedBy._id) === String(requester._id)) {
    return NextResponse.json({ error: 'Cannot swap your own item' }, { status: 400 });
  }
  // Check for existing pending swap
  const existing = await SwapRequest.findOne({ item: item._id, requester: requester._id, status: 'pending' });
  if (existing) {
    return NextResponse.json({ error: 'Swap request already pending' }, { status: 409 });
  }
  const swap = await SwapRequest.create({
    item: item._id,
    requester: requester._id,
    owner: item.uploadedBy._id,
    status: 'pending',
  });
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'swap:created', payload: { id: String(swap._id) } });
    }
  } catch {}
  return NextResponse.json({ message: 'Swap request sent', swap });
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }
  if (!sessionUser?.email || sessionUser.email !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, description, category, imageUrl } = await req.json();
  const updated = await tbl_item.findByIdAndUpdate(
    id,
    { title, description, category, imageUrl },
    { new: true }
  );
  if (!updated) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'item:updated', payload: { id } });
    }
  } catch {}
  return NextResponse.json({ message: 'Item updated', item: updated });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  let sessionUser = null;
  try {
    sessionUser = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }
  if (!sessionUser?.email || sessionUser.email !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const deleted = await tbl_item.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  try {
    if (process.emit) {
      process.emit('emit-event', { event: 'item:deleted', payload: { id } });
    }
  } catch {}
  // Cascade delete all swap requests associated with this item
  try {
    await SwapRequest.deleteMany({ item: id });
  } catch (e) {
    // Log and continue; item is already deleted
    console.error('Failed to delete related swaps for item', id, e);
  }
  return NextResponse.json({ message: 'Item and related swaps deleted' });
}
