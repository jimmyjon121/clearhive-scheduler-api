/**
 * MANUAL EMAIL SEND FOR MISSED MONDAY SCHEDULE
 * Use this when the automatic 8 AM email didn't send
 * 
 * Created: Monday, September 1, 2025 @ 11:43 AM
 */

// ======================== IMMEDIATE SEND FUNCTION ========================

/**
 * Send the weekly schedule email RIGHT NOW with safety checks
 * This is your backup function when the automatic trigger fails
 */
function sendWeeklyEmailNow() {
  const ui = SpreadsheetApp.getUi();
  
  // First, let's check what week we're sending for
  const today = new Date();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  const timeStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'h:mm a');
  
  // Get the recipient count for confirmation
  const recipients = CONFIG.EMAIL_RECIPIENTS || [];
  
  // Safety confirmation dialog
  const response = ui.alert(
    '📧 Send Weekly Schedule Email - Manual Override',
    `Current Time: ${dayName}, ${timeStr}\n\n` +
    `This will send the therapeutic outings schedule to:\n` +
    `✉️ ${recipients.length} recipients\n\n` +
    `Recipients:\n` +
    `• ${recipients.slice(0, 3).join('\n• ')}` +
    (recipients.length > 3 ? `\n• ... and ${recipients.length - 3} more\n` : '\n') +
    `\n⚠️ Are you sure you want to send now?`,
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    ui.alert('Cancelled', 'Email send cancelled.', ui.ButtonSet.OK);
    return;
  }
  
  // Check if we already sent today (duplicate prevention)
  const cache = CacheService.getScriptCache();
  const todayKey = `EMAIL_SENT_${Utilities.formatDate(today, 'GMT', 'yyyy-MM-dd')}`;
  const alreadySent = cache.get(todayKey);
  
  if (alreadySent) {
    const confirmDuplicate = ui.alert(
      '⚠️ Duplicate Warning',
      `Emails may have already been sent today at ${alreadySent}.\n\n` +
      'Send anyway?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirmDuplicate !== ui.Button.YES) {
      return;
    }
  }
  
  // Show progress
  ui.alert('📤 Sending...', 'Please wait while emails are being sent...', ui.ButtonSet.OK);
  
  try {
    // Create email scheduler instance
    const emailScheduler = new EmailScheduler();
    
    // Get this week's data
    const weekData = emailScheduler.getThisWeekData();
    
    if (!weekData) {
      throw new Error('No schedule found for this week. Please ensure the SCHEDULE sheet has data for the current week.');
    }
    
    // Log what we're about to do
    console.log(`Manual email send initiated at ${timeStr}`);
    console.log(`Week: ${weekData.dateStr}`);
    console.log(`Recipients: ${recipients.length}`);
    
    // Send the emails
    const results = emailScheduler.sendEmailsWithRetry(recipients, weekData);
    
    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    // Cache that we sent today
    cache.put(todayKey, timeStr, 86400); // Remember for 24 hours
    
    // Log to audit trail
    auditLog('MANUAL_EMAIL_SEND', {
      time: timeStr,
      weekDate: weekData.dateStr,
      recipients: recipients.length,
      success: successCount,
      failed: failCount,
      sentBy: Session.getActiveUser().getEmail()
    });
    
    // Show results
    let resultMessage = `✅ Emails sent successfully!\n\n`;
    resultMessage += `📊 Results:\n`;
    resultMessage += `• Sent: ${successCount}\n`;
    resultMessage += `• Failed: ${failCount}\n`;
    
    if (failCount > 0) {
      resultMessage += `\n❌ Failed recipients:\n`;
      results.filter(r => !r.success).forEach(r => {
        resultMessage += `• ${r.recipient}: ${r.error}\n`;
      });
    }
    
    ui.alert('✅ Complete', resultMessage, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('Manual email send failed:', error);
    ui.alert(
      '❌ Error',
      `Failed to send emails:\n\n${error.toString()}\n\n` +
      'Please check:\n' +
      '1. SCHEDULE sheet has current week data\n' +
      '2. Email permissions are set up\n' +
      '3. Recipients are configured correctly',
      ui.ButtonSet.OK
    );
  }
}

