// Payment App Configuration
// Update the MERCHANT_UPI_ID with your actual UPI ID

export const MERCHANT_UPI_ID = 'anujvelani6@oksbi'; // Replace with your actual UPI ID

export const PAYMENT_APPS = {
  gpay: {
    name: 'Google Pay',
    icon: '📱',
    color: 'bg-green-500',
    upiScheme: 'googleplay://upi/pay'
  },
  phonepe: {
    name: 'PhonePe',
    icon: '💜',
    color: 'bg-purple-500',
    upiScheme: 'phonepe://pay'
  },
  paytm: {
    name: 'Paytm',
    icon: '💙',
    color: 'bg-blue-500',
    upiScheme: 'paytmmp://pay'
  },
  amazonpay: {
    name: 'Amazon Pay',
    icon: '🟠',
    color: 'bg-orange-500',
    upiScheme: 'amazonpay://upi/pay'
  },
  bhim: {
    name: 'BHIM UPI',
    icon: '🏦',
    color: 'bg-indigo-500',
    upiScheme: 'upi://pay'
  },
  razorpay: {
    name: 'Razorpay',
    icon: '💳',
    color: 'bg-blue-600',
    upiScheme: null // Uses modal instead of redirect
  }
};

export const generateUPILink = (appId, orderData) => {
  const app = PAYMENT_APPS[appId];
  if (!app || !app.upiScheme) return null;

  const amount = orderData.amount / 100; // Convert from paise to rupees
  const orderId = orderData.orderId;
  
  const upiParams = new URLSearchParams({
    pa: MERCHANT_UPI_ID,
    pn: 'Rewear',
    am: amount.toString(),
    tn: `Points Purchase ${orderId}`,
    cu: 'INR'
  });

  return `${app.upiScheme}?${upiParams.toString()}`;
};
