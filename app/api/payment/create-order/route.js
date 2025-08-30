// app/api/payment/create-order/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
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

export async function POST(req) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { points, paymentMethod, upiId } = await req.json();

    if (!points || points <= 0) {
      return NextResponse.json({ error: 'Invalid points amount' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    // Map payment app IDs to supported payment methods
    const paymentMethodMap = {
      'gpay': 'upi',
      'phonepe': 'upi', 
      'paytm': 'upi',
      'amazonpay': 'upi',
      'bhim': 'upi',
      'razorpay': 'razorpay'
    };
    
    const mappedPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod;

    // Calculate amount in paise (₹1 = 100 paise)
    // 1 point = ₹1 (you can adjust this ratio)
    const amountInPaise = points * 100;

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `points_${Date.now()}`,
      notes: {
        points: points.toString(),
        paymentMethod: paymentMethod,
        originalPaymentMethod: paymentMethod,
        upiId: upiId || '',
        userId: sessionUser.email
      }
    });

    // Create transaction record
    const transaction = await Transaction.create({
      userId: sessionUser._id || sessionUser.id,
      type: 'purchase',
      amount: amountInPaise / 100, // Convert back to rupees
      points: points,
      status: 'pending',
      paymentMethod: mappedPaymentMethod,
      razorpayOrderId: order.id,
      upiId: upiId || null,
      description: `Purchase of ${points} points via ${paymentMethod}`,
      metadata: {
        orderId: order.id,
        currency: 'INR',
        receipt: order.receipt,
        paymentMethod: paymentMethod,
        originalPaymentMethod: paymentMethod
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      transactionId: transaction._id,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message 
    }, { status: 500 });
  }
}