// ======================== QUICK CHECK FUNCTION ========================

/**
 * Check if emails were already sent today
 */
function checkTodaysEmailStatus() {
  const ui = SpreadsheetApp.getUi();
  const cache = CacheService.getScriptCache();
  const today = new Date();
  const todayKey = `EMAIL_SENT_${Utilities.formatDate(today, 'GMT', 'yyyy-MM-dd')}`;
  
  const sentTime = cache.get(todayKey);
  
  if (sentTime) {
    ui.alert(
      '📧 Email Status',
      `Emails were sent today at ${sentTime}`,
      ui.ButtonSet.OK
    );
  } else {
    // Check trigger status
    const triggers = ScriptApp.getProjectTriggers();
    const emailTrigger = triggers.find(t => t.getHandlerFunction() === 'emailMondayPdfEnhanced');
    
    let message = '❌ No emails sent today.\n\n';
    
    if (emailTrigger) {
      message += '🔄 Automatic trigger is SET UP for Monday 8:00 AM\n';
      message += 'The trigger may have failed or been disabled.\n\n';
    } else {
      message += '⚠️ No automatic trigger found!\n\n';
    }
    
    message += 'Use "Send Weekly Email Now" to send manually.';
    
    ui.alert('📧 Email Status', message, ui.ButtonSet.OK);
  }
}

// ======================== PREVIEW FUNCTION ========================

/**
 * Preview what will be sent before actually sending
 */
