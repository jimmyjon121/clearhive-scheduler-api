# 🖥️ Desktop App Setup Guide

## Quick Start (5 Minutes)

### 1. Prerequisites
Make sure you have Node.js installed:
- **Download Node.js**: https://nodejs.org (LTS version recommended)
- **Verify installation**: Open terminal/command prompt and run:
  ```bash
  node --version
  npm --version
  ```

### 2. Install & Run Desktop App

#### Option A: From Project Directory
```bash
# Navigate to desktop app folder
cd desktop-app

# Install dependencies (first time only)
npm install

# Run the desktop app
npm start
```

#### Option B: Development Mode (with auto-reload)
```bash
cd desktop-app
npm run dev
```

### 3. First-Time Setup
1. The app will open automatically
2. Check connection status (should show "Connected" if Railway API is running)
3. Navigate through the different sections:
   - **Dashboard**: Overview and quick stats
   - **Programs**: Manage houses (Cove, Banyan, etc.)
   - **Vendors**: Therapeutic outing providers
   - **Schedules**: Create and manage weekly schedules
   - **Discover Outings**: Find new therapeutic activities
   - **QR Codes**: Generate incident reporting QR codes
   - **Email Management**: Configure automated emails

---

## 📱 Features Available

### ✅ Core Scheduling
- Create weekly therapeutic outing schedules
- Assign vendors to houses with color coding
- Export PDF schedules
- Manage vendor rotations

### ✅ Discovery System
- Browse 50+ therapeutic activities
- Filter by category, age group, skills
- Submit vendor applications
- Suggest new activities

### ✅ QR Code System
- Generate QR codes for quick incident reporting
- Mobile-optimized forms for field staff
- Photo uploads and witness tracking
- Automatic notifications for critical incidents

### ✅ Email Management
- Automated daily reminders (7 AM)
- Color-coded house emails
- Email archiving and search
- Weekly digest reports

### ✅ Advanced Animations
- Toggle between Simple/Advanced UI modes
- Glassmorphism effects and smooth transitions
- Parallax scrolling and interactive elements

---

## 🎨 House Color System

Each house has a unique color for easy identification:
- **Banyan**: `#FF6B6B` (Red)
- **Hedge**: `#4ECDC4` (Teal)
- **Preserve**: `#45B7D1` (Blue)
- **Cove**: `#96CEB4` (Green)
- **Meridian**: `#FECA57` (Yellow)
- **Prosperity**: `#DDA0DD` (Purple)

---

## 🔧 Troubleshooting

### Connection Issues
If you see "Offline" status:
1. Check internet connection
2. Verify Railway API is running: https://clearhive-scheduler-api-production-4c35.up.railway.app
3. Restart the desktop app

### Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Windows-Specific Issues
If you get permission errors:
1. Run Command Prompt as Administrator
2. Or use PowerShell with execution policy:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

---

## 📦 Building Distributable Apps

### Build for Current Platform
```bash
npm run build
```

### Build for Specific Platforms
```bash
# Windows installer
npm run build-win

# macOS app
npm run build-mac

# Linux AppImage
npm run build-linux
```

Built apps will be in the `dist/` folder.

---

## 🚀 Advanced Usage

### Email Configuration
1. Open **Email Management** from the sidebar
2. Configure SMTP settings (Gmail recommended):
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Your Gmail address
   - **Password**: App password (not regular password)
3. Enable automated reminders
4. Test with a sample email

### QR Code Setup
1. Go to **QR Codes** section
2. Select program/location
3. Generate and print QR codes
4. Post in strategic locations
5. Staff can scan with any smartphone camera

### Discovery System
1. Browse therapeutic activities in **Discover Outings**
2. Filter by category (animal therapy, sports, creative arts)
3. Click activities for contact information
4. Submit new vendor applications

---

## 📞 Support

### API Endpoint
- **Production**: https://clearhive-scheduler-api-production-4c35.up.railway.app
- **Status Check**: Should return 200 OK

### File Locations
- **Desktop App**: `/desktop-app/`
- **Main Process**: `main.js`
- **Renderer**: `renderer/` folder
- **Styles**: `renderer/styles/`
- **JavaScript**: `renderer/js/`

### Common Commands
```bash
# Start app
npm start

# Install new dependency
npm install package-name

# Update all dependencies
npm update

# Check for security issues
npm audit
```

Ready to schedule some therapeutic outings! 🎯
