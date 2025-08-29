const express = require('express');
const router = express.Router();
const advancedScheduleController = require('../controllers/advancedScheduleController');
const pdfGenerator = require('../services/pdfGenerator');
const googleSheetsService = require('../services/googleSheetsService');
const emailService = require('../services/emailService');
const db = require('../utils/db');

// Generate schedule for year
router.post('/generate-year', advancedScheduleController.generateScheduleForYear);
// Alias to generate a number of weeks starting from a given date
router.post('/generate-week', (req, res) => {
  // reuse year generator but with weeks param from body
  req.body.weeks = req.body.weeks || 1;
  return advancedScheduleController.generateScheduleForYear(req, res);
});

// Get schedule with full details
router.get('/:date/details', advancedScheduleController.getScheduleWithDetails);

// Get schedules for date range
router.get('/range', advancedScheduleController.getScheduleRange);

// Update single assignment
router.put('/:date/assignment', advancedScheduleController.updateAssignment);

// Generate PDF for a schedule
router.get('/:date/pdf', async (req, res) => {
  try {
    const { date } = req.params;
  const facilityId = req.query.facility_id || 1;

    // Get schedule with details
    const schedule = await db.query(
      'SELECT * FROM schedules WHERE facility_id = $1 AND schedule_date = $2',
      [facilityId, date]
    );

    if (schedule.rows.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this date' });
    }

    // Get programs and expectations
    const programs = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1',
      [facilityId]
    );

    const expectations = await db.query(
      'SELECT * FROM outing_expectations WHERE facility_id = $1 AND active = true',
      [facilityId]
    );

    const facility = await db.query(
      'SELECT * FROM facilities WHERE id = $1',
      [facilityId]
    );

    // Enhance schedule with program colors
    const enhancedSchedule = schedule.rows[0];
    const enhancedAssignments = {};

    for (const [programName, assignment] of Object.entries(enhancedSchedule.assignments)) {
      const program = programs.rows.find(p => p.house_name === programName);
      enhancedAssignments[programName] = {
        ...assignment,
        program_color: program?.color || '#CCCCCC'
      };
    }

    const scheduleData = {
      ...enhancedSchedule,
      assignments: enhancedAssignments,
      expectations: expectations.rows
    };

    const facilitySettings = facility.rows[0] || { name: 'Family First Program' };

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateSchedulePDF(scheduleData, facilitySettings);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="schedule-${date}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send email notifications for a schedule
router.post('/:date/notify', async (req, res) => {
  try {
    const { date } = req.params;
    const { programs: programsToNotify } = req.body;
    const facilityId = req.query.facility_id || 1;

    // Get schedule
    const scheduleRes = await db.query(
      'SELECT * FROM schedules WHERE facility_id = $1 AND schedule_date = $2',
      [facilityId, date]
    );
    if (scheduleRes.rows.length === 0) {
      return res.status(404).json({ error: 'No schedule found for this date' });
    }

    const scheduleRow = scheduleRes.rows[0];

    // Get programs and expectations
    const programsRes = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1',
      [facilityId]
    );

    const expectationsRes = await db.query(
      'SELECT content FROM outing_expectations WHERE facility_id = $1 AND active = true',
      [facilityId]
    );

    // Get facility settings
    const facility = await db.query(
      'SELECT * FROM facilities WHERE id = $1',
      [facilityId]
    );

  const facilitySettings = facility.rows[0];

    // Initialize email service if not already done
    if (process.env.EMAIL_CONFIG) {
      emailService.initialize(JSON.parse(process.env.EMAIL_CONFIG));
    }

    // Send notifications
    let programsList = programsRes.rows;
    if (programsToNotify && programsToNotify.length > 0) {
      programsList = programsList.filter(p => programsToNotify.includes(p.house_name));
    }

    const results = await emailService.sendBulkScheduleNotifications(
      scheduleRow,
      programsList,
      expectationsRes.rows.map(e => e.content),
      facilitySettings
    );

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync with Google Sheets
router.post('/sync-sheets', async (req, res) => {
  try {
    const { spreadsheet_id, date_range, facility_id = 1 } = req.body;

    // Initialize Google Sheets service
    if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
      await googleSheetsService.initialize(JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS));
    } else {
      return res.status(400).json({ error: 'Google Sheets credentials not configured' });
    }

    // Get schedules for date range
    const schedules = await db.query(
      `SELECT * FROM schedules 
       WHERE facility_id = $1 
         AND schedule_date >= $2 
         AND schedule_date <= $3
       ORDER BY schedule_date`,
      [facility_id, date_range.start, date_range.end]
    );

    // Get programs and vendors
    const programs = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1',
      [facility_id]
    );

    const vendors = await db.query(
      'SELECT * FROM vendors WHERE facility_id = $1',
      [facility_id]
    );

    // Update Google Sheets
    let spreadsheetId = spreadsheet_id;
    if (!spreadsheetId) {
      // Create new spreadsheet if not provided
      const facility = await db.query(
        'SELECT * FROM facilities WHERE id = $1',
        [facility_id]
      );
      const facilityName = facility.rows[0]?.name || 'Family First Program';
      const newSpreadsheet = await googleSheetsService.createScheduleSpreadsheet(facilityName);
      spreadsheetId = newSpreadsheet.spreadsheetId;
    }

    await googleSheetsService.updateScheduleSheet(
      spreadsheetId,
      schedules.rows,
      programs.rows,
      vendors.rows
    );

    res.json({
      success: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    });
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check for conflicts
router.post('/check-conflicts', async (req, res) => {
  try {
    const { date, program_name, vendor_id, facility_id = 1 } = req.body;

    // Get all assignments for the date
    const schedule = await db.query(
      'SELECT * FROM schedules WHERE facility_id = $1 AND schedule_date = $2',
      [facility_id, date]
    );

    if (schedule.rows.length === 0) {
      return res.json({ conflicts: [], canAssign: true });
    }

    const conflicts = [];
    const assignments = schedule.rows[0].assignments;

    // Check if vendor is already assigned at overlapping times
    const program = await db.query(
      'SELECT * FROM programs WHERE facility_id = $1 AND house_name = $2',
      [facility_id, program_name]
    );

    if (program.rows.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const programData = program.rows[0];

    for (const [otherProgram, assignment] of Object.entries(assignments)) {
      if (assignment.vendor_id === vendor_id && otherProgram !== program_name) {
        // Check time overlap
        const otherProgramData = await db.query(
          'SELECT * FROM programs WHERE facility_id = $1 AND house_name = $2',
          [facility_id, otherProgram]
        );

        if (otherProgramData.rows.length > 0) {
          const other = otherProgramData.rows[0];
          
          // Check if times overlap
          if (programData.tuesday_start < other.tuesday_end && 
              other.tuesday_start < programData.tuesday_end) {
            conflicts.push({
              type: 'vendor_overlap',
              message: `${assignment.vendor} is already assigned to ${otherProgram} during overlapping time`,
              conflictingProgram: otherProgram,
              conflictingTime: `${other.tuesday_start} - ${other.tuesday_end}`
            });
          }
        }
      }
    }

    res.json({
      conflicts,
      canAssign: conflicts.length === 0
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
