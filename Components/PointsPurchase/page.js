'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import { PAYMENT_APPS, generateUPILink } from '@/config/payment-apps';
import { useSession } from '@/context/SessionContext';

// A simple, reusable QR Code component
const QRCodeDisplay = ({ upiLink }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(upiLink, { width: 200, errorCorrectionLevel: 'H' })
      .then(url => setDataUrl(url))
      .catch(err => console.error('Failed to generate QR Code:', err));
  }, [upiLink]);

  if (!dataUrl) return <div>Loading QR Code...</div>;
  return <img src={dataUrl} alt="UPI QR Code" />;
};


export default function PointsPurchase() {
  const [points, setPoints] = useState(100);
  const [selectedPaymentApp, setSelectedPaymentApp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const [qrCodeData, setQrCodeData] = useState(null); // Will store { upiLink, appName, amount }
  const { refreshSession } = useSession();

  const pointsOptions = [100, 200, 500, 1000];

  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth >= 768);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  const resetPaymentState = () => {
    setQrCodeData(null);
    setIsLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPaymentApp) {
      return toast.error('Please select a payment method.');
    }
    setIsLoading(true);
    setQrCodeData(null); // Clear previous QR code

    try {
      console.log(`[1] Creating order for ${points} points via ${selectedPaymentApp}`);
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, paymentMethod: selectedPaymentApp }),
      });

      const orderData = await res.json();
      console.log('[2] Order data received:', orderData);

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      // --- Main Payment Logic ---

      if (selectedPaymentApp === 'razorpay') {
        console.log('[3] Handling via Razorpay Checkout');
        handleRazorpayPayment(orderData);
      } else {
        console.log('[3] Handling via UPI App');
        const upiLink = generateUPILink(selectedPaymentApp, orderData);
        if (!upiLink) {
          throw new Error('Could not generate UPI link for the selected app.');
        }
        
        console.log(`[4] Generated UPI Link: ${upiLink}`);

        if (isDesktop) {
          console.log('[5] Desktop detected, showing QR code.');
          setQrCodeData({ 
            upiLink, 
            appName: PAYMENT_APPS[selectedPaymentApp].name,
            amount: points 
          });
          toast.success(`Scan QR to pay with ${PAYMENT_APPS[selectedPaymentApp].name}`);
          setIsLoading(false); // Stop loading to show QR
        } else {
          console.log('[5] Mobile detected, redirecting...');
          window.location.href = upiLink;
          // No need to set loading to false here, as the page will navigate away
        }
      }
      
    } catch (error) {
      console.error('[Error] Purchase failed:', error);
      toast.error(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount, // Amount is in paise
      currency: orderData.currency,
      name: 'Rewear Points',
      description: `Purchase ${points} points`,
      order_id: orderData.orderId,
      handler: async function (response) {
        toast.loading('Verifying payment...');
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: orderData.transactionId,
            }),
          });
          const verifyData = await verifyRes.json();
          toast.dismiss();
          if (verifyRes.ok) {
            toast.success(verifyData.message);
            await refreshSession();
            resetPaymentState();
          } else {
            toast.error(verifyData.error || 'Payment verification failed.');
          }
        } catch (err) {
          toast.dismiss();
          toast.error('Payment verification failed.');
        }
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
        },
      },
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-emerald-700 mb-4">💰 Purchase Points</h3>
      
      {/* Points Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Package</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {pointsOptions.map((p) => (
            <button key={p} onClick={() => setPoints(p)} className={`p-3 rounded-lg border-2 text-center transition-all ${points === p ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200' : 'border-gray-200 bg-white hover:bg-emerald-50'}`}>
              <div className="font-bold">{p} pts</div>
              <div className="text-sm">₹{p}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment App Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(PAYMENT_APPS).map(([id, app]) => (
            <button key={id} onClick={() => setSelectedPaymentApp(id)} className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${selectedPaymentApp === id ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200' : 'border-gray-200 bg-white hover:bg-emerald-50'}`}>
              <span className="text-xl">{app.icon}</span>
              <span className="font-medium">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={!selectedPaymentApp || isLoading}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : `Purchase for ₹${points}`}
      </button>

      {/* QR Code Display Area */}
      {qrCodeData && (
        <div className="mt-6 p-4 border rounded-lg text-center bg-gray-50">
            <h4 className="font-semibold mb-2">Scan to Pay ₹{qrCodeData.amount} with {qrCodeData.appName}</h4>
            <div className="flex justify-center my-4">
              <QRCodeDisplay upiLink={qrCodeData.upiLink} />
            </div>
            <button 
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeData.upiLink);
                  toast.success('UPI link copied!');
                }}
                className="text-sm text-emerald-600 hover:underline"
            >
                Copy UPI Link
            </button>
        </div>
      )}
    </div>
  );
}
