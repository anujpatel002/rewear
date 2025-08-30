// app/api/payment/create-order/route.js
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
    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay environment variables');
      return NextResponse.json({ 
        error: 'Payment gateway configuration error',
        details: 'Razorpay keys not configured'
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
    const { points, paymentMethod, upiId } = body;

    if (!points || points <= 0) {
      return NextResponse.json({ 
        error: 'Invalid points amount',
        details: 'Points must be greater than 0'
      }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ 
        error: 'Payment method is required',
        details: 'Please select a payment method'
      }, { status: 400 });
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
    const amountInPaise = points * 100;

    try {
      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notes: {
          points: points.toString(),
          paymentMethod: paymentMethod,
          originalPaymentMethod: paymentMethod,
          upiId: upiId || '',
          userId: sessionUser.email
        }
      });

      console.log('Razorpay order created:', order.id);

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

      console.log('Transaction created:', transaction._id);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        transactionId: transaction._id,
        key: process.env.RAZORPAY_KEY_ID
      });

    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      return NextResponse.json({ 
        error: 'Payment gateway error',
        details: razorpayError.message || 'Failed to create payment order'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
