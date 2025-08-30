import React, { useState, useCallback } from 'react';
import { 
  PaymentButtonProps, 
  PaymentRequest, 
  PaymentResponse,
  RazorpayConfig 
} from '../types';
import { getPaymentGatewayFactory } from '../PaymentGatewayFactory';

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  config,
  request,
  onSuccess,
  onError,
  onCancel,
  className = '',
  disabled = false,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const factory = getPaymentGatewayFactory();
      
      // Initialize gateway if not already done
      if (!factory.hasGateway(config.gateway)) {
        if (config.gateway === 'razorpay') {
          const { RazorpayGateway } = await import('../gateways/RazorpayGateway');
          factory.registerGateway('razorpay', new RazorpayGateway());
        }
      }

      // Initialize the gateway
      factory.initializeGateway(config.gateway, config);

      // Process payment
      const response = await factory.processPayment(config.gateway, request);

      if (response.success) {
        onSuccess?.(response);
      } else {
        throw new Error(response.error || 'Payment failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [config, request, onSuccess, onError, disabled, isLoading]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <div className={`payment-button-container ${className}`}>
      <button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={`payment-button ${isLoading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      >
        {isLoading ? (
          <div className="payment-button-loading">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        ) : (
          children || `Pay ${request.currency} ${request.amount}`
        )}
      </button>
      
      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;
