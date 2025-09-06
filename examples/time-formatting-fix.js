/**
 * TIME FORMATTING FIX FOR CLEARHIVE SCHEDULER
 * 
 * This fix ensures that all times throughout the system are displayed
 * in the format "11 AM - 1 PM" instead of raw date/time strings
 */

// ======================== TIME FORMATTING UTILITIES ========================

/**
 * Format a time value to a clean "11 AM" format
 * @param {Date|string} timeValue - The time value to format
 * @return {string} Formatted time like "11 AM"
 */
function formatTimeSimple(timeValue) {
  if (!timeValue) return '';
  
  let date;
  if (timeValue instanceof Date) {
    date = timeValue;
  } else {
    // Handle string input
    date = new Date(timeValue);
    if (isNaN(date.getTime())) {
      // Try parsing as time string
      const match = String(timeValue).match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2] || '0');
        const ampm = match[3];
        
        if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        
        date = new Date();
        date.setHours(hours, minutes, 0, 0);
      } else {
        return timeValue; // Return as-is if can't parse
      }
    }
  }
  
  // Format to simple time
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  // Only include minutes if not 00
  if (minutes === 0) {
    return `${hours} ${ampm}`;
  } else {
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }
}

/**
 * Format a time range like "11 AM - 1 PM"
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @return {string} Formatted time range
 */
function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return 'Time TBD';
  
  const start = formatTimeSimple(startTime);
  const end = formatTimeSimple(endTime);
  
  if (!start || !end) return 'Time TBD';
  
  return `${start} - ${end}`;
}

// ======================== UPDATED DATA MANAGER ========================

/**
 * Replace the existing formatTime method in DataManager class
 */
class DataManagerUpdate {
  /**
   * Format time or time range
   * This replaces the existing formatTime method
   */
  formatTime(value) {
    // If it's already a formatted range, return it
    if (typeof value === 'string' && value.includes(' - ')) {
      return value;
    }
    
    // Otherwise format as simple time
    const formatted = formatTimeSimple(value);
    return formatted || 'Time TBD';
  }
  
  /**
   * Get formatted time slot from program
   * This should be used when creating time slots from start/end times
   */
  getFormattedTimeSlot(program) {
    if (!program.TuesdayStart || !program.TuesdayEnd) {
      return 'Time TBD';
    }
    
    return formatTimeRange(program.TuesdayStart, program.TuesdayEnd);
  }
}

// ======================== UPDATE SMART SCHEDULER ========================

/**
 * Update the SmartScheduler methods to use proper time formatting
 */
class SmartSchedulerTimeUpdate {
  /**
   * Replace the existing schedule generation to use formatted time ranges
   */
  scheduleWeek(date) {
    const programs = this.dataManager.getPrograms();
    const assignments = {};
    
    programs.forEach(program => {
      // Use the new formatted time slot method
      const timeSlot = this.dataManager.getFormattedTimeSlot(program);
      const key = `${program.House}_${timeSlot}`;
      
      assignments[key] = {
        house: program.House,
        time: timeSlot,  // This will now be "11 AM - 1 PM" format
        vendor: this.selectVendor(program, date),
        color: program.CalendarColor
      };
    });
    
    return {
      date: date,
      assignments: assignments
    };
  }
}

// ======================== UPDATE SCHEDULE WRITER ========================

/**
 * Update ScheduleWriter to handle formatted times
 */
class ScheduleWriterTimeUpdate {
  /**
   * Create headers with formatted time ranges
   */
  createHeaders() {
    const programs = this.dataManager.getPrograms();
    const headers = ['Date'];
    const processedHeaders = new Set();
    
    programs.forEach(program => {
      const timeSlot = this.dataManager.getFormattedTimeSlot(program);
      const headerKey = `${program.House}\n${timeSlot}`;
      
      if (!processedHeaders.has(headerKey)) {
        headers.push(headerKey);
        processedHeaders.add(headerKey);
      }
    });
    
    return headers;
  }
}

// ======================== UPDATE EMAIL FORMATTER ========================

/**
 * Update email formatting to use clean time ranges
 */
