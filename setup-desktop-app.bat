@echo off
echo =============================================
echo Family First Scheduler Desktop App Setup
echo =============================================
echo.

:: Check if we're in the right directory
if not exist package.json (
    echo ERROR: Please run this script from the clearhive-scheduler-api folder
    pause
    exit /b 1
)

echo Creating desktop-app directory structure...
mkdir desktop-app 2>nul
mkdir desktop-app\assets 2>nul
mkdir desktop-app\renderer 2>nul
mkdir desktop-app\renderer\js 2>nul
mkdir desktop-app\renderer\styles 2>nul

echo.
echo Creating package.json...
(
echo {
echo   "name": "family-first-scheduler-app",
echo   "version": "1.0.0",
echo   "description": "Desktop application for Family First Therapeutic Outing Scheduler",
echo   "main": "main.js",
echo   "scripts": {
echo     "start": "electron .",
echo     "dev": "electron . --dev",
echo     "build": "electron-builder",
echo     "build-win": "electron-builder --win"
echo   },
echo   "author": "Family First",
echo   "license": "MIT",
echo   "devDependencies": {
echo     "electron": "^26.6.10",
echo     "electron-builder": "^24.6.3"
echo   },
echo   "dependencies": {
echo     "axios": "^1.5.0",
echo     "electron-store": "^8.2.0"
echo   }
echo }
) > desktop-app\package.json

echo.
echo Desktop app folder created!
echo.
echo IMPORTANT: You now need to:
echo 1. Get the main.js, preload.js, and renderer files from the repository owner
echo 2. Or use the minimal version provided in the documentation
echo.
echo To request the full files:
echo - Ask the repository owner (jimmyjon121) to push the desktop-app folder
echo - Or ask for the files to be shared directly
echo.
echo Once you have all files:
echo 1. cd desktop-app
echo 2. npm install
echo 3. npm start
echo.
pause
