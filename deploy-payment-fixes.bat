@echo off
echo 🚀 Deploying Payment Gateway Fixes to Production...
echo.

echo 📁 Adding modified files...
git add Components/PointsPurchase/page.js
git add config/payment-apps.js

echo.
echo 💾 Committing changes...
git commit -m "🔧 Fix payment gateway QR code and mobile redirect issues

- Add proper QR code generation for desktop users
- Fix mobile payment app redirects
- Improve desktop/mobile detection
- Add merchant UPI ID to all payment apps
- Enhance UPI link generation
- Fix 'order created but no QR code' issue"

echo.
echo 🚀 Pushing to production...
git push origin main

echo.
echo ✅ Payment gateway fixes deployed!
echo 🌐 Your live site will be updated in 1-2 minutes
echo.
echo 💡 Test the fixes:
echo   1. Go to: https://rewear-by-anujpatel.vercel.app
echo   2. Login and try to purchase points
echo   3. Desktop: Should show QR code
echo   4. Mobile: Should redirect to payment app
echo.
pause
