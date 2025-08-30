# Universal Payment Gateway

A universal, framework-agnostic payment gateway module that supports multiple payment methods including Razorpay, Stripe, and PayPal. Built with TypeScript and designed for easy integration into any web application.

## 🚀 Features

- **Multi-Gateway Support**: Razorpay, Stripe, PayPal (extensible)
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript
- **TypeScript Support**: Full type safety and IntelliSense
- **Easy Integration**: Simple API with minimal configuration
- **Error Handling**: Comprehensive error handling with custom error types
- **React Components**: Ready-to-use React components
- **UMD/ESM/CommonJS**: Multiple module formats for different build systems

## 📦 Installation

```bash
npm install universal-payment-gateway
# or
yarn add universal-payment-gateway
```

## 🔧 Quick Start

### Basic Setup

```typescript
import { 
  setupPaymentGateway, 
  createRazorpayConfig,
  PaymentRequest 
} from 'universal-payment-gateway';

// Configure Razorpay
const config = createRazorpayConfig(
  'rzp_test_your_key_here',
  'test'
);

// Setup the gateway
const gateway = setupPaymentGateway(config);

// Create payment request
const paymentRequest: PaymentRequest = {
  amount: 100,
  currency: 'INR',
  orderId: 'order_123',
  description: 'Test payment'
};

// Process payment
try {
  const response = await gateway.processPaymentWithDefault(paymentRequest);
  console.log('Payment successful:', response);
} catch (error) {
  console.error('Payment failed:', error);
}
```

### React Component Usage

```tsx
import React from 'react';
import { 
  PaymentButton, 
  createRazorpayConfig,
  PaymentRequest 
} from 'universal-payment-gateway';

const MyComponent = () => {
  const config = createRazorpayConfig(
    'rzp_test_your_key_here',
    'test'
  );

  const paymentRequest: PaymentRequest = {
    amount: 100,
    currency: 'INR',
    orderId: 'order_123',
    description: 'Test payment'
  };

  const handleSuccess = (response: any) => {
    console.log('Payment successful:', response);
  };

  const handleError = (error: string) => {
    console.error('Payment failed:', error);
  };

  return (
    <PaymentButton
      config={config}
      request={paymentRequest}
      onSuccess={handleSuccess}
      onError={handleError}
      className="custom-button"
    >
      Pay ₹100
    </PaymentButton>
  );
};
```

## 🏗️ Architecture

### Core Components

1. **PaymentGateway Interface**: Defines the contract for all payment gateways
2. **Gateway Implementations**: Specific implementations for each payment provider
3. **PaymentGatewayFactory**: Manages multiple gateways and provides a unified interface
4. **React Components**: Ready-to-use UI components
5. **Type Definitions**: Comprehensive TypeScript interfaces

### Supported Gateways

- **Razorpay**: UPI, cards, net banking, wallets
- **Stripe**: Credit/debit cards, digital wallets
- **PayPal**: PayPal balance, cards, bank transfers

## 📚 API Reference

### Core Types

```typescript
interface PaymentRequest {
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

interface PaymentResponse {
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
```

### Configuration Helpers

```typescript
// Razorpay
const razorpayConfig = createRazorpayConfig(
  'public_key',
  'test', // or 'production'
  {
    currency: 'INR',
    theme: { color: '#10b981' },
    prefill: { email: 'user@example.com' }
  }
);

// Stripe
const stripeConfig = createStripeConfig(
  'publishable_key',
  'secret_key',
  'test'
);

// PayPal
const paypalConfig = createPayPalConfig(
  'client_id',
  'client_secret',
  'test'
);
```

### Factory Methods

```typescript
import { getPaymentGatewayFactory } from 'universal-payment-gateway';

const factory = getPaymentGatewayFactory();

// Register a custom gateway
factory.registerGateway('custom', customGateway);

// Set default gateway
factory.setDefaultGateway('razorpay');

// Process payment
const response = await factory.processPayment('razorpay', paymentRequest);

// Get all registered gateways
const gateways = factory.getRegisteredGateways();
```

