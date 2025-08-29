#!/bin/bash
# Family First Scheduler Desktop App Launcher

echo "🏥 Starting Family First Scheduler Desktop Application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Change to the desktop app directory
cd "$(dirname "$0")"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
fi

# Check API connectivity
echo "🔗 Checking API connectivity..."
API_URL="https://clearhive-scheduler-api-production-4c35.up.railway.app"
if curl -s --fail "$API_URL/health" > /dev/null; then
    echo "✅ API is reachable at $API_URL"
else
    echo "⚠️  Warning: API might not be reachable. The app will still work for viewing cached data."
fi

echo "🚀 Launching Family First Scheduler..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start the Electron app
npm start

echo "👋 Family First Scheduler has been closed."
