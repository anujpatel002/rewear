@echo off
echo 🔧 Deploying QR Code and Mobile Redirect Fixes...
echo.

echo 📁 Adding modified files...
git add Components/PointsPurchase/page.js

echo.
echo 💾 Committing changes...
git commit -m "🔧 Fix QR code generation and mobile redirects

- Fix loading state management for UPI payments
- Add debug information for device detection
- Add manual QR code generation for testing
- Improve error handling for UPI data generation
- Fix mobile payment app redirects
- Add comprehensive logging for troubleshooting"

echo.
echo 🚀 Pushing to production...
git push origin main

echo.
echo ✅ QR code fixes deployed!
echo 🌐 Your live site will be updated in 1-2 minutes
echo.
echo 💡 Test the fixes:
echo   1. Go to: https://rewear-by-anujpatel.vercel.app
echo   2. Login and try to purchase points
echo   3. Select a UPI payment app (Google Pay, PhonePe, etc.)
echo   4. Desktop: Should show QR code generation button
echo   5. Mobile: Should redirect to payment app
echo   6. Check debug info at bottom of payment section
echo.
pause
