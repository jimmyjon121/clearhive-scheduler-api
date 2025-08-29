@echo off
REM Simple debug launcher that definitely keeps the window open

echo ================================================
echo Family First Scheduler - Simple Debug Mode
echo ================================================
echo.
echo This window will stay open - press any key to continue...
pause >nul

cd /d "%~dp0"

echo Current directory: %CD%
echo.

if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this from the desktop-app directory.
    goto :END
)

echo [+] package.json found

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    goto :END
)
echo [+] Node.js is installed

npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found!
    goto :END
)
echo [+] npm is installed

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
echo Starting Electron app...
echo (This window will stay open)
echo.

REM Start with error output visible
npx electron . 2>&1

echo.
echo Electron app has exited.
echo Exit code: %ERRORLEVEL%

:END
echo.
echo Press any key to close this window...
pause >nul

