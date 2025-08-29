# Building the Desktop App for Distribution

This guide will help you create standalone executables for the Family First Scheduler desktop application.

## 📋 Prerequisites

1. **Node.js** version 16 or higher
2. **npm** (comes with Node.js)
3. The desktop-app source code

## 🔨 Building for Your Platform

### Step 1: Navigate to the desktop-app folder
```bash
cd desktop-app
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Build for your operating system

#### For Windows:
```bash
npm run build-win
```
This creates:
- `dist/Family First Scheduler Setup 1.0.0.exe` (installer)
- `dist/win-unpacked/` (portable version)

#### For macOS:
```bash
npm run build-mac
```
This creates:
- `dist/Family First Scheduler-1.0.0.dmg` (disk image)
- `dist/mac/Family First Scheduler.app` (application bundle)

#### For Linux:
```bash
npm run build-linux
```
This creates:
- `dist/family-first-scheduler-app-1.0.0.AppImage` (portable AppImage)

### Step 4: Distribute the app
After building, you'll find the executables in the `dist/` folder. You can:
- Share the installer/executable with other users
- No need to install Node.js on target computers
- The app includes everything needed to run

## 🚀 Quick Start Without Building

If you just want to run the app without building:
```bash
# Install dependencies
npm install

# Start the app
npm start
```

## 🎨 Customization Before Building

### Change App Icon
- Windows: Replace `assets/icon.ico`
- macOS: Replace `assets/icon.icns`
- Linux: Replace `assets/icon.png`

### Change App Name or Version
Edit `package.json`:
```json
{
  "name": "family-first-scheduler-app",
  "version": "1.0.0",
  "build": {
    "productName": "Family First Scheduler"
  }
}
```

## 🐛 Troubleshooting

### "Cannot find module 'electron-builder'"
```bash
npm install --save-dev electron-builder
```

### Build fails on macOS
- You may need Xcode Command Line Tools:
```bash
xcode-select --install
```

### Build fails on Windows
- Install windows-build-tools:
```bash
npm install --global windows-build-tools
```

## 📦 What Gets Built?

The build process creates:
- A standalone executable that includes:
  - The Electron runtime
  - Your application code
  - All dependencies
  - Node.js runtime (users don't need Node.js installed)

## 🔐 Code Signing (Optional)

For production distribution, you should sign your executables:

### Windows:
- Requires a code signing certificate
- Add to package.json:
```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "password"
}
```

### macOS:
- Requires Apple Developer account
- Add to package.json:
```json
"mac": {
  "identity": "Developer ID Application: Your Name (XXXXXXXXXX)"
}
```

## 📱 Testing Your Build

After building:
1. Navigate to the `dist/` folder
2. Install/run the appropriate file for your OS
3. Test all features work correctly
4. The app should connect to the API automatically

## 💡 Pro Tips

1. **Test before distributing**: Always test the built app on a clean system
2. **Version control**: Update version in package.json before each build
3. **Auto-update**: Consider implementing auto-update for easier distribution
4. **Multiple platforms**: Build on each target platform for best results

---

For more information, see the [Electron Builder documentation](https://www.electron.build/).
