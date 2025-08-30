// Main exports for the Universal Payment Gateway

// Core types and interfaces
export * from './types';

// Gateway implementations
export { RazorpayGateway } from './gateways/RazorpayGateway';

// Factory and utilities
export { 
  PaymentGatewayFactory, 
  getPaymentGatewayFactory, 
  initializeDefaultGateways 
} from './PaymentGatewayFactory';

// React components
export { default as PaymentButton } from './components/PaymentButton';

// Utility functions
export const loadRazorpayScript = async () => {
  const { RazorpayGateway } = await import('./gateways/RazorpayGateway');
  return RazorpayGateway.loadScript();
};

export const isRazorpayAvailable = () => {
  const { RazorpayGateway } = require('./gateways/RazorpayGateway');
  return RazorpayGateway.isAvailable();
};

// Default configuration helpers
export const createRazorpayConfig = (
  publicKey: string,
  environment: 'test' | 'production' = 'test',
  options?: Partial<{
    currency: string;
    locale: string;
    theme: { color?: string; hide_topbar?: boolean };
    prefill: { name?: string; email?: string; contact?: string };
  }>
) => ({
  gateway: 'razorpay' as const,
  publicKey,
  environment,
  currency: options?.currency || 'INR',
  locale: options?.locale || 'en',
  theme: options?.theme || { color: '#10b981' },
  prefill: options?.prefill || {},
});

export const createStripeConfig = (
  publishableKey: string,
  secretKey: string,
  environment: 'test' | 'production' = 'test',
  options?: Partial<{
    currency: string;
    locale: string;
  }>
) => ({
  gateway: 'stripe' as const,
  publishableKey,
  secretKey,
  environment,
  currency: options?.currency || 'USD',
  locale: options?.locale || 'en',
});

export const createPayPalConfig = (
  clientId: string,
  clientSecret: string,
  environment: 'test' | 'production' = 'test',
  options?: Partial<{
    currency: string;
    locale: string;
  }>
) => ({
  gateway: 'paypal' as const,
  clientId,
  clientSecret,
  environment,
  currency: options?.currency || 'USD',
  locale: options?.locale || 'en_US',
});

// Quick setup function
export const setupPaymentGateway = (config: any) => {
  const factory = getPaymentGatewayFactory();
  
  // Auto-register gateways based on config
  if (config.gateway === 'razorpay') {
    const { RazorpayGateway } = require('./gateways/RazorpayGateway');
    factory.registerGateway('razorpay', new RazorpayGateway());
    factory.setDefaultGateway('razorpay');
  }
  
  // Initialize the gateway
  factory.initializeGateway(config.gateway, config);
  
  return factory;
};

// Version info
export const VERSION = '1.0.0';
export const SUPPORTED_GATEWAYS = ['razorpay', 'stripe', 'paypal'] as const;
