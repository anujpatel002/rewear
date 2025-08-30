// Payment Gateway Types and Interfaces

export interface PaymentConfig {
  gateway: 'razorpay' | 'stripe' | 'paypal';
  publicKey: string;
  secretKey?: string;
  environment: 'test' | 'production';
  currency?: string;
  locale?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature?: string;
  transactionId?: string;
}

export interface PaymentGateway {
  initialize(config: PaymentConfig): void;
  createOrder(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(verification: PaymentVerification): Promise<PaymentResponse>;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}

export interface RazorpayConfig extends PaymentConfig {
  gateway: 'razorpay';
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface StripeConfig extends PaymentConfig {
  gateway: 'stripe';
  publishableKey: string;
  secretKey: string;
}

export interface PayPalConfig extends PaymentConfig {
  gateway: 'paypal';
  clientId: string;
  clientSecret: string;
}

export type GatewayConfig = RazorpayConfig | StripeConfig | PayPalConfig;

// React Component Props
export interface PaymentButtonProps {
  config: GatewayConfig;
  request: PaymentRequest;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface PaymentFormProps {
  config: GatewayConfig;
  onPayment: (request: PaymentRequest) => void;
  className?: string;
  showAmountInput?: boolean;
  showCustomerFields?: boolean;
  defaultAmount?: number;
  defaultCurrency?: string;
}

// Error Types
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}

export class ConfigurationError extends PaymentGatewayError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

export class PaymentError extends PaymentGatewayError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_ERROR', details);
    this.name = 'PaymentError';
  }
}

export class VerificationError extends PaymentGatewayError {
  constructor(message: string, details?: any) {
    super(message, 'VERIFICATION_ERROR', details);
    this.name = 'VerificationError';
  }
}
