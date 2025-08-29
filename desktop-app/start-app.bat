@echo off
title Family First Scheduler - Desktop App

setlocal enableextensions
set LOGFILE="%~dp0start-app.log"

echo.
echo 🏥 Family First Scheduler - Starting Desktop App...
echo ================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo 📥 Please download and install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    echo 📥 Please install npm (usually comes with Node.js)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Navigate to script directory
cd /d "%~dp0"

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found!
    echo 📁 Make sure you're in the desktop-app directory
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies for the first time...
    echo This may take a few minutes...
    call npm install >> %LOGFILE% 2>&1
    echo.
)

REM Check API connection
echo 🌐 Checking API connection...
curl -s --head https://clearhive-scheduler-api-production-4c35.up.railway.app/api/v1/programs > nul 2>&1
if errorlevel 1 (
    echo ⚠️  API connection issue - app will run in offline mode
) else (
    echo ✅ API is online and responding
)
echo.

REM Start the desktop app
echo 🚀 Starting Family First Scheduler...
echo 📱 The desktop app will open automatically
echo 🔄 To restart, run this script again
echo ❌ To quit, close this window or press Ctrl+C
echo.

REM Use CALL so the script continues after npm (npm is a .cmd on Windows)
call npm start >> %LOGFILE% 2>&1

set EXITCODE=%ERRORLEVEL%

echo.
echo 👋 Family First Scheduler has been closed.
if not %EXITCODE%==0 (
    echo ❗ The app exited with code %EXITCODE%. See %LOGFILE% for details.
)
pause
