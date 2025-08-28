const db = require('../utils/db');

async function generateSchedule(req, res) {
  try {
    const { facility_id = 1, start_date, weeks = 1 } = req.body;
    
    const vendors = await db.query(
      'SELECT * FROM vendors WHERE facility_id = $1 AND active = true',
      [facility_id]
    );
    
    const programs = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1',
      [facility_id]
    );
    
    const assignments = {};
    programs.rows.forEach((program, index) => {
      if (vendors.rows[index]) {
        assignments[program.house_name] = {
          vendor: vendors.rows[index].name,
          time: `${program.tuesday_start} - ${program.tuesday_end}`
        };
      }
    });
    
    const result = await db.query(
      `INSERT INTO schedules (facility_id, schedule_date, assignments, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [facility_id, start_date, JSON.stringify(assignments), 'system']
    );
    
    res.json({
      success: true,
      schedule: result.rows[0],
      message: `Generated schedule for ${start_date}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSchedule(req, res) {
  try {
    const { date } = req.params;
    const facilityId = req.query.facility_id || 1;
    
    const result = await db.query(
      'SELECT * FROM schedules WHERE facility_id = $1 AND schedule_date = $2',
      [facilityId, date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this date' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { generateSchedule, getSchedule };
