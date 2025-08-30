// app/api/payment/verify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/utils/db';
import Transaction from '@/models/Transaction';
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
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Find and update the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'completed') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.updatedAt = new Date();
    await transaction.save();

    // Update user points
    const user = await rewear_User.findOne({ email: sessionUser.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.points = (user.points || 0) + transaction.points;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Successfully added ${transaction.points} points to your account!`,
      newBalance: user.points,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      error: 'Failed to verify payment',
      details: error.message 
    }, { status: 500 });
  }
}
