@echo off
echo Deploying critical fixes for signup functionality...
echo.

echo Adding modified files...
git add models/User.js models/Transaction.js app/api/auth/[...action]/route.js app/auth/signup/page.js

echo.
echo Committing changes...
git commit -m "Fix module system mismatch - resolve signup internal server error"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done! Vercel should auto-deploy with the fixes.
echo Check your Vercel dashboard for deployment status.
pause
