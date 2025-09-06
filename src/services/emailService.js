const nodemailer = require('nodemailer');
const pdfGenerator = require('./pdfGenerator');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const db = require('../utils/db');

class EmailService {
  constructor() {
    this.transporter = null;
    this.colorScheme = {
      'Cove': '#3498db',      // Blue
      'Banyan': '#2ecc71',    // Green
      'Sunrise': '#f39c12',   // Orange
      'Sunset': '#e74c3c',    // Red
      'Mountain View': '#9b59b6', // Purple
      'Oceanside': '#1abc9c',     // Turquoise
      'Downtown': '#34495e',      // Dark Gray
      'Westside': '#e67e22',      // Carrot
      'Northshore': '#16a085',    // Green Sea
      'Lakeside': '#2980b9',      // Belize Blue
      // Add more houses as needed
    };
    this.reminderJobs = new Map();
    this.recentEmailHashes = new Map(); // Track recent emails to prevent duplicates
    this.emailRateLimiter = new Map(); // Rate limiting per recipient
  }

  initialize({ host, port, secure, user, pass }) {
    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: Boolean(secure),
        auth: user && pass ? { user, pass } : undefined
      });
      return { success: true };
    } catch (error) {
      console.error('Error initializing email transporter:', error);
      this.transporter = null;
      return { success: false, error: error.message };
    }
  }

  async sendScheduleNotification(program, scheduleData, expectations = [], facilitySettings = {}, includeColorCoding = true, dryRun = false) {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const houseName = program.house_name;
    const assignment = scheduleData.assignments?.[houseName];
    if (!assignment) {
      return { success: false, error: `No assignment found for ${houseName}` };
    }

    const houseColor = this.getHouseColor(houseName);
    const emailHTML = await this.generateColorCodedEmailHTML(
      houseName,
      assignment,
      expectations,
      facilitySettings,
      scheduleData,
      houseColor,
      includeColorCoding
    );

    // Prepare expectations for PDF template (expects array of {title, content})
    const expectationsForPdf = Array.isArray(expectations) && expectations.length
      ? [{ title: 'Important Reminders', content: expectations.map(e => `<p>${e}</p>`).join('') }]
      : [];

    const pdfBuffer = await pdfGenerator.generateSchedulePDF({
      ...scheduleData,
      expectations: expectationsForPdf
    }, facilitySettings);

    // Collect and deduplicate recipients
    const recipientSet = new Set();
    if (program.program_coordinator_email) {
      recipientSet.add(program.program_coordinator_email.trim().toLowerCase());
    }
    if (program.additional_emails) {
      program.additional_emails.split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
        .forEach(email => recipientSet.add(email));
    }
    
    const recipients = Array.from(recipientSet);
    
    if (!recipients.length) {
      return { success: false, error: 'No recipients found for program' };
    }
    
    console.log(`[EMAIL] Preparing to send schedule notification for ${houseName} to ${recipients.length} recipient(s): ${recipients.join(', ')}`);
    console.log(`[EMAIL] Schedule Date: ${scheduleData.schedule_date}, Facility: ${scheduleData.facility_id || program.facility_id || 1}`);

    const mailOptions = {
      from: facilitySettings.from_email || facilitySettings.email || 'noreply@familyfirst.org',
      to: recipients.join(', '),
      subject: `Therapeutic Outing Schedule - ${houseName} - ${new Date(scheduleData.schedule_date).toLocaleDateString()}`,
      html: emailHTML,
      attachments: [
        {
          filename: `outing-schedule-${houseName}-${scheduleData.schedule_date}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Generate email hash for duplicate detection
    const crypto = require('crypto');
    const emailHash = crypto.createHash('md5')
      .update(`${houseName}-${scheduleData.schedule_date}-${recipients.join(',')}`)
      .digest('hex');
    
    // Check for duplicate email sent in the last hour
    const lastSent = this.recentEmailHashes.get(emailHash);
    if (lastSent && (Date.now() - lastSent) < 3600000) { // 1 hour
      console.warn(`[EMAIL] Duplicate email detected for ${houseName} on ${scheduleData.schedule_date}. Skipping.`);
      return { 
        success: false, 
        error: 'Duplicate email detected - same email was sent within the last hour',
        isDuplicate: true 
      };
    }
    
    // Check rate limiting (max 10 emails per recipient per hour)
    for (const recipient of recipients) {
      const recipientKey = recipient.toLowerCase();
      const sentTimes = this.emailRateLimiter.get(recipientKey) || [];
      const recentSends = sentTimes.filter(time => Date.now() - time < 3600000);
      
      if (recentSends.length >= 10) {
        console.warn(`[EMAIL] Rate limit exceeded for ${recipient}. ${recentSends.length} emails sent in the last hour.`);
        return { 
          success: false, 
          error: `Rate limit exceeded for ${recipient}`,
          isRateLimited: true 
        };
      }
    }

    try {
      if (dryRun) {
        console.log(`[EMAIL] DRY RUN - Would send email to ${recipients.join(', ')} for ${houseName}`);
        console.log(`[EMAIL] DRY RUN - Subject: ${mailOptions.subject}`);
        console.log(`[EMAIL] DRY RUN - From: ${mailOptions.from}`);
        console.log(`[EMAIL] DRY RUN - Attachment: ${mailOptions.attachments[0].filename}`);
        
        return { 
          success: true, 
          dryRun: true, 
          wouldSendTo: recipients,
          subject: mailOptions.subject,
          from: mailOptions.from,
          messageId: 'dry-run-' + Date.now()
        };
      }
      
      console.log(`[EMAIL] Sending email to ${recipients.join(', ')} for ${houseName}...`);
      const result = await this.transporter.sendMail(mailOptions);
      
      // Update duplicate detection hash
      this.recentEmailHashes.set(emailHash, Date.now());
      
      // Update rate limiter
      recipients.forEach(recipient => {
        const recipientKey = recipient.toLowerCase();
        const sentTimes = this.emailRateLimiter.get(recipientKey) || [];
        sentTimes.push(Date.now());
        this.emailRateLimiter.set(recipientKey, sentTimes);
      });
      
      // Clean up old entries periodically
      this.cleanupOldEntries();

      // Archive email
      await this.archiveEmail({
        facility_id: scheduleData.facility_id || program.facility_id || 1,
        house_name: houseName,
        schedule_date: scheduleData.schedule_date,
        email_content: emailHTML,
        pdf_content: pdfBuffer,
        recipients
      });

      console.log(`[EMAIL] Successfully sent email for ${houseName}. Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId, archived: true };
    } catch (error) {
      console.error(`[EMAIL] Error sending email for ${houseName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkScheduleNotifications(scheduleData, programs, expectations, facilitySettings) {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const results = [];

    for (const program of programs) {
      if (program.program_coordinator_email && scheduleData.assignments[program.house_name]) {
        try {
          const result = await this.sendScheduleNotification(
            program,
            scheduleData,
            expectations,
            facilitySettings
          );
          results.push({
            program: program.house_name,
            ...result
          });

          // Add a small delay to avoid overwhelming the email server
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          results.push({
            program: program.house_name,
            success: false,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  async sendWeeklyDigest(facilityEmail, upcomingSchedules, facilitySettings) {
    if (!this.transporter || !facilityEmail) {
      console.warn('Email service not configured or no facility email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const digestHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Weekly Therapeutic Outing Digest</h2>
          <p>Here are the upcoming therapeutic outings for the next week:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Program</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Vendor</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${upcomingSchedules.map(schedule => {
                const date = new Date(schedule.schedule_date).toLocaleDateString();
                return Object.entries(schedule.assignments).map(([program, assignment]) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${program}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${assignment.vendor}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${assignment.time}</td>
                  </tr>
                `).join('');
              }).join('')}
            </tbody>
          </table>
          
          <p style="margin-top: 30px; color: #666;">
            This is an automated weekly digest. Please ensure all program coordinators have reviewed their schedules.
          </p>
        </div>
      `;

      const mailOptions = {
        from: facilitySettings.email || 'noreply@familyfirst.org',
        to: facilityEmail,
        subject: `Weekly Therapeutic Outing Digest - ${new Date().toLocaleDateString()}`,
        html: digestHTML
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getHouseColor(houseName) {
    // Extract the main house name (before any dash or descriptor)
    const mainName = houseName.split(' - ')[0].split(' ')[0];
    return this.colorScheme[mainName] || this.colorScheme[houseName] || '#667eea';
  }
  
  // Clean up old entries from rate limiter and duplicate tracker
  cleanupOldEntries() {
    const oneHourAgo = Date.now() - 3600000;
    
    // Clean duplicate hashes
    for (const [hash, timestamp] of this.recentEmailHashes.entries()) {
      if (timestamp < oneHourAgo) {
        this.recentEmailHashes.delete(hash);
      }
    }
    
    // Clean rate limiter
    for (const [recipient, times] of this.emailRateLimiter.entries()) {
      const recentTimes = times.filter(time => time > oneHourAgo);
      if (recentTimes.length === 0) {
        this.emailRateLimiter.delete(recipient);
      } else {
        this.emailRateLimiter.set(recipient, recentTimes);
      }
    }
  }
  
  // Get email sending status for monitoring
  getEmailStatus() {
    const status = {
      isConfigured: !!this.transporter,
      recentEmailsSent: this.recentEmailHashes.size,
      rateLimitedRecipients: [],
      automatedJobs: {
        daily: this.reminderJobs.has('daily') ? 'active' : 'inactive',
        weekly: this.reminderJobs.has('weekly') ? 'active' : 'inactive',
        confirmation: this.reminderJobs.has('confirmation') ? 'active' : 'inactive'
      }
    };
    
    // Check for rate-limited recipients
    for (const [recipient, times] of this.emailRateLimiter.entries()) {
      const recentSends = times.filter(time => Date.now() - time < 3600000);
      if (recentSends.length >= 8) { // Warning at 8+ emails
        status.rateLimitedRecipients.push({
          email: recipient,
          recentSends: recentSends.length,
          nextAvailable: new Date(Math.min(...recentSends) + 3600000)
        });
      }
    }
    
    return status;
  }

  async generateColorCodedEmailHTML(houseName, assignment, expectations, facilitySettings, scheduleData, houseColor, includeColorCoding) {
    const scheduleDate = new Date(scheduleData.schedule_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const colorStyle = includeColorCoding ? `
      <style>
        .house-header { 
          background: linear-gradient(135deg, ${houseColor} 0%, ${this.adjustColor(houseColor, -20)} 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .house-accent { border-left: 4px solid ${houseColor}; }
        .house-button { 
          background: ${houseColor}; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 6px; 
          text-decoration: none; 
          display: inline-block;
        }
        .schedule-card { 
          border: 2px solid ${houseColor}; 
          border-radius: 12px; 
          margin: 20px 0; 
          overflow: hidden;
        }
      </style>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Therapeutic Outing Schedule - ${houseName}</title>
        ${colorStyle}
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
          .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .content { padding: 30px; }
          .schedule-info { background: #f8f9fb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .vendor-info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .expectations { background: #fff3e0; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .highlight { background: yellow; padding: 2px 4px; border-radius: 3px; }
          .important { color: #e74c3c; font-weight: bold; }
          .contact-info { background: #ecf0f1; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- PROMINENT RED HOUSE NOTIFICATION BANNER -->
          <div style="background: #dc2626; color: white; padding: 12px 0; text-align: center; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); border-top: 4px solid #991b1b; border-bottom: 4px solid #991b1b;">
            <div style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
              ⚠️ YOU ARE SCHEDULED FOR: ${houseName} ⚠️
            </div>
            <div style="font-size: 14px; margin-top: 4px; font-weight: 500; opacity: 0.95;">
              Verify this matches your assignment before proceeding
            </div>
          </div>
          
          <div class="house-header">
            <h1 style="margin: 0; font-size: 28px;">🏡 ${houseName}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Therapeutic Outing Schedule</p>
          </div>
          
          <div class="content">
            <div class="schedule-card">
              <div style="padding: 20px;">
                <h2 style="color: ${houseColor}; margin-top: 0;">📅 ${scheduleDate}</h2>
                
                <div class="schedule-info house-accent" style="padding-left: 20px;">
                  <h3>🎯 Today's Outing</h3>
                  <p><strong>Vendor:</strong> ${assignment.vendor}</p>
                  <p><strong>Activity:</strong> ${assignment.activity || 'Therapeutic Activity'}</p>
                  <p><strong>Time:</strong> ${assignment.time}</p>
                  <p><strong>Location:</strong> ${assignment.location || 'See vendor details'}</p>
                </div>

                ${assignment.special_instructions ? `
                  <div class="important">
                    ⚠️ <strong>Special Instructions:</strong> ${assignment.special_instructions}
                  </div>
                ` : ''}

                <div class="vendor-info">
                  <h4>📞 Vendor Contact Information</h4>
                  <p><strong>Contact:</strong> ${assignment.vendor_contact || 'Contact information on file'}</p>
                  <p><strong>Phone:</strong> ${assignment.vendor_phone || 'See contact list'}</p>
                </div>

                ${expectations && expectations.length > 0 ? `
                  <div class="expectations">
                    <h4>📋 Program Expectations</h4>
                    <ul>
                      ${expectations.map(exp => `<li>${exp}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                <div class="contact-info">
                  <h4>🆘 Emergency Contacts</h4>
                  <p><strong>Facility:</strong> ${facilitySettings.phone || '(555) 123-4567'}</p>
                  <p><strong>On-Call Manager:</strong> ${facilitySettings.emergency_contact || '(555) 123-4567'}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${facilitySettings.portal_url || '#'}" class="house-button">
                    📱 Access Mobile Portal
                  </a>
                </div>

                <div style="background: #f1f3f4; padding: 15px; border-radius: 6px; margin-top: 20px;">
                  <p style="margin: 0; font-size: 14px; color: #666;">
                    <strong>Reminder:</strong> Please confirm receipt of this schedule and report any issues immediately.
                    All incidents should be documented using the mobile incident reporting system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">Family First Therapeutic Outings</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  adjustColor(color, percent) {
    // Utility function to lighten/darken colors
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  async archiveEmail(emailData) {
    try {
      // Create archive directory if it doesn't exist
      const archiveDir = path.join(__dirname, '../../archives/emails');
      await fs.mkdir(archiveDir, { recursive: true });

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${emailData.house_name}-${emailData.schedule_date}-${timestamp}`;

      // Save email HTML
      await fs.writeFile(
        path.join(archiveDir, `${filename}.html`),
        emailData.email_content
      );

      // Save PDF
      if (emailData.pdf_content) {
        await fs.writeFile(
          path.join(archiveDir, `${filename}.pdf`),
          emailData.pdf_content
        );
      }

      // Save metadata to database
      await db.query(
        `INSERT INTO email_archives (
           facility_id, house_name, schedule_date, recipients, html_path, pdf_path, email_type
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          emailData.facility_id || 1,
          emailData.house_name,
          emailData.schedule_date,
          JSON.stringify(emailData.recipients),
          `${filename}.html`,
          emailData.pdf_content ? `${filename}.pdf` : null,
          'schedule_notification'
        ]
      );

      console.log(`Email archived: ${filename}`);
      return { success: true, archive_id: filename };
    } catch (error) {
      console.error('Error archiving email:', error);
      return { success: false, error: error.message };
    }
  }

  // Automated reminder system
  setupAutomatedReminders(facilitySettings) {
    // Clear existing jobs
    this.reminderJobs.forEach(job => job.destroy());
    this.reminderJobs.clear();

    // Daily schedule reminder (7 AM)
    const dailyJob = cron.schedule('0 7 * * *', async () => {
      await this.sendDailyReminders();
    }, { scheduled: false });

    // Weekly digest (Monday 8 AM)
    const weeklyJob = cron.schedule('0 8 * * 1', async () => {
      await this.sendWeeklyDigest(facilitySettings.admin_email, null, facilitySettings);
    }, { scheduled: false });

    // Vendor confirmation reminder (day before, 3 PM)
    const confirmationJob = cron.schedule('0 15 * * *', async () => {
      await this.sendVendorConfirmationReminders();
    }, { scheduled: false });

    this.reminderJobs.set('daily', dailyJob);
    this.reminderJobs.set('weekly', weeklyJob);
    this.reminderJobs.set('confirmation', confirmationJob);

    // Start all jobs
    this.reminderJobs.forEach(job => job.start());
    console.log('Automated reminder jobs scheduled');
  }

  async sendDailyReminders() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's schedules
      const schedules = await db.query(
        `SELECT * FROM schedules WHERE schedule_date = $1`,
        [today]
      );

      for (const schedule of schedules.rows) {
        const assignments = schedule.assignments || {};
        for (const [houseName, assignment] of Object.entries(assignments)) {
          await this.sendScheduleReminder({
            facility_id: schedule.facility_id,
            house_name: houseName,
            time: assignment.time
          });
        }
      }
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  }

  // Placeholder: implement vendor confirmation reminders if needed
  async sendVendorConfirmationReminders() {
    // For now, just log. Later, lookup tomorrow's schedules and email vendors.
    console.log('Vendor confirmation reminder job ran (stub).');
  }

  async sendScheduleReminder(schedule) {
    const houseColor = this.getHouseColor(schedule.house_name);
    const reminderHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 3px solid ${houseColor}; border-radius: 12px; overflow: hidden;">
        <div style="background: ${houseColor}; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">⏰ Schedule Reminder</h2>
          <p style="margin: 5px 0 0 0;">${schedule.house_name}</p>
        </div>
        <div style="padding: 20px;">
          <p><strong>Today's outing is scheduled!</strong></p>
          <p>Time: ${schedule.time || 'See original schedule'}</p>
          <p>Don't forget to:</p>
          <ul>
            <li>Prepare clients 30 minutes before departure</li>
            <li>Confirm transportation arrangements</li>
            <li>Have emergency contacts ready</li>
            <li>Bring incident reporting QR codes</li>
          </ul>
        </div>
      </div>
    `;

    // Build recipients from programs table matching the assigned program
    const program = await db.query(
      'SELECT * FROM programs WHERE house_name = $1 AND facility_id = $2',
      [schedule.house_name || '', schedule.facility_id || 1]
    );
    const recipients = [];
    if (program.rows.length) {
      const p = program.rows[0];
      if (p.program_coordinator_email) recipients.push(p.program_coordinator_email);
      if (p.additional_emails) recipients.push(...p.additional_emails.split(',').map(e => e.trim()));
    }

    if (!this.transporter || !recipients.length) return;

    const mailOptions = {
      from: 'noreply@familyfirst.org',
      to: recipients.join(', '),
      subject: `🔔 Reminder: Today's Outing - ${schedule.house_name}`,
      html: reminderHTML
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`Reminder sent to ${schedule.house_name}`);
  }

  async getEmailArchives(filters = {}) {
    try {
      let query = 'SELECT ea.* FROM email_archives ea WHERE 1=1';
      const params = [];
      let idx = 1;
      if (filters.house_name) {
        query += ` AND ea.house_name = $${idx++}`;
        params.push(filters.house_name);
      }
      if (filters.date_from) {
        query += ` AND ea.schedule_date >= $${idx++}`;
        params.push(filters.date_from);
      }
      if (filters.date_to) {
        query += ` AND ea.schedule_date <= $${idx++}`;
        params.push(filters.date_to);
      }
      query += ' ORDER BY ea.created_at DESC';
      if (filters.limit) {
        query += ` LIMIT $${idx++}`;
        params.push(filters.limit);
      }
      const archives = await db.query(query, params);
      return { success: true, archives: archives.rows };
    } catch (error) {
      console.error('Error fetching email archives:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
