/**
 * VENDOR ROTATION SYSTEM FOR WEEKLY AGREEMENTS
 * 
 * This ensures that houses rotate through priority vendors
 * (Goat Yoga, Equine, Surf Therapy, Peach Painting) on a weekly basis
 */

// ======================== ROTATION CONFIGURATION ========================

const ROTATION_CONFIG = {
  // Vendors with weekly agreements that need rotation
  PRIORITY_VENDORS: {
    'Groovy Goat Farm': {
      type: 'Goat Yoga',
      slotsPerWeek: 6,  // Based on your schedule image
      preferredTimes: ['10:30AM', '11:15AM', '11AM']
    },
    'Johnson Folly Equestrian Farm': {
      type: 'Equine Therapy',
      slotsPerWeek: 6,
      preferredTimes: ['10:30AM', '11:15AM', '11AM']
    },
    'Surf Therapy': {
      type: 'Surf Therapy',
      slotsPerWeek: 6,
      preferredTimes: ['10:30AM', '11:15AM', '11AM']
    },
    'The Peach Therapeutic Painting': {
      type: 'Art Therapy',
      slotsPerWeek: 6,
      preferredTimes: ['10:30AM', '11:15AM', '11AM']
    }
  },
  
  // Other vendors that fill remaining slots
  SECONDARY_VENDORS: [
    'Kyaking John D McArthur State Park',
    'Craft Haus:Pottery Painting',
    'Carlin Park Beach',
    'Okeeheelee Nature Center'
  ],
  
  // Houses that need to rotate through priority vendors
  HOUSES: [
    'The Cove',
    'The Estate', 
    'The Nest',
    'The Haven',
    'The Oasis',
    'The Lodge'
  ]
};

// ======================== ROTATION TRACKER ========================

/**
 * Enhanced SmartScheduler with rotation tracking
 */
class RotationAwareScheduler extends SmartScheduler {
  constructor(dataManager) {
    super(dataManager);
    this.rotationTracker = new VendorRotationTracker();
  }
  
  /**
   * Generate schedule with enforced vendor rotation
   */
  generateOptimalSchedule(options) {
    const schedule = [];
    const tuesdays = this.generateTuesdays(options.startDate, options.weeks || 52);
    
    for (const tuesday of tuesdays) {
      const weekSchedule = this.scheduleWeekWithRotation(tuesday);
      schedule.push(weekSchedule);
    }
    
    return schedule;
  }
  
  /**
   * Schedule a week ensuring proper vendor rotation
   */
  scheduleWeekWithRotation(weekDate) {
    const weekNum = this.getWeekNumber(weekDate);
    const assignments = {};
    
    // Get all houses and their time slots from the PROGRAMS sheet
    const programs = this.dataManager.getPrograms();
    
    // First, assign priority vendors with rotation
    this.assignPriorityVendors(programs, assignments, weekNum);
    
    // Then fill remaining slots with secondary vendors
    this.fillSecondaryVendors(programs, assignments, weekDate);
    
    return {
      date: weekDate,
      assignments: assignments,
      weekNumber: weekNum
    };
  }
  
  /**
   * Assign priority vendors ensuring each house rotates through them
   */
  assignPriorityVendors(programs, assignments, weekNum) {
    const priorityVendors = Object.keys(ROTATION_CONFIG.PRIORITY_VENDORS);
    const houses = ROTATION_CONFIG.HOUSES;
    
    // Create rotation matrix
    const rotationMatrix = this.createRotationMatrix(houses, priorityVendors, weekNum);
    
    // Apply rotation assignments
    programs.forEach(program => {
      const house = program.House;
      const timeSlot = program.Time;
      const key = `${house}_${timeSlot}`;
      
      // Check if this house should get a priority vendor this week
      const assignedVendor = rotationMatrix[house];
      
      if (assignedVendor && !this.isVendorFullyBooked(assignedVendor, assignments)) {
        assignments[key] = {
          house: house,
          time: timeSlot,
          vendor: assignedVendor,
          type: 'Priority Rotation'
        };
        
        // Track the assignment
        this.rotationTracker.recordAssignment(house, assignedVendor, weekNum);
      }
    });
  }
  
  /**
   * Create rotation matrix for the week
   */
  createRotationMatrix(houses, vendors, weekNum) {
    const matrix = {};
    const vendorCount = vendors.length;
    
    houses.forEach((house, houseIndex) => {
      // Calculate which vendor this house gets this week
      const vendorIndex = (houseIndex + weekNum) % vendorCount;
      matrix[house] = vendors[vendorIndex];
    });
    
    return matrix;
  }
  
