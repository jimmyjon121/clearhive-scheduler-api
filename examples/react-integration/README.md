# React Integration Guide

This guide shows how to integrate the Therapeutic Outing Scheduler API into your React application.

## Installation

```bash
npm install axios date-fns
# Optional: for calendar views
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid
```

## Quick Start

1. Copy the `services` folder to your React app's `src` directory
2. Copy the example components you need from this directory
3. Update `.env` with your API URL:
   ```
   REACT_APP_SCHEDULER_API_URL=http://localhost:3000/api/v1
   ```
4. Import and use the components in your app

## Available Components

### 1. ScheduleCalendar
Full-featured calendar view with:
- Monthly/weekly/daily views
- Drag-and-drop rescheduling
- Color-coded programs and vendors
- Quick actions (PDF, email, edit)

```jsx
import ScheduleCalendar from './components/ScheduleCalendar';

function App() {
  return <ScheduleCalendar />;
}
```

### 2. ProgramManager
CRUD interface for managing houses/programs:
- Add/edit/delete programs
- Set colors and time slots
- Visual program cards

```jsx
import ProgramManager from './components/ProgramManager';

function Settings() {
  return <ProgramManager onUpdate={() => console.log('Programs updated')} />;
}
```

### 3. VendorManager  
CRUD interface for managing vendors:
- Add/edit/delete vendors
- Configure rotation schedules
- Contact information and maps
- Active/inactive status

```jsx
import VendorManager from './components/VendorManager';

function Settings() {
  return <VendorManager onUpdate={() => console.log('Vendors updated')} />;
}
```

### 4. ScheduleGenerator
Bulk schedule generation:
- Generate schedules for entire year
- Select specific programs/vendors
- Conflict detection
- Progress feedback

```jsx
import ScheduleGenerator from './components/ScheduleGenerator';

function Admin() {
  return <ScheduleGenerator onGenerate={() => console.log('Schedule generated')} />;
}
```

### 5. useScheduler Hook
Custom React hook for scheduler operations:
- Centralized state management
- Loading states
- Error handling
- Caching

```jsx
import { useScheduler } from './hooks/useScheduler';

function MyComponent() {
  const { 
    programs, 
    vendors, 
    loading, 
    error,
    generateSchedule 
  } = useScheduler();
  
  // Use the scheduler data and methods
}
```

## React Components

See the example components in this directory:

1. **ScheduleCalendar.jsx** - Main calendar view component
2. **ProgramManager.jsx** - Manage houses/programs
3. **VendorManager.jsx** - Manage vendors
4. **ScheduleGenerator.jsx** - Generate and manage schedules
5. **hooks/useScheduler.js** - Custom React hook for scheduler operations

## Environment Setup

Add to your `.env` file:

```
REACT_APP_SCHEDULER_API_URL=http://localhost:3000/api/v1
```

## Quick Start Example

```jsx
import React, { useEffect, useState } from 'react';
import { schedulerService } from './services/schedulerService';

function App() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaySchedule();
  }, []);

  const loadTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await schedulerService.getScheduleDetails(today);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Today's Schedule</h1>
      {/* Render schedule */}
    </div>
  );
}

export default App;
```

## Integration Patterns

### 1. Full App Example
See `App.example.jsx` for a complete application with:
- Navigation between views
- State management
- Error boundaries
- Loading states

### 2. Authentication
If you add authentication to the API:
```javascript
// Login and store token
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  localStorage.setItem('authToken', response.data.token);
};

// The schedulerAPI.js interceptor will automatically add the token
```

### 3. Error Handling
```javascript
try {
  const response = await schedulerService.getPrograms();
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.message);
  } else if (error.request) {
    // No response from server
    console.error('Network error');
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

### 4. Real-time Updates
For real-time schedule updates using WebSockets:
```javascript
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL);

socket.on('schedule-updated', (data) => {
  // Refresh the affected schedule
  refreshSchedule(data.date);
});
```

## Production Deployment

### 1. Environment Variables
Create `.env.production`:
```
REACT_APP_SCHEDULER_API_URL=https://api.yourscheduler.com/api/v1
```

### 2. Build and Deploy
```bash
npm run build
# Deploy the build folder to your hosting service
```

### 3. CORS Configuration
Ensure your API allows requests from your React app domain:
```javascript
// In your API server
app.use(cors({
  origin: ['https://yourschedulerapp.com'],
  credentials: true
}));
```

## Styling

All components come with their own CSS files that you can customize:
- `ScheduleCalendar.css`
- `ProgramManager.css`
- `VendorManager.css`
- `ScheduleGenerator.css`

To override styles, either:
1. Modify the CSS files directly
2. Use CSS specificity in your own stylesheets
3. Use CSS-in-JS libraries like styled-components

## Testing

Example test for a component:
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgramManager from './ProgramManager';
import { schedulerService } from './services/schedulerService';

jest.mock('./services/schedulerService');

test('creates a new program', async () => {
  schedulerService.getPrograms.mockResolvedValue({ data: [] });
  schedulerService.createProgram.mockResolvedValue({ data: { id: 1 } });
  
  render(<ProgramManager />);
  
  await userEvent.type(screen.getByLabelText('House Name'), 'Test House');
  await userEvent.click(screen.getByText('Add Program'));
  
  await waitFor(() => {
    expect(schedulerService.createProgram).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the API server has proper CORS configuration
2. **404 Errors**: Check that API_BASE_URL is correct in .env
3. **Authentication Errors**: Ensure token is being stored and sent correctly
4. **Date Issues**: The API expects dates in YYYY-MM-DD format

### Debug Mode
Enable debug logging:
```javascript
// In schedulerAPI.js
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url, config.data);
  return config;
});
```

## Support

For issues or questions:
1. Check the API documentation in the main README
2. Review the example components
3. Check the browser console for errors
4. Ensure all environment variables are set correctly
