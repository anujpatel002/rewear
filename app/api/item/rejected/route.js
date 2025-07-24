import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';

export async function GET() {
  try {
    await connectDB();
    const rejectedItems = await tbl_item
      .find({ status: 'rejected' })
      .populate('uploadedBy', 'name email');
    return NextResponse.json({ items: rejectedItems }, { status: 200 });
  } catch (error) {
    console.error('Rejected items fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch rejected items' }, { status: 500 });
  }
} 