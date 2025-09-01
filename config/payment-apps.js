// In config/payment-apps.js

// IMPORTANT: Replace this with your actual UPI ID from Google Pay, PhonePe, etc.
export const MERCHANT_UPI_ID = 'anujvelani6@oksbi'; 

export const PAYMENT_APPS = {
  gpay: {
    name: 'UPI APP',
    icon: 'U', // Using simple text icons for broad compatibility
    upiScheme: 'upi://pay', 
  },
  razorpay: {
    name: 'Card / More',
    icon: '💳',
    upiScheme: null, // This uses the Razorpay modal
  }
};

export const generateUPILink = (appId, orderData) => {
  const app = PAYMENT_APPS[appId];
  if (!app || !app.upiScheme) return null;

  const amount = orderData.amount / 100; // Convert from paise to rupees
  const orderId = orderData.orderId;
  
  // Construct a standard UPI payment link
  const upiParams = new URLSearchParams({
    pa: MERCHANT_UPI_ID,                 // Payee Address (Your UPI ID)
    pn: 'Rewear',                        // Payee Name
    am: amount.toString(),               // Amount
    cu: 'INR',                           // Currency
    tr: orderId,                         // Transaction Reference (Crucial for tracking)
    tn: `Purchase ${amount} points for Rewear`, // Transaction Note
  });

  return `${app.upiScheme}?${upiParams.toString()}`;
};
