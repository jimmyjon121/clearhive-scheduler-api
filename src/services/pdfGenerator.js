const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const QRCode = require('qrcode');

// Handlebars helper for formatting time
handlebars.registerHelper('formatTime', function(time) {
  if (!time) return '';
  // Convert 24h to 12h format
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
});

// HTML template for the schedule PDF
const scheduleTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f5f5f5;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    .schedule-date {
      font-size: 18px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .schedule-container {
      background-color: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      background-color: #2c3e50;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: bold;
    }
    
    td {
      padding: 15px;
      border-bottom: 1px solid #ecf0f1;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    .program-row {
      transition: all 0.2s;
    }
    
    .program-name {
      font-weight: bold;
      font-size: 16px;
    }
    
    .vendor-info {
      margin-top: 5px;
    }
    
    .vendor-name {
      font-weight: bold;
      color: #2c3e50;
    }
    
    .vendor-contact {
      display: flex;
      gap: 15px;
      margin-top: 5px;
      font-size: 14px;
      color: #666;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .address {
      color: #3498db;
      text-decoration: none;
      cursor: pointer;
    }
    
    .address:hover {
      text-decoration: underline;
    }
    
    .time-slot {
      white-space: nowrap;
      font-weight: 500;
    }
    
    .arrival-time {
      font-weight: bold;
      color: #e74c3c;
    }
    
    .expectations {
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .expectations h2 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    
    .expectations-content {
      line-height: 1.6;
      color: #333;
    }
    
    .expectations-content p {
      margin-bottom: 10px;
    }
    
    .qr-section {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .qr-code {
      margin: 10px auto;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
    
    @media print {
      body {
        background-color: white;
      }
      .program-row {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{facilityName}} - Therapeutic Outing Schedule</h1>
    <div class="schedule-date">Tuesday, {{scheduleDate}}</div>
    <div class="schedule-date">Schedule generated on {{generatedDate}}</div>
  </div>

  <div class="schedule-container">
    <table>
      <thead>
        <tr>
          <th>Program</th>
          <th>Outing Details</th>
          <th>Time</th>
          <th>Arrival</th>
        </tr>
      </thead>
      <tbody>
        {{#each assignments}}
        <tr class="program-row" style="background-color: {{this.program_color}}20;">
          <td style="border-left: 5px solid {{this.program_color}};">
            <div class="program-name">{{@key}}</div>
          </td>
          <td style="background-color: {{this.color}}10;">
            <div class="vendor-info">
              <div class="vendor-name">{{this.vendor}}</div>
              <div class="vendor-contact">
                {{#if this.contact}}
                <div class="contact-item">
                  <span>📞</span> 
                  <a href="tel:{{this.phone}}" style="color: inherit;">{{this.phone}}</a> 
                  ({{this.contact}})
                </div>
                {{/if}}
                {{#if this.email}}
                <div class="contact-item">
                  <span>✉️</span> {{this.email}}
                </div>
                {{/if}}
              </div>
              {{#if this.address}}
              <div class="vendor-contact">
                <div class="contact-item">
                  <span>📍</span>
                  <a href="{{this.maps_link}}" class="address">{{this.address}}</a>
                </div>
              </div>
              {{/if}}
            </div>
          </td>
          <td class="time-slot">{{this.time}}</td>
          <td class="arrival-time">{{formatTime this.arrival_time}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  {{#each expectations}}
  <div class="expectations">
    <h2>{{this.title}}</h2>
    <div class="expectations-content">
      {{{this.content}}}
    </div>
  </div>
  {{/each}}

  {{#if qrCodeUrl}}
  <div class="qr-section">
    <h3>Incident Report Form</h3>
    <p>Scan to submit an incident report</p>
    <img src="{{qrCodeUrl}}" alt="QR Code" class="qr-code" width="150" height="150">
  </div>
  {{/if}}

  <div class="footer">
    <p>Please review this schedule carefully. Contact your Program Coordinator with any questions.</p>
    <p>Remember to check weather conditions and dress appropriately for outdoor activities.</p>
  </div>
</body>
</html>
`;

class PDFGenerator {
  constructor() {
    this.template = handlebars.compile(scheduleTemplate);
  }

  async generateSchedulePDF(scheduleData, facilitySettings = {}) {
    try {
      // Generate QR code if incident form ID is provided
      let qrCodeUrl = null;
      if (facilitySettings.incident_form_id) {
        const incidentFormUrl = `https://forms.google.com/d/${facilitySettings.incident_form_id}/viewform`;
        qrCodeUrl = await QRCode.toDataURL(incidentFormUrl);
      }

      // Format the date nicely
      const scheduleDate = new Date(scheduleData.schedule_date);
      const formattedDate = scheduleDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      // Prepare template data
      const templateData = {
        facilityName: facilitySettings.name || 'Family First Program',
        scheduleDate: formattedDate,
        generatedDate: new Date().toLocaleDateString('en-US'),
        assignments: scheduleData.assignments,
        expectations: scheduleData.expectations || [],
        qrCodeUrl
      };

      // Generate HTML
      const html = this.template(templateData);

      // Launch puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async generateEmailHTML(programName, assignment, expectations, facilitySettings = {}) {
    const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Good evening, {{programName}} Team!</h2>
      
      <p>Tuesday's therapeutic outing will be <strong>{{vendor}}</strong>. Below are the details:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>📍 Address:</strong> {{address}}</p>
        <p><strong>⏰ Arrival Time:</strong> {{arrivalTime}}</p>
        {{#if contact}}
        <p><strong>📞 Contact:</strong> {{contact}} - {{phone}}</p>
        {{/if}}
      </div>
      
      <h3 style="color: #e74c3c;">Important Reminders:</h3>
      {{{expectations}}}
      
      <p style="margin-top: 30px;">Best regards,<br>{{facilityName}} Team</p>
    </div>
    `;

    const template = handlebars.compile(emailTemplate);
    
    return template({
      programName,
      vendor: assignment.vendor,
      address: assignment.address,
      arrivalTime: handlebars.helpers.formatTime(assignment.arrival_time),
      contact: assignment.contact,
      phone: assignment.phone,
      expectations: expectations?.[0]?.content || '',
      facilityName: facilitySettings.name || 'Family First Program'
    });
  }
}

module.exports = new PDFGenerator();
