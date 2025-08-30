# Universal Payment Gateway - Build and Usage Guide

## 🏗️ Building the Module

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Build Steps

1. **Install Dependencies**
   ```bash
   cd payment-gateway
   npm install
   ```

2. **Build the Module**
   ```bash
   npm run build
   ```

3. **Clean Build**
   ```bash
   npm run clean
   npm run build
   ```

### Build Outputs

The build process creates multiple formats in the `dist/` folder:

- **`index.js`** - CommonJS format (Node.js)
- **`index.esm.js`** - ES Module format (modern bundlers)
- **`index.umd.js`** - UMD format (browsers, AMD)
- **`index.d.ts`** - TypeScript declarations
- **Source maps** for debugging

## 📦 Publishing to NPM

### 1. Prepare for Publishing

```bash
# Update version in package.json
npm version patch  # or minor/major

# Build the module
npm run build

# Test the build
npm test
```

### 2. Publish

```bash
npm publish
```

### 3. Tag Release (Optional)

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 Using in Different Environments

### React Application

```bash
npm install universal-payment-gateway
```

```tsx
import React from 'react';
import { 
  PaymentButton, 
  createRazorpayConfig,
  PaymentRequest 
} from 'universal-payment-gateway';

const App = () => {
  const config = createRazorpayConfig(
    'rzp_test_your_key',
    'test'
  );

  const paymentRequest: PaymentRequest = {
    amount: 100,
    currency: 'INR',
    orderId: 'order_123',
    description: 'Test payment'
  };

  return (
    <PaymentButton
      config={config}
      request={paymentRequest}
      onSuccess={(response) => console.log('Success:', response)}
      onError={(error) => console.error('Error:', error)}
    >
      Pay ₹100
    </PaymentButton>
  );
};
```

### Vue.js Application

```bash
npm install universal-payment-gateway
```

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
        console.log('Success:', response);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
```

### Angular Application

```bash
npm install universal-payment-gateway
```

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
      console.log('Success:', response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
```

### Vanilla JavaScript (Browser)

```html
<!-- Load Razorpay -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<!-- Load the module -->
<script src="https://unpkg.com/universal-payment-gateway/dist/index.umd.js"></script>

<script>
  const { setupPaymentGateway, createRazorpayConfig } = UniversalPaymentGateway;
  
  const config = createRazorpayConfig('rzp_test_key', 'test');
  const gateway = setupPaymentGateway(config);
  
  // Use the gateway
  gateway.processPaymentWithDefault({
    amount: 100,
    currency: 'INR',
    orderId: 'order_' + Date.now(),
    description: 'Test payment'
  }).then(response => {
    console.log('Success:', response);
  }).catch(error => {
    console.error('Error:', error);
  });
</script>
```

### Node.js Backend

```bash
npm install universal-payment-gateway
```

```javascript
const { 
  setupPaymentGateway, 
  createRazorpayConfig 
} = require('universal-payment-gateway');

const config = createRazorpayConfig('rzp_test_key', 'test');
const gateway = setupPaymentGateway(config);

// Use in Express route
app.post('/api/payment', async (req, res) => {
  try {
    const response = await gateway.processPaymentWithDefault({
      amount: req.body.amount,
      currency: req.body.currency,
      orderId: req.body.orderId,
      description: req.body.description
    });
    
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🎯 Advanced Usage

### Multiple Gateways

```typescript
import { getPaymentGatewayFactory } from 'universal-payment-gateway';

const factory = getPaymentGatewayFactory();

// Register multiple gateways
factory.registerGateway('razorpay', razorpayGateway);
factory.registerGateway('stripe', stripeGateway);
factory.registerGateway('paypal', paypalGateway);

// Use specific gateway
const response = await factory.processPayment('stripe', paymentRequest);
```

### Custom Gateway Implementation

```typescript
import { PaymentGateway, PaymentRequest, PaymentResponse } from 'universal-payment-gateway';

export class CustomGateway implements PaymentGateway {
  initialize(config: any): void {
    // Initialize your custom gateway
  }

  async createOrder(request: PaymentRequest): Promise<PaymentResponse> {
    // Implement order creation
  }

  async verifyPayment(verification: any): Promise<PaymentResponse> {
    // Implement payment verification
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implement payment processing
  }
}

// Register custom gateway
const factory = getPaymentGatewayFactory();
factory.registerGateway('custom', new CustomGateway());
```

### Error Handling

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

## 🔒 Security Best Practices

### Frontend (Client-Side)

1. **Never expose secret keys**
2. **Use test keys for development**
3. **Validate all inputs**
4. **Implement proper error handling**

### Backend (Server-Side)

1. **Store secret keys securely**
2. **Verify payment signatures**
3. **Validate payment data**
4. **Log all transactions**
5. **Implement webhook handling**

### Environment Variables

```bash
# .env
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_ENVIRONMENT=test

# Production
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_ENVIRONMENT=production
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
# Test with real Razorpay test keys
npm run test:integration
```

### Manual Testing

1. Use test Razorpay keys
2. Test with small amounts
3. Verify webhook handling
4. Test error scenarios

## 🚀 Deployment

### Production Checklist

- [ ] Use production API keys
- [ ] Enable HTTPS
- [ ] Set up webhook endpoints
- [ ] Configure error monitoring
- [ ] Test payment flow
- [ ] Monitor transactions

### Environment-Specific Configs

```typescript
const config = createRazorpayConfig(
  process.env.RAZORPAY_KEY_ID!,
  process.env.NODE_ENV === 'production' ? 'production' : 'test',
  {
    currency: process.env.DEFAULT_CURRENCY || 'INR',
    theme: { color: process.env.THEME_COLOR || '#10b981' }
  }
);
```

## 📊 Monitoring and Analytics

### Transaction Logging

```typescript
// Log all payment attempts
gateway.on('payment:attempt', (data) => {
  console.log('Payment attempt:', data);
});

// Log successful payments
gateway.on('payment:success', (data) => {
  console.log('Payment success:', data);
  // Send to analytics service
});

// Log failed payments
gateway.on('payment:error', (error) => {
  console.error('Payment error:', error);
  // Send to error tracking service
});
```

### Performance Metrics

- Payment success rate
- Average processing time
- Error rates by gateway
- User abandonment rates

## 🔧 Troubleshooting

### Common Issues

1. **Razorpay script not loading**
   - Check internet connection
   - Verify script URL
   - Check browser console for errors

2. **Payment modal not opening**
   - Verify API key
   - Check amount format (paise for Razorpay)
   - Ensure all required fields are filled

3. **Payment verification failing**
   - Check signature verification
   - Verify webhook configuration
   - Check server logs

4. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript version compatibility
   - Verify all dependencies are installed

### Debug Mode

```typescript
// Enable debug logging
const config = createRazorpayConfig('key', 'test', {
  debug: true
});

// Check gateway status
console.log('Gateway available:', gateway.isAvailable());
console.log('Registered gateways:', factory.getRegisteredGateways());
```

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Documentation](https://developer.paypal.com/)
- [Payment Gateway Security](https://owasp.org/www-project-payment-security-standards/)

## 🤝 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and examples
- **Examples**: Working code samples for all frameworks
- **Community**: Join discussions and share solutions
