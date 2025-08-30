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

    // Validate minimum amount for QR codes (₹100 or 10000 paise)
    if (mappedPaymentMethod === 'upi' && amountInPaise < 10000) {
      return NextResponse.json({ 
        error: 'Invalid amount',
        details: 'Minimum payment amount for UPI QR is ₹100'
      }, { status: 400 });
    }

    try {
      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      let razorpayResponse;
      let isQR = false;

      if (mappedPaymentMethod === 'upi') {
        // Create QR code for UPI payments
        razorpayResponse = await razorpay.qrCode.create({
          type: 'upi_qr',
          name: `Purchase_${points}_points`,
          usage: 'single_use',
          fixed_amount: true,
          payment_amount: amountInPaise,
          description: `Purchase of ${points} points via ${paymentMethod}`,
          notes: {
            pts: points.toString(),
            method: paymentMethod,
            upi: upiId || '',
            user: sessionUser.email,
          },
        });
        isQR = true;
        console.log('Razorpay QR created:', razorpayResponse.id);
      } else {
        // Create standard Razorpay order for non-UPI methods
        razorpayResponse = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `pts_${Date.now()}`,
          notes: {
            pts: points.toString(),
            method: paymentMethod,
            upi: upiId || '',
            user: sessionUser.email
          }
        });
        console.log('Razorpay order created:', razorpayResponse.id);
      }

      // Create transaction record
      const transaction = await Transaction.create({
        userId: sessionUser._id || sessionUser.id,
        type: 'purchase',
        amount: amountInPaise / 100, // Convert back to rupees
        points: points,
        status: 'pending',
        paymentMethod: mappedPaymentMethod,
        razorpayOrderId: isQR ? null : razorpayResponse.id,
        razorpayQrId: isQR ? razorpayResponse.id : null,
        upiId: upiId || null,
        description: `Purchase of ${points} points via ${paymentMethod}`,
        metadata: {
          orderId: isQR ? null : razorpayResponse.id,
          qrId: isQR ? razorpayResponse.id : null,
          currency: 'INR',
          receipt: razorpayResponse.receipt || `qr_${Date.now()}`,
          paymentMethod: paymentMethod,
          originalPaymentMethod: paymentMethod
        }
      });

      console.log('Transaction created:', transaction._id);

      // Return response with conditional fields
      return NextResponse.json({
        success: true,
        ...(isQR
          ? { qrId: razorpayResponse.id, imageUrl: razorpayResponse.image_url }
          : { orderId: razorpayResponse.id, amount: amountInPaise, currency: 'INR' }),
        transactionId: transaction._id,
        key: process.env.RAZORPAY_KEY_ID,
        isQR
      });

    } catch (razorpayError) {
      console.error('Razorpay error details:', JSON.stringify(razorpayError, null, 2));
      return NextResponse.json({ 
        error: 'Payment gateway error',
        details: razorpayError.message || 'Failed to create payment order or QR code',
        razorpayError: {
          code: razorpayError.code,
          description: razorpayError.description,
          source: razorpayError.source,
          reason: razorpayError.reason,
          field: razorpayError.field
        }
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