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
    
    const user = JSON.parse(sessionCookie);
    return user;
  } catch (error) {
    console.error('Session parsing error:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay environment variables');
      return NextResponse.json({ 
        error: 'Payment gateway configuration error',
      }, { status: 500 });
    }

    await connectDB();
    
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ 
        error: 'Unauthorized - Please login again',
      }, { status: 401 });
    }

    const body = await req.json();
    const { points, paymentMethod } = body;

    if (!points || points <= 0) {
      return NextResponse.json({ 
        error: 'Invalid points amount',
      }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ 
        error: 'Payment method is required',
      }, { status: 400 });
    }

    const amountInPaise = points * 100;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `pts_${Date.now()}`,
      notes: {
        pts: points.toString(),
        method: paymentMethod,
        user: sessionUser.email
      }
    };

    // Always create a standard order
    const razorpayOrder = await razorpay.orders.create(orderOptions);

    if (!razorpayOrder) {
      throw new Error("Failed to create Razorpay order");
    }
    
    console.log('Razorpay order created:', razorpayOrder.id);

    const transaction = await Transaction.create({
      userId: sessionUser._id || sessionUser.id,
      type: 'purchase',
      amount: points,
      points: points,
      status: 'pending',
      paymentMethod: paymentMethod,
      razorpayOrderId: razorpayOrder.id,
      description: `Purchase of ${points} points`,
    });

    console.log('Transaction created:', transaction._id);

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      transactionId: transaction._id,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message
    }, { status: 500 });
  }
}