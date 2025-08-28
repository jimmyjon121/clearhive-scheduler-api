# Railway Deployment Guide 🚂

Railway is the easiest way to deploy your Therapeutic Outing Scheduler API and make it "always live" with automatic HTTPS, a PostgreSQL database, and continuous deployment from GitHub.

## Why Railway?

- **Always Live**: Your API runs 24/7 without sleeping
- **Easy Setup**: Deploy in 3 minutes with just a few clicks
- **PostgreSQL Included**: Database setup is automatic
- **Auto Deploy**: Push to GitHub = automatic deployment
- **HTTPS**: Secure connection included
- **Logs**: Real-time logs and monitoring
- **Cost**: ~$5/month for this app

## Step-by-Step Deployment

### 1. Prepare Your Code

First, push your code to GitHub:

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy to Railway

1. **Go to [railway.app](https://railway.app)**

2. **Click "Start a New Project"**

3. **Choose "Deploy from GitHub repo"**
   - Connect your GitHub account
   - Select your `clearhive-scheduler-api` repository

4. **Add PostgreSQL**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets the DATABASE_URL

5. **Deploy**
   - Railway will automatically deploy your app
   - Wait ~2 minutes for the build to complete

### 3. Get Your Live URL

1. Click on your service
2. Go to "Settings" tab
3. Under "Domains", click "Generate Domain"
4. Your API is now live at: `https://your-app.up.railway.app`

### 4. Initialize Database

Once deployed, initialize your database:

```bash
# Using curl
curl -X POST https://your-app.up.railway.app/api/v1/setup/initialize

# Or visit in browser
https://your-app.up.railway.app/api/v1/setup/status
```

### 5. Environment Variables (Optional)

In Railway dashboard → Variables tab, add:

```env
NODE_ENV=production

# For email notifications (optional)
EMAIL_CONFIG={"host":"smtp.gmail.com","port":587,"user":"your-email@gmail.com","pass":"your-app-password"}

# For Google Sheets (optional)
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
```

## Your API is Now Live! 🎉

### Test Your Endpoints

```bash
# Check status
curl https://your-app.up.railway.app/api/v1/setup/status

# Get programs
curl https://your-app.up.railway.app/api/v1/programs

# Get vendors
curl https://your-app.up.railway.app/api/v1/vendors
```

### Update Your React App

Update your React app's environment:

```javascript
// .env.production
REACT_APP_SCHEDULER_API_URL=https://your-app.up.railway.app/api/v1
```

## Railway Features

### Automatic Deployments

Every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Railway automatically deploys!
```

### View Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "View Logs"
4. See real-time logs

### Database Access

Need to access your database directly?

1. Click on PostgreSQL service
2. Go to "Connect" tab
3. Copy connection string
4. Use with any PostgreSQL client

### Monitoring

Railway provides:
- CPU usage graphs
- Memory usage
- Request metrics
- Error tracking

## Cost Breakdown

Railway pricing (as of 2024):
- **$5/month** flat fee for Hobby plan
- Includes:
  - 8 GB RAM
  - 8 vCPU
  - Unlimited requests
  - PostgreSQL included
  - Custom domains

## Troubleshooting

### Database Not Initialized?

```bash
curl -X POST https://your-app.up.railway.app/api/v1/setup/initialize
```

### Can't Connect?

1. Check Railway logs for errors
2. Ensure DATABASE_URL is set (automatic)
3. Check `/api/v1/setup/status`

### Need to Reset Database?

1. In Railway, go to PostgreSQL service
2. Settings → Danger Zone → Delete Database
3. Create new PostgreSQL service
4. Re-run initialization

## Quick Command Reference

```bash
# Check if API is running
curl https://your-app.up.railway.app/health

# Check database status
curl https://your-app.up.railway.app/api/v1/setup/status

# Initialize database (first time only)
curl -X POST https://your-app.up.railway.app/api/v1/setup/initialize

# Generate year schedule
curl -X POST https://your-app.up.railway.app/api/v1/advanced-schedules/generate-year \
  -H "Content-Type: application/json" \
  -d '{"facility_id":1,"weeks":52}'
```

## Next Steps

1. ✅ Your API is live and always running
2. ✅ Database is configured
3. ✅ HTTPS is enabled
4. ✅ Automatic deployments from GitHub

Now you can:
- Update your React app to use the production URL
- Add authentication if needed
- Set up email/Google Sheets integrations
- Monitor usage in Railway dashboard

## Support

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Your API Status: `https://your-app.up.railway.app/api/v1/setup/status`

Congratulations! Your scheduler API is now live and always available! 🚀
