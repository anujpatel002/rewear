# Payment Apps Setup Guide

## 🎯 What's New

The points purchase system has been updated to:
- ❌ **Remove UPI ID input field**
- ✅ **Show direct payment app options**
- ✅ **Redirect users to their chosen payment app**
- ✅ **Support multiple payment methods**

## 🔧 Configuration Required

### Step 1: Update Merchant UPI ID

Edit `config/payment-apps.js` and replace the placeholder UPI ID:

```javascript
// Change this line:
export const MERCHANT_UPI_ID = 'your-merchant-upi@okicici';

// To your actual UPI ID, for example:
export const MERCHANT_UPI_ID = 'anuj@okicici';
```

### Step 2: Test Payment Apps

After updating the UPI ID, test each payment method:

1. **Google Pay** - Should open Google Pay app
2. **PhonePe** - Should open PhonePe app  
3. **Paytm** - Should open Paytm app
4. **Amazon Pay** - Should open Amazon Pay app
5. **BHIM UPI** - Should open BHIM app
6. **Razorpay** - Should open Razorpay modal

## 📱 How It Works

### For UPI Apps (Google Pay, PhonePe, etc.):
1. User selects payment app
2. Clicks "Purchase Points"
3. System generates UPI payment link
4. Opens the selected payment app
5. User completes payment in the app

### For Razorpay:
1. User selects Razorpay
2. Clicks "Purchase Points"
3. Razorpay modal opens
4. User can pay via card/UPI/other methods
5. Payment verification happens automatically

## ⚠️ Important Notes

### UPI App Limitations:
- **No automatic payment confirmation** - UPI apps don't provide webhook callbacks
- **Manual verification needed** - You'll need to manually verify payments
- **Consider implementing webhook verification** for production use

### Razorpay Advantages:
- **Automatic verification** - Payment confirmation is automatic
- **Multiple payment methods** - Cards, UPI, wallets, etc.
- **Better user experience** - Integrated payment flow

## 🚀 Deployment

1. **Update the UPI ID** in `config/payment-apps.js`
2. **Commit and push** the changes
3. **Deploy to production** - Vercel will auto-deploy
4. **Test the payment flow** on live site

## 🔍 Troubleshooting

### Payment App Not Opening:
- Check if the UPI ID is correct
- Verify the UPI scheme URLs are valid
- Test on mobile devices (UPI apps work best on mobile)

### Razorpay Not Working:
- Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `.env`
- Check if Razorpay script is loading in browser console
- Verify the API keys are correct

## 📋 Supported Payment Methods

| App | UPI Scheme | Status |
|-----|------------|---------|
| Google Pay | `googleplay://upi/pay` | ✅ Ready |
| PhonePe | `phonepe://pay` | ✅ Ready |
| Paytm | `paytmmp://pay` | ✅ Ready |
| Amazon Pay | `amazonpay://upi/pay` | ✅ Ready |
| BHIM UPI | `upi://pay` | ✅ Ready |
| Razorpay | Modal | ✅ Ready |

## 🎉 Benefits

- **Better UX**: No need to type UPI ID
- **Faster checkout**: Direct app redirect
- **Multiple options**: Users can choose their preferred app
- **Mobile optimized**: Works great on mobile devices
- **Professional look**: Clean, modern payment interface
