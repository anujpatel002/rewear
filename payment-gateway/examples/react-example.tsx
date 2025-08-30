import React, { useState } from 'react';
import { 
  PaymentButton, 
  createRazorpayConfig,
  PaymentRequest,
  PaymentResponse 
} from '../src/index';

const ReactPaymentExample: React.FC = () => {
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState('INR');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  // Configure Razorpay
  const config = createRazorpayConfig(
    'rzp_test_your_key_here', // Replace with your test key
    'test',
    {
      currency: 'INR',
      theme: { color: '#10b981' },
      prefill: { 
        email: customerEmail,
        name: customerName 
      }
    }
  );

  const handleSuccess = (response: PaymentResponse) => {
    setPaymentStatus(`Payment successful! Transaction ID: ${response.transactionId}`);
    console.log('Payment successful:', response);
  };

  const handleError = (error: string) => {
    setPaymentStatus(`Payment failed: ${error}`);
    console.error('Payment failed:', error);
  };

  const handleCancel = () => {
    setPaymentStatus('Payment was cancelled');
    console.log('Payment cancelled');
  };

  const paymentRequest: PaymentRequest = {
    amount,
    currency,
    orderId: `order_${Date.now()}`,
    description: `Payment for ${currency} ${amount}`,
    customerEmail,
    customerName,
    metadata: {
      source: 'react-example',
      timestamp: new Date().toISOString()
    }
  };

  return (
    <div className="payment-example">
      <h2>React Payment Gateway Example</h2>
      
      <div className="form-group">
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          step="1"
        />
      </div>

      <div className="form-group">
        <label>Currency:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Customer Email:</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="customer@example.com"
        />
      </div>

      <div className="form-group">
        <label>Customer Name:</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="John Doe"
        />
      </div>

      <div className="payment-button-container">
        <PaymentButton
          config={config}
          request={paymentRequest}
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={handleCancel}
          className="custom-payment-button"
          disabled={!customerEmail || !customerName}
        >
          Pay {currency} {amount}
        </PaymentButton>
      </div>

      {paymentStatus && (
        <div className={`payment-status ${paymentStatus.includes('successful') ? 'success' : 'error'}`}>
          {paymentStatus}
        </div>
      )}

      <style jsx>{`
        .payment-example {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .payment-button-container {
          margin: 20px 0;
        }

        .custom-payment-button {
          width: 100%;
          padding: 12px 24px;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .custom-payment-button:hover:not(:disabled) {
          background-color: #059669;
        }

        .custom-payment-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .payment-status {
          margin-top: 15px;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }

        .payment-status.success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .payment-status.error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
      `}</style>
    </div>
  );
};

export default ReactPaymentExample;
