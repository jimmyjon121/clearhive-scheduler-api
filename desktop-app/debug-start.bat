@echo off
title Family First Scheduler - Debug Mode

echo ========================================
echo Family First Scheduler - DEBUG MODE
echo ========================================
echo.
echo This window will stay open to show any errors.
echo.

REM Keep window open no matter what
set KEEP_OPEN=1

echo 🔍 System Information:
echo OS: %OS%
echo Path: %PATH%
echo Current Directory: %CD%
echo Script Directory: %~dp0
echo.

echo 🔍 Checking Node.js...
where node
if errorlevel 1 (
    echo ❌ Node.js not found in PATH
    goto :ERROR
) else (
    echo ✅ Node.js found
    node --version
)
echo.

echo 🔍 Checking npm...
where npm
if errorlevel 1 (
    echo ❌ npm not found in PATH
    goto :ERROR
) else (
    echo ✅ npm found
    npm --version
)
echo.

echo 🔍 Navigating to script directory...
cd /d "%~dp0"
echo New directory: %CD%
echo.

echo 🔍 Listing files in current directory:
dir /b
echo.

echo 🔍 Checking for package.json...
if not exist "package.json" (
    echo ❌ package.json NOT FOUND!
    echo Files in current directory:
    dir
    goto :ERROR
) else (
    echo ✅ package.json found
)
echo.

echo 🔍 Checking for node_modules...
if not exist "node_modules" (
    echo ⚠️  node_modules directory not found
    echo Will need to run npm install
    echo.
    echo 🔧 Running npm install...
    npm install
    if errorlevel 1 (
        echo ❌ npm install failed!
        goto :ERROR
    )
) else (
    echo ✅ node_modules found
)
echo.

echo 🚀 Attempting to start the app...
echo.
npm start

echo.
echo App has exited.
goto :END

:ERROR
echo.
echo ❌ ERROR DETECTED!
echo Please check the messages above for details.
echo.

:END
echo.
echo =====================================
echo Debug session complete.
echo This window will stay open so you can read the output.
echo Press any key to close...
pause >nul
