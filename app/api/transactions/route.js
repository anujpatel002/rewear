// app/api/transactions/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Transaction from '@/models/Transaction';
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

export async function GET(req) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build filter object
    const filter = { userId: sessionUser._id || sessionUser.id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    }, { status: 500 });
  }
}
