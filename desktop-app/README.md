# Family First Therapeutic Outing Scheduler - Desktop Application

![Family First Logo](https://img.shields.io/badge/Family%20First-Scheduler-blue)
![Electron](https://img.shields.io/badge/Electron-26.0.0-green)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

A professional desktop application for managing therapeutic outings and schedules for Family First organization. Built with Electron and modern web technologies.

## ✨ Features

### 🏥 Core Functionality
- **Dashboard Overview**: Real-time statistics and quick actions
- **Program Management**: Create, edit, and manage therapeutic programs
- **Vendor Management**: Handle vendor information and contacts
- **Schedule Generation**: Intelligent scheduling with conflict detection
- **Reports & Analytics**: Export data and generate reports

### 🖥️ Desktop Features
- **Native Window Management**: Resizable, minimizable desktop windows
- **File System Integration**: Export schedules and reports to local files
- **Menu Bar Integration**: Standard desktop application menus
- **Keyboard Shortcuts**: Quick navigation and actions
- **Offline Capability**: Continue working when disconnected

### 📊 Data Management
- **Real-time Sync**: Connect to Railway-hosted API
- **Local Storage**: Cache data for offline access
- **Export Options**: JSON, CSV export formats
- **Data Validation**: Ensure data integrity

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Internet connection** (for API access)

### Installation & Launch

1. **Clone or Download** this desktop app folder
2. **Run the launcher** (easiest method):
   ```bash
   ./start-app.sh
   ```

3. **Or manually**:
   ```bash
   npm install
   npm start
   ```

### First Run Setup
1. The app will automatically connect to the API
2. Initial data will be loaded from the server
3. Start managing your therapeutic programs!

## 🎯 Usage Guide

### Dashboard
- View real-time statistics for programs, vendors, and schedules
- Quick action buttons for common tasks
- Recent activity monitoring

### Program Management
- ➕ **Add Program**: Click "Add Program" to create new therapeutic programs
- ✏️ **Edit Program**: Click on any program to modify details
- 🗑️ **Delete Program**: Remove programs no longer needed

### Schedule Generation
1. Navigate to **Schedules** section
2. Click **"Generate Schedule"**
3. Select:
   - Date range
   - Programs to include
   - Preferred days
   - Maximum outings per week
4. Click **"Generate"** to create optimized schedules

### Data Export
- 📊 **Reports**: Access via Reports section
- 📤 **Export**: Use File → Export Data menu
- 💾 **Save**: Schedules saved as JSON or CSV

## 🔧 Configuration

### API Connection
The app connects to: `https://clearhive-scheduler-api-production-4c35.up.railway.app`

To change the API URL:
1. Use **Preferences** menu (Ctrl/Cmd + ,)
2. Update API URL
3. Test connection

### Keyboard Shortcuts
- **Ctrl/Cmd + N**: New Schedule
- **Ctrl/Cmd + E**: Export Data
- **Ctrl/Cmd + ,**: Preferences
- **Ctrl/Cmd + R**: Refresh Data
- **Ctrl/Cmd + Q**: Quit Application

## 📁 Project Structure

```
desktop-app/
├── main.js                 # Main Electron process
├── preload.js             # Secure IPC bridge
├── package.json           # Dependencies and scripts
├── start-app.sh          # Easy launcher script
├── renderer/             # UI and frontend
│   ├── index.html        # Main application window
│   ├── js/
│   │   └── app.js        # Application logic
│   └── styles/
│       ├── main.css      # Core styling
│       └── components.css # UI components
└── assets/               # Icons and resources
```

## 🏗️ Development

### Building from Source
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build distributables
npm run build

# Platform-specific builds
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### Architecture
- **Main Process**: Handles window management, file operations, menus
- **Renderer Process**: UI and application logic
- **Preload Script**: Secure communication bridge
- **API Layer**: RESTful communication with Railway backend

## 🔒 Security

- **Context Isolation**: Renderer process isolated from Node.js
- **Preload Scripts**: Secure API exposure
- **Content Security Policy**: Prevents XSS attacks
- **HTTPS**: All API communication encrypted

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows 10/11 | ✅ Supported | Native installer available |
| macOS | ✅ Supported | Signed and notarized |
| Linux | ✅ Supported | AppImage format |

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
- Ensure Node.js v16+ is installed
- Run `npm install` in the app directory
- Check for antivirus blocking

**API connection failed:**
- Verify internet connection
- Check if API URL is correct in preferences
- App will work offline with cached data

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build issues:**
```bash
npm run postinstall
npm run build
```

## 📞 Support

### API Backend
- **Live API**: https://clearhive-scheduler-api-production-4c35.up.railway.app
- **Health Check**: https://clearhive-scheduler-api-production-4c35.up.railway.app/health
- **Documentation**: Railway deployment dashboard

### Data Management
- **Programs**: 6 therapeutic programs available
- **Vendors**: 7 registered vendors
- **Schedules**: Generate and manage as needed

## 🔄 Updates

The desktop app automatically syncs with the latest API data. To update the application itself:

1. Download the latest version
2. Replace the old app files
3. Run `npm install` if dependencies changed
4. Launch normally

## 📄 License

MIT License - Built for Family First Therapeutic Services

---

### 🎉 Ready to Use!

Your Family First Scheduler desktop application is ready! Simply run `./start-app.sh` to begin managing therapeutic outings with a professional, native desktop experience.

For questions or support, refer to the troubleshooting section above or contact your system administrator.
