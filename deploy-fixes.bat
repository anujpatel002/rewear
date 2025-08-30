@echo off
echo 🚨 CRITICAL: Deploying Fixes for Production Order Creation
echo ===========================================================
echo.

echo 📋 Current Issues on Live Site:
echo - ❌ Failed to create order
echo - ❌ Module system mismatch
echo - ❌ Payment method validation errors
echo.

echo 🔧 Fixes Being Deployed:
echo - ✅ Module system fixes (User.js, Transaction.js)
echo - ✅ Payment method mapping
echo - ✅ Transaction model compatibility
echo - ✅ QR code generation for desktop
echo.

echo 📁 Adding Critical Files...
git add models/User.js
git add models/Transaction.js
git add app/api/payment/create-order/route.js
git add Components/PointsPurchase/page.js
git add config/payment-apps.js
echo ✅ Files added to staging
echo.

echo 💾 Committing Fixes...
git commit -m "🚨 CRITICAL: Fix production order creation issues

- Fix module system mismatch (CommonJS vs ES modules)
- Add payment method mapping for UPI apps
- Update Transaction model to support all payment methods
- Add QR code generation for desktop users
- Resolve 'failed to create order' error"
echo.

echo 📤 Pushing to Production...
git push origin main
echo.

echo 🎯 DEPLOYMENT STATUS:
echo =====================
echo ✅ Code pushed to GitHub
echo 🔄 Vercel auto-deploying...
echo ⏱️  Wait 2-5 minutes for deployment
echo.
echo 🔍 Check deployment at:
echo    https://vercel.com/dashboard
echo.
echo 🧪 Test after deployment:
echo    https://rewear-by-anujpatel.vercel.app/auth/signup
echo    https://rewear-by-anujpatel.vercel.app/pages/Dashboard
echo.

echo Press any key to continue...
pause > nul
