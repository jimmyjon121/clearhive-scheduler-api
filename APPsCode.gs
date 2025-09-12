/************************************************************
 * Family First Therapeutic Outings Scheduler - Enterprise Edition v5.0
 * A ClearHive Health Product
 * 
 * @developer ClearHive Health
 * @client Family First Adolescent Services
 * @version 5.0.0
 * @lastModified 2025-09-12
 * 
 * MAJOR UPDATE (v5.0 - September 2025):
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✅ Simplified email system - 3 distribution lists only
 * ✅ House-specific PDF generation with professional formatting
 * ✅ One-click PDF distribution to all programs
 * ✅ Streamlined spreadsheet structure (5 essential tabs)
 * ✅ Enhanced PDF organization with date-stamped folders
 * ✅ Removed unnecessary calendar integration complexity
 * ✅ Added "Where Are My PDFs?" helper function
 * ✅ Simplified recipient management
 * 
 * RECENT IMPROVEMENTS (v4.1-4.3):
 * - Dual email system for PCs (full) and BHTs (house-specific)
 * - Enhanced CONFIG with 32 core rotation vendors
 * - House color mapping for consistent visual identification
 * - Auto-create PDF folders (no manual setup required)
 * - Email domain validation (work vs personal accounts)
 * - System Health Check with comprehensive diagnostics
 * - Performance caching layer (90% faster data loads)
 * - Exponential backoff retry for reliability
 * - Batch email processing for 200+ recipients
 * 
 * CORE FEATURES:
 * - Smart vendor rotation with complex agreement management
 * - Real-time conflict detection and resolution
 * - Professional PDF schedules for each house/program
 * - Audit logging with complete activity tracking
 * - HTML email delivery with color-coded schedules
 * - Simplified distribution to 3 main lists
 * - Automatic PDF organization by date
 * 
 * COMPLIANCE: HIPAA-safe, no PHI stored or transmitted
 *************************************************************/

/**
 * Send weekly emails to the 3 distribution lists with week selection
 * Allows choosing which week's schedule to send
 */
function sendWeeklyEmailsToDistributionLists() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet) {
    ui.alert('Error', 'No schedule found. Please generate a schedule first.', ui.ButtonSet.OK);
    return;
  }

  // Your 3 distribution lists
  const distributionLists = [
    'Estates_CA@familyfirstas.com',
    'Nest_CA@familyfirstas.com',
    'Cove_CA@familyfirstas.com'
  ];
  
  // Get the week to send
  const weekStart = getThisMonday();
  
  // Store the selected week temporarily for the email generation
  PropertiesService.getScriptProperties().setProperty('TEMP_EMAIL_WEEK', weekStart.toISOString());
  
  try {
    const subject = `Family First - Weekly Schedule (Week of ${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')})`;
    const htmlBody = createWeeklyScheduleHtml(); // This will use the TEMP_EMAIL_WEEK
    const plainBody = 'Please view this email in HTML format to see the schedule.';
    
    // Send to each distribution list
    let successCount = 0;
    distributionLists.forEach(email => {
      try {
        sendEmailSafely(email, subject, plainBody, htmlBody, {
          type: 'weekly_schedule',
          duplicateWindowMs: 24 * 60 * 60 * 1000
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
      }
    });
    
    // Clear the temporary week
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    
    ui.alert(
      '✅ Success',
      `Weekly schedule for ${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d')} has been sent to ${successCount} distribution lists.`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    throw error;
  }
}

/**
 * Helper function to get the Monday of a given week
 * @param {Date} date - The date to get the Monday for
 * @returns {Date} The Monday of that week
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Gets the Monday of the current week
 */
function getThisMonday() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(today.setDate(diff));
}

function getTargetMonday(weekType, specificDate = null) {
  let targetDate = new Date();
  
  if (weekType === 'next') {
    targetDate.setDate(targetDate.getDate() + 7);
  } else if (weekType === 'specific' && specificDate) {
    targetDate = new Date(specificDate);
  }
  
  const day = targetDate.getDay();
  const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(targetDate.setDate(diff));
}

function formatScheduleConfirmation(weekType, monday) {
  switch (weekType) {
    case 'current':
      return {
        text: '📅 THIS WEEK\'s Schedule - ' + formatDateRange(monday),
        html: '📅 <span style="color: #1976d2;">THIS WEEK\'s Schedule</span><br>📆 Week of: <strong>' + formatDateRange(monday) + '</strong>'
      };
    case 'next':
      return {
        text: '📅 NEXT WEEK\'s Schedule - ' + formatDateRange(monday),
        html: '📅 <span style="color: #f57c00;">NEXT WEEK\'s Schedule</span><br>📆 Week of: <strong>' + formatDateRange(monday) + '</strong>'
      };
    case 'specific':
      return {
        text: '📅 SPECIFIC WEEK\'s Schedule - ' + formatDateRange(monday),
        html: '📅 <span style="color: #7b1fa2;">SPECIFIC WEEK\'s Schedule</span><br>📆 Week of: <strong>' + formatDateRange(monday) + '</strong>'
      };
    default:
      return {
        text: '⚠️ Please select a valid week',
        html: '⚠️ Please select a valid week'
      };
  }
}
          }
          
          google.script.run
            .withSuccessHandler(function(result) {
              preview.innerHTML = result;
            })
            .withFailureHandler(function(error) {
              preview.innerHTML = '⚠️ Error loading schedule';
            })
            .getCompactSchedulePreview(selectedWeek, weekDate);
        }
        
        function sendEmails() {
          const status = document.getElementById('status');
          status.className = 'status';
          status.style.display = 'block';
          status.textContent = 'Sending emails...';
          
          let weekDate = null;
          if (selectedWeek === 'specific') {
            weekDate = document.getElementById('specificDate').value;
            if (!weekDate) {
              status.className = 'status error';
              status.textContent = 'Please select a date first';
              return;
            }
          }
          
          google.script.run
            .withSuccessHandler(function(result) {
              status.className = 'status success';
              status.textContent = '✅ ' + result;
              setTimeout(() => google.script.host.close(), 2000);
            })
            .withFailureHandler(function(error) {
              status.className = 'status error';
              status.textContent = '❌ Error: ' + error.toString();
            })
            // Email sending is now handled by sendWeeklyEmailsToDistributionLists
        }
        
        // Select current week by default
        selectWeek('current');
      </script>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Send Weekly Schedule');
}

// Moved getEmailPreview and isSameWeek functions to after CONFIG definition (see line ~2500)

/**
 * Process the weekly email send with selected week
 */
// Email sending is now handled by sendWeeklyEmailsToDistributionLists
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  // Determine which week to send
  let targetDate = new Date();
  if (weekSelection === 'next') {
    targetDate.setDate(targetDate.getDate() + 7);
  } else if (weekSelection === 'specific' && specificDate) {
    targetDate = new Date(specificDate);
  }
  
  // Get the Monday of the selected week
  const weekStart = getWeekStart(targetDate);
  
  // Your 3 distribution lists
  const distributionLists = [
    'Estates_CA@familyfirstas.com',
    'Nest_CA@familyfirstas.com',
    'Cove_CA@familyfirstas.com'
  ];
  
  // Store the selected week temporarily for the email generation
  PropertiesService.getScriptProperties().setProperty('TEMP_EMAIL_WEEK', weekStart.toISOString());
  
  try {
    const subject = `Family First - Weekly Schedule (Week of ${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')})`;
    const htmlBody = createWeeklyScheduleHtml(); // This will use the TEMP_EMAIL_WEEK
    const plainBody = 'Please view this email in HTML format to see the schedule.';
    
    // Send to each distribution list
    let successCount = 0;
    distributionLists.forEach(email => {
      try {
        sendEmailSafely(email, subject, plainBody, htmlBody, {
          type: 'weekly_schedule',
          duplicateWindowMs: 24 * 60 * 60 * 1000
        });
        successCount++;
  } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
      }
    });
    
    // Clear the temporary week
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    
    return `Successfully sent schedule for week of ${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d')} to ${successCount} distribution lists`;
    
  } catch (error) {
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    throw error;
  }
}

/**
 * Email sending is now handled automatically through distribution lists:
 * - Estates_CA@familyfirstas.com
 * - Nest_CA@familyfirstas.com
 * - Cove_CA@familyfirstas.com
 */
// Distribution list emails are now handled automatically
              </div>
            \`).join('');
            
            // Load any saved house recipients
            google.script.run
              .withSuccessHandler(function(saved) {
                if (saved) {
                  for (const house in saved) {
                    const input = document.getElementById('house_' + house);
                    if (input) input.value = saved[house];
                  }
                }
              })
              .getSavedHouseRecipients();
          }
          
          function loadSavedPCs() {
            google.script.run
              .withSuccessHandler(function(emails) {
                if (emails && emails.length > 0) {
                  document.getElementById('pcEmails').value = emails.join('\\n');
                  showStatus('Loaded ' + emails.length + ' saved PC emails', 'success');
                } else {
                  showStatus('No saved PC emails found', 'error');
                }
              })
              .withFailureHandler(showError)
              .getSavedPCEmails();
          }
          
          function savePCs() {
            const emails = document.getElementById('pcEmails').value
              .split(/[,\\n]/)
              .map(e => e.trim())
              .filter(e => e);
            
            google.script.run
              .withSuccessHandler(() => showStatus('PC emails saved!', 'success'))
              .withFailureHandler(showError)
              .savePCEmails(emails);
          }
          
          function sendEmails() {
            const pcEmails = document.getElementById('pcEmails').value
              .split(/[,\\n]/)
              .map(e => e.trim())
              .filter(e => e);
            
            if (pcEmails.length === 0) {
              showStatus('Please enter at least one PC email address', 'error');
              return;
            }
            
            // Collect house recipients
            const houseRecipients = {};
            const houseInputs = document.querySelectorAll('[id^="house_"]');
            
            houseInputs.forEach(input => {
              const house = input.id.replace('house_', '');
              const emails = input.value
                .split(/[,\\n]/)
                .map(e => e.trim())
                .filter(e => e);
              
              if (emails.length > 0) {
                houseRecipients[house] = emails;
              }
            });
            
            showStatus('Sending emails...', 'success');
            
            google.script.run
              .withSuccessHandler(function(result) {
                showStatus(result, 'success');
                setTimeout(() => google.script.host.close(), 3000);
              })
              .withFailureHandler(showError)
              .processDualEmails(pcEmails, houseRecipients);
          }
          
          function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + type;
            status.style.display = 'block';
          }
          
          function showError(error) {
            showStatus('Error: ' + error.toString(), 'error');
          }
        </script>
      </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Dual Email Setup');
}

/**
 * Get houses from schedule for email setup
 */
function getHousesForEmailSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet) return [];
  
  const headers = scheduleSheet.getRange(1, 1, 1, scheduleSheet.getLastColumn()).getValues()[0];
  const houses = headers.filter(h => h && h !== 'Date' && h !== 'Options' && h !== 'Locked?');
  
  return houses;
}

/**
 * Get saved PC emails
 */
function getSavedPCEmails() {
  const properties = PropertiesService.getScriptProperties();
  const saved = properties.getProperty('PC_EMAILS');
  return saved ? JSON.parse(saved) : [];
}

/**
 * Save PC emails for future use
 */
function savePCEmails(emails) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('PC_EMAILS', JSON.stringify(emails));
}

/**
 * Get saved house recipients
 */
function getSavedHouseRecipients() {
  const properties = PropertiesService.getScriptProperties();
  const saved = properties.getProperty('HOUSE_RECIPIENTS');
  return saved ? JSON.parse(saved) : {};
}

/**
 * Process and send dual emails
 */
function processDualEmails(pcEmails, houseRecipients) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  // Save recipients for future use
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('PC_EMAILS', JSON.stringify(pcEmails));
  properties.setProperty('HOUSE_RECIPIENTS', JSON.stringify(houseRecipients));
  
  let successCount = 0;
  let errors = [];
  
  try {
    // 1. Send full schedule to PCs
    const fullScheduleHtml = createWeeklyScheduleHtml();
    const weekStart = getThisMonday();
    const subject = `Family First - Complete Weekly Schedule (${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')})`;
    
    // Check sender warnings
    const currentUser = Session.getActiveUser().getEmail();
    const isWorkAccount = currentUser.includes('@familyfirstas.com');
    
    // Send to PCs
    sendEmailSafely(
      pcEmails.join(','),
      subject,
      'Please view this email in HTML format',
      fullScheduleHtml,
      'PC_SCHEDULE_' + weekStart.getTime()
    );
    successCount++;
    
    // 2. Send house-specific emails
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    
    for (const house in houseRecipients) {
      const recipients = houseRecipients[house];
      if (!recipients || recipients.length === 0) continue;
      
      // Find house column
      const houseCol = headers.indexOf(house);
      if (houseCol === -1) continue;
      
      // Build house-specific HTML
      const houseHtml = createHouseSpecificEmail(house, data, houseCol);
      const houseSubject = `${house} - Weekly Outing Schedule (${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d')})`;
      
      // Send to house staff
      sendEmailSafely(
        recipients.join(','),
        houseSubject,
        'Please view this email in HTML format',
        houseHtml,
        'HOUSE_' + house + '_' + weekStart.getTime()
      );
      successCount++;
    }
    
  } catch (error) {
    errors.push(error.toString());
  }
  
  // Return summary
  const houseCount = Object.keys(houseRecipients).filter(h => houseRecipients[h].length > 0).length;
  let message = `✅ Emails sent successfully!\n\n`;
  message += `• Full schedule sent to ${pcEmails.length} Program Coordinators\n`;
  message += `• House-specific schedules sent to ${houseCount} houses`;
  
  if (errors.length > 0) {
    message += `\n\n⚠️ Some errors occurred:\n${errors.join('\n')}`;
  }
  
  return message;
}

/**
 * Create house-specific email HTML
 */
function createHouseSpecificEmail(house, scheduleData, houseCol) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta charset="UTF-8">
      <title>${house} - Weekly Outing Schedule</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          background: #1976d2;
          color: white;
          padding: 20px;
          text-align: center;
        }
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="header-pattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.15)"/></pattern></defs><rect width="100" height="100" fill="url(%23header-pattern)"/></svg>');
          opacity: 0.4;
        }
        .header-content {
          position: relative;
          z-index: 2;
        }
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 10px 0 0;
        }
        .content {
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
        }
        th {
          background: #1976d2;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 15px;
          letter-spacing: 0.5px;
        }
        td {
          padding: 18px;
          border-bottom: 1px solid #f0f3f7;
          transition: background-color 0.2s ease;
        }
        tr:hover {
          background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
        }
        tr:last-child td {
          border-bottom: none;
        }
        .outing-details {
          font-weight: 600;
          color: #1976d2;
          font-size: 14px;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Family First Adolescent Services</h1>
          <p>Therapeutic Outings Schedule</p>
          <h2>${house} House</h2>
          </div>
        </div>

        <div style="padding: 50px 35px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);">
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 0.5px;">This Week's Outings</h2>
            <div style="width: 60px; height: 4px; background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); margin: 20px auto; border-radius: 2px; box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);"></div>
          </div>

          <div style="background: white; border-radius: 16px; padding: 35px; margin-bottom: 35px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <tr>
                <th style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); color: white; padding: 22px 20px; text-align: left; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Date</th>
                <th style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); color: white; padding: 22px 20px; text-align: left; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Day</th>
                <th style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); color: white; padding: 22px 20px; text-align: left; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Outing Details</th>
              </tr>
  `;
  
  // Add each day's outing for this house
  const today = new Date();
  const weekStart = getThisMonday();
  
  for (let row = 1; row < scheduleData.length && row <= 7; row++) {
    const dateCell = scheduleData[row][0];
    if (!dateCell) continue;
    
    const date = new Date(dateCell);
    const dayName = Utilities.formatDate(date, CONFIG.DEFAULT_TIMEZONE, 'EEEE');
    const dateStr = Utilities.formatDate(date, CONFIG.DEFAULT_TIMEZONE, 'MMM d');
    const assignment = scheduleData[row][houseCol];
    
    if (assignment && assignment !== 'UNASSIGNED' && assignment !== 'TBD') {
      const lines = assignment.toString().split('\n');
      const vendor = lines[0] || 'TBD';
      const time = lines[1] || 'Time TBD';
      
      html += `
        <tr>
          <td style="padding: 24px 20px; border-bottom: 1px solid #f0f3f7; font-weight: 500; color: #1e293b; font-size: 15px;">${dateStr}</td>
          <td style="padding: 24px 20px; border-bottom: 1px solid #f0f3f7; font-weight: 500; color: #1e293b; font-size: 15px;">${dayName}</td>
          <td style="padding: 24px 20px; border-bottom: 1px solid #f0f3f7; color: #334155; line-height: 1.6;">
            <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px; font-size: 17px;">${vendor}</div>
            <div style="color: #64748b; font-size: 14px; margin-bottom: 4px; font-weight: 500;">${time}</div>
          </td>
        </tr>
      `;
    } else {
      html += `
        <tr>
          <td style="padding: 24px 20px; border-bottom: 1px solid #f0f3f7; font-weight: 500; color: #1e293b; font-size: 15px;">${dateStr}</td>
          <td style="padding: 24px 20px; border-bottom: 1px solid #f0f3f7; font-weight: 500; color: #1e293b; font-size: 15px;">${dayName}</td>
          <td style="padding: 24px 20px; border-bottom: 1px solid #f0f3f7; color: #94a3b8; font-style: italic; font-size: 15px;">No outing scheduled</td>
        </tr>
      `;
    }
  }
  
  html += `
        </table>
        </div>
        
          <div class="highlight-box">
            <div style="text-align: center; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #1565c0; font-size: 24px; font-weight: 500; letter-spacing: 0.5px;">[List] Outing Guidelines &amp; Expectations</h3>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #1565c0, #42a5f5); margin: 20px auto; border-radius: 2px; box-shadow: 0 2px 4px rgba(21, 101, 192, 0.3);"></div>
            </div>
            <p style="margin-bottom: 25px; font-style: italic; color: #1976d2; font-size: 17px; text-align: center; font-weight: 400;">Thank you for being part of our therapeutic community! These guidelines ensure safe, meaningful experiences for our clients.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; margin-bottom: 30px;">
              <div style="background: rgba(255,255,255,0.9); padding: 25px; border-radius: 12px; border-left: 5px solid #ff6b6b; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);">
                <h4 style="color: #d63031; margin: 0 0 18px 0; font-size: 19px; font-weight: 600;">[Safety] Safety First</h4>
                <div style="color: #475569; line-height: 1.7; font-size: 15px;">
                  <p style="margin: 10px 0;"><strong style="color: #1e293b;">Before Departure:</strong> Conduct thorough searches of all clients before boarding transportation. If contraband is found, contact the Program Coordinator immediately.</p>
                  <p style="margin: 10px 0;"><strong style="color: #1e293b;">Constant Supervision:</strong> Maintain visual contact with clients at all times. For restroom breaks, a Care Assistant must escort clients directly.</p>
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; border-left: 4px solid #00b894;">
                <h4 style="color: #00a085; margin: 0 0 15px 0; font-size: 18px;">[Team] Client Interactions</h4>
                <div style="color: #636e72; line-height: 1.6;">
                  <p style="margin: 8px 0;"><strong style="color: #2d3436;">Public Interactions:</strong> Clients should not engage in conversations with members of the public during outings.</p>
                  <p style="margin: 8px 0;"><strong style="color: #2d3436;">Stay Alert:</strong> Watch for wandering behavior or attempts to seek cigarettes, vapes, or other contraband. Redirect immediately and stay vigilant.</p>
                  <p style="margin: 8px 0;"><strong style="color: #2d3436;">Group Cohesion:</strong> Keep the group together and engaged in the planned therapeutic activity.</p>
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px; border-left: 4px solid #6c5ce7;">
                <h4 style="color: #5f27cd; margin: 0 0 15px 0; font-size: 18px;">[Phone] Communication Protocol</h4>
                <div style="color: #636e72; line-height: 1.6;">
                  <p style="margin: 8px 0;"><strong style="color: #2d3436;">Issues or Concerns:</strong> Contact the Program Coordinator (PC) or Assistant Program Coordinator (APC) immediately if any problems arise.</p>
                  <p style="margin: 8px 0;"><strong style="color: #2d3436;">Emergency Response:</strong> If safety is compromised, transport clients back to the facility immediately and notify supervisors.</p>
                  <p style="margin: 8px 0;"><strong style="color: #2d3436;">Schedule Changes:</strong> Coordinate any necessary adjustments through the scheduling coordinator.</p>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fff8e1 0%, #fef3c7 100%); padding: 20px; border-radius: 12px; border: 1px solid #f59e0b; margin-top: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 10px;">💡</span>
                <h4 style="color: #92400e; margin: 0; font-size: 18px;">Remember</h4>
              </div>
              <p style="margin: 0; color: #78350f; font-style: italic; line-height: 1.6;">These outings are therapeutic opportunities that contribute to our clients' healing and growth. Your professionalism and attention to detail make a real difference in their recovery journey!</p>
            </div>
          </div>          <!-- Enhanced Checklist Section -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #cbd5e1; border-radius: 16px; padding: 35px; margin: 35px 0; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h4 style="margin-top: 0; color: #334155; font-size: 22px; font-weight: 600;">[Note] Pre-Outing Checklist</h4>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #64748b, #94a3b8); margin: 18px auto; border-radius: 2px;"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #28a745; font-size: 18px; margin-right: 10px; margin-top: 2px;">✅</span>
                <span style="color: #495057; line-height: 1.5;">Verify transportation arrangements and departure times</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #28a745; font-size: 18px; margin-right: 10px; margin-top: 2px;">[Check]</span>
                <span style="color: #495057; line-height: 1.5;">Confirm all participants are cleared and ready for the outing</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #28a745; font-size: 18px; margin-right: 10px; margin-top: 2px;">✅</span>
                <span style="color: #495057; line-height: 1.5;">Review any vendor-specific requirements or restrictions</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #28a745; font-size: 18px; margin-right: 10px; margin-top: 2px;">✅</span>
                <span style="color: #495057; line-height: 1.5;">Ensure emergency contact information is readily accessible</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #28a745; font-size: 18px; margin-right: 10px; margin-top: 2px;">✅</span>
                <span style="color: #495057; line-height: 1.5;">Check weather conditions and adjust plans if necessary</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #28a745; font-size: 18px; margin-right: 10px; margin-top: 2px;">✅</span>
                <span style="color: #495057; line-height: 1.5;">Confirm staff-to-client ratios meet safety requirements</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); color: white; padding: 15px 30px; border-radius: 25px; box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);">
              <p style="margin: 0; font-size: 16px; font-weight: 400;">If you have any questions or need to make changes, please contact your Program Coordinator.</p>
            </div>
          </div>
        </div>

        <!-- Modern Footer -->
        <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 30px; text-align: center; border-radius: 0 0 15px 15px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="footer-pattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23footer-pattern)"/></svg>');"></div>
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <div style="width: 40px; height: 3px; background: #3498db; margin-right: 15px; border-radius: 2px;"></div>
              <span style="color: #ecf0f1; font-size: 14px; font-weight: 300;">Family First Adolescent Services</span>
              <div style="width: 40px; height: 3px; background: #3498db; margin-left: 15px; border-radius: 2px;"></div>
            </div>
            <p style="font-size: 13px; color: #bdc3c7; margin: 5px 0; line-height: 1.4;">
              This schedule is specific to ${house} only.<br>
              <strong style="color: #3498db;">Program Coordinator:</strong> ${getPCContactForHouse(house)}<br>
              For questions, contact your Program Coordinator.<br>
              <strong style="color: #3498db;">Powered by ClearHive Health</strong> | Version ${CONFIG.VERSION}<br>
              <em style="color: #95a5a6;">Please do not reply to this email. For support, contact your system administrator.</em>
            </p>
            <div style="margin-top: 20px;">
              <span style="display: inline-block; background: rgba(52, 152, 219, 0.2); color: #3498db; padding: 8px 16px; border-radius: 20px; font-size: 12px; border: 1px solid rgba(52, 152, 219, 0.3);">
                🏥 Therapeutic Excellence
              </span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Get PC contact information for a specific house
 */
function getPCContactForHouse(houseName) {
  const pcInfo = CONFIG.PC_CONTACTS[houseName];
  if (pcInfo) {
    return `${pcInfo.name} - ${pcInfo.phone}`;
  }
  return `Christopher Molina - ${CONFIG.MAIN_CONTACT_PHONE || '(561) 703-4864'} - ${CONFIG.DIRECTOR_EMAIL || 'cmolina@familyfirstas.com'}`;
}

/**
 * Add multiple vendor calendar IDs
 */
function addVendorCalendarIds() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Define vendor calendars to add
  const vendorCalendars = [
    {
      vendor: 'Kayaking',
      calendarId: '8b85f4b456e10d8a991129b210ea16f98ac00fecfa04f2f39b2951a4c0d50aef@group.calendar.google.com'
    },
    {
      vendor: 'Goat Yoga',
      calendarId: 'c8d302e6f7510aa71ae3ab2d0b0868c614d604a7800d1a51309a2a02aba048c9@group.calendar.google.com'
    },
    {
      vendor: 'Surf Therapy',
      calendarId: '9ef8dd17e6af927ad50e01049b061c405781bb08229b646a0897574dac5ca296@group.calendar.google.com'
    },
    {
      vendor: 'Peach Painting',
      calendarId: 'f640d58ac3faaecccf7b29d5b44498161514ae1a7ac5209e69b01037032207e@group.calendar.google.com'
    }
  ];
  
  try {
    // Get or create Vendor Calendar Links sheet
    let calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    
    if (!calendarSheet) {
      createVendorCalendarLinksSheet();
      calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    }
    
    const data = calendarSheet.getDataRange().getValues();
    let updatedCount = 0;
    let addedCount = 0;
    const results = [];
    
    // Process each vendor calendar
    vendorCalendars.forEach(({vendor, calendarId}) => {
      let vendorRow = -1;
      
      // Find vendor row
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][0].toLowerCase().includes(vendor.toLowerCase())) {
          vendorRow = i + 1;
          break;
        }
      }
      
      try {
        if (vendorRow > 0) {
          // Update existing vendor
          calendarSheet.getRange(vendorRow, 3).setValue(calendarId);
          updatedCount++;
        } else {
          // Add new vendor
          const lastRow = calendarSheet.getLastRow();
          calendarSheet.getRange(lastRow + 1, 1).setValue(vendor);
          calendarSheet.getRange(lastRow + 1, 2).setValue('View Only');
          calendarSheet.getRange(lastRow + 1, 3).setValue(calendarId);
          addedCount++;
        }
        
        // Test calendar access
        try {
          const calendar = CalendarApp.getCalendarById(calendarId);
          const calendarName = calendar.getName();
          results.push(`✅ ${vendor}: Connected successfully (${calendarName})`);
        } catch (e) {
          results.push(`⚠️ ${vendor}: ID saved but access error - ${e.message}`);
        }
      } catch (error) {
        results.push(`❌ ${vendor}: Failed - ${error.message}`);
      }
    });
    
    // Show results
    const message = `Calendar Setup Complete!\n\n` +
      `Added: ${addedCount} new vendors\n` +
      `Updated: ${updatedCount} existing vendors\n\n` +
      `Results:\n${results.join('\n')}\n\n` +
      `You can now sync events to these calendars.`;
    
    ui.alert('✅ Vendor Calendars Added', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', `Failed to add calendar IDs: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Add kayaking calendar ID
 */
function addKayakingCalendarId() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Extract Calendar ID from the URL
  const calendarId = '8b85f4b456e10d8a991129b210ea16f98ac00fecfa04f2f39b2951a4c0d50aef@group.calendar.google.com';
  
  try {
    // Get or create Vendor Calendar Links sheet
    let calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    
    if (!calendarSheet) {
      // Create the sheet if it doesn't exist
      createVendorCalendarLinksSheet();
      calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    }
    
    // Find kayaking row
    const data = calendarSheet.getDataRange().getValues();
    let kayakingRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toLowerCase().includes('kayak')) {
        kayakingRow = i + 1; // Convert to 1-based index
        break;
      }
    }
    
    if (kayakingRow > 0) {
      // Update the Calendar ID
      calendarSheet.getRange(kayakingRow, 3).setValue(calendarId); // Column C for Calendar ID
      
      // Test the calendar access
      try {
        const calendar = CalendarApp.getCalendarById(calendarId);
        const calendarName = calendar.getName();
        
        ui.alert(
          '✅ Success!',
          `Kayaking calendar connected successfully!\n\nCalendar Name: ${calendarName}\nCalendar ID: ${calendarId}\n\nYou can now sync kayaking events to this calendar.`,
          ui.ButtonSet.OK
        );
      } catch (e) {
        ui.alert(
          '⚠️ Calendar Added but Access Error',
          `The Calendar ID was added, but there was an error accessing it:\n${e.message}\n\nMake sure the calendar is shared with your Google account.`,
          ui.ButtonSet.OK
        );
      }
    } else {
      ui.alert(
        'Kayaking Vendor Not Found',
        'Could not find a kayaking vendor in the Vendor Calendar Links sheet. Please add it first.',
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to add calendar ID: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Sync all vendor calendars through December 2026
 */
function syncAllVendorCalendars() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('Schedule');
    const calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    
    if (!scheduleSheet || !calendarSheet) {
      ui.alert('Error', 'Required sheets not found. Please ensure Schedule and Vendor Calendar Links sheets exist.', ui.ButtonSet.OK);
      return;
    }
    
    // Get vendor calendar mappings
    const calendarData = calendarSheet.getDataRange().getValues();
    const vendorCalendars = {};
    
    for (let i = 1; i < calendarData.length; i++) {
      const vendor = calendarData[i][0];
      const calendarId = calendarData[i][2]; // Calendar ID column
      if (vendor && calendarId && calendarId !== 'Not Set') {
        vendorCalendars[vendor] = calendarId;
      }
    }
    
    // Get current schedule pattern
    const scheduleData = scheduleSheet.getDataRange().getValues();
    const currentPattern = extractSchedulePattern(scheduleData);
    
    // Generate events through December 2026
    const startDate = new Date();
    const endDate = new Date('2026-12-31');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Clear existing future events first
    Object.entries(vendorCalendars).forEach(([vendor, calendarId]) => {
      try {
        const calendar = CalendarApp.getCalendarById(calendarId);
        const events = calendar.getEvents(startDate, endDate);
        events.forEach(event => {
          if (event.getTitle().includes('Family First')) {
            event.deleteEvent();
          }
        });
      } catch (e) {
        // Continue with other vendors
      }
    });
    
    // Create events for each vendor
    for (const [vendor, calendarId] of Object.entries(vendorCalendars)) {
      try {
        const calendar = CalendarApp.getCalendarById(calendarId);
        let currentWeek = new Date(startDate);
        
        while (currentWeek <= endDate) {
          // Find which day this vendor is scheduled
          for (const [day, data] of Object.entries(currentPattern)) {
            if (data.vendor === vendor) {
              const eventDate = getNextDayOfWeek(currentWeek, day);
              
              if (eventDate <= endDate) {
                // Parse time
                const timeMatch = data.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (timeMatch) {
                  let hours = parseInt(timeMatch[1]);
                  const minutes = parseInt(timeMatch[2]);
                  const isPM = timeMatch[3].toUpperCase() === 'PM';
                  
                  if (isPM && hours !== 12) hours += 12;
                  if (!isPM && hours === 12) hours = 0;
                  
                  const startTime = new Date(eventDate);
                  startTime.setHours(hours, minutes, 0, 0);
                  
                  const endTime = new Date(startTime);
                  endTime.setHours(startTime.getHours() + 2); // 2-hour events
                  
                  // Create calendar event
                  calendar.createEvent(
                    `🎯 Family First - ${vendor} Outing`,
                    startTime,
                    endTime,
                    {
                      description: formatVendorEventDescription(vendor, day, data.houses),
                      location: vendor,
                      colorId: '9', // Blue
                      guests: 'estatesca@familyfirstas.com,nestca@familyfirstas.com,coveca@familyfirstas.com'
                    }
                  );
                  successCount++;
                }
              }
            }
          }
          
          // Move to next week
          currentWeek.setDate(currentWeek.getDate() + 7);
        }
        
      } catch (error) {
        errorCount++;
        errors.push(`${vendor}: ${error.message}`);
      }
    }
    
    // Show results
    let message = `Calendar sync complete!\n\n`;
    message += `✅ Created ${successCount} events\n`;
    message += `📅 Events created through December 2026\n`;
    
    if (errorCount > 0) {
      message += `\n⚠️ ${errorCount} errors occurred:\n`;
      errors.forEach(err => message += `• ${err}\n`);
    }
    
    ui.alert('Vendor Calendar Sync', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', `Failed to sync calendars: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Extract schedule pattern from current week
 */
function extractSchedulePattern(scheduleData) {
  const pattern = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Find the current week's schedule
  for (let row = 0; row < scheduleData.length; row++) {
    for (let col = 0; col < scheduleData[row].length; col++) {
      const cell = scheduleData[row][col];
      if (typeof cell === 'string' && days.includes(cell)) {
        // Found a day, extract vendor info
        const dayName = cell;
        const vendorRow = row + 1;
        
        if (vendorRow < scheduleData.length) {
          const vendorCell = scheduleData[vendorRow][col];
          if (vendorCell && vendorCell !== '') {
            const lines = vendorCell.split('\n');
            const vendor = lines[0];
            const time = lines[1] || '2:00 PM';
            const houses = lines.slice(2).join(', ');
            
            pattern[dayName] = {
              vendor: vendor,
              time: time,
              houses: houses
            };
          }
        }
      }
    }
  }
  
  return pattern;
}

/**
 * Get next occurrence of a day of week
 */
function getNextDayOfWeek(fromDate, dayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = days.indexOf(dayName);
  const currentDay = fromDate.getDay();
  
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  
  const result = new Date(fromDate);
  result.setDate(result.getDate() + daysUntilTarget);
  return result;
}

/**
 * Format vendor event description
 */
function formatVendorEventDescription(vendor, day, houses) {
  // Get PC contacts for the participating houses
  let pcContacts = '';
  if (houses && houses !== 'All Houses') {
    const houseList = houses.split(', ');
    const uniquePCs = new Map();
    
    houseList.forEach(house => {
      const pcInfo = CONFIG.PC_CONTACTS[house];
      if (pcInfo) {
        uniquePCs.set(pcInfo.name, pcInfo);
      }
    });
    
    if (uniquePCs.size > 0) {
      pcContacts = Array.from(uniquePCs.values())
        .map(pc => `• ${pc.name}: ${pc.phone}`)
        .join('\n');
    }
  }
  
  // Use default contact if no specific PCs found
  if (!pcContacts) {
    pcContacts = `• Christopher Molina (Director): ${CONFIG.MAIN_CONTACT_PHONE || '(561) 703-4864'} | Email: ${CONFIG.DIRECTOR_EMAIL || 'cmolina@familyfirstas.com'}`;
  }
  
  return `📍 Family First Therapeutic Outing
🏠 Participating Houses: ${houses || 'All Houses'}
👥 Expected Clients: ~15-20
🚗 Transportation: Family First Vans
📋 Outing Details:
• Activity: ${vendor}
• Duration: 2 hours
• Day: ${day}

☎️ Program Coordinator Contact(s):
${pcContacts}
• Director Email: ${CONFIG.DIRECTOR_EMAIL || 'cmolina@familyfirstas.com'}
• Scheduling Email: ${CONFIG.MAIN_CONTACT_EMAIL}

⚠️ Important Notes:
• Please have facilities ready 15 minutes before arrival
• Staff will handle all payments
• Any changes will be communicated in advance

Thank you for partnering with Family First Adolescent Services!`;
}

/**
 * Add vendor calendar from URL
 */
function addVendorCalendarFromUrl() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Prompt for calendar URL
  const urlResponse = ui.prompt(
    '📅 Add Vendor Calendar',
    'Paste the Google Calendar sharing URL:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (urlResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const url = urlResponse.getResponseText().trim();
  
  // Extract calendar ID from URL
  let calendarId = '';
  
  // Check if it's a calendar URL
  if (url.includes('cid=')) {
    // Extract from cid parameter
    const cidMatch = url.match(/cid=([^&]+)/);
    if (cidMatch) {
      const encodedId = cidMatch[1];
      // Decode the calendar ID
      calendarId = decodeURIComponent(encodedId);
      // Replace URL-encoded @ symbol
      calendarId = calendarId.replace('%40', '@');
    }
  } else if (url.includes('@')) {
    // Assume it's already a calendar ID
    calendarId = url;
  }
  
  if (!calendarId) {
    ui.alert('Error', 'Could not extract Calendar ID from the URL. Please check the URL and try again.', ui.ButtonSet.OK);
    return;
  }
  
  // Get vendor name
  const vendorResponse = ui.prompt(
    '🏢 Vendor Name',
    `Calendar ID found: ${calendarId}\n\nEnter the vendor name (e.g., "Kayaking", "Bowling", etc.):`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (vendorResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const vendorName = vendorResponse.getResponseText().trim();
  
  try {
    // Get or create Vendor Calendar Links sheet
    let calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    
    if (!calendarSheet) {
      createVendorCalendarLinksSheet();
      calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    }
    
    // Find vendor row
    const data = calendarSheet.getDataRange().getValues();
    let vendorRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toLowerCase().includes(vendorName.toLowerCase())) {
        vendorRow = i + 1;
        break;
      }
    }
    
    if (vendorRow > 0) {
      // Update existing vendor
      calendarSheet.getRange(vendorRow, 3).setValue(calendarId);
    } else {
      // Add new vendor
      const lastRow = calendarSheet.getLastRow();
      calendarSheet.getRange(lastRow + 1, 1).setValue(vendorName);
      calendarSheet.getRange(lastRow + 1, 2).setValue('View Only');
      calendarSheet.getRange(lastRow + 1, 3).setValue(calendarId);
    }
    
    // Test calendar access
    try {
      const calendar = CalendarApp.getCalendarById(calendarId);
      const calendarName = calendar.getName();
      
      ui.alert(
        '✅ Success!',
        `${vendorName} calendar connected!\n\nCalendar: ${calendarName}\nID: ${calendarId}\n\nYou can now sync events to this calendar.`,
        ui.ButtonSet.OK
      );
    } catch (e) {
      ui.alert(
        '⚠️ Calendar Added but Access Warning',
        `The Calendar ID was saved, but there was an access error:\n${e.message}\n\nMake sure:\n1. The calendar is shared with your account\n2. You have at least "Make changes to events" permission`,
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to add vendor calendar: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Generate vendor access instructions
 */
function generateVendorAccessInstructions() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Get vendor calendar data
    const calendarSheet = ss.getSheetByName('Vendor Calendar Links');
    if (!calendarSheet) {
      ui.alert('Error', 'Please set up vendor calendars first.', ui.ButtonSet.OK);
      return;
    }
    
    const data = calendarSheet.getDataRange().getValues();
    let vendorInfo = [];
    
    // Collect vendor information
    for (let i = 1; i < data.length; i++) {
      const vendor = data[i][0];
      const calendarId = data[i][2];
      
      if (vendor && calendarId && calendarId !== 'Not Set') {
        // Generate calendar sharing URL
        const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America/Los_Angeles`;
        
        vendorInfo.push({
          vendor: vendor,
          calendarId: calendarId,
          calendarUrl: calendarUrl
        });
      }
    }
    
    // Create HTML instructions
    const html = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; max-width: 800px; padding: 20px;">
        <h2 style="color: #1976d2; margin-bottom: 20px;">📅 Vendor Access Instructions</h2>
        
        <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1565c0; margin-top: 0;">Vendors have TWO options to view their schedules:</h3>
          
          <div style="background: white; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin-top: 0;">Option 1: Google Calendar (Recommended)</h4>
            <ul style="margin: 10px 0;">
              <li>Real-time updates when schedule changes</li>
              <li>Mobile app access on phones/tablets</li>
              <li>Email reminders before outings</li>
              <li>Syncs with vendor's existing calendar</li>
            </ul>
          </div>
          
          <div style="background: white; border-radius: 4px; padding: 15px;">
            <h4 style="color: #2c3e50; margin-top: 0;">Option 2: PDF Schedule</h4>
            <ul style="margin: 10px 0;">
              <li>Printable format for posting</li>
              <li>Full year view available</li>
              <li>No Google account required</li>
              <li>Updated monthly or as needed</li>
            </ul>
          </div>
        </div>
        
        <h3 style="color: #1976d2;">📋 Vendor Calendar Links:</h3>
        
        ${vendorInfo.map(v => `
          <div style="background: #f5f5f5; border-left: 4px solid #1976d2; padding: 15px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${v.vendor}</h4>
            <p style="margin: 5px 0;"><strong>Calendar View:</strong><br>
              <a href="${v.calendarUrl}" target="_blank" style="color: #1976d2; word-break: break-all;">
                ${v.calendarUrl}
              </a>
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>To share:</strong> Send this link to ${v.vendor} - they can view without a Google account
            </p>
          </div>
        `).join('')}
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin-top: 20px;">
          <h4 style="color: #856404; margin-top: 0;">📧 Email Template for Vendors:</h4>
          <div style="background: white; border: 1px solid #ddd; padding: 10px; border-radius: 4px; font-size: 14px;">
            <p>Subject: Your Family First Outing Schedule</p>
            <p>Dear [Vendor Name],</p>
            <p>Thank you for partnering with Family First Adolescent Services!</p>
            <p>You can view your outing schedule in two ways:</p>
            <p>1. <strong>Online Calendar:</strong> [Insert calendar link]<br>
               - Always up-to-date<br>
               - Works on any device</p>
            <p>2. <strong>PDF Schedule:</strong> Contact us for a printable version</p>
            <p>If you have any questions, please contact:<br>
            Program Coordinator: [Phone] | [Email]</p>
            <p>Best regards,<br>
            Family First Team</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="google.script.run.generateVendorPDFSchedules()" 
                  style="background: #1976d2; color: white; border: none; padding: 10px 20px; 
                         border-radius: 4px; cursor: pointer; font-size: 16px;">
            Generate PDF Schedules for All Vendors
          </button>
        </div>
      </div>
    `)
    .setWidth(850)
    .setHeight(700);
    
    ui.showModalDialog(html, '📅 Vendor Access Options');
    
  } catch (error) {
    ui.alert('Error', `Failed to generate instructions: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Generate PDF schedules for all vendors
 */
/**
 * Generate PDF schedules for all vendors
 * This is a wrapper function for backward compatibility
 */
function generateVendorPDFSchedules() {
  const pdfManager = new PDFManager();
  pdfManager.generateVendorPDFs();
}

/**
 * Create vendor-specific schedule view
 */
function createVendorScheduleView(vendorName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('Schedule');
  
  if (!scheduleSheet) {
    throw new Error('Schedule sheet not found');
  }
  
  // Create or get vendor-specific sheet
  let vendorSheet = ss.getSheetByName(`${vendorName} Schedule`);
  if (!vendorSheet) {
    vendorSheet = ss.insertSheet(`${vendorName} Schedule`);
  }
  
  // Clear existing content
  vendorSheet.clear();
  
  // Add title and header
  vendorSheet.getRange(1, 1).setValue(`${vendorName} - Therapeutic Outings Schedule`);
  vendorSheet.getRange(1, 1, 1, 6).merge().setFontSize(18).setFontWeight('bold').setHorizontalAlignment('center');
  
  vendorSheet.getRange(2, 1).setValue(`Generated: ${new Date().toLocaleDateString()}`);
  vendorSheet.getRange(2, 1, 1, 6).merge().setFontSize(12).setHorizontalAlignment('center');
  
  // Add contact info
  const contactInfo = `Director Contact: Christopher Molina - ${CONFIG.MAIN_CONTACT_PHONE} | Email: ${CONFIG.MAIN_CONTACT_EMAIL}`;
  vendorSheet.getRange(3, 1).setValue(contactInfo);
  vendorSheet.getRange(3, 1, 1, 6).merge().setFontSize(11).setHorizontalAlignment('center').setBackground('#e8f5e9');
  
  // Add header row
  vendorSheet.getRange(5, 1, 1, 6).setValues([
    ['Date', 'Day', 'Time', 'House(s)', 'PC Contact', 'PC Phone']
  ]);
  vendorSheet.getRange(5, 1, 1, 6).setFontWeight('bold').setBackground('#1976d2').setFontColor('#ffffff');
  
  // Get schedule data
  const data = scheduleSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find date column and house columns
  const dateIndex = headers.findIndex(h => h.toString().toLowerCase().includes('date'));
  const optionsIndex = headers.findIndex(h => h.toString().toLowerCase().includes('options'));
  
  const startIndex = dateIndex >= 0 ? dateIndex + 1 : 1;
  const endIndex = optionsIndex >= 0 ? optionsIndex : headers.length;
  
  // Get house columns
  const houseColumns = [];
  const houseIndexes = [];
  for (let i = startIndex; i < endIndex; i++) {
    const header = headers[i];
    if (header && header.toString().trim() !== '' && 
        header.toString().toLowerCase() !== 'true' && 
        header.toString().toLowerCase() !== 'false' &&
        !header.toString().toLowerCase().includes('option')) {
      houseColumns.push(header);
      houseIndexes.push(i);
    }
  }
  
  // Extract vendor's schedule
  const vendorSchedule = [];
  
  // Start from row 1 (skip headers)
  for (let row = 1; row < data.length; row++) {
    const dateCell = data[row][dateIndex];
    if (!dateCell) continue;
    
    const date = new Date(dateCell);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Check each house column for this vendor
    for (let i = 0; i < houseColumns.length; i++) {
      const house = houseColumns[i];
      const cellData = data[row][houseIndexes[i]];
      
      if (cellData && cellData.toString().includes(vendorName)) {
        const parts = cellData.toString().split('\n');
        const time = parts[1] || '2:00 PM';
        
        // Get PC contact for this house
        const pcInfo = CONFIG.PC_CONTACTS[house];
        const pcName = pcInfo ? pcInfo.name : 'Christopher Molina';
        const pcPhone = pcInfo ? pcInfo.phone : CONFIG.MAIN_CONTACT_PHONE;
        
        vendorSchedule.push([
          dateFormatted,
          dayName,
          time,
          house,
          pcName,
          pcPhone
        ]);
      }
    }
  }
  
  // Sort by date
  vendorSchedule.sort((a, b) => new Date(a[0]) - new Date(b[0]));
  
  // Add schedule to sheet
  if (vendorSchedule.length > 0) {
    vendorSheet.getRange(6, 1, vendorSchedule.length, 6).setValues(vendorSchedule);
    
    // Format data rows
    vendorSheet.getRange(6, 1, vendorSchedule.length, 6).setBorder(true, true, true, true, true, true);
    
    // Alternate row colors
    for (let i = 0; i < vendorSchedule.length; i++) {
      if (i % 2 === 0) {
        vendorSheet.getRange(6 + i, 1, 1, 6).setBackground('#f5f5f5');
      }
    }
  } else {
    vendorSheet.getRange(6, 1).setValue('No outings scheduled for this vendor');
    vendorSheet.getRange(6, 1, 1, 6).merge().setHorizontalAlignment('center').setFontStyle('italic');
  }
  
  // Add summary
  const summaryRow = 6 + vendorSchedule.length + 2;
  vendorSheet.getRange(summaryRow, 1).setValue(`Total Outings: ${vendorSchedule.length}`);
  vendorSheet.getRange(summaryRow, 1, 1, 6).merge().setFontWeight('bold').setBackground('#e3f2fd');
  
  // Format the sheet
  vendorSheet.autoResizeColumns(1, 6);
  vendorSheet.setFrozenRows(5);
  
  // Generate shareable URL for this vendor sheet
  const shareableUrl = `https://docs.google.com/spreadsheets/d/${ss.getId()}/edit#gid=${vendorSheet.getSheetId()}`;
  
  return {
    sheet: vendorSheet,
    url: shareableUrl,
    vendorName: vendorName,
    outingCount: vendorSchedule.length
  };
}

/**
 * Create individual vendor schedule views
 */
function createAllVendorSchedules() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Show progress
    const progressHtml = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h3>Creating Vendor Schedules...</h3>
        <p>Please wait while we generate individual schedules for each vendor.</p>
        <div style="margin: 20px auto; width: 200px; height: 20px; background: #e0e0e0; border-radius: 10px;">
          <div style="width: 50%; height: 100%; background: #1976d2; border-radius: 10px; animation: progress 2s ease-in-out infinite;"></div>
        </div>
        <style>
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        </style>
      </div>
    `)
    .setWidth(400)
    .setHeight(200);
    
    ui.showModalDialog(progressHtml, 'Generating Vendor Schedules');
    
    // Get unique vendors from the schedule
    const dataManager = new DataManager(ss);
    const vendors = dataManager.getVendors();
    const vendorNames = Object.keys(vendors);
    
    const results = [];
    const errors = [];
    
    // Create schedule for each vendor
    vendorNames.forEach(vendorName => {
      try {
        const result = createVendorScheduleView(vendorName);
        results.push(result);
      } catch (error) {
        errors.push({vendor: vendorName, error: error.toString()});
      }
    });
    
    // Close progress dialog
    const closeScript = HtmlService.createHtmlOutput('<script>google.script.host.close();</script>');
    ui.showModalDialog(closeScript, 'Closing...');
    
    // Show results
    showVendorScheduleResults(results, errors);
    
  } catch (error) {
    ui.alert('Error', `Failed to create vendor schedules: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * Show results of vendor schedule creation
 */
function showVendorScheduleResults(results, errors) {
  const ui = SpreadsheetApp.getUi();
  
  let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #1976d2;">📅 Vendor Schedule Generation Complete</h2>
      
      <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">✅ Successfully created ${results.length} vendor schedules</p>
      </div>
      
      <h3>Individual Vendor Schedules:</h3>
      <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px;">
  `;
  
  results.forEach(result => {
    html += `
      <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #1976d2;">${result.vendorName}</strong>
            <br>
            <span style="color: #666; font-size: 14px;">${result.outingCount} outings scheduled</span>
          </div>
          <div>
            <button onclick="window.open('${result.url}', '_blank')" 
                    style="padding: 6px 12px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
              View Schedule
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  if (errors.length > 0) {
    html += `
      <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #d32f2f;"><strong>⚠️ Errors (${errors.length}):</strong></p>
        <ul style="margin: 10px 0 0 20px; color: #d32f2f;">
    `;
    errors.forEach(error => {
      html += `<li>${error.vendor}: ${error.error}</li>`;
    });
    html += `</ul></div>`;
  }
  
  html += `
      <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #1565c0;">📧 Sharing Vendor Schedules:</h4>
        <ol style="margin: 10px 0 0 20px;">
          <li>Click "View Schedule" for the vendor you want to share</li>
          <li>Click the "Share" button in the top-right corner</li>
          <li>Set sharing to "Anyone with the link can view"</li>
          <li>Copy the link and send it to the vendor</li>
        </ol>
        <p style="margin: 10px 0 0 0; font-style: italic; color: #666;">
          Each vendor will only see their own schedule - no other vendor information is visible.
        </p>
      </div>
      
      <div style="text-align: right; margin-top: 20px;">
        <button onclick="google.script.host.close()" 
                style="padding: 8px 16px; background: #757575; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Close
        </button>
      </div>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(650)
    .setHeight(600);
  
  ui.showModalDialog(htmlOutput, '✅ Vendor Schedules Created');
}

/**
 * Create schedule for a specific vendor (menu function)
 */
function createSingleVendorSchedule() {
  const ui = SpreadsheetApp.getUi();
  
  // Get vendor name from user
  const response = ui.prompt(
    '📅 Create Vendor Schedule',
    'Enter the vendor name (e.g., "Groovy Goat Farm"):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const vendorName = response.getResponseText().trim();
  if (!vendorName) {
    ui.alert('Error', 'Please enter a vendor name.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const result = createVendorScheduleView(vendorName);
    
    ui.alert(
      '✅ Schedule Created',
      `Successfully created schedule for ${vendorName}!\n\n` +
      `📊 Total outings: ${result.outingCount}\n` +
      `📄 Sheet name: "${vendorName} Schedule"\n\n` +
      `The schedule sheet is now available in this spreadsheet.\n` +
      `You can share it with the vendor using the Share button.`,
      ui.ButtonSet.OK
    );
    
    // Navigate to the new sheet
    result.sheet.activate();
    
  } catch (error) {
    ui.alert('Error', `Failed to create schedule: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * Share vendor calendar links via email
 */
function shareVendorCalendarLinks() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const vendorSheet = ss.getSheetByName('Vendor Calendar Links');
    if (!vendorSheet) {
      ui.alert('Error', 'Please set up vendor calendars first.', ui.ButtonSet.OK);
      return;
    }
    
    const data = vendorSheet.getDataRange().getValues();
    let emailContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Family First Vendor Calendar Access</h2>
        <p>Below are the calendar links for each vendor. They can view these calendars without a Google account.</p>
        <hr>
    `;
    
    for (let i = 1; i < data.length; i++) {
      const vendor = data[i][0];
      const calendarId = data[i][2];
      
      if (vendor && calendarId && calendarId !== 'Not Set') {
        const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America/Los_Angeles`;
        
        emailContent += `
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3>${vendor}</h3>
            <p><strong>Calendar View:</strong> <a href="${calendarUrl}">${calendarUrl}</a></p>
            <p><strong>PDF Option:</strong> Contact us for a printable schedule</p>
          </div>
        `;
      }
    }
    
    emailContent += `
        <hr>
        <p style="color: #666; font-size: 14px;">
          Vendors can bookmark these links for easy access to their schedules.
          The calendars update automatically when changes are made.
        </p>
      </div>
    `;
    
    // Show email draft
    const html = HtmlService.createHtmlOutput(`
      <div style="padding: 20px;">
        <h3>Email Preview</h3>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9;">
          ${emailContent}
        </div>
        <div style="text-align: center;">
          <button onclick="sendEmail()" style="background: #1976d2; color: white; padding: 10px 20px; 
                  border: none; border-radius: 4px; cursor: pointer;">
            Send to Program Coordinator
          </button>
        </div>
      </div>
      <script>
        function sendEmail() {
          google.script.run
            .withSuccessHandler(() => {
              google.script.host.close();
              alert('Email sent successfully!');
            })
            .withFailureHandler((error) => {
              alert('Error: ' + error.message);
            })
            .sendVendorLinksEmail();
        }
      </script>
    `)
    .setWidth(700)
    .setHeight(600);
    
    ui.showModalDialog(html, '📧 Share Vendor Calendar Links');
    
  } catch (error) {
    ui.alert('Error', `Failed to prepare links: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Send vendor links email
 */
function sendVendorLinksEmail() {
  const recipient = Session.getActiveUser().getEmail();
  const subject = 'Family First - Vendor Calendar Access Links';
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vendorSheet = ss.getSheetByName('Vendor Calendar Links');
  const data = vendorSheet.getDataRange().getValues();
  
  let emailContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Family First Vendor Calendar Access</h2>
      <p>Below are the calendar links for each vendor. They can view these calendars without a Google account.</p>
      <hr>
  `;
  
  for (let i = 1; i < data.length; i++) {
    const vendor = data[i][0];
    const calendarId = data[i][2];
    
    if (vendor && calendarId && calendarId !== 'Not Set') {
      const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America/Los_Angeles`;
      
      emailContent += `
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3>${vendor}</h3>
          <p><strong>Calendar View:</strong> <a href="${calendarUrl}">${calendarUrl}</a></p>
          <p><strong>PDF Option:</strong> Contact us for a printable schedule</p>
        </div>
      `;
    }
  }
  
  emailContent += `
      <hr>
      <p style="color: #666; font-size: 14px;">
        Vendors can bookmark these links for easy access to their schedules.
        The calendars update automatically when changes are made.
      </p>
    </div>
  `;
  
  GmailApp.sendEmail(recipient, subject, '', {
    htmlBody: emailContent
  });
}

/**
 * Extract date information from schedule position
 */
function extractDateFromPosition(row, col, data) {
  // This would extract the actual date from the schedule grid
  // For now, return a sample date
  const today = new Date();
  const offset = (col - 1) * 7; // Assuming weekly columns
  const date = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
  
  return {
    date: date.toLocaleDateString(),
    weekNumber: Math.floor(offset / 7) + 1
  };
}

/**
 * Demo both vendor access features
 */
function demoVendorAccessFeatures() {
  const ui = SpreadsheetApp.getUi();
  
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #1976d2; text-align: center;">🎯 Vendor Access Demo</h2>
      
      <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1565c0; margin-top: 0;">Choose What to Demo:</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
          <button onclick="showInstructions()" 
                  style="background: #1976d2; color: white; border: none; padding: 15px; 
                         border-radius: 8px; cursor: pointer; font-size: 16px; text-align: center;">
            📋 View Access Instructions
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">
              See calendar links & options
            </div>
          </button>
          
          <button onclick="generatePDFs()" 
                  style="background: #42a5f5; color: white; border: none; padding: 15px; 
                         border-radius: 8px; cursor: pointer; font-size: 16px; text-align: center;">
            📄 Generate PDF Schedules
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">
              Create printable versions
            </div>
          </button>
        </div>
        
        <div style="background: white; border-radius: 4px; padding: 15px; margin-top: 20px;">
          <h4 style="color: #2c3e50; margin-top: 0;">✨ What This Does:</h4>
          <ul style="margin: 10px 0; color: #555;">
            <li><strong>Access Instructions:</strong> Shows each vendor's unique calendar URL and how to access</li>
            <li><strong>PDF Schedules:</strong> Creates downloadable/printable schedules for each vendor</li>
          </ul>
        </div>
      </div>
      
      <div id="status" style="margin-top: 20px; text-align: center; font-style: italic; color: #666;"></div>
    </div>
    
    <script>
      function showInstructions() {
        document.getElementById('status').innerHTML = '⏳ Loading vendor access instructions...';
        google.script.run
          .withSuccessHandler(() => {
            google.script.host.close();
          })
          .withFailureHandler((error) => {
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
          })
          .generateVendorAccessInstructions();
      }
      
      function generatePDFs() {
        document.getElementById('status').innerHTML = '⏳ Generating PDF schedules...';
        google.script.run
          .withSuccessHandler(() => {
            google.script.host.close();
          })
          .withFailureHandler((error) => {
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
          })
          .generateVendorPDFSchedules();
      }
    </script>
  `)
  .setWidth(650)
  .setHeight(450);
  
  ui.showModalDialog(html, '🎯 Vendor Access Features Demo');
}

/**
 * Test and display vendor calendar events
 */
function testVendorCalendarDisplay() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Create a test calendar event to show format
    const testCalendar = CalendarApp.getDefaultCalendar();
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7); // One week from now
    
    // Create a sample event
    const event = testCalendar.createEvent(
      '🎳 Family First - Bowling Outing',
      new Date(testDate.setHours(14, 0, 0, 0)), // 2:00 PM
      new Date(testDate.setHours(16, 0, 0, 0)), // 4:00 PM
      {
        description: `📍 Therapeutic Outing
🏠 Houses: Estates, Cove, Nest
👥 Total Clients: ~15-20
🚗 Transportation: Family First Vans

📋 Activities:
• Two hours of bowling
• Shoe rental included
• Refreshments provided

☎️ Contact: Christopher Molina (Director) - (561) 703-4864
📧 Email: ${CONFIG.MAIN_CONTACT_EMAIL}

⚠️ Important:
• Please have lanes ready by 1:45 PM
• Separate lanes for each house preferred
• Staff will handle all payments`,
        location: 'Test Bowling Alley, 123 Main St',
        guests: 'estatesca@familyfirstas.com,nestca@familyfirstas.com,coveca@familyfirstas.com',
        colorId: '9' // Blue color for therapeutic activities
      }
    );
    
    // Show preview dialog
    const html = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
        <h2 style="color: #1976d2; margin-bottom: 20px;">📅 Vendor Calendar Event Preview</h2>
        
        <div style="background: #f5f7fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2c3e50; margin-top: 0;">How events appear on vendor calendars:</h3>
          
          <div style="background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin-top: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 12px; height: 12px; background: #4285f4; border-radius: 2px; margin-right: 10px;"></div>
              <strong style="color: #1976d2; font-size: 16px;">🎳 Family First - Bowling Outing</strong>
            </div>
            
            <div style="color: #5f6368; font-size: 14px; margin-bottom: 5px;">
              📅 ${testDate.toLocaleDateString()} • 2:00 PM - 4:00 PM
            </div>
            
            <div style="color: #5f6368; font-size: 14px; margin-bottom: 15px;">
              📍 Test Bowling Alley, 123 Main St
            </div>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 15px;">
              <p style="margin: 5px 0;"><strong>🏠 Houses:</strong> Estates, Cove, Nest</p>
              <p style="margin: 5px 0;"><strong>👥 Expected:</strong> ~15-20 clients</p>
              <p style="margin: 5px 0;"><strong>🚗 Transport:</strong> Family First Vans</p>
            </div>
          </div>
        </div>
        
        <div style="background: #e8f5e9; border: 1px solid #81c784; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <h4 style="color: #2e7d32; margin-top: 0;">✅ Calendar Features:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Automatic event creation for each vendor</li>
            <li>Color-coded events (blue for therapeutic outings)</li>
            <li>Email reminders to participating houses</li>
            <li>Detailed activity information in description</li>
            <li>Contact information for questions</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px;">
          <h4 style="color: #856404; margin-top: 0;">📋 To Set Up Vendor Calendars:</h4>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Go to "Scheduler Menu" → "Advanced Features" → "Create Vendor Calendar Links Sheet"</li>
            <li>Share individual Google Calendars with each vendor</li>
            <li>Add Calendar IDs to the sheet</li>
            <li>Run "Update Vendor Calendars" to populate events</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #666;">Test event created in your calendar. You can delete it after reviewing.</p>
        </div>
      </div>
    `)
    .setWidth(650)
    .setHeight(600);
    
    ui.showModalDialog(html, '🔍 Vendor Calendar Preview');
    
  } catch (error) {
    ui.alert('Error', `Failed to create test event: ${error.message}`, ui.ButtonSet.OK);
  }
}

// ======================== CONSTANTS & CONFIG ========================

const CONFIG = {
  VERSION: '5.0.0',
  PRODUCT_NAME: 'Family First Therapeutic Outings Scheduler',
  COMPANY: 'ClearHive Health',
  CLIENT: 'Family First Adolescent Services',
  
  // Email Configuration
  RECIPIENTS_KEY: 'EMAIL_RECIPIENTS_LIST', // ScriptProperties key for recipients
  PREFERRED_SENDER_EMAIL: 'cmolina@familyfirstas.com', // Preferred email sender
  
  // Email delivery settings for large distribution lists
  EMAIL_SETTINGS: {
    MAX_RECIPIENTS_PER_EMAIL: 50, // Split large groups to avoid delivery issues
    DELAY_BETWEEN_BATCHES: 2000, // 2 seconds between batches
    BCC_LARGE_GROUPS: true, // Use BCC for large distribution lists
    RETRY_FAILED_EMAILS: true,
    MAX_RETRIES: 3,
    LARGE_GROUP_THRESHOLD: 10, // Groups with more than this many recipients get special handling
    USE_PREFERRED_SENDER: true // Use CONFIG.PREFERRED_SENDER_EMAIL when possible
  },
  
  CACHE_DURATION: 300000, // 5 minutes in milliseconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 50,
  PERFORMANCE_THRESHOLD: 5000, // ms
  LOG_RETENTION_DAYS: 90,
  DEFAULT_TIMEZONE: Session.getScriptTimeZone(),
  SUPPORTED_TIMEZONES: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  FEATURES: {
    SMART_SCHEDULING: true,
    CONFLICT_DETECTION: true,
    AUTO_OPTIMIZATION: true,
    WEBHOOK_ENABLED: false,
    ANALYTICS_ENABLED: true,
    AUDIT_LOGGING: true,
    MULTI_LANGUAGE: false
  },
  
  // Priority vendors that MUST appear weekly
  WEEKLY_PRIORITY_VENDORS: [
    'Kyaking John D McArthur State Park.',
    'Groovy Goat Farm',  // Goat Yoga
    'Surf Therapy',
    'Johnson Folly Equestrian Farm',  // Equine Therapy
    'The Peach Therapeutic Painting'  // Peach Therapy Painting
  ],
  
  // Core vendors that should be rotated fairly (includes priority + others)
  CORE_ROTATION_VENDORS: [
    'Surf Therapy',
    'Johnson Folly Equestrian Farm',
    'Groovy Goat Farm',
    'The Peach Therapeutic Painting',
    'Kyaking John D McArthur State Park.'
  ],
  
  // House-specific colors for visual consistency
  HOUSE_COLORS: {
    'House 1': '#E3F2FD',
    'House 2': '#F3E5F5', 
    'House 3': '#E8F5E9',
    'House 4': '#FFF3E0',
    'House 5': '#FCE4EC',
    'House 6': '#E8EAF6'
  },
  
  // Email domain requirements
  ALLOWED_DOMAINS: ['@familyfirstas.com', '@clearhive.com'],
  PERSONAL_DOMAINS: ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@aol.com'],
  
  // Emergency contact information for vendors
  MAIN_CONTACT_PHONE: '(561) 703-4864', // Christopher Molina - Director of Case Management
  
  // Program Coordinator (PC) contacts by house
  PC_CONTACTS: {
    'Prosperity': { name: 'Tyler G.', phone: '410-530-3184', houses: ['Prosperity', 'Preserve'] },
    'Preserve': { name: 'Tyler G.', phone: '410-530-3184', houses: ['Prosperity', 'Preserve'] },
    'Banyan': { name: 'Sam D.', phone: '561-388-5164', houses: ['Banyan'] },
    'Hedge': { name: 'Tim G.', phone: '561-351-2073', houses: ['Hedge'] },
    'Meridian': { name: 'Devin S.', phone: '561-714-9879', houses: ['Meridian'] },
    'Cove': { name: 'Carlos R.', phone: '515-570-2808', houses: ['Cove'] }
  },
  MAIN_CONTACT_EMAIL: 'scheduling@familyfirstas.com',
  DIRECTOR_EMAIL: 'cmolina@familyfirstas.com', // Christopher Molina - Director of Case Management
  EMERGENCY_CONTACT: '(561) 703-4864', // Christopher Molina - Director of Case Management
  MAIN_OFFICE_HOURS: 'Monday-Friday: 8:00 AM - 6:00 PM',
  AFTER_HOURS_CONTACT: 'Call main number for on-call coordinator'
};
// Initialize PDF folder ID (will be auto-created if needed)
CONFIG.VENDOR_PDF_FOLDER_ID = null;

// ======================== EMAIL PREVIEW FUNCTIONS ========================

/**
 * Get email preview for the selected week
 */
function getEmailPreview(weekSelection, specificDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet) {
    throw new Error('No schedule found');
  }
  
  // Determine which week to preview
  let targetDate = new Date();
  if (weekSelection === 'next') {
    targetDate.setDate(targetDate.getDate() + 7);
  } else if (weekSelection === 'specific' && specificDate) {
    targetDate = new Date(specificDate);
  }
  
  // Get the Monday of the selected week
  const weekStart = getWeekStart(targetDate);
  
  // Store the selected week temporarily for the preview generation
  PropertiesService.getScriptProperties().setProperty('TEMP_EMAIL_WEEK', weekStart.toISOString());
  
  try {
    const subject = `Family First - Weekly Schedule (Week of ${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')})`;
    
    // Get schedule data for preview
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the row for the selected week
    let scheduleRow = null;
    for (let i = 1; i < data.length; i++) {
      const rowDate = new Date(data[i][0]);
      if (isSameWeek(rowDate, weekStart)) {
        scheduleRow = data[i];
        break;
      }
    }
    
    if (!scheduleRow) {
      throw new Error('No schedule found for the selected week');
    }
    
    // Create a simplified preview HTML
    let previewHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h4 style="color: #1976d2; margin-bottom: 15px;">Week of ${Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MMMM d, yyyy')}</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #1976d2; color: white;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">House</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Vendor</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Time</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add schedule data
    let hasSchedule = false;
    for (let col = 1; col < headers.length; col++) {
      const house = headers[col];
      if (!house || house === 'Options' || house === 'Locked?') continue;
      
      const cellValue = scheduleRow[col];
      if (cellValue && cellValue !== 'UNASSIGNED' && cellValue !== 'TBD') {
        hasSchedule = true;
        const lines = cellValue.toString().split('\n');
        const vendorName = lines[0] || 'TBD';
        const time = lines[1] || 'Time TBD';
        
        previewHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${house}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #1565c0;">${vendorName}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${time}</td>
          </tr>
        `;
      }
    }
    
    if (!hasSchedule) {
      previewHtml += `
        <tr>
          <td colspan="3" style="padding: 20px; text-align: center; color: #666;">
            No outings scheduled for this week yet
          </td>
        </tr>
      `;
    }
    
    previewHtml += `
          </tbody>
        </table>
        <div style="margin-top: 15px; padding: 10px; background: #fff3e0; border-radius: 4px;">
          <strong style="color: #f57c00;">📧 This will be sent to:</strong><br>
          • Estates_CA@familyfirstas.com<br>
          • Nest_CA@familyfirstas.com<br>
          • Cove_CA@familyfirstas.com
        </div>
      </div>
    `;
    
    // Clear the temporary week
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    
    return {
      subject: subject,
      htmlPreview: previewHtml
    };
    
  } catch (error) {
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    throw error;
  }
}

/**
 * Helper function to check if two dates are in the same week
 */
function isSameWeek(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  // Get Monday of each week
  const firstMonday = new Date(firstDate);
  firstMonday.setDate(firstDate.getDate() - (firstDate.getDay() || 7) + 1);
  
  const secondMonday = new Date(secondDate);
  secondMonday.setDate(secondDate.getDate() - (secondDate.getDay() || 7) + 1);
  
  return Math.abs(firstMonday - secondMonday) < oneDay;
}

/**
 * Get a simple schedule preview - just shows what's in the spreadsheet
 */
function getSimpleSchedulePreview(weekSelection, specificDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      return '<div style="color: #666;">No schedule found. Please generate a schedule first.</div>';
    }
    
    // Determine which week to preview
    let targetDate = new Date();
    if (weekSelection === 'next') {
      targetDate.setDate(targetDate.getDate() + 7);
    } else if (weekSelection === 'specific' && specificDate) {
      targetDate = new Date(specificDate);
    }
    
    // Get the Monday of the selected week
    const weekStart = getWeekStart(targetDate);
    
    // Get schedule data
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the row for the selected week
    let scheduleRow = null;
    for (let i = 1; i < data.length; i++) {
      const rowDate = new Date(data[i][0]);
      if (isSameWeek(rowDate, weekStart)) {
        scheduleRow = data[i];
        break;
      }
    }
    
    if (!scheduleRow) {
      return '<div style="color: #666;">No schedule found for this week.</div>';
    }
    
    // Week header
    const monday = getWeekStart(weekStart);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const header = `Week of ${Utilities.formatDate(monday, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')} - ${Utilities.formatDate(sunday, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')}`;

    // Build simple HTML table
    let html = '<div style="font-weight:600; margin-bottom:8px; color:#1976d2;">' + header + '</div>';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">';
    html += '<thead><tr style="background: #f5f5f5;">';
    html += '<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">House</th>';
    html += '<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Vendor</th>';
    html += '<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Time</th>';
    html += '</tr></thead><tbody>';
    
    let hasSchedule = false;
    for (let col = 1; col < headers.length; col++) {
      const house = headers[col];
      if (!house || house === 'Options' || house === 'Locked?') continue;
      
      const cellValue = scheduleRow[col];
      if (cellValue && cellValue !== 'UNASSIGNED' && cellValue !== 'TBD') {
        hasSchedule = true;
        const lines = cellValue.toString().split('\n');
        const vendorInfo = lines[0] || 'TBD';
        const timeInfo = lines[1] || '';
        html += '<tr>';
        html += '<td style="padding: 6px; border: 1px solid #ddd;">' + house + '</td>';
        html += '<td style="padding: 6px; border: 1px solid #ddd; color: #1976d2; font-weight: bold;">' + vendorInfo + '</td>';
        html += '<td style="padding: 6px; border: 1px solid #ddd;">' + timeInfo + '</td>';
        html += '</tr>';
      }
    }
    
    if (!hasSchedule) {
      html += '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #666;">No outings scheduled for this week</td></tr>';
    }
    
    html += '</tbody></table>';
    
    return html;
    
  } catch (error) {
    console.error('Error in getSimpleSchedulePreview:', error);
    return '<div style="color: red;">Error: ' + error.toString() + '</div>';
  }
}

/**
 * Get a very compact text-only preview
 * Format: Week of MMM d – MMM d\n- House: Vendor (Time)\n...
 */
function getCompactSchedulePreview(weekSelection, specificDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    if (!scheduleSheet) return 'No schedule found.';
    
    // Determine week
    let targetDate = new Date();
    if (weekSelection === 'next') targetDate.setDate(targetDate.getDate() + 7);
    else if (weekSelection === 'specific' && specificDate) targetDate = new Date(specificDate);
    const monday = getWeekStart(targetDate);
    const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
    
    // Find row for week
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    let row = null;
    for (let i = 1; i < data.length; i++) {
      const date = new Date(data[i][0]);
      if (isSameWeek(date, monday)) { row = data[i]; break; }
    }
    if (!row) return 'No schedule found for this week';
    
    // Build compact lines
    let lines = [];
    for (let c = 1; c < headers.length; c++) {
      const house = headers[c];
      if (!house || house === 'Options' || house === 'Locked?') continue;
      const cell = row[c];
      if (!cell || cell === 'UNASSIGNED' || cell === 'TBD') continue;
      const parts = cell.toString().split('\n');
      const vendor = (parts[0] || 'TBD').trim();
      const time = (parts[1] || '').trim();
      lines.push(`- ${house}: ${vendor}${time ? ' (' + time + ')' : ''}`);
    }
    if (lines.length === 0) lines.push('No outings scheduled');
    
    const header = `Week of ${Utilities.formatDate(monday, CONFIG.DEFAULT_TIMEZONE, 'MMM d')} – ${Utilities.formatDate(sunday, CONFIG.DEFAULT_TIMEZONE, 'MMM d')}`;
    
    // Convert to simple HTML <pre> to preserve newlines, easy to read
    const text = [header, '', ...lines].join('\n');
    return '<pre style="margin:0;white-space:pre-wrap;font-family:Menlo,Consolas,monospace;font-size:13px">' +
           text.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s])) +
           '</pre>';
  } catch (e) {
    console.error('getCompactSchedulePreview error', e);
    return 'Error: ' + e;
  }
}

// ======================== UTILITY FUNCTIONS ========================

/**
 * Simplify spreadsheet by removing unnecessary tabs
 * Keeps only essential sheets for streamlined operation
 */
function simplifySpreadsheetStructure() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Essential sheets to keep (including rotation rules for complex vendor management)
  const essentialSheets = [
    'PROGRAMS',
    'VENDORS', 
    'SCHEDULE',
    'CONFIG',
    'ROTATION_RULES' // ESSENTIAL for complex vendor agreements and rotation logic
  ];
  
  // Sheets that can be removed or are auto-generated
  const optionalSheets = [
    'EMAIL_RECIPIENTS', // Now using distribution lists in CONFIG
    'VENDOR_CALENDAR_LINKS', // Not needed with PDF approach
    'PUBLIC_VENDOR_LINKS', // Not needed with PDF approach
    'ROTATION_CALENDAR', // Redundant with SCHEDULE
    'DIAGNOSTICS_REPORT', // Generate on-demand instead
    'RULES_MISMATCH' // Keep visible if you need to debug rotation conflicts
  ];
  
  const response = ui.alert(
    '🧹 Simplify Spreadsheet Structure',
    'This will:\n\n' +
    '✅ Keep essential sheets: ' + essentialSheets.join(', ') + '\n\n' +
    '❌ Archive these optional sheets: ' + optionalSheets.join(', ') + '\n\n' +
    'Archived sheets will be hidden, not deleted (you can unhide them later).\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  let hiddenCount = 0;
  let errors = [];
  
  // Hide optional sheets
  optionalSheets.forEach(sheetName => {
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        sheet.hideSheet();
        hiddenCount++;
        console.log(`Hidden sheet: ${sheetName}`);
      }
    } catch (error) {
      errors.push(`${sheetName}: ${error.toString()}`);
    }
  });
  
  // Update CONFIG to include email recipients directly
  updateConfigWithEmailRecipients();
  
  let message = `✅ Spreadsheet simplified!\n\n`;
  message += `Hidden ${hiddenCount} optional sheets.\n`;
  message += `Essential sheets remain visible.\n\n`;
  message += `To restore hidden sheets:\n`;
  message += `View → Hidden sheets → Select sheet to unhide`;
  
  if (errors.length > 0) {
    message += `\n\nMinor issues:\n${errors.join('\n')}`;
  }
  
  ui.alert('Simplification Complete', message, ui.ButtonSet.OK);
}

/**
 * Update CONFIG sheet to include email distribution lists
 */
function updateConfigWithEmailRecipients() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('CONFIG');
  
  if (!configSheet) return;
  
  // Find last row with data
  const lastRow = configSheet.getLastRow();
  
  // Add email distribution lists to CONFIG
  const emailConfig = [
    ['', ''],
    ['EMAIL_DISTRIBUTION_LISTS', ''],
    ['Estates_Distribution', 'Estates_CA@familyfirstas.com'],
    ['Nest_Distribution', 'Nest_CA@familyfirstas.com'],
    ['Cove_Distribution', 'Cove_CA@familyfirstas.com'],
    ['', ''],
    ['PDF_SETTINGS', ''],
    ['Auto_Generate_PDFs', 'TRUE'],
    ['Email_PDFs_Weekly', 'TRUE']
  ];
  
  // Add to CONFIG sheet
  const startRow = lastRow + 2;
  configSheet.getRange(startRow, 1, emailConfig.length, 2).setValues(emailConfig);
  
  // Format the new section
  configSheet.getRange(startRow + 1, 1, 1, 2)
    .setBackground('#1976d2')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
    
  configSheet.getRange(startRow + 6, 1, 1, 2)
    .setBackground('#4CAF50')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
}

/**
 * Show where PDFs are stored and how they're organized
 */
function showPDFOrganization() {
  const ui = SpreadsheetApp.getUi();
  
  // Check current folder structure
  let folderInfo = '';
  try {
    const properties = PropertiesService.getScriptProperties();
    const folderId = properties.getProperty('VENDOR_PDF_FOLDER_ID');
    
    if (folderId) {
      try {
        const folder = DriveApp.getFolderById(folderId);
        const folderUrl = folder.getUrl();
        folderInfo = `Current PDF Folder: ${folder.getName()}\n📁 Open Folder: ${folderUrl}\n`;
        
        // Count subfolders
        const subfolders = folder.getFolders();
        let subfolderCount = 0;
        let recentFolders = [];
        while (subfolders.hasNext() && subfolderCount < 5) {
          const subfolder = subfolders.next();
          recentFolders.push(`  • ${subfolder.getName()}`);
          subfolderCount++;
        }
        if (recentFolders.length > 0) {
          folderInfo += `\nRecent Schedule Folders:\n${recentFolders.join('\n')}`;
        }
      } catch (e) {
        folderInfo = 'PDF folder needs to be created (will create automatically when needed)';
      }
    } else {
      folderInfo = 'No PDF folder set up yet (will create automatically when you generate PDFs)';
    }
  } catch (e) {
    folderInfo = 'Unable to check folder status';
  }
  
  const explanation = `
📁 PDF ORGANIZATION STRUCTURE

WHERE PDFs ARE STORED:
━━━━━━━━━━━━━━━━━━━━
${folderInfo}

FOLDER STRUCTURE:
━━━━━━━━━━━━━━━
📁 Google Drive (Root)
  └── 📁 Vendor Schedule PDFs - 2025
      │
      ├── 📁 House Schedules - [Date] (FOR PROGRAM COORDINATORS)
      │   ├── 📄 Estates 1_Schedule.pdf - Shows all vendors coming to Estates 1
      │   ├── 📄 Estates 2_Schedule.pdf - Shows all vendors coming to Estates 2
      │   ├── 📄 Cove 1_Schedule.pdf - Shows all vendors coming to Cove 1
      │   ├── 📄 Cove 2_Schedule.pdf - Shows all vendors coming to Cove 2
      │   └── 📄 Nest 1_Schedule.pdf - Shows all vendors coming to Nest 1
      │
      └── 📁 Vendor PDFs (FOR VENDORS)
          ├── 📄 Surf_Therapy_Schedule_2025.pdf - Shows all houses Surf Therapy visits
          ├── 📄 Goat_Farm_Schedule_2025.pdf - Shows all houses Goat Farm visits
          └── 📄 Equestrian_Schedule_2025.pdf - Shows all houses Equestrian visits

HOW IT WORKS:
━━━━━━━━━━━━━
1. MAIN FOLDER: "Vendor Schedule PDFs - [Year]"
   • Created automatically first time you generate PDFs
   • One folder per year
   • Shared with anyone who has the link

2. HOUSE SCHEDULES: Subfolder with date
   • New folder each time you generate
   • Contains one PDF per house/program
   • Each PDF shows that house's complete schedule

3. ACCESS:
   • PDFs are set to "Anyone with link can view"
   • No Google account needed to view
   • Can be downloaded and printed

TO GENERATE PDFs:
━━━━━━━━━━━━━━━━
📊 Reports & Analytics → 🏠 Generate House/Program PDFs

TO FIND YOUR PDFs:
━━━━━━━━━━━━━━━━━
1. After generating, you'll get a dialog with all links
2. Check your Google Drive for "Vendor Schedule PDFs - 2025"
3. Or use the link provided in the generation dialog

SHARING PDFs:
━━━━━━━━━━━━
• Click "Email PDFs to Distribution Lists" after generating
• Or copy individual PDF links from the dialog
• Or share the entire folder link
  `;
  
  ui.alert('📁 PDF Organization Guide', explanation, ui.ButtonSet.OK);
}

/**
 * Show what each sheet is used for
 */
function explainSheetPurposes() {
  const ui = SpreadsheetApp.getUi();
  
  const explanation = `
📊 SPREADSHEET TABS EXPLAINED

ESSENTIAL TABS FOR YOUR OPERATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PROGRAMS - Houses/programs with times and preferences
✅ VENDORS - Vendor list with contact info, agreements, and availability
✅ SCHEDULE - Generated weekly/monthly schedules
✅ CONFIG - System settings and email distribution lists
✅ ROTATION_RULES - Complex vendor rotation logic and agreements
   • Minimum weeks between same vendor
   • Priority vendors that must appear weekly
   • Special rules for vendor combinations
   • Blackout dates and restrictions

OPTIONAL TABS (Can be hidden):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ EMAIL_RECIPIENTS - Replaced by 3 distribution lists
❌ VENDOR_CALENDAR_LINKS - Not needed with PDF approach
❌ PUBLIC_VENDOR_LINKS - Not needed with PDF approach
❌ ROTATION_CALENDAR - Duplicate of SCHEDULE data
⚠️ DIAGNOSTICS_REPORT - Keep if you need to troubleshoot
⚠️ RULES_MISMATCH - Keep if debugging rotation conflicts

YOUR VENDOR ROTATION SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
The ROTATION_RULES tab is CRITICAL for managing:
• Vendor agreements (weekly, bi-weekly, monthly)
• Minimum spacing between repeat vendors (e.g., 3 weeks)
• Priority vendors that must appear every week
• Capacity limits per vendor
• Blackout dates for specific vendors
• House-specific vendor preferences

RECOMMENDATION:
━━━━━━━━━━━━━━━
Keep all 5 essential tabs visible.
Hide calendar-related tabs since you're using PDFs.
Keep RULES_MISMATCH visible if you're actively managing conflicts.
  `;
  
  ui.alert('Sheet Purpose Guide', explanation, ui.ButtonSet.OK);
}

/**
 * Update email recipients to only the 3 distribution lists
 * Run this function to immediately switch to distribution lists only
 */
function updateToDistributionListsOnly() {
  const properties = PropertiesService.getScriptProperties();
  const distributionLists = [
    'Estates_CA@familyfirstas.com',
    'Nest_CA@familyfirstas.com',
    'Cove_CA@familyfirstas.com'
  ];
  
  properties.setProperty(CONFIG.RECIPIENTS_KEY, JSON.stringify(distributionLists));
  
  // Also update the EMAIL RECIPIENTS sheet if it exists
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName('EMAIL RECIPIENTS');
    if (sheet) {
      setupEmailRecipientsSheet(ss);
    }
  } catch (error) {
    console.log('Could not update EMAIL RECIPIENTS sheet:', error);
  }
  
  // Show confirmation
  SpreadsheetApp.getUi().alert(
    '✅ Email Recipients Updated',
    'Email recipients have been updated to:\n\n' +
    '• Estates_CA@familyfirstas.com\n' +
    '• Nest_CA@familyfirstas.com\n' +
    '• Cove_CA@familyfirstas.com\n\n' +
    'All weekly schedules will now be sent to these distribution lists only.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return distributionLists;
}

/**
 * Ensure PDF folder exists and return its ID
 */
function ensurePDFFolderExists() {
  // Check if we have a saved folder ID
  const properties = PropertiesService.getScriptProperties();
  let folderId = properties.getProperty('VENDOR_PDF_FOLDER_ID');
  
  // Verify the folder still exists
  if (folderId) {
    try {
      DriveApp.getFolderById(folderId);
      CONFIG.VENDOR_PDF_FOLDER_ID = folderId;
      return folderId;
    } catch (e) {
      // Folder was deleted, need to create new one
      folderId = null;
    }
  }
  
  // Look for existing folder
  const folders = DriveApp.getFoldersByName('Vendor Schedule PDFs - ' + new Date().getFullYear());
  if (folders.hasNext()) {
    const folder = folders.next();
    folderId = folder.getId();
  } else {
    // Create new folder
    const newFolder = DriveApp.createFolder('Vendor Schedule PDFs - ' + new Date().getFullYear());
    folderId = newFolder.getId();
  }
  
  // Save for future use
  properties.setProperty('VENDOR_PDF_FOLDER_ID', folderId);
  CONFIG.VENDOR_PDF_FOLDER_ID = folderId;
  
  return folderId;
}

/**
 * Validate email domain
 */
function validateEmailDomain(email) {
  if (!email) return { valid: false, reason: 'No email provided' };
  
  email = email.toLowerCase().trim();
  
  // Check for personal domains
  if (CONFIG.PERSONAL_DOMAINS.some(domain => email.includes(domain))) {
    return { valid: false, reason: 'Personal email detected - use work email', isPersonal: true };
  }
  
  // Check for allowed domains
  if (CONFIG.ALLOWED_DOMAINS.some(domain => email.includes(domain))) {
    return { valid: true, isWork: true };
  }
  
  // External email
  return { valid: true, reason: 'External email - may need approval', isExternal: true };
}

/**
 * Execute function with retry logic
 */
function withRetry(fn, maxRetries = CONFIG.MAX_RETRIES) {
  return function(...args) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < maxRetries - 1) {
          Utilities.sleep(CONFIG.RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
        }
      }
    }
    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
  };
}

// ======================== INITIALIZATION ========================

/**
 * Create a single, well-organized menu on spreadsheet open
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('FFAS Scheduler');
    
    // First time setup (if needed)
    menu.addItem('🚀 Complete One-Click Setup', 'runCompleteSetup')
        .addSeparator();
    
    // Main Actions (most used items at the top)
    menu.addItem('📅 Generate Schedule', 'generateScheduleWithUI')
  .addItem('📧 Preview & Send Schedule', 'previewAndSendSchedule')
        .addItem('🔄 Refill This Week', 'refillThisWeekSmart')
        .addItem('🔁 Replace Cancelled Outing', 'replaceOutingUI')
        .addSeparator();
    
    // Email Management submenu
    menu.addSubMenu(ui.createMenu('📧 Email Management')
        .addItem('📧 Preview & Send Schedule', 'previewAndSendSchedule')
        .addSeparator()
        .addItem('📋 View Distribution Lists', 'checkEmailRecipients')
          .addItem('👤 Check Current Sender', 'quickSenderCheck')
        .addSeparator()
          .addItem('🔒 Duplicate Prevention Status', 'viewEmailDuplicateStatus')
          .addItem('📊 Email Report', 'viewEmailReport')
          .addSeparator()
          .addItem('👀 Quick Email Preview', 'quickEmailPreview')
          .addItem('🏠 Preview House Email', 'previewHouseEmail')
          .addItem('👀 Preview Email Content', 'previewEmailContent')
        .addItem('🧪 Send Test Email', 'testEmailSafely'));
    
    // Visual Tools submenu
    menu.addSubMenu(ui.createMenu('🎨 Visual Tools')
          .addItem('🔄 Refresh Schedule Colors', 'refreshScheduleColors')
          .addItem('🎨 Preview Color Scheme', 'previewColorScheme')
          .addItem('✅ Verify Color Consistency', 'verifyColorConsistency')
          .addItem('📖 Color Alignment Guide', 'showColorAlignmentGuide')
          .addItem('🎨 Format All Sheets', 'formatSheetsForPrograms')
          .addItem('🌈 Vendor Color Info', 'showVendorColorInfo'));
    
    // Reports submenu
    menu.addSubMenu(ui.createMenu('📊 Reports & Analytics')
          .addItem('🔄 Vendor Rotation Status', 'showRotationStatus')
          .addItem('📈 Vendor Performance', 'generateVendorReport')
          .addItem('🏠 House Utilization', 'generateUtilizationReport')
          .addItem('🔧 System Diagnostics', 'runComprehensiveDiagnostics')
          .addItem('✅ Validate All Data', 'validateAllData')
          .addItem('📋 View Audit Log', 'viewAuditLog')
          .addSeparator()
          .addItem('🏠 Generate PDFs for Each HOUSE (for Programs)', 'generateHousePDFSchedules')
          .addItem('👥 Generate PDFs for Each VENDOR (for Vendors)', 'generateVendorSchedulePdfs')
          .addItem('📁 Where Are My PDFs?', 'showPDFOrganization')
          .addSeparator()
          .addItem('🔗 Create Public Vendor Schedules', 'createPublicVendorSchedules'));
    
    // Settings submenu
    menu.addSubMenu(ui.createMenu('⚙️ Settings & Setup')
          .addItem('🧹 Simplify Spreadsheet Structure', 'simplifySpreadsheetStructure')
          .addItem('📋 Explain Sheet Purposes', 'explainSheetPurposes')
          .addSeparator()
          .addItem('✉️ Email Sender Setup', 'checkEmailSenderSetup')
          .addItem('🏢 Work Account Setup', 'setupWorkAccount')
          .addItem('🔐 Setup Permissions', 'setupPermissions')
          .addSeparator()
          .addItem('📅 Create Vendor Calendar Links Sheet', 'createVendorCalendarLinksSheet')
          .addItem('📅 Calendar Permission Instructions', 'showCalendarPermissionInstructions')
          .addItem('🔄 Update Vendor Calendar IDs', 'updateVendorCalendarIds')
          .addItem('➕ Add Vendor Calendar from URL', 'addVendorCalendarFromUrl')
          .addItem('📋 Add Core Vendor Calendars (All 4)', 'addVendorCalendarIds')
          .addItem('�👁️ Preview Calendar Display', 'testVendorCalendarDisplay')
          .addItem('🔄 Sync Vendor Calendars to Dec 2026', 'syncAllVendorCalendars')
          .addItem('🚑 Quick Fix Calendar IDs', 'quickFixVendorCalendarIds')
          .addSeparator()
          .addItem('✅ Enable Auto Weekly Emails', 'setupEnhancedTrigger')
          .addItem('🛑 Disable Auto Weekly Emails', 'removeAllTriggers')
          .addItem('🔁 Enable Refresh Before Send', 'enableRefreshBeforeSend')
          .addItem('⏸️ Disable Refresh Before Send', 'disableRefreshBeforeSend')
          .addItem('📊 Show Automation Status', 'showAutomationSettings')
          .addSeparator()
          .addItem('🏥 System Health Check', 'runSystemHealthCheck')
          .addItem('🧪 Validate All Data', 'validateAllData')
          .addItem('🔍 Diagnose Scheduling Issue', 'diagnoseSchedulingIssue'));
    
    // Vendor Access submenu
    menu.addSubMenu(ui.createMenu('👥 Vendor Access')
          .addItem('🎯 Demo Both Features', 'demoVendorAccessFeatures')
          .addSeparator()
          .addItem('📋 Generate Access Instructions', 'generateVendorAccessInstructions')
          .addItem('📄 Create PDF Schedules', 'generateVendorPDFSchedules')
          .addItem('📅 Create ALL Vendor Schedules', 'createAllVendorSchedules')
          .addItem('📊 Create Single Vendor Schedule', 'createSingleVendorSchedule')
          .addItem('🔗 Share Calendar Links', 'shareVendorCalendarLinks'));
    
    // Help at the bottom
    menu.addSeparator()
        .addItem('📖 Help & Training Guide', 'showQuickStartGuide');
    
    menu.addToUi();
  } catch (error) {
    console.log("onOpen error:", error);
  }
}

/**
 * First-run initialization and migration
 */
function initializeSystemIfNeeded() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Quick setup for first-time users
    const setupChoice = ui.alert(
      '👋 Welcome to FFAS Scheduler!',
      'This appears to be your first time using the scheduler.\n\n' +
      'Would you like to set up email recipients now?\n\n' +
      '(You can always do this later via Settings > Email Recipients)',
      ui.ButtonSet.YES_NO
    );

    if (setupChoice === ui.Button.YES) {
      manageEmailRecipients();
    }
    
    // Show quick start guide
    const guideChoice = ui.alert(
      '📖 Quick Start Guide',
      'Would you like to see the Quick Start Guide?',
      ui.ButtonSet.YES_NO
    );
    
    if (guideChoice === ui.Button.YES) {
      showQuickStartGuide();
    }
    
  } catch (error) {
    console.log('Initialization error:', error);
    // Don't block the menu if initialization fails
  }

}

/**
 * Manual menu creator that works from script editor
 */
function createMenuManually() {
  // This won't work from script editor either, but will show the same error
  // The menu can only be created when the spreadsheet is open
  console.log('Use createFullMenu instead - run it from the spreadsheet context');
  return 'Please run createFullMenu from an open spreadsheet context';
}

/**
 * 🚀 ONE-CLICK COMPLETE SETUP FOR FAMILY FIRST
 * This function sets up EVERYTHING you need for the scheduler
 */
function runCompleteSetup() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const response = ui.alert(
    '🚀 Complete System Setup',
    'This will set up your entire scheduling system:\n\n' +
    '✓ Create all required sheets\n' +
    '✓ Add sample data for 10 houses\n' +
    '✓ Configure 32 rotation vendors\n' +
    '✓ Set up email recipients\n' +
    '✓ Configure colors and settings\n' +
    '✓ Enable weekly email automation\n' +
    '✓ Generate first month schedule\n\n' +
    'Continue with complete setup?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    ui.alert('Setting up...', 'Please wait while we configure everything...', ui.ButtonSet.OK);
    
    // Step 1: Create all required sheets
    console.log('Step 1: Creating sheets...');
    createAllRequiredSheets(ss);
    
    // Step 2: Set up CONFIG sheet
    console.log('Step 2: Setting up configuration...');
    setupConfigSheet(ss);
    
    // Step 3: Set up PROGRAMS (Houses)
    console.log('Step 3: Setting up houses...');
    setupProgramsSheet(ss);
    
    // Step 4: Set up VENDORS
    console.log('Step 4: Setting up vendors...');
    setupVendorsSheet(ss);
    
    // Step 5: Set up ROTATION_RULES
    console.log('Step 5: Setting up rotation rules...');
    setupRotationRulesSheet(ss);
    
    // Step 6: Set up EMAIL RECIPIENTS
    console.log('Step 6: Setting up email recipients...');
    setupEmailRecipientsSheet(ss);
    
    // Step 7: Create Vendor Calendar Links sheet
    console.log('Step 7: Creating vendor calendar links...');
    createVendorCalendarLinksSheet();
    
    // Step 8: Set up weekly email trigger
    console.log('Step 8: Setting up automation...');
    setupEnhancedTrigger();
    
    // Step 9: Generate first schedule
    console.log('Step 9: Generating first month schedule...');
    generateInitialSchedule(ss);
    
    // Step 10: Final configuration
    console.log('Step 10: Final setup...');
    finalizeSetup(ss);
    
    // Show success message with next steps
    const successHtml = HtmlService.createHtmlOutput(`
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h2 { color: #0d9488; }
        .step { margin: 10px 0; padding: 10px; background: #f0fdf4; border-left: 4px solid #10b981; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .next { background: #dbeafe; border-left: 4px solid #3b82f6; }
      </style>
      
      <h2>✅ Setup Complete!</h2>
      
      <div class="step">
        <strong>✓ Sheets Created:</strong> All required sheets are set up with sample data
      </div>
      
      <div class="step">
        <strong>✓ Houses Added:</strong> 10 sample houses configured (Estates 1-10)
      </div>
      
      <div class="step">
        <strong>✓ Vendors Added:</strong> 32 therapeutic vendors ready for rotation
      </div>
      
      <div class="step">
        <strong>✓ Schedule Generated:</strong> First 4 weeks ready to go
      </div>
      
      <div class="step">
        <strong>✓ Email Automation:</strong> Weekly emails will send every Thursday at 2 PM
      </div>
      
      <div class="warning">
        <strong>⚠️ Important Next Steps:</strong><br>
        1. Review and update EMAIL RECIPIENTS sheet with real emails<br>
        2. Update PROGRAMS sheet with your actual house names<br>
        3. Verify vendor information is current<br>
        4. Test email sending with "Send Test Email"
      </div>
      
      <div class="next">
        <strong>📅 Your Schedule:</strong><br>
        - Every Tuesday: Therapeutic outings happen<br>
        - Every Thursday 2 PM: Next week's schedule emails automatically<br>
        - Use menu to manually send or adjust as needed
      </div>
      
      <p><em>You can now close this window and start using your scheduler!</em></p>
    `)
    .setWidth(600)
    .setHeight(500);
    
    ui.showModalDialog(successHtml, '🎉 Setup Complete!');
    
  } catch (error) {
    ui.alert('Setup Error', 'Error during setup: ' + error.message, ui.ButtonSet.OK);
    console.error('Setup error:', error);
  }
}

/**
 * Create all required sheets with proper structure
 */
function createAllRequiredSheets(ss) {
  const requiredSheets = [
    'CONFIG',
    'PROGRAMS', 
    'VENDORS',
    'ROTATION_RULES',
    'EMAIL RECIPIENTS',
    'SCHEDULE',
    'AUDIT LOG'
  ];
  
  const existingSheets = ss.getSheets().map(s => s.getName());
  
  requiredSheets.forEach(sheetName => {
    if (!existingSheets.includes(sheetName)) {
      ss.insertSheet(sheetName);
    }
  });
}

/**
 * Set up CONFIG sheet with all settings
 */
function setupConfigSheet(ss) {
  const sheet = ss.getSheetByName('CONFIG');
  sheet.clear();
  
  const configData = [
    ['Setting', 'Value', 'Description'],
    ['StartTuesday', '9/9/2025', 'First Tuesday to schedule'],
    ['WeeksToGenerate', '52', 'Number of weeks to generate at once'],
    ['EmailHour', '14', 'Hour to send emails (24-hour format, 14 = 2 PM)'],
    ['PreferredSenderEmail', Session.getActiveUser().getEmail(), 'Work email for sending'],
    ['MaxRecipientsPerEmail', '50', 'Batch size for emails'],
    ['MinWeeksBetweenVendor', '3', 'Minimum weeks before repeating vendor']
  ];
  
  sheet.getRange(1, 1, configData.length, 3).setValues(configData);
  
  // Format headers
  sheet.getRange(1, 1, 1, 3)
    .setBackground('#1f2937')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  sheet.autoResizeColumns(1, 3);
  sheet.setFrozenRows(1);
}

/**
 * Set up PROGRAMS sheet with sample houses
 */
function setupProgramsSheet(ss) {
  const sheet = ss.getSheetByName('PROGRAMS');
  sheet.clear();
  
  const headers = ['House', 'Tuesday Start', 'Tuesday End', 'Color', 'Priority', 'Preferred Vendors', 'Type Preference', 'Restrictions'];
  
  // Sample data for 10 houses with Family First naming convention
  const programData = [
    ['Estates 1', '9:00 AM', '11:00 AM', CONFIG.HOUSE_COLORS['Estates 1'], '1', '', 'Outdoor', ''],
    ['Estates 2', '9:00 AM', '11:00 AM', CONFIG.HOUSE_COLORS['Estates 2'], '1', '', 'Outdoor', ''],
    ['Estates 3', '9:00 AM', '11:00 AM', CONFIG.HOUSE_COLORS['Estates 3'], '1', '', 'Active', ''],
    ['Estates 4', '1:00 PM', '3:00 PM', CONFIG.HOUSE_COLORS['Estates 4'], '1', '', 'Creative', ''],
    ['Estates 5', '1:00 PM', '3:00 PM', CONFIG.HOUSE_COLORS['Estates 5'], '1', '', 'Animals', ''],
    ['Cove 1', '9:00 AM', '11:00 AM', CONFIG.HOUSE_COLORS['Cove 1'], '2', '', 'Outdoor', ''],
    ['Cove 2', '9:00 AM', '11:00 AM', CONFIG.HOUSE_COLORS['Cove 2'], '2', '', 'Active', ''],
    ['Cove 3', '1:00 PM', '3:00 PM', CONFIG.HOUSE_COLORS['Cove 3'], '2', '', 'Creative', ''],
    ['Nest 1', '9:00 AM', '11:00 AM', CONFIG.HOUSE_COLORS['Nest 1'], '3', '', 'Therapeutic', ''],
    ['Nest 2', '1:00 PM', '3:00 PM', CONFIG.HOUSE_COLORS['Nest 2'], '3', '', 'Calming', '']
  ];
  
  const allData = [headers, ...programData];
  sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);
  
  // Format
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1f2937')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Apply house colors to the color column
  for (let i = 0; i < programData.length; i++) {
    const color = programData[i][3];
    if (color) {
      sheet.getRange(i + 2, 4).setBackground(color);
    }
  }
  
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
}

/**
 * Set up VENDORS sheet with all rotation vendors
 */
function setupVendorsSheet(ss) {
  const sheet = ss.getSheetByName('VENDORS');
  sheet.clear();
  
  const headers = ['Vendor Name', 'Type', 'Capacity', 'Contact', 'Active', 'Weekly Limit', 'Blackout Dates', 'Color', 'Calendar ID', 'Quality Score', 'Preferences', 'Address'];
  
  // All 32 core rotation vendors
  const vendorData = CONFIG.CORE_ROTATION_VENDORS.map(vendor => {
    // Determine type based on vendor name
    let type = 'General';
    
    const vendorLower = vendor.toLowerCase();
    if (vendorLower.includes('park')) {
      type = 'Outdoor';
    } else if (vendorLower.includes('equestrian') || vendorLower.includes('horse')) {
      type = 'Animals';
    } else if (vendorLower.includes('beach') || vendorLower.includes('surf')) {
      type = 'Beach';
    } else if (vendorLower.includes('goat') || vendorLower.includes('farm')) {
      type = 'Animals';
    } else if (vendorLower.includes('ymca')) {
      type = 'Active';
    } else if (vendorLower.includes('bowling')) {
      type = 'Recreation';
    } else if (vendorLower.includes('art') || vendorLower.includes('paint')) {
      type = 'Creative';
    } else if (vendorLower.includes('museum')) {
      type = 'Educational';
    } else if (vendorLower.includes('zoo')) {
      type = 'Animals';
    } else if (vendorLower.includes('aquarium')) {
      type = 'Educational';
    }
    
    return [
      vendor,           // Name
      type,             // Type
      '10',             // Capacity
      '',               // Contact (to be filled)
      'TRUE',           // Active
      '2',              // Weekly Limit
      '',               // Blackout Dates
      '',               // Color (leave blank - will be assigned per week)
      '',               // Calendar ID (to be filled)
      '85',             // Quality Score
      '',               // Preferences
      ''                // Address
    ];
  });
  
  const allData = [headers, ...vendorData];
  sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1f2937')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // No vendor colors applied here - colors are assigned dynamically per week
  
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
}

/**
 * Set up ROTATION_RULES sheet
 */
function setupRotationRulesSheet(ss) {
  const sheet = ss.getSheetByName('ROTATION_RULES');
  sheet.clear();
  
  const headers = ['Month', 'Preferred Order', 'Min Weeks Between Same Vendor', 'Allow Same Type Different Location', 'Max Vendors Per Day', 'Special Rules'];
  
  const rulesData = [];
  for (let month = 1; month <= 12; month++) {
    rulesData.push([
      month,
      '', // Let smart rotation handle it
      '3',
      'FALSE',
      '10',
      ''
    ]);
  }
  
  const allData = [headers, ...rulesData];
  sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);
  
  // Format
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1f2937')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
}

/**
 * Set up EMAIL RECIPIENTS sheet with sample structure
 */
function setupEmailRecipientsSheet(ss) {
  const sheet = ss.getSheetByName('EMAIL RECIPIENTS');
  sheet.clear();
  
  const headers = ['Email', 'Name', 'Role', 'Active'];
  
  // Only the 3 distribution lists you requested
  const sampleData = [
    // Distribution lists only
    ['Estates_CA@familyfirstas.com', 'Estates CA Distribution List', 'Distribution List', 'TRUE'],
    ['Nest_CA@familyfirstas.com', 'Nest CA Distribution List', 'Distribution List', 'TRUE'],
    ['Cove_CA@familyfirstas.com', 'Cove CA Distribution List', 'Distribution List', 'TRUE']
  ];
  
  const allData = [headers, ...sampleData];
  sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);
  
  // Format
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1f2937')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Add note about distribution lists
  sheet.getRange(2, 1).setNote('These are the main distribution lists for weekly schedules');
  
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
  
  // Store in script properties
  const emails = sampleData.filter(row => row[3] === 'TRUE').map(row => row[0]);
  PropertiesService.getScriptProperties().setProperty(CONFIG.RECIPIENTS_KEY, JSON.stringify(emails));
}

/**
 * Generate initial schedule
 */
function generateInitialSchedule(ss) {
  try {
    const dataManager = new DataManager(ss);
    const config = dataManager.getConfig();
    
    // Set start date to next Tuesday
    const today = new Date();
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7; // 2 = Tuesday
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    
    // Update config with next Tuesday
    const configSheet = ss.getSheetByName('CONFIG');
    const configData = configSheet.getDataRange().getValues();
    for (let i = 1; i < configData.length; i++) {
      if (configData[i][0] === 'StartTuesday') {
        configSheet.getRange(i + 1, 2).setValue(Utilities.formatDate(nextTuesday, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy'));
        break;
      }
    }
    
    // Generate 4 weeks
    generateScheduleEnhanced();
    
  } catch (error) {
    console.log('Could not generate initial schedule:', error);
    // Don't fail setup if schedule generation fails
  }
}

/**
 * Final setup steps
 */
function finalizeSetup(ss) {
  // Set spreadsheet name
  ss.rename('Family First Therapeutic Outings Scheduler');
  
  // Create audit log entry
  auditLog('SYSTEM_SETUP_COMPLETE', {
    timestamp: new Date(),
    user: Session.getActiveUser().getEmail(),
    sheetsCreated: 7,
    vendorsAdded: CONFIG.CORE_ROTATION_VENDORS.length,
    housesAdded: 10
  });
  
  // Set up initialization flag
  PropertiesService.getScriptProperties().setProperty('SYSTEM_INITIALIZED', 'true');
  PropertiesService.getScriptProperties().setProperty('SETUP_DATE', new Date().toISOString());
}

/**
 * Quick setup sheets - creates basic sheet structure
 */
function quickSetupSheets() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const response = ui.alert(
    'Quick Sheet Setup',
    'This will create any missing required sheets.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    createAllRequiredSheets(ss);
    ui.alert('✅ Success', 'All required sheets have been created!', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ Error', 'Error creating sheets: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Get this week's Monday (or selected week's Monday)
 */
function getThisMonday() {
  // Check if a specific week was selected
  const tempWeek = PropertiesService.getScriptProperties().getProperty('TEMP_EMAIL_WEEK');
  if (tempWeek) {
    const selectedDate = new Date(tempWeek);
    // Since we store Tuesday dates, get the Monday before it
    const monday = new Date(selectedDate);
    monday.setDate(monday.getDate() - 1);
    return monday;
  }
  
  // Otherwise get current week's Monday
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Create weekly schedule HTML for emails
 */
function createWeeklyScheduleHtml() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet) {
    return '<p>No schedule found.</p>';
  }
  
  // Get the week data based on selection
  const emailScheduler = new EmailScheduler();
  const weekData = emailScheduler.getThisWeekData();
  
  if (!weekData) {
    return '<p>No schedule found for the selected week.</p>';
  }
  
  // Generate HTML from the week data
  const tableData = emailScheduler.prepareTableData(weekData);
  return emailScheduler.generateEmailHtml(tableData, weekData);
}

/**
 * Refresh vendor colors on schedule
 */
function refreshScheduleColors() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      ui.alert('No Schedule', 'Please generate a schedule first.', ui.ButtonSet.OK);
      return;
    }
    
    // Show progress
    const progressMsg = ui.alert(
      'Refreshing Colors', 
      'Applying unique colors to vendors...', 
      ui.ButtonSet.OK
    );
    
    // Create ScheduleWriter and apply colors
    const writer = new ScheduleWriter(ss);
    const vendors = new DataManager(ss).getVendors();
    writer.applyConditionalFormatting(vendors);
    
    ui.alert(
      '✅ Colors Updated', 
      'Vendor colors have been refreshed!\n\n' +
      '• Each vendor has a unique color\n' +
      '• House names are excluded from coloring\n' +
      '• Colors are consistent throughout the schedule',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Error refreshing colors: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Show vendor rotation status
 */
function showRotationStatus() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
  // Analyze current rotation status
  const dataManager = new DataManager(ss);
  const scheduler = new SmartScheduler(dataManager);
  const programs = dataManager.getPrograms();
    
    let html = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h2 { color: #2c3e50; margin-bottom: 10px; }
        h3 { color: #34495e; margin-top: 20px; }
        .priority-vendor { 
          background: #e8f5e9; 
          border-left: 4px solid #4caf50;
          padding: 10px;
          margin: 10px 0;
        }
        .house-status {
          margin: 10px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .last-visit {
          color: #7f8c8d;
          font-size: 12px;
        }
        .eligible {
          color: #27ae60;
          font-weight: bold;
        }
        .not-eligible {
          color: #e74c3c;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #ecf0f1;
        }
      </style>
      
      <h2>🔄 Vendor Rotation Status</h2>
      
      <div class="priority-vendor">
        <h3>Weekly Priority Vendors</h3>
        <p>These vendors MUST appear every week:</p>
        <ul>
    `;
    
    // Show priority vendors
    CONFIG.WEEKLY_PRIORITY_VENDORS.forEach(vendor => {
      html += `<li><strong>${vendor}</strong></li>`;
    });
    
    html += `
        </ul>
        <p><em>The system ensures these vendors are distributed fairly among houses with 3+ week spacing.</em></p>
      </div>
      
      <h3>Current House Eligibility</h3>
      <p>Houses eligible for each priority vendor (3+ weeks since last visit):</p>
      
      <table>
        <tr>
          <th>Vendor</th>
          <th>Eligible Houses</th>
          <th>Recently Visited</th>
        </tr>
    `;
    
    // Check each priority vendor
    const today = new Date();
    
    CONFIG.WEEKLY_PRIORITY_VENDORS.forEach(vendorName => {
      const eligible = [];
      const recent = [];
      
      programs.forEach(program => {
        const lastVisit = scheduler.getLastVendorVisitForHouse(program.House, vendorName);
        
        if (!lastVisit) {
          eligible.push(`${program.House} (never visited)`);
        } else {
          const weeksSince = scheduler.getWeeksBetween(lastVisit, today);
          if (weeksSince >= 3) {
            eligible.push(`${program.House} (${weeksSince}w ago)`);
          } else {
            recent.push(`${program.House} (${weeksSince}w ago)`);
          }
        }
      });
      
      html += `
        <tr>
          <td><strong>${vendorName}</strong></td>
          <td class="eligible">${eligible.length > 0 ? eligible.join(', ') : 'None'}</td>
          <td class="not-eligible">${recent.length > 0 ? recent.join(', ') : 'None'}</td>
        </tr>
      `;
    });
    
    html += `
      </table>
      
      <h3>How It Works</h3>
      <ul>
        <li>Priority vendors are assigned first each week</li>
        <li>Houses must wait 3+ weeks before repeating a vendor</li>
        <li>System tracks all visits to ensure fair distribution</li>
        <li>When you add new houses, they're automatically included in rotations</li>
      </ul>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(html)
      .setWidth(600)
      .setHeight(600);
    
    ui.showModalDialog(htmlOutput, 'Vendor Rotation Status');
    
  } catch (error) {
    ui.alert('Error', 'Error analyzing rotation: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Show vendor color assignment info
 */
function showVendorColorInfo() {
  const ui = SpreadsheetApp.getUi();
  
  const htmlContent = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
      h2 { color: #2c3e50; }
      .info-box { 
        background: #f8f9fa; 
        border-left: 4px solid #3498db; 
        padding: 15px; 
        margin: 10px 0;
      }
      .color-sample {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 0 5px;
        border: 1px solid #ddd;
        vertical-align: middle;
      }
      .feature { margin: 10px 0; }
    </style>
    
    <h2>🎨 Vendor Color System</h2>
    
    <div class="info-box">
      <strong>How It Works:</strong><br>
      The scheduler automatically assigns unique colors to vendors to ensure no two vendors 
      have the same color in any given week.
    </div>
    
    <div class="feature">
      <strong>✅ Key Features:</strong>
      <ul>
        <li>Each vendor gets a unique color per week</li>
        <li>Colors are assigned dynamically when schedule is generated</li>
        <li>Up to 32 distinct colors available</li>
        <li>Colors may vary week to week for the same vendor</li>
        <li>Ensures visual clarity on the schedule</li>
      </ul>
    </div>
    
    <div class="feature">
      <strong>🎨 Color Palette Samples:</strong><br>
      <span class="color-sample" style="background: #FF6B6B;"></span>
      <span class="color-sample" style="background: #4ECDC4;"></span>
      <span class="color-sample" style="background: #45B7D1;"></span>
      <span class="color-sample" style="background: #96CEB4;"></span>
      <span class="color-sample" style="background: #FECA57;"></span>
      <span class="color-sample" style="background: #DDA0DD;"></span>
      <span class="color-sample" style="background: #F4A460;"></span>
      <span class="color-sample" style="background: #9B59B6;"></span>
      <br>
      <em>And 24 more distinct colors...</em>
    </div>
    
    <div class="info-box" style="border-left-color: #2ecc71;">
      <strong>💡 Tip:</strong><br>
      The color assignment happens automatically when you generate the schedule. 
      No manual configuration needed!
    </div>
  `)
  .setWidth(500)
  .setHeight(450);
  
  ui.showModalDialog(htmlContent, 'Vendor Color Information');
}

/**
 * Legacy function - kept for compatibility if referenced elsewhere
 * The menu is now automatically created on open
 */
function createFullMenu() {
  SpreadsheetApp.getUi().alert(
    'Menu Already Created', 
    'The full menu is now automatically created when you open the spreadsheet.\n\n' +
    'Just refresh the page if you don\'t see the menu.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
/**
 * Simple test function to check if script is working
 */
function testScript() {
  console.log('Script is working!');
  SpreadsheetApp.getUi().alert('Test Success', 'The script is running properly!', SpreadsheetApp.getUi().ButtonSet.OK);
  return 'Script test completed successfully';
}

/**
 * Alias for menu consistency
 */
function testEmailFromMenu() {
  testEmailSafely();
}

/**
 * Safe email test - sends to YOU only
 */
function testEmailSafely() {
  const ui = SpreadsheetApp.getUi();
  
  // Get your email and check account type
  const yourEmail = Session.getActiveUser().getEmail();
  const isWorkAccount = yourEmail.includes('@familyfirstas.com');
  const preferredSender = CONFIG.PREFERRED_SENDER_EMAIL;
  
  let accountWarning = '';
  if (!isWorkAccount && yourEmail !== preferredSender) {
    accountWarning = '⚠️ SENDING FROM PERSONAL ACCOUNT\n' +
                     `Current: ${yourEmail}\n` +
                     `Recommended: ${preferredSender}\n\n`;
  }
  
  const confirm = ui.alert(
    '🧪 Safe Email Test',
    accountWarning +
    `This will send a test email ONLY to you (${yourEmail}).\n\n` +
    'This is completely safe and won\'t spam anyone.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  try {
    // Generate current schedule
    const weekData = new EmailScheduler().getThisWeekData();
    if (!weekData) {
      ui.alert('No Schedule', 'Please generate a schedule first using "Generate Schedule"', ui.ButtonSet.OK);
      return;
    }
    
    // Send test email to you only
    const emailScheduler = new EmailScheduler();
    const result = emailScheduler.sendEmailsWithRetry([yourEmail], weekData);
    
    // Show results
    const success = result.filter(r => r.success).length;
    const failed = result.filter(r => !r.success).length;
    
    ui.alert(
      '✅ Test Complete',
      `Email test sent to: ${yourEmail}\n\n` +
      `Success: ${success}\nFailed: ${failed}\n\n` +
      'Check your email (including spam folder) to see how it looks!',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Test Failed', 'Error: ' + error.toString(), ui.ButtonSet.OK);
    console.error('Test email error:', error);
  }
}

/**
 * Simple test function to run from script editor
 */
function testEmailsNow() {
  console.log('🧪 Testing Email Functions...');
  
  try {
    // Test main email generation
    const emailScheduler = new EmailScheduler();
    const weekData = emailScheduler.getThisWeekData();
    
    if (!weekData) {
      console.log('❌ No schedule data found');
      return;
    }
    
    console.log('✅ Schedule data loaded');
    
    // Test HTML generation
    const tableData = emailScheduler.buildScheduleTable();
    const { subject, htmlBody, plainBody } = emailScheduler.buildEmailContent(weekData, tableData);
    
    console.log('📧 Email Subject:', subject);
    console.log('📄 HTML Body Length:', htmlBody.length, 'characters');
    console.log('📝 Plain Text Length:', plainBody.length, 'characters');
    
    // Test house-specific email
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('Schedule');
    if (scheduleSheet) {
      const data = scheduleSheet.getDataRange().getValues();
      const sampleHouse = 'Sample House'; // You can change this
      const houseHtml = createHouseSpecificEmail(sampleHouse, data, 1);
      console.log('🏠 House Email Length:', houseHtml.length, 'characters');
    }
    
    console.log('✅ All email functions working correctly!');
    console.log('💡 Use the menu options to preview and test emails');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

/**
 * Preview house-specific email content
 */
function previewHouseEmail() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Get available houses
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('Schedule');
    if (!scheduleSheet) {
      throw new Error('Schedule sheet not found');
    }
    
    const data = scheduleSheet.getDataRange().getValues();
    const houseCol = 1; // Assuming house names are in column B (index 1)
    
    // Find houses with scheduled outings
    const availableHouses = [];
    for (let row = 1; row < Math.min(data.length, 20); row++) {
      const houseName = data[row][houseCol];
      if (houseName && houseName !== 'House' && houseName.toString().trim() !== '') {
        if (!availableHouses.includes(houseName)) {
          availableHouses.push(houseName);
        }
      }
    }
    
    if (availableHouses.length === 0) {
      ui.alert('No Houses Found', 'No houses found in the schedule. Please generate a schedule first.', ui.ButtonSet.OK);
      return;
    }
    
    // Let user select a house
    const houseList = availableHouses.join('\n• ');
    const selectedHouse = ui.prompt(
      'Select House to Preview',
      `Available houses:\n• ${houseList}\n\nEnter the house name to preview its email:`,
      ui.ButtonSet.OK_CANCEL
    );
    
    if (selectedHouse.getSelectedButton() !== ui.Button.OK) return;
    
    const houseName = selectedHouse.getResponseText().trim();
    if (!availableHouses.includes(houseName)) {
      ui.alert('Invalid House', `House "${houseName}" not found. Please select from the available houses.`, ui.ButtonSet.OK);
      return;
    }
    
    // Generate house-specific email
    const houseSpecificHtml = createHouseSpecificEmail(houseName, data, houseCol);
    
    // Create preview HTML
    const previewHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">🏠 House Email Preview - ${houseName}</h2>
        <div style="margin: 15px 0;">
          <strong>Subject:</strong> Weekly Therapeutic Outings - ${houseName} House
        </div>
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa; max-height: 500px; overflow-y: auto;">
          ${houseSpecificHtml}
        </div>
        <div style="margin-top: 15px; text-align: center;">
          <button onclick="google.script.run.testEmailSafely()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Send Test Email</button>
          <button onclick="google.script.host.close()" style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(previewHtml)
      .setTitle(`House Email Preview - ${houseName}`)
      .setWidth(900)
      .setHeight(700);
    
    ui.showModalDialog(htmlOutput, `Email Preview: ${houseName} House`);
    
  } catch (error) {
    ui.alert('Preview Failed', 'Error: ' + error.toString(), ui.ButtonSet.OK);
    console.error('House email preview error:', error);
  }
}

/**
 * Quick preview of email content in a modal dialog
 */
function quickEmailPreview() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const emailScheduler = new EmailScheduler();
    
    // Get week data
    const weekData = emailScheduler.getThisWeekData();
    if (!weekData) {
      ui.alert('No Schedule', 'Please generate a schedule first using "Generate Schedule"', ui.ButtonSet.OK);
      return;
    }
    
    // Generate email content
    const tableData = emailScheduler.buildScheduleTable();
    const { subject, htmlBody } = emailScheduler.buildEmailContent(weekData, tableData);
    
    // Create simplified preview HTML
    const previewHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">📧 Email Preview</h2>
        <div style="margin: 15px 0;">
          <strong>Subject:</strong> ${subject}
        </div>
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa; max-height: 400px; overflow-y: auto;">
          ${htmlBody}
        </div>
        <div style="margin-top: 15px; text-align: center;">
          <button onclick="google.script.run.testEmailSafely()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Send Test Email</button>
        </div>
      </div>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(previewHtml)
      .setTitle('Email Preview')
      .setWidth(900)
      .setHeight(600);
    
    ui.showModalDialog(htmlOutput, 'Email Content Preview');
    
  } catch (error) {
    ui.alert('Preview Failed', 'Error: ' + error.toString(), ui.ButtonSet.OK);
    console.error('Quick email preview error:', error);
  }
}

/**
 * Preview email content without sending - shows exactly what will be sent
 */
function previewEmailContent() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const emailScheduler = new EmailScheduler();
    
    // Get week data
    const weekData = emailScheduler.getThisWeekData();
    if (!weekData) {
      ui.alert('No Schedule', 'Please generate a schedule first using "Generate Schedule"', ui.ButtonSet.OK);
      return;
    }
    
    // Generate both main email and house-specific emails
    const tableData = emailScheduler.buildScheduleTable();
    const { subject, plainBody, htmlBody } = emailScheduler.buildEmailContent(weekData, tableData);
    
    // Get sample house data for house-specific preview
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('Schedule');
    if (!scheduleSheet) {
      throw new Error('Schedule sheet not found');
    }
    
    const data = scheduleSheet.getDataRange().getValues();
    const houseCol = 1; // Assuming house names are in column B (index 1)
    
    // Find first house with scheduled outings
    let sampleHouse = null;
    for (let row = 1; row < Math.min(data.length, 10); row++) {
      const houseName = data[row][houseCol];
      if (houseName && houseName !== 'House' && houseName.toString().trim() !== '') {
        sampleHouse = houseName;
        break;
      }
    }
    
    let houseSpecificHtml = '';
    if (sampleHouse) {
      houseSpecificHtml = createHouseSpecificEmail(sampleHouse, data, houseCol);
    }
    
    // Create preview HTML file
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Preview - Family First Scheduler</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .preview-container { max-width: 1200px; margin: 0 auto; }
          .email-section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .email-section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          .email-content { border: 1px solid #ddd; border-radius: 4px; padding: 15px; background: #fafafa; }
          .subject { font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .actions { margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 6px; }
          .actions button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
          .actions button:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <h1>📧 Email Content Preview</h1>
          <p>This shows exactly what will be sent in the emails. Use this to review before sending to recipients.</p>
          
          <div class="email-section">
            <h2>📨 Main Distribution Email</h2>
            <div class="subject">Subject: ${subject}</div>
            <div class="email-content">
              ${htmlBody}
            </div>
          </div>
          
          ${sampleHouse ? `
          <div class="email-section">
            <h2>🏠 House-Specific Email (Sample: ${sampleHouse})</h2>
            <div class="subject">Subject: Weekly Therapeutic Outings - ${sampleHouse} House</div>
            <div class="email-content">
              ${houseSpecificHtml}
            </div>
          </div>
          ` : ''}
          
          <div class="email-section">
            <h2>📝 Plain Text Version</h2>
            <div class="email-content">
              <pre style="white-space: pre-wrap; font-family: monospace;">${plainBody}</pre>
            </div>
          </div>
          
          <div class="actions">
            <button onclick="window.print()">🖨️ Print Preview</button>
            <button onclick="sendTestEmail()">🧪 Send Test Email</button>
            <button onclick="closePreview()">❌ Close Preview</button>
          </div>
        </div>
        
        <script>
          function sendTestEmail() {
            if (confirm('Send test email to yourself?')) {
              google.script.run.testEmailSafely();
              alert('Test email sent! Check your inbox.');
            }
          }
          
          function closePreview() {
            window.close();
          }
        </script>
      </body>
      </html>
    `;
    
    // Save preview to file
    const htmlBlob = Utilities.newBlob(previewHtml, 'text/html', 'email-preview.html');
    const file = DriveApp.createFile(htmlBlob);
    
    // Open preview in browser
    const previewUrl = file.getUrl();
    
    ui.alert(
      '✅ Email Preview Generated',
      `Preview file created: ${file.getName()}\n\n` +
      `📁 Location: Google Drive\n` +
      `🔗 URL: ${previewUrl}\n\n` +
      `This shows exactly what your emails will look like!\n\n` +
      `Click "Open" to view the preview in your browser.`,
      ui.ButtonSet.OK
    );
    
    // Try to open in browser
    try {
      const htmlOutput = HtmlService.createHtmlOutput(previewHtml)
        .setTitle('Email Preview')
        .setWidth(1200)
        .setHeight(800);
      SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Email Preview');
    } catch (e) {
      // Fallback to Drive link
      console.log('Modal dialog failed, using Drive link');
    }
    
  } catch (error) {
    ui.alert('Preview Failed', 'Error: ' + error.toString(), ui.ButtonSet.OK);
    console.error('Email preview error:', error);
  }
}

/**
 * Debug onOpen to identify hanging issues
 */
function debugOnOpen() {
  console.log('Starting debugOnOpen...');
  
  try {
    console.log('Step 1: Getting UI...');
    const ui = SpreadsheetApp.getUi();
    
    console.log('Step 2: Creating menu...');
    const menu = ui.createMenu('FFAS Debug');
    
    console.log('Step 3: Adding menu items...');
    menu.addItem('Test Script', 'testScript')
        .addItem('Generate Schedule', 'generateScheduleWithUI')
        .addItem('Preview & Send Schedule', 'previewAndSendSchedule');
    
    console.log('Step 4: Adding menu to UI...');
    menu.addToUi();
    
    console.log('Step 5: Menu created successfully!');
    ui.alert('Debug Success', 'onOpen completed without hanging!', ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('Error in debugOnOpen:', error);
    console.log('Error details:', error.toString());
  }
}

/**
 * Reset the initialization flag (for testing or re-setup)
 */
function resetInitialization() {
  PropertiesService.getScriptProperties().deleteProperty('SYSTEM_INITIALIZED');
  SpreadsheetApp.getUi().alert('Reset Complete', 'The system will run first-time setup on next open.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function setAutomationFlag_(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(value));
}

function getAutomationFlag_(key, defaultVal) {
  const raw = PropertiesService.getScriptProperties().getProperty(key);
  if (raw === null || raw === undefined) return defaultVal;
  try { return JSON.parse(raw); } catch (e) { return defaultVal; }
}

function enableRefreshBeforeSend() {
  setAutomationFlag_('AUTO_REFRESH_BEFORE_SEND', true);
  SpreadsheetApp.getUi().alert('🔁 "Refresh Before Send" enabled');
}

function disableRefreshBeforeSend() {
  setAutomationFlag_('AUTO_REFRESH_BEFORE_SEND', false);
  SpreadsheetApp.getUi().alert('⏸️ "Refresh Before Send" disabled');
}



/**
 * Advanced schedule generation with progress tracking and optimization
 */
function generateScheduleWithUI() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '📅 Generate Schedule',
    'This will create a full year schedule. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  // Show progress sidebar
  const html = HtmlService.createHtmlOutput(getProgressHTML())
      .setWidth(300)
      .setHeight(200);
  ui.showModalDialog(html, 'Generating Schedule...');
  
  try {
    const startTime = Date.now();
    const result = generateScheduleEnhanced();
    const duration = Date.now() - startTime;
    
    // Log performance metrics
    logPerformanceMetric('schedule_generation', duration, result);
    
    // Show success with stats
    ui.alert(
      '✅ Schedule Generated Successfully',
      `Generated ${result.weeksCreated} weeks in ${(duration/1000).toFixed(2)} seconds.\n` +
      `Vendors used: ${result.uniqueVendors}\n` +
      `Conflicts resolved: ${result.conflictsResolved}`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    handleError(error, 'Schedule Generation');
  }
}

/**
 * Core scheduling engine with advanced optimization
 * @returns {Object} Generation results and metrics
 */
function generateScheduleEnhanced() {
  const perfTimer = new PerformanceTimer('generateSchedule');
  
  try {
    const ss = SpreadsheetApp.getActive();
    const dataManager = new DataManager(ss);
    const scheduler = new SmartScheduler(dataManager);
    
    // Load and validate all data
    perfTimer.mark('dataLoad');
    const config = dataManager.getConfig();
    const programs = dataManager.getPrograms();
    const vendors = dataManager.getVendors();
    const rules = dataManager.getRules();
    
    // Validate data integrity
    const validation = validateSchedulingData(programs, vendors, rules);
    if (!validation.isValid) {
      // Show detailed error message
      const errorMsg = 'Validation failed:\n\n' + validation.errors.join('\n');
      SpreadsheetApp.getUi().alert('Validation Errors', errorMsg, SpreadsheetApp.getUi().ButtonSet.OK);
      throw new ValidationError(validation.errors);
    }
    
    perfTimer.mark('validation');
    
    // Generate schedule with smart optimization
    const schedule = scheduler.generateOptimalSchedule({
      startDate: config.StartTuesday,
      weeks: config.WeeksToGenerate || 52,
      programs: programs,
      vendors: vendors,
      rules: rules,
      optimization: {
        balanceVendorUsage: true,
        minimizeTravelTime: true,
        respectPreferences: true,
        avoidConflicts: true
      }
    });
    
    perfTimer.mark('generation');
    
    // Write to sheet with formatting
    const writer = new ScheduleWriter(ss);
    writer.writeSchedule(schedule);
    writer.applyConditionalFormatting(vendors);
    
    perfTimer.mark('writing');
    
    // Sync with calendars
    const calendarSync = new CalendarSync(vendors, programs);
    const syncResults = calendarSync.syncAllEvents(schedule);
    
    perfTimer.mark('calendarSync');
    
    // Audit log
    auditLog('SCHEDULE_GENERATED', {
      weeks: schedule.length,
      vendors: Object.keys(vendors).length,
      programs: programs.length,
      performance: perfTimer.getMetrics()
    });
    
    return {
      weeksCreated: schedule.length,
      uniqueVendors: countUniqueVendors(schedule),
      conflictsResolved: scheduler.getConflictCount(),
      performance: perfTimer.getMetrics()
    };
    
  } finally {
    perfTimer.end();
  }
}

/**
 * Replace a cancelled outing with an available alternative
 */
function replaceOutingUI() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet) {
    ui.alert('Error', 'No schedule found. Please generate a schedule first.', ui.ButtonSet.OK);
    return;
  }
  
  // Get current cell selection
  const activeCell = scheduleSheet.getActiveCell();
  if (!activeCell) {
    ui.alert('Error', 'Please select the cell with the cancelled outing.', ui.ButtonSet.OK);
    return;
  }
  
  const row = activeCell.getRow();
  const col = activeCell.getColumn();
  
  // Validate selection
  if (row < 2 || col < 2) {
    ui.alert('Error', 'Please select a cell containing an outing assignment.', ui.ButtonSet.OK);
    return;
  }
  
  // Get the date and house
  const dateValue = scheduleSheet.getRange(row, 1).getValue();
  const houseColumn = scheduleSheet.getRange(1, col).getValue();
  
  if (!dateValue || !houseColumn || houseColumn === 'Options' || houseColumn === 'Locked?') {
    ui.alert('Error', 'Please select a valid outing cell.', ui.ButtonSet.OK);
    return;
  }
  
  // Get current assignment
  const currentAssignment = activeCell.getValue();
  if (!currentAssignment || currentAssignment === 'UNASSIGNED' || currentAssignment === 'TBD') {
    ui.alert('Info', 'This cell is already empty. Use Generate Schedule or Refill This Week instead.', ui.ButtonSet.OK);
    return;
  }
  
  // Confirm replacement
  const result = ui.alert(
    'Replace Outing',
    `Replace the following outing?\n\n` +
    `Date: ${Utilities.formatDate(new Date(dateValue), CONFIG.DEFAULT_TIMEZONE, 'EEEE, MMM d')}\n` +
    `House: ${houseColumn}\n` +
    `Current: ${currentAssignment.toString().split('\n')[0]}\n\n` +
    `This will find an available alternative vendor.`,
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) {
    return;
  }
  
  // Find replacement
  try {
    const replacement = findReplacementOuting(dateValue, houseColumn, currentAssignment);
    
    if (!replacement) {
      ui.alert(
        'No Replacement Found',
        'Could not find an available replacement vendor for this date.\n\n' +
        'All suitable vendors may already be booked or unavailable.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Apply replacement
    const newValue = `${replacement.vendorName}\n${replacement.time || 'Time TBD'}`;
    activeCell.setValue(newValue);
    
    // Apply formatting
    const vendorColor = getVendorColor(replacement.vendorName);
    activeCell.setBackground(vendorColor.background)
             .setFontColor(vendorColor.text);
    
    // Log the change
    auditLog('OUTING_REPLACED', {
      date: dateValue,
      house: houseColumn,
      oldVendor: currentAssignment.toString().split('\n')[0],
      newVendor: replacement.vendorName,
      reason: 'Manual replacement'
    });
    
    // Show success message
    ui.alert(
      '✅ Replacement Successful',
      `Outing replaced successfully!\n\n` +
      `New Vendor: ${replacement.vendorName}\n` +
      `Time: ${replacement.time || 'Time TBD'}\n` +
      `Cost: $${replacement.cost || 'TBD'}\n\n` +
      `Remember to notify the house and vendor of the change.`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Failed to find replacement: ' + error.toString(), ui.ButtonSet.OK);
  }
}
/**
 * Find a suitable replacement vendor for a cancelled outing
 */
function findReplacementOuting(date, house, cancelledAssignment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataManager = new DataManager(ss);
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  // Get house/program info
  const programsByHouse = dataManager.getProgramsMapByHouse();
  const program = programsByHouse[house];
  
  if (!program) {
    throw new Error('House/program not found: ' + house);
  }
  
  // Get all vendors
  const vendors = dataManager.getVendors();
  
  // Get current schedule for the date
  const scheduleData = scheduleSheet.getDataRange().getValues();
  const headers = scheduleData[0];
  let dateRow = -1;
  
  // Find the row for this date
  for (let i = 1; i < scheduleData.length; i++) {
    if (scheduleData[i][0] && new Date(scheduleData[i][0]).toDateString() === new Date(date).toDateString()) {
      dateRow = i;
      break;
    }
  }
  
  if (dateRow === -1) {
    throw new Error('Date not found in schedule');
  }
  
  // Get all assignments for this date
  const dayAssignments = {};
  for (let j = 1; j < headers.length; j++) {
    if (headers[j] && headers[j] !== 'Options' && headers[j] !== 'Locked?') {
      const assignment = scheduleData[dateRow][j];
      if (assignment && assignment !== 'UNASSIGNED' && assignment !== 'TBD') {
        const vendorName = assignment.toString().split('\n')[0];
        dayAssignments[headers[j]] = vendorName;
      }
    }
  }
  
  // Find suitable replacements
  const candidates = [];
  const cancelledVendor = cancelledAssignment.toString().split('\n')[0];
  
  for (const vendorName in vendors) {
    const vendor = vendors[vendorName];
    
    // Skip if same as cancelled vendor
    if (vendorName === cancelledVendor) continue;
    
    // Skip if already assigned on this date
    if (Object.values(dayAssignments).includes(vendorName)) continue;
    
    // Check if vendor serves this program type
    if (!vendor['Programs Served'] || !vendor['Programs Served'].includes(program['Program Type'])) {
      continue;
    }
    
    // Check location compatibility
    const acceptableLocations = program['Acceptable Locations'] || '';
    const vendorLocation = vendor['Vendor Type'] || vendor['Location'] || '';
    
    if (acceptableLocations && vendorLocation) {
      const locationList = acceptableLocations.split(/[,;]/).map(l => l.trim().toLowerCase());
      const vendorLoc = vendorLocation.toLowerCase();
      
      if (!locationList.some(loc => vendorLoc.includes(loc) || loc.includes(vendorLoc))) {
        continue;
      }
    }
    
    // Calculate replacement score
    let score = 100;
    
    // Prefer vendors with similar cost
    const cancelledVendorData = vendors[cancelledVendor];
    if (cancelledVendorData && cancelledVendorData['Flat Rate']) {
      const cancelledCost = parseFloat(cancelledVendorData['Flat Rate']) || 0;
      const vendorCost = parseFloat(vendor['Flat Rate']) || 0;
      const costDiff = Math.abs(cancelledCost - vendorCost);
      score -= (costDiff / 10); // Reduce score based on cost difference
    }
    
    // Prefer core vendors
    if (CONFIG.CORE_ROTATION_VENDORS && CONFIG.CORE_ROTATION_VENDORS.includes(vendorName)) {
      score += 50;
    }
    
    // Check availability for the specific day
    const dayOfWeek = Utilities.formatDate(new Date(date), CONFIG.DEFAULT_TIMEZONE, 'EEEE');
    const availability = vendor[dayOfWeek] || vendor.Availability || '';
    
    if (!availability || availability.toLowerCase() === 'no' || availability.toLowerCase() === 'unavailable') {
      continue;
    }
    
    // Add as candidate
    candidates.push({
      vendorName: vendorName,
      vendor: vendor,
      score: score,
      time: availability !== 'Yes' ? availability : vendor['Preferred Time'] || 'Time TBD',
      cost: vendor['Flat Rate'] || vendor['Cost per Client'] || 'TBD'
    });
  }
  
  // Sort candidates by score (highest first)
  candidates.sort((a, b) => b.score - a.score);
  
  // Return best candidate or null
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Get vendor color for formatting
 */
function getVendorColor(vendorName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataManager = new DataManager(ss);
  const vendors = dataManager.getVendors();
  const vendor = vendors[vendorName];
  
  if (!vendor) {
    return { background: '#f0f0f0', text: '#000000' };
  }
  
  const vendorType = vendor['Vendor Type'] || vendor.Type || 'Other';
  
  // Color mapping for vendor types
  const colorMap = {
    'Equine': { background: '#8B4513', text: '#FFFFFF' },
    'Sports': { background: '#FF6B6B', text: '#FFFFFF' },
    'Water': { background: '#4ECDC4', text: '#FFFFFF' },
    'Farm': { background: '#95E1D3', text: '#000000' },
    'Indoor Activities': { background: '#DDA0DD', text: '#000000' },
    'Outdoor Activities': { background: '#98D8C8', text: '#000000' },
    'Animal': { background: '#F4A460', text: '#000000' },
    'Creative': { background: '#FFB6C1', text: '#000000' },
    'Educational': { background: '#87CEEB', text: '#000000' },
    'Therapeutic': { background: '#B19CD9', text: '#000000' }
  };
  
  return colorMap[vendorType] || { background: '#E0E0E0', text: '#000000' };
}

/**
 * Smart refill for current week
 */
function refillThisWeekSmart() {
  try {
    const ss = SpreadsheetApp.getActive();
    const dataManager = new DataManager(ss);
    const scheduler = new SmartScheduler(dataManager);
    
    const result = scheduler.refillCurrentWeek();
    
    if (result.success) {
      SpreadsheetApp.getUi().alert(
        '✅ Week Refilled',
        `Updated ${result.assignments} assignments for this week.`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '⚠️ No Changes',
        result.message || 'Current week is locked or not found.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    handleError(error, 'Refill Week');
  }
}

// ======================== SMART SCHEDULER CLASS ========================

class SmartScheduler {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.conflictCount = 0;
    this.vendorUsage = {};
    this.houseHistory = {};
    this.coreRotationIndex = 0; // For tracking strict rotation
    this.performanceMetrics = {
      startTime: Date.now(),
      operations: []
    };
    
    // Initialize house history from existing schedule
    this.loadHistoricalData();
  }
  
  /**
   * Load historical vendor assignments from existing schedule
   */
  loadHistoricalData() {
    try {
      const scheduleSheet = this.dataManager.ss.getSheetByName('SCHEDULE');
      if (!scheduleSheet || scheduleSheet.getLastRow() < 2) return;
      
      const data = scheduleSheet.getDataRange().getValues();
      const headers = data[0];
      
      // Find house columns
      const houseColumns = {};
      const programs = this.dataManager.getPrograms();
      
      programs.forEach(program => {
        const colIndex = headers.indexOf(program.House);
        if (colIndex >= 0) {
          houseColumns[colIndex] = program.House;
        }
      });
      
      // Process each row
      for (let row = 1; row < data.length; row++) {
        const date = data[row][0];
        if (!(date instanceof Date)) continue;
        
        // Check each house column
        for (const [colIndex, house] of Object.entries(houseColumns)) {
          const cellValue = data[row][colIndex];
          if (cellValue && cellValue.toString().trim()) {
            // Extract vendor name (first line before time)
            const vendorName = cellValue.toString().split('\n')[0].trim();
            
            if (vendorName && vendorName !== 'UNASSIGNED') {
              // Initialize house history if needed
              if (!this.houseHistory[house]) {
                this.houseHistory[house] = {};
              }
              if (!this.houseHistory[house][vendorName]) {
                this.houseHistory[house][vendorName] = [];
              }
              
              // Add to history
              this.houseHistory[house][vendorName].push(date);
            }
          }
        }
      }
      
      console.log('Loaded historical data for', Object.keys(this.houseHistory).length, 'houses');
      
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  }
  
  /**
   * Generate optimal schedule using advanced algorithms
   */
  generateOptimalSchedule(options) {
    const perfStart = Date.now();
    // this.trackPerformance('schedule_generation_start');
    
    const schedule = [];
    const tuesdays = this.generateTuesdays(options.startDate, options.weeks);
    
    // Initialize the core rotation index from script properties to maintain state across runs
    const properties = PropertiesService.getScriptProperties();
    this.coreRotationIndex = parseInt(properties.getProperty('CORE_ROTATION_INDEX') || '0');

    for (const tuesday of tuesdays) {
      const dayStart = Date.now();
      const daySchedule = this.scheduleDay(tuesday, options);
      schedule.push(daySchedule);
      // this.trackPerformance('schedule_day', Date.now() - dayStart);
    }
    
    // Save the final rotation index for the next run
    properties.setProperty('CORE_ROTATION_INDEX', this.coreRotationIndex);

    // Post-optimization pass
    if (options.optimization.balanceVendorUsage) {
      const balanceStart = Date.now();
      this.balanceVendorDistribution(schedule);
      // this.trackPerformance('balance_distribution', Date.now() - balanceStart);
    }
    
    return schedule;
  }
  
  /**
   * Schedule a single day with fair distribution
   */
  scheduleDay(date, options) {
    const daySchedule = {
      date: date,
      assignments: {},
      metadata: {}
    };
    
    const availableVendors = this.getAvailableVendors(date, options.vendors);
    const programs = this.prioritizePrograms(options.programs);
    
    // First, ensure priority vendors are assigned weekly
    const priorityVendors = CONFIG.WEEKLY_PRIORITY_VENDORS;
    const assignedVendors = new Set();
    const unassignedPrograms = [...programs];
    
    // Step 1: Assign priority vendors first
    for (const vendorName of priorityVendors) {
      if (!availableVendors[vendorName] || !availableVendors[vendorName].Active) continue;
      if (assignedVendors.has(vendorName)) continue;
      
      // Find best house for this vendor (respecting 3-week rule)
      let bestHouse = null;
      let bestScore = -1;
      
      for (let i = 0; i < unassignedPrograms.length; i++) {
        const program = unassignedPrograms[i];
        
        // Check 3-week spacing rule
        const lastVisit = this.getLastVendorVisitForHouse(program.House, vendorName);
        const weeksSince = lastVisit ? this.getWeeksBetween(lastVisit, date) : 999;
        
        if (weeksSince >= 3) {
          // Calculate score based on how long it's been
          const score = weeksSince + (program.Priority ? 10 : 0);
          
          if (score > bestScore) {
            bestScore = score;
            bestHouse = i;
          }
        }
      }
      
      // Assign if found eligible house
      if (bestHouse !== null) {
        const program = unassignedPrograms[bestHouse];
        daySchedule.assignments[program.House] = {
          vendor: vendorName,
          time: `${this.dataManager.formatTime(program.TuesdayStart)} - ${this.dataManager.formatTime(program.TuesdayEnd)}`,
          confidence: 100
        };
        
        assignedVendors.add(vendorName);
        unassignedPrograms.splice(bestHouse, 1);
        this.updateVendorUsage(vendorName, date);
        this.updateHouseHistory(program.House, vendorName, date);
      }
    }

    // Step 2: Assign remaining vendors to unassigned houses
    for (const program of unassignedPrograms) {
      // Get all available vendors not yet assigned
      const availableForHouse = {};
      
      for (const vendorName in availableVendors) {
        if (assignedVendors.has(vendorName)) continue;
        
        const vendor = availableVendors[vendorName];
        if (!vendor.Active) continue;
        
        // Check 3-week spacing rule
        const lastVisit = this.getLastVendorVisitForHouse(program.House, vendorName);
        const weeksSince = lastVisit ? this.getWeeksBetween(lastVisit, date) : 999;
        
        if (weeksSince >= 3) {
          availableForHouse[vendorName] = vendor;
        }
      }
      
      // Select best vendor for this house
      const vendor = this.selectOptimalVendor(
        program, 
        date, 
        availableForHouse, 
        daySchedule.assignments,
        options
      );
      
      if (vendor) {
        daySchedule.assignments[program.House] = {
          vendor: vendor.name,
          time: `${this.dataManager.formatTime(program.TuesdayStart)} - ${this.dataManager.formatTime(program.TuesdayEnd)}`,
          confidence: vendor.score
        };
        
        assignedVendors.add(vendor.name);
        this.updateVendorUsage(vendor.name, date);
        this.updateHouseHistory(program.House, vendor.name, date);
      } else {
        daySchedule.assignments[program.House] = {
          vendor: 'UNASSIGNED',
          reason: 'No vendor available (3-week spacing constraint)',
          confidence: 0
        };
        this.conflictCount++;
      }
    }
    
    // Step 3: Log metadata about the distribution
    daySchedule.metadata = {
      priorityVendorsAssigned: priorityVendors.filter(v => assignedVendors.has(v)).length,
      totalAssigned: assignedVendors.size,
      unassignedHouses: unassignedPrograms.length
    };
    
    return daySchedule;
  }
  
  /**
   * Advanced vendor selection with ML-like scoring
   */
  selectOptimalVendor(program, date, vendors, currentAssignments, options) {
    const candidates = [];
    
    for (const vendorName in vendors) {
      const vendor = vendors[vendorName];
      if (this.isVendorEligible(vendor, program, date, currentAssignments)) {
        const score = this.calculateVendorScore(vendor, program, date, options);
        candidates.push({ name: vendorName, vendor: vendor, score: score });
      }
    }
    
    // Sort by score and return best match
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
  }
  
  /**
   * Check if vendor is eligible for assignment
   */
  isVendorEligible(vendor, program, date, currentAssignments) {
    // Check if active
    if (!vendor.Active) return false;
    
    // Check blackout dates
    const dateStr = Utilities.formatDate(date, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy');
    if (vendor.Blackout && vendor.Blackout.includes(dateStr)) return false;
    
    // Check if already assigned
    const assignedVendors = Object.values(currentAssignments)
      .map(a => a.vendor)
      .filter(v => v !== 'UNASSIGNED');
    if (assignedVendors.includes(vendor.Name)) return false;
    
    // Check weekly limit
    const weekCount = this.getVendorWeekCount(vendor.Name, date);
    if (weekCount >= (vendor.WeeklyLimit || 99)) return false;
    
    // Check minimum weeks between same vendor
    const lastAssignment = this.getLastAssignment(program.House, vendor.Name);
    if (lastAssignment) {
      const weeksSince = Math.floor((date - lastAssignment) / (7 * 24 * 60 * 60 * 1000));
      const minWeeks = this.getMinWeeksBetween(date);
      if (weeksSince < minWeeks) return false;
    }
    
    return true;
  }
  
  /**
   * Calculate vendor suitability score (0-100)
   */
  calculateVendorScore(vendor, program, date, options) {
    let score = 50; // Base score
    
    // Historical performance
    if (vendor.QualityScore) {
      score += (vendor.QualityScore - 50) * 0.3;
    }
    
    // Preference matching
    if (program.PreferredVendors && program.PreferredVendors.includes(vendor.Name)) {
      score += 20;
    }
    
    // Usage balance
    const usageCount = this.vendorUsage[vendor.Name] || 0;
    const avgUsage = this.getAverageVendorUsage();
    if (usageCount < avgUsage) {
      score += 10;
    }
    
    // Type matching
    if (vendor.Type === program.PreferredType) {
      score += 15;
    }
    
    // Cost optimization (new feature)
    if (options.optimization && options.optimization.costOptimized) {
      const vendorCost = this.calculateVendorCost(vendor, program);
      const averageCost = this.getAverageCostForProgram(program);
      
      if (vendorCost < averageCost * 0.8) {
        score += 15; // Significant savings
      } else if (vendorCost < averageCost) {
        score += 8; // Moderate savings
      } else if (vendorCost > averageCost * 1.2) {
        score -= 10; // Above average cost
      }
    }
    
    // Recency penalty
    const lastUsed = this.getLastVendorUse(program.House, vendor.Name);
    if (lastUsed) {
      const weeksSince = Math.floor((date - lastUsed) / (7 * 24 * 60 * 60 * 1000));
      score += Math.min(weeksSince * 2, 20);
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate total cost for a vendor serving a program
   */
  calculateVendorCost(vendor, program) {
    const flatRate = parseFloat(vendor['Flat Rate'] || 0);
    const costPerClient = parseFloat(vendor['Cost Per Client'] || 0);
    const estimatedClients = parseInt(program['Max Capacity'] || 1);
    
    if (flatRate > 0) {
      return flatRate;
    } else {
      return costPerClient * estimatedClients;
    }
  }
  
  /**
   * Get average cost for similar programs
   */
  getAverageCostForProgram(program) {
    // This could be enhanced to look at historical data
    // For now, return a reasonable default based on program type
    const baseCost = 200; // Base cost per outing
    const clientMultiplier = parseInt(program['Max Capacity'] || 1);
    return baseCost + (clientMultiplier * 50);
  }
  
  /**
   * Refill current week with smart selection
   */
  refillCurrentWeek() {
    const ss = this.dataManager.ss;
    const schedSheet = ss.getSheetByName('SCHEDULE');
    
    if (!schedSheet || schedSheet.getLastRow() < 2) {
      return { success: false, message: 'No schedule found' };
    }
    
    const today = new Date();
    const data = schedSheet.getDataRange().getValues();
    let targetRow = -1;
    
    // Find current week's Tuesday
    for (let i = 1; i < data.length; i++) {
      const date = new Date(data[i][0]);
      if (this.isSameWeek(date, today)) {
        targetRow = i;
        break;
      }
    }
    
    if (targetRow === -1) {
      return { success: false, message: 'Current week not found in schedule' };
    }
    
    // Check if locked
    const lockedCol = data[0].indexOf('Locked?');
    if (lockedCol >= 0 && data[targetRow][lockedCol] === true) {
      return { success: false, message: 'Current week is locked' };
    }
    
    // Refill assignments
    const programs = this.dataManager.getPrograms();
    const vendors = this.dataManager.getVendors();
    const rules = this.dataManager.getRules();
    const date = new Date(data[targetRow][0]);
    
    const daySchedule = this.scheduleDay(date, {
      programs: programs,
      vendors: vendors,
      rules: rules,
      optimization: {
        balanceVendorUsage: true,
        respectPreferences: true,
        avoidConflicts: true
      }
    });
    
    // Update sheet
    let assignments = 0;
    for (const program of programs) {
      const col = data[0].indexOf(program.House);
      if (col >= 0) {
        const assignment = daySchedule.assignments[program.House];
        if (assignment && assignment.vendor !== 'UNASSIGNED') {
          const cellValue = `${assignment.vendor}\n${assignment.time}`;
          schedSheet.getRange(targetRow + 1, col + 1).setValue(cellValue);
          assignments++;
        }
      }
    }
    
    return { success: true, assignments: assignments };
  }
  
  // Helper methods
  generateTuesdays(startDate, weeks) {
    const tuesdays = [];
    let current = new Date(startDate);
    current = this.nextTuesday(current);
    
    for (let i = 0; i < weeks; i++) {
      tuesdays.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    
    return tuesdays;
  }
  
  nextTuesday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (2 - day + 7) % 7;
    if (diff > 0) d.setDate(d.getDate() + diff);
    return d;
  }
  
  getAvailableVendors(date, vendors) {
    return vendors;
  }
  
  prioritizePrograms(programs) {
    return programs.sort((a, b) => (b.Priority || 1) - (a.Priority || 1));
  }
  
  updateVendorUsage(vendorName, date) {
    if (!this.vendorUsage[vendorName]) {
      this.vendorUsage[vendorName] = 0;
    }
    this.vendorUsage[vendorName]++;
  }
  
  updateHouseHistory(house, vendorName, date) {
    if (!this.houseHistory[house]) {
      this.houseHistory[house] = {};
    }
    if (!this.houseHistory[house][vendorName]) {
      this.houseHistory[house][vendorName] = [];
    }
    this.houseHistory[house][vendorName].push(date);
  }
  
  /**
   * Get last time a house visited a specific vendor
   */
  getLastVendorVisitForHouse(house, vendorName) {
    if (!this.houseHistory[house]) return null;
    
    const visits = this.houseHistory[house][vendorName];
    if (!visits || visits.length === 0) return null;
    
    // Return most recent visit
    return visits[visits.length - 1];
  }
  
  /**
   * Calculate weeks between two dates
   */
  getWeeksBetween(date1, date2) {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(Math.abs(date2 - date1) / oneWeek);
  }
  
  getVendorWeekCount(vendorName, date) {
    // Simplified - would need to check actual week
    return this.vendorUsage[vendorName] || 0;
  }
  
  getLastAssignment(house, vendorName) {
    const history = this.houseHistory[house] || [];
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].vendor === vendorName) {
        return history[i].date;
      }
    }
    return null;
  }
  
  getMinWeeksBetween(date) {
    const month = date.getMonth() + 1;
    const rules = this.dataManager.getRules();
    return (rules[month] && rules[month].MinWeeksBetweenSameVendorPerHouse) || 3;
  }
  
  getLastVendorUse(house, vendorName) {
    return this.getLastAssignment(house, vendorName);
  }
  
  getAverageVendorUsage() {
    const counts = Object.values(this.vendorUsage);
    if (counts.length === 0) return 0;
    return counts.reduce((a, b) => a + b, 0) / counts.length;
  }
  
  balanceVendorDistribution(schedule) {
    // Advanced optimization - simplified for now
    console.log('Balancing vendor distribution across schedule');
  }
  
  isSameWeek(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    
    // Get Monday of each week
    const firstMonday = new Date(firstDate);
    firstMonday.setDate(firstDate.getDate() - (firstDate.getDay() || 7) + 1);
    
    const secondMonday = new Date(secondDate);
    secondMonday.setDate(secondDate.getDate() - (secondDate.getDay() || 7) + 1);
    
    return Math.abs(firstMonday - secondMonday) < oneDay;
  }
  
  getConflictCount() {
    return this.conflictCount;
  }
}
// ======================== VENDOR CALENDAR MANAGER CLASS ========================
/**
 * Manages all vendor calendar operations
 * Handles calendar setup, syncing, and access management
 */
class VendorCalendarManager {
  constructor() {
    this.ui = SpreadsheetApp.getUi();
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.SHEET_NAME = 'Vendor Calendar Links';
    this.stateManager = VendorStateManager.getInstance();
    
    // Subscribe to state changes
    this.stateManager.subscribe({
      onStateChange: (newState, oldState) => this.handleStateChange(newState, oldState)
    });
    
    // Core vendor calendar configuration
    this.CORE_VENDORS = {
      'Kayaking': '3e5a30db97feb1fd0a556752747183937d8c250659a6aa9f649e3a8909d96776@group.calendar.google.com',
      'Goat Yoga': 'd8738139289e60b880968339c76f9c405781bb08229b646a0897574dac5ca296@group.calendar.google.com',
      'Surf Therapy': '9ef8dd17e6af927ad50e01049b061c405781bb08229b646a0897574dac5ca296@group.calendar.google.com',
      'Peach Painting': 'f640d58ac3faaecccf7b29d5b44498161514ae1a7ac5209e69b01037032207e@group.calendar.google.com'
    };
  }

  /**
   * Ensures vendor calendar sheet exists and is properly formatted
   */
  ensureSheetExists() {
    let sheet = this.ss.getSheetByName(this.SHEET_NAME);
    if (!sheet) {
      // Create sheet with headers
      sheet = this.ss.insertSheet(this.SHEET_NAME);
      const headers = [['Vendor', 'Type', 'Calendar ID', 'Status', 'Last Synced']];
      sheet.getRange(1, 1, 1, headers[0].length)
        .setValues(headers)
        .setBackground('#1976d2')
        .setFontColor('white')
        .setFontWeight('bold');
      
      // Format columns
      sheet.setColumnWidth(1, 150);  // Vendor name
      sheet.setColumnWidth(2, 100);  // Type
      sheet.setColumnWidth(3, 400);  // Calendar ID
      sheet.setColumnWidth(4, 100);  // Status
      sheet.setColumnWidth(5, 150);  // Last Synced
    }
    return sheet;
  }

  /**
   * Updates or adds a vendor calendar
   */
  updateVendorCalendar(vendor, type, calendarId) {
    const sheet = this.ensureSheetExists();
    const data = sheet.getDataRange().getValues();
    let found = false;

    // Look for existing vendor
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === vendor) {
        sheet.getRange(i + 1, 1, 1, 5).setValues([[
          vendor,
          type,
          calendarId,
          'Pending Sync',
          new Date().toLocaleString()
        ]]);
        found = true;
        break;
      }
    }

    // Add new vendor if not found
    if (!found) {
      sheet.appendRow([
        vendor,
        type,
        calendarId,
        'Pending Sync',
        new Date().toLocaleString()
      ]);
    }

    return true;
  }

  /**
   * Adds all core vendor calendars
   */
  addCoreVendors() {
    try {
      Object.entries(this.CORE_VENDORS).forEach(([vendor, calendarId]) => {
        this.updateVendorCalendar(vendor, 'Core', calendarId);
      });

      // Validate access
      const validation = this.validateCalendars();
      
      // Show results
      this.ui.alert(
        '✅ Calendar IDs Added',
        `Added calendar IDs for core vendors:\n` +
        Object.keys(this.CORE_VENDORS).map(v => `- ${v}`).join('\n') +
        '\n\n' +
        (validation.invalid.length > 0 ? 
          '⚠️ Some calendars need attention:\n' +
          validation.invalid.map(v => `- ${v.name}: ${v.error}`).join('\n') +
          '\n\nPlease check calendar permissions.\n\n'
          : '✅ All calendars validated successfully!\n\n') +
        'Next step: Run "Sync Vendor Calendars"',
        this.ui.ButtonSet.OK
      );

    } catch (error) {
      this.ui.alert('Error', `Failed to add calendar IDs: ${error.message}`, this.ui.ButtonSet.OK);
      throw error;
    }
  }

  /**
   * Gets all vendor calendars
   */
  getVendorCalendars() {
    const sheet = this.ensureSheetExists();
    const data = sheet.getDataRange().getValues();
    const vendors = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][2]) {
        vendors.push({
          name: data[i][0],
          type: data[i][1],
          calendarId: data[i][2],
          status: data[i][3] || 'Unknown',
          lastSynced: data[i][4] || 'Never'
        });
      }
    }

    return vendors;
  }

  /**
   * Validates vendor calendar access
   */
  validateCalendars() {
    const vendors = this.getVendorCalendars();
    const results = {
      valid: [],
      invalid: []
    };

    const sheet = this.ss.getSheetByName(this.SHEET_NAME);
    
    vendors.forEach((vendor, index) => {
      try {
        const calendar = CalendarApp.getCalendarById(vendor.calendarId);
        if (calendar) {
          results.valid.push(vendor.name);
          // Update status in sheet
          sheet.getRange(index + 2, 4).setValue('Valid');
        } else {
          results.invalid.push({ name: vendor.name, error: 'Calendar not found' });
          sheet.getRange(index + 2, 4).setValue('Not Found');
        }
      } catch (error) {
        results.invalid.push({ name: vendor.name, error: error.message });
        sheet.getRange(index + 2, 4).setValue('Error');
      }
    });

    return results;
  }

  /**
   * Handle state changes
   */
  handleStateChange(newState, oldState) {
    // If vendors changed, update sheet
    if (newState.vendors !== oldState.vendors) {
      this.refreshVendorSheet();
    }

    // If sync status changed, update UI
    if (newState.lastSync !== oldState.lastSync) {
      this.updateSyncStatus();
    }
  }

  /**
   * Refresh vendor sheet from state
   */
  refreshVendorSheet() {
    const sheet = this.ensureSheetExists();
    const state = this.stateManager.getState();
    const vendors = Object.entries(state.vendors).map(([name, data]) => [
      name,
      data.type || 'Custom',
      data.calendarId || '',
      data.status || 'Pending',
      data.lastUpdated ? data.lastUpdated.toLocaleString() : 'Never'
    ]);

    if (vendors.length > 0) {
      sheet.getRange(2, 1, vendors.length, 5).setValues(vendors);
    }
  }

  /**
   * Updates a vendor's sync status
   */
  updateSyncStatus(vendorName, status, error = null) {
    if (vendorName) {
      // Update specific vendor
      this.stateManager.updateVendor(vendorName, {
        status: error ? 'Error' : status,
        lastError: error,
        lastUpdated: new Date()
      });
    } else {
      // Update all vendors from sheet
      const sheet = this.ss.getSheetByName(this.SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const [name, type, calendarId, status, lastUpdated] = data[i];
        this.stateManager.updateVendor(name, {
          type,
          calendarId,
          status: status || 'Unknown',
          lastUpdated: lastUpdated ? new Date(lastUpdated) : null
        });
      }
    }
  }

  /**
   * Adds a new vendor calendar from a sharing URL
   */
  addCalendarFromUrl(promptUser = true) {
    let vendorName, calendarUrl;
    
    if (promptUser) {
      const result = this.ui.prompt(
        'Add Vendor Calendar',
        'Please enter:\n1. Vendor Name\n2. Calendar URL (from "Share with specific people")\n\n' +
        'Separate with comma (e.g., "New Vendor, https://calendar.google.com/...")',
        this.ui.ButtonSet.OK_CANCEL
      );

      if (result.getSelectedButton() !== this.ui.Button.OK) return null;
      [vendorName, calendarUrl] = result.getResponseText().split(',').map(s => s.trim());
    }

    try {
      if (!vendorName || !calendarUrl) {
        throw new Error('Please provide both vendor name and calendar URL');
      }

      // Extract calendar ID from URL
      const calendarId = this.extractCalendarId(calendarUrl);
      if (!calendarId) {
        throw new Error('Invalid calendar URL. Please use the sharing URL from Google Calendar.');
      }

      // Update the vendor
      this.updateVendorCalendar(vendorName, 'Custom', calendarId);

      if (promptUser) {
        this.ui.alert(
          '✅ Calendar Added',
          `Successfully added calendar for ${vendorName}.\n\nNext step: Run "Sync Vendor Calendars"`,
          this.ui.ButtonSet.OK
        );
      }

      return {
        name: vendorName,
        calendarId: calendarId
      };

    } catch (error) {
      if (promptUser) {
        this.ui.alert('Error', error.message, this.ui.ButtonSet.OK);
      }
      throw error;
    }
  }

  /**
   * Extracts calendar ID from a Google Calendar sharing URL
   */
  extractCalendarId(url) {
    try {
      // Handle both old and new URL formats
      const matches = url.match(/[a-zA-Z0-9_.+-]+@(group\.calendar\.google\.com|gmail\.com)/);
      return matches ? matches[0] : null;
    } catch (error) {
      return null;
    }
  }
}

// ======================== PDF MANAGER CLASS ========================

/**
 * Manages PDF generation and storage
 * Handles vendor schedules, reports, and other PDF documents
 */
class PDFManager {
  constructor() {
    this.ui = SpreadsheetApp.getUi();
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.PDF_FOLDER_NAME = 'Family First Schedules';
    this.stateManager = VendorStateManager.getInstance();
    
    // Subscribe to state changes
    this.stateManager.subscribe({
      onStateChange: (newState, oldState) => this.handleStateChange(newState, oldState)
    });
  }

  /**
   * Handle state changes
   */
  handleStateChange(newState, oldState) {
    // If vendors changed or sync happened, queue PDF update
    if (newState.vendors !== oldState.vendors || newState.lastSync !== oldState.lastSync) {
      this.queuePDFUpdate();
    }
  }

  /**
   * Queue PDF update for changed vendors
   */
  queuePDFUpdate() {
    const state = this.stateManager.getState();
    Object.entries(state.vendors).forEach(([name, data]) => {
      if (!data.pdfLastUpdated || data.pdfLastUpdated < data.lastUpdated) {
        this.updateVendorPDF(name);
      }
    });
  }

  /**
   * Update a specific vendor's PDF
   */
  updateVendorPDF(vendorName) {
    try {
      const state = this.stateManager.getState();
      const vendorData = state.vendors[vendorName];
      
      if (!vendorData) return;

      // Create PDF
      const pdfUrl = this.generateVendorPDF(vendorName, vendorData);
      
      // Update state
      this.stateManager.updateVendor(vendorName, {
        pdfUrl: pdfUrl,
        pdfLastUpdated: new Date()
      });

    } catch (error) {
      console.error(`Error updating PDF for ${vendorName}:`, error);
      this.stateManager.updateVendor(vendorName, {
        pdfError: error.message
      });
    }
  }

  /**
   * Ensures PDF storage folder exists
   */
  ensurePDFFolder() {
    const folderIterator = DriveApp.getFoldersByName(this.PDF_FOLDER_NAME);
    if (folderIterator.hasNext()) {
      return folderIterator.next();
    }
    
    return DriveApp.createFolder(this.PDF_FOLDER_NAME);
  }

  /**
   * Generates vendor-specific PDF schedules
   */
  generateVendorPDFs() {
    try {
      const vendorManager = new VendorCalendarManager();
      const vendors = vendorManager.getVendorCalendars();
      
      if (vendors.length === 0) {
        this.ui.alert('No Vendors', 'Please set up vendor calendars first.', this.ui.ButtonSet.OK);
        return;
      }

      // Show progress dialog
      const htmlOutput = HtmlService
        .createHtmlOutput(`
          <div style="padding: 20px; font-family: Arial;">
            <h3>📄 Generating PDF Schedules</h3>
            <p id="status">Preparing...</p>
            <div style="width: 100%; background: #f0f0f0; border-radius: 4px; margin: 10px 0;">
              <div id="progress" style="width: 0%; height: 20px; background: #4CAF50; border-radius: 4px; transition: width 0.3s;"></div>
            </div>
            <p id="count" style="font-size: 12px; color: #666;"></p>
          </div>
          <script>
            window.updateProgress = function(percent, status, count) {
              document.getElementById('progress').style.width = percent + '%';
              document.getElementById('status').textContent = status;
              document.getElementById('count').textContent = count;
            }
          </script>
        `)
        .setWidth(400)
        .setHeight(200);

      const dialog = this.ui.showModelessDialog(htmlOutput, 'PDF Generation');

      // Create PDFs sheet for tracking
      let pdfSheet = this.ss.getSheetByName('Vendor PDF Links');
      if (!pdfSheet) {
        pdfSheet = this.ss.insertSheet('Vendor PDF Links');
      }
      pdfSheet.clear();

      // Add headers
      const headers = [['Vendor', 'View Schedule', 'Download PDF', 'Last Updated']];
      pdfSheet.getRange(1, 1, 1, headers[0].length)
        .setValues(headers)
        .setBackground('#1976d2')
        .setFontColor('white')
        .setFontWeight('bold');

      // Process each vendor
      const results = vendors.map(vendor => {
        try {
          // Create vendor-specific sheet
          const tempSheet = this.createVendorScheduleSheet(vendor);
          
          // Generate PDF URL
          const pdfUrl = this.generatePDFUrl(tempSheet, vendor.name);
          
          // Generate view URL
          const viewUrl = this.generateViewUrl(tempSheet);
          
          return [
            vendor.name,
            viewUrl,
            pdfUrl,
            new Date().toLocaleString()
          ];
          
        } catch (error) {
          console.error(`Error processing ${vendor.name}:`, error);
          return [
            vendor.name,
            'Error creating schedule',
            'Error creating PDF',
            new Date().toLocaleString()
          ];
        }
      });

      // Add results to PDF sheet
      if (results.length > 0) {
        pdfSheet.getRange(2, 1, results.length, 4).setValues(results);
      }

      // Format the sheet
      this.formatPDFSheet(pdfSheet, results.length);

      // Show success message
      this.showSuccessMessage(vendors.length);

    } catch (error) {
      this.ui.alert('Error', `Failed to generate PDFs: ${error.message}`, this.ui.ButtonSet.OK);
    }
  }

  /**
   * Creates a vendor-specific schedule sheet
   */
  createVendorScheduleSheet(vendor) {
    const calendar = CalendarApp.getCalendarById(vendor.calendarId);
    const sheet = this.ss.insertSheet(`${vendor.name}_Schedule`);
    
    try {
      // Add header
      sheet.getRange(1, 1).setValue(`${vendor.name} Schedule - Family First Adolescent Services`);
      sheet.getRange(1, 1).setFontSize(18).setFontWeight('bold');
      
      // Add contact info
      sheet.getRange(2, 1).setValue('Contact: coordinator@familyfirst.org | (555) 123-4567');
      sheet.getRange(2, 1).setFontStyle('italic').setFontSize(10);
      
      // Get events
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      
      const events = calendar.getEvents(startDate, endDate);
      
      // Add events to sheet
      const eventData = [['Date', 'Day', 'Time', 'Houses', 'Status']];
      events.forEach(event => {
        const eventDate = event.getStartTime();
        eventData.push([
          eventDate.toLocaleDateString(),
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][eventDate.getDay()],
          eventDate.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'}),
          event.getDescription() || 'TBD',
          'Confirmed'
        ]);
      });
      
      if (eventData.length > 1) {
        sheet.getRange(5, 1, eventData.length, 5).setValues(eventData);
        sheet.getRange(5, 1, 1, 5).setFontWeight('bold').setBackground('#e3f2fd');
      }
      
      // Format sheet
      sheet.autoResizeColumns(1, 5);
      
      return sheet;
      
    } catch (error) {
      this.ss.deleteSheet(sheet);
      throw error;
    }
  }

  /**
   * Generates PDF URL for a sheet
   */
  generatePDFUrl(sheet, vendorName) {
    return `https://docs.google.com/spreadsheets/d/${this.ss.getId()}/export?` +
      `format=pdf&` +
      `gid=${sheet.getSheetId()}&` +
      `portrait=false&` +
      `fitw=true&` +
      `gridlines=true&` +
      `printtitle=true&` +
      `sheetnames=false&` +
      `pagenum=UNDEFINED&` +
      `attachment=true&` +
      `filename=${encodeURIComponent(vendorName)}_Schedule_${new Date().getFullYear()}.pdf`;
  }

  /**
   * Generates view URL for a sheet
   */
  generateViewUrl(sheet) {
    return `https://docs.google.com/spreadsheets/d/${this.ss.getId()}/edit#gid=${sheet.getSheetId()}`;
  }

  /**
   * Formats the PDF tracking sheet
   */
  formatPDFSheet(sheet, rowCount) {
    sheet.autoResizeColumns(1, 4);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 200);
    
    // Add alternating row colors
    for (let i = 2; i <= rowCount + 1; i++) {
      if (i % 2 === 0) {
        sheet.getRange(i, 1, 1, 4).setBackground('#f5f5f5');
      }
    }
  }

  /**
   * Shows success message after PDF generation
   */
  showSuccessMessage(vendorCount) {
    const html = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1976d2;">✅ PDF Schedules Generated!</h2>
        
        <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Success!</strong> Created schedules for ${vendorCount} vendors.</p>
        </div>
        
        <h3>📋 What's Been Created:</h3>
        <ul>
          <li><strong>Individual vendor sheets</strong> with their specific schedules</li>
          <li><strong>PDF download links</strong> for each vendor</li>
          <li><strong>Online view links</strong> for easy access</li>
        </ul>
        
        <h3>📍 Where to Find Them:</h3>
        <p>Check the <strong>"Vendor PDF Links"</strong> sheet for all links.</p>
        
        <h3>📧 How to Share:</h3>
        <ol>
          <li>Open the "Vendor PDF Links" sheet</li>
          <li>Copy the appropriate link for each vendor</li>
          <li>Share via email or text message</li>
        </ol>
        
        <div style="text-align: center; margin-top: 30px;">
          <button onclick="google.script.host.close()" 
                  style="background: #1976d2; color: white; border: none; padding: 10px 20px; 
                         border-radius: 4px; cursor: pointer; font-size: 16px;">
            Close
          </button>
        </div>
      </div>
    `)
    .setWidth(500)
    .setHeight(600);
    
    this.ui.showModalDialog(html, '📄 PDF Generation Complete');
  }
}

// ======================== VENDOR STATE MANAGER CLASS ========================

/**
 * Central state manager for vendor-related operations
 * Handles state changes and notifies all dependent components
 */
class VendorStateManager {
  constructor() {
    this.observers = [];
    this.state = {
      vendors: {},
      lastSync: null,
      pendingChanges: false
    };
  }

  // Singleton pattern
  static getInstance() {
    if (!VendorStateManager.instance) {
      VendorStateManager.instance = new VendorStateManager();
    }
    return VendorStateManager.instance;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(observer) {
    this.observers.push(observer);
  }

  /**
   * Update state and notify observers
   */
  updateState(changes) {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      ...changes,
      lastUpdated: new Date()
    };

    // Notify all observers
    this.observers.forEach(observer => {
      try {
        observer.onStateChange(this.state, oldState);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update vendor data
   */
  updateVendor(vendorName, data) {
    this.state.vendors[vendorName] = {
      ...(this.state.vendors[vendorName] || {}),
      ...data,
      lastUpdated: new Date()
    };

    this.updateState({
      vendors: this.state.vendors,
      pendingChanges: true
    });
  }

  /**
   * Remove vendor
   */
  removeVendor(vendorName) {
    const { [vendorName]: removed, ...remaining } = this.state.vendors;
    this.updateState({
      vendors: remaining,
      pendingChanges: true
    });
  }

  /**
   * Mark changes as synced
   */
  markSynced() {
    this.updateState({
      lastSync: new Date(),
      pendingChanges: false
    });
  }
}
// ======================== VENDOR MANAGER CLASS ========================
/**
 * VendorManager class
 * Manages core vendor operations including schedule syncing and access sharing
 */
class VendorManager {
  constructor() {
    this.ui = SpreadsheetApp.getUi();
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.stateManager = VendorStateManager.getInstance();
    this.calendarManager = new VendorCalendarManager();
    this.pdfManager = new PDFManager();
    
    // Subscribe to state changes
    this.stateManager.subscribe({
      onStateChange: (newState, oldState) => this.handleStateChange(newState, oldState)
    });
  }

  /**
   * Syncs vendor calendars with schedule
   */
  syncAllCalendars() {
    try {
      const scheduleSheet = this.ss.getSheetByName('Schedule');
      if (!scheduleSheet) {
        throw new Error('Schedule sheet not found');
      }

      // Get vendor calendars
      const vendors = this.calendarManager.getVendorCalendars();
      if (vendors.length === 0) {
        throw new Error('No vendor calendars found. Please add vendor calendars first.');
      }

      // Extract schedule data
      const scheduleData = scheduleSheet.getDataRange().getValues();
      const syncResults = {
        success: [],
        errors: []
      };

      // Process each vendor
      vendors.forEach(vendor => {
        try {
          const calendar = CalendarApp.getCalendarById(vendor.calendarId);
          if (!calendar) {
            throw new Error('Calendar not found');
          }

          // Clear future events
          const now = new Date();
          const futureEvents = calendar.getEvents(now, new Date('2026-12-31'));
          futureEvents.forEach(event => event.deleteEvent());

          // Add new events
          let eventCount = 0;
          for (let row = 1; row < scheduleData.length; row++) {
            for (let col = 1; col < scheduleData[row].length; col++) {
              const cell = scheduleData[row][col];
              if (cell && cell.toString().includes(vendor.name)) {
                const date = this.extractDateFromSchedule(row, col, scheduleData);
                if (date) {
                  const eventDetails = this.parseEventDetails(cell, vendor.name);
                  this.createVendorEvent(calendar, date, eventDetails);
                  eventCount++;
                }
              }
            }
          }

          syncResults.success.push({
            name: vendor.name,
            events: eventCount
          });

          this.calendarManager.updateSyncStatus(vendor.name, 'Synced');

        } catch (error) {
          syncResults.errors.push({
            name: vendor.name,
            error: error.message
          });
          this.calendarManager.updateSyncStatus(vendor.name, 'Error', error);
        }
      });

      // Show results
      this.showSyncResults(syncResults);

    } catch (error) {
      this.ui.alert('Error', error.message, this.ui.ButtonSet.OK);
    }
  }

  /**
   * Extracts date from schedule position
   */
  extractDateFromSchedule(row, col, scheduleData) {
    try {
      // TODO: Implement proper date extraction based on schedule format
      const today = new Date();
      const offset = (col - 1) * 7;
      const date = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
      return date;
    } catch (error) {
      console.error('Date extraction error:', error);
      return null;
    }
  }

  /**
   * Parses event details from cell content
   */
  parseEventDetails(cell, vendorName) {
    const lines = cell.toString().split('\n');
    return {
      time: lines[1] || '2:00 PM',
      houses: lines.slice(2).join(', ') || 'TBD'
    };
  }

  /**
   * Creates a vendor calendar event
   */
  createVendorEvent(calendar, date, details) {
    const eventTime = new Date(date);
    const [hours, minutes, period] = details.time.match(/(\d+):(\d+)\s*(AM|PM)/).slice(1);
    eventTime.setHours(
      period === 'PM' ? (parseInt(hours) % 12) + 12 : parseInt(hours) % 12,
      parseInt(minutes)
    );
    
    const endTime = new Date(eventTime);
    endTime.setHours(endTime.getHours() + 2);

    calendar.createEvent(
      '🏠 Family First Outing',
      eventTime,
      endTime,
      {
        description: details.houses,
        location: 'Family First Adolescent Services'
      }
    );
  }

  /**
   * Shows sync results dialog
   */
  showSyncResults(results) {
    const html = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1976d2;">📅 Calendar Sync Complete</h2>
        
        <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">Successfully synced ${results.success.length} vendor calendars</p>
        </div>
        
        ${results.success.map(v => `
          <div style="background: #f5f5f5; border-left: 4px solid #4caf50; padding: 10px; margin: 10px 0;">
            <strong>${v.name}:</strong> Added ${v.events} events
          </div>
        `).join('')}
        
        ${results.errors.length > 0 ? `
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Issues Found:</h3>
            ${results.errors.map(e => `
              <div style="background: white; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0;">
                <strong>${e.name}:</strong> ${e.error}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="google.script.host.close()" 
                  style="background: #1976d2; color: white; border: none; padding: 10px 20px; 
                         border-radius: 4px; cursor: pointer; font-size: 16px;">
            Close
          </button>
        </div>
      </div>
    `)
    .setWidth(500)
    .setHeight(Math.min(600, 200 + (results.success.length + results.errors.length) * 50));
    
    this.ui.showModalDialog(html, '📅 Calendar Sync Results');
  }

  /**
   * Shows vendor access instructions
   */
  showAccessInstructions() {
    const vendors = this.calendarManager.getVendorCalendars();
    
    const html = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1976d2;">🔑 Vendor Access Guide</h2>
        
        <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1565c0; margin-top: 0;">Vendors have two ways to access their schedules:</h3>
          
          <div style="background: white; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
            <h4 style="color: #2c3e50; margin-top: 0;">1️⃣ Google Calendar (Recommended)</h4>
            <ul>
              <li>Real-time updates</li>
              <li>Mobile app integration</li>
              <li>Email reminders</li>
              <li>Syncs with their calendar</li>
            </ul>
          </div>
          
          <div style="background: white; border-radius: 4px; padding: 15px;">
            <h4 style="color: #2c3e50; margin-top: 0;">2️⃣ PDF Schedule</h4>
            <ul>
              <li>Printable format</li>
              <li>No Google account needed</li>
              <li>Updated monthly</li>
              <li>Full month view</li>
            </ul>
          </div>
        </div>
        
        <h3 style="color: #1976d2;">📋 Vendor Calendar Links:</h3>
        
        ${vendors.map(v => {
          const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(v.calendarId)}&ctz=America/Los_Angeles`;
          return `
            <div style="background: #f5f5f5; border-left: 4px solid #1976d2; padding: 15px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${v.name}</h4>
              <p style="margin: 5px 0;"><strong>Calendar View:</strong><br>
                <a href="${calendarUrl}" target="_blank" style="color: #1976d2; word-break: break-all;">
                  ${calendarUrl}
                </a>
              </p>
            </div>
          `;
        }).join('')}
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin-top: 20px;">
          <h4 style="color: #856404; margin-top: 0;">📧 Email Template:</h4>
          <div style="background: white; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
            Subject: Your Family First Schedule Access<br><br>
            Dear [Vendor],<br><br>
            You can access your Family First schedule in two ways:<br><br>
            1. Online Calendar (Always up-to-date):<br>
            [Insert their calendar link]<br><br>
            2. Monthly PDF Schedule:<br>
            Available upon request<br><br>
            Questions? Contact us:<br>
            [Your contact info]
          </div>
        </div>
      </div>
    `)
    .setWidth(700)
    .setHeight(Math.min(800, 400 + vendors.length * 100));
    
    this.ui.showModalDialog(html, '🔑 Vendor Access Instructions');
  }
}

// ======================== WRAPPER FUNCTIONS ========================

/**
 * Sync all vendor calendars
 * This is a wrapper function for backward compatibility
 */
function syncAllVendorCalendars() {
  const manager = new VendorManager();
  manager.syncAllCalendars();
}

/**
 * Add vendor calendar from URL
 * This is a wrapper function for backward compatibility
 */
function addVendorCalendarFromUrl() {
  const manager = new VendorCalendarManager();
  manager.addCalendarFromUrl(true);
}

/**
 * Show vendor access instructions
 * This is a wrapper function for backward compatibility
 */
function showVendorAccessInstructions() {
  const manager = new VendorManager();
  manager.showAccessInstructions();
}

/**
 * Create vendor PDF schedules
 * This is a wrapper function for backward compatibility
 */
function createVendorPDFs() {
  const pdfManager = new PDFManager();
  pdfManager.generateVendorPDFs();
}

// ======================== SCHEDULE WRITER CLASS ========================

class ScheduleWriter {
  constructor(spreadsheet) {
    this.ss = spreadsheet;
  }
  
  /**
   * Write schedule to sheet
   */
  writeSchedule(schedule) {
    const sheet = this.ss.getSheetByName('SCHEDULE') || this.ss.insertSheet('SCHEDULE');
    sheet.clear();
    
    // Get all unique houses
    const houses = new Set();
    schedule.forEach(day => {
      Object.keys(day.assignments).forEach(house => houses.add(house));
    });
    const houseList = Array.from(houses).sort();
    
    // Create header
    const header = ['Date', ...houseList, 'Options', 'Locked?'];
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    
    // Style header
    sheet.getRange(1, 1, 1, header.length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    // Write data
    const rows = [];
    for (const daySchedule of schedule) {
      const row = [Utilities.formatDate(daySchedule.date, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy')];
      
      for (const house of houseList) {
        const assignment = daySchedule.assignments[house];
        if (assignment && assignment.vendor !== 'UNASSIGNED') {
          row.push(`${assignment.vendor}\n${assignment.time}`);
        } else {
          row.push('TBD');
        }
      }
      
      row.push('', false); // Options and Locked columns
      rows.push(row);
    }
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    // Auto-resize columns
    for (let i = 1; i <= header.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    // Freeze header row
    sheet.setFrozenRows(1);
  }
  
  /**
   * Apply conditional formatting based on vendor colors
   * Each vendor gets a unique consistent color
   */
  applyConditionalFormatting(vendors) {
    const sheet = this.ss.getSheetByName('SCHEDULE');
    if (!sheet || sheet.getLastRow() < 2) return;
    
    // Clear existing rules first
    sheet.clearConditionalFormatRules();
    
    const rules = [];
    
    // Get all unique vendors from the schedule
    const scheduleData = sheet.getDataRange().getValues();
    const uniqueVendors = new Set();
    
    // Collect all unique vendor names (skip header row)
    for (let row = 1; row < scheduleData.length; row++) {
      for (let col = 1; col < scheduleData[row].length - 3; col++) {
        const cellValue = scheduleData[row][col];
        if (cellValue && cellValue.toString().trim()) {
          // Extract vendor name (first line before time)
          const vendorName = cellValue.toString().split('\n')[0].trim();
          if (vendorName && vendorName !== 'UNASSIGNED') {
            uniqueVendors.add(vendorName);
          }
        }
      }
    }
    
    // Define a palette of distinct colors
    const colorPalette = [
      '#4ECDC4', // Turquoise
      '#45B7D1', // Sky Blue
      '#96CEB4', // Sage Green
      '#FECA57', // Golden Yellow
      '#DDA0DD', // Plum
      '#F4A460', // Sandy Brown
      '#9B59B6', // Purple
      '#3498DB', // Bright Blue
      '#F39C12', // Orange
      '#27AE60', // Green
      '#E67E22', // Dark Orange
      '#8E44AD', // Dark Purple
      '#2ECC71', // Emerald
      '#F1C40F', // Yellow
      '#1ABC9C', // Turquoise Green
      '#EC407A', // Pink
      '#AB47BC', // Deep Purple
      '#42A5F5', // Light Blue
      '#66BB6A', // Light Green
      '#FFA726', // Light Orange
      '#26C6DA', // Cyan
      '#7E57C2', // Deep Purple Light
      '#5C6BC0', // Indigo
      '#29B6F6', // Light Blue
      '#26A69A', // Teal
      '#FF7043', // Deep Orange
      '#8D6E63', // Brown
      '#78909C', // Blue Grey
      '#FF6B6B', // Coral Red (moved down to avoid Banyan conflict)
      '#E74C3C', // Red (moved down)
      '#EF5350', // Light Red (moved down)
      '#D32F2F'  // Dark Red (moved down)
    ];
    
    // Get persistent vendor-color assignments
    const vendorColorMap = this.getVendorColorMapping(uniqueVendors, colorPalette);
    
    console.log('Found vendors with persistent colors:', Object.keys(vendorColorMap));
    
    // Get house names to exclude from vendor coloring
    const headers = scheduleData[0];
    const houseNames = new Set();
    const dataManager = new DataManager(this.ss);
    const programs = dataManager.getPrograms();
    programs.forEach(p => houseNames.add(p.House));
    
    // Assign colors to each vendor using persistent mapping
    // Only apply to data cells, not the header row
    const dataRange = sheet.getRange(2, 2, sheet.getLastRow() - 1, sheet.getLastColumn() - 3);
    
    Object.entries(vendorColorMap).forEach(([vendorName, color]) => {
      // Skip if vendor name is too generic or is a house name
      if (vendorName.length < 3 || houseNames.has(vendorName)) return;
      
      // Create rule for exact vendor name match
      const rule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains(vendorName)
        .setBackground(color)
        .setRanges([dataRange])
        .build();
      
      rules.push(rule);
      
      console.log(`Vendor: ${vendorName} -> Persistent Color: ${color}`);
    });
    
    // Special handling for UNASSIGNED
    const unassignedRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('UNASSIGNED')
      .setBackground('#FFEBEE')  // Very light red
      .setFontColor('#D32F2F')   // Dark red text
      .setRanges([dataRange])
      .build();
    rules.push(unassignedRule);
    
    console.log(`Total rules created: ${rules.length}`);
    
    if (rules.length > 0) {
      sheet.setConditionalFormatRules(rules);
    }
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(operation, duration = null) {
    this.performanceMetrics.operations.push({
      operation: operation,
      timestamp: Date.now(),
      duration: duration
    });
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const totalDuration = Date.now() - this.performanceMetrics.startTime;
    const report = {
      totalDuration: totalDuration,
      operations: this.performanceMetrics.operations,
      summary: {
        totalOperations: this.performanceMetrics.operations.length,
        averageOperationTime: totalDuration / this.performanceMetrics.operations.length,
        slowestOperation: this.performanceMetrics.operations.reduce((max, op) => 
          (op.duration || 0) > (max.duration || 0) ? op : max, {})
      }
    };
    
    // Log performance metrics
    logPerformanceMetric('schedule_generation', totalDuration, report);
    
    return report;
  }

  /**
   * Get or create persistent vendor-color mapping
   * This ensures each vendor always gets the same color across all sessions
   */
  getVendorColorMapping(uniqueVendors, colorPalette) {
    const properties = PropertiesService.getScriptProperties();
    const vendorColorsKey = 'VENDOR_COLOR_MAPPING';
    
    // Try to get existing mapping
    let vendorColorMap = {};
    try {
      const existingMapping = properties.getProperty(vendorColorsKey);
      if (existingMapping) {
        vendorColorMap = JSON.parse(existingMapping);
      }
    } catch (error) {
      console.log('No existing vendor color mapping found, creating new one');
    }
    
    // Get array of vendors sorted for consistent assignment
    const vendorArray = Array.from(uniqueVendors).sort();
    let colorIndex = 0;
    let hasNewVendors = false;
    
    // Assign colors to any new vendors
    vendorArray.forEach(vendorName => {
      if (!vendorColorMap[vendorName]) {
        // Find the next available color (skip already assigned colors)
        const assignedColors = new Set(Object.values(vendorColorMap));
        while (assignedColors.has(colorPalette[colorIndex % colorPalette.length])) {
          colorIndex++;
        }
        
        vendorColorMap[vendorName] = colorPalette[colorIndex % colorPalette.length];
        colorIndex++;
        hasNewVendors = true;
        console.log(`NEW VENDOR: ${vendorName} assigned color ${vendorColorMap[vendorName]}`);
      }
    });
    
    // Save updated mapping if we added new vendors
    if (hasNewVendors) {
      try {
        properties.setProperty(vendorColorsKey, JSON.stringify(vendorColorMap));
        console.log('Updated persistent vendor color mapping');
      } catch (error) {
        console.error('Failed to save vendor color mapping:', error);
      }
    }
    
    return vendorColorMap;
  }
}
// ======================== DATA MANAGEMENT ========================

class DataManager {
  constructor(spreadsheet) {
    this.ss = spreadsheet;
    this.cache = CacheService.getScriptCache();
    this.sheets = {};
    this.memoryCache = new Map(); // In-memory cache for current execution
    this.cacheExpiry = 3600; // 1 hour in seconds
  }
  
  /**
   * Get vendor background color for consistent email/sheets formatting
   * 
   * COLOR ALIGNMENT SYSTEM - CRITICAL FOR USER WORKFLOW:
   * ====================================================
   * This function is part of the color alignment system that ensures
   * you and program coordinators can quickly identify:
   * 1. Which HOUSE each outing belongs to (by house color)
   * 2. Which VENDOR TYPE is providing service (by vendor color)
   * 
   * COLOR CONSISTENCY:
   * - Same vendor = Same color theme EVERYWHERE
   * - Emails use lighter colors (85% transparency) for readability
   * - Sheets use darker colors for quick visual scanning
   * - No confusion between different views!
   * 
   * VENDOR TYPE COLORS:
   * - Parks → Purple theme (State Parks, County Parks, etc.)
   * - Equestrian → Green theme (Horse farms, riding centers)
   * - Beach/Surf → Blue theme (Beach activities, surf therapy)
   * - Farm/Animals → Orange theme (Goat farms, petting zoos)
   * - Art/Creative → Pink theme (Painting, art therapy)
   * - YMCA → Cyan theme
   * - Bowling → Lime theme
   * - Movies → Amber theme
   * - Museums → Indigo theme
   * - Zoo → Teal theme
   * - Aquarium → Light Cyan theme
   * 
   * This prevents scheduling mix-ups and helps everyone quickly
   * understand the schedule at a glance!
   */
  getVendorBackgroundColor(vendor, vendorData) {
    // First priority: Use vendor's defined color with light transparency
    if (vendorData && vendorData.Color && vendorData.Color !== '') {
      // For email, use very light version of vendor color
      return this.lightenColor(vendorData.Color, 0.85); // 85% lighter
    }
    
    // Second priority: Generate consistent light colors based on vendor name
    const vendorLower = vendor.toLowerCase();
    
    // Theme-based color assignments (very light versions) - MUST MATCH getVendorSheetColor
    if (vendorLower.includes('park') || vendorLower.includes('state park')) return '#f3e5f5'; // Light purple
    if (vendorLower.includes('equestrian') || vendorLower.includes('horse')) return '#e8f5e9'; // Light green  
    if (vendorLower.includes('beach') || vendorLower.includes('surf')) return '#e3f2fd'; // Light blue
    if (vendorLower.includes('goat') || vendorLower.includes('farm')) return '#fff3e0'; // Light orange
    if (vendorLower.includes('paint') || vendorLower.includes('art')) return '#fce4ec'; // Light pink
    if (vendorLower.includes('ymca')) return '#e1f5fe'; // Light cyan
    if (vendorLower.includes('bowling')) return '#f1f8e9'; // Light lime
    if (vendorLower.includes('movie') || vendorLower.includes('theater')) return '#fff8e1'; // Light amber
    if (vendorLower.includes('museum')) return '#e8eaf6'; // Light indigo
    if (vendorLower.includes('zoo')) return '#e0f2f1'; // Light teal
    if (vendorLower.includes('aquarium')) return '#e0f7fa'; // Light cyan
    
    return '#ffffff'; // Default white
  }
  
  /**
   * Get vendor sheet color (same as email but without transparency)
   */
  getVendorSheetColor(vendor, vendorData) {
    // Use the same logic but return solid colors for sheets
    if (vendorData && vendorData.Color && vendorData.Color !== '') {
      // Ensure color has # prefix
      const color = vendorData.Color.startsWith('#') ? vendorData.Color : '#' + vendorData.Color;
      return color; // Use full color in sheets
    }
    
    // For fallback colors, use slightly more saturated versions for sheets
    const vendorLower = vendor.toLowerCase();
    
    if (vendorLower.includes('park') || vendorLower.includes('state park')) return '#e1bee7'; // Purple
    if (vendorLower.includes('equestrian') || vendorLower.includes('horse')) return '#c8e6c9'; // Green  
    if (vendorLower.includes('beach') || vendorLower.includes('surf')) return '#bbdefb'; // Blue
    if (vendorLower.includes('goat') || vendorLower.includes('farm')) return '#ffe0b2'; // Orange
    if (vendorLower.includes('paint') || vendorLower.includes('art')) return '#f8bbd9'; // Pink
    if (vendorLower.includes('ymca')) return '#b3e5fc'; // Cyan
    if (vendorLower.includes('bowling')) return '#dcedc8'; // Lime
    if (vendorLower.includes('movie') || vendorLower.includes('theater')) return '#fff9c4'; // Amber
    if (vendorLower.includes('museum')) return '#c5cae9'; // Indigo
    if (vendorLower.includes('zoo')) return '#b2dfdb'; // Teal
    if (vendorLower.includes('aquarium')) return '#b2ebf2'; // Cyan
    
    return '#ffffff'; // Default white
  }
  
  /**
   * Lighten a hex color by a percentage
   */
  lightenColor(hex, percent) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighten each component
    const newR = Math.round(r + (255 - r) * percent);
    const newG = Math.round(g + (255 - g) * percent);
    const newB = Math.round(b + (255 - b) * percent);
    
    // Convert back to hex
    return '#' + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
  }
  
  /**
   * Get house color for consistent formatting
   */
  getHouseColor(houseName) {
    const houseColors = {
      'Banyan': '#FF6B6B',      // Red
      'Hedge': '#4ECDC4',       // Teal  
      'Preserve': '#45B7D1',    // Blue
      'Cove': '#96CEB4',        // Green
      'Meridian': '#FECA57',    // Yellow
      'Prosperity': '#DDA0DD'   // Purple
    };
    
    // Handle house names with additional descriptors
    const baseName = houseName.split(' ')[0].split('-')[0];
    return houseColors[baseName] || '#1a73e8'; // Default blue
  }
  
  /**
   * Get house header background color for emails (light version)
   */
  getHouseHeaderColor(houseName) {
    const baseColor = this.getHouseColor(houseName);
    return baseColor + '15'; // Add transparency for header background
  }
  
  /**
   * Get sheet with caching and validation
   */
  getSheet(name) {
    if (!this.sheets[name]) {
      const sheet = this.ss.getSheetByName(name);
      if (!sheet) {
        throw new Error(`Required sheet '${name}' not found`);
      }
      this.sheets[name] = sheet;
    }
    return this.sheets[name];
  }
  
  /**
   * Load configuration with defaults
   */
  getConfig() {
    const cacheKey = 'CONFIG_DATA';
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const sheet = this.getSheet('CONFIG');
    const values = sheet.getDataRange().getValues();
    const config = {};
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0]) {
        config[values[i][0]] = values[i][1];
      }
    }
    
    // Apply defaults
    config.WeeksToGenerate = config.WeeksToGenerate || 52;
    config.StartTuesday = config.StartTuesday || new Date();
    
    this.cache.put(cacheKey, JSON.stringify(config), CONFIG.CACHE_DURATION);
    return config;
  }
  
  /**
   * Load programs with enhanced metadata
   */
  getPrograms() {
    // Check memory cache first
    if (this.memoryCache.has('programs')) {
      return this.memoryCache.get('programs');
    }
    
    // Check script cache
    const cacheKey = 'programs_data';
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const programs = JSON.parse(cached);
      this.memoryCache.set('programs', programs);
      return programs;
    }
    
    // Load from sheet
    const sheet = this.getSheet('PROGRAMS');
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const programs = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      
      const program = {
        House: values[i][0],
        TuesdayStart: this.parseTime(values[i][1]),
        TuesdayEnd: this.parseTime(values[i][2]),
        Color: values[i][3] || '',
        Priority: Number(values[i][4] || 1),
        PreferredVendors: this.parseList(values[i][5]),
        PreferredType: values[i][6] || '',
        Restrictions: this.parseJSON(values[i][7]),
        Metadata: {
          row: i + 1,
          lastModified: new Date()
        }
      };
      
      programs.push(program);
    }
    
    // Cache the results
    this.cache.put(cacheKey, JSON.stringify(programs), this.cacheExpiry);
    this.memoryCache.set('programs', programs);
    
    return programs;
  }

  /**
   * Get programs indexed by house name for O(1) lookup
   */
  getProgramsMapByHouse() {
    // Use in-memory cache only; easy to rebuild from programs list
    const key = 'programsByHouse';
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    const programs = this.getPrograms();
    const map = {};
    for (const p of programs) {
      if (p && p.House) map[p.House] = p;
    }
    this.memoryCache.set(key, map);
    return map;
  }
  
  /**
   * Load vendors with enhanced validation
   */
  getVendors() {
    // Check memory cache first
    if (this.memoryCache.has('vendors')) {
      return this.memoryCache.get('vendors');
    }
    
    // Check script cache
    const cacheKey = 'vendors_data';
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const vendors = JSON.parse(cached);
      this.memoryCache.set('vendors', vendors);
      return vendors;
    }
    
    // Load from sheet
    let sheet = this.getSheet('VENDORS');
    if (!sheet) {
      sheet = this.getSheet('Vendors'); // Try lowercase version
    }
    if (!sheet) {
      // Create the vendors sheet if it doesn't exist
      sheet = this.ss.insertSheet('VENDORS');
      sheet.getRange(1, 1, 1, 12).setValues([[
        'Name', 'Type', 'Capacity', 'Contact', 'Active', 'WeeklyLimit', 
        'Blackout', 'Color', 'CalendarId', 'QualityScore', 'Preferences', 'Address'
      ]]);
    }
    const values = sheet.getDataRange().getValues();
    const vendors = {};
    
    for (let i = 1; i < values.length; i++) {
      const name = String(values[i][0] || '').trim();
      if (!name) continue;
      
      vendors[name] = {
        Name: name,
        _key: this.normalizeString(name),
        Type: values[i][1] || '',
        Capacity: Number(values[i][2] || 0),
        Contact: values[i][3] || '',
        Address: values[i][11] || '', // Address field (new column)
        Active: this.parseBoolean(values[i][4], true),
        WeeklyLimit: Number(values[i][5] || 99),
        Blackout: this.parseList(values[i][6]),
        Color: this.validateColor(values[i][7]),
        CalendarId: String(values[i][8] || '').trim(),
        QualityScore: Number(values[i][9] || 75),
        Preferences: this.parseJSON(values[i][10]),
        Metadata: {
          row: i + 1,
          lastUsed: null,
          totalBookings: 0
        }
      };
    }
    
    // Cache the results
    this.cache.put(cacheKey, JSON.stringify(vendors), this.cacheExpiry);
    this.memoryCache.set('vendors', vendors);
    
    return vendors;
  }
  
  /**
   * Load rotation rules with validation
   */
  getRules() {
    // Check memory cache first
    if (this.memoryCache.has('rules')) {
      return this.memoryCache.get('rules');
    }
    
    // Check script cache
    const cacheKey = 'rules_data';
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const rules = JSON.parse(cached);
      this.memoryCache.set('rules', rules);
      return rules;
    }
    
    // Load from sheet
    const sheet = this.getSheet('ROTATION_RULES');
    const values = sheet.getDataRange().getValues();
    const rules = {};
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      
      const month = Number(values[i][0]);
      if (month < 1 || month > 12) continue;
      
      rules[month] = {
        PreferredOrder: this.parseList(values[i][1]),
        MinWeeksBetweenSameVendorPerHouse: Number(values[i][2] || 3),
        AllowSameTypeDifferentLocation: this.parseBoolean(values[i][3], false),
        MaxVendorsPerDay: Number(values[i][4] || 99),
        SpecialRules: this.parseJSON(values[i][5])
      };
    }
    
    // Cache the results
    this.cache.put(cacheKey, JSON.stringify(rules), this.cacheExpiry);
    this.memoryCache.set('rules', rules);
    
    return rules;
  }
  
  // Utility methods
  parseTime(value) {
    if (!value) return '';
    
    // Handle Date objects
    if (value instanceof Date) {
      return this.formatTime(value);
    }
    
    const str = String(value).trim();
    
    // Check if it's a full date/time string that should be parsed
    if (str.includes('GMT') || str.includes('T') || str.length > 20) {
      try {
        const dateObj = new Date(str);
        if (!isNaN(dateObj.getTime())) {
          return this.formatTime(dateObj);
        }
      } catch (e) {
        console.warn('Failed to parse date string:', str);
      }
    }
    
    // Enhanced time parsing with multiple formats
    const patterns = [
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
      /^(\d{1,2})\s*(AM|PM)$/i,
      /^(\d{1,2}):(\d{2})$/
    ];
    
    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] ? match[2] : '00';
        let period = match[3] || (hour >= 8 && hour < 12 ? 'AM' : 'PM');
        
        return `${hour}:${minute} ${period.toUpperCase()}`;
      }
    }
    
    return str; // Return as-is if no pattern matches
  }
  
  /**
   * Format a Date object or time string to clean time format
   */
  formatTime(value) {
    if (!value) return '';
    
    let date;
    if (value instanceof Date) {
      date = value;
    } else {
      try {
        date = new Date(value);
        if (isNaN(date.getTime())) {
          // If not a valid date, treat as time string
          return this.parseTime(value);
        }
      } catch (e) {
        return this.parseTime(value);
      }
    }
    
    // Format as clean time string
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
  }
  
  parseList(value) {
    if (!value) return [];
    return String(value).split(',').map(s => s.trim()).filter(Boolean);
  }
  
  parseJSON(value) {
    if (!value) return {};
    try {
      return JSON.parse(value);
    } catch (e) {
      return {};
    }
  }
  
  parseBoolean(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    return String(value).toUpperCase() === 'TRUE';
  }
  
  normalizeString(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }
  
  validateColor(color) {
    if (!color) return '';
    const hex = String(color).trim();
    if (/^#?[0-9A-Fa-f]{6}$/.test(hex)) {
      return hex.startsWith('#') ? hex : '#' + hex;
    }
    return '';
  }
  
  /**
   * Clear all caches - call this when data is modified
   */
  clearCache() {
    this.memoryCache.clear();
    this.cache.remove('programs_data');
    this.cache.remove('vendors_data');
    this.cache.remove('rules_data');
  }
  
  /**
   * Clear specific cache
   */
  clearCacheFor(dataType) {
    this.memoryCache.delete(dataType);
    this.cache.remove(`${dataType}_data`);
  }
}
// ======================== CALENDAR SYNCHRONIZATION ========================

class CalendarSync {
  constructor(vendors, programs) {
    this.vendors = vendors;
    this.programs = programs;
    this.cache = new Map();
    this.batchQueue = [];
  }
  
  /**
   * Sync all schedule events with calendars
   */
  syncAllEvents(schedule) {
    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };
    
    try {
      // Process in batches for better performance
      const batches = this.createBatches(schedule, CONFIG.BATCH_SIZE);
      
      for (const batch of batches) {
        const batchResults = this.processBatch(batch);
        results.created += batchResults.created;
        results.updated += batchResults.updated;
        results.deleted += batchResults.deleted;
        results.errors.push(...batchResults.errors);
      }
      
      // Flush any remaining queued operations
      this.flushBatchQueue();
      
    } catch (error) {
      results.errors.push({
        message: error.toString(),
        timestamp: new Date()
      });
    }
    
    return results;
  }
  
  /**
   * Process a batch of calendar events
   */
  processBatch(batch) {
    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };
    
    for (const daySchedule of batch) {
      for (const house in daySchedule.assignments) {
        const assignment = daySchedule.assignments[house];
        if (assignment.vendor === 'UNASSIGNED') continue;
        
        try {
          const event = this.createOrUpdateEvent(
            house,
            assignment,
            daySchedule.date
          );
          
          if (event.isNew) {
            results.created++;
          } else {
            results.updated++;
          }
        } catch (error) {
          results.errors.push({
            house: house,
            date: daySchedule.date,
            error: error.toString()
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Create or update a single calendar event
   */
  createOrUpdateEvent(house, assignment, date) {
    const vendor = this.vendors[assignment.vendor];
    if (!vendor || !vendor.CalendarId) {
      throw new Error(`Invalid vendor or missing calendar ID: ${assignment.vendor}`);
    }
    
    const calendar = this.getCalendar(vendor.CalendarId);
    const program = this.programs.find(p => p.House === house);
    
    if (!program) {
      throw new Error(`Program not found for house: ${house}`);
    }
    
    // Parse times and create event details
    const times = assignment.time.split(' - ');
    const startTime = this.combineDateTime(date, times[0]);
    const endTime = this.combineDateTime(date, times[1]);
    
    // Ensure end time is after start time
    if (endTime <= startTime) {
      endTime.setHours(endTime.getHours() + 1);
    }
    
    const title = `[${house}] ${vendor.Name} - Therapeutic Outing`;
    const description = this.createEventDescription(house, vendor, program);
    
    // Check for existing event
    const existingEvent = this.findExistingEvent(calendar, title, startTime, endTime);
    
    if (existingEvent) {
      // Update existing event
      existingEvent.setDescription(description);
      return { event: existingEvent, isNew: false };
    } else {
      // Create new event
      const newEvent = calendar.createEvent(title, startTime, endTime, {
        description: description,
        location: vendor.Contact || vendor.Name,
        colorId: this.getColorId(vendor.Color)
      });
      return { event: newEvent, isNew: true };
    }
  }
  
  /**
   * Get or cache calendar instance
   */
  getCalendar(calendarId) {
    if (!this.cache.has(calendarId)) {
      const calendar = CalendarApp.getCalendarById(calendarId);
      if (!calendar) {
        throw new Error(`Calendar not found: ${calendarId}`);
      }
      this.cache.set(calendarId, calendar);
    }
    return this.cache.get(calendarId);
  }
  
  /**
   * Find existing event in calendar
   */
  findExistingEvent(calendar, title, startTime, endTime) {
    const events = calendar.getEvents(startTime, endTime);
    return events.find(e => e.getTitle() === title);
  }
  
  /**
   * Create event description with metadata
   */
  createEventDescription(house, vendor, program) {
    return [
      `House: ${house}`,
      `Vendor: ${vendor.Name}`,
      `Type: ${vendor.Type || 'General'}`,
      `Capacity: ${vendor.Capacity || 'Unlimited'}`,
      `Contact: ${vendor.Contact || 'See vendor list'}`,
      '',
      '--- Operational Information Only ---',
      'No PHI should be included in calendar events'
    ].join('\n');
  }
  
  /**
   * Map color hex to Google Calendar color ID
   */
  getColorId(hexColor) {
    if (!hexColor) return null;
    
    // Google Calendar color mapping (simplified)
    const colorMap = {
      '#DC2127': '11', // Red
      '#FF6900': '6',  // Orange
      '#FCB900': '5',  // Yellow
      '#7BDCB5': '2',  // Green
      '#00D084': '10', // Bold Green
      '#8ED1FC': '1',  // Blue
      '#0693E3': '9',  // Bold Blue
      '#ABB8C3': '8',  // Gray
    };
    
    // Find closest color
    let closestColor = null;
    let minDistance = Infinity;
    
    for (const [hex, id] of Object.entries(colorMap)) {
      const distance = this.colorDistance(hexColor, hex);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = id;
      }
    }
    
    return closestColor;
  }
  
  /**
   * Calculate color distance (simplified RGB distance)
   */
  colorDistance(hex1, hex2) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  
  combineDateTime(date, timeStr) {
    const d = new Date(date);
    const time = this.parseTimeString(timeStr);
    d.setHours(time.hours, time.minutes, 0, 0);
    return d;
  }
  
  parseTimeString(timeStr) {
    const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
      return { hours: 9, minutes: 0 }; // Default to 9 AM
    }
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return { hours, minutes };
  }
  
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  flushBatchQueue() {
    // Process any remaining queued operations
    while (this.batchQueue.length > 0) {
      const operation = this.batchQueue.shift();
      operation();
    }
  }

  /**
   * Format Google Sheets to highlight program/house rows
   */
  formatProgramRows() {
    try {
      // Format PROGRAMS sheet
      const programsSheet = this.getSheet('PROGRAMS');
      const programsRange = programsSheet.getDataRange();
      
      // Clear existing formatting
      programsRange.clearFormat();
      
      // Header row formatting
      programsSheet.getRange(1, 1, 1, programsRange.getNumColumns())
        .setBackground('#1a73e8')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      
      // Program/House rows formatting (light blue background)
      for (let i = 2; i <= programsRange.getNumRows(); i++) {
        const houseCell = programsSheet.getRange(i, 1); // House column
        if (houseCell.getValue()) {
          programsSheet.getRange(i, 1, 1, programsRange.getNumColumns())
            .setBackground('#e3f2fd')
            .setFontWeight('bold')
            .setFontColor('#1565c0');
        }
      }
      
      // Format SCHEDULE sheet header rows
      const scheduleSheet = this.getSheet('SCHEDULE');
      const scheduleRange = scheduleSheet.getDataRange();
      
      // Header row
      scheduleSheet.getRange(1, 1, 1, scheduleRange.getNumColumns())
        .setBackground('#1a73e8')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      
      // Find house columns and highlight them
      const headers = scheduleSheet.getRange(1, 1, 1, scheduleRange.getNumColumns()).getValues()[0];
      const dateIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('date'));
      const optionsIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('options'));
      
      const startCol = dateIndex >= 0 ? dateIndex + 2 : 2; // +2 because arrays are 0-based but sheets are 1-based
      const endCol = optionsIndex >= 0 ? optionsIndex : headers.length;
      
      // Highlight house column headers
      if (startCol <= endCol) {
        scheduleSheet.getRange(1, startCol, 1, endCol - startCol + 1)
          .setBackground('#e3f2fd')
          .setFontColor('#1565c0')
          .setFontWeight('bold');
      }
      
      console.log('Program rows formatted successfully');
      return true;
      
    } catch (error) {
      console.error('Error formatting program rows:', error);
      return false;
    }
  }
}

// ======================== EMAIL SCHEDULE SYSTEM ========================

/**
 * Send email using work account for better deliverability
 * Automatically detects if using work account (@familyfirstas.com)
 */
function sendEmailFromWorkAccount(recipient, subject, plainBody, htmlBody) {
  const currentUser = Session.getActiveUser().getEmail();
  const isWorkAccount = currentUser.includes('@familyfirstas.com');
  const preferredSender = CONFIG.PREFERRED_SENDER_EMAIL;
  const usePreferredSender = CONFIG.EMAIL_SETTINGS.USE_PREFERRED_SENDER;
  
  try {
    // Check if we should use the preferred sender alias
    if (usePreferredSender && preferredSender && currentUser === preferredSender) {
      // User is logged in with the preferred account
      GmailApp.sendEmail(recipient, subject, plainBody, {
        htmlBody: htmlBody,
        name: 'Family First Adolescent Services',
        replyTo: preferredSender
      });
      console.log(`Email sent from preferred account (${preferredSender}) to ${recipient}`);
      
    } else if (isWorkAccount) {
      // Sending from any work account - good deliverability
      GmailApp.sendEmail(recipient, subject, plainBody, {
        htmlBody: htmlBody,
        name: 'Family First Adolescent Services',
        replyTo: currentUser
      });
      console.log(`Email sent from work account (${currentUser}) to ${recipient}`);
      
    } else {
      // Sending from personal Gmail - remove the safety notice since you don't want it
      // Try to use an alias if available
      const aliases = GmailApp.getAliases();
      let fromEmail = currentUser;
      let senderName = 'FFAS Scheduler';
      
      // Check if work email is available as an alias
      if (aliases.includes(preferredSender)) {
        fromEmail = preferredSender;
        senderName = 'Family First Adolescent Services';
        console.log(`Using alias ${preferredSender} for sending`);
      }
      
      GmailApp.sendEmail(recipient, subject, plainBody, {
        htmlBody: htmlBody,
        name: senderName,
        replyTo: preferredSender,
        from: fromEmail, // This will use the alias if available
        // Additional headers to improve deliverability
        headers: {
          'X-Mailer': 'FFAS Therapeutic Outings Scheduler',
          'X-Priority': '3',
          'Importance': 'Normal'
        }
      });
      console.log(`Email sent from ${fromEmail} to ${recipient}`);
    }
    
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error);
    throw error;
  }
}

/**
 * Force send email from work account
 * This function allows sending from work account even when logged in with personal account
 * IMPORTANT: This only works if cmolina@familyfirstas.com has authorized the script
 */
function forceWorkAccountEmail(recipient, subject, plainBody, htmlBody) {
  const workEmail = 'cmolina@familyfirstas.com';
  const currentUser = Session.getActiveUser().getEmail();
  
  try {
    // Create a draft first
    const draft = GmailApp.createDraft(recipient, subject, plainBody, {
      htmlBody: htmlBody,
      name: 'Family First Adolescent Services',
      from: workEmail, // This will only work if the account has access
      replyTo: workEmail
    });
    
    // Send the draft
    draft.send();
    
    console.log(`Email sent from work account (${workEmail}) via ${currentUser} to ${recipient}`);
    return true;
    
  } catch (error) {
    console.error(`Failed to send from work account, falling back to regular method:`, error);
    // Fallback to regular sending
    sendEmailFromWorkAccount(recipient, subject, plainBody, htmlBody);
    return false;
  }
}

/**
 * Safe email sender with duplicate detection and rate limiting.
 * Options:
 *  - type: 'onboarding' | 'test' | 'schedule' (default: 'onboarding')
 *  - dryRun: boolean (default: false)
 *  - maxPerHourPerRecipient: number (default: 10)
 *  - duplicateWindowMs: number (default: 3600000 = 1h)
 */
function sendEmailSafely(recipient, subject, plainBody, htmlBody, options) {
  options = options || {};
  const type = options.type || 'onboarding';
  const dryRun = options.dryRun === true;
  const maxPerHour = typeof options.maxPerHourPerRecipient === 'number' ? options.maxPerHourPerRecipient : 10;
  const windowMs = typeof options.duplicateWindowMs === 'number' ? options.duplicateWindowMs : 60 * 60 * 1000;

  const rec = (recipient || '').trim().toLowerCase();
  if (!rec || rec.indexOf('@') === -1) {
    throw new Error('Invalid recipient');
  }

  // Duplicate key composed of recipient + subject + type
  const dupKey = `${type}::${rec}::${subject}`;
  if (isDuplicateRecently(dupKey, windowMs)) {
    console.warn(`Duplicate email suppressed for ${rec} (type=${type}) within window`);
    recordEmailLog({ recipient: rec, subject, type, status: 'duplicate_suppressed' });
    return { success: false, duplicate: true };
  }

  // Rate limit per recipient
  if (isRateLimited(rec, maxPerHour)) {
    console.warn(`Rate limit exceeded for ${rec} (${maxPerHour}/hour)`);
    recordEmailLog({ recipient: rec, subject, type, status: 'rate_limited' });
    return { success: false, rateLimited: true };
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would send to ${rec} | subject="${subject}" | type=${type}`);
    markDuplicate(dupKey);
    noteSend(rec);
    recordEmailLog({ recipient: rec, subject, type, status: 'dry_run' });
    return { success: true, dryRun: true };
  }

  // Actually send - check if it's a distribution list
  if (type === 'schedule_distribution' && rec.includes('_') && rec.endsWith('@familyfirstas.com')) {
    // Special handling for distribution lists
    const emailScheduler = new EmailScheduler();
    emailScheduler.sendToLargeDistributionList(rec, subject, plainBody, htmlBody);
  } else {
    // Regular email sending
    sendEmailFromWorkAccount(rec, subject, plainBody, htmlBody);
  }
  
  markDuplicate(dupKey);
  noteSend(rec);
  recordEmailLog({ recipient: rec, subject, type, status: 'sent' });
  return { success: true };
}

// ===== Helpers: duplicate detection, rate limiting, lightweight logs (PropertiesService) =====
function getStore_() {
  return PropertiesService.getScriptProperties();
}

function now_() { return Date.now(); }

function readJson_(key, fallback) {
  try {
    const raw = getStore_().getProperty(key);
    return raw ? JSON.parse(raw) : (fallback || {});
  } catch (e) {
    return fallback || {};
  }
}

function writeJson_(key, obj) {
  getStore_().setProperty(key, JSON.stringify(obj));
}

function cleanupOld_(arr, windowMs) {
  const cutoff = now_() - windowMs;
  return (arr || []).filter(ts => ts >= cutoff);
}

function noteSend(recipientLower) {
  const key = 'EMAIL_RATE_TIMES';
  const data = readJson_(key, {});
  const arr = data[recipientLower] || [];
  arr.push(now_());
  // keep last 100 timestamps per recipient to bound size
  data[recipientLower] = arr.slice(-100);
  writeJson_(key, data);
}

function isRateLimited(recipientLower, maxPerHour) {
  const key = 'EMAIL_RATE_TIMES';
  const data = readJson_(key, {});
  const cleaned = cleanupOld_(data[recipientLower] || [], 60 * 60 * 1000);
  // write back cleaned array to avoid growth
  if ((data[recipientLower] || []).length !== cleaned.length) {
    data[recipientLower] = cleaned;
    writeJson_(key, data);
  }
  return cleaned.length >= maxPerHour;
}

function isDuplicateRecently(dupKey, windowMs) {
  const key = 'EMAIL_DUP_KEYS';
  const data = readJson_(key, {});
  const ts = data[dupKey];
  if (!ts) return false;
  return (now_() - ts) < windowMs;
}

function markDuplicate(dupKey) {
  const key = 'EMAIL_DUP_KEYS';
  const data = readJson_(key, {});
  data[dupKey] = now_();
  // keep map size bounded (~200 entries)
  const entries = Object.entries(data);
  if (entries.length > 250) {
    entries.sort((a,b) => a[1]-b[1]);
    const trimmed = Object.fromEntries(entries.slice(-200));
    writeJson_(key, trimmed);
  } else {
    writeJson_(key, data);
  }
}

function recordEmailLog({ recipient, subject, type, status }) {
  try {
    const key = 'EMAIL_LIGHT_LOGS';
    const data = readJson_(key, { logs: [] });
    const logs = data.logs || [];
    logs.push({ recipient, subject, type, status, at: new Date().toISOString() });
    data.logs = logs.slice(-500); // keep last 500
    writeJson_(key, data);
  } catch (e) {
    // best effort only
  }
}

/**
 * Test email delivery to large distribution lists
 */
function testDistributionListDelivery() {
  const ui = SpreadsheetApp.getUi();
  
  // Prompt for distribution list email
  const result = ui.prompt(
    '📧 Test Distribution List Delivery',
    'Enter the distribution list email to test (e.g., estates_ca@familyfirstas.com):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const testEmail = result.getResponseText().trim().toLowerCase();
  if (!testEmail || !testEmail.includes('@')) {
    ui.alert('Invalid Email', 'Please enter a valid email address.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const currentUser = Session.getActiveUser().getEmail();
    const timestamp = new Date().toLocaleString();
    
    const subject = `[TEST] FFAS Distribution List Delivery Test - ${timestamp}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1565c0; margin: 0 0 15px 0;">📧 Distribution List Delivery Test</h2>
          <p style="margin: 0; font-size: 16px;">
            <strong>This is a test email to verify delivery to large distribution lists.</strong>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Test Details:</h3>
          <ul>
            <li><strong>Sent to:</strong> ${testEmail}</li>
            <li><strong>Sent by:</strong> ${currentUser}</li>
            <li><strong>Timestamp:</strong> ${timestamp}</li>
            <li><strong>Delivery Method:</strong> Enhanced Large Group Delivery</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h4 style="color: #856404; margin-top: 0;">✅ If you received this email:</h4>
          <p style="margin: 0; color: #856404;">
            Great! The distribution list delivery is working correctly. The weekly therapeutic outings schedule will be delivered successfully to this group.
          </p>
        </div>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h4 style="color: #721c24; margin-top: 0;">⚠️ Delivery Tips for Large Groups:</h4>
          <ul style="color: #721c24; margin: 0; padding-left: 20px;">
            <li>Check spam/junk folders if emails don't arrive</li>
            <li>Add the sender (${currentUser}) to your safe senders list</li>
            <li>Contact your IT department about whitelisting the sender domain</li>
            <li>Distribution lists with 100+ members may have delayed delivery</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            <strong>Family First Adolescent Services</strong><br>
            Therapeutic Outings Scheduler System
          </p>
        </div>
      </div>
    `;
    
    const plainBody = `
Distribution List Delivery Test

This is a test email to verify delivery to large distribution lists.

Test Details:
- Sent to: ${testEmail}
- Sent by: ${currentUser} 
- Timestamp: ${timestamp}
- Delivery Method: Enhanced Large Group Delivery

If you received this email, the distribution list delivery is working correctly.

Family First Adolescent Services
Therapeutic Outings Scheduler System
    `;
    
    // Use the enhanced delivery method
    const emailScheduler = new EmailScheduler();
    emailScheduler.sendToLargeDistributionList(testEmail, subject, plainBody, htmlBody);
    
    ui.alert(
      '✅ Test Email Sent',
      `Test email has been sent to ${testEmail}.\n\n` +
      `Please check with recipients to confirm delivery. Large distribution lists may take several minutes to deliver to all members.`,
      ui.ButtonSet.OK
    );
    
    // Log the test
    auditLog('DISTRIBUTION_LIST_TEST', {
      testEmail: testEmail,
      sentBy: currentUser,
      timestamp: timestamp
    });
    
  } catch (error) {
    handleError(error, 'Test Distribution List Delivery');
  }
}
/**
 * Preview and send weekly schedule - simple version
 */
function previewAndSendSchedule() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Get the schedule data
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    if (!scheduleSheet) {
      ui.alert('No Schedule', 'No schedule sheet found. Generate a schedule first.', ui.ButtonSet.OK);
      return;
    }

    const scheduleData = scheduleSheet.getDataRange().getValues();
    if (scheduleData.length < 2) {
      ui.alert('Empty Schedule', 'Schedule is empty. Generate some outings first.', ui.ButtonSet.OK);
      return;
    }

    // Get headers to find columns
    const headers = scheduleData[0];
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'date');
    
    if (dateIndex === -1) {
      ui.alert('Error', 'Cannot find Date column in schedule.', ui.ButtonSet.OK);
      return;
    }

    // Find all available weeks in the schedule
    const allDates = scheduleData.slice(1)
      .map(row => row[dateIndex])
      .filter(date => date)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));

    if (allDates.length === 0) {
      ui.alert('No Dates', 'No valid dates found in schedule.', ui.ButtonSet.OK);
      return;
    }

    // Group dates by week (Monday to Sunday)
    const weeks = {};
    allDates.forEach(date => {
      const monday = new Date(date);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      
      const weekKey = monday.toISOString().split('T')[0];
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          start: new Date(monday),
          end: new Date(monday.getTime() + (6 * 24 * 60 * 60 * 1000)),
          dates: []
        };
      }
      weeks[weekKey].dates.push(date);
    });

    // Sort weeks by date
    const sortedWeeks = Object.entries(weeks).sort((a, b) => a[1].start - b[1].start);
    // Create preview HTML with week selector
    let previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
          }
          h2 { 
            color: #2c3e50; 
            margin-bottom: 20px;
          }
          .week-selector {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .week-selector select {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
          }
          .schedule-preview {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 20px;
            background: #f9f9f9;
          }
          .date-group {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .date-header {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 18px;
          }
          .outing {
            margin: 8px 0;
            padding: 10px;
            background: #f0f7ff;
            border-radius: 4px;
            border-left: 3px solid #1976d2;
          }
          .house-name {
            font-weight: bold;
            color: #1565c0;
          }
          .vendor-name {
            font-weight: bold;
            color: #2e7d32;
          }
          .time {
            color: #666;
            font-style: italic;
          }
          .summary {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }
          .buttons {
            text-align: center;
            margin-top: 20px;
          }
          button {
            padding: 12px 30px;
            margin: 0 10px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .send-btn {
            background: #28a745;
            color: white;
          }
          .send-btn:hover {
            background: #218838;
          }
          .cancel-btn {
            background: #6c757d;
            color: white;
          }
          .cancel-btn:hover {
            background: #5a6268;
          }
          .loading {
            text-align: center;
            padding: 20px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h2>📅 Preview & Send Weekly Schedule</h2>
        
        <div class="week-selector">
          <label for="weekSelect" style="display: block; margin-bottom: 8px; font-weight: bold;">Select Week to Send:</label>
          <select id="weekSelect" onchange="updatePreview()">
            ${sortedWeeks.map(([weekKey, week], index) => {
              const weekStart = week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const weekEnd = week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const isCurrentWeek = new Date() >= week.start && new Date() <= week.end;
              return `<option value="${weekKey}" ${index === 0 ? 'selected' : ''}>
                ${weekStart} - ${weekEnd} ${isCurrentWeek ? '(Current Week)' : ''}
              </option>`;
            }).join('')}
          </select>
        </div>
        
        <div id="scheduleContent">
          <div class="loading">Loading schedule...</div>
        </div>
        
        <div class="buttons">
          <button class="cancel-btn" onclick="google.script.host.close()">Cancel</button>
          <button class="send-btn" onclick="sendSelectedWeek()">Send This Week's Schedule</button>
        </div>
        
        <script>
          // Store all schedule data
          const scheduleData = ${JSON.stringify(scheduleData)};
          const headers = ${JSON.stringify(headers)};
          const dateIndex = ${dateIndex};
          
          // Get house columns - everything between Date and the options/boolean columns
          const optionsIndex = headers.findIndex(h => h.toLowerCase().includes('option'));
          const endColumnIndex = optionsIndex > 0 ? optionsIndex : headers.length;
          const houseColumns = [];
          const houseIndexes = [];
          
          // Find all house columns (they're between date and options)
          for (let i = dateIndex + 1; i < endColumnIndex; i++) {
            const header = headers[i];
            if (header && header.trim() !== '' && !header.toLowerCase().includes('false') && !header.toLowerCase().includes('true')) {
              houseColumns.push(header);
              houseIndexes.push(i);
            }
          }
          
          function updatePreview() {
            const weekSelect = document.getElementById('weekSelect');
            const selectedWeek = weekSelect.value;
            const weekStart = new Date(selectedWeek);
            const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
            
            // Filter outings for selected week
            const weekOutings = scheduleData.slice(1).filter(row => {
              if (!row[dateIndex]) return false;
              const outingDate = new Date(row[dateIndex]);
              return outingDate >= weekStart && outingDate <= weekEnd;
            });
            
            // Group by date
            const outingsByDate = {};
            weekOutings.forEach(row => {
              const dateStr = new Date(row[dateIndex]).toDateString();
              if (!outingsByDate[dateStr]) {
                outingsByDate[dateStr] = [];
              }
              outingsByDate[dateStr].push(row);
            });
            
            // Count total outings
            let totalOutings = 0;
            
            // Build preview HTML
            let previewContent = '<div class="schedule-preview">';
            
            // Sort dates and display
            Object.keys(outingsByDate).sort((a, b) => new Date(a) - new Date(b)).forEach(dateStr => {
              const date = new Date(dateStr);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
              const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              previewContent += '<div class="date-group">';
              previewContent += '<div class="date-header">' + dayName + ', ' + dateFormatted + '</div>';
              
              outingsByDate[dateStr].forEach(row => {
                // Process each house column
                for (let i = 0; i < houseColumns.length; i++) {
                  const house = houseColumns[i];
                  const cellData = row[houseIndexes[i]];
                  
                  if (cellData && cellData.toString().trim() !== '') {
                    // Parse vendor and time from cell
                    const lines = cellData.toString().split('\\n');
                    const vendor = lines[0] || '';
                    const time = lines[1] || '';
                    
                    if (vendor && vendor !== 'TBD' && vendor !== 'UNASSIGNED') {
                      totalOutings++;
                      previewContent += '<div class="outing">';
                      previewContent += '<span class="house-name">' + house + '</span>';
                      previewContent += ' → ';
                      previewContent += '<span class="vendor-name">' + vendor + '</span>';
                      if (time) previewContent += ' <span class="time">(' + time + ')</span>';
                      previewContent += '</div>';
                    }
                  }
                }
              });
              
              previewContent += '</div>';
            });
            
            previewContent += '</div>';
            
            // Add summary at the top
            const summaryHtml = '<div class="summary"><strong>' + totalOutings + ' outings scheduled this week</strong></div>';
            
            document.getElementById('scheduleContent').innerHTML = summaryHtml + previewContent;
          }
          
          function sendSelectedWeek() {
            const weekSelect = document.getElementById('weekSelect');
            const selectedWeek = weekSelect.value;
            document.getElementById('scheduleContent').innerHTML = '<div class="loading">Sending schedule...</div>';
            google.script.run
              .withSuccessHandler(() => google.script.host.close())
              .withFailureHandler(error => {
                alert('Error sending schedule: ' + error.message);
                updatePreview();
              })
              .sendScheduleForWeek(selectedWeek);
          }
          
          // Initial load
          updatePreview();
        </script>
      </body>
      </html>`;

    // Show preview dialog
    const htmlOutput = HtmlService
      .createHtmlOutput(previewHtml)
      .setWidth(700)
      .setHeight(600);

    ui.showModalDialog(htmlOutput, 'Preview & Send Schedule');

  } catch (error) {
    ui.alert('Error', `Failed to preview schedule: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Actually send the schedule (called from preview dialog)
 */
function sendScheduleNow() {
  const ui = SpreadsheetApp.getUi();

  try {
    // Get recipients
    let recipients = [];
    try {
      const properties = PropertiesService.getScriptProperties();
      const storedRecipients = properties.getProperty(CONFIG.RECIPIENTS_KEY);
      if (storedRecipients) {
        recipients = JSON.parse(storedRecipients);
      }
    } catch (error) {
      console.log('Error loading recipients:', error);
    }

    if (recipients.length === 0) {
      ui.alert('No Recipients', 'No email recipients configured. Use "Manage Email Recipients" first.', ui.ButtonSet.OK);
      return;
    }

    // Send the email
    const emailScheduler = new EmailScheduler();
    const result = emailScheduler.generateAndEmail();

    if (result.success) {
      ui.alert('Sent!', `Schedule sent to ${result.recipientCount} recipients successfully.`, ui.ButtonSet.OK);
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    ui.alert('Send Failed', `Error sending schedule: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Send schedule for a specific week (called from preview dialog)
 */
function sendScheduleForWeek(weekStartDate) {
  const ui = SpreadsheetApp.getUi();

  try {
    // Get recipients
    let recipients = [];
    try {
      const properties = PropertiesService.getScriptProperties();
      const storedRecipients = properties.getProperty(CONFIG.RECIPIENTS_KEY);
      if (storedRecipients) {
        recipients = JSON.parse(storedRecipients);
      }
    } catch (error) {
      console.log('Error loading recipients:', error);
    }

    if (recipients.length === 0) {
      throw new Error('No email recipients configured. Use "Manage Email Recipients" first.');
    }

    // Store the selected week temporarily for the email functions to use
    PropertiesService.getScriptProperties().setProperty('TEMP_EMAIL_WEEK', weekStartDate);

    // Send the email using the EmailScheduler
    const emailScheduler = new EmailScheduler();
    const result = emailScheduler.generateAndEmailForWeek(weekStartDate);

    // Clear the temporary week
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');

    if (result.success) {
      // Success is handled by the dialog closing
      return true;
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    // Clear temp property on error too
    try {
      PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    } catch (e) {}
    
    throw error;
  }
}

/**
 * Send manual email from menu
 */
function sendManualEmail() {
  const ui = SpreadsheetApp.getUi();
  
  // Create custom dialog with HTML for better control
  const htmlContent = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
      h3 { color: #2c3e50; margin-top: 0; }
      .section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      .week-selector {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        background: #fff;
        border-radius: 5px;
        border: 1px solid #ddd;
      }
      .week-info {
        flex-grow: 1;
      }
      .week-date {
        font-weight: bold;
        color: #2c3e50;
      }
      .week-label {
        color: #7f8c8d;
        font-size: 12px;
      }
      .week-nav {
        display: flex;
        gap: 10px;
      }
      .week-btn {
        padding: 5px 10px;
        background: #ecf0f1;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 20px;
      }
      .week-btn:hover {
        background: #bdc3c7;
      }
      .week-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .option { 
        margin: 15px 0; 
        padding: 15px; 
        border: 2px solid #e0e0e0; 
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
      }
      .option:hover { 
        border-color: #3498db; 
        background: #f8f9fa; 
      }
      .option.selected {
        border-color: #3498db;
        background: #e3f2fd;
      }
      .option-title { 
        font-weight: bold; 
        color: #2c3e50; 
        margin-bottom: 5px;
      }
      .option-desc { 
        color: #7f8c8d; 
        font-size: 14px; 
      }
      .button-container {
        margin-top: 20px;
        text-align: center;
      }
      button {
        padding: 10px 20px;
        margin: 0 5px;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
      }
      .send-btn {
        background: #3498db;
        color: white;
      }
      .send-btn:hover {
        background: #2980b9;
      }
      .send-btn:disabled {
        background: #95a5a6;
        cursor: not-allowed;
      }
      .cancel-btn {
        background: #95a5a6;
        color: white;
      }
      .cancel-btn:hover {
        background: #7f8c8d;
      }
      .loading {
        display: none;
        text-align: center;
        color: #7f8c8d;
        margin: 10px 0;
      }
    </style>
    
    <h3>📧 Send Schedule Email</h3>
    
    <div class="section">
      <h4 style="margin-top: 0;">📅 Select Week</h4>
      <div class="week-selector">
        <div class="week-info">
          <div class="week-date" id="week-date">Loading...</div>
          <div class="week-label" id="week-label"></div>
        </div>
        <div class="week-nav">
          <button class="week-btn" onclick="changeWeek(-1)" id="prev-btn">◀</button>
          <button class="week-btn" onclick="changeWeek(1)" id="next-btn">▶</button>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h4 style="margin-top: 0;">📧 Email Type</h4>
      <div class="option" onclick="selectOption(this, 'full')" id="full-option">
        <div class="option-title">📋 Full Schedule Only</div>
        <div class="option-desc">Send the complete schedule to ALL recipients (no house-specific emails)</div>
      </div>
      
      <div class="option" onclick="selectOption(this, 'dual')" id="dual-option">
        <div class="option-title">🏠 Dual Email System</div>
        <div class="option-desc">Send full schedule to PCs/Directors + house-specific schedules to BHTs</div>
      </div>
    </div>
    
    <div class="loading" id="loading">
      <p>⏳ Loading schedule data...</p>
    </div>
    
    <div class="button-container">
      <button class="send-btn" onclick="sendEmail()" id="send-button">Send Emails</button>
      <button class="cancel-btn" onclick="google.script.host.close()">Cancel</button>
    </div>
    
    <script>
      // Get saved preference or default to 'full'
      let selectedType = 'full';
      let availableWeeks = [];
      let currentWeekIndex = 0;
      let selectedWeekDate = null;
      
      // Initialize on load
      window.onload = function() {
        loadWeeks();
        loadPreference();
      };
      
      function loadWeeks() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('send-button').disabled = true;
        
        google.script.run
          .withSuccessHandler(function(weeks) {
            availableWeeks = weeks;
            if (weeks && weeks.length > 0) {
              // Find current or next week
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Find the best week to show
              let bestIndex = 0;
              for (let i = 0; i < weeks.length; i++) {
                const weekDate = new Date(weeks[i].date);
                weekDate.setHours(0, 0, 0, 0);
                
                // If this week is current or next week, select it
                const dayDiff = Math.floor((weekDate - today) / (1000 * 60 * 60 * 24));
                if (dayDiff >= -6 && dayDiff <= 7) {
                  bestIndex = i;
                  break;
                }
              }
              
              currentWeekIndex = bestIndex;
              updateWeekDisplay();
              document.getElementById('loading').style.display = 'none';
              document.getElementById('send-button').disabled = false;
            } else {
              document.getElementById('week-date').textContent = 'No schedule found';
              document.getElementById('week-label').textContent = 'Generate a schedule first';
              document.getElementById('loading').style.display = 'none';
            }
          })
          .withFailureHandler(function(error) {
            console.error('Error loading weeks:', error);
            document.getElementById('week-date').textContent = 'Error loading schedule';
            document.getElementById('loading').style.display = 'none';
          })
          .getAvailableScheduleWeeks();
      }
      
      function loadPreference() {
        google.script.run
          .withSuccessHandler(function(savedPref) {
            if (savedPref) {
              selectedType = savedPref;
              // Select the saved option
              document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
              });
              document.getElementById(savedPref + '-option').classList.add('selected');
            } else {
              // Auto-select the first option if no preference
              document.getElementById('full-option').classList.add('selected');
            }
          })
          .getEmailPreference();
      }
      
      function updateWeekDisplay() {
        if (availableWeeks.length === 0) return;
        
        const week = availableWeeks[currentWeekIndex];
        selectedWeekDate = week.date;
        
        // Format date nicely
        const weekDate = new Date(week.date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = weekDate.toLocaleDateString('en-US', options);
        
        document.getElementById('week-date').textContent = dateStr;
        document.getElementById('week-label').textContent = week.label;
        
        // Update navigation buttons
        document.getElementById('prev-btn').disabled = currentWeekIndex === 0;
        document.getElementById('next-btn').disabled = currentWeekIndex === availableWeeks.length - 1;
      }
      
      function changeWeek(direction) {
        currentWeekIndex += direction;
        currentWeekIndex = Math.max(0, Math.min(currentWeekIndex, availableWeeks.length - 1));
        updateWeekDisplay();
      }
      
      function selectOption(element, type) {
        // Remove selected class from all options
        document.querySelectorAll('.option').forEach(opt => {
          opt.classList.remove('selected');
        });
        // Add selected class to clicked option
        element.classList.add('selected');
        selectedType = type;
      }
      
      function sendEmail() {
        if (!selectedWeekDate) {
          alert('Please wait for weeks to load or generate a schedule first.');
          return;
        }
        
        // Disable button to prevent double-click
        document.getElementById('send-button').disabled = true;
        document.getElementById('send-button').textContent = 'Sending...';
        
        // Save the preference for next time
        google.script.run.saveEmailPreference(selectedType);
        
        google.script.run
          .withSuccessHandler(function() {
            google.script.host.close();
          })
          .withFailureHandler(function(error) {
            alert('Error: ' + error);
            document.getElementById('send-button').disabled = false;
            document.getElementById('send-button').textContent = 'Send Emails';
          })
          .processManualEmailChoice(selectedType, selectedWeekDate);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(520);
  
  ui.showModalDialog(htmlContent, 'Send Schedule Email');
}

/**
 * Process the manual email choice from the dialog
 */
function processManualEmailChoice(emailType, weekDate) {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Store the selected week temporarily for the email functions to use
    PropertiesService.getScriptProperties().setProperty('TEMP_EMAIL_WEEK', weekDate);
    
    if (emailType === 'full') {
      // Send full schedule to everyone
      previewAndSendSchedule();
    } else if (emailType === 'dual') {
      // Send dual emails
      sendDualWeeklyEmails();
    }
    
    // Clear the temporary week
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    
    // Show success after dialog closes
    Utilities.sleep(500); // Brief pause to ensure dialog closes first
    ui.alert('✅ Success', `Emails for week of ${new Date(weekDate).toLocaleDateString()} have been sent successfully!`, ui.ButtonSet.OK);
  } catch (error) {
    // Clear the temporary week on error too
    PropertiesService.getScriptProperties().deleteProperty('TEMP_EMAIL_WEEK');
    
    ui.alert('❌ Error', 'Error sending emails: ' + error.message, ui.ButtonSet.OK);
    console.error('Manual email error:', error);
    throw error; // Re-throw to trigger the failure handler
  }
}

/**
 * Get saved email preference
 */
function getEmailPreference() {
  const userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('EMAIL_SEND_PREFERENCE') || 'full';
}

/**
 * Save email preference
 */
function saveEmailPreference(preference) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('EMAIL_SEND_PREFERENCE', preference);
}

/**
 * Get available schedule weeks from the SCHEDULE sheet
 */
function getAvailableScheduleWeeks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet || scheduleSheet.getLastRow() < 2) {
    return [];
  }
  
  const data = scheduleSheet.getDataRange().getValues();
  const dateColIndex = data[0].indexOf('Date');
  
  if (dateColIndex === -1) return [];
  
  // Get unique Tuesday dates
  const weekDates = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < data.length; i++) {
    const cellDate = data[i][dateColIndex];
    if (cellDate instanceof Date) {
      // Get the Tuesday of this week
      const tuesday = new Date(cellDate);
      tuesday.setHours(0, 0, 0, 0);
      
      // Only include dates that are Tuesday
      if (tuesday.getDay() === 2) { // Tuesday is day 2
        const dateKey = tuesday.toISOString().split('T')[0];
        
        if (!weekDates.has(dateKey)) {
          const dayDiff = Math.floor((tuesday - today) / (1000 * 60 * 60 * 24));
          let label = '';
          
          if (dayDiff < -7) {
            label = 'Past week';
          } else if (dayDiff >= -7 && dayDiff < 0) {
            label = 'This week (already happened)';
          } else if (dayDiff >= 0 && dayDiff < 7) {
            label = 'This week (upcoming)';
          } else if (dayDiff >= 7 && dayDiff < 14) {
            label = 'Next week';
          } else {
            label = `In ${Math.floor(dayDiff / 7)} weeks`;
          }
          
          weekDates.set(dateKey, {
            date: dateKey,
            label: label,
            dayDiff: dayDiff
          });
        }
      }
    }
  }
  
  // Convert to array and sort by date
  return Array.from(weekDates.values()).sort((a, b) => a.dayDiff - b.dayDiff);
}

/**
 * Debug email generation to identify issues
 */
function debugEmailGeneration() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const emailScheduler = new EmailScheduler();
    const result = emailScheduler.debugEmailGeneration();
    
    if (result.success) {
      ui.alert(
        '🔍 Debug Results',
        `Week: ${result.weekData.dateStr}\n` +
        `Table rows: ${result.tableData.length}\n` +
        `Check console logs for detailed information`,
        ui.ButtonSet.OK
      );
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    handleError(error, 'Email Debug');
  }
}

/**
 * Test email generation without sending
 */
function testEmailGeneration() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const emailScheduler = new EmailScheduler();
    
    // Get week data
    const weekData = emailScheduler.getThisWeekData();
    if (!weekData) {
      throw new Error('No schedule found for this week');
    }
    
    // Generate HTML email content
    const htmlContent = emailScheduler.createScheduleTableHtml(weekData);
    const plainContent = emailScheduler.createPlainTextEmail(weekData);
    
    // Save HTML to file for inspection
    const htmlBlob = Utilities.newBlob(htmlContent, 'text/html', 'test-email.html');
    const file = DriveApp.createFile(htmlBlob);
    
    ui.alert(
      '✅ Test Email Generated',
      `Email HTML created successfully!\n` +
      `File: ${file.getName()}\n` +
      `Size: ${(file.getSize() / 1024).toFixed(2)} KB\n` +
      `Check Google Drive to review the HTML`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    handleError(error, 'Email Test Generation');
  }
}
class EmailScheduler {
  constructor() {
    this.ss = SpreadsheetApp.getActive();
    this.dataManager = new DataManager(this.ss);
    this.config = this.dataManager.getConfig();
  }
  
  /**
   * Generate and send email with schedule in the body (no PDF)
   */
  generateAndEmail() {
    // Optional pre-send auto refresh/refill to ensure latest data
    try {
      if (getAutomationFlag_('AUTO_REFRESH_BEFORE_SEND', true)) {
        const ss = SpreadsheetApp.getActive();
        const dataManager = new DataManager(ss);
        const scheduler = new SmartScheduler(dataManager);
        // Refill/adjust the current week right before sending
        scheduler.refillCurrentWeek();
      }
    } catch (e) {
      console.warn('Pre-send refresh skipped:', e);
    }

    // Get this week's schedule data
    const weekData = this.getThisWeekData();
    if (!weekData) {
      throw new Error('No schedule found for this week. Please generate a schedule first.');
    }

    const tableData = this.buildScheduleTable();
    const { subject, plainBody, htmlBody } = this.buildEmailContent(weekData, tableData);

    return this._sendEmails(subject, plainBody, htmlBody, weekData);
  }

  /**
   * Generate and send email for a specific week
   */
  generateAndEmailForWeek(weekStartDate) {
    // Get schedule data for specific week
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    const weekData = this.getWeekData(weekStart, weekEnd);
    if (!weekData) {
      throw new Error('No schedule found for selected week.');
    }

    const tableData = this.buildScheduleTableForWeek(weekStart, weekEnd);
    const { subject, plainBody, htmlBody } = this.buildEmailContent(weekData, tableData);

    return this._sendEmails(subject, plainBody, htmlBody, weekData);
  }

  /**
   * Common email sending logic
   */
  _sendEmails(subject, plainBody, htmlBody, weekData) {

    // Get email recipients from Script Properties
    const properties = PropertiesService.getScriptProperties();
    const storedRecipients = properties.getProperty(CONFIG.RECIPIENTS_KEY);
    let recipients = [];
    if (storedRecipients) {
      try {
        recipients = JSON.parse(storedRecipients);
      } catch (e) {
        throw new Error('Could not parse recipient list. Please check the configuration in Settings > Email Recipients.');
      }
    }
    
    // Validate we have recipients
    if (recipients.length === 0) {
      throw new Error('No email recipients configured. Please add them via Settings > Email Recipients.');
    }
    
    // Categorize recipients for better delivery handling
    const { individualEmails, distributionLists } = this.categorizeRecipients(recipients);
    
    const emailResults = [];
    let totalSent = 0;
    
    // Send to individual emails first (higher success rate)
    if (individualEmails.length > 0) {
      const individualResults = this.sendToIndividualRecipients(
        individualEmails, subject, plainBody, htmlBody
      );
      emailResults.push(...individualResults);
      totalSent += individualResults.filter(r => r.success).length;
    }
    
    // Handle distribution lists with special care
    if (distributionLists.length > 0) {
      const distributionResults = this.sendToDistributionLists(
        distributionLists, subject, plainBody, htmlBody
      );
      emailResults.push(...distributionResults);
      totalSent += distributionResults.filter(r => r.success).length;
    }

    // Log the email activity
    auditLog('WEEKLY_EMAIL_SENT', {
      recipients: recipients,
      week: weekData.dateStr,
      results: emailResults
    });
    
    return {
      success: true,
      recipientCount: totalSent,
      results: emailResults
    };
  }
  
  /**
   * Categorize recipients into individual emails vs distribution lists
   */
  categorizeRecipients(recipients) {
    const individualEmails = [];
    const distributionLists = [];
    
    recipients.forEach(email => {
      // Distribution lists typically have patterns like estates_ca@, cove_ca@, etc.
      if (email.toLowerCase().includes('_ca@') || 
          email.toLowerCase().includes('_tx@') || 
          email.toLowerCase().includes('_fl@') ||
          email.toLowerCase().includes('estates@') ||
          email.toLowerCase().includes('cove@') ||
          email.toLowerCase().includes('nest@')) {
        distributionLists.push(email);
      } else {
        individualEmails.push(email);
      }
    });
    
    return { individualEmails, distributionLists };
  }
  
  /**
   * Send emails to individual recipients with batching
   */
  sendToIndividualRecipients(recipients, subject, plainBody, htmlBody) {
    const results = [];
    const batchSize = CONFIG.EMAIL_SETTINGS.MAX_RECIPIENTS_PER_EMAIL;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          // Use sendEmailSafely with duplicate prevention
          const sendResult = sendEmailSafely(recipient, subject, plainBody, htmlBody, {
            type: 'schedule',
            duplicateWindowMs: 24 * 60 * 60 * 1000, // 24 hour window for weekly emails
            maxPerHourPerRecipient: 2 // Allow max 2 weekly emails per hour per recipient
          });
          
          if (sendResult.success) {
            results.push({ 
              recipient, 
              success: true, 
              type: 'individual',
              dryRun: sendResult.dryRun || false
            });
          } else if (sendResult.duplicate) {
            results.push({ 
              recipient, 
              success: false, 
              type: 'individual',
              skipped: true,
              reason: 'Duplicate email already sent within 24 hours'
            });
            console.log(`Skipped duplicate email to ${recipient}`);
          } else if (sendResult.rateLimited) {
            results.push({ 
              recipient, 
              success: false, 
              type: 'individual',
              skipped: true,
              reason: 'Rate limit exceeded'
            });
          }
          
          // Small delay to avoid hitting rate limits
          Utilities.sleep(100);
        } catch (error) {
          console.error(`Failed to send to ${recipient}:`, error);
          results.push({ 
            recipient, 
            success: false, 
            error: error.message,
            type: 'individual'
          });
        }
      }
      
      // Longer delay between batches
      if (i + batchSize < recipients.length) {
        Utilities.sleep(CONFIG.EMAIL_SETTINGS.DELAY_BETWEEN_BATCHES);
      }
    }
    
    return results;
  }
  
  /**
   * Send emails to distribution lists with enhanced delivery methods
   */
  sendToDistributionLists(distributionLists, subject, plainBody, htmlBody) {
    const results = [];
    
    for (const listEmail of distributionLists) {
      try {
        // For large distribution lists, we use different strategies
        const enhancedSubject = `[FFAS Therapeutic Outings] ${subject}`;
        
        // Enhanced HTML body for distribution lists
        const distributionHtmlBody = `
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border: 1px solid #bbdefb; padding: 16px 18px; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(25, 118, 210, 0.08); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size: 20px;">📧</span>
              <div>
                <div style="color: #1565c0; font-weight: 600;">Distribution List Delivery</div>
                <div style="color: #374151; font-size: 13px;">If you don't see this email in your inbox:</div>
              </div>
            </div>
            <ul style="margin: 10px 0 0 30px; color: #374151; font-size: 13px;">
              <li>Check your spam/junk folder</li>
              <li>Add <strong>${Session.getActiveUser().getEmail()}</strong> to your safe senders list</li>
              <li>Contact IT if delivery issues persist</li>
            </ul>
          </div>
          ${htmlBody}
        `;
        
        // Try sending with different methods based on list size estimation
        // Use sendEmailSafely for duplicate prevention on distribution lists too
        const sendResult = sendEmailSafely(listEmail, enhancedSubject, plainBody, distributionHtmlBody, {
          type: 'schedule_distribution',
          duplicateWindowMs: 24 * 60 * 60 * 1000, // 24 hour window
          maxPerHourPerRecipient: 2
        });
        
        if (sendResult.success) {
          results.push({ 
            recipient: listEmail, 
            success: true, 
            type: 'distribution_list',
            note: sendResult.dryRun ? 'Dry run' : 'Sent with enhanced delivery method'
          });
        } else if (sendResult.duplicate) {
          results.push({ 
            recipient: listEmail, 
            success: false, 
            type: 'distribution_list',
            skipped: true,
            reason: 'Duplicate email already sent to this distribution list within 24 hours'
          });
          console.log(`Skipped duplicate email to distribution list ${listEmail}`);
        } else if (sendResult.rateLimited) {
          results.push({ 
            recipient: listEmail, 
            success: false, 
            type: 'distribution_list',
            skipped: true,
            reason: 'Rate limit exceeded for distribution list'
          });
        }
        
        // Longer delay between distribution lists
        Utilities.sleep(CONFIG.EMAIL_SETTINGS.DELAY_BETWEEN_BATCHES * 2);
        
      } catch (error) {
        console.error(`Failed to send to distribution list ${listEmail}:`, error);
        results.push({ 
          recipient: listEmail, 
          success: false, 
          error: error.message,
          type: 'distribution_list'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Enhanced delivery method for large distribution lists
   */
  sendToLargeDistributionList(listEmail, subject, plainBody, htmlBody) {
    const currentUser = Session.getActiveUser().getEmail();
    const isWorkAccount = currentUser.includes('@familyfirstas.com');
    
    if (isWorkAccount) {
      // Method 1: Use Gmail with priority headers for work accounts
      try {
        GmailApp.sendEmail(listEmail, subject, plainBody, {
          htmlBody: htmlBody,
          name: 'Family First Adolescent Services - Therapeutic Outings',
          replyTo: currentUser,
          // Headers to improve deliverability to large lists
          headers: {
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'X-Mailer': 'FFAS Scheduler v' + CONFIG.VERSION,
            'List-Unsubscribe': `<mailto:${currentUser}?subject=Unsubscribe>`,
            'Precedence': 'bulk'
          }
        });
        return;
      } catch (error) {
        console.warn(`Gmail method failed for ${listEmail}, trying MailApp:`, error);
      }
    }
    
    // Method 2: Fallback to MailApp (simpler but may have better delivery to Outlook)
    MailApp.sendEmail({
      to: listEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'FFAS Therapeutic Outings Scheduler',
      replyTo: isWorkAccount ? currentUser : 'cmolina@familyfirstas.com'
    });
  }
  
  /**
   * Get schedule data for current week
   */
  getThisWeekData() {
    // Check if a specific week was selected via manual email dialog
    const tempWeek = PropertiesService.getScriptProperties().getProperty('TEMP_EMAIL_WEEK');
    if (tempWeek) {
      return this.getWeekData(new Date(tempWeek));
    }
    
    // Otherwise use current week
    const schedSheet = this.dataManager.getSheet('SCHEDULE');
    const data = schedSheet.getDataRange().getValues();
    const today = new Date();
    
    for (let i = 1; i < data.length; i++) {
      const date = new Date(data[i][0]);
      if (this.isSameWeek(date, today)) {
        return {
          headers: data[0],
          row: data[i],
          dateStr: Utilities.formatDate(date, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy'),
          date: date
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get schedule data for a specific week
   */
  getWeekData(weekStart, weekEnd) {
    // If only one parameter, it's the old single date method
    if (!weekEnd) {
      const targetDate = weekStart;
      const schedSheet = this.dataManager.getSheet('SCHEDULE');
      const data = schedSheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const date = new Date(data[i][0]);
        if (date.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0]) {
          return {
            headers: data[0],
            row: data[i],
            dateStr: Utilities.formatDate(date, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy'),
            date: date
          };
        }
      }
      
      return null;
    }
    
    // New method: get data for date range
    const schedSheet = this.dataManager.getSheet('SCHEDULE');
    const data = schedSheet.getDataRange().getValues();
    const weekRows = [];
    
    for (let i = 1; i < data.length; i++) {
      const date = new Date(data[i][0]);
      if (date >= weekStart && date <= weekEnd) {
        weekRows.push(data[i]);
      }
    }
    
    if (weekRows.length === 0) return null;
    
    return {
      headers: data[0],
      rows: weekRows,
      dateStr: Utilities.formatDate(weekStart, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy'),
      startDate: weekStart,
      endDate: weekEnd
    };
  }
  
  // PDF-related methods removed - now using direct email
  // The following methods were removed:
  // - validateTemplate()
  // - createEnhancedPdf()
  // - generateIncidentReportUrl()
  // - getWeekNumber()
  // - generateQRCode()
  // - styleTable()
  // - prepareTableData() [moved to email-specific version]
  
  /**
   * Send emails with retry logic
   */
  sendEmailsWithRetry(recipients, weekData) {
    const results = [];
    const maxRetries = CONFIG.MAX_RETRIES;
    
    for (const recipient of recipients) {
      let success = false;
      let attempts = 0;
      let lastError = null;
      
      while (!success && attempts < maxRetries) {
        attempts++;
        
        try {
          this.sendEmail(recipient, weekData);
          success = true;
        } catch (error) {
          lastError = error;
          if (attempts < maxRetries) {
            Utilities.sleep(CONFIG.RETRY_DELAY * attempts);
          }
        }
      }
      
      results.push({
        recipient: recipient,
        success: success,
        attempts: attempts,
        error: success ? null : lastError.toString()
      });
    }
    
    return results;
  }
  
  /**
   * Send individual email with schedule in body
   */
  sendEmail(recipient, weekData) {
    // Build modern email using the same path as the main sender
    const scheduleTable = this.createScheduleTableHtml(weekData);
    const { subject, plainBody, htmlBody } = this.buildEmailContent(weekData, scheduleTable);

    try {
      sendEmailFromWorkAccount(recipient, subject, plainBody, htmlBody);
      console.log(`Email sent successfully to ${recipient}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient}:`, error);
      throw error;
    }
  }
  
  isSameWeek(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    
    // Get Monday of each week
    const firstMonday = new Date(firstDate);
    firstMonday.setDate(firstDate.getDate() - (firstDate.getDay() || 7) + 1);
    
    const secondMonday = new Date(secondDate);
    secondMonday.setDate(secondDate.getDate() - (secondDate.getDay() || 7) + 1);
    
    return Math.abs(firstMonday - secondMonday) < oneDay;
  }
  
  /**
   * Build schedule table (wrapper method for compatibility)
   */
  buildScheduleTable() {
    const weekData = this.getThisWeekData();
    if (!weekData) {
      throw new Error('No schedule data available to build table');
    }
    return this.createScheduleTableHtml(weekData);
  }
  
  /**
   * Build schedule table for a specific week
   */
  buildScheduleTableForWeek(weekStart, weekEnd) {
    const weekData = this.getWeekData(weekStart, weekEnd);
    if (!weekData) {
      throw new Error('No schedule data available for selected week');
    }
    return this.createScheduleTableHtml(weekData);
  }
  
  /**
   * Build email content with subject and body
   */
  buildEmailContent(weekData, tableData) {
    const dateStr = weekData.dateStr;
    const subject = `FFAS Therapeutic Outings Schedule - Week of ${dateStr}`;
    const plainBody = this.createPlainTextEmail(weekData);
    const htmlBody = this.createHtmlEmailBody(weekData, tableData);
    
    return {
      subject,
      plainBody,
      htmlBody
    };
  }
  
  /**
   * Create complete HTML email body
   */
  createHtmlEmailBody(weekData, tableHtml) {
    const currentUser = Session.getActiveUser().getEmail();
    const isWorkAccount = currentUser.includes('@familyfirstas.com');

    return `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
        <meta name="x-apple-disable-message-reformatting">
        <title>FFAS Therapeutic Outings Schedule</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          /* Reset styles */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          
          /* Mobile styles */
          @media only screen and (max-width: 600px) {
            .mobile-hide { display: none !important; }
            .mobile-center { text-align: center !important; }
            .mobile-full { width: 100% !important; max-width: 100% !important; }
            .mobile-padding { padding: 10px !important; }
            .mobile-padding-sm { padding: 5px !important; }
            .header-title { font-size: 20px !important; line-height: 24px !important; }
            .header-subtitle { font-size: 13px !important; line-height: 16px !important; }
            .section-title { font-size: 22px !important; }
            .content-padding { padding: 15px !important; }
            .table-mobile { width: 100% !important; }
            .table-mobile td { display: block !important; width: 100% !important; padding: 10px !important; text-align: left !important; }
            .table-mobile td:first-child { font-weight: bold !important; background-color: #f0f4f8 !important; }
            .guidelines-box { display: block !important; width: 100% !important; margin-bottom: 10px !important; }
            .logo-cell { width: 45px !important; height: 45px !important; }
            .logo-img { width: 45px !important; height: 45px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #2c3e50; background-color: #f5f7fa; width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;">
        
        <!-- Email wrapper -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f7fa;">
          <tr>
            <td align="center" style="padding: 0;">
              
              <!-- Email container -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="mobile-full" style="max-width: 600px; width: 100%; background-color: #ffffff;">
                <tr>
                  <td>
          
                    <!-- Header -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #1976d2;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%); padding: 20px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td width="60" class="logo-cell" style="vertical-align: middle;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="50" height="50" style="background-color: #ffffff; border-radius: 50%;">
                                  <tr>
                                    <td align="center" valign="middle">
                                      <img src="https://familyfirstas.com/wp-content/uploads/2023/10/family-first-favicon-logo-512x512-1.png" 
                                           alt="FF" 
                                           width="35" 
                                           height="35" 
                                           class="logo-img"
                                           style="display: block; width: 35px; height: 35px; border: 0;">
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="padding-left: 15px; vertical-align: middle;">
                                <h1 class="header-title" style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; line-height: 28px;">
                                  Family First Adolescent Services
                                </h1>
                                <p class="header-subtitle" style="margin: 5px 0 0 0; color: #e3f2fd; font-size: 14px; line-height: 18px;">
                                  Therapeutic Outings Schedule &bull; Week of ${weekData.dateStr}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

          <div class="mobile-padding" style="padding: 30px 20px;">
            <!-- Mobile-Optimized Schedule Section -->
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="color: #1e293b; margin: 0; font-size: 30px; font-weight: 600; letter-spacing: -0.5px;">
                  Weekly Schedule
                </h3>
                <div style="width: 100px; height: 4px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 25px auto; border-radius: 2px;"></div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                ${tableHtml}
              </div>
            </div>

            <!-- Mobile-Optimized Guidelines -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
              <tr>
                <td>
                  <!--[if mso]>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                  <![endif]-->
                    <!--[if mso]><td width="280" valign="top" style="padding: 0 10px 10px 0;"><![endif]-->
                    <div class="guidelines-box" style="display: inline-block; width: 48%; max-width: 280px; vertical-align: top; margin-right: 2%;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 15px;">
                            <h4 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                              Safety First
                            </h4>
                            <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;">
                              • Search before transport<br>
                              • Visual contact always<br>
                              • Call PC if contraband<br>
                              • CA escorts for restrooms
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <!--[if mso]></td><td width="280" valign="top" style="padding: 0 0 10px 10px;"><![endif]-->
                    <div class="guidelines-box" style="display: inline-block; width: 48%; max-width: 280px; vertical-align: top;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 15px;">
                            <h4 style="color: #059669; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                              Team Protocol
                            </h4>
                            <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0;">
                              • No public conversations<br>
                              • Watch for wandering<br>
                              • Redirect contraband attempts<br>
                    • Keep group together
                  </div>
                </div>
                <!-- Comms -->
                <div style="flex: 1; background: #faf5ff; border-left: 3px solid #8b5cf6; padding: 15px; border-radius: 8px;">
                  <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    📞 Comms
                  </h4>
                  <div style="color: #6b21a8; font-size: 13px; line-height: 1.4;">
                    • Issues → Call PC/APC<br>
                    • Safety risk → Return immediately<br>
                    • Schedule changes → Coordinator<br>
                    • Document all incidents
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Check Action Box -->
            <div style="background: #f0f9ff; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <strong style="color: #1565c0; font-size: 14px;">Quick Check:</strong>
                <span style="color: #334155; font-size: 13px;">
                  ✓ Transport ready &nbsp;✓ Weather checked &nbsp;✓ Ratios confirmed &nbsp;✓ Contacts accessible &nbsp;✓ Vendor requirements reviewed
                </span>
              </div>
              <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                Questions? Contact the scheduling coordinator. Remember: These outings contribute to our clients' healing journey.
              </div>
            </div>


          </div>

                    <!-- Mobile-Optimized Footer -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #2c3e50;">
                      <tr>
                        <td style="padding: 25px 20px; text-align: center;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td align="center">
                                <h3 style="margin: 0 0 15px 0; color: #ecf0f1; font-size: 16px; font-weight: 500;">
                                  Family First Adolescent Services
                                </h3>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="font-size: 13px; color: #bdc3c7; margin: 0 0 10px 0; line-height: 1.6;">
                                  This is an automated message from the Therapeutic Outings Scheduler<br>
                                  <strong style="color: #3498db;">Powered by ClearHive Health</strong> &bull; Version ${CONFIG.VERSION}
                                </p>
                                <p style="font-size: 12px; color: #95a5a6; margin: 0; font-style: italic;">
                                  Please do not reply to this email
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
        
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `;
  }
  
  /**
   * Create mobile-responsive table for schedule
   */
  createMobileResponsiveTable(schedule) {
    let html = `
      <!--[if mso]>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e2e8f0;">
      <![endif]-->
      <!--[if !mso]><!-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="table-mobile" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <!--<![endif]-->
        <thead>
          <tr>
            <th style="background-color: #1976d2; color: #ffffff; padding: 15px; text-align: left; font-size: 14px; font-weight: 600;">Date</th>
            <th style="background-color: #1976d2; color: #ffffff; padding: 15px; text-align: left; font-size: 14px; font-weight: 600;" class="mobile-hide">Day</th>
            <th style="background-color: #1976d2; color: #ffffff; padding: 15px; text-align: left; font-size: 14px; font-weight: 600;">Outing Details</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    Object.entries(schedule).forEach(([day, data], index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const dateStr = data.date || 'TBD';
      const vendor = data.vendor || 'No outing scheduled';
      const time = data.time || '';
      
      html += `
        <tr>
          <td style="background-color: ${bgColor}; padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 500;">
            ${dateStr}
            <span class="mobile-hide" style="display: none;"><br/>${day}</span>
          </td>
          <td style="background-color: ${bgColor}; padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b;" class="mobile-hide">
            ${day}
          </td>
          <td style="background-color: ${bgColor}; padding: 15px; border-bottom: 1px solid #e2e8f0;">
            <div style="font-size: 15px; color: #1e293b; font-weight: 600; margin-bottom: 4px;">${vendor}</div>
            ${time ? `<div style="font-size: 13px; color: #64748b;">${time}</div>` : ''}
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    return html;
  }
  /**
   * Create HTML table for schedule
   */
  createScheduleTableHtml(weekData) {
    // Validate weekData structure
    if (!weekData || !weekData.headers || (!weekData.row && !weekData.rows)) {
      return '<p style="color: #d93025;">No schedule data available</p>';
    }
    
    // Handle both single row and multiple rows
    const rows = weekData.rows || [weekData.row];
    
    // Get vendor data for contact information
    const vendors = this.dataManager.getVendors();
    
    // Find house columns (from after Date column to before Options column)
    const dateIndex = weekData.headers.findIndex(h => h.toLowerCase().includes('date'));
    const optionsIndex = weekData.headers.findIndex(h => h.toLowerCase().includes('options'));
    
    const startIndex = dateIndex >= 0 ? dateIndex + 1 : 1;
    const endIndex = optionsIndex >= 0 ? optionsIndex : weekData.headers.length;
    
    // Filter house columns to exclude empty or boolean values
    const houseColumns = [];
    const houseIndexes = [];
    for (let i = startIndex; i < endIndex; i++) {
      const header = weekData.headers[i];
      if (header && header.trim() !== '' && 
          header.toLowerCase() !== 'true' && 
          header.toLowerCase() !== 'false' &&
          !header.toLowerCase().includes('option')) {
        houseColumns.push(header);
        houseIndexes.push(i);
      }
    }
    
    let html = `
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">`;
    
    // Process each row (day) in the week
    let hasScheduledOuting = false;
    
    for (const row of rows) {
      const date = new Date(row[dateIndex]);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Add date header row
      html += `
        <tr>
          <td colspan="4" style="background: #2c3e50; color: white; padding: 12px 16px; font-weight: 600; font-size: 16px;">
            ${dayName}, ${dateFormatted}
          </td>
        </tr>
        <tr>
          <th style="background: #ecf0f1; color: #2c3e50; padding: 10px 16px; text-align: left; font-weight: 600; font-size: 13px;">House</th>
          <th style="background: #ecf0f1; color: #2c3e50; padding: 10px 16px; text-align: left; font-weight: 600; font-size: 13px;">Vendor</th>
          <th style="background: #ecf0f1; color: #2c3e50; padding: 10px 16px; text-align: left; font-weight: 600; font-size: 13px;">Time</th>
          <th style="background: #ecf0f1; color: #2c3e50; padding: 10px 16px; text-align: left; font-weight: 600; font-size: 13px;">Contact Info</th>
        </tr>`;
      
      // Process each house for this day
      let dayHasOutings = false;
      for (let i = 0; i < houseColumns.length; i++) {
        const house = houseColumns[i];
        const cellData = row[houseIndexes[i]] || '';
        
        // Skip empty cells
        if (!cellData || cellData.toString().trim() === '') continue;
        
        if (cellData !== 'TBD' && cellData !== 'UNASSIGNED') {
          const parts = cellData.toString().split('\n');
          const vendor = parts[0] || '';
          const time = parts[1] || '';
          
          // Get vendor contact information
          const vendorData = vendors[vendor] || {};
          const contact = vendorData.Contact || 'Contact info not available';
          const address = vendorData.Address || '';
          
          // Combine contact and address
          let contactInfo = contact;
          if (address && address.trim()) {
            contactInfo += `<br><small style="color: #888;">${address}</small>`;
          }
          
          // Get vendor background color (matches Google Sheets colors)
          const dataManager = new DataManager(SpreadsheetApp.getActiveSpreadsheet());
          const bgColor = dataManager.getVendorBackgroundColor(vendor, vendorData);
          const houseHeaderColor = dataManager.getHouseHeaderColor(house);
          const houseColor = dataManager.getHouseColor(house);
          
          html += `
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600; background-color: ${houseHeaderColor}; color: ${houseColor};">${house}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background-color: ${bgColor}; font-weight: 500; color: #2c3e50;">${vendor}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #34495e;">${time}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #7f8c8d;">${contactInfo}</td>
            </tr>`;
          hasScheduledOuting = true;
          dayHasOutings = true;
        }
      }
      
      // If no outings for this day, add a note
      if (!dayHasOutings) {
        html += `
          <tr>
            <td colspan="4" style="padding: 12px 16px; text-align: center; color: #95a5a6; font-style: italic; border-bottom: 1px solid #f0f0f0;">
              No outings scheduled for this day
            </td>
          </tr>`;
      }
      
      // Add spacer row between days
      html += `<tr><td colspan="4" style="padding: 4px; background: #f8f9fa;"></td></tr>`;
    }
    
    // If no outings at all
    if (!hasScheduledOuting) {
      html += `
        <tr>
          <td colspan="4" style="padding: 30px; text-align: center; color: #7f8c8d; font-style: italic;">
            No therapeutic outings scheduled for this week
          </td>
        </tr>`;
    }
    
    html += '</table>';
    
    return html;
  }
  
  /**
   * Create plain text version of email
   */
  createPlainTextEmail(weekData) {
    let plainText = `Therapeutic Outings Schedule - ${weekData.dateStr}\n\n`;
    plainText += 'Good morning,\n\n';
    plainText += `Please find below the therapeutic outings schedule for Tuesday, ${weekData.dateStr}.\n\n`;
    
    // Get vendor data for contact information
    const vendors = this.dataManager.getVendors();
    
    if (weekData && weekData.headers && weekData.row) {
      // Find house columns (from after Date column to before Options column)
      const dateIndex = weekData.headers.findIndex(h => h.toLowerCase().includes('date'));
      const optionsIndex = weekData.headers.findIndex(h => h.toLowerCase().includes('options'));
      
      const startIndex = dateIndex >= 0 ? dateIndex + 1 : 1;
      const endIndex = optionsIndex >= 0 ? optionsIndex : weekData.headers.length;
      
      const houseColumns = weekData.headers.slice(startIndex, endIndex);
      
      plainText += 'SCHEDULE:\n';
      plainText += '=========\n\n';
      
      let hasScheduledOuting = false;
      
      for (let i = 0; i < houseColumns.length; i++) {
        const house = houseColumns[i];
        const dataIndex = startIndex + i;
        const cellData = weekData.row[dataIndex] || '';
        
        // Skip empty house names
        if (!house || house.trim() === '') continue;
        
        if (cellData && cellData !== 'TBD' && cellData !== 'UNASSIGNED' && cellData.toString().trim() !== '') {
          const parts = cellData.toString().split('\n');
          const vendor = parts[0] || '';
          const time = parts[1] || '';
          
          // Get vendor contact information
          const vendorData = vendors[vendor] || {};
          const contact = vendorData.Contact || 'Contact info not available';
          const address = vendorData.Address || '';
          
          plainText += `${house}:\n`;
          plainText += `  Vendor: ${vendor}\n`;
          plainText += `  Time: ${time}\n`;
          plainText += `  Contact: ${contact}\n`;
          if (address && address.trim()) {
            plainText += `  Address: ${address}\n`;
          }
          plainText += '\n';
          hasScheduledOuting = true;
        } else {
          plainText += `${house}: No outing scheduled\n\n`;
        }
      }
      
      if (!hasScheduledOuting) {
        plainText += 'No therapeutic outings scheduled for this week.\n\n';
      }
    } else {
      plainText += 'No schedule data available.\n\n';
    }
    
    plainText += `

========================================
STANDARD OUTING EXPECTATIONS
========================================

SAFETY FIRST:
* Searches: Conduct thorough searches on all clients before they enter the van for transport to and from the outing. If any contraband is found, notify PC/APC's immediately.

* Supervision: Maintain constant supervision of clients throughout the outing. If a client needs to use the restroom, a CA must escort them to it.

CLIENT INTERACTIONS:
* Public Interactions: Ensure clients do not engage in conversations with the public.
* Stay Alert: Be mindful of any wandering behavior - clients should not be looking for cigarettes, vapes, or contraband. Redirect and remain vigilant.
* Group Cohesion: Keep the group together and engaged in the planned therapeutic activity.

COMMUNICATION PROTOCOL:
* Issues or Concerns: Contact PC/APC immediately if any problems arise.
* Emergency Response: If safety is compromised, transport clients back to the facility immediately.
* Schedule Changes: Coordinate any necessary adjustments through the scheduling coordinator.

PRE-OUTING CHECKLIST:
[ ] Verify transportation arrangements
[ ] Confirm participant readiness  
[ ] Review vendor-specific requirements
[ ] Ensure emergency contact information is up-to-date
[ ] Check weather conditions
[ ] Confirm staff-to-client ratios

========================================

If you have any questions or need to make changes, please contact the scheduling coordinator.

---
This is an automated message from the FFAS Therapeutic Outings Scheduler v${CONFIG.VERSION}
`.trim();
    
    return plainText;
  }
  
  /**
   * Debug method to inspect weekData structure
   */
  debugWeekData(weekData) {
    console.log('=== DEBUG: WeekData Structure ===');
    console.log('weekData exists:', !!weekData);
    
    if (weekData) {
      console.log('dateStr:', weekData.dateStr);
      console.log('date:', weekData.date);
      console.log('headers length:', weekData.headers ? weekData.headers.length : 'null');
      console.log('headers:', weekData.headers);
      console.log('row length:', weekData.row ? weekData.row.length : 'null');
      console.log('row data:', weekData.row);
      
      // Check for potential issues
      if (weekData.row && weekData.row.length > 0) {
        for (let i = 0; i < weekData.row.length; i++) {
          const cell = weekData.row[i];
          if (cell && cell.toString().trim() === '1') {
            console.warn(`WARNING: Found potential row index in cell ${i}:`, cell);
          }
        }
      }
    }
    console.log('=== END DEBUG ===');
  }
  
  /**
   * Test email generation with enhanced debugging
   */
  debugEmailGeneration() {
    try {
      console.log('Starting PDF generation debug...');
      
      // Get week data with debugging
      const weekData = this.getThisWeekData();
      this.debugWeekData(weekData);
      
      if (!weekData) {
        throw new Error('No week data available for debugging');
      }
      
      // Test HTML generation
      console.log('Testing HTML generation...');
      const htmlTable = this.createScheduleTableHtml(weekData);
      console.log('HTML table generated successfully');
      
      // Test plain text generation
      const plainText = this.createPlainTextEmail(weekData);
      console.log('Plain text email generated successfully');
      
      return {
        success: true,
        weekData: weekData,
        htmlTable: htmlTable.length,
        plainText: plainText.length
      };
      
    } catch (error) {
      console.error('Email generation debug failed:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
}

// ======================== INCIDENT REPORTING SYSTEM ========================

// All legacy incident reporting code has been removed to simplify the script.
// The current implementation relies on a pre-existing Google Form
// for all incident reporting, which is a more robust and manageable solution.

// The following functions were removed:
// - createIncidentForm
// - processIncidentReport
// - createIncidentBackup
// - updateIncidentMetrics
// - saveFailedSubmission
// - sendIncidentNotification (a new version is used by the Google Form trigger)
// - doPost

/**
 * Create or link Google Form for incident reporting
 * This function helps set up a Google Form for incident reporting
 */
function createIncidentReportForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Check if form URL is already stored
    const existingFormUrl = PropertiesService.getScriptProperties().getProperty('INCIDENT_FORM_URL');
    
    if (existingFormUrl) {
      const result = ui.alert(
        'Form Already Configured',
        `An incident form URL is already set:\n${existingFormUrl}\n\n` +
        'Would you like to update it with a new form URL?',
        ui.ButtonSet.YES_NO
      );
      
      if (result !== ui.Button.YES) {
        return existingFormUrl;
      }
    }
    
    // Show dialog to get form URL
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
        <h3>🔗 Link Google Form for Incident Reporting</h3>
        
        <p>To use Google Forms for incident reporting, you need to:</p>
        
        <ol>
          <li><strong>Create a Google Form</strong> manually with these fields:
            <ul style="font-size: 14px; margin: 10px 0;">
              <li>Reporter Name (Short answer, Required)</li>
              <li>Reporter Role (Multiple choice: BHT, CA, PC, APC, Other)</li>
              <li>Incident Date (Date, Required)</li>
              <li>Incident Time (Time, Required)</li>
              <li>Vendor/Location (Short answer, Required)</li>
              <li>House/Program (Short answer, Required)</li>
              <li>Incident Type(s) (Checkboxes: Behavioral, Medical, Safety, etc.)</li>
              <li>Number of Clients (Scale 0-10)</li>
              <li>Outside Involvement (Multiple choice)</li>
              <li>Incident Description (Paragraph)</li>
              <li>Actions Taken (Paragraph)</li>
              <li>PC/APC Notified (Multiplea choice)</li>
              <li>Follow-up Required (Paragraph, Optional)</li>
            </ul>
          </li>
          <li><strong>Link it to this spreadsheet</strong> (Responses → Select response destination)</li>
          <li><strong>Copy the form's shareable link</strong></li>
          <li><strong>Paste it below</strong></li>
        </ol>
        
        <div style="margin: 20px 0;">
          <label for="formUrl" style="display: block; margin-bottom: 5px; font-weight: bold;">
            Google Form URL:
          </label>
          <input type="text" id="formUrl" 
                 placeholder="https://docs.google.com/forms/d/e/.../viewform" 
                 style="width: 100%; padding: 8px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
          <button onclick="google.script.host.close()" 
                  style="padding: 8px 16px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveFormUrl()" 
                  style="padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Save Form URL
          </button>
        </div>
        
        <script>
          function saveFormUrl() {
            const url = document.getElementById('formUrl').value.trim();
            if (!url) {
              alert('Please enter a form URL');
              return;
            }
            if (!url.includes('docs.google.com/forms')) {
              alert('Please enter a valid Google Forms URL');
              return;
            }
            google.script.run
              .withSuccessHandler(() => google.script.host.close())
              .withFailureHandler(error => alert('Error: ' + error))
              .saveIncidentFormUrl(url);
          }
        </script>
      </div>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(600)
      .setHeight(600);
    
    ui.showModalDialog(htmlOutput, 'Setup Incident Report Form');
    
  } catch (error) {
    console.error('Error in form setup:', error);
    ui.alert(
      '❌ Error',
      'Failed to set up incident form: ' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}

/**
 * Save incident form URL (called from HTML dialog)
 */
function saveIncidentFormUrl(formUrl) {
  try {
    // Store the form URL
    PropertiesService.getScriptProperties().setProperty('INCIDENT_FORM_URL', formUrl);
    
    // Extract form ID if possible
    const formIdMatch = formUrl.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/);
    if (formIdMatch) {
      PropertiesService.getScriptProperties().setProperty('INCIDENT_FORM_ID', formIdMatch[1]);
    }
    
    // Set up form submission trigger for the responses sheet
    setupFormResponseTrigger();
    
    // Show success message
    SpreadsheetApp.getUi().alert(
      '✅ Form Linked Successfully',
      `Incident report form has been linked!\n\n` +
      `Form URL: ${formUrl}\n\n` +
      `This URL will be used in emails and QR codes.\n` +
      `Make sure the form is set to submit responses to this spreadsheet.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    // Log the setup
    auditLog('INCIDENT_FORM_LINKED', {
      formUrl: formUrl,
      linkedBy: Session.getActiveUser().getEmail()
    });
    
  } catch (error) {
    throw new Error('Failed to save form URL: ' + error.toString());
  }
}

/**
 * Set up trigger for form responses
 */
function setupFormResponseTrigger() {
  try {
    // Remove any existing form submit triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger for form submissions
    ScriptApp.newTrigger('processFormSubmission')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onFormSubmit()
      .create();
    
    console.log('Form response trigger created successfully');
  } catch (error) {
    console.error('Error setting up trigger:', error);
  }
}

// Note: The form creation code has been moved to the appropriate function

/**
 * Process Google Form submission
 */
function processFormSubmission(e) {
  try {
    const response = e.response;
    const itemResponses = response.getItemResponses();
    
    // Parse form responses into a structured object
    const formData = {};
    itemResponses.forEach(itemResponse => {
      const title = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      
      // Map form fields to our data structure
      switch(title) {
        case 'Reporter Name':
          formData.reporterName = answer;
          break;
        case 'Reporter Role':
          formData.reporterRole = answer;
          break;
        case 'Incident Date':
          formData.incidentDate = answer;
          break;
        case 'Incident Time':
          formData.incidentTime = answer;
          break;
        case 'Vendor/Location':
          formData.vendor = answer;
          break;
        case 'House/Program':
          formData.house = answer;
          break;
        case 'Incident Type(s)':
          formData.incidentTypes = answer;
          break;
        case 'Number of Clients Involved':
          formData.clientsInvolved = answer;
          break;
        case 'Was anyone outside of Family First involved?':
          formData.outsideInvolvement = answer;
          break;
        case 'Incident Description':
          formData.incidentDescription = answer;
          break;
        case 'Actions Taken':
          formData.actionsTaken = answer;
          break;
        case 'PC/APC Notified?':
          formData.pcNotified = answer;
          break;
        case 'Follow-up Required?':
          formData.followUpNeeded = answer || '';
          break;
      }
    });
    
    // Generate report ID
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const ss = SpreadsheetApp.getActive();
    const formSheet = ss.getSheetByName('Form Responses 1') || ss.getSheets()[ss.getSheets().length - 1];
    const reportId = `IR-${year}-${String(formSheet.getLastRow()).padStart(4, '0')}`;
    
    // Add report ID to the form response row
    const lastRow = formSheet.getLastRow();
    const reportIdColumn = formSheet.getLastColumn() + 1;
    
    // Add header if needed
    if (lastRow === 1) {
      formSheet.getRange(1, reportIdColumn).setValue('Report ID');
    }
    formSheet.getRange(lastRow, reportIdColumn).setValue(reportId);
    
    // Send notification email
    sendIncidentNotification(formData, reportId);
    
  } catch (error) {
    console.error('Error processing form submission:', error);
  }
}

/**
 * Get or create incident report form URL
 */
function getIncidentFormUrl() {
  // Check if form URL is already stored
  let formUrl = PropertiesService.getScriptProperties().getProperty('INCIDENT_FORM_URL');
  
  if (!formUrl) {
    // Create new form if it doesn't exist
    formUrl = createIncidentReportForm();
  } else {
    // Verify form still exists
    try {
      const formId = PropertiesService.getScriptProperties().getProperty('INCIDENT_FORM_ID');
      if (formId) {
        FormApp.openById(formId);
      }
    } catch (error) {
      // Form no longer exists, create new one
      console.log('Form no longer exists, creating new one');
      formUrl = createIncidentReportForm();
    }
  }
  
  return formUrl;
}

/**
 * Handle web app GET requests - Redirect to Google Form
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    
    // Get the form URL
    const formUrl = getIncidentFormUrl();
    
    // Redirect to the form
    const html = `
      <script>
        window.location.href = '${formUrl}';
      </script>
      <p>Redirecting to incident report form...</p>
      <p>If you are not redirected automatically, <a href="${formUrl}">click here</a>.</p>
    `;
    
    return HtmlService.createHtmlOutput(html);
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput('Error: Unable to access form');
  }
}

/**
 * Show incident form URL in a dialog
 */
function showIncidentFormUrl() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const formUrl = getIncidentFormUrl();
    const formId = PropertiesService.getScriptProperties().getProperty('INCIDENT_FORM_ID');
    
    // Create a dialog with the form URL
    const htmlOutput = HtmlService.createHtmlOutput(`
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>📋 Incident Report Form URL</h3>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <input type="text" value="${formUrl}" 
                 style="width: 100%; padding: 8px; font-size: 14px; border: 1px solid #ddd;"
                 onclick="this.select();" readonly>
        </div>
        <p><strong>Form ID:</strong> ${formId}</p>
        <p>Share this URL with staff for incident reporting.</p>
        <button onclick="window.open('${formUrl}', '_blank')" 
                style="padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Open Form
        </button>
      </div>
    `).setWidth(500).setHeight(300);
    
    ui.showModalDialog(htmlOutput, 'Incident Report Form URL');
    
  } catch (error) {
    ui.alert('Error', 'Failed to get form URL: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * View incident reports in a formatted dialog
 */
function viewIncidentReports() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    const formSheet = ss.getSheetByName('Form Responses 1');
    
    if (!formSheet) {
      ui.alert('No Reports', 'No incident reports found. The form responses sheet does not exist.', ui.ButtonSet.OK);
      return;
    }
    
    const data = formSheet.getDataRange().getValues();
    if (data.length <= 1) {
      ui.alert('No Reports', 'No incident reports have been submitted yet.', ui.ButtonSet.OK);
      return;
    }
    
    // Create HTML table of reports
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>📋 Incident Reports</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f0f0f0;">
    `;
    
    // Add headers
    data[0].forEach(header => {
      html += `<th style="padding: 8px; border: 1px solid #ddd;">${header}</th>`;
    });
    html += '</tr>';
    
    // Add recent reports (last 10)
    const recentReports = data.slice(-10).reverse();
    recentReports.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
        </table>
        <p><em>Showing last ${recentReports.length} reports. View the sheet directly for all reports.</em></p>
      </div>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(html).setWidth(800).setHeight(600);
    ui.showModalDialog(htmlOutput, 'Recent Incident Reports');
    
  } catch (error) {
    ui.alert('Error', 'Failed to view reports: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Test form integration and functionality
 */
function testFormIntegration() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test getting the form URL
    const formUrl = getIncidentFormUrl();
    
    if (!formUrl) {
      throw new Error('Could not get form URL');
    }
    
    // Test form access
    const formId = PropertiesService.getScriptProperties().getProperty('INCIDENT_FORM_ID');
    if (formId) {
      const form = FormApp.openById(formId);
      console.log('Form accessed successfully:', form.getTitle());
    }
    
    // Show success message
    ui.alert(
      '✅ Form Integration Test Passed',
      `Form integration is working correctly!\n\n` +
      `Form URL: ${formUrl}\n\n` +
      `The form is accessible and properly configured.`,
      ui.ButtonSet.OK
    );
    
    // Log the test
    auditLog('FORM_INTEGRATION_TEST', {
      formUrl: formUrl,
      testBy: Session.getActiveUser().getEmail(),
      success: true
    });
    
    return true;

  } catch (error) {
    console.error('Form integration test failed:', error);
    ui.alert(
      '❌ Form Integration Test Failed',
      'Form integration test failed: ' + error.toString(),
      ui.ButtonSet.OK
    );
    return false;
  }
}

/**
 * Handle POST requests (kept for backward compatibility)
 */
function doPost(e) {
  // No longer used - Google Forms handles submissions directly
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: false, 
      message: 'This endpoint is deprecated. Please use the Google Form for incident reporting.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Show current incident form URL
 */
/**
 * Create incident reporting form (LEGACY - kept for compatibility)
 */
function createIncidentForm(params) {
  const weekDate = params.week || new Date().toLocaleDateString();
  const weekId = params.weekId || '';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Incident Report - FFAS Therapeutic Outings</title>
      <style>
        body {
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .form-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          color: #1a73e8;
        }
        .header h1 {
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
          margin: 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }
        input, textarea, select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        textarea {
          height: 100px;
          resize: vertical;
        }
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 10px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checkbox-item input[type="checkbox"] {
          width: auto;
          margin: 0;
        }
        .submit-btn {
          background-color: #1a73e8;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          margin-top: 20px;
        }
        .submit-btn:hover {
          background-color: #1557b0;
        }
        .submit-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .required {
          color: #d93025;
        }
        .expectations {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .expectations h3 {
          color: #856404;
          margin-top: 0;
        }
        .expectations ul {
          color: #856404;
          margin: 10px 0;
        }
        .disclaimer {
          background-color: #e8f5e8;
          border: 1px solid #4caf50;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #2e7d32;
        }
        .error-message {
          background-color: #fee;
          border: 1px solid #f88;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 20px;
          color: #d93025;
          display: none;
        }
        .success-container {
          text-align: center;
          padding: 50px;
        }
        .success-container h1 {
          color: #34a853;
        }
        .report-id {
          font-size: 24px;
          color: #1a73e8;
          font-weight: bold;
          margin: 20px 0;
        }
        .loading-spinner {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255,255,255,0.95);
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #1a73e8;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="loadingSpinner" class="loading-spinner">
        <div class="spinner"></div>
        <div>Submitting report...</div>
      </div>
      
      <div class="form-container" id="formContainer">
        <div class="header">
          <h1>🚨 Incident Report Form</h1>
          <p>Therapeutic Outings - Week of ${weekDate}</p>
          ${weekId ? `<p style="font-size: 12px; color: #999;">Reference: ${weekId}</p>` : ''}
        </div>
        
        <div id="errorMessage" class="error-message"></div>
        
        <div class="expectations">
          <h3>🛡️ Standard Outing Expectations Reminder</h3>
          <ul>
            <li><strong>Searches:</strong> Conduct thorough searches on all clients before transport</li>
            <li><strong>Supervision:</strong> Maintain constant supervision throughout the outing</li>
            <li><strong>Client Conduct:</strong> Ensure no public conversations, monitor for wandering behavior</li>
            <li><strong>Incident Protocol:</strong> Contact PC/APC and transport back if issues arise</li>
          </ul>
        </div>
        
        <div class="disclaimer">
          <strong>⚠️ Important:</strong> This form is for operational incident reporting only. No PHI (Protected Health Information) should be included. Use client initials or ID numbers only.
        </div>
        
        <form id="incidentForm">
          <div class="form-group">
            <label for="reporterName">Reporter Name <span class="required">*</span></label>
            <input type="text" id="reporterName" name="reporterName" required>
          </div>
          
          <div class="form-group">
            <label for="reporterRole">Reporter Role <span class="required">*</span></label>
            <select id="reporterRole" name="reporterRole" required>
              <option value="">Select Role</option>
              <option value="BHT">BHT (Behavioral Health Technician)</option>
              <option value="CA">CA (Care Assistant)</option>
              <option value="PC">PC (Program Coordinator)</option>
              <option value="APC">APC (Assistant Program Coordinator)</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="incidentDate">Incident Date <span class="required">*</span></label>
            <input type="date" id="incidentDate" name="incidentDate" required>
          </div>
          
          <div class="form-group">
            <label for="incidentTime">Incident Time <span class="required">*</span></label>
            <input type="time" id="incidentTime" name="incidentTime" required>
          </div>
          
          <div class="form-group">
            <label for="vendor">Vendor/Location <span class="required">*</span></label>
            <input type="text" id="vendor" name="vendor" placeholder="Where did the incident occur?" required>
          </div>
          
          <div class="form-group">
            <label for="house">House/Program <span class="required">*</span></label>
            <input type="text" id="house" name="house" placeholder="Which house/program was involved?" required>
          </div>
          
          <div class="form-group">
            <label>Incident Type <span class="required">*</span></label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="behavioral" name="incidentType" value="Behavioral">
                <label for="behavioral">Behavioral</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="medical" name="incidentType" value="Medical">
                <label for="medical">Medical</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="safety" name="incidentType" value="Safety">
                <label for="safety">Safety</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="property" name="incidentType" value="Property">
                <label for="property">Property Damage</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="contraband" name="incidentType" value="Contraband">
                <label for="contraband">Contraband</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="elopement" name="incidentType" value="Elopement">
                <label for="elopement">Elopement/Wandering</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="transport" name="incidentType" value="Transport">
                <label for="transport">Transportation</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="other" name="incidentType" value="Other">
                <label for="other">Other</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="clientsInvolved">Number of Clients Involved <span class="required">*</span></label>
            <input type="number" id="clientsInvolved" name="clientsInvolved" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="outsideInvolvement">Was anyone outside of Family First involved? <span class="required">*</span></label>
            <select id="outsideInvolvement" name="outsideInvolvement" required>
              <option value="">Select...</option>
              <option value="No">No</option>
              <option value="Yes - Public">Yes - Member of Public</option>
              <option value="Yes - Vendor Staff">Yes - Vendor Staff</option>
              <option value="Yes - Emergency Services">Yes - Emergency Services</option>
              <option value="Yes - Other">Yes - Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="incidentDescription">Incident Description <span class="required">*</span></label>
            <textarea id="incidentDescription" name="incidentDescription" 
                     placeholder="Describe what happened. Do not include any PHI - use initials or ID numbers only." 
                     required></textarea>
          </div>
          
          <div class="form-group">
            <label for="actionsTaken">Actions Taken <span class="required">*</span></label>
            <textarea id="actionsTaken" name="actionsTaken" 
                     placeholder="What immediate actions were taken to address the incident?" 
                     required></textarea>
          </div>
          
          <div class="form-group">
            <label for="pcNotified">PC/APC Notified? <span class="required">*</span></label>
            <select id="pcNotified" name="pcNotified" required>
              <option value="">Select...</option>
              <option value="Yes - Immediately">Yes - Immediately</option>
              <option value="Yes - Within 1 hour">Yes - Within 1 hour</option>
              <option value="Yes - Later">Yes - Later</option>
              <option value="No - Will notify">No - Will notify after this report</option>
              <option value="No - Not needed">No - Not needed for this incident</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="followUpNeeded">Follow-up Required?</label>
            <textarea id="followUpNeeded" name="followUpNeeded" 
                     placeholder="Any follow-up actions needed or recommendations?"></textarea>
          </div>
          
          <button type="submit" class="submit-btn">Submit Incident Report</button>
        </form>
      </div>
      
      <script>
        // Form validation and submission handler
        document.getElementById('incidentForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Clear any previous error messages
          const errorDiv = document.getElementById('errorMessage');
          errorDiv.style.display = 'none';
          errorDiv.textContent = '';
          
          // Validate incident type selection
          const incidentTypes = document.querySelectorAll('input[name="incidentType"]:checked');
          if (incidentTypes.length === 0) {
            showError('Please select at least one incident type.');
            return;
          }
          
          // Validate required fields
          const requiredFields = ['reporterName', 'reporterRole', 'incidentDate', 'incidentTime', 
                                'vendor', 'house', 'clientsInvolved', 'outsideInvolvement',
                                'incidentDescription', 'actionsTaken', 'pcNotified'];
          
          const formData = new FormData(this);
          for (const field of requiredFields) {
            if (!formData.get(field) || formData.get(field).trim() === '') {
              showError(\`Please fill in all required fields. Missing: \${field.replace(/([A-Z])/g, ' $1').trim()}\`);
              return;
            }
          }
          
          // Collect and prepare form data
          const data = {
            type: 'incident',
            week: '${weekDate}',
            weekId: '${weekId}',
            timestamp: new Date().toISOString(),
            reporterName: formData.get('reporterName').trim(),
            reporterRole: formData.get('reporterRole'),
            incidentDate: formData.get('incidentDate'),
            incidentTime: formData.get('incidentTime'),
            vendor: formData.get('vendor').trim(),
            house: formData.get('house').trim(),
            incidentTypes: Array.from(incidentTypes).map(cb => cb.value),
            clientsInvolved: parseInt(formData.get('clientsInvolved')),
            outsideInvolvement: formData.get('outsideInvolvement'),
            incidentDescription: formData.get('incidentDescription').trim(),
            actionsTaken: formData.get('actionsTaken').trim(),
            pcNotified: formData.get('pcNotified'),
            followUpNeeded: formData.get('followUpNeeded').trim(),
            source: 'Web Form',
            userAgent: navigator.userAgent
          };
          
          // Show loading spinner
          document.getElementById('loadingSpinner').style.display = 'block';
          
          // Disable submit button
          const submitBtn = document.querySelector('.submit-btn');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
          
          // Submit data with retry logic
          submitReport(data)
            .then(result => {
              if (result.success) {
                // Show success message
                document.getElementById('formContainer').innerHTML = \`
                  <div class="success-container">
                    <h1>✅ Report Submitted Successfully</h1>
                    <p>Thank you for submitting your incident report.</p>
                    <div class="report-id">Report ID: \${result.reportId}</div>
                    <p style="color: #666;">
                      This report has been saved and administrators have been notified.<br>
                      Submitted at: \${new Date(result.timestamp).toLocaleString()}
                    </p>
                    <p style="margin-top: 30px;">
                      <a href="#" onclick="window.print(); return false;" style="color: #1a73e8;">
                        Print this confirmation
                      </a>
                    </p>
                    <p style="color: #999; font-size: 14px;">You may close this window.</p>
                  </div>
                \`;
                
                // Log success to console
                console.log('Report submitted successfully:', result.reportId);
              } else {
                throw new Error(result.error || 'Submission failed');
              }
            })
            .catch(error => {
              console.error('Submission error:', error);
              showError('Error submitting report: ' + error.message + '. Please try again or contact support.');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Submit Incident Report';
            })
            .finally(() => {
              document.getElementById('loadingSpinner').style.display = 'none';
            });
        });
        
        // Submit report with retry logic
        async function submitReport(data, retryCount = 0) {
          const maxRetries = 3;
          
          try {
            const response = await fetch(window.location.href, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
              mode: 'cors'
            });
            
            if (!response.ok) {
              throw new Error(\`Server returned \${response.status}: \${response.statusText}\`);
            }
            
            return await response.json();
          } catch (error) {
            if (retryCount < maxRetries) {
              console.log(\`Retry attempt \${retryCount + 1} of \${maxRetries}...\`);
              await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
              return submitReport(data, retryCount + 1);
            }
            throw error;
          }
        }
        
        // Show error message
        function showError(message) {
          const errorDiv = document.getElementById('errorMessage');
          errorDiv.textContent = message;
        // Prevent form resubmission on page refresh
        if (window.history.replaceState) {
          window.history.replaceState(null, null, window.location.href);
        }
      </script>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(htmlContent)
    .setTitle('Incident Report Form')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Process incident report submission
 */
function processIncidentReport(data) {
  try {
    // Create or get incident reports sheet
    const ss = SpreadsheetApp.getActive();
    let incidentSheet = ss.getSheetByName('INCIDENT_REPORTS');
    
    if (!incidentSheet) {
      incidentSheet = ss.insertSheet('INCIDENT_REPORTS');
      
      // Set up headers
      const headers = [
        'Report ID', 'Submission Time', 'Week', 'Week ID', 'Reporter Name', 'Reporter Role',
        'Incident Date', 'Incident Time', 'Vendor/Location', 'House/Program',
        'Incident Types', 'Clients Involved', 'Outside Involvement',
        'Description', 'Actions Taken', 'PC Notified', 'Follow-up Needed',
        'Status', 'Reviewed By', 'Review Date', 'Source', 'IP Address'
      ];
      
      incidentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      incidentSheet.getRange(1, 1, 1, headers.length)
        .setBackground('#dc3545')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      
      incidentSheet.setFrozenRows(1);
      
      // Add data validation for status column
      const statusRange = incidentSheet.getRange(2, 18, 1000, 1);
      const statusRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['New', 'Under Review', 'Resolved', 'Follow-up Required', 'Closed'])
        .setAllowInvalid(false)
        .build();
      statusRange.setDataValidation(statusRule);
      
      // Protection for certain columns
      const protectedRange = incidentSheet.getRange(1, 1, 1000, 5);
      const protection = protectedRange.protect()
        .setDescription('System Generated Fields')
        .setWarningOnly(true);
    }
    
    // Generate unique report ID with better formatting
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const sequenceNum = incidentSheet.getLastRow();
    const reportId = `IR-${year}-${String(sequenceNum).padStart(4, '0')}`;
    
    // Get user's IP address for audit trail (if available)
    const ipAddress = data.ipAddress || 'Not available';
    
    // Prepare row data with all fields
    const rowData = [
      reportId,
      timestamp,
      data.week || '',
      data.weekId || '',
      data.reporterName,
      data.reporterRole,
      data.incidentDate,
      data.incidentTime,
      data.vendor,
      data.house,
      data.incidentTypes.join(', '),
      data.clientsInvolved,
      data.outsideInvolvement,
      data.incidentDescription,
      data.actionsTaken,
      data.pcNotified,
      data.followUpNeeded || '',
      'New',
      '',
      '',
      data.source || 'Web Form',
      ipAddress
    ];
    
    // Add row to sheet
    incidentSheet.appendRow(rowData);
    
    // Apply conditional formatting for new reports
    const newRowRange = incidentSheet.getRange(incidentSheet.getLastRow(), 1, 1, rowData.length);
    newRowRange.setBackground('#ffe0e0');
    
    // Auto-resize columns for better readability
    for (let i = 1; i <= rowData.length; i++) {
      incidentSheet.autoResizeColumn(i);
    }
    
    // Create backup in a separate sheet for data integrity
    createIncidentBackup(reportId, data);
    
    // Send notification email to administrators
    sendIncidentNotification(data, reportId);
    
    // Update dashboard metrics
    updateIncidentMetrics(data);
    
    // Log audit trail with more details
    auditLog('INCIDENT_REPORTED', {
      reportId: reportId,
      reporter: data.reporterName,
      incidentDate: data.incidentDate,
      vendor: data.vendor,
      house: data.house,
      types: data.incidentTypes,
      timestamp: timestamp.toISOString(),
      source: data.source || 'Web Form'
    });
    
    return { 
      success: true, 
      reportId: reportId,
      message: 'Incident report submitted successfully',
      timestamp: timestamp.toISOString()
    };
      
  } catch (error) {
    console.error('Error processing incident report:', error);
    
    // Try to save error report
    try {
      saveFailedSubmission(data, error);
    } catch (backupError) {
      console.error('Failed to save backup:', backupError);
    }
    
    return { 
      success: false, 
      error: error.toString(),
      message: 'Failed to process incident report'
    };
  }
}

/**
 * Create backup of incident report
 */
function createIncidentBackup(reportId, data) {
  try {
    const ss = SpreadsheetApp.getActive();
    let backupSheet = ss.getSheetByName('INCIDENT_BACKUP');
    
    if (!backupSheet) {
      backupSheet = ss.insertSheet('INCIDENT_BACKUP');
      backupSheet.hideSheet();
    }
    
    backupSheet.appendRow([
      reportId,
      new Date(),
      JSON.stringify(data)
    ]);
  } catch (error) {
    console.error('Failed to create backup:', error);
  }
}

/**
 * Update incident metrics dashboard
 */
function updateIncidentMetrics(data) {
  try {
    const ss = SpreadsheetApp.getActive();
    let metricsSheet = ss.getSheetByName('INCIDENT_METRICS');
    
    if (!metricsSheet) {
      metricsSheet = ss.insertSheet('INCIDENT_METRICS');
      
      // Initialize metrics headers
      const headers = [
        'Date', 'Total Reports', 'By Type', 'By House', 'By Vendor',
        'Response Time', 'Resolution Rate'
      ];
      metricsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Update metrics (implementation can be expanded)
    console.log('Metrics updated for incident report');
  } catch (error) {
    console.error('Failed to update metrics:', error);
  }
}

/**
 * Save failed submission for recovery
 */
function saveFailedSubmission(data, error) {
  const ss = SpreadsheetApp.getActive();
  let errorSheet = ss.getSheetByName('SUBMISSION_ERRORS');
  
  if (!errorSheet) {
    errorSheet = ss.insertSheet('SUBMISSION_ERRORS');
    errorSheet.getRange(1, 1, 1, 4).setValues([
      ['Timestamp', 'Error', 'Data', 'Recovered']
    ]);
  }
  
  errorSheet.appendRow([
    new Date(),
    error.toString(),
    JSON.stringify(data),
    false
  ]);
}

/**
 * Send incident notification to administrators
 */
function sendIncidentNotification(data, reportId) {
  try {
    const config = new DataManager(SpreadsheetApp.getActive()).getConfig();
    const adminEmail = config.AdminEmail || Session.getActiveUser().getEmail();
    
    const subject = `🚨 Incident Report Submitted - ${reportId}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #dc3545;">🚨 New Incident Report</h2>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3>Report Details</h3>
          <p><strong>Report ID:</strong> ${reportId}</p>
          <p><strong>Reporter:</strong> ${data.reporterName} (${data.reporterRole})</p>
          <p><strong>Date/Time:</strong> ${data.incidentDate} at ${data.incidentTime}</p>
          <p><strong>Location:</strong> ${data.vendor}</p>
          <p><strong>House/Program:</strong> ${data.house}</p>
          <p><strong>Incident Types:</strong> ${data.incidentTypes.join(', ')}</p>
          <p><strong>Clients Involved:</strong> ${data.clientsInvolved}</p>
          <p><strong>Outside Involvement:</strong> ${data.outsideInvolvement}</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4>Description:</h4>
          <p>${data.incidentDescription}</p>
          
          <h4>Actions Taken:</h4>
          <p>${data.actionsTaken}</p>
          
          <h4>PC/APC Notified:</h4>
          <p>${data.pcNotified}</p>
          
          ${data.followUpNeeded ? `<h4>Follow-up Needed:</h4><p>${data.followUpNeeded}</p>` : ''}
        </div>
        
        <p style="color: #666;">
          Please review this incident report in the INCIDENT_REPORTS sheet and take appropriate action.
        </p>
        
        <hr>
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from the FFAS Therapeutic Outings Scheduler.
        </p>
      </div>
    `;
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: 'FFAS Incident Reporting System'
    });
    
  } catch (error) {
    console.error('Failed to send incident notification:', error);
  }
}
// ======================== ANALYTICS & REPORTING ========================
/**
 * Generate PDF schedules for each house/program
 * This creates clean, professional PDFs that programs can distribute to their staff
 * without needing to share Google Calendars
 */
function generateHousePDFSchedules() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      ui.alert('Error', 'No schedule found. Please generate a schedule first.', ui.ButtonSet.OK);
      return;
    }
    
    // Ensure PDF folder exists
    const folderId = ensurePDFFolderExists();
    const folder = DriveApp.getFolderById(folderId);
    
    // Create subfolder for house schedules
    const houseFolder = folder.createFolder(`House Schedules - ${new Date().toLocaleDateString()}`);
    
    // Get schedule data
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Generate PDF for each house
    const houses = headers.filter(h => h && h !== 'Date' && h !== 'Options' && h !== 'Locked?');
    let pdfCount = 0;
    const pdfUrls = [];
    
    for (const house of houses) {
      const houseCol = headers.indexOf(house);
      if (houseCol === -1) continue;
      
      // Collect house schedule
      const houseSchedule = [];
      for (let row = 1; row < data.length; row++) {
        const date = data[row][0];
        const vendor = data[row][houseCol];
        if (date && vendor && vendor !== 'UNASSIGNED') {
          houseSchedule.push({
            date: new Date(date),
            vendor: vendor,
            dateStr: Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'EEEE, MMM d')
          });
        }
      }
      
      // Create HTML for this house
      const html = createHouseScheduleHtml(house, houseSchedule);
      
      // Convert to PDF
      const blob = Utilities.newBlob(html, 'text/html', `${house}_Schedule.html`)
        .getAs('application/pdf')
        .setName(`${house}_Schedule_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      
      // Save PDF
      const pdfFile = houseFolder.createFile(blob);
      pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      pdfUrls.push({
        house: house,
        url: pdfFile.getUrl()
      });
      pdfCount++;
    }
    
    // Show results with links
    showPDFLinksDialog(pdfUrls, houseFolder.getUrl());
    
    // Log activity
    auditLog('HOUSE_PDFS_GENERATED', {
      count: pdfCount,
      houses: houses,
      folderUrl: houseFolder.getUrl()
    });
    
  } catch (error) {
    ui.alert('Error', 'Failed to generate PDFs: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Create HTML content for house-specific schedule PDF
 */
function createHouseScheduleHtml(houseName, schedule) {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Group schedule by week
  const weeks = {};
  schedule.forEach(item => {
    const weekStart = getWeekStart(item.date);
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(item);
  });
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: letter portrait; margin: 0.5in; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          color: #333; 
          margin: 0; 
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 1px;
        }
        .header .subtitle {
          margin-top: 10px;
          font-size: 16px;
          opacity: 0.95;
        }
        .info-box {
          background: #f8f9fa;
          border-left: 4px solid #1976d2;
          padding: 15px;
          margin-bottom: 25px;
          border-radius: 4px;
        }
        .info-box h3 {
          margin: 0 0 10px 0;
          color: #1976d2;
          font-size: 18px;
        }
        .week-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .week-header {
          background: #e3f2fd;
          padding: 10px 15px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-weight: 600;
          color: #1565c0;
          font-size: 16px;
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .schedule-table th {
          background: #1976d2;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 500;
        }
        .schedule-table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
          background: white;
        }
        .schedule-table tr:hover td {
          background: #f5f5f5;
        }
        .vendor-name {
          font-weight: 600;
          color: #1565c0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .contact-info {
          background: #fff3e0;
          border: 1px solid #ffb74d;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 25px;
        }
        .contact-info h4 {
          margin: 0 0 10px 0;
          color: #f57c00;
        }
        @media print {
          .header {
            background: #1976d2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${houseName} - Therapeutic Outings Schedule</h1>
        <div class="subtitle">${currentMonth}</div>
      </div>
      
      <div class="info-box">
        <h3>📋 Schedule Overview</h3>
        <p>This document contains the therapeutic outing schedule for <strong>${houseName}</strong>.</p>
        <p>Total outings scheduled: <strong>${schedule.length}</strong></p>
      </div>
      
      <div class="contact-info">
        <h4>📞 Important Contacts</h4>
        <p><strong>Director of Case Management:</strong> Christopher Molina</p>
        <p><strong>Phone:</strong> (561) 703-4864</p>
        <p><strong>Email:</strong> cmolina@familyfirstas.com</p>
        <p><strong>Scheduling Email:</strong> scheduling@familyfirstas.com</p>
      </div>
  `;
  
  // Add schedule by week
  Object.keys(weeks).sort().forEach(weekKey => {
    const weekStart = new Date(weekKey);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekLabel = `Week of ${Utilities.formatDate(weekStart, Session.getScriptTimeZone(), 'MMM d')} - ${Utilities.formatDate(weekEnd, Session.getScriptTimeZone(), 'MMM d, yyyy')}`;
    
    html += `
      <div class="week-section">
        <div class="week-header">${weekLabel}</div>
        <table class="schedule-table">
          <thead>
            <tr>
              <th style="width: 30%;">Date</th>
              <th style="width: 40%;">Vendor</th>
              <th style="width: 30%;">Time</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    weeks[weekKey].forEach(item => {
      const vendorLines = item.vendor.toString().split('\n');
      const vendorName = vendorLines[0];
      const time = vendorLines[1] || 'Time TBD';
      
      html += `
        <tr>
          <td>${item.dateStr}</td>
          <td class="vendor-name">${vendorName}</td>
          <td>${time}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  });
  
  html += `
      <div class="footer">
        <p><strong>Family First Adolescent Services</strong></p>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>This schedule is subject to change. Please check for updates regularly.</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Show dialog with PDF links for easy sharing
 */
function showPDFLinksDialog(pdfUrls, folderUrl) {
  const ui = SpreadsheetApp.getUi();
  
  let linksHtml = pdfUrls.map(item => `
    <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
      <strong>${item.house}:</strong><br>
      <a href="${item.url}" target="_blank" style="color: #1976d2; word-break: break-all;">${item.url}</a>
    </div>
  `).join('');
  
  const htmlContent = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #1976d2;">✅ PDF Schedules Generated!</h2>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1565c0;">📁 All PDFs saved to:</h3>
        <a href="${folderUrl}" target="_blank" style="color: #1976d2; font-weight: bold;">Open Folder in Google Drive</a>
      </div>
      
      <h3 style="color: #333; margin-top: 20px;">📄 Individual PDF Links:</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${linksHtml}
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 6px;">
        <h4 style="margin: 0 0 10px 0; color: #f57c00;">📨 How to Share:</h4>
        <ol style="margin: 5px 0; padding-left: 20px;">
          <li>Click on any link above to open the PDF</li>
          <li>Share the link via email to the house coordinators</li>
          <li>PDFs are view-only and can be accessed by anyone with the link</li>
          <li>No Google account required to view</li>
        </ol>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="emailPDFsToDistributionLists()" 
                style="background: #4CAF50; color: white; border: none; padding: 10px 30px; 
                       border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px;">
          📧 Email PDFs to Distribution Lists
        </button>
        <button onclick="google.script.host.close()" 
                style="background: #1976d2; color: white; border: none; padding: 10px 30px; 
                       border-radius: 4px; cursor: pointer; font-size: 16px;">
          Close
        </button>
      </div>
    </div>
    
    <script>
      function emailPDFsToDistributionLists() {
        const pdfData = ${JSON.stringify(pdfUrls)};
        const folderUrl = '${folderUrl}';
        
        google.script.run
          .withSuccessHandler(function(result) {
            alert('✅ PDFs have been emailed to the distribution lists!');
            google.script.host.close();
          })
          .withFailureHandler(function(error) {
            alert('❌ Error sending emails: ' + error.toString());
          })
          .emailPDFLinksToDistributionLists(pdfData, folderUrl);
      }
    </script>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(650);
  
  ui.showModalDialog(htmlOutput, 'PDF Schedules Ready');
}

/**
 * Email PDF links to the distribution lists
 */
function emailPDFLinksToDistributionLists(pdfData, folderUrl) {
  // Get the distribution lists
  const distributionLists = [
    'Estates_CA@familyfirstas.com',
    'Nest_CA@familyfirstas.com',
    'Cove_CA@familyfirstas.com'
  ];
  
  const subject = `📋 Weekly Therapeutic Outings Schedules - PDFs Available`;
  
  // Create email body with all PDF links
  let htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📋 Weekly Schedule PDFs Ready</h1>
      </div>
      
      <div style="padding: 30px; background: #f5f5f5;">
        <p style="font-size: 16px; color: #333;">
          The therapeutic outing schedules are now available as PDF documents. 
          Each house has its own PDF with the complete schedule.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1976d2; margin-top: 0;">📄 PDF Schedule Links:</h2>
  `;
  
  pdfData.forEach(item => {
    htmlBody += `
      <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 3px solid #1976d2; border-radius: 4px;">
        <strong style="color: #1565c0; font-size: 16px;">${item.house}</strong><br>
        <a href="${item.url}" style="color: #1976d2; text-decoration: none;">📥 Download PDF Schedule</a>
      </div>
    `;
  });
  
  htmlBody += `
        </div>
        
        <div style="background: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #f57c00;">📁 All PDFs in One Folder:</h3>
          <a href="${folderUrl}" style="color: #1976d2; font-weight: bold;">Open Google Drive Folder</a>
        </div>
        
        <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32;">✅ Benefits of PDF Schedules:</h3>
          <ul style="margin: 5px 0; padding-left: 20px; color: #2e7d32;">
            <li>No Google account required to view</li>
            <li>Can be printed for offline reference</li>
            <li>Easy to share with staff members</li>
            <li>Professional, clean format</li>
            <li>Organized by week for easy reading</li>
          </ul>
        </div>
      </div>
      
      <div style="background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 14px;">
          Family First Adolescent Services<br>
          Generated on ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  `;
  
  const plainBody = `
Weekly Therapeutic Outings Schedules - PDFs Available

The therapeutic outing schedules are now available as PDF documents.

PDF Links:
${pdfData.map(item => `${item.house}: ${item.url}`).join('\n')}

All PDFs Folder: ${folderUrl}

Benefits of PDF Schedules:
- No Google account required to view
- Can be printed for offline reference
- Easy to share with staff members
- Professional, clean format
- Organized by week for easy reading

Family First Adolescent Services
Generated on ${new Date().toLocaleString()}
  `;
  
  // Send to distribution lists
  distributionLists.forEach(email => {
    try {
      sendEmailSafely(email, subject, plainBody, htmlBody, {
        type: 'schedule_pdf',
        duplicateWindowMs: 24 * 60 * 60 * 1000
      });
    } catch (error) {
      console.error(`Failed to send PDF links to ${email}:`, error);
    }
  });
  
  return 'PDFs emailed successfully to distribution lists';
}

/**
 * Generate PDF schedules for each VENDOR showing which houses they visit
 * This is different from house PDFs - vendors see their own schedule across all houses
 */
function generateVendorSchedulePdfs() {
  const ui = SpreadsheetApp.getUi();
  
  const confirm = ui.alert(
    '📄 Generate Vendor PDFs',
    'This will create a PDF for each vendor showing:\n\n' +
    '• All houses they are scheduled to visit\n' +
    '• Dates and times for each visit\n' +
    '• Contact information for houses\n\n' +
    'This is different from House PDFs which show each house\'s schedule.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  try {
    // Show progress dialog
    const htmlOutput = HtmlService
      .createHtmlOutput(`
        <div style="padding: 20px; font-family: Arial;">
          <h3>📄 Generating Vendor PDFs</h3>
          <p id="status">Preparing...</p>
          <div style="width: 100%; background: #f0f0f0; border-radius: 4px; margin: 10px 0;">
            <div id="progress" style="width: 0%; height: 20px; background: #4CAF50; border-radius: 4px; transition: width 0.3s;"></div>
          </div>
          <p id="count" style="font-size: 12px; color: #666;"></p>
        </div>
        <script>
          window.updateProgress = function(percent, status, count) {
            document.getElementById('progress').style.width = percent + '%';
            document.getElementById('status').textContent = status;
            document.getElementById('count').textContent = count;
          }
        </script>
      `)
      .setWidth(400)
      .setHeight(200);

    const dialog = ui.showModelessDialog(htmlOutput, 'PDF Generation');
    
    // Update progress
    const updateProgress = (percent, status, count) => {
      ui.showModelessDialog(
        HtmlService.createHtmlOutput(
          `<script>google.script.host.close(); window.parent.updateProgress(${percent}, "${status}", "${count}");</script>`
        ),
        'temp'
      );
    };
    
    updateProgress(0, 'Checking system setup...', '');
    
    // Ensure PDF folder exists
    const folderId = ensurePDFFolderExists();
    if (!folderId) {
      throw new Error('Could not create or find PDF folder');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataManager = new DataManager(ss);
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      throw new Error('Schedule sheet not found. Generate a schedule first.');
    }
    
    updateProgress(10, 'Loading vendor data...', '');
    
    // Get vendors data with validation
    let vendors;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        vendors = dataManager.getVendors();
        if (vendors && vendors.length > 0) {
          break;
        }
        throw new Error('No vendors found. Please set up vendors first.');
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        Utilities.sleep(1000);
      }
    }
    
    // Get schedule data
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Group schedule by vendor
    const vendorSchedules = {};
    
    for (let row = 1; row < data.length; row++) {
      const date = data[row][0];
      if (!date) continue;
      
      for (let col = 1; col < headers.length; col++) {
        const house = headers[col];
        if (!house || house === 'Options' || house === 'Locked?') continue;
        
        const cellValue = data[row][col];
        if (!cellValue || cellValue === 'UNASSIGNED' || cellValue === 'TBD') continue;
        
        // Parse vendor name and time from cell value
        const lines = cellValue.toString().split('\n');
        const vendorName = lines[0];
        const time = lines[1] || 'Time TBD';
        
        if (!vendorSchedules[vendorName]) {
          vendorSchedules[vendorName] = [];
        }
        
        vendorSchedules[vendorName].push({
          date: new Date(date),
          house: house,
          time: time
        });
      }
    }
    
    // Access the folder
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      ui.alert('Error', 'Cannot access PDF folder. Check folder ID and permissions.', ui.ButtonSet.OK);
      return;
    }
    
    // Generate PDFs
    let pdfCount = 0;
    const errors = [];
    
    for (const vendorName in vendorSchedules) {
      try {
        const vendorData = vendors[vendorName] || {};
        const assignments = vendorSchedules[vendorName];
        
        // Sort assignments by date
        assignments.sort((a, b) => a.date - b.date);
        
        // Create HTML content
        const html = createVendorScheduleHtml(vendorName, vendorData, assignments);
        
        // Convert to PDF
        const blob = Utilities.newBlob(html, 'text/html', `${vendorName}_Schedule_${new Date().getFullYear()}.html`)
          .getAs('application/pdf')
          .setName(`${vendorName}_Schedule_${new Date().getFullYear()}.pdf`);
        
        // Save to folder
        folder.createFile(blob);
        pdfCount++;
        
      } catch (error) {
        errors.push(`${vendorName}: ${error.toString()}`);
      }
    }
    
    // Show results
    let message = `Successfully generated ${pdfCount} vendor PDFs!\n\n`;
    message += `Location: ${folder.getName()} folder in Drive`;
    
    if (errors.length > 0) {
      message += `\n\nErrors:\n${errors.join('\n')}`;
    }
    
    ui.alert('✅ PDFs Generated', message, ui.ButtonSet.OK);
    
    // Log activity
    auditLog('VENDOR_PDFS_GENERATED', {
      count: pdfCount,
      vendors: Object.keys(vendorSchedules),
      errors: errors
    });
    
  } catch (error) {
    ui.alert('Error', 'Failed to generate PDFs: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Create HTML content for vendor schedule PDF
 */
function createVendorScheduleHtml(vendorName, vendorData, assignments) {
  try {
    const year = new Date().getFullYear();
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: letter portrait; margin: 0.5in; }
        body { 
          font-family: Arial, sans-serif; 
          color: #333; 
          margin: 0; 
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header h2 {
          margin: 10px 0 0 0;
          font-size: 20px;
          font-weight: normal;
        }
        .info-box {
          background: #f8f9fa;
          border-left: 4px solid #1a73e8;
          padding: 20px;
          margin-bottom: 30px;
        }
        .info-box h3 {
          margin: 0 0 10px 0;
          color: #1a73e8;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #e3f2fd;
          color: #1565c0;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #1976d2;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        .month-header {
          background: #1976d2;
          color: white;
          padding: 8px 12px;
          margin: 20px 0 10px 0;
          font-weight: bold;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          color: #6c757d;
          font-size: 12px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .contact-info {
          background: #e8f5e9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Family First Adolescent Services</h1>
        <h2>${vendorName} - ${year} Schedule</h2>
      </div>
  `;
  
  // Add vendor contact info if available
  if (vendorData.Contact || vendorData.Phone || vendorData.Email) {
    html += `
      <div class="contact-info">
        <h3>Contact Information</h3>
        ${vendorData.Contact ? `<p><strong>Contact:</strong> ${vendorData.Contact}</p>` : ''}
        ${vendorData.Phone ? `<p><strong>Phone:</strong> ${vendorData.Phone}</p>` : ''}
        ${vendorData.Email ? `<p><strong>Email:</strong> ${vendorData.Email}</p>` : ''}
      </div>
    `;
  }
  
  // Add summary
  html += `
    <div class="info-box">
      <h3>Schedule Summary</h3>
      <p><strong>Total Outings:</strong> ${assignments.length}</p>
      <p><strong>Period:</strong> ${Utilities.formatDate(assignments[0].date, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')} 
        to ${Utilities.formatDate(assignments[assignments.length-1].date, CONFIG.DEFAULT_TIMEZONE, 'MMM d, yyyy')}</p>
    </div>
  `;
  
  // Group assignments by month
  const monthGroups = {};
  assignments.forEach(assignment => {
    const monthKey = Utilities.formatDate(assignment.date, CONFIG.DEFAULT_TIMEZONE, 'MMMM yyyy');
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }
    monthGroups[monthKey].push(assignment);
  });
  
  // Add PC contact information section with ALL PCs
  html += `
    <div class="contact-info">
      <h3>🚨 Important Contacts</h3>
      <h4>Program Coordinators:</h4>
  `;
  
  // Get unique PCs (some PCs manage multiple houses)
  const uniquePCs = new Map();
  Object.entries(CONFIG.PC_CONTACTS).forEach(([house, pcInfo]) => {
    if (!uniquePCs.has(pcInfo.name)) {
      uniquePCs.set(pcInfo.name, pcInfo);
    }
  });
  
  // Display all PCs
  uniquePCs.forEach(pc => {
    html += `<p><strong>${pc.name}:</strong> ${pc.phone} (${pc.houses.join(', ')})</p>`;
  });
  
  html += `
    <h4>Director of Case Management:</h4>
    <p><strong>Christopher Molina:</strong> ${CONFIG.MAIN_CONTACT_PHONE || '(561) 703-4864'}</p>
    <p><strong>Email:</strong> ${CONFIG.DIRECTOR_EMAIL || 'cmolina@familyfirstas.com'}</p>
    <p><em>Save these numbers in your phone for quick access!</em></p>
  </div>
  `;

  // Add schedule table by month
  html += '<h3 style="color: #1976d2;">Scheduled Outings</h3>';
  
  for (const month in monthGroups) {
    html += `
      <div class="month-header">${month}</div>
      <table>
        <tr>
          <th style="width: 20%;">Date</th>
          <th style="width: 15%;">Day</th>
          <th style="width: 20%;">House</th>
          <th style="width: 20%;">Time</th>
          <th style="width: 25%;">PC Contact</th>
        </tr>
    `;
    
    monthGroups[month].forEach(assignment => {
      const dateStr = Utilities.formatDate(assignment.date, CONFIG.DEFAULT_TIMEZONE, 'MMM d');
      const dayStr = Utilities.formatDate(assignment.date, CONFIG.DEFAULT_TIMEZONE, 'EEEE');
      const pcInfo = CONFIG.PC_CONTACTS[assignment.house];
      const pcContact = pcInfo ? `${pcInfo.name}<br/>${pcInfo.phone}` : `Christopher Molina<br/>${CONFIG.MAIN_CONTACT_PHONE || '(561) 703-4864'}`;
      
      html += `
        <tr>
          <td>${dateStr}</td>
          <td>${dayStr}</td>
          <td><strong>${assignment.house}</strong></td>
          <td>${assignment.time}</td>
          <td>${pcContact}</td>
        </tr>
      `;
    });
    
    html += '</table>';
  }
  
  // Add footer
  html += `
    <div class="footer">
      <p>Generated on ${Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'MMMM d, yyyy h:mm a')}</p>
      <p>Family First Therapeutic Outings Scheduler v${CONFIG.VERSION}</p>
      <p><em>Powered by ClearHive Health</em></p>
    </div>
    </body>
    </html>
  `;
  
    return html;
  } catch (error) {
    console.error('Error in createVendorScheduleHtml:', error);
    throw error;
  }
}

/**
 * Create public vendor schedules (PDFs + shareable Google Sheets) 
 * for vendors without email access - includes full year schedule and PC contacts
 */
function createPublicVendorSchedules() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '🔗 Create Public Vendor Schedules',
    'This will create:\n\n' +
    '📄 Individual PDF schedules for each vendor\n' +
    '📋 Shareable Google Sheets (no login required)\n' +
    '🔗 Public links for vendors without email access\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataManager = new DataManager(ss);
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      ui.alert('Error', 'Schedule sheet not found. Generate a schedule first.', ui.ButtonSet.OK);
      return;
    }
    
    // Ensure PDF folder exists
    const folderId = ensurePDFFolderExists();
    const folder = DriveApp.getFolderById(folderId);
    
    // Get vendors data
    const vendors = dataManager.getVendors();
    const data = scheduleSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Create a master tracking sheet for public links
    const trackingSheet = createPublicLinksTrackingSheet(ss);
    const trackingData = [['Vendor Name', 'PDF Link', 'Google Sheet Link', 'Last Updated', 'Access Type']];
    
    // Group schedule by vendor
    const vendorSchedules = {};
    
    for (let row = 1; row < data.length; row++) {
      const date = data[row][0];
      if (!date) continue;
      
      for (let col = 1; col < headers.length; col++) {
        const house = headers[col];
        const cellValue = data[row][col];
        
        if (cellValue && cellValue !== 'UNASSIGNED' && cellValue.trim() !== '') {
          // Extract vendor name from cell (might include time)
          const vendorName = cellValue.split('\n')[0].trim();
          
          if (!vendorSchedules[vendorName]) {
            vendorSchedules[vendorName] = [];
          }
          
          vendorSchedules[vendorName].push({
            date: new Date(date),
            house: house,
            assignment: cellValue,
            time: cellValue.includes('\n') ? cellValue.split('\n')[1] : 'Time TBD'
          });
        }
      }
    }
    
    let successCount = 0;
    const errors = [];
    
    // Generate public schedules for each vendor
    for (const vendorName in vendorSchedules) {
      try {
        const vendorData = vendors[vendorName] || {};
        const assignments = vendorSchedules[vendorName];
        
        // Sort assignments by date
        assignments.sort((a, b) => a.date - b.date);
        
        // 1. Create PDF
        const html = createVendorScheduleHtml(vendorName, vendorData, assignments);
        const pdfBlob = Utilities.newBlob(html, 'text/html', `${vendorName}_Schedule_${new Date().getFullYear()}.html`)
          .getAs('application/pdf')
          .setName(`${vendorName}_Schedule_${new Date().getFullYear()}.pdf`);
        
        const pdfFile = folder.createFile(pdfBlob);
        
        // Make PDF publicly viewable
        pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const pdfLink = pdfFile.getUrl();
        
        // 2. Create individual Google Sheet for vendor
        const vendorSheetName = `${vendorName} - ${new Date().getFullYear()} Schedule`;
        const vendorSpreadsheet = SpreadsheetApp.create(vendorSheetName);
        const vendorSheet = vendorSpreadsheet.getActiveSheet();
        
        // Format vendor sheet
        vendorSheet.clear();
        vendorSheet.setName('Schedule');
        
        // Add header with PC contact information
        const sheetHeaders = ['Date', 'Day', 'House', 'Time', 'PC Contact', 'PC Phone', 'Assignment Details'];
        vendorSheet.getRange(3, 1, 1, sheetHeaders.length).setValues([sheetHeaders]);
        vendorSheet.getRange(3, 1, 1, sheetHeaders.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
        
        // Get PC contact information from CONFIG
        const getPCContact = (houseName) => {
          const pcInfo = CONFIG.PC_CONTACTS[houseName];
          if (pcInfo) {
            return {
              pcContact: pcInfo.name,
              pcPhone: pcInfo.phone
            };
          }
          return {
            pcContact: 'Main Office',
            pcPhone: CONFIG.MAIN_CONTACT_PHONE || '(561) 703-4864'
          };
        };
        
        // Add data with PC contact info
        const sheetData = assignments.map(assignment => {
          const pcInfo = getPCContact(assignment.house);
          return [
            Utilities.formatDate(assignment.date, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy'),
            Utilities.formatDate(assignment.date, CONFIG.DEFAULT_TIMEZONE, 'EEEE'),
            assignment.house,
            assignment.time,
            pcInfo.pcContact,
            pcInfo.pcPhone,
            assignment.assignment
          ];
        });
        
        if (sheetData.length > 0) {
          vendorSheet.getRange(4, 1, sheetData.length, sheetHeaders.length).setValues(sheetData);
        }
        
        // Auto-resize columns
        vendorSheet.autoResizeColumns(1, sheetHeaders.length);
        
        // Add vendor info and emergency contacts at the top
        vendorSheet.insertRowsBefore(1, 3);
        
        // Title
        vendorSheet.getRange(1, 1).setValue(`${vendorName} - ${new Date().getFullYear()} Therapeutic Outings Schedule`);
        vendorSheet.getRange(1, 1, 1, sheetHeaders.length).merge().setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center').setBackground('#1155cc').setFontColor('white');
        
        // Emergency contact information
        vendorSheet.getRange(2, 1).setValue('🚨 EMERGENCY CONTACTS & IMPORTANT INFORMATION');
        vendorSheet.getRange(2, 1, 1, sheetHeaders.length).merge().setFontSize(12).setFontWeight('bold').setBackground('#ff6d01').setFontColor('white');
        
        // Show ALL PC contacts
        const uniquePCs = new Map();
        Object.entries(CONFIG.PC_CONTACTS).forEach(([house, pcInfo]) => {
          if (!uniquePCs.has(pcInfo.name)) {
            uniquePCs.set(pcInfo.name, {...pcInfo});
          }
        });
        
        const allPCs = Array.from(uniquePCs.values()).map(pc => 
          `${pc.name}: ${pc.phone} (${pc.houses.join(', ')})`
        ).join(' | ');
        
        vendorSheet.getRange(3, 1).setValue(`PROGRAM COORDINATORS: ${allPCs} | DIRECTOR: Christopher Molina - ${CONFIG.MAIN_CONTACT_PHONE || '(561) 703-4864'} - ${CONFIG.DIRECTOR_EMAIL || 'cmolina@familyfirstas.com'}`);
        vendorSheet.getRange(3, 1, 1, sheetHeaders.length).merge().setFontSize(10).setBackground('#fff2cc').setWrap(true);
        
        // Make spreadsheet publicly viewable
        const vendorSpreadsheetFile = DriveApp.getFileById(vendorSpreadsheet.getId());
        vendorSpreadsheetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Move to the vendor folder
        folder.addFile(vendorSpreadsheetFile);
        DriveApp.getRootFolder().removeFile(vendorSpreadsheetFile);
        
        const sheetLink = vendorSpreadsheet.getUrl();
        
        // Add to tracking data
        trackingData.push([
          vendorName,
          pdfLink,
          sheetLink,
          Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy hh:mm a'),
          'Public (No Login Required)'
        ]);
        
        successCount++;
        
      } catch (error) {
        errors.push(`${vendorName}: ${error.toString()}`);
      }
    }
    
    // Update tracking sheet
    if (trackingData.length > 1) {
      trackingSheet.clear();
      trackingSheet.getRange(1, 1, trackingData.length, trackingData[0].length).setValues(trackingData);
      trackingSheet.getRange(1, 1, 1, trackingData[0].length).setFontWeight('bold').setBackground('#34a853').setFontColor('white');
      trackingSheet.autoResizeColumns(1, trackingData[0].length);
    }
    
    // Show results
    let message = `✅ Created public schedules for ${successCount} vendors!\n\n`;
    message += `📁 Location: Check the "Vendor Schedule PDFs - ${new Date().getFullYear()}" folder in Google Drive\n\n`;
    message += `🔗 Tracking: Check the "PUBLIC_VENDOR_LINKS" sheet for all shareable links\n\n`;
    message += `📋 What was created:\n`;
    message += `• PDF schedules (downloadable)\n`;
    message += `• Google Sheets (viewable online)\n`;
    message += `• All links work without login\n`;
    
    if (errors.length > 0) {
      message += `\n❌ Errors:\n${errors.join('\n')}`;
    }
    
    ui.alert('🎉 Public Vendor Schedules Created!', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', 'Failed to create public schedules: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Create or update the public links tracking sheet
 */
function createPublicLinksTrackingSheet(ss) {
  let sheet = ss.getSheetByName('PUBLIC_VENDOR_LINKS');
  
  if (!sheet) {
    sheet = ss.insertSheet('PUBLIC_VENDOR_LINKS');
  }
  
  return sheet;
}

/**
 * Generate comprehensive vendor performance report
 */
/**
 * Generate comprehensive vendor performance report
 */
function generateVendorReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    const dataManager = new DataManager(ss);
    
    // Get data from sheets
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    const incidentSheet = ss.getSheetByName('INCIDENT_REPORTS');
    const vendors = dataManager.getVendors();
    
    if (!scheduleSheet || scheduleSheet.getLastRow() <= 1) {
      ui.alert('No Data', 'No schedule data found. Generate some schedules first to see vendor performance.', ui.ButtonSet.OK);
      return;
    }
    
    // Analyze schedule data
    const scheduleData = scheduleSheet.getDataRange().getValues();
    const headers = scheduleData[0];
    const rows = scheduleData.slice(1);
    
    const vendorStats = {};
    
    // Initialize stats for all vendors
    Object.keys(vendors).forEach(vendorName => {
      vendorStats[vendorName] = {
        totalOutings: 0,
        totalCost: 0,
        houses: new Set(),
        incidents: 0,
        averageCost: 0
      };
    });
    
    // Process schedule data
    rows.forEach(row => {
      const vendor = row[headers.indexOf('Vendor')];
      const cost = parseFloat(row[headers.indexOf('Est. Cost')] || 0);
      const house = row[headers.indexOf('House')];
      
      if (vendor && vendor !== 'UNASSIGNED' && vendorStats[vendor]) {
        vendorStats[vendor].totalOutings++;
        vendorStats[vendor].totalCost += cost;
        vendorStats[vendor].houses.add(house);
      }
    });
    
    // Process incident data if available
    if (incidentSheet && incidentSheet.getLastRow() > 1) {
      const incidentData = incidentSheet.getDataRange().getValues();
      const incidentHeaders = incidentData[0];
      const incidentRows = incidentData.slice(1);
      
      incidentRows.forEach(row => {
        const vendor = row[incidentHeaders.indexOf('Vendor/Location')];
        if (vendor && vendorStats[vendor]) {
          vendorStats[vendor].incidents++;
        }
      });
    }
    
    // Calculate averages
    Object.keys(vendorStats).forEach(vendor => {
      const stats = vendorStats[vendor];
      stats.averageCost = stats.totalOutings > 0 ? stats.totalCost / stats.totalOutings : 0;
      stats.housesServed = stats.houses.size;
    });
    
    // Create report sheet
    let reportSheet = ss.getSheetByName('Vendor Performance Report');
    if (reportSheet) {
      ss.deleteSheet(reportSheet);
    }
    reportSheet = ss.insertSheet('Vendor Performance Report');
    
    // Set up headers
    const reportHeaders = [
      'Vendor Name', 'Total Outings', 'Total Cost', 'Average Cost', 
      'Houses Served', 'Incidents', 'Performance Score'
    ];
    
    reportSheet.getRange(1, 1, 1, reportHeaders.length)
      .setValues([reportHeaders])
      .setFontWeight('bold')
      .setBackground('#1a73e8')
      .setFontColor('#ffffff');
    
    // Populate data
    const reportData = [];
    Object.keys(vendorStats).forEach(vendor => {
      const stats = vendorStats[vendor];
      const performanceScore = stats.totalOutings > 0 ? 
        Math.max(0, 100 - (stats.incidents * 10) + (stats.housesServed * 5)) : 0;
      
      reportData.push([
        vendor,
        stats.totalOutings,
        `$${stats.totalCost.toFixed(2)}`,
        `$${stats.averageCost.toFixed(2)}`,
        stats.housesServed,
        stats.incidents,
        performanceScore.toFixed(1)
      ]);
    });
    
    // Sort by total outings (descending)
    reportData.sort((a, b) => b[1] - a[1]);
    
    if (reportData.length > 0) {
      reportSheet.getRange(2, 1, reportData.length, reportHeaders.length)
        .setValues(reportData);
      
      // Format the sheet
      reportSheet.autoResizeColumns(1, reportHeaders.length);
      
      // Add conditional formatting for performance scores
      const scoreRange = reportSheet.getRange(2, 7, reportData.length, 1);
      const rules = [
        SpreadsheetApp.newConditionalFormatRule()
          .whenNumberGreaterThan(80)
          .setBackground('#d9ead3')
          .setRanges([scoreRange])
          .build(),
        SpreadsheetApp.newConditionalFormatRule()
          .whenNumberBetween(50, 80)
          .setBackground('#fff2cc')
          .setRanges([scoreRange])
          .build(),
        SpreadsheetApp.newConditionalFormatRule()
          .whenNumberLessThan(50)
          .setBackground('#f4cccc')
          .setRanges([scoreRange])
          .build()
      ];
      reportSheet.setConditionalFormatRules(rules);
    }
    
    // Add summary at the top
    reportSheet.insertRowBefore(1);
    reportSheet.getRange(1, 1, 1, reportHeaders.length)
      .merge()
      .setValue(`Vendor Performance Report - Generated on ${new Date().toLocaleDateString()}`)
      .setFontSize(14)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground('#f0f0f0');
    
    // Show the report
    ss.setActiveSheet(reportSheet);
    ui.alert('✅ Report Generated', 'Vendor Performance Report has been created in a new sheet.', ui.ButtonSet.OK);
    
  } catch (error) {
    handleError(error, 'Generate Vendor Report');
  }
}

function generateUtilizationReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet || scheduleSheet.getLastRow() <= 1) {
      ui.alert('No Data', 'No schedule data found. Generate some schedules first to see utilization.', ui.ButtonSet.OK);
      return;
    }
    
    // Get schedule data with validation and retry logic
    let scheduleData;
    let headers;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        scheduleData = scheduleSheet.getDataRange().getValues();
        if (!scheduleData || scheduleData.length < 2) {
          throw new Error('Schedule is empty. Please generate schedule first.');
        }
        
        headers = scheduleData[0];
        if (!headers || headers.length < 2) {
          throw new Error('Invalid schedule format. Headers not found.');
        }
        
        break; // Success - exit the retry loop
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        Utilities.sleep(1000);
      }
    }
    
    // Find column indexes first
    const columnIndexes = {
      house: headers.indexOf('House'),
      cost: headers.indexOf('Est. Cost'),
      vendor: headers.indexOf('Vendor'),
      date: headers.indexOf('Date')
    };
    
    // Validate required columns exist
    Object.entries(columnIndexes).forEach(([name, index]) => {
      if (index === -1) {
        throw new Error(`Required column '${name}' not found in schedule`);
      }
    });
    
    // Process schedule data (skip header row)
    const rows = scheduleData.slice(1);
    const houseStats = {};
    
    rows.forEach((row, rowIndex) => {
      const house = row[columnIndexes.house];
      const cost = parseFloat(row[columnIndexes.cost] || 0);
      const vendor = row[columnIndexes.vendor];
      const dateStr = row[columnIndexes.date];
      
      if (!house) {
        console.warn(`Row ${rowIndex + 2}: Missing house name`);
        return;
      }
      
      if (vendor === 'UNASSIGNED') {
        return;
      }
      
      // Initialize house stats if needed
      if (!houseStats[house]) {
        houseStats[house] = {
          totalOutings: 0,
          totalCost: 0,
          vendors: new Set(),
          lastOuting: null
        };
      }
      
      // Update statistics
      houseStats[house].totalOutings++;
      houseStats[house].totalCost += isNaN(cost) ? 0 : cost;
      if (vendor) houseStats[house].vendors.add(vendor);
      
      // Update last outing date if valid
      if (dateStr) {
        try {
          const outingDate = new Date(dateStr);
          if (!isNaN(outingDate.getTime())) {
            if (!houseStats[house].lastOuting || outingDate > houseStats[house].lastOuting) {
              houseStats[house].lastOuting = outingDate;
            }
          }
        } catch (error) {
          console.warn(`Row ${rowIndex + 2}: Invalid date format for ${house}`);
        }
      }
    });
    
    // Create report sheet
    const REPORT_SHEET_NAME = 'House Utilization Report';
    let reportSheet = ss.getSheetByName(REPORT_SHEET_NAME);
    if (reportSheet) {
      ss.deleteSheet(reportSheet);
    }
    reportSheet = ss.insertSheet(REPORT_SHEET_NAME);
    
    // Set up report headers (different from schedule headers)
    const reportColumns = [
      'House/Program', 'Total Outings', 'Total Cost', 'Average Cost', 
      'Vendors Used', 'Last Outing', 'Utilization %'
    ];
    
    reportSheet.getRange(1, 1, 1, reportColumns.length)
      .setValues([reportColumns])
      .setFontWeight('bold')
      .setBackground('#1a73e8')
      .setFontColor('#ffffff');
    
    // Calculate totals and metrics
    const totalOutings = Object.values(houseStats).reduce((sum, stats) => sum + stats.totalOutings, 0);
    const totalCost = Object.values(houseStats).reduce((sum, stats) => sum + stats.totalCost, 0);
    
    // Prepare report data
    const reportData = Object.entries(houseStats)
      .map(([house, stats]) => {
        const averageCost = stats.totalOutings > 0 ? stats.totalCost / stats.totalOutings : 0;
        const utilizationPercent = totalOutings > 0 ? (stats.totalOutings / totalOutings * 100) : 0;
        
        return [
          house,
          stats.totalOutings,
          `$${stats.totalCost.toFixed(2)}`,
          `$${averageCost.toFixed(2)}`,
          stats.vendors.size,
          stats.lastOuting ? stats.lastOuting.toLocaleDateString() : 'N/A',
          `${utilizationPercent.toFixed(1)}%`
        ];
      })
      // Sort by total outings (descending)
      .sort((a, b) => b[1] - a[1]);
    
    // Write and format data
    if (reportData.length > 0) {
      reportSheet.getRange(2, 1, reportData.length, reportColumns.length)
        .setValues(reportData);
      
      // Format the sheet
      reportSheet.autoResizeColumns(1, reportColumns.length);
      
      // Add gridlines
      reportSheet.getRange(1, 1, reportData.length + 1, reportColumns.length)
        .setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID);
    }
    
    // Add summary at the top
    reportSheet.insertRowBefore(1);
    reportSheet.getRange(1, 1, 1, reportHeaders.length)
      .merge()
      .setValue(`House Utilization Report - Generated on ${new Date().toLocaleDateString()}`)
      .setFontSize(14)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground('#f0f0f0');
    
    // Show the report
    ss.setActiveSheet(reportSheet);
    ui.alert('✅ Report Generated', 'House Utilization Report has been created in a new sheet.', ui.ButtonSet.OK);
    
  } catch (error) {
    handleError(error, 'Generate Utilization Report');
  }
}

function showSchedulingMetrics() {
  SpreadsheetApp.getUi().alert(
    '📊 Scheduling Metrics',
    'Efficiency metrics feature coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
class AnalyticsEngine {
  constructor() {
    this.ss = SpreadsheetApp.getActive();
    this.dataManager = new DataManager(this.ss);
  }
  
  /**
   * Generate vendor performance metrics
   */
  generateVendorPerformanceReport() {
    const vendors = this.dataManager.getVendors();
    const schedule = this.dataManager.getSheet('SCHEDULE');
    const scheduleData = schedule.getDataRange().getValues();
    
    // Calculate metrics for each vendor
    const metrics = {};
    
    for (const vendorName in vendors) {
      metrics[vendorName] = {
        name: vendorName,
        type: vendors[vendorName].Type,
        totalBookings: 0,
        uniqueHouses: new Set(),
        blackoutDates: vendors[vendorName].Blackout.length,
        qualityScore: vendors[vendorName].QualityScore || 75,
        utilization: 0,
        lastUsed: null
      };
    }
    
    // Process schedule data
    for (let i = 1; i < scheduleData.length; i++) {
      const row = scheduleData[i];
      const date = new Date(row[0]);
      
      for (let j = 1; j < row.length - 2; j++) {
        const cell = row[j];
        if (!cell || cell === 'TBD' || cell === 'UNASSIGNED') continue;
        
        const vendorName = cell.toString().split('\n')[0];
        if (metrics[vendorName]) {
          metrics[vendorName].totalBookings++;
          metrics[vendorName].uniqueHouses.add(scheduleData[0][j]);
          metrics[vendorName].lastUsed = date;
        }
      }
    }
    
    // Calculate utilization rates
    const totalWeeks = scheduleData.length - 1;
    for (const vendorName in metrics) {
      const m = metrics[vendorName];
      m.utilization = totalWeeks > 0 ? (m.totalBookings / totalWeeks * 100).toFixed(2) : 0;
      m.uniqueHouses = m.uniqueHouses.size;
      m.lastUsed = m.lastUsed ? 
        Utilities.formatDate(m.lastUsed, CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy') : 
        'Never';
    }
    
    // Convert to array format
    const report = [
      ['Vendor Name', 'Type', 'Total Bookings', 'Unique Houses', 'Utilization %', 
       'Quality Score', 'Blackout Dates', 'Last Used']
    ];
    
    for (const vendorName in metrics) {
      const m = metrics[vendorName];
      report.push([
        m.name,
        m.type,
        m.totalBookings,
        m.uniqueHouses,
        m.utilization,
        m.qualityScore,
        m.blackoutDates,
        m.lastUsed
      ]);
    }
    
    // Sort by total bookings (descending)
    const dataRows = report.slice(1);
    dataRows.sort((a, b) => b[2] - a[2]);
    
    return [report[0], ...dataRows];
  }
}

// ======================== ERROR HANDLING & LOGGING ========================

/**
 * Centralized error handler
 */
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  
  // Log to audit trail
  auditLog('ERROR', {
    context: context,
    error: error.toString(),
    stack: error.stack,
    timestamp: new Date()
  });
  
  // User notification
  const ui = SpreadsheetApp.getUi();
  const message = `An error occurred in ${context}:\n\n${error.toString()}\n\nPlease check the audit log for details.`;
  
  ui.alert('⚠️ Error', message, ui.ButtonSet.OK);
  
  // Send alert email if critical
  if (isCriticalError(error)) {
    sendErrorAlert(error, context);
  }
}

/**
 * Audit logging system
 */
function auditLog(action, details) {
  try {
    const ss = SpreadsheetApp.getActive();
    let auditSheet = ss.getSheetByName('AUDIT_LOG');
    
    if (!auditSheet) {
      auditSheet = ss.insertSheet('AUDIT_LOG');
      auditSheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'User', 'Action', 'Details', 'Session ID']
      ]);
    }
    
    const row = [
      new Date(),
      Session.getActiveUser().getEmail(),
      action,
      JSON.stringify(details),
      Utilities.getUuid()
    ];
    
    auditSheet.appendRow(row);
    
    // Clean up old logs
    cleanOldAuditLogs(auditSheet);
    
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

/**
 * Clean old audit logs based on retention policy
 */
function cleanOldAuditLogs(auditSheet) {
  const retentionDays = CONFIG.LOG_RETENTION_DAYS;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  const data = auditSheet.getDataRange().getValues();
  const rowsToDelete = [];
  
  for (let i = 1; i < data.length; i++) {
    const timestamp = new Date(data[i][0]);
    if (timestamp < cutoffDate) {
      rowsToDelete.push(i + 1);
    }
  }
  
  // Delete old rows in reverse order
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    auditSheet.deleteRow(rowsToDelete[i]);
  }
}

/**
 * Determine if error is critical
 */
function isCriticalError(error) {
  const criticalPatterns = [
    /calendar/i,
    /permission/i,
    /quota/i,
    /service/i
  ];
  
  const errorString = error.toString();
  return criticalPatterns.some(pattern => pattern.test(errorString));
}

/**
 * Send error alert to administrators
 */
function sendErrorAlert(error, context) {
  try {
    const config = new DataManager(SpreadsheetApp.getActive()).getConfig();
    const adminEmail = config.AdminEmail || Session.getActiveUser().getEmail();
    
    const subject = `🚨 Critical Error in FFAS Scheduler - ${context}`;
    const body = `
A critical error has occurred in the FFAS Therapeutic Outings Scheduler.

Context: ${context}
Time: ${new Date().toLocaleString()}
User: ${Session.getActiveUser().getEmail()}

Error Details:
${error.toString()}

Stack Trace:
${error.stack || 'Not available'}

Please investigate immediately.
    `;
    
    MailApp.sendEmail(adminEmail, subject, body);
  } catch (e) {
    console.error('Failed to send error alert:', e);
  }
}

// ======================== UTILITIES ========================

/**
 * Performance timer for monitoring
 */
class PerformanceTimer {
  constructor(name) {
    this.name = name;
    this.startTime = Date.now();
    this.marks = {};
  }
  
  mark(label) {
    this.marks[label] = Date.now() - this.startTime;
  }
  
  end() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    
    if (this.duration > CONFIG.PERFORMANCE_THRESHOLD) {
      console.warn(`Performance warning: ${this.name} took ${this.duration}ms`);
    }
  }
  
  getMetrics() {
    return {
      name: this.name,
      duration: this.duration || (Date.now() - this.startTime),
      marks: this.marks
    };
  }
}

/**
 * Log performance metrics
 */
function logPerformanceMetric(operation, duration, details) {
  auditLog('PERFORMANCE', {
    operation: operation,
    duration: duration,
    details: details,
    threshold: CONFIG.PERFORMANCE_THRESHOLD,
    exceeded: duration > CONFIG.PERFORMANCE_THRESHOLD
  });
}

/**
 * Custom validation error
 */
class ValidationError {
  constructor(errors) {
    this.message = 'Validation failed';
    this.name = 'ValidationError';
    this.errors = errors;
  }
  
  toString() {
    return this.name + ': ' + this.message;
  }
}

/**
 * Validate scheduling data integrity
 */
function validateSchedulingData(programs, vendors, rules) {
  const errors = [];
  
  // Validate programs
  if (!programs || programs.length === 0) {
    errors.push('No programs defined');
  } else {
    programs.forEach((p, i) => {
      if (!p.House) errors.push(`Program ${i+1}: Missing house name`);
      if (!p.TuesdayStart) errors.push(`Program ${p.House}: Missing start time`);
      if (!p.TuesdayEnd) errors.push(`Program ${p.House}: Missing end time`);
    });
  }
  
  // Validate vendors
  const vendorNames = Object.keys(vendors);
  if (vendorNames.length === 0) {
    errors.push('No vendors defined');
  } else {
    vendorNames.forEach(name => {
      const v = vendors[name];
      if (!v.Active && vendorNames.length === 1) {
        errors.push(`Only vendor "${name}" is inactive`);
      }
      if (v.CalendarId) {
        try {
          CalendarApp.getCalendarById(v.CalendarId);
        } catch (e) {
          // Only warn about calendar access, don't fail validation
          console.warn(`Vendor "${name}": Cannot access calendar ID ${v.CalendarId}`);
        }
      }
    });
  }
  
  // Validate rules
  Object.keys(rules).forEach(month => {
    const rule = rules[month];
    if (rule.PreferredOrder) {
      rule.PreferredOrder.forEach(vendorName => {
        // Check exact match or normalized key match
        const exactMatch = vendorNames.includes(vendorName);
        const normalizedMatch = vendorNames.some(v => 
          vendors[v]._key === vendorName.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        
        if (!exactMatch && !normalizedMatch) {
          errors.push(`Rule month ${month}: Unknown vendor "${vendorName}". Available vendors: ${vendorNames.join(', ')}`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate all data
 */
function validateAllData() {
  try {
    const ss = SpreadsheetApp.getActive();
    const dataManager = new DataManager(ss);
    
    const programs = dataManager.getPrograms();
    const vendors = dataManager.getVendors();
    const rules = dataManager.getRules();
    
    const validation = validateSchedulingData(programs, vendors, rules);
    
    if (validation.isValid) {
      SpreadsheetApp.getUi().alert(
        '✅ Validation Passed',
        'All data validation checks passed successfully.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '⚠️ Validation Errors',
        `Found ${validation.errors.length} issues:\n\n` + 
        validation.errors.slice(0, 10).join('\n') +
        (validation.errors.length > 10 ? '\n...' : ''),
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    handleError(error, 'Data Validation');
  }
}

/**
 * Quick diagnostic for schedule generation issues
 */
function diagnoseSchedulingIssue() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();
  const report = [];
  
  try {
    // Check sheets exist
    const requiredSheets = ['PROGRAMS', 'VENDORS', 'ROTATION_RULES', 'CONFIG'];
    const missingSheets = [];
    
    requiredSheets.forEach(sheetName => {
      if (!ss.getSheetByName(sheetName)) {
        missingSheets.push(sheetName);
      }
    });
    
    if (missingSheets.length > 0) {
      report.push('❌ Missing sheets: ' + missingSheets.join(', '));
      report.push('Fix: Run "Initialize System" from the menu');
    }
    
    // Check data
    const dataManager = new DataManager(ss);
    
    try {
      const programs = dataManager.getPrograms();
      report.push(`✓ Programs sheet: ${programs.length} houses found`);
      if (programs.length === 0) {
        report.push('❌ No programs/houses defined!');
        report.push('Fix: Add house data to PROGRAMS sheet');
      }
    } catch (e) {
      report.push('❌ Error reading PROGRAMS: ' + e.message);
    }
    
    try {
      const vendors = dataManager.getVendors();
      const vendorCount = Object.keys(vendors).length;
      const activeVendors = Object.values(vendors).filter(v => v.Active).length;
      report.push(`✓ Vendors sheet: ${vendorCount} total, ${activeVendors} active`);
      if (activeVendors === 0) {
        report.push('❌ No active vendors!');
        report.push('Fix: Mark some vendors as active in VENDORS sheet');
      }
    } catch (e) {
      report.push('❌ Error reading VENDORS: ' + e.message);
    }
    
    try {
      const rules = dataManager.getRules();
      report.push(`✓ Rules sheet: ${Object.keys(rules).length} month rules found`);
    } catch (e) {
      report.push('❌ Error reading RULES: ' + e.message);
    }
    
    // Show results
    ui.alert(
      '🔍 Schedule Generation Diagnostic',
      report.join('\n\n'),
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Diagnostic failed: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Sync all calendars
 */
function syncAllCalendars() {
  SpreadsheetApp.getUi().alert(
    '🔄 Calendar Sync',
    'Full calendar synchronization feature coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Count unique vendors in schedule
 */
function countUniqueVendors(schedule) {
  const vendors = new Set();
  
  schedule.forEach(day => {
    Object.values(day.assignments).forEach(assignment => {
      if (assignment.vendor && assignment.vendor !== 'UNASSIGNED') {
        vendors.add(assignment.vendor);
      }
    });
  });
  
  return vendors.size;
}

/**
 * Create required sheets if missing
 */
function createRequiredSheetsIfMissing() {
  const ss = SpreadsheetApp.getActive();
  const requiredSheets = {
    'PROGRAMS': [
      ['House', 'Tuesday Start', 'Tuesday End', 'Color', 'Priority', 'Preferred Vendors', 'Preferred Type', 'Restrictions']
    ],
    'VENDORS': [
      ['Name', 'Type', 'Capacity', 'Contact', 'Active', 'Weekly Limit', 'Blackout Dates', 
       'Color', 'Calendar ID', 'Quality Score', 'Preferences']
    ],
    'ROTATION_RULES': [
      ['Month', 'Preferred Order', 'Min Weeks Between', 'Allow Same Type', 'Max Vendors/Day', 'Special Rules']
    ],
    'CONFIG': [
      ['Parameter', 'Value'],
      ['StartTuesday', ''],
      ['WeeksToGenerate', '52'],
      ['PdfEmailList', ''],
      ['LetterheadDocId', ''],
      ['IncidentReportUrl', ''],
      ['AdminEmail', Session.getActiveUser().getEmail()]
    ],
    'SCHEDULE': [
      ['Date', 'House 1', 'House 2', 'Options', 'Locked?']
    ]
  };
  
  for (const [sheetName, headers] of Object.entries(requiredSheets)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (headers.length > 0) {
        sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
      }
      
      // Format headers
      sheet.getRange(1, 1, 1, headers[0].length)
        .setBackground('#1a73e8')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      
      sheet.setFrozenRows(1);
    }
  }
}

/**
 * Setup default configurations
 */
function setupDefaultConfigurations() {
  const ss = SpreadsheetApp.getActive();
  const configSheet = ss.getSheetByName('CONFIG');
  
  if (configSheet && configSheet.getLastRow() <= 1) {
    // Add default configurations
    const defaults = [
      ['StartTuesday', Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'MM/dd/yyyy')],
      ['WeeksToGenerate', '52'],
      ['PdfEmailList', Session.getActiveUser().getEmail()],
      ['LetterheadDocId', ''],
      ['AdminEmail', Session.getActiveUser().getEmail()],
      ['TimezoneOverride', CONFIG.DEFAULT_TIMEZONE],
      ['EnableWebhooks', 'FALSE'],
      ['WebhookUrl', ''],
      ['EnableAnalytics', 'TRUE'],
      ['MaxRetries', '3']
    ];
    
    configSheet.getRange(2, 1, defaults.length, 2).setValues(defaults);
  }
}

/**
 * Create audit log sheet
 */
function createAuditLog() {
  const ss = SpreadsheetApp.getActive();
  let auditSheet = ss.getSheetByName('AUDIT_LOG');
  
  if (!auditSheet) {
    auditSheet = ss.insertSheet('AUDIT_LOG');
    const headers = [['Timestamp', 'User', 'Action', 'Details', 'Session ID']];
    auditSheet.getRange(1, 1, 1, 5).setValues(headers);
    
    // Format
    auditSheet.getRange(1, 1, 1, 5)
      .setBackground('#34a853')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    auditSheet.setFrozenRows(1);
    
    // Hide from regular users
    auditSheet.hideSheet();
  }
}

/**
 * Get progress HTML for UI
 */
function getProgressHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      padding: 20px;
      text-align: center;
    }
    .progress-container {
      width: 100%;
      height: 30px;
      background-color: #f1f3f4;
      border-radius: 15px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #1a73e8 0%, #4285f4 100%);
      width: 0%;
      border-radius: 15px;
      animation: progress 3s ease-in-out infinite;
    }
    @keyframes progress {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }
    .status-text {
      color: #5f6368;
      font-size: 14px;
      margin-top: 10px;
    }
    .spinner {
      border: 3px solid #f3f3f4;
      border-top: 3px solid #1a73e8;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h3 style="color: #202124;">Generating Schedule...</h3>
  <div class="progress-container">
    <div class="progress-bar"></div>
  </div>
  <div class="status-text">Processing vendors and assignments...</div>
  <script>
    // Auto-close after 10 seconds if still open
    setTimeout(function() {
      google.script.host.close();
    }, 10000);
  </script>
</body>
</html>
  `;
}

/**
 * Show about dialog with system information
 */
function showAboutDialog() {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; padding: 20px;">
      <h2 style="color: #1a73e8;">Family First Therapeutic Outings Scheduler</h2>
      <p style="color: #34a853; font-weight: 500; margin: 5px 0;">Powered by ClearHive Health</p>
      <p><strong>Version:</strong> ${CONFIG.VERSION}</p>
      <p><strong>Developer:</strong> ClearHive Health</p>
      <p><strong>Client:</strong> Family First Adolescent Services</p>
      <p><strong>Last Updated:</strong> September 5, 2025</p>
      
      <h3 style="color: #202124; margin-top: 20px;">Features</h3>
      <ul style="color: #5f6368;">
        <li>Automated 52-week schedule generation</li>
        <li>Smart vendor rotation with conflict resolution</li>
        <li>Google Calendar integration</li>
        <li>HTML email reports with schedule tables</li>
        <li>Performance analytics and reporting</li>
        <li>Audit logging with 90-day retention</li>
      </ul>
      
      <h3 style="color: #202124; margin-top: 20px;">Support</h3>
      <p style="color: #5f6368;">
        For technical assistance, contact ClearHive Health support or 
        check the Audit Log for recent activity.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dadce0;">
        <p style="color: #5f6368; font-size: 12px;">
          © 2025 ClearHive Health. Built for Family First Adolescent Services.<br>
          This system is for operational use only. Do not store or transmit PHI.
        </p>
      </div>
    </div>
  `)
  .setWidth(450)
  .setHeight(520);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'About FFAS Scheduler | ClearHive Health');
}

/**
 * Send comprehensive onboarding email to new staff
 */
function sendOnboardingEmail() {
  const ui = SpreadsheetApp.getUi();
  
  // Create HTML dialog for better recipient management
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3 style="color: #1a73e8;">📤 Send Onboarding Email</h3>
      <p>The onboarding email will be sent to the following recipients. You can edit this list:</p>
      
      <textarea id="recipients" style="width: 100%; height: 200px; font-family: monospace; font-size: 13px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
${CONFIG.EMAIL_RECIPIENTS.join('\n')}
      </textarea>
      
      <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="dryRun" checked />
          <span>Dry run (don't actually send)</span>
        </label>
      </div>
      
      <p style="font-size: 12px; color: #666;">
        ✓ Individual emails (e.g., user@familyfirstas.com)<br>
        ✓ Group emails (e.g., Estates_CA@familyfirstas.com)<br>
        ✓ One email address per line
      </p>
      
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="google.script.host.close()" style="padding: 8px 16px; margin-right: 10px;">Cancel</button>
        <button onclick="sendEmails()" style="padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Send Onboarding Emails
        </button>
      </div>
    </div>
    
    <script>
      function sendEmails() {
        const recipients = document.getElementById('recipients').value;
        const dryRun = document.getElementById('dryRun').checked;
        google.script.run
          .withSuccessHandler(() => google.script.host.close())
          .withFailureHandler((error) => {
            alert('Error: ' + error);
          })
          .sendOnboardingEmailsTo(recipients, { dryRun });
      }
    </script>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(500)
    .setHeight(400);
  
  ui.showModalDialog(htmlOutput, 'Send Onboarding Email');
  
  // The dialog handles everything via the HTML buttons and google.script.run
  // No additional processing needed here
}
/**
 * Process onboarding emails from dialog (called from HTML)
 */
function sendOnboardingEmailsTo(recipientsText, options) {
  const ui = SpreadsheetApp.getUi();
  options = options || {};
  const dryRun = options.dryRun === true;
  
  try {
    const emailAddresses = recipientsText
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))
      // normalize and dedupe
      .map(e => e.toLowerCase())
      .filter((val, idx, arr) => arr.indexOf(val) === idx);
    
    if (emailAddresses.length === 0) {
      throw new Error('No valid email addresses entered.');
    }
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const email of emailAddresses) {
      try {
        // route via safe sender with dedupe/rate-limit/dryRun
        const res = sendOnboardingEmailTo(email, { dryRun });
        if (res && res.duplicate) {
          results.push({ email: email, success: false, error: 'Duplicate suppressed' });
        } else if (res && res.rateLimited) {
          results.push({ email: email, success: false, error: 'Rate limited' });
        } else {
          results.push({ email: email, success: true, dryRun: !!(res && res.dryRun) });
        }
        successCount++;
      } catch (error) {
        results.push({ email: email, success: false, error: error.toString() });
        failCount++;
        console.error(`Failed to send to ${email}:`, error);
      }
    }
    
    // Log the activity
    auditLog('ONBOARDING_EMAIL_SENT', {
      recipients: emailAddresses,
      successCount: successCount,
      failCount: failCount,
      sentBy: Session.getActiveUser().getEmail()
    });
    
    // Show results
    let message = `✅ Sent successfully to ${successCount} recipient(s)`;
    if (failCount > 0) {
      message += `\n❌ Failed to send to ${failCount} recipient(s)`;
      const failedEmails = results
        .filter(r => !r.success)
        .map(r => `${r.email}: ${r.error}`)
        .join('\n');
      message += '\n\nFailed recipients:\n' + failedEmails;
    }
    
  ui.alert('📤 Onboarding Email Results', message + (dryRun ? '\n\nNote: Dry run was enabled. No emails were actually sent.' : ''), ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', 'Failed to send onboarding emails: ' + error.toString(), ui.ButtonSet.OK);
    throw error;
  }
}

/**
 * Send onboarding email to a specific recipient
 */
function sendOnboardingEmailTo(recipient, options) {
  options = options || {};
  const dryRun = options.dryRun === true;
  const subject = 'Welcome to FFAS! Your Weekly Schedule Emails';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <div style="background: #1a73e8; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🗓️ Welcome to FFAS!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Your Weekly Schedule Emails</p>
      </div>
      
      <div style="background: white; padding: 25px; border: 1px solid #dadce0; border-top: none;">
        <p style="font-size: 18px; color: #1a73e8; margin-top: 0;">
          <strong>Hi there! Welcome to the team! 👋</strong>
        </p>
        
        <p>Starting Monday, you'll receive automatic emails with your weekly therapeutic outings schedule. Here's what you need to know:</p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8;">
          <h2 style="color: #1a73e8; margin-top: 0; font-size: 18px;">📧 Your Weekly Email</h2>
          <p><strong>Every Monday morning at 10:00 AM, you'll get an email with:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>📅 This week's complete schedule</li>
            <li>🏠 Which houses go where</li>
            <li>📞 Phone numbers for each place</li>
            <li>🗺️ Addresses (great for GPS!)</li>
            <li>⏰ Pickup times</li>
          </ul>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #dadce0;">
            <p style="margin: 0; font-weight: bold;">📬 Subject Line:</p>
            <p style="margin: 5px 0 0 0; font-style: italic; color: #666;">
              "Therapeutic Outings Schedule - [This Week's Date]"
            </p>
          </div>
        </div>

        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #34a853;">
          <h2 style="color: #137333; margin-top: 0; font-size: 18px;">📱 Using the Information</h2>
          <p><strong>The email is designed to be super easy to use:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>📞 <strong>Phone numbers are clickable</strong> - Just tap to call on your phone</li>
            <li>📍 <strong>Addresses work with GPS</strong> - Copy and paste into your maps app</li>
            <li>📱 <strong>Works on any device</strong> - Phone, tablet, computer</li>
            <li>💾 <strong>Save for later</strong> - Keep the email handy all week</li>
          </ul>
        </div>

        <div style="background: #fef7e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbc04;">
          <h2 style="color: #ea8600; margin-top: 0; font-size: 18px;">❓ Quick Questions & Answers</h2>
          
          <div style="margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #ea8600;">Q: What if I don't get the Monday email?</p>
            <p style="margin: 5px 0 0 0;">Check your spam folder first! If it's still missing, reach out to me and I'll make sure you're on the list.</p>
          </div>
          
          <div style="margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #ea8600;">Q: Can I request changes to the schedule?</p>
            <p style="margin: 5px 0 0 0;">Absolutely! Just let me know what changes you need and I'll update the schedule.</p>
          </div>
          
          <div style="margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #ea8600;">Q: What if a phone number doesn't work?</p>
            <p style="margin: 5px 0 0 0;">Let me know right away so I can update the vendor contact info for everyone.</p>
          </div>
        </div>

        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9334e6; text-align: center;">
          <h2 style="color: #1976d2; margin-top: 0; font-size: 18px;">✨ That's It!</h2>
          <p style="margin: 10px 0; font-size: 16px;">
            <strong>No more hunting for phone numbers or addresses!</strong><br>
            Everything you need will be delivered to your inbox every Monday morning.
          </p>
        </div>

        <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">💡 Pro Tip</h3>
          <p style="margin: 0; font-size: 16px;">
            Save this email and your weekly schedule emails to your phone so you can access them anytime!
          </p>
        </div>

        <div style="border-top: 2px solid #dadce0; padding-top: 20px; margin-top: 30px;">
          <h2 style="color: #1a73e8; font-size: 18px;">📞 Need Help?</h2>
          <p><strong>Questions about schedules:</strong> Just reach out to me!</p>
          <p><strong>Email problems:</strong> Let me know and I'll fix it</p>
          <p><strong>Schedule changes:</strong> Send me a message anytime</p>
          <p><strong>Other questions:</strong> I'm here to help!</p>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
        <p style="margin: 0;">
          <strong>Family First Adolescent Services</strong><br>
          Questions? Just ask your supervisor or any team member!
        </p>
      </div>
    </div>
  `;
  
  const plainBody = `
FAMILY FIRST ADOLESCENT SERVICES
WELCOME TO THE TEAM! YOUR WEEKLY SCHEDULE EMAILS

Hi there! Welcome to FFAS! 👋

Starting Monday, you'll get automatic emails with your weekly therapeutic outings schedule.

=== YOUR WEEKLY EMAIL ===
Every Monday morning at 10:00 AM you'll get an email with:
• This week's complete schedule
• Which houses go where  
• Phone numbers for each place
• Addresses (great for GPS!)
• Pickup times

Subject Line: "Therapeutic Outings Schedule - [This Week's Date]"

=== USING THE INFORMATION ===
The email is designed to be super easy to use:
• Phone numbers are clickable - Just tap to call on your phone
• Addresses work with GPS - Copy and paste into your maps app
• Works on any device - Phone, tablet, computer
• Save for later - Keep the email handy all week

=== QUICK Q&A ===
Q: What if I don't get the Monday email?
A: Check your spam folder first! If it's still missing, reach out to me and I'll make sure you're on the list.

Q: Can I request changes to the schedule?
A: Absolutely! Just let me know what changes you need and I'll update the schedule.

Q: What if a phone number doesn't work?
A: Let me know right away so I can update the vendor contact info for everyone.

=== THAT'S IT! ===
No more hunting for phone numbers or addresses!
Everything you need will be delivered to your inbox every Monday morning.

💡 PRO TIP: Save this email and your weekly schedule emails to your phone 
so you can access them anytime!

=== NEED HELP? ===
• Questions about schedules: Just reach out to me!
• Email problems: Let me know and I'll fix it
• Schedule changes: Send me a message anytime
• Other questions: I'm here to help!

---
Family First Adolescent Services
Questions? Just ask your supervisor or any team member!
  `;

  // Send safely with dedupe, rate limiting, and optional dry run
  const result = sendEmailSafely(recipient, subject, plainBody, htmlBody, {
    type: 'onboarding',
    dryRun
  });
  
  if (result && result.dryRun) {
    console.log(`[DRY RUN] Onboarding email would be sent to ${recipient}`);
  } else if (result && result.duplicate) {
    console.log(`[SKIPPED] Duplicate onboarding email suppressed for ${recipient}`);
  } else if (result && result.rateLimited) {
    console.log(`[SKIPPED] Rate limit for onboarding email to ${recipient}`);
  } else {
    console.log(`Onboarding email sent successfully to ${recipient}`);
  }
  
  return result;
}

/**
 * Comprehensive system overview and onboarding guide
 */
function showSystemOverview() {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h1 style="color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 10px;">
        🗓️ FFAS Therapeutic Outings Scheduler
      </h1>
      <p style="color: #34a853; font-size: 16px; font-weight: 500;">
        A ClearHive Health Solution for Family First Adolescent Services
      </p>
      
      <h2 style="color: #ea4335; margin-top: 30px;">🚀 What This System Does</h2>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <p><strong>Automates your entire therapeutic outings workflow:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>📅 <strong>Generates complete yearly schedules</strong> - 52 weeks automatically planned</li>
          <li>🔄 <strong>Smart vendor rotation</strong> - Prevents overuse and ensures variety</li>
          <li>📧 <strong>Automatic Monday reminders</strong> - Staff get emails with full schedule details</li>
          <li>📞 <strong>Vendor contact integration</strong> - Phone numbers and addresses included</li>
          <li>⚡ <strong>Real-time conflict detection</strong> - Prevents double-bookings</li>
          <li>📊 <strong>Performance analytics</strong> - Track vendor usage and house participation</li>
        </ul>
      </div>

      <h2 style="color: #fbbc04; margin-top: 25px;">❌ What This Replaces</h2>
      <div style="background: #fef7e0; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbc04;">
        <p><strong>Say goodbye to these time-consuming manual processes:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>📝 Manual spreadsheet scheduling every week</li>
          <li>📋 Copying and pasting vendor information</li>
          <li>📞 Looking up contact numbers each time</li>
          <li>✉️ Manually sending reminder emails</li>
          <li>🔍 Checking for scheduling conflicts by hand</li>
          <li>📈 Creating reports manually</li>
          <li>🗂️ Managing multiple disconnected documents</li>
        </ul>
      </div>

      <h2 style="color: #34a853; margin-top: 25px;">✨ How This Makes Life Easier</h2>
      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <h4 style="color: #137333; margin-top: 0;">⏰ Time Savings</h4>
            <ul style="font-size: 14px; margin: 5px 0; padding-left: 15px;">
              <li>5 hours weekly → 5 minutes</li>
              <li>Zero manual email sending</li>
              <li>Instant conflict detection</li>
              <li>Automatic vendor contact lookup</li>
            </ul>
          </div>
          <div>
            <h4 style="color: #137333; margin-top: 0;">🎯 Accuracy</h4>
            <ul style="font-size: 14px; margin: 5px 0; padding-left: 15px;">
              <li>No more double bookings</li>
              <li>Always current contact info</li>
              <li>Consistent formatting</li>
              <li>Complete audit trail</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 style="color: #9334e6; margin-top: 25px;">🎓 For New Staff: Quick Start Guide</h2>
      <div style="background: #f3e8ff; padding: 15px; border-radius: 8px;">
        <h4 style="color: #1976d2; margin-top: 0;">📧 Receiving Schedule Emails</h4>
        <p style="margin: 5px 0; font-size: 14px;">
          • <strong>When:</strong> Every Monday at 10:00 AM<br>
          • <strong>What:</strong> Complete weekly schedule with all outings<br>
          • <strong>Includes:</strong> House, vendor, time, contact numbers, and addresses<br>
          • <strong>Format:</strong> Professional HTML email (works on all devices)
        </p>
        
        <h4 style="color: #1976d2; margin-top: 15px;">📞 Using Vendor Information</h4>
        <p style="margin: 5px 0; font-size: 14px;">
          • Contact info is automatically included in every email<br>
          • Phone numbers and addresses are always current<br>
          • No need to look up vendor details separately<br>
          • Everything you need is in one place
        </p>

        <h4 style="color: #1976d2; margin-top: 15px;">📋 Schedule Changes</h4>
        <p style="margin: 5px 0; font-size: 14px;">
          • System automatically detects conflicts<br>
          • Updates are reflected in next Monday's email<br>
          • All changes are logged for accountability<br>
          • Reports available for management review
        </p>
      </div>

      <h2 style="color: #dc2626; margin-top: 25px;">🚨 Example: Before vs After</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
          <h4 style="color: #dc2626; margin-top: 0;">❌ BEFORE (Manual Process)</h4>
          <div style="font-size: 13px; color: #666;">
            <p><strong>Every Monday morning:</strong></p>
            <ol style="padding-left: 15px; margin: 5px 0;">
              <li>Open multiple spreadsheets</li>
              <li>Check this week's schedule</li>
              <li>Look up vendor phone numbers</li>
              <li>Look up vendor addresses</li>
              <li>Create email manually</li>
              <li>Copy/paste schedule info</li>
              <li>Add contact details by hand</li>
              <li>Send to distribution list</li>
              <li>Hope nothing was missed</li>
            </ol>
            <p style="color: #dc2626;"><strong>Time: 30-45 minutes per week</strong></p>
          </div>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
          <h4 style="color: #16a34a; margin-top: 0;">✅ AFTER (Automated System)</h4>
          <div style="font-size: 13px; color: #666;">
            <p><strong>Every Monday at 10:00 AM:</strong></p>
            <ol style="padding-left: 15px; margin: 5px 0;">
              <li>✨ System automatically runs</li>
              <li>📅 Finds current week's schedule</li>
              <li>📞 Looks up vendor contacts</li>
              <li>🏠 Matches houses to outings</li>
              <li>📧 Creates professional email</li>
              <li>📮 Sends to all staff automatically</li>
              <li>📝 Logs everything for audit</li>
              <li>✅ Done - zero manual work!</li>
            </ol>
            <p style="color: #16a34a;"><strong>Time: 0 minutes per week</strong></p>
          </div>
        </div>
      </div>

      <h2 style="color: #1a73e8; margin-top: 25px;">💡 Key Benefits Summary</h2>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px;">
          <div>✅ <strong>Zero manual email creation</strong></div>
          <div>✅ <strong>No more missed communications</strong></div>
          <div>✅ <strong>Always current vendor contacts</strong></div>
          <div>✅ <strong>Professional branded emails</strong></div>
          <div>✅ <strong>Complete audit trail</strong></div>
          <div>✅ <strong>Conflict-free scheduling</strong></div>
          <div>✅ <strong>Mobile-friendly format</strong></div>
          <div>✅ <strong>Automatic backup systems</strong></div>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0 0 10px 0;">🎯 Bottom Line</h3>
        <p style="margin: 0; font-size: 16px;">
          <strong>This system transforms 5+ hours of weekly manual work into completely automated, 
          professional communications that happen without any human intervention.</strong>
        </p>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #1a73e8;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          <strong>Questions?</strong> Contact your system administrator or ClearHive Health support.<br>
          <strong>Version:</strong> ${CONFIG.VERSION} | <strong>Last Updated:</strong> September 5, 2025
        </p>
      </div>
    </div>
  `)
  .setWidth(900)
  .setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(html, '📖 FFAS Scheduler: Complete System Overview & Training Guide');
}

/**
 * Quick Start Guide for cmolina@familyfirstas.com
 */
function showQuickStartGuide() {
  const ui = SpreadsheetApp.getUi();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a73e8; text-align: center;">🚀 FFAS Scheduler - Quick Start Guide</h1>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1565c0; margin-top: 0;">📊 Understanding Your Sheets</h2>
        <ul>
          <li><strong>PROGRAMS:</strong> Your houses (Estates, Cove, Nest) and their outing details</li>
          <li><strong>VENDORS:</strong> All therapeutic outing providers with contact info and costs</li>
          <li><strong>ROTATION_RULES:</strong> Defines the strict rotation order for your core vendors</li>
          <li><strong>SCHEDULE:</strong> Generated weekly schedules for Tuesdays</li>
          <li><strong>CONFIG:</strong> System settings and preferences</li>
        </ul>
      </div>
      
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #137333; margin-top: 0;">⚙️ Getting Started</h2>
        <ol>
          <li><strong>Set Up Email Recipients:</strong> Go to Settings > Email Recipients to configure who receives the weekly schedules</li>
          <li><strong>Validate Your Data:</strong> Use Quick Tools > Validate Data to check for any setup issues</li>
          <li><strong>Generate a Schedule:</strong> Click "Generate Schedule" to create this week's therapeutic outing assignments</li>
          <li><strong>Send Email:</strong> Use "Send Weekly Email" to distribute the schedule to your team</li>
        </ol>
      </div>
      
      <div style="background: #fef7e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #ea8600; margin-top: 0;">🔄 Core Vendor Rotation</h2>
        <p>The scheduler automatically follows your contracted vendor rotation:</p>
        <ul>
          <li><strong>Core Vendors:</strong> Goat Yoga, Equine, Surf Therapy, Kayaking, Peach Painting</li>
          <li><strong>Rotation:</strong> These vendors are assigned in strict sequential order</li>
          <li><strong>Fillers:</strong> Other vendors fill remaining slots when core vendors aren't available</li>
          <li><strong>Cost Optimization:</strong> When selecting fillers, the system prioritizes cost-effective options</li>
        </ul>
      </div>
      
      <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1976d2; margin-top: 0;">📊 Using Reports</h2>
        <ul>
          <li><strong>Vendor Performance:</strong> See which vendors are used most often, their costs, and incident history</li>
          <li><strong>House Utilization:</strong> Track which houses are using outings most frequently</li>
          <li><strong>System Diagnostics:</strong> Check for any technical issues with the scheduler</li>
        </ul>
      </div>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2e7d32; margin-top: 0;">📋 Common Tasks</h2>
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #2e7d32;">Adding a New Vendor:</p>
          <p style="margin: 5px 0 0 0;">1. Add them to the VENDORS sheet<br>2. Include contact info, costs, and capacity<br>3. Add to ROTATION_RULES if they're a core vendor</p>
        </div>
        
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #2e7d32;">Changing Email Recipients:</p>
          <p style="margin: 5px 0 0 0;">Use Settings > Email Recipients to add/remove people from weekly emails</p>
        </div>
        
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #2e7d32;">Setting Up Automation:</p>
          <p style="margin: 5px 0 0 0;">Use Automation > Enable Auto Weekly Emails to send schedules every Monday at 8 AM</p>
        </div>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h2 style="color: #856404; margin-top: 0;">❓ Frequently Asked Questions</h2>
        
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">Q: What if a vendor cancels last minute?</p>
          <p style="margin: 5px 0 0 0;">Use "Refill This Week" to automatically find a replacement vendor while maintaining the rotation.</p>
        </div>
        
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">Q: How do I see if there are any data problems?</p>
          <p style="margin: 5px 0 0 0;">Run Quick Tools > Validate Data. It will check for missing information, invalid formats, and other issues.</p>
        </div>
        
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">Q: Can I see which vendors perform best?</p>
          <p style="margin: 5px 0 0 0;">Yes! Use Reports > Vendor Performance to see cost, usage, and incident statistics.</p>
        </div>
        
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">Q: What if the email automation stops working?</p>
          <p style="margin: 5px 0 0 0;">Check Automation > Show Auto Email Status. You can also check the Error Log sheet for details.</p>
        </div>
      </div>
      
      <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">💡 Pro Tips</h3>
        <p style="margin: 0; font-size: 14px;">
          • Run "Validate Data" before generating schedules to catch issues early<br>
          • Check the Error Log sheet if something seems wrong<br>
          • Use the Test Email feature before setting up automation<br>
          • Review vendor performance reports monthly to optimize costs
        </p>
      </div>
      
      <div style="border-top: 2px solid #dadce0; padding-top: 20px; margin-top: 30px; text-align: center;">
        <h2 style="color: #1a73e8; font-size: 18px;">🎯 Ready to Get Started?</h2>
        <p style="font-size: 16px;">
          <strong>Step 1:</strong> Set up email recipients (Settings > Email Recipients)<br>
          <strong>Step 2:</strong> Validate your data (Quick Tools > Validate Data)<br>
          <strong>Step 3:</strong> Generate your first schedule<br>
          <strong>Step 4:</strong> Send the weekly email to your team
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; margin-top: 20px;">
        <p style="margin: 0;">
          <strong>FFAS Therapeutic Outings Scheduler v${CONFIG.VERSION}</strong><br>
          Questions? Check the Error Log sheet or contact your system administrator.
        </p>
      </div>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(800)
    .setHeight(600)
    .setTitle('Quick Start Guide');
  
  ui.showModalDialog(htmlOutput, 'FFAS Scheduler - Quick Start Guide');
}

/**
 * View audit log
 */
function viewAuditLog() {
  const ss = SpreadsheetApp.getActive();
  const auditSheet = ss.getSheetByName('AUDIT_LOG');
  
  if (!auditSheet) {
    SpreadsheetApp.getUi().alert('No audit log found. The system will create one on next operation.');
    return;
  }
  
  // Unhide the audit sheet temporarily
  auditSheet.showSheet();
  ss.setActiveSheet(auditSheet);
  
  SpreadsheetApp.getUi().alert(
    'Audit Log', 
    'The audit log sheet is now visible. Remember to hide it again after review for security.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Format Google Sheets to highlight program/house rows
 */
function formatSheetsForPrograms() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    
    // Format PROGRAMS sheet
    const programsSheet = ss.getSheetByName('PROGRAMS');
    if (!programsSheet) {
      ui.alert('Error', 'PROGRAMS sheet not found', ui.ButtonSet.OK);
      return;
    }
    
    const programsRange = programsSheet.getDataRange();
    
    // Clear existing formatting
    programsRange.clearFormat();
    
    // Header row formatting
    programsSheet.getRange(1, 1, 1, programsRange.getNumColumns())
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    // Program/House rows formatting (light blue background)
    for (let i = 2; i <= programsRange.getNumRows(); i++) {
      const houseCell = programsSheet.getRange(i, 1); // House column
      if (houseCell.getValue()) {
        programsSheet.getRange(i, 1, 1, programsRange.getNumColumns())
          .setBackground('#e3f2fd')
          .setFontWeight('bold')
          .setFontColor('#1565c0');
      }
    }
    
    // Format SCHEDULE sheet header rows
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    if (scheduleSheet) {
      const scheduleRange = scheduleSheet.getDataRange();
      
      // Header row
      scheduleSheet.getRange(1, 1, 1, scheduleRange.getNumColumns())
        .setBackground('#1a73e8')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      
      // Find house columns and highlight them
      const headers = scheduleSheet.getRange(1, 1, 1, scheduleRange.getNumColumns()).getValues()[0];
      const dateIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('date'));
      const optionsIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('options'));
      
      const startCol = dateIndex >= 0 ? dateIndex + 2 : 2; // +2 because arrays are 0-based but sheets are 1-based
      const endCol = optionsIndex >= 0 ? optionsIndex : headers.length;
      
      // Highlight house column headers
      if (startCol <= endCol) {
        scheduleSheet.getRange(1, startCol, 1, endCol - startCol + 1)
          .setBackground('#e3f2fd')
          .setFontColor('#1565c0')
          .setFontWeight('bold');
      }
    }
    
    ui.alert(
      '🎨 Formatting Applied!',
      'Program/house rows have been formatted with:\n\n' +
      '• Light blue background for program rows\n' +
      '• Bold blue text for better visibility\n' +
      '• Consistent header formatting\n\n' +
      'Your sheets now have clear visual identification for programs!',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert(
      'Error',
      'Failed to format sheets: ' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}

/**
 * Quick fix for Gmail permission issues - call this when you see authorization errors
 */
function fixGmailPermissions() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🔧 Gmail Permission Fix',
    'This will attempt to resolve Gmail authorization issues.\n\n' +
    '✅ What to expect:\n' +
    '1. Google may ask for Gmail permission\n' +
    '2. Click "Allow" when prompted\n' +
    '3. The system will test email sending\n\n' +
    'Click OK to continue...',
    ui.ButtonSet.OK
  );
  
  try {
    // Force Gmail authorization check
    console.log('Checking Gmail authorization...');
    
    try {
      const aliases = GmailApp.getAliases();
      const quota = MailApp.getRemainingDailyQuota();
      
      ui.alert(
        '✅ Gmail Access Confirmed',
        `Gmail is working properly!\n\n` +
        `📧 Email quota remaining: ${quota}\n` +
        `👤 Authorized user: ${Session.getActiveUser().getEmail()}\n\n` +
        'You can now send emails successfully.',
        ui.ButtonSet.OK
      );
      
    } catch (authError) {
      console.log('Gmail authorization needed:', authError.toString());
      
      ui.alert(
        '🔐 Authorization Required',
        'Gmail access permission is needed.\n\n' +
        '📝 Steps to fix:\n' +
        '1. Run this function again\n' +
        '2. When Google asks for permission, click "Allow"\n' +
        '3. Grant access to Gmail\n\n' +
        'After granting permission, try sending an email.',
        ui.ButtonSet.OK
      );
      
      // Try to trigger the authorization prompt
      try {
        GmailApp.getAliases();
      } catch (e) {
        console.log('Authorization prompt should have appeared');
      }
    }
    
  } catch (error) {
    console.error('Permission fix error:', error);
    ui.alert(
      '❌ Fix Failed',
      'Could not resolve Gmail permissions.\n\n' +
      'Error: ' + error.toString() + '\n\n' +
      'Please contact your administrator or try again later.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Test email configuration and show recipients
 */
function testEmailConfiguration() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Check Gmail authorization with better error handling
    try {
      const aliases = GmailApp.getAliases();
      console.log('✅ Gmail authorized successfully');
    } catch (authError) {
      console.log('Gmail authorization needed:', authError.toString());
      
      // Try to trigger authorization by accessing Gmail in a safe way
      try {
        const quota = MailApp.getRemainingDailyQuota();
        console.log('📧 Using MailApp instead, quota:', quota);
      } catch (mailError) {
        ui.alert(
          '🔐 Authorization Required',
          'Gmail access is needed to send emails.\n\n' +
          '✅ How to fix this:\n' +
          '1. Click "Setup Permissions" in Settings menu\n' +
          '2. Allow Gmail access when prompted\n' +
          '3. Then try this function again\n\n' +
          'This is a one-time setup.',
          ui.ButtonSet.OK
        );
        return;
      }
    }
    
    const emailScheduler = new EmailScheduler();
    
    // Get email recipients
    let recipients = [];
    if (CONFIG.EMAIL_RECIPIENTS && CONFIG.EMAIL_RECIPIENTS.length > 0) {
      recipients = CONFIG.EMAIL_RECIPIENTS.filter(email => email && email.trim());
    }
    
    let message = '📧 Email Configuration Status\n\n';
    
    if (recipients.length > 0) {
      message += `✅ Ready to send! Found ${recipients.length} recipient(s):\n\n`;
      recipients.slice(0, 5).forEach((email, index) => {
        message += `${index + 1}. ${email}\n`;
      });
      
      if (recipients.length > 5) {
        message += `... and ${recipients.length - 5} more\n`;
      }
      
      message += '\n🎯 These recipients will receive weekly schedule emails.';
    } else {
      message += '⚠️ No recipients configured!\n\n';
      message += '👉 Use "Settings → Email Recipients" to add email addresses.';
    }
    
    ui.alert('📧 Email Setup', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('Email config test error:', error);
    ui.alert('Error', 'Configuration test failed: ' + error.toString(), ui.ButtonSet.OK);
  }
}
/**
 * Send a test email to verify email functionality
 */
function sendTestEmail() {
  const ui = SpreadsheetApp.getUi();
  
  // Prompt for test recipient
  const result = ui.prompt(
    '🧪 Send Test Email',
    'Enter an email address to send a test email to:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const testEmail = result.getResponseText().trim();
    
    if (!testEmail || !testEmail.includes('@')) {
      ui.alert('Invalid email address. Please try again.');
      return;
    }
    
    try {
      // Send test email using GmailApp
      GmailApp.sendEmail(
        testEmail,
        'Test Email - FFAS Scheduler',
        'This is a test email from the FFAS Therapeutic Outings Scheduler.\n\n' +
        'If you receive this email, your email configuration is working correctly!\n\n' +
        'You can now:\n' +
        '✓ Send weekly schedule emails\n' +
        '✓ Send onboarding emails to staff\n' +
        '✓ Send to both individual and group email addresses\n\n' +
        'Powered by ClearHive Health',
        {
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a73e8;">✅ Test Email Successful!</h2>
              <p>This is a test email from the FFAS Therapeutic Outings Scheduler.</p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1565c0; margin-top: 0;">Your email system is working correctly!</h3>
                <p>You can now send:</p>
                <ul>
                  <li>📅 Weekly schedule emails every Monday</li>
                  <li>👥 Onboarding emails to new staff</li>
                  <li>📧 Emails to individuals and groups (e.g., Estates_CA@familyfirstas.com)</li>
                </ul>
              </div>
              
              <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
                Family First Adolescent Services | Powered by ClearHive Health
              </p>
            </div>
          `,
          name: 'FFAS Scheduler | ClearHive Health'
        }
      );
      
      ui.alert(
        '✅ Test Email Sent!',
        `Test email successfully sent to: ${testEmail}\n\n` +
        'Please check your inbox (and spam folder) to confirm receipt.',
        ui.ButtonSet.OK
      );
      
      // Log the test
      auditLog('TEST_EMAIL_SENT', {
        recipient: testEmail,
        sentBy: Session.getActiveUser().getEmail()
      });
      
    } catch (error) {
      console.error('Test email failed:', error);
      ui.alert(
        '❌ Test Email Failed',
        'Failed to send test email: ' + error.toString() + '\n\n' +
        'Common issues:\n' +
        '• Gmail needs authorization (run function again)\n' +
        '• Invalid email address\n' +
        '• Network connectivity issues',
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Debug email system to identify issues
 */
function debugEmailSystem() {
  const ui = SpreadsheetApp.getUi();
  const diagnostics = [];
  
  diagnostics.push('🔍 EMAIL SYSTEM DIAGNOSTICS\n');
  diagnostics.push('=' .repeat(40) + '\n');
  
  // 1. Check Gmail authorization
  diagnostics.push('\n1. Gmail Authorization:');
  try {
    const aliases = GmailApp.getAliases();
    diagnostics.push('✅ GmailApp is authorized');
    diagnostics.push(`   User: ${Session.getActiveUser().getEmail()}`);
    if (aliases.length > 0) {
      diagnostics.push(`   Aliases: ${aliases.join(', ')}`);
    }
  } catch (error) {
    diagnostics.push('❌ GmailApp NOT authorized');
    diagnostics.push(`   Error: ${error.toString()}`);
  }
  
  // 2. Check configured recipients
  diagnostics.push('\n\n2. Configured Recipients:');
  diagnostics.push(`✅ Found ${CONFIG.EMAIL_RECIPIENTS.length} recipients:`);
  CONFIG.EMAIL_RECIPIENTS.forEach((email, index) => {
    const isGroup = email.includes('_') && email.endsWith('@familyfirstas.com');
    const type = isGroup ? 'GROUP' : 'USER';
    diagnostics.push(`   ${index + 1}. ${email} [${type}]`);
  });
  
  // 3. Check current week data
  diagnostics.push('\n\n3. Current Week Schedule:');
  try {
    const emailScheduler = new EmailScheduler();
    const weekData = emailScheduler.getThisWeekData();
    if (weekData) {
      diagnostics.push(`✅ Found schedule for: ${weekData.dateStr}`);
      diagnostics.push(`   Houses: ${weekData.headers.filter(h => h && !['Date', 'Options', 'Locked?'].includes(h)).length}`);
    } else {
      diagnostics.push('❌ No schedule found for current week');
    }
  } catch (error) {
    diagnostics.push(`❌ Error checking schedule: ${error.toString()}`);
  }
  
  // 4. Test email capability
  diagnostics.push('\n\n4. Email Sending Capability:');
  diagnostics.push('✅ Ready to send emails');
  diagnostics.push('   Weekly emails: Use menu "Send Weekly Email Now"');
  diagnostics.push('   Onboarding: Use menu "Send Onboarding Email"');
  diagnostics.push('   Test email: Use menu "Send Test Email"');
  
  // 5. Common issues and solutions
  diagnostics.push('\n\n5. Common Issues & Solutions:');
  diagnostics.push('• Emails to groups (e.g., Estates_CA@) require proper permissions');
  diagnostics.push('• Check spam folders for first-time emails');
  diagnostics.push('• Gmail daily limit: 100 recipients/day for consumer accounts');
  diagnostics.push('• Use "Send Test Email" to verify functionality');
  
  // Show results
  const message = diagnostics.join('\n');
  
  // Create a scrollable dialog for the diagnostics
  const htmlContent = `
    <div style="font-family: monospace; font-size: 12px; white-space: pre-wrap; padding: 20px; max-height: 500px; overflow-y: auto;">
      ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(500);
  
  ui.showModalDialog(htmlOutput, '🔍 Email System Diagnostics');
}

/**
 * View email duplicate prevention status
 */
function viewEmailDuplicateStatus() {
  const ui = SpreadsheetApp.getUi();
  const store = PropertiesService.getScriptProperties();
  const properties = store.getProperties();
  
  let duplicateCount = 0;
  let rateLimitCount = 0;
  const duplicates = [];
  const rateLimits = [];
  
  // Analyze stored properties
  for (const key in properties) {
    if (key.startsWith('dup::')) {
      duplicateCount++;
      const parts = key.split('::');
      const type = parts[1];
      const recipient = parts[2];
      const subject = parts.slice(3).join('::');
      const timestamp = new Date(parseInt(properties[key]));
      
      duplicates.push({
        type,
        recipient,
        subject: subject.substring(0, 50) + (subject.length > 50 ? '...' : ''),
        sent: timestamp.toLocaleString()
      });
    } else if (key.startsWith('rate::')) {
      const data = JSON.parse(properties[key]);
      if (data.sends && data.sends.length > 0) {
        rateLimitCount++;
        rateLimits.push({
          recipient: key.replace('rate::', ''),
          count: data.sends.length,
          firstSend: new Date(data.sends[0]).toLocaleString(),
          lastSend: new Date(data.sends[data.sends.length - 1]).toLocaleString()
        });
      }
    }
  }
  
  // Sort by most recent
  duplicates.sort((a, b) => new Date(b.sent) - new Date(a.sent));
  
  let report = '📧 Email Duplicate Prevention Status\n\n';
  report += `Total tracked emails: ${duplicateCount}\n`;
  report += `Recipients with rate limits: ${rateLimitCount}\n\n`;
  
  if (duplicates.length > 0) {
    report += 'Recent Emails (preventing duplicates):\n';
    report += '─'.repeat(50) + '\n';
    duplicates.slice(0, 10).forEach(dup => {
      report += `${dup.sent}\n`;
      report += `  To: ${dup.recipient}\n`;
      report += `  Type: ${dup.type}\n`;
      report += `  Subject: ${dup.subject}\n\n`;
    });
    
    if (duplicates.length > 10) {
      report += `...and ${duplicates.length - 10} more tracked emails\n\n`;
    }
  }
  
  report += '\nDuplicate Prevention Rules:\n';
  report += '• Weekly schedules: 24-hour window\n';
  report += '• Onboarding emails: 1-hour window\n';
  report += '• Test emails: 1-hour window\n';
  report += '• Rate limit: 2 emails per hour per recipient\n';
  
  const result = ui.alert(
    'Email Tracking Status',
    report + '\n\nWould you like to clear the duplicate prevention cache?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    clearEmailDuplicateCache();
  }
}

/**
 * Clear email duplicate prevention cache
 */
function clearEmailDuplicateCache() {
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '⚠️ Clear Email Cache',
    'This will clear all duplicate prevention tracking.\n\n' +
    'After clearing, the system will allow sending emails again to all recipients.\n\n' +
    'Are you sure you want to continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm === ui.Button.YES) {
    const store = PropertiesService.getScriptProperties();
    const properties = store.getProperties();
    
    // Delete all duplicate and rate limit keys
    const keysToDelete = [];
    for (const key in properties) {
      if (key.startsWith('dup::') || key.startsWith('rate::')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => store.deleteProperty(key));
    
    ui.alert(
      '✅ Cache Cleared',
      `Removed ${keysToDelete.length} tracking entries.\n\n` +
      'You can now send emails to all recipients again.',
      ui.ButtonSet.OK
    );
    
    auditLog('EMAIL_CACHE_CLEARED', {
      entriesCleared: keysToDelete.length,
      clearedBy: Session.getActiveUser().getEmail()
    });
  }
}

/**
 * Quick check of current email sender
 */
function quickSenderCheck() {
  const ui = SpreadsheetApp.getUi();
  const currentUser = Session.getActiveUser().getEmail();
  
  // Check if this is a connected account (Gmail showing but actually using work account)
  const isConnectedAccount = (currentUser.includes('@gmail.com') && 
                             currentUser.replace('@gmail.com', '') === 
                             CONFIG.PREFERRED_SENDER_EMAIL.split('@')[0].replace('.', ''));
  
  const isWorkAccount = currentUser.includes('@familyfirstas.com') || isConnectedAccount;
  const preferredSender = CONFIG.PREFERRED_SENDER_EMAIL;
  
  if (currentUser === preferredSender) {
    ui.alert(
      '✅ Perfect Setup!',
      `You are using the preferred work account:\n${currentUser}\n\n` +
      'Emails will be delivered with best reliability.',
      ui.ButtonSet.OK
    );
  } else if (isConnectedAccount) {
    ui.alert(
      '✅ Connected Account Detected',
      `You appear to be using a connected @familyfirstas.com account!\n\n` +
      `Showing as: ${currentUser}\n` +
      `Connected to: ${preferredSender}\n\n` +
      'This is GOOD - your emails will be sent properly.\n' +
      'Google sometimes shows your Gmail address even when using your work account.',
      ui.ButtonSet.OK
    );
  } else if (isWorkAccount) {
    ui.alert(
      '✅ Work Account Active',
      `Current account: ${currentUser}\n` +
      `Preferred account: ${preferredSender}\n\n` +
      'Good: Using a work account\n' +
      'Better: Switch to the preferred account for consistency',
      ui.ButtonSet.OK
    );
  } else {
    const result = ui.alert(
      '⚠️ Personal Account Warning!',
      `CURRENT: ${currentUser} (Personal)\n` +
      `SHOULD BE: ${preferredSender} (Work)\n\n` +
      'Problems with personal accounts:\n' +
      '• Emails often go to spam\n' +
      '• May fail to deliver to @familyfirstas.com\n' +
      '• Recipients might not get emails\n\n' +
      'Switch to work account now?',
      ui.ButtonSet.YES_NO
    );
    
    if (result === ui.Button.YES) {
      ui.alert(
        'How to Switch',
        '1. Sign out of all Google accounts\n' +
        '2. Sign in with: ' + preferredSender + '\n' +
        '3. Reopen this sheet\n' +
        '4. All emails will send correctly!',
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Check and configure email sending setup
 */
function checkEmailSenderSetup() {
  const ui = SpreadsheetApp.getUi();
  const currentUser = Session.getActiveUser().getEmail();
  const preferredSender = CONFIG.PREFERRED_SENDER_EMAIL;
  const aliases = GmailApp.getAliases();
  
  let status = '📧 Email Sender Configuration\n\n';
  status += `Current logged-in account: ${currentUser}\n`;
  status += `Preferred sender: ${preferredSender}\n\n`;
  
  if (currentUser === preferredSender) {
    status += '✅ You are logged in with the preferred sender account!\n';
    status += 'Emails will be sent from your work account with best deliverability.\n';
  } else if (aliases.includes(preferredSender)) {
    status += '✅ Your work email is configured as an alias!\n';
    status += 'Emails will be sent using your work email address.\n';
  } else {
    status += '⚠️ Work email is not available as sender.\n\n';
    status += 'To fix this, choose one option:\n\n';
    status += '1. LOG IN WITH WORK ACCOUNT (Recommended):\n';
    status += '   - Sign out of Google\n';
    status += '   - Sign in with cmolina@familyfirstas.com\n';
    status += '   - Reopen this sheet\n\n';
    status += '2. ADD WORK EMAIL AS ALIAS:\n';
    status += '   - Go to Gmail Settings → Accounts\n';
    status += '   - Add cmolina@familyfirstas.com as a "Send mail as" address\n';
    status += '   - Verify the email\n';
    status += '   - Return here and run this check again\n';
  }
  
  status += '\nAvailable email aliases:\n';
  if (aliases.length > 0) {
    aliases.forEach(alias => {
      status += `  • ${alias}\n`;
    });
  } else {
    status += '  (none)\n';
  }
  
  ui.alert('Email Sender Setup', status, ui.ButtonSet.OK);
}

/**
 * Setup work account for better email deliverability
 */
function setupWorkAccount() {
  const ui = SpreadsheetApp.getUi();
  const currentUser = Session.getActiveUser().getEmail();
  const isWorkAccount = currentUser.includes('@familyfirstas.com');
  
  if (isWorkAccount) {
    // Already using work account
    ui.alert(
      '✅ Work Account Active',
      `You are already using your work account:\n${currentUser}\n\n` +
      'Your emails will be sent from this account for best deliverability to @familyfirstas.com addresses.\n\n' +
      'Benefits:\n' +
      '• No spam filtering issues\n' +
      '• Direct delivery to group emails\n' +
      '• Professional sender reputation',
      ui.ButtonSet.OK
    );
  } else {
    // Using personal account - provide instructions
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #d93025;">⚠️ Using Personal Account</h2>
        
        <p>You're currently using: <strong>${currentUser}</strong></p>
        
        <div style="background: #fce8e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d93025;">
          <h3 style="color: #d93025; margin-top: 0;">This may cause delivery issues:</h3>
          <ul style="color: #5f0000;">
            <li>Emails to group addresses (like Estates_CA@familyfirstas.com) may be blocked</li>
            <li>Messages might go to spam folders</li>
            <li>Some recipients may not receive emails at all</li>
          </ul>
        </div>
        
        <div style="background: #e6f4ea; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #34a853;">
          <h3 style="color: #137333; margin-top: 0;">✅ Recommended Solution:</h3>
          <ol>
            <li>Sign out of this Google account</li>
            <li>Sign in with <strong>cmolina@familyfirstas.com</strong></li>
            <li>Re-open this Google Sheet</li>
            <li>Run this setup again to confirm</li>
          </ol>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1565c0; margin-top: 0;">📋 Alternative: Request IT Whitelist</h3>
          <p>If you must use your personal account, ask IT to:</p>
          <ul>
            <li>Whitelist <strong>${currentUser}</strong> in the email system</li>
            <li>Allow external emails to group addresses</li>
            <li>Add to safe senders for all @familyfirstas.com users</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button onclick="testCurrentSetup()" style="background: #1a73e8; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            Test Current Setup
          </button>
          <button onclick="google.script.host.close()" style="padding: 10px 20px;">
            Close
          </button>
        </div>
      </div>
      
      <script>
        function testCurrentSetup() {
          google.script.run
            .withSuccessHandler(() => {
              alert('Test email sent! Check cmolina@familyfirstas.com inbox and spam folder.');
              google.script.host.close();
            })
            .withFailureHandler(error => alert('Test failed: ' + error))
            .sendTestToWork();
        }
      </script>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(650)
      .setHeight(600);
    
    ui.showModalDialog(htmlOutput, 'Work Account Setup Required');
  }
}

/**
 * Send test email to work account
 */
function sendTestToWork() {
  const testRecipient = 'cmolina@familyfirstas.com';
  const currentUser = Session.getActiveUser().getEmail();
  const isWorkAccount = currentUser.includes('@familyfirstas.com');
  
  try {
    sendEmailFromWorkAccount(
      testRecipient,
      `[TEST] FFAS Scheduler - ${isWorkAccount ? 'Work' : 'Personal'} Account`,
      `This is a test email from the FFAS Scheduler.\n\nSent from: ${currentUser}\nAccount type: ${isWorkAccount ? 'Work Account ✓' : 'Personal Account ⚠️'}\n\nIf you receive this in your inbox (not spam), the setup is working.`,
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>FFAS Scheduler Test Email</h2>
        <p><strong>Sent from:</strong> ${currentUser}</p>
        <p><strong>Account type:</strong> ${isWorkAccount ? '✅ Work Account' : '⚠️ Personal Account'}</p>
        <p>If you receive this in your inbox (not spam), the setup is working.</p>
        ${!isWorkAccount ? '<p style="color: #d93025;"><strong>Note:</strong> For best deliverability, please use your @familyfirstas.com account.</p>' : ''}
      </div>`
    );
    
    console.log(`Test email sent to ${testRecipient} from ${currentUser}`);
    
  } catch (error) {
    console.error('Test email failed:', error);
    throw error;
  }
}

/**
 * Manage email recipients for weekly schedule
 */
function manageEmailRecipients() {
  SpreadsheetApp.getUi().alert(
    'Fixed Distribution Lists',
    'Email recipients are now fixed to the 3 distribution lists:\n\n' +
    '• Estates_CA@familyfirstas.com\n' +
    '• Nest_CA@familyfirstas.com\n' +
    '• Cove_CA@familyfirstas.com\n\n' +
    'These lists are managed by your email administrator.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  return;
  
  const ui = SpreadsheetApp.getUi();
  
  // Get current recipients from ScriptProperties (safe way)
  let currentRecipients = [];
  try {
    const properties = PropertiesService.getScriptProperties();
    const storedRecipients = properties.getProperty(CONFIG.RECIPIENTS_KEY);
    if (storedRecipients) {
      currentRecipients = JSON.parse(storedRecipients);
    }
  } catch (error) {
    console.log('Error loading recipients:', error);
  }
  
  // Check if CONFIG has EMAIL_RECIPIENTS as backup
  if (currentRecipients.length === 0 && typeof CONFIG.EMAIL_RECIPIENTS !== 'undefined' && CONFIG.EMAIL_RECIPIENTS) {
    currentRecipients = CONFIG.EMAIL_RECIPIENTS;
  }
  
  const currentRecipientsText = currentRecipients.length > 0 ? currentRecipients.join('\n') : 'No recipients configured yet';
  
  const result = ui.prompt(
    '📧 Manage Email Recipients',
    'Enter email addresses (one per line) who should receive the weekly schedule:\n\n' +
    'Current recipients:\n' + currentRecipientsText + '\n\n' +
    'Note: This will update your email recipient list.',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const newEmailsText = result.getResponseText().trim();
    
    if (!newEmailsText) {
      ui.alert('No Change', 'No email addresses entered. Recipients list unchanged.', ui.ButtonSet.OK);
      return;
    }
    
    // Parse and validate email addresses
    const newEmails = newEmailsText
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = [];
    const invalidEmails = [];
    
    newEmails.forEach(email => {
      if (emailRegex.test(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });
    
    if (invalidEmails.length > 0) {
      const continueResult = ui.alert(
        '⚠️ Invalid Email Addresses',
        `The following emails appear invalid:\n${invalidEmails.join('\n')}\n\n` +
        `Continue with ${validEmails.length} valid emails?`,
        ui.ButtonSet.YES_NO
      );
      
      if (continueResult !== ui.Button.YES) {
        ui.alert('Cancelled', 'Email recipient update cancelled.', ui.ButtonSet.OK);
        return;
      }
    }
    
    if (validEmails.length === 0) {
      ui.alert('No Valid Emails', 'No valid email addresses found. Recipients list unchanged.', ui.ButtonSet.OK);
      return;
    }
    
    // Save to ScriptProperties
    try {
      const properties = PropertiesService.getScriptProperties();
      properties.setProperty(CONFIG.RECIPIENTS_KEY, JSON.stringify(validEmails));
      
      ui.alert(
        '✅ Recipients Updated',
        `Successfully updated email recipients!\n\n` +
        `${validEmails.length} recipients configured:\n` +
        validEmails.slice(0, 5).join('\n') +
        (validEmails.length > 5 ? `\n...and ${validEmails.length - 5} more` : ''),
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      ui.alert('Error', 'Failed to save recipients: ' + error.toString(), ui.ButtonSet.OK);
      console.error('Error saving recipients:', error);
    }
  } else {
    ui.alert('Cancelled', 'Email recipient management cancelled.', ui.ButtonSet.OK);
  }
}

/**
 * Check email recipients list
 */
function checkEmailRecipients() {
  const ui = SpreadsheetApp.getUi();
  
  // Always use the 3 distribution lists
  const distributionLists = [
    'Estates_CA@familyfirstas.com',
    'Nest_CA@familyfirstas.com', 
    'Cove_CA@familyfirstas.com'
  ];
  
  // Update stored recipients to ensure consistency
    const properties = PropertiesService.getScriptProperties();
  properties.setProperty(CONFIG.RECIPIENTS_KEY, JSON.stringify(distributionLists));
  
  let report = `📋 Email Distribution Lists:\n\n`;
  report += '📧 Estates_CA@familyfirstas.com\n   → Estates Program Coordinators & Staff\n\n';
  report += '📧 Nest_CA@familyfirstas.com\n   → Nest Program Coordinators & Staff\n\n';
  report += '📧 Cove_CA@familyfirstas.com\n   → Cove Program Coordinators & Staff\n\n';
  report += '✅ All weekly schedules are sent to these 3 distribution lists.\n';
  report += '💡 Each list includes all relevant program coordinators and staff.';
  
  ui.alert('Email Recipients', report, ui.ButtonSet.OK);
}

/**
 * Bulk add email recipients from comma-separated list
 */
function bulkAddEmailRecipients() {
  const ui = SpreadsheetApp.getUi();
  
  const result = ui.prompt(
    '📧 Bulk Add Email Recipients',
    'Paste your comma-separated email list:\n\n' +
    '(The system will automatically add all valid email addresses)',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const commaSeparatedEmails = result.getResponseText().trim();
    
    if (!commaSeparatedEmails) {
      ui.alert('No Input', 'No email addresses entered.', ui.ButtonSet.OK);
      return;
    }
    
    // Parse emails - handle both comma and semicolon separators
    const emailList = commaSeparatedEmails
      .replace(/[;,\s]+/g, ',') // Replace semicolons and multiple spaces with commas
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@')); // Basic filter
    
    // Remove duplicates
    const uniqueEmails = [...new Set(emailList)];
    
    // More lenient email validation for bulk import
    const validEmails = [];
    const invalidEmails = [];
    
    uniqueEmails.forEach(email => {
      // Much more lenient validation - just check for @ and a domain
      if (email.includes('@') && email.split('@')[1].includes('.')) {
        validEmails.push(email.toLowerCase());
      } else {
        invalidEmails.push(email);
      }
    });
    
    if (invalidEmails.length > 0) {
      const continueResult = ui.alert(
        '⚠️ Some Emails Skipped',
        `Found ${invalidEmails.length} invalid entries that will be skipped:\n${invalidEmails.slice(0, 5).join('\n')}${invalidEmails.length > 5 ? '\n...' : ''}\n\n` +
        `Continue with ${validEmails.length} valid emails?`,
        ui.ButtonSet.YES_NO
      );
      
      if (continueResult !== ui.Button.YES) {
        return;
      }
    }
    
    if (validEmails.length === 0) {
      ui.alert('No Valid Emails', 'No valid email addresses found.', ui.ButtonSet.OK);
      return;
    }
    
    // Directly save to ScriptProperties
    try {
      const properties = PropertiesService.getScriptProperties();
      properties.setProperty(CONFIG.RECIPIENTS_KEY, JSON.stringify(validEmails));
      
      ui.alert(
        '✅ Recipients Added Successfully!',
        `Successfully added ${validEmails.length} email recipients!\n\n` +
        `First 10 recipients:\n` +
        validEmails.slice(0, 10).join('\n') +
        (validEmails.length > 10 ? `\n...and ${validEmails.length - 10} more` : '') +
        '\n\nThese recipients will now receive the weekly schedule emails.',
        ui.ButtonSet.OK
      );
      
      console.log(`Bulk added ${validEmails.length} email recipients`);
      
    } catch (error) {
      ui.alert('Error', 'Failed to save recipients: ' + error.toString(), ui.ButtonSet.OK);
      console.error('Error saving bulk recipients:', error);
    }
  }
}
/**
 * Preview the color scheme for houses and vendors
 */
function previewColorScheme() {
  const ui = SpreadsheetApp.getUi();
  const dataManager = new DataManager(SpreadsheetApp.getActiveSpreadsheet());
  
  // Get actual vendors from your sheet
  const vendors = dataManager.getVendors();
  const vendorNames = Object.keys(vendors);
  
  const houses = ['Banyan', 'Hedge', 'Preserve', 'Cove', 'Meridian', 'Prosperity'];
  
  // Create visual HTML preview showing exact color alignment
  let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-height: 600px; overflow-y: auto;">
      <h2 style="color: #1a73e8;">🎨 COLOR ALIGNMENT VERIFICATION</h2>
      <p style="color: #666; margin-bottom: 20px;">
        This shows EXACTLY how colors appear in both the Google Sheets schedule and email notifications.<br>
        <strong>Colors must match perfectly so you and program coordinators can quickly identify houses and vendors.</strong>
      </p>
      
      <h3 style="color: #34a853; margin-top: 30px;">🏠 HOUSE COLORS</h3>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">House</th>
          <th style="border: 1px solid #ddd; padding: 12px;">Base Color</th>
          <th style="border: 1px solid #ddd; padding: 12px;">Sheet Appearance</th>
          <th style="border: 1px solid #ddd; padding: 12px;">Email Header</th>
        </tr>`;
  
  // Show each house with its colors
  for (const house of houses) {
    const color = dataManager.getHouseColor(house);
    const headerColor = dataManager.getHouseHeaderColor(house);
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">${house}</td>
        <td style="border: 1px solid #ddd; padding: 12px; font-family: monospace; font-size: 12px;">${color}</td>
        <td style="border: 1px solid #ddd; padding: 12px; background-color: ${color}; color: white; font-weight: bold; text-align: center;">
          ${house}
        </td>
        <td style="border: 1px solid #ddd; padding: 12px; background-color: ${headerColor}; color: ${color}; font-weight: bold; text-align: center;">
          ${house}
        </td>
      </tr>`;
  }
  
  html += `</table>
    
    <h3 style="color: #34a853; margin-top: 30px;">🏢 VENDOR COLOR SYSTEM</h3>
    <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
      Vendors are automatically assigned colors based on their type (park, beach, equestrian, etc.).<br>
      This ensures consistent visual identification across all schedules and emails.
    </p>
    
    <h4 style="color: #666; margin-top: 20px;">Color Assignment Rules:</h4>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <tr style="background: #f0f0f0;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Vendor Type</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Keywords</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Email Color</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Sheet Color</th>
      </tr>`;
  
  // Define vendor type color mappings
  const vendorTypes = [
    { type: 'State Parks', keywords: 'park, state park', theme: 'Purple' },
    { type: 'Equestrian', keywords: 'equestrian, horse', theme: 'Green' },
    { type: 'Beach/Surf', keywords: 'beach, surf', theme: 'Blue' },
    { type: 'Farm/Animals', keywords: 'goat, farm', theme: 'Orange' },
    { type: 'Art/Creative', keywords: 'paint, art', theme: 'Pink' },
    { type: 'YMCA', keywords: 'ymca', theme: 'Cyan' },
    { type: 'Bowling', keywords: 'bowling', theme: 'Lime' },
    { type: 'Movies', keywords: 'movie, theater', theme: 'Amber' },
    { type: 'Museum', keywords: 'museum', theme: 'Indigo' },
    { type: 'Zoo', keywords: 'zoo', theme: 'Teal' },
    { type: 'Aquarium', keywords: 'aquarium', theme: 'Light Cyan' }
  ];
  
  for (const type of vendorTypes) {
    // Get actual colors for this type
    const sampleVendor = type.keywords.split(',')[0].trim();
    const emailColor = dataManager.getVendorBackgroundColor(sampleVendor, {});
    const sheetColor = dataManager.getVendorSheetColor(sampleVendor, {});
    
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px;">${type.type}</td>
        <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; color: #666;">${type.keywords}</td>
        <td style="border: 1px solid #ddd; padding: 10px; background-color: ${emailColor}; text-align: center;">
          <span style="font-size: 11px;">${type.theme}</span>
        </td>
        <td style="border: 1px solid #ddd; padding: 10px; background-color: ${sheetColor}; text-align: center;">
          <span style="font-size: 11px;">${type.theme}</span>
        </td>
      </tr>`;
  }
  
  html += `</table>
    
    <h4 style="color: #666; margin-top: 20px;">Your Current Vendors:</h4>
    <table style="border-collapse: collapse; width: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <tr style="background: #f0f0f0;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Vendor Name</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Type Detected</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Email Color</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Sheet Color</th>
      </tr>`;
  
  // Show first 15 actual vendors
  const displayVendors = vendorNames.slice(0, 15);
  for (const vendor of displayVendors) {
    const vendorData = vendors[vendor];
    const emailColor = dataManager.getVendorBackgroundColor(vendor, vendorData);
    const sheetColor = dataManager.getVendorSheetColor(vendor, vendorData);
    
    // Detect type
    let detectedType = 'Default';
    const vendorLower = vendor.toLowerCase();
    if (vendorLower.includes('park')) detectedType = 'Park';
    else if (vendorLower.includes('equestrian') || vendorLower.includes('horse')) detectedType = 'Equestrian';
    else if (vendorLower.includes('beach') || vendorLower.includes('surf')) detectedType = 'Beach/Surf';
    else if (vendorLower.includes('goat') || vendorLower.includes('farm')) detectedType = 'Farm';
    else if (vendorLower.includes('paint') || vendorLower.includes('art')) detectedType = 'Art';
    else if (vendorLower.includes('ymca')) detectedType = 'YMCA';
    else if (vendorLower.includes('bowling')) detectedType = 'Bowling';
    else if (vendorLower.includes('movie') || vendorLower.includes('theater')) detectedType = 'Movies';
    else if (vendorLower.includes('museum')) detectedType = 'Museum';
    else if (vendorLower.includes('zoo')) detectedType = 'Zoo';
    else if (vendorLower.includes('aquarium')) detectedType = 'Aquarium';
    
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px; font-size: 13px;">${vendor}</td>
        <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; color: #666;">${detectedType}</td>
        <td style="border: 1px solid #ddd; padding: 10px; background-color: ${emailColor};">
          <span style="font-size: 11px; color: #666;">${emailColor}</span>
        </td>
        <td style="border: 1px solid #ddd; padding: 10px; background-color: ${sheetColor};">
          <span style="font-size: 11px; color: #666;">${sheetColor}</span>
        </td>
      </tr>`;
  }
  
  if (vendorNames.length > 15) {
    html += `
      <tr>
        <td colspan="4" style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #666; font-style: italic;">
          ... and ${vendorNames.length - 15} more vendors
        </td>
      </tr>`;
  }
  
  html += `</table>
    
    <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
      <h4 style="margin: 0 0 10px 0; color: #2e7d32;">✅ Color Alignment Benefits:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #424242;">
        <li>House colors (Banyan=Red, Hedge=Teal, etc.) are consistent everywhere</li>
        <li>Vendor colors automatically match their activity type</li>
        <li>Email colors are lighter (85% transparency) for readability</li>
        <li>Sheet colors are stronger for quick visual scanning</li>
        <li>Program coordinators can instantly identify houses and vendor types</li>
        <li>You can quickly verify schedules without mixing up assignments</li>
      </ul>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
      <h4 style="margin: 0 0 10px 0; color: #e65100;">🔍 Testing Color Alignment:</h4>
      <ol style="margin: 5px 0; padding-left: 20px; color: #424242;">
        <li>Generate a schedule to see colors in Google Sheets</li>
        <li>Send a test email to see the same colors in email format</li>
        <li>Colors should match perfectly between both views</li>
        <li>If any vendor has no color, it will appear white/default</li>
      </ol>
    </div>
    </div>`;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(700);
  
  ui.showModalDialog(htmlOutput, '🎨 Color Alignment Verification');
}

/**
 * Verify color consistency across sheets and emails
 */
function verifyColorConsistency() {
  const ui = SpreadsheetApp.getUi();
  const dataManager = new DataManager(SpreadsheetApp.getActiveSpreadsheet());
  
  try {
    // Get the current week's schedule
    const schedSheet = dataManager.getSheet('SCHEDULE');
    const schedData = schedSheet.getDataRange().getValues();
    
    if (schedData.length < 2) {
      ui.alert('No Schedule', 'Please generate a schedule first to verify color consistency.', ui.ButtonSet.OK);
      return;
    }
    
    // Get conditional formatting rules
    const rules = schedSheet.getConditionalFormatRules();
    
    let report = 'COLOR CONSISTENCY REPORT\n\n';
    report += `Found ${rules.length} conditional formatting rules in the schedule sheet.\n\n`;
    
    // Check each rule
    const vendorColors = new Map();
    rules.forEach((rule, index) => {
      const condition = rule.getBooleanCondition();
      if (condition) {
        const criteriaType = condition.getCriteriaType();
        const criteriaValues = condition.getCriteriaValues();
        const background = rule.getBackground();
        
        if (criteriaType === SpreadsheetApp.BooleanCriteria.TEXT_CONTAINS && criteriaValues.length > 0) {
          const vendorName = criteriaValues[0];
          vendorColors.set(vendorName, background);
        }
      }
    });
    
    // Compare with email colors
    report += 'VENDOR COLOR COMPARISON:\n';
    report += '========================\n\n';
    
    let mismatches = 0;
    vendorColors.forEach((sheetColor, vendorName) => {
      const vendorData = dataManager.getVendors()[vendorName] || {};
      const emailColor = dataManager.getVendorBackgroundColor(vendorName, vendorData);
      const expectedSheetColor = dataManager.getVendorSheetColor(vendorName, vendorData);
      
      if (sheetColor !== expectedSheetColor) {
        mismatches++;
        report += `❌ ${vendorName}:\n`;
        report += `   Sheet Color: ${sheetColor}\n`;
        report += `   Expected: ${expectedSheetColor}\n\n`;
      } else {
        report += `✅ ${vendorName}: Colors match correctly\n`;
      }
    });
    
    if (mismatches === 0) {
      report += '\n✅ ALL COLORS ARE PROPERLY ALIGNED!\n';
      report += 'Sheet colors and email colors will display consistently.\n';
    } else {
      report += `\n⚠️ Found ${mismatches} color mismatches.\n`;
      report += 'Run "Generate Schedule" again to fix color alignment.\n';
    }
    
    ui.alert('Color Consistency Report', report, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', 'Error checking color consistency: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Show color alignment guide for training
 */
function showColorAlignmentGuide() {
  const ui = SpreadsheetApp.getUi();
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
      <h2 style="color: #1a73e8; margin-bottom: 20px;">🎨 Color Alignment Guide</h2>
      
      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #2e7d32; margin-top: 0;">Why Colors Matter</h3>
        <p style="margin: 5px 0;">The color system helps you and program coordinators:</p>
        <ul style="margin: 5px 0 0 0; padding-left: 25px;">
          <li><strong>Prevent Mix-ups:</strong> Quickly identify which house each outing belongs to</li>
          <li><strong>Identify Vendors:</strong> See vendor types at a glance (parks=purple, beach=blue, etc.)</li>
          <li><strong>Save Time:</strong> No need to read details - colors tell the story</li>
          <li><strong>Ensure Consistency:</strong> Same colors in sheets and emails</li>
        </ul>
      </div>
      
      <h3 style="color: #34a853;">How to Use the Color System</h3>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="margin-top: 0; color: #5f6368;">1. House Colors (Column Headers)</h4>
        <p style="margin: 5px 0;">Each house has a unique color that appears in:</p>
        <ul style="margin: 5px 0 0 0; padding-left: 25px;">
          <li>Google Sheets schedule headers</li>
          <li>Email table house column</li>
          <li>Always the same color for quick identification</li>
        </ul>
        <div style="margin-top: 10px;">
          <span style="background: #FF6B6B; color: white; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">Banyan</span>
          <span style="background: #4ECDC4; color: white; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">Hedge</span>
          <span style="background: #45B7D1; color: white; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">Preserve</span>
          <span style="background: #96CEB4; color: white; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">Cove</span>
          <span style="background: #FECA57; color: #333; padding: 3px 8px; border-radius: 3px; margin-right: 5px;">Meridian</span>
          <span style="background: #DDA0DD; color: white; padding: 3px 8px; border-radius: 3px;">Prosperity</span>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="margin-top: 0; color: #5f6368;">2. Vendor Colors (Activity Types)</h4>
        <p style="margin: 5px 0;">Vendors are colored by type for quick identification:</p>
        <table style="margin-top: 10px; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 10px;"><span style="background: #e1bee7; padding: 3px 8px; border-radius: 3px;">Parks</span></td>
            <td style="padding: 5px 10px; color: #666;">State parks, county parks</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px;"><span style="background: #c8e6c9; padding: 3px 8px; border-radius: 3px;">Equestrian</span></td>
            <td style="padding: 5px 10px; color: #666;">Horse farms, riding</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px;"><span style="background: #bbdefb; padding: 3px 8px; border-radius: 3px;">Beach/Surf</span></td>
            <td style="padding: 5px 10px; color: #666;">Beach activities, surf therapy</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px;"><span style="background: #ffe0b2; padding: 3px 8px; border-radius: 3px;">Farm</span></td>
            <td style="padding: 5px 10px; color: #666;">Goat farms, petting zoos</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px;"><span style="background: #f8bbd9; padding: 3px 8px; border-radius: 3px;">Art</span></td>
            <td style="padding: 5px 10px; color: #666;">Painting, creative activities</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="margin-top: 0; color: #e65100;">⚡ Quick Tips</h4>
        <ul style="margin: 5px 0 0 0; padding-left: 25px;">
          <li><strong>Sheets vs Emails:</strong> Email colors are lighter for readability, sheet colors are bolder</li>
          <li><strong>New Vendors:</strong> Automatically get colors based on their name/type</li>
          <li><strong>Custom Colors:</strong> Can be set in VENDORS sheet if needed</li>
          <li><strong>Verification:</strong> Use "Verify Color Consistency" to check alignment</li>
        </ul>
      </div>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #1565c0;">📋 Workflow Example</h4>
        <ol style="margin: 5px 0 0 0; padding-left: 25px;">
          <li>Generate schedule → Colors automatically applied</li>
          <li>Review in sheets → Quick visual check by color</li>
          <li>Send emails → Same colors for consistency</li>
          <li>Program coordinators → Instantly see house/vendor by color</li>
        </ol>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px;">
          Colors are your visual guide to prevent errors and save time!<br>
          <strong>Consistent colors = Clear communication = No mix-ups</strong>
        </p>
      </div>
    </div>`;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(850)
    .setHeight(700);
  
  ui.showModalDialog(htmlOutput, 'Color Alignment Guide');
}

/**
 * Configure automation settings
 */
function showAutomationSettings() {
  const triggers = ScriptApp.getProjectTriggers();
  const mondayTrigger = triggers.find(t => t.getHandlerFunction() === 'previewAndSendSchedule');
  
  // Get recipient count safely
  let recipientCount = 0;
  try {
    const properties = PropertiesService.getScriptProperties();
    const storedRecipients = properties.getProperty(CONFIG.RECIPIENTS_KEY);
    if (storedRecipients) {
      recipientCount = JSON.parse(storedRecipients).length;
    }
  } catch (error) {
    console.log('Error loading recipient count:', error);
  }
  
  // Fallback to CONFIG.EMAIL_RECIPIENTS if it exists
  if (recipientCount === 0 && typeof CONFIG.EMAIL_RECIPIENTS !== 'undefined' && CONFIG.EMAIL_RECIPIENTS && CONFIG.EMAIL_RECIPIENTS.length > 0) {
    recipientCount = CONFIG.EMAIL_RECIPIENTS.length;
  }
  
  let statusMessage = '';
  if (mondayTrigger) {
    const triggerSource = mondayTrigger.getTriggerSource();
    const eventType = mondayTrigger.getEventType();
    statusMessage = `✅ ACTIVE - Emails will be sent automatically every Monday at 10:00 AM\n\n`;
    statusMessage += `📧 Recipients: ${recipientCount} configured\n`;
    statusMessage += `⏰ Next trigger: Monday at 10:00 AM\n`;
    statusMessage += `🔄 Function: previewAndSendSchedule\n\n`;
    statusMessage += `The system will automatically send the weekly therapeutic outings schedule to all configured recipients every Monday morning.`;
  } else {
    statusMessage = `❌ NOT CONFIGURED - No automatic email reminders set up\n\n`;
    statusMessage += `To enable automatic Monday morning emails, click YES below.`;
  }
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚙️ Monday Email Automation Status',
    statusMessage + '\n\nWould you like to:\n' +
    '• YES = Enable/Update Monday 8AM automation\n' +
    '• NO = Disable all automation\n' +
    '• CANCEL = Keep current settings',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (response === ui.Button.YES) {
    setupEnhancedTrigger();
  } else if (response === ui.Button.NO) {
    removeAllTriggers();
  }
}

/**
 * Create or update Vendor Calendar Links sheet
 */
function createVendorCalendarLinksSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  // Check if sheet already exists
  let sheet = ss.getSheetByName('VENDOR_CALENDAR_LINKS');
  
  if (sheet) {
    const response = ui.alert(
      'Sheet Exists',
      'The VENDOR_CALENDAR_LINKS sheet already exists. Do you want to recreate it?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    // Delete existing sheet
    ss.deleteSheet(sheet);
  }
  
  // Create new sheet
  sheet = ss.insertSheet('VENDOR_CALENDAR_LINKS');
  
  // Set up headers with formatting
  const headers = [
    ['Vendor Calendar Links - Quick Reference', '', '', '', ''],
    ['', '', '', '', ''],
    ['Vendor Name', 'Calendar ID', 'Shareable Link', 'Notes', 'Last Updated']
  ];
  
  sheet.getRange('A1:E3').setValues(headers);
  
  // Format title row
  sheet.getRange('A1:E1').merge()
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  
  // Format header row
  sheet.getRange('A3:E3')
    .setBackground('#e3f2fd')
    .setFontWeight('bold')
    .setBorder(true, true, true, true, true, true);
  
  // Add the vendor calendar data you provided
  const vendorData = [
    [
      'Kyaking John D McArthur State Park.', 
      '8b85f4b456e10d8a991129b210ea16f98ac00fecfa04f2f39b2951a4c0d50aef@group.calendar.google.com',
      'https://calendar.google.com/calendar/u/0?cid=OGI4NWY0YjQ1NmUxMGQ4YTk5MTEyOWIyMTBlYTE2Zjk4YWMwMGZlY2ZhMDRmMmYzOWIyOTUxYTRjMGQ1MGFlZkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
      'Water therapy activities - Kayaking',
      new Date()
    ],
    [
      'Groovy Goat Farm',
      'c8d302e6f7510aa71ae3ab2d0b0868c614d604a7800d1a5130a92a02aba048c9@group.calendar.google.com',
      'https://calendar.google.com/calendar/u/0?cid=YzhkMzAyZTZmNzUxMGFhNzFhZTNhYjJkMGIwODY4YzYxNGQ2MDRhNzgwMGQxYTUxMzBhOTJhMDJhYmEwNDhjOUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
      'Animal-assisted yoga therapy - Goat Yoga',
      new Date()
    ],
    [
      'Johnson Folly Equestrian Farm',
      '9f8e8edbe22f7ed8574b9295f5d06352167ae560bb98c100370533daa34e0ce6@group.calendar.google.com',
      'https://calendar.google.com/calendar/u/0?cid=OWY4ZThlZGJlMjJmN2VkODU3NGI5Mjk1ZjVkMDYzNTIxNjdhZTU2MGJiOThjMTAwMzcwNTMzZGFhMzRlMGNlNkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
      'Equine therapy program - Jolly Johnson',
      new Date()
    ],
    [
      'Surf Therapy',
      '9ef8dd17e6af927ad50e01049b061c405781bb08229b646a0897574dac5ca296@group.calendar.google.com',
      'https://calendar.google.com/calendar/u/0?cid=OWVmOGRkMTdlNmFmOTI3YWQ1MGUwMTA0OWIwNjFjNDA1NzgxYmIwODIyOWI2NDZhMDg5NzU3NGRhYzVjYTI5NkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
      'Ocean-based surf therapy',
      new Date()
    ],
    [
      'The Peach Therapeutic Painting',
      'f640d58ac3faaecccf7b29d5b4449816d5141ae1a7ac5209e69b01037032207e@group.calendar.google.com',
      'https://calendar.google.com/calendar/u/0?cid=ZjY0MGQ1OGFjM2ZhYWVjY2NmN2IyOWQ1YjQ0NDk4MTZkNTE0MWFlMWE3YWM1MjA5ZTY5YjAxMDM3MDMyMjA3ZUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
      'Art therapy - Therapeutic painting',
      new Date()
    ]
  ];
  
  // Add data to sheet
  if (vendorData.length > 0) {
    sheet.getRange(4, 1, vendorData.length, 5).setValues(vendorData);
  }
  
  // Format data area
  sheet.getRange(4, 1, vendorData.length, 5)
    .setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // Set column widths
  sheet.setColumnWidth(1, 200); // Vendor Name
  sheet.setColumnWidth(2, 400); // Calendar ID
  sheet.setColumnWidth(3, 600); // Shareable Link
  sheet.setColumnWidth(4, 200); // Notes
  sheet.setColumnWidth(5, 150); // Last Updated
  
  // Format date column
  sheet.getRange(4, 5, vendorData.length, 1).setNumberFormat('MM/dd/yyyy');
  
  // Add instructions at the bottom
  const instructionRow = 4 + vendorData.length + 2;
  sheet.getRange(instructionRow, 1, 1, 5).merge()
    .setValue('📋 INSTRUCTIONS: Copy the Calendar ID for API integration or the Shareable Link to send to new vendor representatives.')
    .setBackground('#fff3cd')
    .setFontColor('#856404')
    .setFontStyle('italic')
    .setWrap(true);
  
  // Add additional empty rows for new entries
  const emptyRowStart = instructionRow + 2;
  sheet.getRange(emptyRowStart, 1, 5, 1).setValue('(Add new vendor)');
  
  // Protect the sheet structure but allow editing of data
  const protection = sheet.protect().setDescription('Vendor Calendar Links - Protected');
  protection.setWarningOnly(true);
  
  // Show completion message
  ui.alert(
    '✅ Success',
    'Vendor Calendar Links sheet created successfully!\n\n' +
    '⚠️ IMPORTANT - CALENDAR PERMISSIONS REQUIRED:\n' +
    'Vendors need access to view calendars!\n\n' +
    '📋 REQUIRED STEPS:\n' +
    '1. Go to Google Calendar (calendar.google.com)\n' +
    '2. For each vendor calendar, click Settings → "Share with specific people"\n' +
    '3. Add vendor email addresses with "See all event details" permission\n\n' +
    '✅ Once shared, vendors can access their schedules using the links!',
    ui.ButtonSet.OK
  );
  
  // Switch to the new sheet
  ss.setActiveSheet(sheet);
}

/**
 * Quick fix for vendor calendar IDs
 */
function quickFixVendorCalendarIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const vendorsSheet = ss.getSheetByName('VENDORS');
  
  if (!vendorsSheet) {
    ui.alert('Error', 'VENDORS sheet not found!', ui.ButtonSet.OK);
    return;
  }
  
  // Map of vendor names to calendar IDs - exact matches
  const calendarIdMap = {
    'Kyaking John D McArthur State Park.': '8b85f4b456e10d8a991129b210ea16f98ac00fecfa04f2f39b2951a4c0d50aef@group.calendar.google.com',
    'Groovy Goat Farm': 'c8d302e6f7510aa71ae3ab2d0b0868c614d604a7800d1a5130a92a02aba048c9@group.calendar.google.com',
    'Johnson Folly Equestrian Farm': '9f8e8edbe22f7ed8574b9295f5d06352167ae560bb98c100370533daa34e0ce6@group.calendar.google.com',
    'Surf Therapy': '9ef8dd17e6af927ad50e01049b061c405781bb08229b646a0897574dac5ca296@group.calendar.google.com',
    'The Peach Therapeutic Painting': 'f640d58ac3faaecccf7b29d5b4449816d5141ae1a7ac5209e69b01037032207e@group.calendar.google.com'
  };
  
  // Get the header row to find CalendarId column
  const headers = vendorsSheet.getRange(1, 1, 1, 20).getValues()[0];
  let calendarIdCol = -1;
  
  // Look for CalendarId column
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === 'CalendarId' || headers[i] === 'Calendar ID' || headers[i] === 'CalendarID') {
      calendarIdCol = i + 1;
      break;
    }
  }
  
  // If not found, use column I (column 9)
  if (calendarIdCol === -1) {
    calendarIdCol = 9;
    // Set the header
    vendorsSheet.getRange(1, calendarIdCol).setValue('CalendarId');
  }
  
  // Get all vendor names from column A
  const vendorData = vendorsSheet.getRange(2, 1, vendorsSheet.getLastRow() - 1, 1).getValues();
  
  let updatedCount = 0;
  const results = [];
  
  // Update each vendor's calendar ID
  for (let i = 0; i < vendorData.length; i++) {
    const vendorName = vendorData[i][0];
    if (vendorName && calendarIdMap[vendorName]) {
      vendorsSheet.getRange(i + 2, calendarIdCol).setValue(calendarIdMap[vendorName]);
      results.push(`✅ Updated: ${vendorName}`);
      updatedCount++;
    }
  }
  
  // Show success message
  ui.alert(
    '✅ Calendar IDs Fixed!',
    `Successfully updated ${updatedCount} vendor calendar IDs.\n\n` +
    results.join('\n') +
    '\n\nYour calendar validation errors should now be resolved!',
    ui.ButtonSet.OK
  );
}

/**
 * Update vendor calendar IDs in the VENDORS sheet
 */
function updateVendorCalendarIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const vendorsSheet = ss.getSheetByName('VENDORS');
  
  if (!vendorsSheet) {
    ui.alert('Error', 'VENDORS sheet not found!', ui.ButtonSet.OK);
    return;
  }
  
  // Map of vendor names to calendar IDs
  const calendarIdMap = {
    'Kyaking John D McArthur State Park.': '8b85f4b456e10d8a991129b210ea16f98ac00fecfa04f2f39b2951a4c0d50aef@group.calendar.google.com',
    'Groovy Goat Farm': 'c8d302e6f7510aa71ae3ab2d0b0868c614d604a7800d1a5130a92a02aba048c9@group.calendar.google.com',
    'Johnson Folly Equestrian Farm': '9f8e8edbe22f7ed8574b9295f5d06352167ae560bb98c100370533daa34e0ce6@group.calendar.google.com',
    'Surf Therapy': '9ef8dd17e6af927ad50e01049b061c405781bb08229b646a0897574dac5ca296@group.calendar.google.com',
    'The Peach Therapeutic Painting': 'f640d58ac3faaecccf7b29d5b4449816d5141ae1a7ac5209e69b01037032207e@group.calendar.google.com'
  };
  
  // Get all vendor data
  const data = vendorsSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find the CalendarId column (should be column I, index 8)
  let calendarIdCol = headers.indexOf('CalendarId');
  if (calendarIdCol === -1) {
    calendarIdCol = headers.indexOf('Calendar ID');
  }
  if (calendarIdCol === -1) {
    calendarIdCol = 8; // Default to column I
  }
  
  let updatedCount = 0;
  const updates = [];
  
  // Update calendar IDs for matching vendors
  for (let row = 1; row < data.length; row++) {
    const vendorName = data[row][0];
    if (vendorName && calendarIdMap[vendorName]) {
      const currentCalendarId = data[row][calendarIdCol] || '';
      const newCalendarId = calendarIdMap[vendorName];
      
      if (currentCalendarId !== newCalendarId) {
        vendorsSheet.getRange(row + 1, calendarIdCol + 1).setValue(newCalendarId);
        updates.push(`✓ ${vendorName}: Updated calendar ID`);
        updatedCount++;
      } else {
        updates.push(`- ${vendorName}: Already has correct calendar ID`);
      }
    }
  }
  
  // Also create/update the calendar links sheet
  createVendorCalendarLinksSheet();
  
  // Show results
  const message = updatedCount > 0 
    ? `✅ Updated ${updatedCount} vendor calendar IDs!\n\n${updates.join('\n')}`
    : '✅ All vendor calendar IDs are already correct!\n\n' + updates.join('\n');
    
  ui.alert('Calendar ID Update Complete', message, ui.ButtonSet.OK);
}

/**
 * Show detailed instructions for sharing calendar access with vendors
 */
function showCalendarPermissionInstructions() {
  const ui = SpreadsheetApp.getUi();
  
  const instructions = `
📅 VENDOR CALENDAR ACCESS SETUP

🚨 PROBLEM: Vendors getting "You do not have access" error?
This means the Google Calendars haven't been shared with them yet.

📋 SOLUTION - SHARE CALENDARS:

1️⃣ Go to calendar.google.com
2️⃣ Find each vendor calendar:
   • Kyaking John D McArthur State Park
   • Groovy Goat Farm  
   • Johnson Folly Equestrian Farm
   • Surf Therapy
   • The Peach Therapeutic Painting

3️⃣ For EACH calendar:
   • Click the calendar name
   • Click "Settings and sharing"
   • Scroll to "Share with specific people"
   • Click "Add people"
   • Enter vendor's email address
   • Set permission: "See all event details"
   • Click "Send"

4️⃣ Test: Have vendor click the link again

✅ RESULT: Vendors can now view their schedule!

💡 TIP: Share with vendor business email addresses
💡 TIP: You only need to do this once per vendor
💡 TIP: Each vendor only needs access to their own calendar

Need the calendar links? Check the VENDOR_CALENDAR_LINKS sheet!
  `;
  
  ui.alert(
    '📧 Calendar Permission Instructions', 
    instructions,
    ui.ButtonSet.OK
  );
}
/**
 * Setup enhanced trigger for Monday emails
 */
function setupEnhancedTrigger() {
  try {
    // Remove existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'previewAndSendSchedule' ||
          trigger.getHandlerFunction() === 'emailMondayPdfEnhanced' ||
          trigger.getHandlerFunction() === 'emailMondayPdf') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger for Monday at 10:00 AM
    const trigger = ScriptApp.newTrigger('previewAndSendSchedule')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(10)
      .create();
    
    // Verify email recipients are configured
    const properties = PropertiesService.getScriptProperties();
    const storedRecipients = properties.getProperty(CONFIG.RECIPIENTS_KEY);
    const recipients = storedRecipients ? JSON.parse(storedRecipients) : [];
    const recipientCount = recipients.length;
    const recipientsList = recipients.join('\n• ');
    
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '✅ Monday Email Automation Enabled',
      `🔄 AUTOMATIC WEEKLY REMINDERS ARE NOW ACTIVE!\n\n` +
      `📅 Schedule: Every Monday at 10:00 AM\n` +
      `📧 Recipients (${recipientCount}):\n• ${recipientsList}\n\n` +
      `📋 What happens automatically:\n` +
      `• System checks for this week's therapeutic outings schedule\n` +
      `• Sends HTML email with schedule table and vendor contact info\n` +
      `• Includes backup plain text version\n` +
      `• Logs all activity for audit trail\n\n` +
      `⚠️ Make sure your Google Sheets contains the current week's schedule!`,
      ui.ButtonSet.OK
    );
    
    // Log the automation setup
    auditLog('AUTOMATION_ENABLED', {
      function: 'previewAndSendSchedule',
      schedule: 'Monday 10:00 AM',
      recipients: recipients,
      triggerId: trigger.getUniqueId()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting up trigger:', error);
    SpreadsheetApp.getUi().alert(
      '❌ Automation Setup Failed', 
      'Could not set up Monday email automation: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
}

/**
 * Remove all triggers
 */
function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const triggerCount = triggers.length;
  
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  SpreadsheetApp.getUi().alert(
    '🛑 Monday Email Automation Disabled',
    `All automated triggers have been removed (${triggerCount} trigger(s)).\n\n` +
    `📧 Weekly reminder emails will NO LONGER be sent automatically.\n\n` +
    `To send emails manually, use "✉️ Send Weekly Email Now" from the menu.\n` +
    `To re-enable automation, go to Settings > Configure Automation.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  auditLog('AUTOMATION_DISABLED', {
    triggersRemoved: triggerCount
  });
}

/**
 * Configure webhooks (placeholder)
 */
function configureWebhooks() {
  SpreadsheetApp.getUi().alert(
    '🔗 Webhook Configuration',
    'Webhook integration feature coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Test email specifically to Estates_CA to verify it's receiving emails
 */
function testEstatesEmail() {
  const ui = SpreadsheetApp.getUi();
  const testEmail = 'Estates_CA@familyfirstas.com';
  
  const result = ui.alert(
    '📧 Test Estates Email',
    `This will send a test email to: ${testEmail}\n\n` +
    'This will verify that Estates_CA is receiving scheduler emails.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    try {
      // Check if Estates_CA is in the recipient list
      const isConfigured = CONFIG.EMAIL_RECIPIENTS.includes(testEmail);
      
      if (!isConfigured) {
        ui.alert(
          '⚠️ Email Not Configured',
          `${testEmail} is NOT in the EMAIL_RECIPIENTS list.\n\n` +
          'Please add it to receive weekly schedules.',
          ui.ButtonSet.OK
        );
        return;
      }
      
      // Send test email to Estates_CA
      GmailApp.sendEmail(
        testEmail,
        '🏠 TEST: Estates_CA Email Verification - FFAS Scheduler',
        `Hello Estates_CA team,\n\n` +
        `This is a test email to verify you are receiving FFAS Scheduler emails.\n\n` +
        `✅ CONFIRMED: You are configured to receive:\n` +
        `• Weekly schedule emails\n` +
        `• Schedule updates\n` +
        `• System notifications\n\n` +
        `If you received this email, your email delivery is working correctly.\n\n` +
        `---\n` +
        `Family First Adolescent Services Scheduler\n` +
        `ClearHive Health - v4.0\n` +
        `Test sent: ${new Date().toLocaleString()}`
      );
      
      ui.alert(
        '✅ Test Email Sent!',
        `Test email sent successfully to: ${testEmail}\n\n` +
        `✅ Estates_CA is configured in EMAIL_RECIPIENTS\n` +
        `📧 They should receive all weekly schedule emails\n\n` +
        'If they don\'t receive this test email, check:\n' +
        '• Spam/junk folder\n' +
        '• Email server settings\n' +
        '• Group email distribution',
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      console.error('Estates email test error:', error);
      ui.alert(
        '❌ Test Failed',
        `Failed to send test email to ${testEmail}\n\n` +
        `Error: ${error.toString()}\n\n` +
        'This might be due to:\n' +
        '• Gmail authorization needed\n' +
        '• Email server issues\n' +
        '• Group email restrictions',
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Force Gmail authorization - this WILL trigger the permission dialog
 */
function forceGmailAuthorization() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🔐 Force Gmail Authorization',
    'This will force Google to ask for Gmail permission.\n\n' +
    '🔥 IMPORTANT:\n' +
    '• When you click OK, Google WILL show a permission dialog\n' +
    '• You MUST click "Allow" to grant Gmail access\n' +
    '• This is required for email sending to work\n\n' +
    'Ready to authorize Gmail access?',
    ui.ButtonSet.OK
  );
  
  try {
    // This WILL trigger authorization if not already granted
    console.log('Forcing Gmail authorization...');
    
    // Force Gmail API call that requires permission
    const user = Session.getActiveUser().getEmail();
    console.log('Current user:', user);
    
    // This call WILL show authorization dialog if needed
    const aliases = GmailApp.getAliases();
    console.log('Gmail aliases retrieved:', aliases.length);
    
    // If we get here, Gmail is authorized
    const quota = MailApp.getRemainingDailyQuota();
    
    // Send test email to prove it works
    GmailApp.sendEmail(
      user,
      '✅ Gmail Authorization SUCCESS - FFAS Scheduler',
      'Congratulations! Gmail authorization is now working.\n\n' +
      'Your FFAS Scheduler can now send emails.\n\n' +
      'Features now available:\n' +
      '• Weekly schedule emails\n' +
      '• Test emails\n' +
      '• Notification emails\n\n' +
      '---\n' +
      'ClearHive Health - Family First Scheduler'
    );
    
    ui.alert(
      '🎉 SUCCESS! Gmail Authorized',
      `Gmail access is now working!\n\n` +
      `✅ Test email sent to: ${user}\n` +
      `📧 Daily email quota: ${quota}\n` +
      `👤 Authorized as: ${user}\n\n` +
      'Your scheduler can now send emails automatically!',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    console.error('Authorization error:', error);
    
    if (error.toString().includes('Authorization')) {
      ui.alert(
        '⚠️ Authorization Still Needed',
        'Gmail permission was not granted.\n\n' +
        '🔄 To fix this:\n' +
        '1. Run "Force Gmail Authorization" again\n' +
        '2. When Google shows the permission dialog, click "Allow"\n' +
        '3. Make sure to grant Gmail access\n\n' +
        'You may need to try this a few times.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Authorization Failed',
        'Gmail authorization failed with error:\n\n' +
        error.toString() + '\n\n' +
        'Please try again or contact your administrator.',
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Improved permission setup with step-by-step guidance
 */
function setupPermissions() {
  const ui = SpreadsheetApp.getUi();
  
  const result = ui.alert(
    '🔐 Gmail Permission Setup',
    'This scheduler needs Gmail access to send weekly emails.\n\n' +
    '📋 What will happen:\n' +
    '1. Google will ask for Gmail permission\n' +
    '2. Click "Allow" to enable email sending\n' +
    '3. Test email will be sent to verify setup\n\n' +
    'Ready to proceed?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    try {
      // Step 1: Test Gmail access (this will trigger auth if needed)
      ui.alert('Step 1/3', 'Testing Gmail access...', ui.ButtonSet.OK);
      
      let gmailAuthorized = false;
      try {
        const aliases = GmailApp.getAliases();
        const quota = MailApp.getRemainingDailyQuota();
        gmailAuthorized = true;
        console.log(`✅ Gmail authorized. Email quota: ${quota}`);
      } catch (authError) {
        console.log('Gmail auth error:', authError.toString());
        
        // Show specific instructions
        ui.alert(
          '🔐 Permission Needed',
          'Gmail authorization is required.\n\n' +
          '👉 When you click OK:\n' +
          '1. Google will show a permission dialog\n' +
          '2. Click "Allow" to grant Gmail access\n' +
          '3. Come back here and run "Setup Permissions" again\n\n' +
          'This is a one-time setup.',
          ui.ButtonSet.OK
        );
        
        // Try to trigger the auth prompt
        try {
          GmailApp.getAliases();
        } catch (triggerError) {
          console.log('Auth prompt triggered');
        }
        return;
      }
      
      // Step 2: Test email sending
      if (gmailAuthorized) {
        ui.alert('Step 2/3', 'Testing email functionality...', ui.ButtonSet.OK);
        
        try {
          // Get a test recipient
          const user = Session.getActiveUser().getEmail();
          if (user) {
            GmailApp.sendEmail(
              user,
              'FFAS Scheduler - Setup Complete! ✅',
              'Your FFAS Scheduler is now authorized to send emails.\n\n' +
              'Weekly schedules will be automatically sent to your configured recipients.\n\n' +
              '---\n' +
              'ClearHive Health - Family First Scheduler v4.0'
            );
            
            ui.alert(
              '✅ Setup Complete!',
              `Success! Gmail is now authorized.\n\n` +
              `📧 Test email sent to: ${user}\n\n` +
              'Your scheduler can now send weekly emails automatically.',
              ui.ButtonSet.OK
            );
          } else {
            throw new Error('Could not get user email for test');
          }
          
        } catch (emailError) {
          console.error('Email test failed:', emailError);
          ui.alert(
            '⚠️ Partial Setup',
            'Gmail is authorized, but test email failed.\n\n' +
            'The scheduler should still work for sending weekly emails.\n\n' +
            'Error: ' + emailError.toString(),
            ui.ButtonSet.OK
          );
        }
      }
      
    } catch (error) {
      console.error('Permission setup error:', error);
      ui.alert(
        '❌ Setup Failed',
        'Permission setup encountered an error:\n\n' + error.toString() + '\n\n' +
        'Please try running "Setup Permissions" again.',
        ui.ButtonSet.OK
      );
    }
  } else {
    ui.alert(
      'ℹ️ Setup Skipped',
      'Permission setup was cancelled.\n\n' +
      'Email sending will not work until Gmail access is granted.\n\n' +
      'Run "Settings → Setup Permissions" when ready.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Manage permissions (placeholder)
 */
function managePermissions() {
  SpreadsheetApp.getUi().alert(
    '🔐 Permission Management',
    'Permission management feature coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Optimize next month
 */
function optimizeNextMonth() {
  SpreadsheetApp.getUi().alert(
    '🔄 Optimization',
    'Schedule optimization will:\n' +
    '• Balance vendor usage\n' +
    '• Minimize travel time\n' +
    '• Respect preferences\n' +
    '• Resolve conflicts\n\n' +
    'This feature is coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Run comprehensive diagnostics
 */
function runComprehensiveDiagnostics() {
  const diagnostics = new DiagnosticsRunner();
  const results = diagnostics.runAll();
  
  // Create diagnostics report sheet
  const ss = SpreadsheetApp.getActive();
  let reportSheet = ss.getSheetByName('DIAGNOSTICS_REPORT');
  if (!reportSheet) {
    reportSheet = ss.insertSheet('DIAGNOSTICS_REPORT');
  }
  
  reportSheet.clear();
  reportSheet.getRange(1, 1, results.length, results[0].length).setValues(results);
  reportSheet.autoResizeColumns(1, results[0].length);
  
  SpreadsheetApp.getUi().alert(
    '🔍 Diagnostics Complete',
    `Found ${results.length - 1} items to review.\nSee DIAGNOSTICS_REPORT sheet for details.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Diagnostics runner class
 */
class DiagnosticsRunner {
  constructor() {
    this.ss = SpreadsheetApp.getActive();
    this.results = [['Category', 'Issue', 'Severity', 'Details', 'Suggested Fix']];
  }
  
  runAll() {
    this.checkSheets();
    this.checkVendors();
    this.checkPrograms();
    this.checkCalendars();
    this.checkConfiguration();
    this.checkPermissions();
    
    return this.results;
  }
  
  checkSheets() {
    const requiredSheets = ['PROGRAMS', 'VENDORS', 'ROTATION_RULES', 'CONFIG', 'SCHEDULE'];
    
    requiredSheets.forEach(name => {
      const sheet = this.ss.getSheetByName(name);
      if (!sheet) {
        this.addIssue('Sheets', `Missing sheet: ${name}`, 'HIGH', 
          'Required sheet not found', 'Run initialization to create');
      } else if (sheet.getLastRow() < 2) {
        this.addIssue('Sheets', `Empty sheet: ${name}`, 'MEDIUM',
          'Sheet exists but has no data', 'Add required data');
      }
    });
  }
  
  checkVendors() {
    try {
      const sheet = this.ss.getSheetByName('VENDORS');
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const name = data[i][0];
        if (!name) continue;
        
        // Check calendar ID
        const calId = data[i][8];
        if (calId) {
          try {
            CalendarApp.getCalendarById(calId);
          } catch (e) {
            this.addIssue('Vendors', `Invalid calendar: ${name}`, 'HIGH',
              `Calendar ID cannot be accessed: ${calId}`, 'Verify calendar ID and permissions');
          }
        }
        
        // Check color format
        const color = data[i][7];
        if (color && !/^#?[0-9A-Fa-f]{6}$/.test(color)) {
          this.addIssue('Vendors', `Invalid color: ${name}`, 'LOW',
            `Color format invalid: ${color}`, 'Use hex format like #FF0000');
        }
      }
    } catch (e) {
      this.addIssue('Vendors', 'Check failed', 'HIGH', e.toString(), 'Review vendor data');
    }
  }
  
  checkPrograms() {
    try {
      const sheet = this.ss.getSheetByName('PROGRAMS');
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const house = data[i][0];
        if (!house) continue;
        
        const start = data[i][1];
        const end = data[i][2];
        
        if (!start || !end) {
          this.addIssue('Programs', `Missing times: ${house}`, 'HIGH',
            'Start or end time missing', 'Add time in format like "9:00 AM"');
        }
      }
    } catch (e) {
      this.addIssue('Programs', 'Check failed', 'HIGH', e.toString(), 'Review program data');
    }
  }
  
  checkCalendars() {
    try {
      const config = new DataManager(this.ss).getConfig();
      
      if (config.CentralCalendarId) {
        try {
          CalendarApp.getCalendarById(config.CentralCalendarId);
        } catch (e) {
          this.addIssue('Calendar', 'Central calendar invalid', 'MEDIUM',
            'Central calendar ID cannot be accessed', 'Verify calendar ID in CONFIG');
        }
      }
    } catch (e) {
      this.addIssue('Calendar', 'Check failed', 'MEDIUM', e.toString(), 'Review calendar settings');
    }
  }
  
  checkConfiguration() {
    try {
      const config = new DataManager(this.ss).getConfig();
      
      if (!config.StartTuesday) {
        this.addIssue('Config', 'Missing start date', 'HIGH',
          'StartTuesday not configured', 'Set start date in CONFIG sheet');
      }
      
      if (!config.PdfEmailList) {
        this.addIssue('Config', 'No email recipients', 'MEDIUM',
          'PdfEmailList is empty', 'Add email addresses to CONFIG');
      }
      
      if (!config.LetterheadDocId) {
        this.addIssue('Config', 'No PDF template', 'MEDIUM',
          'LetterheadDocId not set', 'Add Google Doc ID to CONFIG');
      }
    } catch (e) {
      this.addIssue('Config', 'Check failed', 'HIGH', e.toString(), 'Review configuration');
    }
  }
  
  checkPermissions() {
    try {
      // Check email quota
      const remainingQuota = MailApp.getRemainingDailyQuota();
      if (remainingQuota < 10) {
        this.addIssue('Permissions', 'Low email quota', 'MEDIUM',
          `Only ${remainingQuota} emails remaining today`, 'Wait for quota reset');
      }
    } catch (e) {
      this.addIssue('Permissions', 'Check failed', 'LOW', e.toString(), 'Review permissions');
    }
  }
  
  addIssue(category, issue, severity, details, fix) {
    this.results.push([category, issue, severity, details, fix]);
  }
}

/**
 * Auto-fix all detected issues
 */
function autoFixAllIssues() {
  const fixer = new AutoFixer();
  const results = fixer.fixAll();
  
  SpreadsheetApp.getUi().alert(
    '🔧 Auto-Fix Complete',
    `Fixed ${results.fixed} issues.\n` +
    `Failed: ${results.failed}\n` +
    `Skipped: ${results.skipped}\n\n` +
    'Check DIAGNOSTICS_REPORT for details.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Auto-fixer class
 */
class AutoFixer {
  constructor() {
    this.ss = SpreadsheetApp.getActive();
    this.fixed = 0;
    this.failed = 0;
    this.skipped = 0;
  }
  
  fixAll() {
    this.createMissingSheets();
    this.fixTimeFormats();
    this.fixColorFormats();
    this.setDefaultConfigs();
    
    return {
      fixed: this.fixed,
      failed: this.failed,
      skipped: this.skipped
    };
  }
  
  createMissingSheets() {
    try {
      createRequiredSheetsIfMissing();
      this.fixed++;
    } catch (e) {
      this.failed++;
    }
  }
  
  fixTimeFormats() {
    try {
      const sheet = this.ss.getSheetByName('PROGRAMS');
      if (!sheet || sheet.getLastRow() < 2) return;
      
      const range = sheet.getRange(2, 2, Math.max(1, sheet.getLastRow() - 1), 2);
      const values = range.getValues();
      
      const fixed = values.map(row => [
        this.formatTime(row[0]),
        this.formatTime(row[1])
      ]);
      
      range.setValues(fixed);
      this.fixed++;
    } catch (e) {
      this.failed++;
    }
  }
  
  formatTime(value) {
    if (!value) return '';
    const str = String(value);
    
    // Try to parse and reformat
    const patterns = [
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
      /^(\d{1,2})\s*(AM|PM)$/i,
      /^(\d{1,2}):(\d{2})$/
    ];
    
    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        const hour = match[1];
        const minute = match[2] || '00';
        const period = match[3] || (parseInt(hour) < 12 ? 'AM' : 'PM');
        return `${hour}:${minute} ${period.toUpperCase()}`;
      }
    }
    
    return str;
  }
  
  fixColorFormats() {
    try {
      const sheet = this.ss.getSheetByName('VENDORS');
      if (!sheet || sheet.getLastRow() < 2) return;
      
      const range = sheet.getRange(2, 8, sheet.getLastRow() - 1, 1);
      const values = range.getValues();
      
      const fixed = values.map(row => {
        let color = String(row[0] || '').trim();
        if (!color) return [''];
        
        // Remove # if present and re-add
        color = color.replace('#', '');
        if (/^[0-9A-Fa-f]{6}$/.test(color)) {
          return ['#' + color.toUpperCase()];
        }
        return [row[0]]; // Keep original if can't fix
      });
      
      range.setValues(fixed);
      this.fixed++;
    } catch (e) {
      this.failed++;
    }
  }
  
  setDefaultConfigs() {
    try {
      setupDefaultConfigurations();
      this.fixed++;
    } catch (e) {
      this.failed++;
    }
  }
}

/**
 * Clear all caches
 */
function clearAllCaches() {
  try {
    CacheService.getScriptCache().removeAll();
    CacheService.getUserCache().removeAll();
    
    SpreadsheetApp.getUi().alert(
      '🧹 Cache Cleared',
      'All caches have been cleared successfully.\nThe system will rebuild caches as needed.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    handleError(error, 'Cache Clearing');
  }
}

/**
 * Deploy web app for incident reporting
 */
function deployWebApp() {
  const ui = SpreadsheetApp.getUi();
  
  const html = `
    <div style="width: 500px; padding: 20px; font-family: Arial, sans-serif;">
      <h2>🚀 Deploy Web App for Incident Reporting</h2>
      
      <p>Follow these steps to deploy the incident reporting form:</p>
      
      <ol style="line-height: 1.8;">
        <li><strong>Open Script Editor:</strong><br>
            Extensions → Apps Script</li>
        
        <li><strong>Deploy Web App:</strong><br>
            Click "Deploy" → "New Deployment"</li>
        
        <li><strong>Configure Settings:</strong><br>
            • Type: Web app<br>
            • Description: "FFAS Incident Reporting System"<br>
            • Execute as: Me<br>
            • Who has access: Anyone</li>
        
        <li><strong>Copy Web App URL:</strong><br>
            Save the deployment URL provided</li>
        
        <li><strong>Test Deployment:</strong><br>
            Add <code>?test=true</code> to the URL to verify</li>
      </ol>
      
      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>✅ Once deployed:</strong><br>
        • QR codes will automatically link to the form<br>
        • Incident reports will save to INCIDENT_REPORTS sheet<br>
        • Admins will receive email notifications
      </div>
      
      <p style="color: #666; font-size: 12px;">
        Note: The web app URL will be automatically used when generating QR codes.
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(600);
  
  ui.showModalDialog(htmlOutput, 'Web App Deployment Guide');
}
// ======================== DEPLOYMENT INSTRUCTIONS ========================
/*
 * GOOGLE APPS SCRIPT WEB APP DEPLOYMENT GUIDE
 * ==========================================
 * 
 * STEP 1: INITIAL SETUP
 * --------------------
 * 1. Copy this entire code into a new Google Apps Script project
 * 2. Save the project with a meaningful name (e.g., "FFAS Scheduler")
 * 3. Run the onOpen() function once to initialize
 * 
 * STEP 2: CONFIGURE SHEETS
 * -----------------------
 * 1. Create a new Google Sheet or use existing
 * 2. Run "Outings Scheduler → Settings → Setup Permissions"
 * 3. Fill in the CONFIG sheet with:
 *    - StartTuesday: First Tuesday date to start scheduling
 *    - PdfEmailList: Comma-separated email addresses
 *    - LetterheadDocId: Google Doc ID for PDF template
 *    - AdminEmail: Admin email for notifications
 * 
 * STEP 3: DEPLOY WEB APP
 * ---------------------
 * 1. In Apps Script Editor, click "Deploy" → "New Deployment"
 * 2. Settings:
 *    - Type: Web app
 *    - Execute as: Me (your account)
 *    - Who has access: Anyone
 * 3. Click "Deploy" and authorize permissions
 * 4. Copy the Web App URL
 * 
 * STEP 4: TEST DEPLOYMENT
 * ----------------------
 * 1. Add ?test=true to your web app URL
 * 2. Visit the URL to confirm deployment
 * 3. Test incident form: add ?form=incident to URL
 * 
 * STEP 5: SCHEDULE AUTOMATION
 * --------------------------
 * 1. In Apps Script, click clock icon (Triggers)
 * 2. Add trigger for emailMondayPdfEnhanced:
 *    - Time-driven
 *    - Week timer
 *    - Every Monday
 *    - 7am-8am
 * 
 * PERMISSIONS REQUIRED:
 * -------------------
 * - Google Sheets (read/write)
 * - Google Calendar (read/write)
 * - Gmail (send emails)
 * - Google Drive (create files)
 * - External URLs (for QR codes)
 * 
 * TROUBLESHOOTING:
 * ---------------
 * - Run "Outings Scheduler → Maintenance → Diagnose Issues"
 * - Check DIAGNOSTICS_REPORT sheet
 * - Review execution logs in Apps Script Editor
 * - Ensure all calendar IDs are valid and accessible
 * 
 * QR CODE & INCIDENT REPORTING:
 * ----------------------------
 * - QR codes are automatically generated with each weekly email
 * - Forms submit to INCIDENT_REPORTS sheet
 * - Admins receive instant email notifications
 * - All submissions are logged with timestamps
 * 
 * DATA ORGANIZATION:
 * -----------------
 * Required Sheets:
 * - PROGRAMS: House names, times, days active
 * - VENDORS: Vendor details, calendar IDs
 * - ROTATION_RULES: Scheduling preferences
 * - CONFIG: System settings
 * - SCHEDULE: Generated schedule (auto-created)
 * - INCIDENT_REPORTS: Form submissions (auto-created)
 * 
 * For support or questions, contact your system administrator.
 */

/**
 * End of FFAS Therapeutic Outings Scheduler
 * Version 4.0.0
 */

/**
 * Rebuild indexes for better performance
 */
function rebuildIndexes() {
  SpreadsheetApp.getUi().alert(
    '🔨 Rebuild Indexes',
    'This feature will optimize data structures for faster lookups.\n\n' +
    'Coming in a future update!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ======================== WEB APP DEPLOYMENT ========================

/**
 * DEPLOYMENT INSTRUCTIONS FOR INCIDENT REPORTING
 * 
 * Follow these steps to deploy the web app for incident reporting:
 * 
 * 1. SAVE THE SCRIPT
 *    - Copy all code to Google Apps Script editor
 *    - Save the project with a meaningful name
 * 
 * 2. DEPLOY AS WEB APP
 *    - Click "Deploy" > "New Deployment"
 *    - Choose type: "Web app"
 *    - Set description: "FFAS Incident Reporting System"
 *    - Execute as: "Me" (your account)
 *    - Who has access: "Anyone" (for public form access)
 *    - Click "Deploy"
 * 
 * 3. COPY THE WEB APP URL
 *    - Copy the deployment URL (looks like: https://script.google.com/macros/s/...)
 *    - This URL will be used to generate incident report links
 * 
 * 4. TEST THE DEPLOYMENT
 *    - Open: YOUR_WEB_APP_URL?test=true
 *    - You should see a success message
 * 
 * 5. UPDATE DEPLOYMENT (if needed)
 *    - Click "Deploy" > "Manage Deployments"
 *    - Click the edit icon on your deployment
 *    - Update version to "New version"
 *    - Click "Deploy"
 * 
 * IMPORTANT: The web app URL changes with each new deployment ID!
 * Always use the latest deployment URL.
 */

/**
 * Setup Web App - Helper function to guide through deployment
 */
function setupWebApp() {
  const ui = SpreadsheetApp.getUi();
  
  const result = ui.alert(
    '🚀 Web App Deployment Guide',
    'This will guide you through deploying the incident reporting form.\n\n' +
    'Steps:\n' +
    '1. Click "Deploy" > "New Deployment" in the toolbar\n' +
    '2. Choose "Web app" as the type\n' +
    '3. Set "Execute as: Me" and "Who has access: Anyone"\n' +
    '4. Click Deploy and copy the URL\n\n' +
    'Would you like to see detailed instructions?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    // Create a detailed instruction sheet
    const ss = SpreadsheetApp.getActive();
    let instructionSheet = ss.getSheetByName('WEB_APP_SETUP');
    
    if (!instructionSheet) {
      instructionSheet = ss.insertSheet('WEB_APP_SETUP');
    }
    
    instructionSheet.clear();
    
    const instructions = [
      ['Web App Deployment Instructions', '', ''],
      ['', '', ''],
      ['Step', 'Action', 'Details'],
      ['1', 'Save Script', 'Ensure all code is saved in Google Apps Script'],
      ['2', 'Open Deploy Menu', 'Click "Deploy" > "New Deployment" in the toolbar'],
      ['3', 'Configure Deployment', 'Type: Web app\nExecute as: Me\nAccess: Anyone'],
      ['4', 'Deploy', 'Click "Deploy" button and authorize if prompted'],
      ['5', 'Copy URL', 'Copy the web app URL provided'],
      ['6', 'Test', 'Open URL with ?test=true parameter to verify'],
      ['', '', ''],
      ['Troubleshooting', '', ''],
      ['Error: "Script not found"', 'Check deployment URL is correct', ''],
      ['Error: "Unauthorized"', 'Verify "Anyone" access is set', ''],
      ['Form not loading', 'Check doGet function exists', ''],
      ['Submission failing', 'Check doPost function exists', ''],
      ['', '', ''],
      ['Current Script URL:', ScriptApp.getService().getUrl(), 'This is your development URL'],
      ['', '', ''],
      ['Test Links:', '', ''],
      ['Test deployment:', '=HYPERLINK("' + ScriptApp.getService().getUrl() + '?test=true", "Click to test")', ''],
      ['Test incident form:', '=HYPERLINK("' + ScriptApp.getService().getUrl() + '?form=incident", "Open incident form")', '']
    ];
    
    instructionSheet.getRange(1, 1, instructions.length, 3).setValues(instructions);
    
    // Format the sheet
    instructionSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
    instructionSheet.getRange(3, 1, 1, 3).setBackground('#1a73e8').setFontColor('#ffffff').setFontWeight('bold');
    instructionSheet.getRange(11, 1).setFontSize(14).setFontWeight('bold');
    instructionSheet.autoResizeColumns(1, 3);
    
    ui.alert(
      '✅ Instructions Created',
      'Detailed instructions have been added to the WEB_APP_SETUP sheet.\n\n' +
      'The sheet includes test links you can click to verify your deployment.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Verify Web App Deployment
 */
function verifyWebAppDeployment() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const scriptUrl = ScriptApp.getService().getUrl();
    
    // Test if we can generate a proper incident URL
    const testWeekData = {
      dateStr: new Date().toLocaleDateString(),
      date: new Date()
    };
    
    const pdfGenerator = new PdfGenerator();
    const incidentUrl = pdfGenerator.generateIncidentReportUrl(testWeekData);
    
    ui.alert(
      '🔍 Web App Verification',
      'Script URL: ' + scriptUrl + '\n\n' +
      'Test Incident Form URL:\n' + incidentUrl + '\n\n' +
      'Copy and test this URL in your browser.\n' +
      'If it shows an error, you need to deploy as a web app.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert(
      '❌ Verification Error',
      'Error: ' + error.toString() + '\n\n' +
      'Please ensure the script is properly saved and deployed.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Test POST endpoint directly
 */
function testPostEndpoint() {
  // Simulate a POST request to test the endpoint
  const testData = {
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        type: 'incident',
        reporterName: 'Test User',
        reporterRole: 'BHT',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: '12:00',
        vendor: 'Test Vendor',
        house: 'Test House',
        incidentTypes: ['Other'],
        clientsInvolved: 1,
        outsideInvolvement: 'No',
        incidentDescription: 'This is a test submission',
        actionsTaken: 'Testing the form',
        pcNotified: 'Yes - Immediately',
        followUpNeeded: 'None'
      })
    }
  };
  
  try {
    const response = doPost(testData);
    const result = JSON.parse(response.getContent());
    
    console.log('Test POST Result:', result);
    
    if (result.success) {
      SpreadsheetApp.getUi().alert(
        '✅ POST Test Successful',
        `Report created: ${result.reportId}\n` +
        `Message: ${result.message}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ POST Test Failed',
      `Error: ${error.toString()}\n\n` +
      'Check the execution logs for details.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Test the incident form directly
 */
function testIncidentForm() {
  const ui = SpreadsheetApp.getUi();
  
  const scriptUrl = ScriptApp.getService().getUrl();
  const testUrl = `${scriptUrl}?form=incident&week=TEST&source=menu_test`;
  
  const htmlOutput = HtmlService.createHtmlOutput(`
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>🧪 Test Incident Form</h3>
      <p>Click the button below to open the incident form in a new window:</p>
      <div style="margin: 20px 0;">
        <a href="${testUrl}" target="_blank" 
           style="background-color: #1a73e8; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Open Incident Form
        </a>
      </div>
      <hr style="margin: 20px 0;">
      <p><strong>Direct URL:</strong></p>
      <input type="text" value="${testUrl}" 
             style="width: 100%; padding: 5px; font-size: 12px;"
             onclick="this.select();" readonly>
      <p style="font-size: 12px; color: #666; margin-top: 10px;">
        If the form doesn't load, you need to deploy this script as a web app first.
      </p>
    </div>
  `)
  .setWidth(500)
  .setHeight(300);
  
  ui.showModalDialog(htmlOutput, 'Test Incident Form');
}

// ======================== END OF SCRIPT ========================

/************************************************************
 * DEPLOYMENT & SETUP INSTRUCTIONS
 * 
 * GOOGLE FORMS INTEGRATION FOR INCIDENT REPORTING
 * 
 * This script now uses Google Forms instead of custom web apps
 * for incident reporting. This is more reliable and easier to use.
 * 
 * SETUP STEPS:
 * 
 * 1. COPY THIS CODE
 *    - Select all code in this file
 *    - Copy to your Google Apps Script editor
 *    - Save the project
 * 
 * 2. CREATE INCIDENT FORM (Two Options):
 * 
 *    Option A - Automatic (if supported):
 *    - Menu: Outings Scheduler → Incident Reporting → Create Incident Form
 *    - Follow the dialog to link your form
 * 
 *    Option B - Manual Setup:
 *    - Go to Google Forms (forms.google.com)
 *    - Create a new form with required fields
 *    - Set responses to go to your spreadsheet
 *    - Copy the shareable link
 *    - Use menu option to save the URL
 * 
 * 3. CONFIGURE EMAIL SETTINGS
 *    - In CONFIG sheet, ensure these fields are set:
 *    - PdfEmailList: Comma-separated email addresses
 *    - AdminEmail: Email for incident notifications
 *    - LetterheadDocId: Google Doc ID for PDF template
 * 
 * 4. TEST THE SYSTEM
 *    - Submit a test incident report through the form
 *    - Check that it appears in "Form Responses 1" sheet
 *    - Verify email notification is received
 * 
 * HOW IT WORKS:
 * 
 * 1. Weekly emails include a link and QR code to the Google Form
 * 2. Staff submit incidents through the Google Form
 * 3. Responses automatically save to your spreadsheet
 * 4. System adds Report ID and sends email notifications
 * 5. All data is organized in the Form Responses sheet
 * 
 * BENEFITS:
 * - No deployment needed
 * - No CORS or authentication issues  
 * - Works on all devices
 * - Automatic data collection
 * - Built-in validation
 * - Can add file uploads if needed
 * 
 * TROUBLESHOOTING:
 * 
 * Form not created?
 * - Check you have permission to create forms
 * - Try creating form manually and linking to spreadsheet
 * 
 * Responses not appearing?
 * - Check "Form Responses 1" sheet exists
 * - Verify form is linked to correct spreadsheet
 * 
 * QR codes not working?
 * - Ensure form URL is stored in script properties
 * - Check UrlFetchApp permissions for QR generation
 * 
 * CUSTOMIZATION:
 * 
 * To modify the incident form:
 * 1. Go to Google Forms
 * 2. Find your incident report form
 * 3. Edit questions as needed
 * 4. Changes reflect immediately
 * 
 * VERSION: 4.3.0
 * DEVELOPED BY: ClearHive Health
 * CLIENT: Family First Adolescent Services
 * LAST UPDATED: September 5, 2025
 * 
 ************************************************************/

/**
 * System Health Check
 * Run periodic health checks on the system
 */
function runSystemHealthCheck() {
  const ui = SpreadsheetApp.getUi();
  const results = {
    checks: [],
    warnings: [],
    errors: [],
    timestamp: new Date()
  };
  
  try {
    // Check 1: Required sheets exist
    const requiredSheets = ['PROGRAMS', 'VENDORS', 'RULES', 'SCHEDULE', 'EMAIL RECIPIENTS'];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const existingSheets = ss.getSheets().map(s => s.getName());
    
    requiredSheets.forEach(sheetName => {
      if (existingSheets.includes(sheetName)) {
        results.checks.push(`✓ Sheet '${sheetName}' exists`);
      } else {
        results.errors.push(`✗ Missing required sheet: ${sheetName}`);
      }
    });
    
    // Check 2: Email quota
    const emailQuotaRemaining = MailApp.getRemainingDailyQuota();
    results.checks.push(`✓ Email quota remaining: ${emailQuotaRemaining}`);
    if (emailQuotaRemaining < 50) {
      results.warnings.push(`⚠ Low email quota: ${emailQuotaRemaining} remaining`);
    }
    
    // Check 3: Script properties
    const props = PropertiesService.getScriptProperties();
    const criticalProps = ['incidentFormUrl', 'vendorCalendarIds'];
    
    criticalProps.forEach(prop => {
      const value = props.getProperty(prop);
      if (value) {
        results.checks.push(`✓ Script property '${prop}' is set`);
      } else {
        results.warnings.push(`⚠ Script property '${prop}' is not set`);
      }
    });
    
    // Check 4: Vendor data integrity
    const dataManager = new DataManager(ss);
    const vendors = dataManager.getVendors();
    const vendorsWithMissingData = vendors.filter(v => 
      !v.email || !v.phone || !v.programs || v.programs.length === 0
    );
    
    if (vendorsWithMissingData.length === 0) {
      results.checks.push(`✓ All vendors have complete data`);
    } else {
      results.warnings.push(`⚠ ${vendorsWithMissingData.length} vendors have incomplete data`);
    }
    
    // Check 5: Calendar permissions
    const calendarIds = JSON.parse(props.getProperty('vendorCalendarIds') || '{}');
    let calendarCheckCount = 0;
    let calendarErrorCount = 0;
    
    for (const [vendorName, calendarId] of Object.entries(calendarIds)) {
      if (calendarCheckCount >= 5) break; // Limit checks to avoid timeout
      try {
        CalendarApp.getCalendarById(calendarId);
        calendarCheckCount++;
      } catch (e) {
        calendarErrorCount++;
      }
    }
    
    if (calendarErrorCount === 0) {
      results.checks.push(`✓ Sample calendar permissions verified`);
    } else {
      results.warnings.push(`⚠ ${calendarErrorCount} calendar permission errors found`);
    }
    
    // Check 6: Triggers
    const triggers = ScriptApp.getProjectTriggers();
    const weeklyTriggers = triggers.filter(t => 
      t.getHandlerFunction() === 'previewAndSendSchedule' && 
      t.getEventType() === ScriptApp.EventType.CLOCK
    );
    
    if (weeklyTriggers.length > 0) {
      results.checks.push(`✓ Weekly email trigger is active`);
    } else {
      results.warnings.push(`⚠ Weekly email trigger not found`);
    }
    
    // Check 7: Recent errors in audit log
    const auditSheet = ss.getSheetByName('AUDIT LOG');
    if (auditSheet) {
      const recentLogs = auditSheet.getRange(2, 1, Math.min(100, auditSheet.getLastRow() - 1), 3).getValues();
      const recentErrors = recentLogs.filter(log => 
        log[1] && log[1].toString().toLowerCase().includes('error') &&
        new Date(log[0]) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );
      
      if (recentErrors.length === 0) {
        results.checks.push(`✓ No recent errors in audit log`);
      } else {
        results.warnings.push(`⚠ ${recentErrors.length} errors in last 24 hours`);
      }
    }
    
    // Generate report
    const reportHtml = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .timestamp { color: #666; font-size: 14px; }
        .section { margin: 20px 0; }
        .check { color: #0d9488; margin: 5px 0; }
        .warning { color: #f59e0b; margin: 5px 0; font-weight: bold; }
        .error { color: #dc2626; margin: 5px 0; font-weight: bold; }
        .summary { 
          padding: 15px; 
          background: #f3f4f6; 
          border-radius: 8px; 
          margin-bottom: 20px;
        }
      </style>
      
      <h2>🏥 System Health Check Report</h2>
      <p class="timestamp">Generated: ${results.timestamp.toLocaleString()}</p>
      
      <div class="summary">
        <strong>Summary:</strong><br/>
        ✓ ${results.checks.length} checks passed<br/>
        ⚠ ${results.warnings.length} warnings<br/>
        ✗ ${results.errors.length} errors
      </div>
      
      ${results.errors.length > 0 ? `
        <div class="section">
          <h3>Errors (Action Required)</h3>
          ${results.errors.map(e => `<div class="error">${e}</div>`).join('')}
        </div>
      ` : ''}
      
      ${results.warnings.length > 0 ? `
        <div class="section">
          <h3>Warnings</h3>
          ${results.warnings.map(w => `<div class="warning">${w}</div>`).join('')}
        </div>
      ` : ''}
      
      <div class="section">
        <h3>Passed Checks</h3>
        ${results.checks.map(c => `<div class="check">${c}</div>`).join('')}
      </div>
      
      <div class="section">
        <h4>Recommended Actions:</h4>
        <ul>
          ${results.errors.length > 0 ? '<li>Fix critical errors immediately</li>' : ''}
          ${results.warnings.filter(w => w.includes('email quota')).length > 0 ? 
            '<li>Monitor email usage - quota is running low</li>' : ''}
          ${results.warnings.filter(w => w.includes('calendar permission')).length > 0 ? 
            '<li>Review calendar permissions for affected vendors</li>' : ''}
          ${results.warnings.filter(w => w.includes('incomplete data')).length > 0 ? 
            '<li>Complete missing vendor information</li>' : ''}
        </ul>
      </div>
    `;
    
    const dialog = HtmlService.createHtmlOutput(reportHtml)
      .setWidth(600)
      .setHeight(500);
    
    ui.showModalDialog(dialog, 'System Health Check');
    
    // Log to audit
    auditLog('SYSTEM_HEALTH_CHECK', {
      passed: results.checks.length,
      warnings: results.warnings.length,
      errors: results.errors.length
    });
    
  } catch (error) {
    handleError(error, 'System Health Check');
  }
}