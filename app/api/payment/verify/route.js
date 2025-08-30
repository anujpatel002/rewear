// app/api/payment/verify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/utils/db';
import Transaction from '@/models/Transaction';
import rewear_User from '@/models/User';
import { cookies } from 'next/headers';

async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;
    
    const user = JSON.parse(sessionCookie);
    return user;
  } catch (error) {
    console.error('Session parsing error:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing RAZORPAY_KEY_SECRET environment variable');
      return NextResponse.json({ 
        error: 'Payment gateway configuration error',
        details: 'Razorpay secret key not configured'
      }, { status: 500 });
    }

    // Connect to database
    await connectDB();
    
    // Get session user
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ 
        error: 'Unauthorized - Please login again',
        details: 'Session expired or invalid'
      }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ 
        error: 'Missing payment parameters',
        details: 'Order ID, Payment ID, and Signature are required'
      }, { status: 400 });
    }

    if (!transactionId) {
      return NextResponse.json({ 
        error: 'Missing transaction ID',
        details: 'Transaction ID is required for verification'
      }, { status: 400 });
    }

    console.log('Verifying payment:', { 
      orderId: razorpay_order_id, 
      paymentId: razorpay_payment_id, 
      transactionId 
    });

    // Verify the payment signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature:', {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return NextResponse.json({ 
        error: 'Invalid payment signature',
        details: 'Payment verification failed - signature mismatch'
      }, { status: 400 });
    }

    console.log('Payment signature verified successfully');

    // Find and update the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      console.error('Transaction not found:', transactionId);
      return NextResponse.json({ 
        error: 'Transaction not found',
        details: 'Transaction ID is invalid or expired'
      }, { status: 404 });
    }

    if (transaction.status === 'completed') {
      console.log('Payment already processed for transaction:', transactionId);
      return NextResponse.json({ 
        error: 'Payment already processed',
        details: 'This transaction has already been completed'
      }, { status: 400 });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.updatedAt = new Date();
    await transaction.save();

    console.log('Transaction updated successfully:', transactionId);

    // Update user points
    const user = await rewear_User.findOne({ email: sessionUser.email });
    if (!user) {
      console.error('User not found:', sessionUser.email);
      return NextResponse.json({ 
        error: 'User not found',
        details: 'User account not found in database'
      }, { status: 404 });
    }

    const oldPoints = user.points || 0;
    user.points = oldPoints + transaction.points;
    await user.save();

    console.log('User points updated:', {
      email: user.email,
      oldPoints,
      newPoints: user.points,
      addedPoints: transaction.points
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${transaction.points} points to your account!`,
      newBalance: user.points,
      transactionId: transaction._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      error: 'Failed to verify payment',
      details: error.message || 'Internal server error during verification'
    }, { status: 500 });
  }
}
