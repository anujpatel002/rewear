'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSession } from '@/context/SessionContext';

export default function PointsPurchase() {
  const [points, setPoints] = useState(100);
  const [upiId, setUpiId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshSession } = useSession();

  const pointsOptions = [50, 100, 200, 500, 1000, 2000];

  const handlePointsChange = (value) => {
    setPoints(value);
  };

  const handlePurchase = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }

    if (!upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g., username@upi)');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, upiId: upiId.trim() }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
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
          upiId: upiId.trim(),
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
              setUpiId('');
              setPoints(100);
              await refreshSession(); // Refresh user session to get updated points
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

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to initiate purchase');
      setIsLoading(false);
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

        {/* UPI ID Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="username@upi (e.g., john@okicici)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your UPI ID to receive payment confirmation
          </p>
        </div>

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
          disabled={isLoading || !upiId.trim()}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isLoading || !upiId.trim()
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
          <p>• Secure payment via Razorpay</p>
          <p>• Points are added instantly after successful payment</p>
          <p>• 1 Point = ₹1 (1:1 ratio)</p>
        </div>
      </div>
    </div>
  );
}
