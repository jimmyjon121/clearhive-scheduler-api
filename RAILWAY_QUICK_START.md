# 🚂 Railway Deployment - Quick Start Guide

This guide will help you deploy your Therapeutic Outing Scheduler API to Railway in just a few minutes!

## Prerequisites

- GitHub account (free)
- Railway account (free to start)

## Step 1: Prepare Your Code

First, let's commit all your code to Git:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Therapeutic Outing Scheduler API"
```

## Step 2: Push to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `clearhive-scheduler-api`
   - Keep it private if you prefer
   - Don't initialize with README (you already have one)

2. Push your code:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/clearhive-scheduler-api.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Railway

1. **Go to Railway**: https://railway.app

2. **Sign in with GitHub**

3. **Create New Project**:
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `clearhive-scheduler-api` repository

4. **Add PostgreSQL Database**:
   - In your project, click "New"
   - Choose "Database"
   - Select "PostgreSQL"
   - Railway will automatically create and connect it

5. **Configure Environment Variables**:
   - Click on your service
   - Go to "Variables" tab
   - Railway automatically adds `DATABASE_URL`
   - Add these additional variables:

   ```
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   ```

   For email notifications (optional):
   ```
   EMAIL_CONFIG={"host":"smtp.gmail.com","port":587,"secure":false,"user":"your-email@gmail.com","pass":"your-app-password"}
   ```

   For Google Sheets (optional):
   ```
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account"...}
   ```

## Step 4: Initialize Database

Once deployed, you need to set up the database tables:

1. **In Railway Dashboard**:
   - Click on your service
   - Go to "Settings" tab
   - Under "Deploy", find your deployment URL (like `your-app.railway.app`)

2. **Option A: Use the Web Setup** (Easiest):
   - Visit: `https://your-app.railway.app/api/v1/setup`
   - Click "Initialize Database"
   - Create admin user

3. **Option B: Use Railway CLI**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link to your project
   railway link

   # Run setup
   railway run node src/cli/setup.js
   ```

## Step 5: Verify Deployment

1. **Check Health Endpoint**:
   ```
   https://your-app.railway.app/health
   ```

2. **View Your API Documentation**:
   ```
   https://your-app.railway.app/api/v1
   ```

## Step 6: Update Your React App

Now update your React app to use the Railway URL:

```javascript
// .env.production
REACT_APP_SCHEDULER_API_URL=https://your-app.railway.app/api/v1
```

Or dynamically:

```javascript
// src/config/api.js
const getApiUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api/v1';
  }
  return 'https://your-app.railway.app/api/v1';
};
```

## 🎉 That's It! Your API is Live!

Your API is now:
- ✅ Always running (24/7)
- ✅ Automatically updates when you push to GitHub
- ✅ Has a PostgreSQL database
- ✅ Secured with HTTPS
- ✅ Ready for production use

## Common Tasks

### View Logs
- In Railway dashboard, click on your service
- Go to "Logs" tab

### Update Code
```bash
git add .
git commit -m "Update feature"
git push
# Railway auto-deploys!
```

### Add Custom Domain
1. In Railway, go to Settings
2. Under "Domains", add your domain
3. Update DNS records as shown

### Monitor Usage
- Railway dashboard shows:
  - Memory usage
  - CPU usage
  - Network traffic
  - Database size

## Troubleshooting

**Database not connecting?**
- Check DATABASE_URL is set in variables
- Ensure schema.sql has run

**API not responding?**
- Check logs for errors
- Verify PORT is set to 3000
- Ensure all dependencies are in package.json

**Need more help?**
- Railway Discord: https://discord.gg/railway
- Your logs: Check deployment logs in Railway dashboard

## Next Steps

1. Generate your first year schedule:
   ```bash
   curl -X POST https://your-app.railway.app/api/v1/advanced-schedules/generate-year \
     -H "Content-Type: application/json" \
     -d '{"weeks": 52}'
   ```

2. Set up monitoring with UptimeRobot (free)

3. Configure email notifications

4. Enable Google Sheets sync

---

**Congratulations! Your Therapeutic Outing Scheduler API is now live and ready for your React app!** 🚀
