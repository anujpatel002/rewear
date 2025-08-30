@echo off
echo Starting Rewear Development Servers...
echo.

echo Starting Socket Server...
start "Socket Server" cmd /k "npm run dev"

echo Waiting for socket server to start...
timeout /t 3 /nobreak >nul

echo Starting Next.js Development Server...
start "Next.js Dev" cmd /k "npm run dev:next"

echo.
echo Both servers are starting...
echo Socket Server: http://localhost:3000
echo Next.js Dev: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
