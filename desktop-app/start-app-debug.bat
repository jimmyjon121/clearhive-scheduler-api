@echo off
REM Debug launcher to diagnose startup issues on Windows.
REM Keeps the console open and enables Electron logging.

title Family First Scheduler - Debug Launcher
setlocal enableextensions

cd /d "%~dp0"

echo -----------------------------------------------
echo Family First Scheduler - Debug Launcher (Windows)
echo -----------------------------------------------

REM Basic checks
node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install from https://nodejs.org and try again.
  goto :HOLD
)
npm --version >nul 2>&1
if errorlevel 1 (
  echo npm is not installed or not on PATH.
  echo Reinstall Node.js which includes npm.
  goto :HOLD
)

if not exist "package.json" (
  echo package.json not found. Please run from the desktop-app directory.
  goto :HOLD
)

echo Installing dependencies (if needed)...
call npm install
if errorlevel 1 (
  echo npm install failed. Check your internet connection or proxy settings.
  goto :HOLD
)

echo Enabling Electron debug logs...
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set DEBUG=*

echo Starting app...
REM Use cmd /k to keep the window open after Electron exits
cmd /k npm start

:HOLD
echo.
echo Press any key to close this window...
pause >nul
