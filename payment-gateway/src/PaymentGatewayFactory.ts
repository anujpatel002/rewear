import { 
  PaymentGateway, 
  GatewayConfig, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentVerification,
  ConfigurationError
} from './types';
import { RazorpayGateway } from './gateways/RazorpayGateway';

export class PaymentGatewayFactory {
  private static instance: PaymentGatewayFactory;
  private gateways: Map<string, PaymentGateway> = new Map();
  private defaultGateway: string | null = null;

  private constructor() {}

  static getInstance(): PaymentGatewayFactory {
    if (!PaymentGatewayFactory.instance) {
      PaymentGatewayFactory.instance = new PaymentGatewayFactory();
    }
    return PaymentGatewayFactory.instance;
  }

  /**
   * Register a payment gateway
   */
  registerGateway(name: string, gateway: PaymentGateway): void {
    this.gateways.set(name, gateway);
  }

  /**
   * Set the default gateway
   */
  setDefaultGateway(name: string): void {
    if (!this.gateways.has(name)) {
      throw new ConfigurationError(`Gateway '${name}' is not registered`);
    }
    this.defaultGateway = name;
  }

  /**
   * Get a specific gateway by name
   */
  getGateway(name: string): PaymentGateway {
    const gateway = this.gateways.get(name);
    if (!gateway) {
      throw new ConfigurationError(`Gateway '${name}' is not registered`);
    }
    return gateway;
  }

  /**
   * Get the default gateway
   */
  getDefaultGateway(): PaymentGateway {
    if (!this.defaultGateway) {
      throw new ConfigurationError('No default gateway set');
    }
    return this.getGateway(this.defaultGateway);
  }

  /**
   * Initialize a gateway with configuration
   */
  initializeGateway(name: string, config: GatewayConfig): void {
    const gateway = this.getGateway(name);
    gateway.initialize(config);
  }

  /**
   * Process payment using a specific gateway
   */
  async processPayment(gatewayName: string, request: PaymentRequest): Promise<PaymentResponse> {
    const gateway = this.getGateway(gatewayName);
    return await gateway.processPayment(request);
  }

  /**
   * Process payment using the default gateway
   */
  async processPaymentWithDefault(request: PaymentRequest): Promise<PaymentResponse> {
    const gateway = this.getDefaultGateway();
    return await gateway.processPayment(request);
  }

  /**
   * Verify payment using a specific gateway
   */
  async verifyPayment(gatewayName: string, verification: PaymentVerification): Promise<PaymentResponse> {
    const gateway = this.getGateway(gatewayName);
    return await gateway.verifyPayment(verification);
  }

  /**
   * Get all registered gateway names
   */
  getRegisteredGateways(): string[] {
    return Array.from(this.gateways.keys());
  }

  /**
   * Check if a gateway is registered
   */
  hasGateway(name: string): boolean {
    return this.gateways.has(name);
  }

  /**
   * Remove a gateway
   */
  removeGateway(name: string): boolean {
    if (this.defaultGateway === name) {
      this.defaultGateway = null;
    }
    return this.gateways.delete(name);
  }

  /**
   * Clear all gateways
   */
  clearGateways(): void {
    this.gateways.clear();
    this.defaultGateway = null;
  }
}

// Convenience function to get the factory instance
export const getPaymentGatewayFactory = () => PaymentGatewayFactory.getInstance();

// Auto-register common gateways
export const initializeDefaultGateways = () => {
  const factory = getPaymentGatewayFactory();
  
  // Register Razorpay gateway
  factory.registerGateway('razorpay', new RazorpayGateway());
  
  // Set Razorpay as default
  factory.setDefaultGateway('razorpay');
  
  return factory;
};
