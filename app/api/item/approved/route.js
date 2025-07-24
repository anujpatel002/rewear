import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import tbl_item from '@/models/Item';
import rewear_User from '@/models/User'; // ✅ Add this line

export async function GET() {
  try {
    await connectDB();

    const approvedItems = await tbl_item
      .find({ status: 'approved' })
      .populate('uploadedBy', 'name email'); // now it will work

    return NextResponse.json({ items: approvedItems }, { status: 200 });
  } catch (error) {
    console.error('Approved items fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch approved items' }, { status: 500 });
  }
}
