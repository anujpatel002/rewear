# Razorpay Setup Guide

## 1. Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Go to **Settings** → **API Keys**
4. Generate a new key pair
5. Copy your **Key ID** and **Key Secret**

## 2. Update Environment Variables

Add these variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_secret_key_here
```

**Important Notes:**
- Use `rzp_test_` prefix for test mode
- Use `rzp_live_` prefix for production mode
- Never commit your secret key to version control

## 3. Test Mode vs Production Mode

### Test Mode (Recommended for Development)
- Use test UPI IDs like `test@razorpay`
- No real money is charged
- Perfect for testing the integration

### Production Mode
- Use real UPI IDs
- Real money transactions
- Requires business verification with Razorpay

## 4. UPI ID Format

Valid UPI ID formats:
- `username@upi` (e.g., `john@okicici`)
- `username@bank` (e.g., `john@hdfcbank`)
- `username@paytm`
- `username@phonepe`

## 5. Testing the Integration

1. Start your development server
2. Go to Dashboard → Purchase Points
3. Select a points package
4. Enter a test UPI ID (e.g., `test@razorpay`)
5. Complete the payment flow
6. Check transaction history

## 6. Troubleshooting

### Common Issues:
- **"Invalid payment signature"**: Check your secret key
- **"Order not found"**: Verify order creation
- **"Payment verification failed"**: Check webhook/verification logic

### Debug Steps:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Check server logs for backend errors
4. Ensure environment variables are loaded

## 7. Security Best Practices

- ✅ Use environment variables for sensitive data
- ✅ Verify payment signatures on server side
- ✅ Implement proper error handling
- ✅ Log all payment attempts
- ✅ Use HTTPS in production
- ❌ Never expose secret keys in frontend code
- ❌ Don't skip payment verification

## 8. Production Deployment

Before going live:
1. Switch to production API keys
2. Update webhook URLs
3. Test with real UPI IDs
4. Implement proper logging
5. Set up monitoring
6. Configure error alerts

## 9. Support

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [API Reference](https://razorpay.com/docs/api/)
