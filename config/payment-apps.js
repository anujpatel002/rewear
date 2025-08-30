// Payment App Configuration
// Update the MERCHANT_UPI_ID with your actual UPI ID

export const MERCHANT_UPI_ID = 'anujvelani6@oksbi'; // Replace with your actual UPI ID

export const PAYMENT_APPS = {
  gpay: {
    name: 'Google Pay',
    icon: '📱',
    color: 'bg-green-500',
    upiScheme: 'googleplay://upi/pay',
    merchantUPI: 'anujvelani6@oksbi'
  },
  phonepe: {
    name: 'PhonePe',
    icon: '💜',
    color: 'bg-purple-500',
    upiScheme: 'phonepe://pay',
    merchantUPI: 'anujvelani6@oksbi'
  },
  paytm: {
    name: 'Paytm',
    icon: '💙',
    color: 'bg-blue-500',
    upiScheme: 'paytmmp://pay',
    merchantUPI: 'anujvelani6@oksbi'
  },
  amazonpay: {
    name: 'Amazon Pay',
    icon: '🟠',
    color: 'bg-orange-500',
    upiScheme: 'amazonpay://upi/pay',
    merchantUPI: 'anujvelani6@oksbi'
  },
  bhim: {
    name: 'BHIM UPI',
    icon: '🏦',
    color: 'bg-indigo-500',
    upiScheme: 'upi://pay',
    merchantUPI: 'anujvelani6@oksbi'
  },
  razorpay: {
    name: 'Razorpay',
    icon: '💳',
    color: 'bg-blue-600',
    upiScheme: null, // Uses modal instead of redirect
    merchantUPI: null
  }
};

export const generateUPILink = (appId, orderData) => {
  const app = PAYMENT_APPS[appId];
  if (!app || !app.upiScheme) return null;

  const amount = orderData.amount / 100; // Convert from paise to rupees
  const orderId = orderData.orderId;
  
  // Generate UPI payment link with proper parameters
  const upiParams = new URLSearchParams({
    pa: app.merchantUPI || MERCHANT_UPI_ID, // Payee UPI ID
    pn: 'Rewear', // Payee name
    am: amount.toString(), // Amount
    tn: `Points Purchase ${orderId}`, // Transaction note
    cu: 'INR', // Currency
    tr: orderId // Transaction reference
  });

  return `${app.upiScheme}?${upiParams.toString()}`;
};
