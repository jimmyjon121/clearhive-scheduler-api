require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const vendorRoutes = require('./routes/vendors');
const scheduleRoutes = require('./routes/schedules');

app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/schedules', scheduleRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
