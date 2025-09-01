// In app/api/payment/create-order/route.js

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/utils/db';
import Transaction from '@/models/Transaction';
import { cookies } from 'next/headers';

async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie);
  } catch (error) {
    console.error('Session parsing error:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    // 1. Validate Environment Variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('CRITICAL: Missing Razorpay environment variables');
      return NextResponse.json({ error: 'Payment gateway is not configured.' }, { status: 500 });
    }

    // 2. Connect to DB and Get User
    await connectDB();
    const sessionUser = await getSessionUser();
    if (!sessionUser?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
    }

    // 3. Parse and Validate Request Body
    const { points, paymentMethod } = await req.json();
    if (!points || points <= 0 || !paymentMethod) {
      return NextResponse.json({ error: 'Invalid request. Points and payment method are required.' }, { status: 400 });
    }

    const amountInPaise = points * 100;

    // 4. Initialize Razorpay and Create a Standard Order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_rewear_${Date.now()}`,
      notes: {
        points: points.toString(),
        paymentMethod,
        userEmail: sessionUser.email,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);
    console.log('Successfully created Razorpay Order ID:', razorpayOrder.id);

    // 5. Create a Pending Transaction Record in DB
    const transaction = await Transaction.create({
      userId: sessionUser._id || sessionUser.id,
      type: 'purchase',
      amount: points, // Store amount in rupees
      points: points,
      status: 'pending',
      paymentMethod: paymentMethod, // Store the original selected app (e.g., 'gpay')
      razorpayOrderId: razorpayOrder.id, // Link to the Razorpay order
      description: `Purchase of ${points} points via ${paymentMethod}`,
    });
    
    console.log('Transaction record created with ID:', transaction._id);

    // 6. Return a Consistent Response to the Frontend
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // Amount in paise
      currency: razorpayOrder.currency,
      transactionId: transaction._id.toString(),
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('--- CREATE ORDER FAILED ---:', error);
    return NextResponse.json({
      error: 'Failed to create payment order.',
      details: error.message,
    }, { status: 500 });
  }
}
