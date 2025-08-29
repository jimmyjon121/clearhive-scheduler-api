@echo off
REM Extra-simple launcher that catches common errors

echo =====================================
echo Family First Scheduler - Easy Launch
echo =====================================
echo.

cd /d "%~dp0"

REM Check Node.js
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo [ERROR] Please install Node.js from nodejs.org
    goto :END
)

REM Check for package.json
if not exist "package.json" (
    echo [ERROR] package.json not found
    echo Make sure you're in the desktop-app folder
    goto :END
)

REM Install if needed
if not exist "node_modules" (
    echo Installing dependencies (first run only)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        goto :END
    )
)

echo Starting app...
echo.
echo If the app closes instantly:
echo 1. Check debug-launcher.log for errors
echo 2. Try running as administrator
echo 3. Allow through Windows Security
echo.

REM Launch with all output visible
call npm start

:END
echo.
echo Press any key to exit...
pause >nul