class EmailFormatterTimeUpdate {
  /**
   * Format schedule table for email with proper times
   */
  formatScheduleTable(weekData) {
    let html = '<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">';
    html += '<tr style="background-color: #f0f0f0;">';
    html += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">House</th>';
    html += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Time</th>';
    html += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Vendor</th>';
    html += '</tr>';
    
    // Group by house for better readability
    const byHouse = {};
    Object.values(weekData.assignments).forEach(assignment => {
      if (!byHouse[assignment.house]) {
        byHouse[assignment.house] = [];
      }
      byHouse[assignment.house].push(assignment);
    });
    
    // Sort houses and create rows
    Object.keys(byHouse).sort().forEach(house => {
      byHouse[house].forEach(assignment => {
        html += '<tr>';
        html += `<td style="border: 1px solid #ddd; padding: 8px;">${house}</td>`;
        html += `<td style="border: 1px solid #ddd; padding: 8px; white-space: nowrap;">${assignment.time}</td>`;
        html += `<td style="border: 1px solid #ddd; padding: 8px;">${assignment.vendor}</td>`;
        html += '</tr>';
      });
    });
    
    html += '</table>';
    return html;
  }
}

// ======================== IMPLEMENTATION FUNCTIONS ========================

/**
 * Update all existing schedule data to use new time format
 * Run this once to convert existing data
 */
