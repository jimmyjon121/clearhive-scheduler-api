const nodemailer = require('nodemailer');
const pdfGenerator = require('./pdfGenerator');

class EmailService {
  constructor() {
    this.transporter = null;
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

  async sendScheduleNotification(programData, scheduleData, expectations, facilitySettings) {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { house_name, program_coordinator_email } = programData;
      const assignment = scheduleData.assignments[house_name];

      if (!assignment || !program_coordinator_email) {
        throw new Error('Missing required data for email notification');
      }

      // Generate email HTML
      const emailHTML = await pdfGenerator.generateEmailHTML(
        house_name,
        assignment,
        expectations,
        facilitySettings
      );

      // Generate PDF attachment
      const pdfBuffer = await pdfGenerator.generateSchedulePDF(
        scheduleData,
        facilitySettings
      );

      const mailOptions = {
        from: facilitySettings.email || 'noreply@familyfirst.org',
        to: program_coordinator_email,
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
        messageId: result.messageId
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
}

module.exports = new EmailService();
