@echo off
title Family First Scheduler - Desktop App

REM Keep window open on any error
setlocal enableextensions

echo.
echo 🏥 Family First Scheduler - Starting Desktop App...
echo ================================================================
echo.
echo 🔍 Debugging info:
echo Current directory: %CD%
echo Script location: %~dp0
echo.

REM Check if Node.js is installed
echo 🔍 Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo 📥 Please download and install Node.js from: https://nodejs.org
    echo.
    echo 🛑 Press any key to close this window...
    pause >nul
    exit /b 1
)

REM Check if npm is installed
echo 🔍 Checking for npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    echo 📥 Please install npm (usually comes with Node.js)
    echo.
    echo 🛑 Press any key to close this window...
    pause >nul
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Navigate to script directory
echo 🔍 Navigating to script directory...
cd /d "%~dp0"
echo Current directory after navigation: %CD%

REM Check if package.json exists
echo 🔍 Looking for package.json...
if not exist "package.json" (
    echo ❌ package.json not found!
    echo 📁 Make sure you're in the desktop-app directory
    echo 📁 Current directory: %CD%
    dir
    echo.
    echo 🛑 Press any key to close this window...
    pause >nul
    exit /b 1
)
echo ✅ Found package.json

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies for the first time...
    echo This may take a few minutes...
    npm install
    if errorlevel 1 (
        echo ❌ npm install failed!
        echo 🛑 Press any key to close this window...
        pause >nul
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
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

npm start

set EXIT_CODE=%ERRORLEVEL%
echo.
if %EXIT_CODE% neq 0 (
    echo ❌ App exited with error code: %EXIT_CODE%
    echo � Check the error messages above
) else (
    echo ✅ App closed normally
)
echo �👋 Family First Scheduler has been closed.
echo.
echo 🛑 Press any key to close this window...
pause >nul