function convertExistingTimesToRangeFormat() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '⏰ Convert Time Formats',
    'This will update all times in the schedule to the format "11 AM - 1 PM".\n\n' +
    'This is a one-time conversion. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    const ss = SpreadsheetApp.getActive();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    const programSheet = ss.getSheetByName('PROGRAMS');
    
    if (!scheduleSheet || !programSheet) {
      ui.alert('Error', 'Required sheets not found.', ui.ButtonSet.OK);
      return;
    }
    
    // Get programs data to map times
    const programData = programSheet.getDataRange().getValues();
    const programHeaders = programData[0];
    const timeMapping = {};
    
    // Find column indices
    const houseCol = programHeaders.indexOf('House');
    const startCol = programHeaders.indexOf('TuesdayStart');
    const endCol = programHeaders.indexOf('TuesdayEnd');
    
    // Build time mapping
    for (let i = 1; i < programData.length; i++) {
      const house = programData[i][houseCol];
      const start = programData[i][startCol];
      const end = programData[i][endCol];
      
      if (house && start && end) {
        const timeRange = formatTimeRange(start, end);
        
        // Store all possible variations
        timeMapping[`${house}_${formatTimeSimple(start)}`] = timeRange;
        timeMapping[`${house}_${start}`] = timeRange;
        
        // Also store the range itself
        timeMapping[`${house}_${timeRange}`] = timeRange;
      }
    }
    
    // Update schedule headers
    const scheduleData = scheduleSheet.getDataRange().getValues();
    const headers = scheduleData[0];
    const newHeaders = ['Date'];
    
    for (let col = 1; col < headers.length; col++) {
      const header = headers[col];
      if (header) {
        const parts = header.split('\n');
        if (parts.length >= 2) {
          const house = parts[0];
          const oldTime = parts[1];
          
          // Try to find the correct time range
          let newTime = timeMapping[`${house}_${oldTime}`];
          
          if (!newTime) {
            // Try to parse and format the time
            const timeMatch = oldTime.match(/(\d{1,2}:\d{2})/);
            if (timeMatch) {
              newTime = timeMapping[`${house}_${timeMatch[1]}`];
            }
          }
          
          if (!newTime) {
            // Last resort - check if it's already a range
            if (oldTime.includes(' - ')) {
              newTime = oldTime;
            } else {
              newTime = 'Time TBD';
            }
          }
          
          newHeaders.push(`${house}\n${newTime}`);
        } else {
          newHeaders.push(header);
        }
      }
    }
    
    // Update the header row
    scheduleSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    
    // Auto-resize columns
    scheduleSheet.autoResizeColumns(1, newHeaders.length);
    
    ui.alert(
      '✅ Time Format Updated',
      'All times have been converted to the "11 AM - 1 PM" format.\n\n' +
      'Future schedules will automatically use this format.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Failed to convert times: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Test the time formatting functions
 */
function testTimeFormatting() {
  // Test cases
  const testCases = [
    { input: 'Sat Dec 30 1899 10:30:00 GMT-0500 (Eastern Standard Time)', expected: '10:30 AM' },
    { input: 'Sat Dec 30 1899 11:00:00 GMT-0500 (Eastern Standard Time)', expected: '11 AM' },
    { input: 'Sat Dec 30 1899 13:00:00 GMT-0500 (Eastern Standard Time)', expected: '1 PM' },
    { input: '10:30 AM', expected: '10:30 AM' },
    { input: '11:00 AM', expected: '11 AM' },
    { input: '1:00 PM', expected: '1 PM' },
  ];
  
  console.log('Testing formatTimeSimple:');
  testCases.forEach(test => {
    const result = formatTimeSimple(test.input);
    console.log(`Input: ${test.input}`);
    console.log(`Expected: ${test.expected}`);
    console.log(`Result: ${result}`);
    console.log(`Pass: ${result === test.expected ? '✓' : '✗'}`);
    console.log('---');
  });
  
  // Test time ranges
  console.log('\nTesting formatTimeRange:');
  const rangeTests = [
    {
      start: 'Sat Dec 30 1899 10:30:00 GMT-0500 (Eastern Standard Time)',
      end: 'Sat Dec 30 1899 13:00:00 GMT-0500 (Eastern Standard Time)',
      expected: '10:30 AM - 1 PM'
    },
    {
      start: 'Sat Dec 30 1899 11:00:00 GMT-0500 (Eastern Standard Time)',
      end: 'Sat Dec 30 1899 13:00:00 GMT-0500 (Eastern Standard Time)',
      expected: '11 AM - 1 PM'
    }
  ];
  
  rangeTests.forEach(test => {
    const result = formatTimeRange(test.start, test.end);
    console.log(`Start: ${test.start}`);
    console.log(`End: ${test.end}`);
    console.log(`Expected: ${test.expected}`);
    console.log(`Result: ${result}`);
    console.log(`Pass: ${result === test.expected ? '✓' : '✗'}`);
    console.log('---');
  });
}

// ======================== MENU ADDITION ========================

/**
 * Add this to your onOpen menu:
 * 
 * menu.addItem('⏰ Fix Time Formats', 'convertExistingTimesToRangeFormat')
 */

// ======================== FIX SCHEDULE TIMES ========================

/**
 * Fix schedule times to display in proper format
 * This updates the SCHEDULE sheet headers to show times as "11 AM - 1 PM"
 */
function fixScheduleTimes() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet || scheduleSheet.getLastRow() < 2) {
      ui.alert('No Schedule Found', 
        'Please generate a schedule first.', 
        ui.ButtonSet.OK);
      return;
    }
    
    // Get the second row (time row)
    const timeRow = scheduleSheet.getRange(2, 1, 1, scheduleSheet.getLastColumn()).getValues()[0];
    const updatedTimes = [];
    
    let fixedCount = 0;
    
    for (let i = 0; i < timeRow.length; i++) {
      const time = timeRow[i];
      
      if (time && typeof time === 'string' && time.includes(':')) {
        // Parse time formats like "10:30 AM - 1:00 PM" or individual times
        if (time.includes(' - ')) {
          // Already a range, but may need formatting
          const parts = time.split(' - ');
          const start = formatTimeSimple(parts[0]);
          const end = formatTimeSimple(parts[1]);
          const newTime = `${start} - ${end}`;
          
          if (newTime !== time) {
            fixedCount++;
          }
          updatedTimes.push(newTime);
        } else {
          // Single time - keep as is or look for matching end time
          updatedTimes.push(time);
        }
      } else {
        updatedTimes.push(time || '');
      }
    }
    
    // Update the time row
    scheduleSheet.getRange(2, 1, 1, updatedTimes.length).setValues([updatedTimes]);
    
    ui.alert('✅ Times Updated', 
      `Fixed ${fixedCount} time entries to use proper format.`, 
      ui.ButtonSet.OK);
      
  } catch (error) {
    ui.alert('Error', 
      `Failed to fix times: ${error.toString()}`, 
      ui.ButtonSet.OK);
  }
}

// ======================== COMPLETE REPLACEMENT FUNCTIONS ========================

/**
 * These functions should replace the existing ones in your main code
 */

// Replace in DataManager class
const DataManagerTimeFormatMethods = {
  formatTime: function(value) {
    if (!value) return 'Time TBD';
    
    // If it's already a formatted range, return it
    if (typeof value === 'string' && value.includes(' - ')) {
      return value;
    }
    
    // Otherwise format as simple time
    const formatted = formatTimeSimple(value);
    return formatted || 'Time TBD';
  },
  
  getFormattedTimeSlot: function(program) {
    if (!program.TuesdayStart || !program.TuesdayEnd) {
      return 'Time TBD';
    }
    
    return formatTimeRange(program.TuesdayStart, program.TuesdayEnd);
  }
};

// Replace in SmartScheduler class where time slots are created
const SmartSchedulerTimeSlotCreation = {
  createTimeSlot: function(program) {
    return this.dataManager.getFormattedTimeSlot(program);
  }
};
