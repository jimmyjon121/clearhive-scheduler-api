require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Load routes with error handling
try {
  const vendorRoutes = require('./routes/vendors');
  app.use('/api/v1/vendors', vendorRoutes);
  console.log('✅ Vendor routes loaded');
} catch (error) {
  console.error('❌ Error loading vendor routes:', error.message);
}

try {
  const scheduleRoutes = require('./routes/schedules');
  app.use('/api/v1/schedules', scheduleRoutes);
  console.log('✅ Schedule routes loaded');
} catch (error) {
  console.error('❌ Error loading schedule routes:', error.message);
}

try {
  const advancedScheduleRoutes = require('./routes/advancedSchedules');
  app.use('/api/v1/advanced-schedules', advancedScheduleRoutes);
  console.log('✅ Advanced schedule routes loaded');
} catch (error) {
  console.error('❌ Error loading advanced schedule routes:', error.message);
}

try {
  const programRoutes = require('./routes/programs');
  app.use('/api/v1/programs', programRoutes);
  console.log('✅ Program routes loaded');
} catch (error) {
  console.error('❌ Error loading program routes:', error.message);
}

try {
  const setupRoutes = require('./routes/setup');
  app.use('/api/v1/setup', setupRoutes);
  console.log('✅ Setup routes loaded');
} catch (error) {
  console.error('❌ Error loading setup routes:', error.message);
}

try {
  const emailRoutes = require('./routes/emails');
  app.use('/api/v1/emails', emailRoutes);
  console.log('✅ Email routes loaded');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
}

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
