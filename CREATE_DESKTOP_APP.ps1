# PowerShell Script to Create Family First Scheduler Desktop App
# Run this script in the clearhive-scheduler-api folder

Write-Host "Creating Family First Scheduler Desktop App..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Create desktop-app directory structure
Write-Host "Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "desktop-app" -Force | Out-Null
New-Item -ItemType Directory -Path "desktop-app\assets" -Force | Out-Null
New-Item -ItemType Directory -Path "desktop-app\renderer" -Force | Out-Null
New-Item -ItemType Directory -Path "desktop-app\renderer\js" -Force | Out-Null
New-Item -ItemType Directory -Path "desktop-app\renderer\styles" -Force | Out-Null

# Create package.json
Write-Host "Creating package.json..." -ForegroundColor Yellow
@'
{
  "name": "family-first-scheduler-app",
  "version": "1.0.0",
  "description": "Desktop application for Family First Therapeutic Outing Scheduler",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux",
    "pack": "electron-builder --dir",
    "postinstall": "electron-builder install-app-deps"
  },
  "keywords": [
    "scheduler",
    "therapeutic",
    "desktop",
    "healthcare"
  ],
  "author": "Family First",
  "license": "MIT",
  "devDependencies": {
    "electron": "^26.6.10",
    "electron-builder": "^24.6.3"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "chart.js": "^4.4.0",
    "date-fns": "^2.30.0",
    "electron-store": "^8.2.0"
  },
  "build": {
    "appId": "com.familyfirst.scheduler",
    "productName": "Family First Scheduler",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "assets/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "icon": "assets/icon.icns",
      "category": "public.app-category.healthcare-fitness"
    },
    "win": {
      "icon": "assets/icon.ico",
      "target": "nsis"
    },
    "linux": {
      "icon": "assets/icon.png",
      "target": "AppImage"
    }
  }
}
'@ | Out-File -FilePath "desktop-app\package.json" -Encoding utf8

Write-Host "Desktop app structure created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd desktop-app" -ForegroundColor Cyan
Write-Host "2. Copy the file contents from DESKTOP_APP_FILES.md" -ForegroundColor Cyan
Write-Host "3. npm install" -ForegroundColor Cyan
Write-Host "4. npm start" -ForegroundColor Cyan
