# FFAS Therapeutic Outings Scheduler - Email Issue Analysis

## Problem: Multiple Emails Sent on Friday

Based on my analysis of the code, I've identified several potential causes for the accidental sending of 5 emails to the entire company:

### 1. **Multiple Triggers May Have Been Created**

The code checks for and removes old triggers with both names:
- `emailMondayPdfEnhanced` (new function)
- `emailMondayPdf` (old function)

**Issue**: If multiple triggers were created accidentally (e.g., by running the setup function multiple times), each trigger would send emails independently.

### 2. **Retry Logic Could Compound the Issue**

The email sending function has retry logic:
```javascript
const maxRetries = CONFIG.MAX_RETRIES; // Set to 3
```

For each recipient, if an email fails, it will retry up to 3 times. However, this shouldn't cause duplicate emails to successful recipients.

### 3. **Large Recipient List**

The CONFIG contains 12 email recipients:
- 9 individual emails
- 3 group emails (Estates_CA@, Cove_CA@, Nest_CA@)

If the trigger fired multiple times, this would multiply: 5 triggers × 12 recipients = 60 emails total.

## Root Cause Analysis

The most likely scenario is that **multiple triggers were created** for the same function. This could happen if:

1. The setup function was run multiple times without properly cleaning up old triggers
2. Different users set up triggers independently
3. The trigger was set to run on Friday instead of Monday (or in addition to Monday)

## Recommended Fixes

### 1. **Add Trigger Duplicate Prevention**

```javascript
function setupEnhancedTrigger() {
  try {
    // Get ALL existing triggers first
    const triggers = ScriptApp.getProjectTriggers();
    const existingEmailTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'emailMondayPdfEnhanced' ||
      trigger.getHandlerFunction() === 'emailMondayPdf'
    );
    
    // Log how many triggers exist
    console.log(`Found ${existingEmailTriggers.length} existing email triggers`);
    
    // Remove ALL email triggers
    existingEmailTriggers.forEach(trigger => {
      console.log(`Removing trigger: ${trigger.getHandlerFunction()} - ${trigger.getUniqueId()}`);
      ScriptApp.deleteTrigger(trigger);
    });
    
    // Only create ONE new trigger
    const trigger = ScriptApp.newTrigger('emailMondayPdfEnhanced')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(8)
      .create();
    
    console.log(`Created new trigger: ${trigger.getUniqueId()}`);
```

### 2. **Add Email Deduplication Check**

Add a check to prevent sending duplicate emails within a time window:

```javascript
function emailMondayPdfEnhanced() {
  const ui = SpreadsheetApp.getUi();
  
  // Check if emails were already sent recently
  const cache = CacheService.getScriptCache();
  const lastSentKey = 'LAST_WEEKLY_EMAIL_SENT';
  const lastSent = cache.get(lastSentKey);
  
  if (lastSent) {
    const lastSentDate = new Date(lastSent);
    const hoursSinceLast = (new Date() - lastSentDate) / (1000 * 60 * 60);
    
    if (hoursSinceLast < 24) {
      console.log(`Emails were already sent ${hoursSinceLast.toFixed(1)} hours ago. Skipping.`);
      return;
    }
  }
  
  try {
    const emailScheduler = new EmailScheduler();
    const result = emailScheduler.generateAndEmail();
    
    // Cache the successful send
    if (result.success) {
      cache.put(lastSentKey, new Date().toISOString(), 86400); // Cache for 24 hours
    }
```

### 3. **Add Trigger Inspection Function**

```javascript
function inspectAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const ui = SpreadsheetApp.getUi();
  
  let message = `Total Triggers: ${triggers.length}\n\n`;
  
  triggers.forEach((trigger, index) => {
    const handler = trigger.getHandlerFunction();
    const type = trigger.getEventType();
    const id = trigger.getUniqueId();
    
    message += `Trigger ${index + 1}:\n`;
    message += `- Function: ${handler}\n`;
    message += `- Type: ${type}\n`;
    message += `- ID: ${id}\n`;
    
    if (trigger.getTriggerSource() === ScriptApp.TriggerSource.CLOCK) {
      message += `- Schedule: ${trigger.getHandlerFunction()}\n`;
    }
    message += '\n';
  });
  
  ui.alert('📋 All Project Triggers', message, ui.ButtonSet.OK);
}
```

### 4. **Add Manual Send Confirmation**

For the manual send function, add a confirmation with recipient count:

```javascript
function emailMondayPdfEnhanced() {
  const ui = SpreadsheetApp.getUi();
  
  // Show confirmation dialog
  const recipients = CONFIG.EMAIL_RECIPIENTS;
  const response = ui.alert(
    '📧 Send Weekly Schedule Email',
    `This will send the schedule to ${recipients.length} recipients:\n\n` +
    recipients.slice(0, 5).join('\n') + 
    (recipients.length > 5 ? `\n... and ${recipients.length - 5} more` : '') +
    '\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
```

## Testing Recommendations

1. **Check Current Triggers**: Run `inspectAllTriggers()` to see all active triggers
2. **Remove All Triggers**: Use the menu option to remove all triggers
3. **Set Up Fresh**: Create a single new trigger using the setup function
4. **Test Manual Send**: Use the "Send Test Email" function first
5. **Monitor Logs**: Check the execution history in Google Apps Script

## Prevention Steps

1. Always check for existing triggers before creating new ones
2. Use cache to prevent duplicate sends within 24 hours
3. Add logging to track when emails are sent
4. Consider adding a "dry run" mode for testing
5. Implement recipient limits per execution

The schedule sending functionality itself appears to be working correctly. The issue was likely caused by multiple triggers firing simultaneously.
