const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const fs = require('fs');
const path = require('path');

// One-time setup endpoint for Railway
router.post('/initialize', async (req, res) => {
  try {
    // Check if already initialized
    const checkTables = await db.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'facilities')"
    );
    
    if (checkTables.rows[0].exists) {
      return res.json({ 
        success: false, 
        message: 'Database already initialized' 
      });
    }

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await db.query(schema);
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully! You can now use the scheduler API.' 
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check that also shows setup status
router.get('/status', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check if tables exist
    const checkTables = await db.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'facilities')"
    );
    
    const isInitialized = checkTables.rows[0].exists;
    
    // Get counts if initialized
    let stats = {};
    if (isInitialized) {
      const programs = await db.query('SELECT COUNT(*) FROM programs');
      const vendors = await db.query('SELECT COUNT(*) FROM vendors');
      const schedules = await db.query('SELECT COUNT(*) FROM schedules');
      
      stats = {
        programs: parseInt(programs.rows[0].count),
        vendors: parseInt(vendors.rows[0].count),
        schedules: parseInt(schedules.rows[0].count)
      };
    }
    
    res.json({
      status: 'healthy',
      database: 'connected',
      initialized: isInitialized,
      stats: isInitialized ? stats : null,
      setupUrl: !isInitialized ? '/api/v1/setup/initialize' : null
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