  /**
   * Check if vendor has reached weekly capacity
   */
  isVendorFullyBooked(vendorName, existingAssignments) {
    const vendorConfig = ROTATION_CONFIG.PRIORITY_VENDORS[vendorName];
    if (!vendorConfig) return false;
    
    const currentCount = Object.values(existingAssignments)
      .filter(a => a.vendor === vendorName).length;
    
    return currentCount >= vendorConfig.slotsPerWeek;
  }
  
  /**
   * Fill remaining slots with secondary vendors
   */
  fillSecondaryVendors(programs, assignments, weekDate) {
    const secondaryVendors = ROTATION_CONFIG.SECONDARY_VENDORS;
    let vendorIndex = 0;
    
    programs.forEach(program => {
      const key = `${program.House}_${program.Time}`;
      
      // Skip if already assigned
      if (assignments[key]) return;
      
      // Assign secondary vendor
      assignments[key] = {
        house: program.House,
        time: program.Time,
        vendor: secondaryVendors[vendorIndex % secondaryVendors.length],
        type: 'Secondary'
      };
      
      vendorIndex++;
    });
  }
  
  /**
   * Get week number of the year
   */
  getWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }
}

// ======================== ROTATION TRACKER ========================

/**
 * Track vendor rotations to ensure fairness
 */
class VendorRotationTracker {
  constructor() {
    this.history = this.loadHistory();
  }
  
  /**
   * Load rotation history from sheet
   */
  loadHistory() {
    try {
      const ss = SpreadsheetApp.getActive();
      let historySheet = ss.getSheetByName('ROTATION_HISTORY');
      
      if (!historySheet) {
        // Create history sheet if it doesn't exist
        historySheet = ss.insertSheet('ROTATION_HISTORY');
        historySheet.getRange(1, 1, 1, 4).setValues([
          ['Week', 'House', 'Vendor', 'Date']
        ]);
      }
      
      const data = historySheet.getDataRange().getValues();
      const history = {};
      
      for (let i = 1; i < data.length; i++) {
        const [week, house, vendor, date] = data[i];
        if (!history[house]) history[house] = [];
        history[house].push({ week, vendor, date });
      }
      
      return history;
    } catch (e) {
      console.log('No history sheet found, starting fresh');
      return {};
    }
  }
  
  /**
   * Record an assignment
   */
  recordAssignment(house, vendor, weekNum) {
    if (!this.history[house]) {
      this.history[house] = [];
    }
    
    this.history[house].push({
      week: weekNum,
      vendor: vendor,
      date: new Date()
    });
  }
  
  /**
   * Get last vendor assignment for a house
   */
  getLastVendorForHouse(house) {
    const houseHistory = this.history[house];
    if (!houseHistory || houseHistory.length === 0) return null;
    
    return houseHistory[houseHistory.length - 1].vendor;
  }
  
  /**
   * Save history back to sheet
   */
  saveHistory() {
    const ss = SpreadsheetApp.getActive();
    const historySheet = ss.getSheetByName('ROTATION_HISTORY');
    
    const rows = [['Week', 'House', 'Vendor', 'Date']];
    
    Object.entries(this.history).forEach(([house, records]) => {
      records.forEach(record => {
        rows.push([record.week, house, record.vendor, record.date]);
      });
    });
    
    historySheet.clear();
    historySheet.getRange(1, 1, rows.length, 4).setValues(rows);
  }
}

// ======================== ROTATION REPORT ========================

/**
 * Generate a report showing the rotation schedule
 */
function generateRotationReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const weeks = 8; // Show 8 weeks of rotation
    const report = [];
    const houses = ROTATION_CONFIG.HOUSES;
    const vendors = Object.keys(ROTATION_CONFIG.PRIORITY_VENDORS);
    
    // Header row
    const header = ['Week', 'Date', ...houses];
    report.push(header);
    
    // Generate rotation for each week
    const startDate = new Date();
    const scheduler = new RotationAwareScheduler(new DataManager(SpreadsheetApp.getActive()));
    
    for (let w = 0; w < weeks; w++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(weekDate.getDate() + (w * 7));
      const weekNum = scheduler.getWeekNumber(weekDate);
      
      const row = [
        `Week ${w + 1}`,
        Utilities.formatDate(weekDate, Session.getScriptTimeZone(), 'MM/dd')
      ];
      
      const matrix = scheduler.createRotationMatrix(houses, vendors, weekNum);
      houses.forEach(house => {
        row.push(matrix[house] || 'N/A');
      });
      
      report.push(row);
    }
    
    // Create or update report sheet
    const ss = SpreadsheetApp.getActive();
    let reportSheet = ss.getSheetByName('ROTATION_PLAN');
    if (!reportSheet) {
      reportSheet = ss.insertSheet('ROTATION_PLAN');
    }
    
    reportSheet.clear();
    reportSheet.getRange(1, 1, report.length, report[0].length).setValues(report);
    
    // Format the sheet
    reportSheet.getRange(1, 1, 1, report[0].length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    reportSheet.autoResizeColumns(1, report[0].length);
    
    // Apply color coding for each vendor
    const vendorColors = {
      'Groovy Goat Farm': '#90EE90',
      'Johnson Folly Equestrian Farm': '#FFE4B5',
      'Surf Therapy': '#87CEEB',
      'The Peach Therapeutic Painting': '#FFB6C1'
    };
    
    for (let row = 2; row <= report.length; row++) {
      for (let col = 3; col <= report[0].length; col++) {
        const vendorName = reportSheet.getRange(row, col).getValue();
        if (vendorColors[vendorName]) {
          reportSheet.getRange(row, col).setBackground(vendorColors[vendorName]);
        }
      }
    }
    
    ui.alert(
      '📊 Rotation Plan Generated',
      `Created ${weeks}-week rotation plan in "ROTATION_PLAN" sheet.\n\n` +
      'Each house rotates through all priority vendors weekly.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Failed to generate rotation report: ' + error.toString(), ui.ButtonSet.OK);
  }
}

