# 🚀 Quick Start Guide - Family First Scheduler Desktop App

## ⚡ One-Click Setup Instructions

### For Windows Users:
1. **Download the Project**
   - Download ZIP from GitHub or clone: `git clone https://github.com/jimmyjon121/clearhive-scheduler-api.git`
   - Extract to your Desktop or preferred location

2. **Run the App**
   - Navigate to `clearhive-scheduler-api/desktop-app/` folder
   - **Double-click** `start-app.bat`
   - Wait for automatic installation and launch

### For Mac/Linux Users:
1. **Download the Project**
   - Download ZIP from GitHub or clone: `git clone https://github.com/jimmyjon121/clearhive-scheduler-api.git`
   - Extract to your Desktop or preferred location

2. **Run the App**
   - Open Terminal
   - Navigate to the project: `cd clearhive-scheduler-api/desktop-app/`
   - Run: `./start-app.sh`
   - If permission denied: `chmod +x start-app.sh` then `./start-app.sh`

---

## 📋 What Happens Automatically:

1. ✅ **Checks for Node.js** (downloads if needed)
2. ✅ **Installs all dependencies** (first time only)
3. ✅ **Tests API connection** to Railway
4. ✅ **Opens the desktop app** automatically
5. ✅ **Loads all house data** with color coding

---

## 🎯 App Features Ready to Use:

### 📊 Dashboard
- Overview of all houses and schedules
- Quick stats and recent activity
- Connection status indicator

### 🏠 Programs Management
- View all houses: Banyan, Cove, Hedge, Preserve, Meridian, Prosperity
- Each house has unique color coding
- Manage coordinators and contact info

### 🚌 Vendors & Outings
- Johnson Folly Equestrian Farm
- Surf Therapy Institute
- Peach Painting Studio
- Happy Goat Yoga
- And more therapeutic vendors

### 📅 Schedule Generator
- Create weekly outing schedules
- Automatic vendor rotation
- Color-coded house assignments
- Export to PDF

### 🔍 Discovery System
- Find new therapeutic activities
- Filter by category, age group, skills
- Submit vendor applications
- Rate and review activities

### 📱 QR Code System
- Generate QR codes for incident reporting
- Mobile-optimized forms
- Photo uploads and witness tracking
- Automatic notifications

### 📧 Email Management
- Automated daily reminders (7 AM)
- Color-coded house emails
- Email archiving and search
- Weekly digest reports

---

## 🛠️ Troubleshooting

### "Node.js not found" Error:
1. Download Node.js from: https://nodejs.org
2. Install the LTS (Long Term Support) version
3. Restart your computer
4. Run the startup script again

### App Won't Start:
```bash
# Try these commands in the desktop-app folder:
npm cache clean --force
rm -rf node_modules
npm install
npm start
```

### API Connection Issues:
- Check internet connection
- Verify Railway is running: https://clearhive-scheduler-api-production-4c35.up.railway.app
- App works offline with cached data

### Windows Permission Issues:
1. Right-click `start-app.bat`
2. Select "Run as Administrator"
3. Or use PowerShell as Administrator

---

## 🔧 Advanced Usage

### Development Mode:
```bash
cd desktop-app
npm run dev  # Auto-reloads on file changes
```

### Building Installers:
```bash
npm run build      # Current platform
npm run build-win  # Windows installer
npm run build-mac  # macOS app
npm run build-linux # Linux AppImage
```

### Manual Installation:
```bash
# If auto-scripts don't work:
cd desktop-app
npm install
npm start
```

---

## 📱 Mobile Access

The system also works on mobile devices:
- **QR Code Forms**: Scan QR codes with phone camera
- **Web Interface**: Access via browser at Railway URL
- **Incident Reporting**: Mobile-optimized touch interface

---

## 🌐 Live System URLs

- **API**: https://clearhive-scheduler-api-production-4c35.up.railway.app
- **Health Check**: `/api/v1/programs` (should return JSON)
- **GitHub**: https://github.com/jimmyjon121/clearhive-scheduler-api

---

## 📞 Quick Support

### Common Issues & Solutions:

**App shows "Offline"**
- Check internet connection
- Railway API may be restarting (try again in 1 minute)

**Email not sending**
- Configure SMTP settings in Email Management
- Use Gmail with App Password (not regular password)

**QR codes not working**
- Ensure phone has camera permissions
- Try different QR code reader app

**Houses missing colors**
- Database populated automatically from Railway
- Colors: Banyan=Red, Hedge=Teal, Preserve=Blue, Cove=Green, etc.

---

## 🎉 You're Ready!

The Family First Scheduler is now running with:
- ✅ 6 houses with color coding
- ✅ Multiple therapeutic vendors
- ✅ Automated email system
- ✅ QR code incident reporting
- ✅ Activity discovery system
- ✅ PDF schedule generation
- ✅ Live Railway API connection

**Start by**: Creating your first weekly schedule in the Schedules section! 🚀
