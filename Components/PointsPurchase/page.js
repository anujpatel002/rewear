// In Components/PointsPurchase/page.js

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PAYMENT_APPS, generateUPILink } from '@/config/payment-apps';
import { useSession } from '@/context/SessionContext';

// Simple QR Code Component
const QRCode = ({ upiLink }) => {
  useEffect(() => {
    // Dynamically import qrcode library only on client-side
    const QRCode = require('qrcode');
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      QRCode.toCanvas(canvas, upiLink, { width: 200, errorCorrectionLevel: 'H' }, (err) => {
        if (err) console.error('Failed to generate QR Code:', err);
      });
    }
  }, [upiLink]);

  return <canvas id="qr-canvas" />;
};


export default function PointsPurchase() {
  const [points, setPoints] = useState(100);
  const [selectedPaymentApp, setSelectedPaymentApp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null); // Will store { link, orderData }
  const { refreshSession } = useSession();

  const pointsOptions = [100, 200, 500, 1000];

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const resetState = () => {
    setShowQRCode(false);
    setQrCodeData(null);
    setSelectedPaymentApp('');
    setIsLoading(false);
  }

  const handlePurchase = async () => {
    if (!selectedPaymentApp) {
      return toast.error('Please select a payment method.');
    }
    setIsLoading(true);
    setShowQRCode(false);
    setQrCodeData(null);

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, paymentMethod: selectedPaymentApp }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      // Handle Razorpay's native checkout
      if (selectedPaymentApp === 'razorpay') {
        await handleRazorpayPayment(orderData);
        return; // Exit after handling
      }

      // Handle UPI apps (GPay, PhonePe, etc.)
      const upiLink = generateUPILink(selectedPaymentApp, orderData);
      if (!upiLink) {
        throw new Error('Could not generate UPI link for the selected app.');
      }

      if (isDesktop) {
        // On desktop, show a QR code
        setQrCodeData({ link: upiLink, orderData });
        setShowQRCode(true);
        toast.success(`Scan QR to pay with ${PAYMENT_APPS[selectedPaymentApp].name}`);
      } else {
        // On mobile, redirect to the UPI app
        window.location.href = upiLink;
      }
      
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = async (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Rewear Points Purchase',
      description: `Purchase of ${points} points`,
      order_id: orderData.orderId,
      handler: async function (response) {
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
          if (verifyRes.ok) {
            toast.success(verifyData.message);
            await refreshSession();
            resetState();
          } else {
            toast.error(verifyData.error || 'Payment verification failed.');
          }
        } catch (err) {
          toast.error('Payment verification failed.');
        }
      },
      prefill: {
        name: 'Rewear User',
        email: 'user@rewear.com',
      },
      theme: {
        color: '#10b981',
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        },
      },
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
    const copyUPILink = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData.link);
      toast.success('UPI link copied to clipboard!');
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-emerald-700 mb-4">💰 Purchase Points</h3>
      
      {/* Points Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Package</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {pointsOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPoints(p)}
              className={`p-3 rounded-lg border-2 text-center ${points === p ? 'border-emerald-500 bg-emerald-100' : 'border-gray-200 bg-white'}`}
            >
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
            <button
              key={id}
              onClick={() => setSelectedPaymentApp(id)}
              className={`p-3 rounded-lg border-2 flex items-center gap-2 ${selectedPaymentApp === id ? 'border-emerald-500 bg-emerald-100' : 'border-gray-200 bg-white'}`}
            >
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
        className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Processing...' : `Purchase for ₹${points}`}
      </button>

      {/* QR Code Display */}
      {showQRCode && qrCodeData && (
        <div className="mt-6 p-4 border rounded-lg text-center">
            <h4 className="font-semibold mb-2">Scan to Pay with {PAYMENT_APPS[selectedPaymentApp].name}</h4>
            <div className="flex justify-center">
              <QRCode upiLink={qrCodeData.link} />
            </div>
            <button 
                onClick={copyUPILink}
                className="mt-2 text-sm text-emerald-600 hover:underline"
            >
                Copy UPI Link
            </button>
        </div>
      )}
    </div>
  );
}