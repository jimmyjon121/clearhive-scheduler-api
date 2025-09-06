/**
 * CRITICAL EMAIL FIXES FOR FFAS SCHEDULER
 * 
 * These functions should replace the existing ones in your Google Apps Script
 * to prevent duplicate email sends and improve reliability.
 */

// ======================== FIX 1: PREVENT DUPLICATE SENDS ========================

/**
 * Enhanced email sending with duplicate prevention
 * REPLACE the existing emailMondayPdfEnhanced function with this
 */
function emailMondayPdfEnhanced() {
  const ui = SpreadsheetApp.getUi();
  const cache = CacheService.getScriptCache();
  
  // Check if this is a manual run (has UI) or automated trigger
  const isManualRun = ui !== null;
  
  // Duplicate prevention check
  const lastSentKey = 'LAST_WEEKLY_EMAIL_SENT';
  const lastSent = cache.get(lastSentKey);
  
  if (lastSent && !isManualRun) {
    const lastSentDate = new Date(lastSent);
    const hoursSinceLast = (new Date() - lastSentDate) / (1000 * 60 * 60);
    
    if (hoursSinceLast < 23) { // Prevent sends within 23 hours
      console.log(`Automated email skipped - already sent ${hoursSinceLast.toFixed(1)} hours ago`);
      auditLog('EMAIL_SKIPPED_DUPLICATE', {
        lastSent: lastSentDate,
        hoursSince: hoursSinceLast
      });
      return;
    }
  }
  
  // Manual run confirmation
  if (isManualRun) {
    const recipients = CONFIG.EMAIL_RECIPIENTS;
    const response = ui.alert(
      '📧 Send Weekly Schedule Email',
      `This will send the therapeutic outings schedule to ${recipients.length} recipients:\n\n` +
      `• ${recipients.slice(0, 3).join('\n• ')}` + 
      (recipients.length > 3 ? `\n• ... and ${recipients.length - 3} more` : '') +
      '\n\nContinue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
  }
  
  try {
    const emailScheduler = new EmailScheduler();
    const result = emailScheduler.generateAndEmail();
    
    if (result.success) {
      // Cache the successful send time
      cache.put(lastSentKey, new Date().toISOString(), 86400); // 24-hour cache
      
      // Log success
      console.log(`Schedule emailed to ${result.recipientCount} recipients`);
      
      if (isManualRun) {
        ui.alert(
          '✅ Email Sent Successfully',
          `Schedule sent to ${result.recipientCount} recipients.\n` +
          `Failed: ${result.results.filter(r => !r.success).length}\n` +
          `Check your email for confirmation.`,
          ui.ButtonSet.OK
        );
      }
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    handleError(error, 'Email Schedule');
  }
}

// ======================== FIX 2: SAFER TRIGGER SETUP ========================

/**
 * Enhanced trigger setup with better duplicate prevention
 * REPLACE the existing setupEnhancedTrigger function with this
 */
function setupEnhancedTrigger() {
  try {
    // First, inspect existing triggers
    const allTriggers = ScriptApp.getProjectTriggers();
    const emailTriggers = allTriggers.filter(trigger => 
      trigger.getHandlerFunction() === 'emailMondayPdfEnhanced' ||
      trigger.getHandlerFunction() === 'emailMondayPdf'
    );
    
    console.log(`Found ${emailTriggers.length} existing email triggers`);
    
    // Remove ALL email-related triggers
    let removedCount = 0;
    emailTriggers.forEach(trigger => {
      try {
        console.log(`Removing trigger: ${trigger.getHandlerFunction()} (ID: ${trigger.getUniqueId()})`);
        ScriptApp.deleteTrigger(trigger);
        removedCount++;
      } catch (e) {
        console.error(`Failed to remove trigger: ${e}`);
      }
    });
    
    // Wait a moment to ensure deletions are processed
    Utilities.sleep(1000);
    
    // Create exactly ONE new trigger
    const newTrigger = ScriptApp.newTrigger('emailMondayPdfEnhanced')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(8)
      .nearMinute(0) // More precise timing
      .create();
    
    // Verify the trigger was created
    const verifyTriggers = ScriptApp.getProjectTriggers();
    const mondayTriggers = verifyTriggers.filter(t => 
      t.getHandlerFunction() === 'emailMondayPdfEnhanced'
    );
    
    if (mondayTriggers.length !== 1) {
      throw new Error(`Expected 1 trigger, but found ${mondayTriggers.length}`);
    }
    
    // Show success message
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '✅ Monday Email Automation Enabled',
      `🔄 AUTOMATIC WEEKLY EMAILS ARE NOW ACTIVE!\n\n` +
      `📅 Schedule: Every Monday at 8:00 AM\n` +
      `📧 Recipients: ${CONFIG.EMAIL_RECIPIENTS.length} addresses\n` +
      `🔍 Removed ${removedCount} old trigger(s)\n` +
      `✨ Created 1 new trigger (ID: ${newTrigger.getUniqueId()})\n\n` +
      `⚠️ IMPORTANT: Do not run this setup multiple times!\n` +
      `Use "Inspect Triggers" to verify the setup.`,
      ui.ButtonSet.OK
    );
    
    // Log the setup
    auditLog('TRIGGER_SETUP', {
      removed: removedCount,
      created: 1,
      triggerId: newTrigger.getUniqueId(),
      schedule: 'Monday 8:00 AM'
    });
    
    return true;
    
  } catch (error) {
    console.error('Trigger setup failed:', error);
    SpreadsheetApp.getUi().alert(
      '❌ Automation Setup Failed', 
      `Could not set up email automation:\n${error.toString()}\n\n` +
      'Please check the execution logs for details.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
}

// ======================== FIX 3: TRIGGER INSPECTION ========================

/**
 * NEW FUNCTION: Inspect all triggers to diagnose issues
 * Add this to your script
 */
function inspectAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const ui = SpreadsheetApp.getUi();
  
  if (triggers.length === 0) {
    ui.alert('📋 No Triggers Found', 'There are no triggers set up for this project.', ui.ButtonSet.OK);
    return;
  }
  
  let report = `Total Triggers: ${triggers.length}\n`;
  report += '═'.repeat(50) + '\n\n';
  
  const emailTriggerCount = triggers.filter(t => 
    t.getHandlerFunction().toLowerCase().includes('email')
  ).length;
  
  if (emailTriggerCount > 1) {
    report += `⚠️ WARNING: Found ${emailTriggerCount} email-related triggers!\n`;
    report += 'This could cause duplicate emails.\n\n';
  }
  
  triggers.forEach((trigger, index) => {
    report += `TRIGGER ${index + 1}:\n`;
    report += `• Function: ${trigger.getHandlerFunction()}\n`;
    report += `• Type: ${trigger.getEventType()}\n`;
    report += `• ID: ${trigger.getUniqueId()}\n`;
    
    if (trigger.getTriggerSource() === ScriptApp.TriggerSource.CLOCK) {
      // Time-based trigger details
      if (trigger.getHandlerFunction() === 'emailMondayPdfEnhanced') {
        report += `• Schedule: Weekly (Monday 8:00 AM)\n`;
      }
    }
    report += '\n';
  });
  
  // Create a scrollable HTML dialog for better readability
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: monospace; white-space: pre-wrap; padding: 10px; max-height: 400px; overflow-y: auto;">
      ${report.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <button onclick="google.script.host.close()">Close</button>
    </div>
  `)
  .setWidth(600)
  .setHeight(500);
  
  ui.showModalDialog(html, '🔍 Trigger Inspection Report');
}

// ======================== FIX 4: SAFER EMAIL SENDING ========================

/**
 * Enhanced email scheduler with better error handling
 * UPDATE the sendEmailsWithRetry method in EmailScheduler class
 */
function enhancedSendEmailsWithRetry(recipients, weekData) {
  const results = [];
  const maxRetries = CONFIG.MAX_RETRIES || 3;
  const processedEmails = new Set(); // Track sent emails
  
  for (const recipient of recipients) {
    // Skip if already processed (defensive programming)
    if (processedEmails.has(recipient.toLowerCase())) {
      console.log(`Skipping duplicate recipient: ${recipient}`);
      continue;
    }
    
    let success = false;
    let attempts = 0;
    let lastError = null;
    
    while (!success && attempts < maxRetries) {
      attempts++;
      
      try {
        // Add small delay between recipients to avoid rate limits
        if (results.length > 0) {
          Utilities.sleep(500); // 0.5 second delay
        }
        
        this.sendEmail(recipient, weekData);
        success = true;
        processedEmails.add(recipient.toLowerCase());
        
        console.log(`Email sent successfully to ${recipient} (attempt ${attempts})`);
        
      } catch (error) {
        lastError = error;
        console.error(`Email failed for ${recipient} (attempt ${attempts}):`, error);
        
        if (attempts < maxRetries) {
          const delay = CONFIG.RETRY_DELAY * attempts;
          console.log(`Retrying in ${delay}ms...`);
          Utilities.sleep(delay);
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
  
  // Log summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`Email summary: ${successCount} sent, ${failCount} failed`);
  
  return results;
}

// ======================== FIX 5: MANUAL SAFETY CONTROLS ========================

/**
 * NEW FUNCTION: Emergency stop for all email operations
 * Add this to your script for emergency use
 */
function emergencyStopAllEmails() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '🛑 EMERGENCY STOP',
    'This will:\n' +
    '• Remove ALL triggers\n' +
    '• Clear email cache\n' +
    '• Disable automated emails\n\n' +
    'Are you sure?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    // Remove all triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // Clear all caches
    CacheService.getScriptCache().removeAll();
    
    // Log the emergency stop
    auditLog('EMERGENCY_STOP', {
      triggersRemoved: triggers.length,
      stoppedBy: Session.getActiveUser().getEmail(),
      timestamp: new Date()
    });
    
    ui.alert(
      '✅ Emergency Stop Complete',
      `Removed ${triggers.length} triggers.\n` +
      'All automated emails have been disabled.\n\n' +
      'To re-enable, use Settings → Configure Automation',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ Error', 'Emergency stop failed: ' + error.toString(), ui.ButtonSet.OK);
  }
}

// ======================== MENU UPDATES ========================

/**
 * Add these new menu items to your onOpen function
 */
function addSafetyMenuItems(menu) {
  menu.addSubMenu(ui.createMenu('🛡️ Safety Tools')
    .addItem('🔍 Inspect All Triggers', 'inspectAllTriggers')
    .addItem('🛑 Emergency Stop', 'emergencyStopAllEmails')
    .addItem('📊 View Email History', 'viewEmailHistory')
    .addItem('🧪 Test Single Email', 'testSingleRecipient'))
  .addSeparator();
}

// ======================== IMPLEMENTATION INSTRUCTIONS ========================

/**
 * HOW TO IMPLEMENT THESE FIXES:
 * 
 * 1. IMMEDIATE ACTIONS:
 *    a) Run inspectAllTriggers() to see current state
 *    b) Run emergencyStopAllEmails() if needed
 *    c) Clear all triggers and start fresh
 * 
 * 2. REPLACE FUNCTIONS:
 *    a) Replace emailMondayPdfEnhanced with the enhanced version
 *    b) Replace setupEnhancedTrigger with the safer version
 *    c) Update sendEmailsWithRetry in EmailScheduler class
 * 
 * 3. ADD NEW FUNCTIONS:
 *    a) Add inspectAllTriggers()
 *    b) Add emergencyStopAllEmails()
 *    c) Add the safety menu items
 * 
 * 4. TEST CAREFULLY:
 *    a) Use "Test Email" with a single recipient first
 *    b) Check triggers with inspectAllTriggers()
 *    c) Monitor the execution transcript
 * 
 * 5. PREVENT FUTURE ISSUES:
 *    a) Only ONE person should manage triggers
 *    b) Always inspect triggers before setup
 *    c) Use the emergency stop if anything goes wrong
 *    d) Check audit logs regularly
 */
