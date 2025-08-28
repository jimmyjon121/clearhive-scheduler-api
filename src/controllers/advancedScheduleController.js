const db = require('../utils/db');

// Helper function to get next Tuesday
function getNextTuesday(date = new Date()) {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
  result.setDate(result.getDate() + daysUntilTuesday);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Helper to format date for SQL
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Check if two time slots overlap
function timeSlotsOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

// Get rotation vendors for a specific date
async function getRotationAssignments(facilityId, date) {
  const rotationVendors = await db.query(
    `SELECT v.*, vr.program_sequence, vr.start_date
     FROM vendors v
     JOIN vendor_rotations vr ON v.id = vr.vendor_id
     WHERE v.facility_id = $1 
       AND v.is_rotation_vendor = true 
       AND v.active = true
       AND vr.start_date <= $2 
       AND vr.end_date >= $2`,
    [facilityId, date]
  );

  const assignments = {};
  
  for (const vendor of rotationVendors.rows) {
    if (vendor.program_sequence && vendor.program_sequence.length > 0) {
      // Calculate which week of the rotation we're in
      const startDate = new Date(vendor.start_date);
      const currentDate = new Date(date);
      const weeksDiff = Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));
      const weekInRotation = weeksDiff % vendor.program_sequence.length;
      
      const assignedProgram = vendor.program_sequence[weekInRotation];
      if (assignedProgram) {
        assignments[assignedProgram] = vendor;
      }
    }
  }

  return assignments;
}

