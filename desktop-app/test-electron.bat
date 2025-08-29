@echo off
REM Test launcher to check if Electron works at all

echo ================================================
echo Electron Test Launcher
echo ================================================
echo.
echo This will test if Electron can start on your system.
echo.

cd /d "%~dp0"

if not exist "package.json" (
    echo ERROR: package.json not found!
    goto :END
)

echo [+] package.json found

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    goto :END
)
echo [+] Node.js is installed

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed!
        goto :END
    )
)

echo [+] Dependencies ready

echo.
echo Starting simple test Electron app...
echo (This should show a basic window)
echo.

REM Start the test app
npx electron test-main.js 2>&1

echo.
echo Test app has exited.
echo Exit code: %ERRORLEVEL%

:END
echo.
echo Press any key to close this window...
pause >nul
