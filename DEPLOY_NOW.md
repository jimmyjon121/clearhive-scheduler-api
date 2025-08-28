# 🚀 Deploy in 2 Minutes - Family First Scheduler

## What This Does
- Deploys your scheduling API to Railway (runs 24/7)
- Sets up a PostgreSQL database automatically
- Gives you a live URL you can access from anywhere

## Step 1: Push to GitHub (Copy & Paste)

Open Terminal and run these commands one by one:

```bash
# 1. Create GitHub repository (you'll be prompted to login)
gh auth login

# 2. Create and push your repository
gh repo create family-first-scheduler-api --public --source=. --remote=origin --push
```

If `gh` command doesn't work, use this instead:
```bash
# Go to: https://github.com/new
# Create repo named: family-first-scheduler-api
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/family-first-scheduler-api.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway (Just Clicks!)

1. **Open Railway**: https://railway.app

2. **Sign in with GitHub** (use the same account from Step 1)

3. **Click "New Project"**

4. **Select "Deploy from GitHub repo"**

5. **Choose** `family-first-scheduler-api` from the list

6. **Add Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway connects it automatically!

7. **Set Environment Variables**:
   - Click on your service
   - Go to "Variables" tab
   - Click "Raw Editor"
   - Paste this:
   ```
   NODE_ENV=production
   JWT_SECRET=family-first-secret-key-2024-change-this-later
   ```

8. **Wait 2-3 minutes** for deployment

9. **Get Your URL**:
   - Go to "Settings" tab
   - Click "Generate Domain"
   - Copy your URL (like `family-first-scheduler-api.up.railway.app`)

## Step 3: Initialize Your Database

Replace `YOUR_URL` with your Railway URL and run:

```bash
# Initialize database with sample data
curl -X POST https://YOUR_URL/api/v1/setup/initialize
```

## Step 4: Test It's Working!

```bash
# Check API health
curl https://YOUR_URL/api/v1/health

# View programs
curl https://YOUR_URL/api/v1/programs

# Generate a year of schedules
curl -X POST https://YOUR_URL/api/v1/advanced-schedules/generate-year \
  -H "Content-Type: application/json" \
  -d '{"facility_id": 1, "start_date": "2025-09-02", "weeks": 52}'
```

## Step 5: Access Your Scheduler!

1. **Web Interface**: Update `examples/web-interface.html`:
   - Change `http://localhost:3000` to your Railway URL
   - Open the file in your browser

2. **Download First PDF**:
   ```
   https://YOUR_URL/api/v1/advanced-schedules/2025-09-02/pdf
   ```

## 🎉 That's It! Your API is Live!

### What You Now Have:
- ✅ API running 24/7 at your Railway URL
- ✅ PostgreSQL database with automatic backups
- ✅ All 6 programs (Banyan, Hedge, Preserve, Cove, Meridian, Prosperity)
- ✅ Rotation vendors configured
- ✅ PDF generation working
- ✅ Ready for email notifications (just add Gmail credentials)

### Quick Links:
- **Your API**: `https://YOUR_URL/api/v1`
- **Health Check**: `https://YOUR_URL/api/v1/health`
- **Next Tuesday's PDF**: `https://YOUR_URL/api/v1/advanced-schedules/2025-09-02/pdf`

### Need Help?
- Check Railway logs: Click your app → "Observability" → "Logs"
- API not responding? Wait 5 minutes and try again
- Database issues? Railway handles it automatically

## Optional: Email Notifications

To enable email notifications:
1. Go to Railway → Your App → Variables
2. Add these:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
3. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

## Optional: Custom Domain

1. In Railway Settings → Domains
2. Add your domain (e.g., `scheduler.familyfirst.org`)
3. Update DNS records as shown

---

**Problems?** The most common issue is forgetting to initialize the database (Step 3). Make sure you run the curl command!