function previewEmailBeforeSending() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const emailScheduler = new EmailScheduler();
    const weekData = emailScheduler.getThisWeekData();
    
    if (!weekData) {
      ui.alert('❌ No Data', 'No schedule found for this week.', ui.ButtonSet.OK);
      return;
    }
    
    // Generate preview
    const htmlContent = emailScheduler.createScheduleTableHtml(weekData);
    const subject = `Therapeutic Outings Schedule - ${weekData.dateStr}`;
    
    // Create preview HTML
    const previewHtml = `
      <div style="padding: 20px; max-height: 600px; overflow-y: auto;">
        <h3>Email Preview</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Recipients:</strong> ${CONFIG.EMAIL_RECIPIENTS.length} addresses</p>
        <p><strong>Week:</strong> ${weekData.dateStr}</p>
        <hr>
        <h4>Email Content:</h4>
        <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
          ${htmlContent}
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="google.script.run.sendWeeklyEmailNow(); google.script.host.close();" 
                  style="background: #1a73e8; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            Send This Email
          </button>
          <button onclick="google.script.host.close()" 
                  style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    const htmlOutput = HtmlService.createHtmlOutput(previewHtml)
      .setWidth(800)
      .setHeight(700);
    
    ui.showModalDialog(htmlOutput, '📧 Email Preview');
    
  } catch (error) {
    ui.alert('❌ Error', 'Failed to generate preview: ' + error.toString(), ui.ButtonSet.OK);
  }
}

// ======================== DIAGNOSTIC FUNCTION ========================

/**
 * Diagnose why the automatic email didn't send
 */
function diagnoseEmailIssue() {
  const ui = SpreadsheetApp.getUi();
  const diagnostics = [];
  
  diagnostics.push('🔍 EMAIL SYSTEM DIAGNOSTIC REPORT');
  diagnostics.push('Generated: ' + new Date().toLocaleString());
  diagnostics.push('=' .repeat(50) + '\n');
  
  // 1. Check triggers
  diagnostics.push('1. TRIGGER STATUS:');
  const triggers = ScriptApp.getProjectTriggers();
  const emailTriggers = triggers.filter(t => 
    t.getHandlerFunction().includes('email') || 
    t.getHandlerFunction().includes('Email')
  );
  
  if (emailTriggers.length === 0) {
    diagnostics.push('❌ No email triggers found!');
    diagnostics.push('   → Set up automation in Settings menu');
  } else if (emailTriggers.length > 1) {
    diagnostics.push(`⚠️ Multiple email triggers found (${emailTriggers.length})!`);
    diagnostics.push('   → This could cause duplicate sends');
    emailTriggers.forEach(t => {
      diagnostics.push(`   • ${t.getHandlerFunction()} (ID: ${t.getUniqueId()})`);
    });
  } else {
    diagnostics.push('✅ One email trigger found');
    diagnostics.push(`   • Function: ${emailTriggers[0].getHandlerFunction()}`);
  }
  
  // 2. Check last execution
  diagnostics.push('\n2. LAST EXECUTION:');
  // Note: Can't directly check execution history via Apps Script
  diagnostics.push('   Check manually: Extensions → Apps Script → Executions');
  
  // 3. Check schedule data
  diagnostics.push('\n3. SCHEDULE DATA:');
  try {
    const emailScheduler = new EmailScheduler();
    const weekData = emailScheduler.getThisWeekData();
    if (weekData) {
      diagnostics.push(`✅ Current week data found: ${weekData.dateStr}`);
    } else {
      diagnostics.push('❌ No schedule data for current week!');
    }
  } catch (e) {
    diagnostics.push('❌ Error checking schedule: ' + e.toString());
  }
  
  // 4. Check permissions
  diagnostics.push('\n4. PERMISSIONS:');
  try {
    const testQuota = MailApp.getRemainingDailyQuota();
    diagnostics.push(`✅ Email quota remaining: ${testQuota}`);
  } catch (e) {
    diagnostics.push('❌ No email permissions!');
  }
  
  // 5. Check recipients
  diagnostics.push('\n5. RECIPIENTS:');
  diagnostics.push(`   ${CONFIG.EMAIL_RECIPIENTS.length} configured`);
  
  // Show results
  const htmlContent = `
    <div style="font-family: monospace; white-space: pre-wrap; padding: 20px; max-height: 500px; overflow-y: auto;">
      ${diagnostics.join('\n')}
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <button onclick="google.script.host.close()">Close</button>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(600);
  
  ui.showModalDialog(htmlOutput, '🔍 Email Diagnostic Report');
}

// ======================== MENU ADDITIONS ========================

/**
 * Add these to your onOpen() function menu:
 * 
 * menu.addSeparator()
 *     .addItem('📧 Send Weekly Email NOW', 'sendWeeklyEmailNow')
 *     .addItem('👁️ Preview Email', 'previewEmailBeforeSending')
 *     .addItem('📊 Check Email Status', 'checkTodaysEmailStatus')
 *     .addItem('🔍 Diagnose Email Issue', 'diagnoseEmailIssue')
 *     .addSeparator();
 */

// ======================== INSTRUCTIONS ========================

/**
 * TO SEND THE EMAIL NOW (Monday 11:43 AM):
 * 
 * 1. Copy the sendWeeklyEmailNow() function to your script
 * 2. Run it from the menu or directly
 * 3. Confirm the recipients in the dialog
 * 4. Wait for completion message
 * 
 * TO PREVENT FUTURE MISSES:
 * 
 * 1. Run diagnoseEmailIssue() to see what went wrong
 * 2. Check your triggers with inspectAllTriggers()
 * 3. Re-setup the automation if needed
 * 4. Consider setting up a backup trigger for Monday afternoon
 * 
 * QUICK CHECKLIST:
 * 
 * ✓ Schedule data exists for current week
 * ✓ Email recipients are configured
 * ✓ Gmail permissions are authorized
 * ✓ Only ONE trigger exists for Monday 8 AM
 * ✓ Execution transcript shows no errors
 */
