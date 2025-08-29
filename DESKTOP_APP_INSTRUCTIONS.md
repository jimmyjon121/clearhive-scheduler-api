# 🖥️ Desktop App - Download and Run Instructions

## For Windows Users

### Prerequisites
1. Install Node.js from: https://nodejs.org/ (Download the LTS version)
   - During installation, make sure to check "Add to PATH"

### Steps to Run
1. **Download the project**
   - Go to: https://github.com/jimmyjon121/clearhive-scheduler-api
   - Click the green "Code" button
   - Click "Download ZIP"
   - Extract the ZIP file to your Desktop or Documents folder

2. **Open Command Prompt**
   - Press `Windows + R`
   - Type `cmd` and press Enter

3. **Navigate to the desktop app folder**
   ```cmd
   cd Desktop\clearhive-scheduler-api-main\desktop-app
   ```
   (Adjust the path based on where you extracted the files)

4. **Install and run**
   ```cmd
   npm install
   npm start
   ```

The Family First Scheduler app will open!

---

## For Mac Users

### Prerequisites
1. Install Node.js from: https://nodejs.org/ (Download the LTS version)
   - Or use Homebrew: `brew install node`

### Steps to Run
1. **Download the project**
   - Go to: https://github.com/jimmyjon121/clearhive-scheduler-api
   - Click the green "Code" button
   - Click "Download ZIP"
   - Extract the ZIP file to your Desktop or Documents folder

2. **Open Terminal**
   - Press `Command + Space`
   - Type "Terminal" and press Enter

3. **Navigate to the desktop app folder**
   ```bash
   cd ~/Desktop/clearhive-scheduler-api-main/desktop-app
   ```
   (Adjust the path based on where you extracted the files)

4. **Make the start script executable**
   ```bash
   chmod +x start-app.sh
   ```

5. **Install and run**
   ```bash
   ./start-app.sh
   ```
   
   Or manually:
   ```bash
   npm install
   npm start
   ```

The Family First Scheduler app will open!

---

## For Linux Users

### Prerequisites
1. Install Node.js:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm
   
   # Or use NodeSource repository for latest version
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

### Steps to Run
1. **Download the project**
   ```bash
   git clone https://github.com/jimmyjon121/clearhive-scheduler-api.git
   cd clearhive-scheduler-api/desktop-app
   ```
   
   Or download the ZIP from GitHub and extract it.

2. **Make the start script executable**
   ```bash
   chmod +x start-app.sh
   ```

3. **Install and run**
   ```bash
   ./start-app.sh
   ```

---

## 🎯 What Happens When You Run It?

1. The app will install necessary dependencies (first time only)
2. It will check connection to the API server
3. The Family First Scheduler window will open
4. You can start managing programs, vendors, and schedules!

## 🚀 Creating a Desktop Shortcut (Optional)

### Windows:
1. Right-click on your desktop
2. Select "New" → "Shortcut"
3. Enter the location: `cmd /c "cd /d C:\path\to\desktop-app && npm start"`
4. Name it "Family First Scheduler"

### Mac:
1. Open Automator
2. Create new "Application"
3. Add "Run Shell Script" action
4. Enter: `cd /path/to/desktop-app && npm start`
5. Save as "Family First Scheduler.app"

### Linux:
Create a `.desktop` file in `~/.local/share/applications/`:
```ini
[Desktop Entry]
Name=Family First Scheduler
Exec=/bin/bash -c "cd /path/to/desktop-app && npm start"
Type=Application
Icon=/path/to/desktop-app/assets/icon.png
```

## 🔧 Troubleshooting

### "npm: command not found"
- Make sure Node.js is installed and added to your PATH
- Restart your terminal/command prompt after installing Node.js

### "Cannot find module" errors
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

### App won't start
- Check that port 3000 is not in use
- Make sure you're in the correct directory (`desktop-app`)
- Try running with `npm run dev` for more error details

## 📞 Need Help?

If you encounter issues:
1. Make sure you have Node.js version 16 or higher: `node --version`
2. Check npm is installed: `npm --version`
3. Ensure you're connected to the internet (for API access)

---

**Note**: The first time you run the app, it will download and install Electron and other dependencies. This may take a few minutes depending on your internet connection.
