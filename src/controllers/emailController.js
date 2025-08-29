const emailService = require('../services/emailService');
const db = require('../utils/db');

class EmailController {
  // Send schedule notification to specific house
  static async sendScheduleNotification(req, res) {
    try {
      const { scheduleId, programId } = req.params;
      const { includeColorCoding = true } = req.body;

      // Get schedule data
      const schedule = await db.query(
        'SELECT * FROM schedules WHERE id = ?',
        [scheduleId]
      );

      if (!schedule.length) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Get program data
      const program = await db.query(
        'SELECT * FROM programs WHERE id = ?',
        [programId]
      );

      if (!program.length) {
        return res.status(404).json({ error: 'Program not found' });
      }

      // Get facility settings
      const facility = await db.query(
        'SELECT * FROM facilities WHERE id = ?',
        [program[0].facility_id]
      );

      // Get expectations
      const expectations = await db.query(
        'SELECT content FROM outing_expectations WHERE facility_id = ? AND active = true',
        [program[0].facility_id]
      );

      const result = await emailService.sendScheduleNotification(
        program[0],
        schedule[0],
        expectations.map(e => e.content),
        facility[0],
        includeColorCoding
      );

      res.json(result);
    } catch (error) {
      console.error('Error sending schedule notification:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Send bulk notifications to all houses for a specific date
  static async sendBulkNotifications(req, res) {
    try {
      const { scheduleDate } = req.params;
      const { includeColorCoding = true } = req.body;

      // Get all schedules for the date
      const schedules = await db.query(
        'SELECT * FROM schedules WHERE schedule_date = ?',
        [scheduleDate]
      );

      if (!schedules.length) {
        return res.status(404).json({ error: 'No schedules found for this date' });
      }

      // Get all programs
      const programs = await db.query(
        'SELECT * FROM programs WHERE facility_id = ?',
        [schedules[0].facility_id]
      );

      // Get facility settings
      const facility = await db.query(
        'SELECT * FROM facilities WHERE id = ?',
        [schedules[0].facility_id]
      );

      // Get expectations
      const expectations = await db.query(
        'SELECT content FROM outing_expectations WHERE facility_id = ? AND active = true',
        [schedules[0].facility_id]
      );

      const results = [];
      for (const schedule of schedules) {
        const result = await emailService.sendBulkScheduleNotifications(
          schedule,
          programs,
          expectations.map(e => e.content),
          facility[0]
        );
        results.push(...result);
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get email archives with filters
  static async getEmailArchives(req, res) {
    try {
      const { 
        house_name, 
        date_from, 
        date_to, 
        limit = 50,
        page = 1 
      } = req.query;

      const offset = (page - 1) * limit;
      let query = `
        SELECT ea.*, p.color as house_color
        FROM email_archives ea
        LEFT JOIN programs p ON ea.house_name = p.house_name
        WHERE ea.facility_id = ?
      `;
      const params = [req.facilityId || 1];

      if (house_name) {
        query += ' AND ea.house_name = ?';
        params.push(house_name);
      }

      if (date_from) {
        query += ' AND ea.schedule_date >= ?';
        params.push(date_from);
      }

      if (date_to) {
        query += ' AND ea.schedule_date <= ?';
        params.push(date_to);
      }

      query += ' ORDER BY ea.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const archives = await db.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM email_archives ea
        WHERE ea.facility_id = ?
      `;
      const countParams = [req.facilityId || 1];

      if (house_name) {
        countQuery += ' AND ea.house_name = ?';
        countParams.push(house_name);
      }

      if (date_from) {
        countQuery += ' AND ea.schedule_date >= ?';
        countParams.push(date_from);
      }

      if (date_to) {
        countQuery += ' AND ea.schedule_date <= ?';
        countParams.push(date_to);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        archives,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching email archives:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get archived email content
  static async getArchivedEmail(req, res) {
    try {
      const { archiveId } = req.params;
      const { type = 'html' } = req.query; // 'html' or 'pdf'

      const archive = await db.query(
        'SELECT * FROM email_archives WHERE id = ?',
        [archiveId]
      );

      if (!archive.length) {
        return res.status(404).json({ error: 'Archive not found' });
      }

      const archiveData = archive[0];
      const filePath = type === 'pdf' ? archiveData.pdf_path : archiveData.html_path;

      if (!filePath) {
        return res.status(404).json({ error: `${type.toUpperCase()} file not found` });
      }

      const fs = require('fs').promises;
      const path = require('path');
      const fullPath = path.join(__dirname, '../../archives/emails', filePath);

      try {
        const content = await fs.readFile(fullPath);
        
        if (type === 'pdf') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="${filePath}"`);
        } else {
          res.setHeader('Content-Type', 'text/html');
        }
        
        res.send(content);
      } catch (fileError) {
        res.status(404).json({ error: 'Archive file not found on disk' });
      }
    } catch (error) {
      console.error('Error fetching archived email:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update email settings
  static async updateEmailSettings(req, res) {
    try {
      const facilityId = req.facilityId || 1;
      const {
        smtp_host,
        smtp_port,
        smtp_secure,
        smtp_user,
        smtp_pass,
        from_email,
        admin_email,
        daily_reminder_time,
        weekly_digest_day,
        weekly_digest_time,
        auto_reminders_enabled,
        color_coding_enabled,
        archive_enabled
      } = req.body;

      // Update or insert email settings
      const updateQuery = `
        UPDATE email_settings SET
          smtp_host = COALESCE(?, smtp_host),
          smtp_port = COALESCE(?, smtp_port),
          smtp_secure = COALESCE(?, smtp_secure),
          smtp_user = COALESCE(?, smtp_user),
          smtp_pass = COALESCE(?, smtp_pass),
          from_email = COALESCE(?, from_email),
          admin_email = COALESCE(?, admin_email),
          daily_reminder_time = COALESCE(?, daily_reminder_time),
          weekly_digest_day = COALESCE(?, weekly_digest_day),
          weekly_digest_time = COALESCE(?, weekly_digest_time),
          auto_reminders_enabled = COALESCE(?, auto_reminders_enabled),
          color_coding_enabled = COALESCE(?, color_coding_enabled),
          archive_enabled = COALESCE(?, archive_enabled),
          updated_at = CURRENT_TIMESTAMP
        WHERE facility_id = ?
      `;

      await db.query(updateQuery, [
        smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass,
        from_email, admin_email, daily_reminder_time, weekly_digest_day,
        weekly_digest_time, auto_reminders_enabled, color_coding_enabled,
        archive_enabled, facilityId
      ]);

      // Reinitialize email service with new settings
      const settings = await db.query(
        'SELECT * FROM email_settings WHERE facility_id = ?',
        [facilityId]
      );

      if (settings.length) {
        emailService.initialize({
          host: settings[0].smtp_host,
          port: settings[0].smtp_port,
          secure: settings[0].smtp_secure,
          user: settings[0].smtp_user,
          pass: settings[0].smtp_pass
        });

        // Restart automated reminders if enabled
        if (settings[0].auto_reminders_enabled) {
          emailService.setupAutomatedReminders(settings[0]);
        }
      }

      res.json({ success: true, message: 'Email settings updated successfully' });
    } catch (error) {
      console.error('Error updating email settings:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get email settings
  static async getEmailSettings(req, res) {
    try {
      const facilityId = req.facilityId || 1;
      
      const settings = await db.query(
        'SELECT * FROM email_settings WHERE facility_id = ?',
        [facilityId]
      );

      if (!settings.length) {
        return res.status(404).json({ error: 'Email settings not found' });
      }

      // Don't return sensitive password data
      const safeSettings = { ...settings[0] };
      delete safeSettings.smtp_pass;

      res.json({ success: true, settings: safeSettings });
    } catch (error) {
      console.error('Error fetching email settings:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Manual trigger for daily reminders
  static async sendDailyReminders(req, res) {
    try {
      await emailService.sendDailyReminders();
      res.json({ success: true, message: 'Daily reminders sent successfully' });
    } catch (error) {
      console.error('Error sending daily reminders:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get email statistics
  static async getEmailStatistics(req, res) {
    try {
      const facilityId = req.facilityId || 1;
      const { days = 30 } = req.query;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      const stats = await db.query(`
        SELECT 
          house_name,
          COUNT(*) as total_emails,
          COUNT(CASE WHEN email_type = 'schedule_notification' THEN 1 END) as schedule_emails,
          COUNT(CASE WHEN email_type = 'reminder' THEN 1 END) as reminder_emails,
          MAX(created_at) as last_email_sent
        FROM email_archives 
        WHERE facility_id = ? AND created_at >= ?
        GROUP BY house_name
        ORDER BY total_emails DESC
      `, [facilityId, dateFrom.toISOString()]);

      const totalStats = await db.query(`
        SELECT 
          COUNT(*) as total_emails,
          COUNT(DISTINCT house_name) as houses_contacted,
          COUNT(CASE WHEN email_type = 'schedule_notification' THEN 1 END) as schedule_emails,
          COUNT(CASE WHEN email_type = 'reminder' THEN 1 END) as reminder_emails
        FROM email_archives 
        WHERE facility_id = ? AND created_at >= ?
      `, [facilityId, dateFrom.toISOString()]);

      res.json({
        success: true,
        period_days: parseInt(days),
        by_house: stats,
        totals: totalStats[0]
      });
    } catch (error) {
      console.error('Error fetching email statistics:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EmailController;