// ======================== VALIDATE CURRENT SCHEDULE ========================

/**
 * Check if current schedule follows rotation rules
 */
function validateCurrentRotation() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      ui.alert('No Schedule', 'SCHEDULE sheet not found.', ui.ButtonSet.OK);
      return;
    }
    
    const data = scheduleSheet.getDataRange().getValues();
    const issues = [];
    const vendorCounts = {};
    
    // Analyze current week's assignments
    for (let row = 1; row < data.length; row++) {
      const date = data[row][0];
      
      // Check vendor distribution for priority vendors
      for (let col = 1; col < data[0].length; col++) {
        const vendor = data[row][col];
        const house = data[0][col];
        
        if (ROTATION_CONFIG.PRIORITY_VENDORS[vendor]) {
          if (!vendorCounts[vendor]) vendorCounts[vendor] = {};
          if (!vendorCounts[vendor][house]) vendorCounts[vendor][house] = 0;
          vendorCounts[vendor][house]++;
        }
      }
    }
    
    // Check for imbalances
    Object.entries(vendorCounts).forEach(([vendor, houses]) => {
      const houseList = Object.keys(houses);
      if (houseList.length < ROTATION_CONFIG.HOUSES.length * 0.7) {
        issues.push(`${vendor} only assigned to ${houseList.length} houses`);
      }
    });
    
    if (issues.length > 0) {
      ui.alert(
        '⚠️ Rotation Issues Found',
        'The following issues were detected:\n\n' + issues.join('\n'),
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '✅ Rotation Valid',
        'Current schedule follows rotation guidelines.',
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert('Error', 'Validation failed: ' + error.toString(), ui.ButtonSet.OK);
  }
}

// ======================== MENU ADDITIONS ========================

/**
 * Add these to your onOpen() function:
 * 
 * menu.addSubMenu(ui.createMenu('🔄 Vendor Rotation')
 *   .addItem('📊 Generate Rotation Plan', 'generateRotationReport')
 *   .addItem('✅ Validate Current Rotation', 'validateCurrentRotation')
 *   .addItem('🔄 Apply Rotation to Schedule', 'applyRotationToSchedule'))
 */

// ======================== APPLY ROTATION ========================

/**
 * Apply rotation rules to regenerate schedule
 */
function applyRotationToSchedule() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '🔄 Apply Vendor Rotation',
    'This will regenerate the schedule using the rotation system.\n\n' +
    'Priority vendors (Goat Yoga, Equine, Surf, Peach) will be\n' +
    'distributed evenly across all houses weekly.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    const ss = SpreadsheetApp.getActive();
    const dataManager = new DataManager(ss);
    const scheduler = new RotationAwareScheduler(dataManager);
    
    // Generate schedule with rotation
    const config = dataManager.getConfig();
    const startDate = config.StartTuesday || new Date();
    
    const schedule = scheduler.generateOptimalSchedule({
      startDate: startDate,
      weeks: 52
    });
    
    // Write to sheet
    const writer = new ScheduleWriter(ss);
    writer.writeSchedule(schedule);
    
    // Save rotation history
    scheduler.rotationTracker.saveHistory();
    
    ui.alert(
      '✅ Rotation Applied',
      'Schedule regenerated with vendor rotation system.\n' +
      'Check ROTATION_PLAN sheet for the rotation pattern.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Failed to apply rotation: ' + error.toString(), ui.ButtonSet.OK);
  }
}
