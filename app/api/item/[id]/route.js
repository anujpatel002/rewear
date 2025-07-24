// File: app/api/item/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

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
