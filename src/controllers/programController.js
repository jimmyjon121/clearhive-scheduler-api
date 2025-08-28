const db = require('../utils/db');

async function getPrograms(req, res) {
  try {
    const facilityId = req.query.facility_id || 1;
    const result = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1 ORDER BY priority, house_name',
      [facilityId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createProgram(req, res) {
  try {
    const { 
      house_name, 
      tuesday_start, 
      tuesday_end, 
      priority,
      color,
      program_coordinator_email,
      facility_id = 1 
    } = req.body;
    
    const result = await db.query(
      `INSERT INTO programs (facility_id, house_name, tuesday_start, tuesday_end, priority, color, program_coordinator_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [facility_id, house_name, tuesday_start, tuesday_end, priority, color, program_coordinator_email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateProgram(req, res) {
  try {
    const { id } = req.params;
    const {
      house_name,
      tuesday_start,
      tuesday_end,
      priority,
      color,
      program_coordinator_email
    } = req.body;

    const result = await db.query(
      `UPDATE programs 
       SET house_name = COALESCE($2, house_name),
           tuesday_start = COALESCE($3, tuesday_start),
           tuesday_end = COALESCE($4, tuesday_end),
           priority = COALESCE($5, priority),
           color = COALESCE($6, color),
           program_coordinator_email = COALESCE($7, program_coordinator_email)
       WHERE id = $1
       RETURNING *`,
      [id, house_name, tuesday_start, tuesday_end, priority, color, program_coordinator_email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteProgram(req, res) {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM programs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ message: 'Program deleted successfully', program: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Check for time conflicts between programs
async function checkTimeConflicts(req, res) {
  try {
    const { facility_id = 1, program_id, tuesday_start, tuesday_end } = req.body;

    const conflicts = await db.query(
      `SELECT * FROM programs 
       WHERE facility_id = $1 
         AND id != $2
         AND (
           (tuesday_start <= $3 AND tuesday_end > $3) OR
           (tuesday_start < $4 AND tuesday_end >= $4) OR
           (tuesday_start >= $3 AND tuesday_end <= $4)
         )`,
      [facility_id, program_id || 0, tuesday_start, tuesday_end]
    );

    res.json({
      hasConflicts: conflicts.rows.length > 0,
      conflicts: conflicts.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  getPrograms, 
  createProgram, 
  updateProgram, 
  deleteProgram, 
  checkTimeConflicts 
};
