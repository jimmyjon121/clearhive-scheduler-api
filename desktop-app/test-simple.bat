@echo off
echo =====================================
echo Super Simple Electron Test
echo =====================================
echo.

cd /d "%~dp0"

REM Use the simple main file
echo Testing with simplified main.js...
npx electron main-simple.js

echo.
echo Exit code: %ERRORLEVEL%
echo.
echo Press any key to close...
pause >nul