## 🔌 Integration Examples

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Example</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script src="https://unpkg.com/universal-payment-gateway/dist/index.umd.js"></script>
</head>
<body>
    <button id="payButton">Pay ₹100</button>
    
    <script>
        const { setupPaymentGateway, createRazorpayConfig } = UniversalPaymentGateway;
        
        const config = createRazorpayConfig('rzp_test_key', 'test');
        const gateway = setupPaymentGateway(config);
        
        document.getElementById('payButton').addEventListener('click', async () => {
            try {
                const response = await gateway.processPaymentWithDefault({
                    amount: 100,
                    currency: 'INR',
                    orderId: 'order_' + Date.now(),
                    description: 'Test payment'
                });
                console.log('Payment successful:', response);
            } catch (error) {
                console.error('Payment failed:', error);
            }
        });
    </script>
</body>
</html>
```

### Vue.js

```vue
<template>
  <div>
    <button @click="processPayment" :disabled="isLoading">
      {{ isLoading ? 'Processing...' : 'Pay ₹100' }}
    </button>
  </div>
</template>

<script>
import { setupPaymentGateway, createRazorpayConfig } from 'universal-payment-gateway';

export default {
  data() {
    return {
      isLoading: false,
      gateway: null
    };
  },
  mounted() {
    const config = createRazorpayConfig('rzp_test_key', 'test');
    this.gateway = setupPaymentGateway(config);
  },
  methods: {
    async processPayment() {
      this.isLoading = true;
      try {
        const response = await this.gateway.processPaymentWithDefault({
          amount: 100,
          currency: 'INR',
          orderId: 'order_' + Date.now(),
          description: 'Test payment'
        });
        console.log('Payment successful:', response);
      } catch (error) {
        console.error('Payment failed:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { setupPaymentGateway, createRazorpayConfig } from 'universal-payment-gateway';

@Component({
  selector: 'app-payment',
  template: `
    <button (click)="processPayment()" [disabled]="isLoading">
      {{ isLoading ? 'Processing...' : 'Pay ₹100' }}
    </button>
  `
})
export class PaymentComponent implements OnInit {
  isLoading = false;
  gateway: any;

  ngOnInit() {
    const config = createRazorpayConfig('rzp_test_key', 'test');
    this.gateway = setupPaymentGateway(config);
  }

  async processPayment() {
    this.isLoading = true;
    try {
      const response = await this.gateway.processPaymentWithDefault({
        amount: 100,
        currency: 'INR',
        orderId: 'order_' + Date.now(),
        description: 'Test payment'
      });
      console.log('Payment successful:', response);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
```

## 🛠️ Custom Gateway Implementation

```typescript
import { PaymentGateway, PaymentRequest, PaymentResponse } from 'universal-payment-gateway';

export class CustomGateway implements PaymentGateway {
  private config: any = null;

  initialize(config: any): void {
    this.config = config;
  }

  async createOrder(request: PaymentRequest): Promise<PaymentResponse> {
    // Your custom order creation logic
    return {
      success: true,
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      status: 'pending',
      message: 'Order created'
    };
  }

  async verifyPayment(verification: any): Promise<PaymentResponse> {
    // Your custom verification logic
    return {
      success: true,
      orderId: verification.orderId,
      paymentId: verification.paymentId,
      amount: 0,
      currency: 'USD',
      status: 'completed',
      message: 'Payment verified'
    };
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Your custom payment processing logic
    return {
      success: true,
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      status: 'completed',
      message: 'Payment processed'
    };
  }
}

// Register custom gateway
const factory = getPaymentGatewayFactory();
factory.registerGateway('custom', new CustomGateway());
```

## 🚨 Error Handling

```typescript
import { 
  PaymentGatewayError, 
  ConfigurationError, 
  PaymentError 
} from 'universal-payment-gateway';

try {
  const response = await gateway.processPaymentWithDefault(paymentRequest);
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Configuration error:', error.message);
  } else if (error instanceof PaymentError) {
    console.error('Payment error:', error.message);
  } else if (error instanceof PaymentGatewayError) {
    console.error('Gateway error:', error.message, error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 🔒 Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify payments** on your backend
3. **Use HTTPS** in production
4. **Validate all inputs** before processing
5. **Implement proper error handling**

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🔄 Changelog

### v1.0.0
- Initial release
- Razorpay support
- React components
- TypeScript support
- Factory pattern implementation