// Generate schedule for multiple weeks
async function generateScheduleForYear(req, res) {
  try {
    const { facility_id = 1, start_date, weeks = 52 } = req.body;
    const startTuesday = getNextTuesday(new Date(start_date || Date.now()));
    
    // Get all programs and vendors
    const programs = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1 ORDER BY priority, tuesday_start',
      [facility_id]
    );
    
    const vendors = await db.query(
      'SELECT * FROM vendors WHERE facility_id = $1 AND active = true',
      [facility_id]
    );

    // Get rotation vendors
    const rotationVendors = vendors.rows.filter(v => v.is_rotation_vendor);
    const regularVendors = vendors.rows.filter(v => !v.is_rotation_vendor);

    // Create rotation sequences
    const rotations = {};
    for (const vendor of rotationVendors) {
      // Create a rotation where each program gets the vendor once per cycle
      const programNames = programs.rows.map(p => p.house_name);
      const result = await db.query(
        `INSERT INTO vendor_rotations (facility_id, vendor_id, start_date, end_date, program_sequence)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [
          facility_id,
          vendor.id,
          formatDate(startTuesday),
          formatDate(new Date(startTuesday.getTime() + (52 * 7 * 24 * 60 * 60 * 1000))), // 1 year
          programNames
        ]
      );
    }

    const schedules = [];

    // Generate schedule for each week
    for (let week = 0; week < weeks; week++) {
      const currentDate = new Date(startTuesday.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
      const dateStr = formatDate(currentDate);

      // Get rotation assignments for this week
      const rotationAssignments = await getRotationAssignments(facility_id, dateStr);
      
      const weekAssignments = {};
      const usedVendors = new Set();
      const assignedPrograms = new Set();

      // First, assign rotation vendors
      for (const [programName, vendor] of Object.entries(rotationAssignments)) {
        const program = programs.rows.find(p => p.house_name === programName);
        if (program && !assignedPrograms.has(programName)) {
          weekAssignments[programName] = {
            vendor: vendor.name,
            vendor_id: vendor.id,
            address: vendor.address,
            contact: vendor.contact,
            phone: vendor.phone,
            email: vendor.email,
            maps_link: vendor.maps_link,
            color: vendor.color,
            time: `${program.tuesday_start} - ${program.tuesday_end}`,
            arrival_time: program.tuesday_start
          };
          usedVendors.add(vendor.id);
          assignedPrograms.add(programName);
        }
      }

      // Then assign remaining programs to available vendors
      for (const program of programs.rows) {
        if (assignedPrograms.has(program.house_name)) continue;

        // Find a vendor that hasn't been used and doesn't create time conflicts
        let assigned = false;
        for (const vendor of regularVendors) {
          if (usedVendors.has(vendor.id)) continue;

          // Check for time conflicts with other programs going to the same vendor
          let hasConflict = false;
          for (const [otherProgram, assignment] of Object.entries(weekAssignments)) {
            if (assignment.vendor_id === vendor.id) {
              const otherProgramData = programs.rows.find(p => p.house_name === otherProgram);
              if (timeSlotsOverlap(
                program.tuesday_start,
                program.tuesday_end,
                otherProgramData.tuesday_start,
                otherProgramData.tuesday_end
              )) {
                hasConflict = true;
                break;
              }
            }
          }

          if (!hasConflict) {
            weekAssignments[program.house_name] = {
              vendor: vendor.name,
              vendor_id: vendor.id,
              address: vendor.address,
              contact: vendor.contact,
              phone: vendor.phone,
              email: vendor.email,
              maps_link: vendor.maps_link,
              color: vendor.color,
              time: `${program.tuesday_start} - ${program.tuesday_end}`,
              arrival_time: program.tuesday_start
            };
            usedVendors.add(vendor.id);
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          // If no vendor is available, mark as TBD
          weekAssignments[program.house_name] = {
            vendor: 'TBD',
            vendor_id: null,
            time: `${program.tuesday_start} - ${program.tuesday_end}`,
            arrival_time: program.tuesday_start
          };
        }
      }

      // Save the schedule
      const result = await db.query(
        `INSERT INTO schedules (facility_id, schedule_date, assignments, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (facility_id, schedule_date) 
         DO UPDATE SET assignments = $3, created_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [facility_id, dateStr, JSON.stringify(weekAssignments), 'system']
      );

      schedules.push(result.rows[0]);
    }

    res.json({
      success: true,
      schedules: schedules,
      message: `Generated ${weeks} weeks of schedules starting from ${formatDate(startTuesday)}`
    });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get schedule with full details
async function getScheduleWithDetails(req, res) {
  try {
    const { date } = req.params;
    const facilityId = req.query.facility_id || 1;

    const schedule = await db.query(
      'SELECT * FROM schedules WHERE facility_id = $1 AND schedule_date = $2',
      [facilityId, date]
    );

    if (schedule.rows.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this date' });
    }

    // Get programs with colors
    const programs = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1',
      [facilityId]
    );

    // Get outing expectations
    const expectations = await db.query(
      'SELECT * FROM outing_expectations WHERE facility_id = $1 AND active = true',
      [facilityId]
    );

    // Enhance schedule with program colors
    const enhancedSchedule = schedule.rows[0];
    const enhancedAssignments = {};

    for (const [programName, assignment] of Object.entries(enhancedSchedule.assignments)) {
      const program = programs.rows.find(p => p.house_name === programName);
      enhancedAssignments[programName] = {
        ...assignment,
        program_color: program?.color || '#CCCCCC',
        program_coordinator_email: program?.program_coordinator_email
      };
    }

    res.json({
      ...enhancedSchedule,
      assignments: enhancedAssignments,
      expectations: expectations.rows,
      programs: programs.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get schedules for a date range
async function getScheduleRange(req, res) {
  try {
    const { start_date, end_date, facility_id = 1 } = req.query;

    const schedules = await db.query(
      `SELECT s.*, 
              jsonb_agg(jsonb_build_object(
                'house_name', p.house_name,
                'color', p.color
              )) as program_colors
       FROM schedules s
       LEFT JOIN programs p ON p.facility_id = s.facility_id
       WHERE s.facility_id = $1 
         AND s.schedule_date >= $2 
         AND s.schedule_date <= $3
       GROUP BY s.id
       ORDER BY s.schedule_date`,
      [facility_id, start_date, end_date]
    );

    res.json(schedules.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update a single assignment
async function updateAssignment(req, res) {
  try {
    const { date } = req.params;
    const { program_name, vendor_id, facility_id = 1 } = req.body;

    // Get current schedule
    const schedule = await db.query(
      'SELECT * FROM schedules WHERE facility_id = $1 AND schedule_date = $2',
      [facility_id, date]
    );

    if (schedule.rows.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this date' });
    }

    // Get vendor details
    const vendor = await db.query(
      'SELECT * FROM vendors WHERE id = $1',
      [vendor_id]
    );

    if (vendor.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get program details
    const program = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1 AND house_name = $2',
      [facility_id, program_name]
    );

    if (program.rows.length === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Update assignments
    const assignments = schedule.rows[0].assignments;
    assignments[program_name] = {
      vendor: vendor.rows[0].name,
      vendor_id: vendor.rows[0].id,
      address: vendor.rows[0].address,
      contact: vendor.rows[0].contact,
      phone: vendor.rows[0].phone,
      email: vendor.rows[0].email,
      maps_link: vendor.rows[0].maps_link,
      color: vendor.rows[0].color,
      time: `${program.rows[0].tuesday_start} - ${program.rows[0].tuesday_end}`,
      arrival_time: program.rows[0].tuesday_start
    };

    // Update schedule
    const result = await db.query(
      'UPDATE schedules SET assignments = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(assignments), schedule.rows[0].id]
    );

    res.json({
      success: true,
      schedule: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateScheduleForYear,
  getScheduleWithDetails,
  getScheduleRange,
  updateAssignment
};
