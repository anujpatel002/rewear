'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSession } from '@/context/SessionContext';
import { PAYMENT_APPS, generateUPILink } from '@/config/payment-apps';

export default function PointsPurchase() {
  const [points, setPoints] = useState(100);
  const [selectedPaymentApp, setSelectedPaymentApp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { refreshSession } = useSession();

  const pointsOptions = [50, 100, 200, 500, 1000, 2000];

  // Check if user is on desktop
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
      setIsDesktop(!isMobile);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handlePointsChange = (value) => {
    setPoints(value);
    setShowQRCode(false);
    setQrCodeData(null);
  };

  const handlePaymentAppSelect = (appId) => {
    setSelectedPaymentApp(appId);
    setShowQRCode(false);
    setQrCodeData(null);
  };

  const generateQRCode = async () => {
    if (!selectedPaymentApp) {
      toast.error('Please select a payment method first');
      return;
    }

    setIsLoading(true);
    try {
      // Create order first
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          points, 
          paymentMethod: selectedPaymentApp,
          upiId: null
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Generate UPI QR code data
      const upiData = generateUPIData(selectedPaymentApp, orderData);
      setQrCodeData(upiData);
      setShowQRCode(true);
      
      toast.success('QR Code generated! Scan with any UPI app to pay');
      
    } catch (error) {
      console.error('QR Code generation error:', error);
      toast.error(error.message || 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const generateUPIData = (appId, orderData) => {
    const amount = orderData.amount / 100; // Convert from paise to rupees
    const orderId = orderData.orderId;
    
    // UPI QR code format
    const upiData = {
      payee: {
        vpa: 'anujvelani6@oksbi', // Your UPI ID
        name: 'Rewear',
      },
      amount: amount,
      currency: 'INR',
      transactionNote: `Points Purchase ${orderId}`,
      orderId: orderId,
      transactionId: orderData.transactionId,
      qrCode: `upi://pay?pa=anujvelani6@oksbi&pn=Rewear&am=${amount}&tn=Points Purchase ${orderId}&cu=INR`
    };
    
    return upiData;
  };

  const handlePurchase = async () => {
    if (!selectedPaymentApp) {
      toast.error('Please select a payment method');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          points, 
          paymentMethod: selectedPaymentApp,
          upiId: null
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Handle different payment methods
      if (selectedPaymentApp === 'razorpay') {
        // Use Razorpay modal for card/UPI payments
        await handleRazorpayPayment(orderData);
      } else {
        // Redirect to specific payment app
        await handlePaymentAppRedirect(selectedPaymentApp, orderData);
      }

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to initiate purchase');
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = async (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Rewear Points',
      description: `Purchase ${points} points`,
      order_id: orderData.orderId,
      prefill: {
        contact: '',
        email: '',
      },
      notes: {
        points: points.toString(),
        paymentMethod: selectedPaymentApp,
      },
      theme: {
        color: '#10b981',
      },
      handler: async function (response) {
        try {
          // Verify payment
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
            setSelectedPaymentApp('');
            setPoints(100);
            setShowQRCode(false);
            setQrCodeData(null);
            await refreshSession();
          } else {
            toast.error(verifyData.error || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed');
        }
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        },
      },
    };

    if (typeof window !== 'undefined' && window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      throw new Error('Razorpay is not available. Please refresh the page and try again.');
    }
  };

  const handlePaymentAppRedirect = async (appId, orderData) => {
    // Generate UPI payment link for the selected app
    const upiLink = generateUPILink(appId, orderData);
    
    if (upiLink) {
      // Open the payment app
      window.open(upiLink, '_blank');
      
      // Show success message
      toast.success(`Redirecting to ${PAYMENT_APPS[appId].name}...`);
      
      // Reset form
      setSelectedPaymentApp('');
      setPoints(100);
      setShowQRCode(false);
      setQrCodeData(null);
      setIsLoading(false);
      
      // Note: For UPI apps, you'll need to implement webhook verification
      // since direct redirect doesn't provide payment confirmation
    } else {
      throw new Error(`Payment method ${appId} is not supported yet`);
    }
  };

  const copyUPILink = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData.qrCode);
      toast.success('UPI link copied to clipboard!');
    }
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
      <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center">
        <span className="mr-2">💰</span>
        Purchase Points
      </h3>
      
      <div className="space-y-4">
        {/* Points Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Points Package
          </label>
          <div className="grid grid-cols-3 gap-2">
            {pointsOptions.map((option) => (
              <button
                key={option}
                onClick={() => handlePointsChange(option)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  points === option
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-700 font-semibold'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <div className="text-lg font-bold">{option}</div>
                <div className="text-xs text-gray-600">points</div>
                <div className="text-sm font-medium text-emerald-600">₹{option}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment App Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PAYMENT_APPS).map(([appId, app]) => (
              <button
                key={appId}
                onClick={() => handlePaymentAppSelect(appId)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  selectedPaymentApp === appId
                    ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <span className="text-2xl">{app.icon}</span>
                <span className="font-medium text-gray-700">{app.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Choose your preferred payment method to continue
          </p>
        </div>

        {/* QR Code Option for Desktop */}
        {isDesktop && selectedPaymentApp && selectedPaymentApp !== 'razorpay' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">💻 Desktop Payment Option</h4>
                <p className="text-sm text-blue-600">Generate QR code to pay with your phone</p>
              </div>
              <button
                onClick={generateQRCode}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        {showQRCode && qrCodeData && (
          <div className="bg-white p-6 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-gray-800 mb-4 text-center">📱 Scan QR Code to Pay</h4>
            
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              {/* QR Code Display */}
              <div className="bg-white p-6 rounded-lg border-2 border-emerald-300 shadow-lg">
                <div className="text-center">
                  <div className="text-6xl mb-3">📱</div>
                  <div className="text-lg font-bold text-emerald-700 mb-2">UPI QR Code</div>
                  <div className="text-sm text-gray-600 mb-3">Scan with any UPI app</div>
                  
                  {/* Payment Amount Display */}
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">₹{qrCodeData.amount}</div>
                    <div className="text-xs text-emerald-600">Amount to Pay</div>
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="space-y-4 min-w-[250px]">
                <div className="text-center md:text-left">
                  <h5 className="font-semibold text-gray-800 mb-3">Payment Details</h5>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Points:</span>
                    <span className="font-semibold">{points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Amount:</span>
                    <span className="font-semibold text-emerald-600">₹{qrCodeData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Order ID:</span>
                    <span className="font-mono text-xs">{qrCodeData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{PAYMENT_APPS[selectedPaymentApp]?.name}</span>
                  </div>
                </div>
                
                <div className="pt-3 space-y-2">
                  <button
                    onClick={copyUPILink}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
                  >
                    📋 Copy UPI Link
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowQRCode(false);
                      setQrCodeData(null);
                    }}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium transition-colors"
                  >
                    ❌ Close QR Code
                  </button>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="font-medium">💡 How to Pay:</div>
                    <div>• Open any UPI app (Google Pay, PhonePe, Paytm)</div>
                    <div>• Scan the QR code or paste the UPI link</div>
                    <div>• Confirm payment of ₹{qrCodeData.amount}</div>
                    <div>• Points will be added to your account</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Summary */}
        <div className="bg-white p-4 rounded-lg border border-emerald-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Points:</span>
            <span className="font-semibold">{points}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-emerald-600">₹{points}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total:</span>
              <span className="text-xl font-bold text-emerald-700">₹{points}</span>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isLoading || !selectedPaymentApp}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isLoading || !selectedPaymentApp
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Purchase ${points} Points - ₹${points}`
          )}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>• Secure payment via multiple payment methods</p>
          <p>• Points are added instantly after successful payment</p>
          <p>• 1 Point = ₹1 (1:1 ratio)</p>
          {isDesktop && (
            <p>• Desktop users can generate QR codes for mobile payment</p>
          )}
        </div>
      </div>
    </div>
  );
}
