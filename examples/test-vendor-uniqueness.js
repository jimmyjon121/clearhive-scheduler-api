// Test function to verify vendor uniqueness per week
function displayWeeklyVendorAssignments() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const scheduler = new SmartScheduler();
    const schedule = scheduler.generateYearlySchedule();
    
    let output = "VENDOR ASSIGNMENT PREVIEW (First 4 Weeks)\n";
    output += "=========================================\n\n";
    
    for (let weekIndex = 0; weekIndex < Math.min(4, schedule.length); weekIndex++) {
      const week = schedule[weekIndex];
      const weekDate = new Date(week.weekStart);
      output += `WEEK ${weekIndex + 1} - ${Utilities.formatDate(weekDate, Session.getScriptTimeZone(), 'MMM d, yyyy')}\n`;
      output += "-".repeat(40) + "\n";
      
      // Group assignments by vendor
      const vendorAssignments = {};
      Object.values(week.assignments).forEach(assignment => {
        if (assignment.vendor && assignment.vendor !== 'UNASSIGNED') {
          if (!vendorAssignments[assignment.vendor]) {
            vendorAssignments[assignment.vendor] = [];
          }
          vendorAssignments[assignment.vendor].push(assignment.house);
        }
      });
      
      // Display vendor assignments
      Object.entries(vendorAssignments).forEach(([vendor, houses]) => {
        output += `  ${vendor}: ${houses.join(', ')}`;
        if (houses.length > 1) {
          output += " ⚠️ DUPLICATE!";
        }
        output += "\n";
      });
      
      output += "\n";
    }
    
    // Show in a dialog
    const htmlOutput = HtmlService.createHtmlOutput('<pre>' + output + '</pre>')
      .setWidth(600)
      .setHeight(500);
    ui.showModalDialog(htmlOutput, 'Vendor Assignment Preview');
    
  } catch (error) {
    ui.alert('Error', `Error generating preview: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

// Add this function to the menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏠 Family First Scheduler')
    .addItem('📋 View Current Week Schedule', 'viewCurrentSchedule')
    .addItem('🔍 Test Vendor Uniqueness', 'testVendorUniqueness')
    .addItem('📊 Preview Vendor Assignments', 'displayWeeklyVendorAssignments')
    .addSeparator()
    .addItem('📅 Generate Full Year Schedule', 'generateFullYearSchedule')
    .addItem('✉️ Send Weekly Email (Manual)', 'sendWeeklyEmail')
    .addSeparator()
    .addItem('⚙️ Configure Email Settings', 'showEmailConfig')
    .addItem('🔧 Setup Weekly Email Trigger', 'setupEnhancedTrigger')
    .addItem('🧹 Clean Up Duplicate Triggers', 'cleanupDuplicateTriggers')
    .addToUi();
}
