import { 
  PaymentGateway, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentVerification, 
  RazorpayConfig,
  PaymentGatewayError,
  ConfigurationError,
  PaymentError,
  VerificationError
} from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class RazorpayGateway implements PaymentGateway {
  private config: RazorpayConfig | null = null;
  private isInitialized = false;

  initialize(config: RazorpayConfig): void {
    if (config.gateway !== 'razorpay') {
      throw new ConfigurationError('Invalid gateway type for RazorpayGateway');
    }

    if (!config.publicKey) {
      throw new ConfigurationError('Razorpay public key is required');
    }

    this.config = config;
    this.isInitialized = true;
  }

  async createOrder(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isInitialized || !this.config) {
      throw new ConfigurationError('Gateway not initialized');
    }

    try {
      // In a real implementation, you would call your backend API
      // to create the order and get the order ID
      const orderId = request.orderId || `order_${Date.now()}`;
      
      return {
        success: true,
        orderId,
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        message: 'Order created successfully',
        metadata: { gateway: 'razorpay' }
      };
    } catch (error) {
      throw new PaymentError(
        'Failed to create order',
        { originalError: error, request }
      );
    }
  }

  async verifyPayment(verification: PaymentVerification): Promise<PaymentResponse> {
    if (!this.isInitialized || !this.config) {
      throw new ConfigurationError('Gateway not initialized');
    }

    try {
      // In a real implementation, you would call your backend API
      // to verify the payment signature
      if (!verification.signature) {
        throw new VerificationError('Payment signature is required for verification');
      }

      // Verify signature logic would go here
      const isValid = await this.verifySignature(
        verification.orderId,
        verification.paymentId,
        verification.signature
      );

      if (!isValid) {
        throw new VerificationError('Invalid payment signature');
      }

      return {
        success: true,
        orderId: verification.orderId,
        paymentId: verification.paymentId,
        amount: 0, // This would come from your backend
        currency: this.config.currency || 'INR',
        status: 'completed',
        message: 'Payment verified successfully',
        metadata: { gateway: 'razorpay' }
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new VerificationError(
        'Failed to verify payment',
        { originalError: error, verification }
      );
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isInitialized || !this.config) {
      throw new ConfigurationError('Gateway not initialized');
    }

    try {
      // Create order first
      const orderResponse = await this.createOrder(request);
      
      // Open Razorpay payment modal
      const paymentResponse = await this.openPaymentModal(request, orderResponse.orderId!);
      
      return paymentResponse;
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new PaymentError(
        'Failed to process payment',
        { originalError: error, request }
      );
    }
  }

  private async openPaymentModal(request: PaymentRequest, orderId: string): Promise<PaymentResponse> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.Razorpay) {
        reject(new ConfigurationError('Razorpay is not available in this environment'));
        return;
      }

      const options = {
        key: this.config!.publicKey,
        amount: request.amount * 100, // Convert to paise
        currency: request.currency,
        name: 'Your Company Name',
        description: request.description,
        order_id: orderId,
        prefill: {
          name: request.customerName || '',
          email: request.customerEmail || '',
          contact: request.customerPhone || '',
          ...this.config!.prefill
        },
        notes: request.metadata || {},
        theme: {
          color: '#10b981',
          ...this.config!.theme
        },
        handler: (response: any) => {
          resolve({
            success: true,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount: request.amount,
            currency: request.currency,
            status: 'completed',
            message: 'Payment completed successfully',
            metadata: { 
              gateway: 'razorpay',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id
            }
          });
        },
        modal: {
          ondismiss: () => {
            reject(new PaymentError('Payment was cancelled by user'));
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        reject(new PaymentError('Failed to open payment modal', { originalError: error }));
      }
    });
  }

  private async verifySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    // In a real implementation, this would be done on your backend
    // for security reasons. This is just a placeholder.
    try {
      const body = orderId + "|" + paymentId;
      // You would need the secret key to verify the signature
      // This should be done on your backend, not in the frontend
      return true; // Placeholder
    } catch (error) {
      return false;
    }
  }

  // Utility method to check if Razorpay is available
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Razorpay;
  }

  // Utility method to load Razorpay script
  static loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Cannot load script in server environment'));
        return;
      }

      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }
}
