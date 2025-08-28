# React + API Deployment Guide

This guide covers deploying both your React frontend and the Scheduler API backend.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React App      │────▶│   Scheduler API  │────▶│  PostgreSQL │
│  (Frontend)     │     │   (Backend)      │     │  Database   │
└─────────────────┘     └──────────────────┘     └─────────────┘
     Vercel/                  Railway               Railway/
     Netlify                                        Supabase
```

## Frontend Deployment (React)

### Option 1: Vercel (Recommended for React)

1. **Prepare your React app**:
   ```bash
   # Update environment variables for production
   echo "REACT_APP_SCHEDULER_API_URL=https://your-api.railway.app/api/v1" > .env.production
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   
   # Follow prompts, it will detect React automatically
   ```

4. **Configure environment in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_SCHEDULER_API_URL` = `https://your-api.railway.app/api/v1`

### Option 2: Netlify

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = "build"
   
   [build.environment]
     REACT_APP_SCHEDULER_API_URL = "https://your-api.railway.app/api/v1"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**:
   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli
   
   # Deploy
   netlify deploy
   netlify deploy --prod
   ```

### Option 3: Traditional Hosting (Apache/Nginx)

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Nginx configuration** (`/etc/nginx/sites-available/scheduler`):
   ```nginx
   server {
       listen 80;
       server_name scheduler.yourdomain.com;
       root /var/www/scheduler/build;
       index index.html;
       
       location / {
           try_files $uri /index.html;
       }
       
       location /api {
           proxy_pass https://your-api.railway.app;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Backend Deployment (API)

### Railway (Recommended)

Already covered in main deployment guide. Key points:

1. **Environment Variables** to set in Railway:
   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-react-app.vercel.app
   
   # Optional
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account"...}
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Update CORS** in your API (`src/index.js`):
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
     credentials: true
   }));
   ```

### Docker Compose (Self-hosted)

1. **Create `docker-compose.prod.yml`**:
   ```yaml
   version: '3.8'
   
   services:
     api:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://postgres:password@db:5432/scheduler
         - CORS_ORIGIN=https://your-react-app.com
       depends_on:
         - db
       restart: always
   
     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=scheduler
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
       restart: always
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - api
       restart: always
   
   volumes:
     postgres_data:
   ```

2. **Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Full Stack Deployment Checklist

### Pre-deployment

- [ ] Test locally with production build
- [ ] Update all environment variables
- [ ] Set up production database
- [ ] Configure CORS for production domains
- [ ] Set up SSL certificates
- [ ] Configure domain names

### API Deployment

- [ ] Deploy database (Railway PostgreSQL or self-hosted)
- [ ] Run database migrations
- [ ] Deploy API to Railway/Docker
- [ ] Test API endpoints
- [ ] Set up monitoring (optional)

### React Deployment

- [ ] Update API URL in environment variables
- [ ] Build production bundle
- [ ] Deploy to Vercel/Netlify
- [ ] Configure custom domain
- [ ] Test all features

### Post-deployment

- [ ] Set up Google Sheets integration (if needed)
- [ ] Configure email settings
- [ ] Test PDF generation
- [ ] Set up backups
- [ ] Monitor for errors

## Environment Configuration

### Development
```bash
# .env.development
REACT_APP_SCHEDULER_API_URL=http://localhost:3000/api/v1
```

### Staging
```bash
# .env.staging
REACT_APP_SCHEDULER_API_URL=https://scheduler-api-staging.railway.app/api/v1
```

### Production
```bash
# .env.production
REACT_APP_SCHEDULER_API_URL=https://scheduler-api.railway.app/api/v1
```

## Security Considerations

1. **API Security**:
   ```javascript
   // Add rate limiting
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

2. **Authentication** (if needed):
   ```javascript
   // Example JWT middleware
   import jwt from 'jsonwebtoken';
   
   const authMiddleware = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'No token provided' });
     
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       res.status(401).json({ error: 'Invalid token' });
     }
   };
   ```

3. **HTTPS Only**:
   - Use HTTPS in production
   - Set secure cookies
   - Enable HSTS headers

## Monitoring

### Frontend (React)

1. **Sentry** for error tracking:
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.REACT_APP_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

2. **Google Analytics**:
   ```javascript
   import ReactGA from 'react-ga4';
   ReactGA.initialize(process.env.REACT_APP_GA_ID);
   ```

### Backend (API)

1. **Railway Metrics** (built-in)
2. **Custom logging**:
   ```javascript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

## Troubleshooting

### CORS Issues
```javascript
// In API, be specific about origins
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

### API Connection Issues
1. Check network tab in browser dev tools
2. Verify API URL in environment variables
3. Test API directly with curl/Postman
4. Check Railway logs

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Rollback Strategy

### Frontend
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

### Backend
```bash
# Railway
# Use Railway dashboard to rollback to previous deployment

# Docker
docker-compose down
git checkout previous-version
docker-compose up -d
```

## Support

- React issues: Check browser console
- API issues: Check Railway logs
- Database issues: Check connection string
- Integration issues: Verify CORS and environment variables
