@echo off
setlocal enabledelayedexpansion

REM Create a log file immediately
set LOGFILE=%~dp0startup-debug.log
echo Starting Family First Scheduler at %DATE% %TIME% > "%LOGFILE%"

REM Change to script directory
cd /d "%~dp0"
echo Changed to directory: %CD% >> "%LOGFILE%"

REM Keep console open no matter what happens
set KEEP_OPEN=1

echo ================================================
echo Family First Scheduler - Windows Diagnostic Tool
echo ================================================
echo.
echo This window will stay open to show any errors.
echo Log file: %LOGFILE%
echo.

REM Test 1: Check if we're in the right place
echo [TEST 1] Checking directory structure...
if not exist "package.json" (
    echo FAIL: package.json not found in %CD%
    echo FAIL: package.json not found in %CD% >> "%LOGFILE%"
    echo.
    echo You need to run this from the desktop-app folder.
    echo Current folder should contain: package.json, main.js, renderer folder
    goto :SHOW_HELP
)
echo PASS: package.json found >> "%LOGFILE%"

if not exist "main.js" (
    echo FAIL: main.js not found
    echo FAIL: main.js not found >> "%LOGFILE%"
    goto :SHOW_HELP
)
echo PASS: main.js found >> "%LOGFILE%"

if not exist "renderer" (
    echo FAIL: renderer folder not found
    echo FAIL: renderer folder not found >> "%LOGFILE%"
    goto :SHOW_HELP
)
echo PASS: renderer folder found >> "%LOGFILE%"

echo [✓] Directory structure looks good
echo.

REM Test 2: Check Node.js
echo [TEST 2] Checking Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    echo FAIL: Node.js not found in PATH
    echo FAIL: Node.js not found in PATH >> "%LOGFILE%"
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Make sure to check "Add to PATH" during installation
    goto :SHOW_HELP
)

for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VER=%%i
if "%NODE_VER%"=="" (
    echo FAIL: Cannot get Node.js version
    echo FAIL: Cannot get Node.js version >> "%LOGFILE%"
    goto :SHOW_HELP
)
echo PASS: Node.js %NODE_VER% found >> "%LOGFILE%"
echo [✓] Node.js %NODE_VER% is installed
echo.

REM Test 3: Check npm
echo [TEST 3] Checking npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo FAIL: npm not found in PATH
    echo FAIL: npm not found in PATH >> "%LOGFILE%"
    goto :SHOW_HELP
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VER=%%i
echo PASS: npm %NPM_VER% found >> "%LOGFILE%"
echo [✓] npm %NPM_VER% is installed
echo.

REM Test 4: Install dependencies
echo [TEST 4] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies for the first time...
    echo This may take 2-5 minutes depending on your internet speed.
    echo.
    npm install >> "%LOGFILE%" 2>&1
    if errorlevel 1 (
        echo FAIL: npm install failed
        echo FAIL: npm install failed >> "%LOGFILE%"
        echo.
        echo Check your internet connection and try again.
        echo You can also try running: npm install --verbose
        goto :SHOW_HELP
    )
    echo PASS: Dependencies installed >> "%LOGFILE%"
    echo [✓] Dependencies installed successfully
) else (
    echo PASS: node_modules exists >> "%LOGFILE%"
    echo [✓] Dependencies already installed
)
echo.

REM Test 5: Check Electron
echo [TEST 5] Checking Electron...
if not exist "node_modules\.bin\electron.cmd" (
    echo FAIL: Electron not found in node_modules
    echo FAIL: Electron not found in node_modules >> "%LOGFILE%"
    echo.
    echo Try deleting node_modules folder and running npm install again
    goto :SHOW_HELP
)
echo PASS: Electron found >> "%LOGFILE%"
echo [✓] Electron is available
echo.

REM Test 6: Launch the app
echo [TEST 6] Starting the application...
echo ================================================
echo.
echo If a window opens briefly and closes, check the console output below:
echo.

echo LAUNCHING: npm start >> "%LOGFILE%"
npm start 2>&1 | tee -a "%LOGFILE%"

set EXIT_CODE=%ERRORLEVEL%
echo.
echo ================================================
echo Application exited with code: %EXIT_CODE%
echo Application exited with code: %EXIT_CODE% >> "%LOGFILE%"

if %EXIT_CODE% neq 0 (
    echo.
    echo Something went wrong. Common fixes:
    echo 1. Run as Administrator
    echo 2. Allow through Windows Defender/Antivirus
    echo 3. Check the log file: %LOGFILE%
)

goto :END

:SHOW_HELP
echo.
echo ================================================
echo TROUBLESHOOTING HELP
echo ================================================
echo.
echo This diagnostic found issues with your setup.
echo Please fix the issues above and try again.
echo.
echo Common solutions:
echo 1. Install Node.js from https://nodejs.org
echo 2. Make sure you extracted the ZIP file completely
echo 3. Run this script from the desktop-app folder
echo 4. Run as Administrator if you get permission errors
echo 5. Allow the app through Windows Security/Antivirus
echo.

:END
echo.
echo Full log saved to: %LOGFILE%
echo.
echo Press any key to close this window...
pause >nul
