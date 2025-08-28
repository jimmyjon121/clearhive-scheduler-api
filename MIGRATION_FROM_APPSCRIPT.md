# Migration Guide: Google Apps Script to Standalone API

## Overview

This guide helps you migrate from a Google Apps Script-based scheduling system to this standalone API that can be integrated into your React application while maintaining all automation features.

## Key Advantages of the API Approach

1. **Full Control**: Host anywhere, customize everything
2. **Better Performance**: No Google Apps Script execution limits
3. **React Integration**: Native integration with your React app
4. **Multi-tenant**: Support multiple facilities
5. **Scalability**: Handle more users and data
6. **Security**: Implement your own authentication/authorization

## Feature Comparison

| Feature | Google Apps Script | This API |
|---------|-------------------|----------|
| Automated Scheduling | ✅ | ✅ |
| Rotation Vendors | ✅ | ✅ |
| Conflict Prevention | ✅ | ✅ |
| PDF Generation | ✅ (Limited) | ✅ (Full control) |
| Email Notifications | ✅ | ✅ |
| Google Sheets Sync | ✅ (Native) | ✅ (Via API) |
| Color Coding | ✅ | ✅ |
| React Integration | ❌ | ✅ |
| Custom Authentication | ❌ | ✅ |
| API Access | ❌ | ✅ |
| Offline Capability | ❌ | ✅ (Possible) |

## Migration Steps

### 1. Export Your Data

From Google Sheets:
```javascript
// Export programs
const programs = [
  {
    house_name: "Banyan",
    tuesday_start: "10:00:00",
    tuesday_end: "12:00:00",
    color: "#FF6B6B",
    program_coordinator_email: "pc.banyan@familyfirst.org"
  },
  // ... more programs
];

// Export vendors
const vendors = [
  {
    name: "Equine Therapy",
    vendor_type: "Equine Therapy",
    is_rotation_vendor: true,
    rotation_weeks: 4,
    // ... more fields
  },
  // ... more vendors
];
```

### 2. Set Up the API

```bash
# Clone and install
git clone <your-repo>
cd clearhive-scheduler-api
npm install

# Run setup
npm run setup

# Import your data (see below)
```

### 3. Import Your Data

Create a migration script:

```javascript
// src/scripts/migrate-data.js
const db = require('../utils/db');

async function migrateData() {
  // Import programs
  for (const program of programs) {
    await db.query(
      `INSERT INTO programs (facility_id, house_name, tuesday_start, tuesday_end, color, program_coordinator_email)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [1, program.house_name, program.tuesday_start, program.tuesday_end, program.color, program.program_coordinator_email]
    );
  }

  // Import vendors
  for (const vendor of vendors) {
    await db.query(
      `INSERT INTO vendors (facility_id, name, vendor_type, is_rotation_vendor, rotation_weeks, ...)
       VALUES ($1, $2, $3, $4, $5, ...)`,
      [1, vendor.name, vendor.vendor_type, vendor.is_rotation_vendor, vendor.rotation_weeks, ...]
    );
  }
}

migrateData();
```

### 4. Update Your React App

Install the scheduler service:

```javascript
// src/services/schedulerService.js
import api from './api';

export const schedulerService = {
  generateYearSchedule: (data) => api.post('/advanced-schedules/generate-year', data),
  getScheduleDetails: (date) => api.get(`/advanced-schedules/${date}/details`),
  // ... other methods
};
```

### 5. Replace Google Apps Script Functions

#### Old (Apps Script):
```javascript
function generateWeeklySchedule() {
  const sheet = SpreadsheetApp.getActiveSheet();
  // ... scheduling logic
}
```

#### New (API):
```javascript
// In your React component
const handleGenerateSchedule = async () => {
  const response = await schedulerService.generateYearSchedule({
    facility_id: 1,
    start_date: '2025-09-02',
    weeks: 52
  });
};
```

### 6. Maintain Google Sheets Integration

The API can still update your Google Sheets:

```javascript
// Sync to Google Sheets
const syncToSheets = async () => {
  const response = await schedulerService.syncGoogleSheets({
    spreadsheet_id: 'your-existing-sheet-id',
    date_range: {
      start: '2025-09-01',
      end: '2025-12-31'
    }
  });
};
```

## Automation Features

### 1. Scheduled Jobs

Use cron jobs or task schedulers:

```javascript
// src/jobs/weeklySchedule.js
const cron = require('node-cron');

// Generate next week's schedule every Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
  await generateNextWeekSchedule();
});

// Send reminders every Monday at 3 PM
cron.schedule('0 15 * * 1', async () => {
  await sendTomorrowReminders();
});
```

### 2. Webhooks

Add webhook endpoints for external triggers:

```javascript
// src/routes/webhooks.js
router.post('/webhook/calendar-sync', async (req, res) => {
  // Triggered by external calendar system
  await syncGoogleSheets();
  res.json({ success: true });
});
```

### 3. Event-Driven Updates

```javascript
// When a vendor is updated
router.put('/vendors/:id', async (req, res) => {
  const vendor = await updateVendor(req.params.id, req.body);
  
  // Automatically update affected schedules
  await updateFutureSchedules(vendor);
  
  // Notify affected programs
  await notifyAffectedPrograms(vendor);
  
  res.json(vendor);
});
```

## Authentication & Security

Add authentication to protect your API:

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply to routes
router.use('/api/v1', authenticate);
```

## React App Integration

### Main App Component
```jsx
import React from 'react';
import { SchedulerProvider } from './hooks/useScheduler';
import ScheduleCalendar from './components/ScheduleCalendar';

function App() {
  return (
    <SchedulerProvider>
      <div className="app">
        <ScheduleCalendar />
      </div>
    </SchedulerProvider>
  );
}
```

### Using the Hook
```jsx
import React from 'react';
import { useScheduler } from './hooks/useScheduler';

function ScheduleManager() {
  const {
    programs,
    vendors,
    generateYearSchedule,
    syncToGoogleSheets,
    loading,
    error
  } = useScheduler();

  // Your component logic
}
```

## Deployment Options

### 1. Heroku
```bash
# Add Procfile
echo "web: node src/index.js" > Procfile

# Deploy
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### 2. AWS/DigitalOcean
- Set up PostgreSQL database
- Deploy Node.js app
- Configure environment variables
- Set up SSL certificate

### 3. Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

## Maintaining Compatibility

Keep Google Sheets updated alongside your API:

```javascript
// src/services/syncService.js
class SyncService {
  async bidirectionalSync() {
    // Pull changes from Google Sheets
    const sheetData = await googleSheetsService.getSchedules();
    
    // Update local database
    await this.updateFromSheets(sheetData);
    
    // Push local changes back
    const localData = await this.getLocalSchedules();
    await googleSheetsService.updateSchedules(localData);
  }
}
```

## Advantages Over Apps Script

1. **No Execution Limits**: Google Apps Script has 6-minute execution limits
2. **Better Error Handling**: Full control over error messages and recovery
3. **Faster Performance**: No Apps Script overhead
4. **Custom Features**: Add any feature you need
5. **Integration Ready**: Works with any frontend framework
6. **Version Control**: Full Git integration
7. **Testing**: Write unit and integration tests
8. **Monitoring**: Add custom logging and monitoring

## Need Help?

1. Check the [API Documentation](README.md)
2. Review [Example Components](examples/react-integration/)
3. See [Quick Start Guide](QUICKSTART.md)

The migration maintains all your existing automation while giving you much more control and flexibility for future features!
