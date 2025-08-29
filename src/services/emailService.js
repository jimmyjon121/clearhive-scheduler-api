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
  }

  initialize(config) {
    if (!config) {
      console.warn('Email configuration not provided. Email service disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      secure: config.secure || false,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  }

  async sendScheduleNotification(programData, scheduleData, expectations, facilitySettings, includeColorCoding = true) {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { house_name, program_coordinator_email, additional_emails } = programData;
      const assignment = scheduleData.assignments[house_name];

      if (!assignment || !program_coordinator_email) {
        throw new Error('Missing required data for email notification');
      }

      // Get house color
      const houseColor = this.getHouseColor(house_name);

      // Generate color-coded email HTML
      const emailHTML = await this.generateColorCodedEmailHTML(
        house_name,
        assignment,
        expectations,
        facilitySettings,
        scheduleData,
        houseColor,
        includeColorCoding
      );

      // Generate color-coded PDF attachment
      const pdfBuffer = await pdfGenerator.generateColorCodedSchedulePDF(
        scheduleData,
        facilitySettings,
        this.colorScheme
      );

      // Archive the email content
      await this.archiveEmail({
        house_name,
        schedule_date: scheduleData.schedule_date,
        email_content: emailHTML,
        pdf_content: pdfBuffer,
        recipients: [program_coordinator_email, ...(additional_emails || [])]
      });

      const recipients = [program_coordinator_email];
      if (additional_emails) {
        recipients.push(...additional_emails.split(',').map(email => email.trim()));
      }

      const mailOptions = {
        from: facilitySettings.email || 'noreply@familyfirst.org',
        to: recipients.join(', '),
        subject: `Therapeutic Outing Schedule - ${house_name} - ${new Date(scheduleData.schedule_date).toLocaleDateString()}`,
        html: emailHTML,
        attachments: [
          {
            filename: `outing-schedule-${house_name}-${scheduleData.schedule_date}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        archived: true
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
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
      await db.query(`
        INSERT INTO email_archives (
          house_name, schedule_date, recipients, html_path, pdf_path, 
          created_at, email_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        emailData.house_name,
        emailData.schedule_date,
        JSON.stringify(emailData.recipients),
        `${filename}.html`,
        emailData.pdf_content ? `${filename}.pdf` : null,
        new Date().toISOString(),
        'schedule_notification'
      ]);

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
      const schedules = await db.query(`
        SELECT s.*, p.house_name, p.program_coordinator_email, p.additional_emails
        FROM schedules s
        JOIN programs p ON s.program_id = p.id
        WHERE DATE(s.schedule_date) = ?
      `, [today]);

      for (const schedule of schedules) {
        // Send reminder email
        await this.sendScheduleReminder(schedule);
      }
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
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

    const recipients = [schedule.program_coordinator_email];
    if (schedule.additional_emails) {
      recipients.push(...schedule.additional_emails.split(',').map(email => email.trim()));
    }

    const mailOptions = {
      from: 'noreply@familyfirst.org',
      to: recipients.join(', '),
      subject: `🔔 Reminder: Today's Outing - ${schedule.house_name}`,
      html: reminderHTML
    };

    if (this.transporter) {
      await this.transporter.sendMail(mailOptions);
      console.log(`Reminder sent to ${schedule.house_name}`);
    }
  }

  async getEmailArchives(filters = {}) {
    try {
      let query = `
        SELECT ea.*, COUNT(ea.id) as total_emails
        FROM email_archives ea
        WHERE 1=1
      `;
      const params = [];

      if (filters.house_name) {
        query += ' AND ea.house_name = ?';
        params.push(filters.house_name);
      }

      if (filters.date_from) {
        query += ' AND DATE(ea.schedule_date) >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ' AND DATE(ea.schedule_date) <= ?';
        params.push(filters.date_to);
      }

      query += ' GROUP BY ea.house_name, ea.schedule_date ORDER BY ea.created_at DESC';

      if (filters.limit) {
        query += ` LIMIT ${filters.limit}`;
      }

      const archives = await db.query(query, params);
      return { success: true, archives };
    } catch (error) {
      console.error('Error fetching email archives:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
