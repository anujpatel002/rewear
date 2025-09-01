'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import { PAYMENT_APPS, generateUPILink } from '@/config/payment-apps';
import { useSession } from '@/context/SessionContext';
import './PointsPurchase.css'; // Make sure this CSS file exists and is styled

// --- New Component for QR Code Display with Timer and Instructions ---
const QRCodeDisplay = ({ upiLink, amount, appName, onTimerEnd }) => {
  const [dataUrl, setDataUrl] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds (5 * 60)

  // Effect to generate QR code and start the timer
  useEffect(() => {
    // Generate QR code image from the UPI link
    QRCode.toDataURL(upiLink, { width: 220, margin: 2, errorCorrectionLevel: 'H' })
      .then(url => setDataUrl(url))
      .catch(err => console.error('Failed to generate QR Code:', err));

    // Start the countdown timer
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimerEnd(); // Notify the parent component that the timer has expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: stop the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [upiLink, onTimerEnd]);

  // Helper function to format the remaining seconds into MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="qr-code-container">
      <h4 className="qr-code-title">Scan to Pay ₹{amount} with {appName}</h4>
      <p className="qr-code-timer">
        QR Code expires in: <strong>{formatTime(timer)}</strong>
      </p>
      <div className="qr-code-image-wrapper">
        {dataUrl ? <img src={dataUrl} alt="UPI QR Code" /> : <p>Generating QR Code...</p>}
      </div>
      <div className="qr-code-instructions">
        <h5>How to Pay:</h5>
        <ol>
          <li>Open the <strong>{appName}</strong> app on your mobile device.</li>
          <li>Select the option to 'Scan & Pay' or find the QR code scanner.</li>
          <li>Point your phone's camera at the QR code shown on this screen.</li>
          <li>Confirm the payment amount of <strong>₹{amount}</strong> and complete the transaction securely in your app.</li>
        </ol>
      </div>
    </div>
  );
};


// --- Main PointsPurchase Component ---
export default function PointsPurchase() {
  const [points, setPoints] = useState(100);
  const [selectedPaymentApp, setSelectedPaymentApp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const [qrCodeData, setQrCodeData] = useState(null);
  const { refreshSession } = useSession();

  const pointsOptions = [100, 200, 500, 1000];

  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth >= 768);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  const handlePurchase = async () => {
    if (!selectedPaymentApp) {
      return toast.error('Please select a payment method.');
    }
    setIsLoading(true);
    setQrCodeData(null);

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, paymentMethod: selectedPaymentApp }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      if (selectedPaymentApp === 'razorpay') {
        handleRazorpayPayment(orderData);
      } else {
        const upiLink = generateUPILink(selectedPaymentApp, orderData);
        if (!upiLink) {
          throw new Error('Could not generate UPI link.');
        }

        if (isDesktop) {
          setQrCodeData({ 
            upiLink, 
            appName: PAYMENT_APPS[selectedPaymentApp].name,
            amount: points 
          });
          toast.success(`Scan the QR code to complete your payment.`);
          setIsLoading(false);
        } else {
          window.location.href = upiLink;
        }
      }
      
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
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
          } else {
            toast.error(verifyData.error || 'Payment verification failed.');
          }
        } catch (err) {
          toast.dismiss();
          toast.error('Payment verification failed.');
        } finally {
            setIsLoading(false);
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
      
      {!qrCodeData ? (
        <>
          {/* Points Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Package</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {pointsOptions.map((p) => (
                <button key={p} onClick={() => setPoints(p)} className={`p-3 rounded-lg border-2 text-center transition-all ${points === p ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200' : 'border-gray-200 bg-white hover:bg-emerald-50'}`}>
                  <div className="font-bold text-black">{p} pts</div>
                  <div className="text-sm text-black">₹{p}</div>
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
                  <span className="text-xl text-black">{app.icon}</span>
                  <span className="font-medium text-black">{app.name}</span>
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
        </>
      ) : (
        // QR Code Display Area
        <QRCodeDisplay
          upiLink={qrCodeData.upiLink}
          amount={qrCodeData.amount}
          appName={qrCodeData.appName}
          onTimerEnd={() => {
            toast.error('QR Code expired. Please generate a new one.');
            setQrCodeData(null); // Hide the QR code
          }}
        />
      )}
    </div>
  );
}

