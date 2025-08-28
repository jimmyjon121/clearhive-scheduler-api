require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const vendorRoutes = require('./routes/vendors');
const scheduleRoutes = require('./routes/schedules');
const advancedScheduleRoutes = require('./routes/advancedSchedules');
const programRoutes = require('./routes/programs');
const setupRoutes = require('./routes/setup');

app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/advanced-schedules', advancedScheduleRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/setup', setupRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Family First Therapeutic Outing Scheduler API',
    version: '1.0.0',
    status: 'Check /api/v1/setup/status for database status',
    documentation: 'https://github.com/yourusername/clearhive-scheduler-api'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
