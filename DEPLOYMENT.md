# Deployment Guide - Making Your API "Always Live"

## Quick Answer: Is it Always Live?

**No**, by default the API only runs when you start it with `npm start`. To make it "always live" you need to deploy it to a server or cloud service.

## Deployment Options Comparison

| Option | Always Live | Cost | Difficulty | Best For |
|--------|------------|------|------------|----------|
| Heroku | ✅ | Free-$7/mo | Easy | Quick production |
| Railway | ✅ | $5/mo | Easiest | Modern deployment |
| Vercel | ✅ | Free-$20/mo | Easy | If using Next.js |
| AWS | ✅ | $5-50/mo | Hard | Large scale |
| VPS | ✅ | $5-20/mo | Medium | Full control |
| Your PC | ❌* | Free | Easy | Development only |

*Can be made always-on with PM2/Docker

## Option 1: Heroku (Recommended for Start)

### Free Tier (Sleeps after 30 min)
```bash
# Install Heroku CLI first
# Create app
heroku create family-first-scheduler

# Add database
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main

# Run database setup
heroku run node src/cli/setup.js
```

Your API is now live at: `https://family-first-scheduler.herokuapp.com`

### Paid Tier ($7/month - Never Sleeps)
```bash
heroku ps:scale web=1:basic
```

## Option 2: Railway (Easiest Modern Option)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Add PostgreSQL database
4. Deploy automatically

That's it! Railway handles everything.

## Option 3: Docker (For Any Server)

### Local Development with Docker
```bash
# Build and run
docker-compose up -d

# Now it's running at http://localhost:3000
# And will restart automatically
```

### Deploy to Any VPS
```bash
# On your server (DigitalOcean, Linode, etc.)
git clone your-repo
cd clearhive-scheduler-api
docker-compose up -d
```

## Option 4: PM2 (Keep Running on Your Computer)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start deployment/pm2-config.json

# Save PM2 config to restart on reboot
pm2 save
pm2 startup

# View logs
pm2 logs scheduler-api

# Stop
pm2 stop scheduler-api
```

## Option 5: Systemd Service (Linux Servers)

```bash
# Copy service file
sudo cp deployment/systemd.service /etc/systemd/system/scheduler-api.service

# Edit the file to set correct paths
sudo nano /etc/systemd/system/scheduler-api.service

# Enable and start
sudo systemctl enable scheduler-api
sudo systemctl start scheduler-api

# Check status
sudo systemctl status scheduler-api
```

## For Your React App Integration

### Development Mode
```javascript
// .env.development
REACT_APP_SCHEDULER_API_URL=http://localhost:3000/api/v1
```

### Production Mode
```javascript
// .env.production
REACT_APP_SCHEDULER_API_URL=https://your-api-domain.com/api/v1
```

## Making it Truly "Always On"

### 1. Health Checks
Add monitoring to ensure uptime:

```javascript
// Use services like:
// - UptimeRobot (free)
// - Pingdom
// - StatusCake

// They'll ping your API every 5 minutes
// and alert you if it goes down
```

### 2. Auto-Restart
All deployment options above include auto-restart on crash.

### 3. Backup Database
```bash
# Automated backups with Heroku
heroku pg:backups:schedule --at '02:00 America/New_York'

# Manual backup
heroku pg:backups:capture
```

## Quick Start Recommendation

For getting started quickly with minimal cost:

1. **Development**: Use Docker Compose locally
2. **Production**: Deploy to Railway or Heroku
3. **Monitor**: Set up UptimeRobot (free)

```bash
# Fastest path to production:
# 1. Push to GitHub
# 2. Connect to Railway.app
# 3. Add database
# 4. Done! Live URL in 3 minutes
```

## Integrating with Your React App

Once deployed, update your React app:

```javascript
// src/config/api.js
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-api.herokuapp.com/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

export const API_URL = getApiUrl();
```

## Cost Comparison (Monthly)

- **Free Options**:
  - Heroku Free (sleeps after 30 min)
  - Your own PC with PM2 (electricity cost)
  
- **Always-On Paid**:
  - Heroku Eco: $5/mo
  - Railway: $5/mo + usage
  - DigitalOcean: $6/mo
  - AWS Lightsail: $3.50/mo

## Next Steps

1. Choose your deployment method
2. Set up environment variables
3. Deploy your API
4. Update React app with production URL
5. Set up monitoring

Need help with a specific deployment? Check the detailed guides above!
