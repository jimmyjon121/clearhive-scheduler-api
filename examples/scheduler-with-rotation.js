/**
 * ENHANCED SCHEDULER WITH VENDOR ROTATION IMPLEMENTATION
 * 
 * This replaces the existing SmartScheduler class to implement
 * the vendor rotation system for priority vendors
 */

// ======================== UPDATED SMART SCHEDULER ========================

/**
 * Replace the existing SmartScheduler class with this enhanced version
 */
class SmartScheduler {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.conflictCount = 0;
    this.vendorUsage = {};
    this.houseHistory = {};
    
    // Initialize rotation configuration
    this.PRIORITY_VENDORS = {
      'Groovy Goat Farm': {
        type: 'Goat Yoga',
        maxSlotsPerWeek: 6,
        color: '#90EE90'
      },
      'Johnson Folly Equestrian Farm': {
        type: 'Equine Therapy', 
        maxSlotsPerWeek: 6,
        color: '#FFE4B5'
      },
      'Surf Therapy': {
        type: 'Surf Therapy',
        maxSlotsPerWeek: 6,
        color: '#87CEEB'
      },
      'The Peach Therapeutic Painting': {
        type: 'Art Therapy',
        maxSlotsPerWeek: 6,
        color: '#FFB6C1'
      }
    };
    
    // Secondary vendors to fill remaining slots
    this.SECONDARY_VENDORS = [
      'Kyaking John D McArthur State Park',
      'Craft Haus:Pottery Painting', 
      'Carlin Park Beach',
      'Okeeheelee Nature Center'
    ];
  }
  
  /**
   * Generate optimal schedule with vendor rotation
   */
  generateOptimalSchedule(options) {
    const schedule = [];
    const tuesdays = this.generateTuesdays(options.startDate, options.weeks || 52);
    
    console.log(`Generating schedule for ${tuesdays.length} weeks with vendor rotation`);
    
    for (let i = 0; i < tuesdays.length; i++) {
      const tuesday = tuesdays[i];
      const weekSchedule = this.scheduleWeekWithRotation(tuesday, i);
      schedule.push(weekSchedule);
    }
    
    // Log statistics
    this.logScheduleStats(schedule);
    
    return schedule;
  }
  
  /**
   * Schedule a single week with vendor rotation
   */
  scheduleWeekWithRotation(date, weekIndex) {
    const programs = this.dataManager.getPrograms();
    const vendors = this.dataManager.getVendors();
    const assignments = {};
    
    // Reset weekly vendor counts
    const weeklyVendorCounts = {};
    Object.keys(this.PRIORITY_VENDORS).forEach(v => weeklyVendorCounts[v] = 0);
    
    // Get houses from programs (unique list)
    const houses = [...new Set(programs.map(p => p.House))];
    
    // Step 1: Assign priority vendors with rotation
    const priorityAssignments = this.assignPriorityVendorsForWeek(
      programs, houses, weekIndex, weeklyVendorCounts
    );
    
    // Step 2: Fill remaining slots with secondary vendors
    programs.forEach(program => {
      const key = `${program.House}_${program.Time}`;
      
      // Check if already assigned a priority vendor
      if (priorityAssignments[key]) {
        assignments[key] = priorityAssignments[key];
      } else {
        // Assign from secondary vendor pool
        const vendor = this.selectSecondaryVendor(program, date, vendors, assignments);
        assignments[key] = {
          house: program.House,
          time: program.Time,
          vendor: vendor,
          type: 'Secondary'
        };
      }
    });
    
    return {
      date: date,
      assignments: assignments,
      weekNumber: weekIndex + 1
    };
  }
  
  /**
   * Assign priority vendors using rotation pattern
   */
  assignPriorityVendorsForWeek(programs, houses, weekIndex, weeklyVendorCounts) {
    const assignments = {};
    const priorityVendorNames = Object.keys(this.PRIORITY_VENDORS);
    
    // Create rotation matrix for this week
    const rotationMap = this.createWeeklyRotationMap(houses, priorityVendorNames, weekIndex);
    
    // Track which houses have been assigned their priority vendor
    const housesAssigned = new Set();
    
    // First pass: Try to assign each house its designated priority vendor
    programs.forEach(program => {
      const house = program.House;
      const time = program.Time;
      const key = `${house}_${time}`;
      
      // Skip if house already got its priority vendor
      if (housesAssigned.has(house)) return;
      
      const designatedVendor = rotationMap[house];
      if (!designatedVendor) return;
      
      // Check if vendor hasn't exceeded weekly limit
      if (weeklyVendorCounts[designatedVendor] < this.PRIORITY_VENDORS[designatedVendor].maxSlotsPerWeek) {
        assignments[key] = {
          house: house,
          time: time,
          vendor: designatedVendor,
          type: 'Priority Rotation'
        };
        
        weeklyVendorCounts[designatedVendor]++;
        housesAssigned.add(house);
        
        // Log the assignment
        this.updateHouseHistory(house, designatedVendor, new Date());
      }
    });
    
    // Second pass: If any priority vendors have remaining capacity, assign to other slots
    programs.forEach(program => {
      const key = `${program.House}_${program.Time}`;
      
      // Skip if already assigned
      if (assignments[key]) return;
      
      // Try to find a priority vendor with remaining capacity
      for (const vendorName of priorityVendorNames) {
        if (weeklyVendorCounts[vendorName] < this.PRIORITY_VENDORS[vendorName].maxSlotsPerWeek) {
          // Check if this house hasn't had this vendor too recently
          if (this.canAssignVendorToHouse(program.House, vendorName, 2)) {
            assignments[key] = {
              house: program.House,
              time: program.Time,
              vendor: vendorName,
              type: 'Priority Fill'
            };
            
            weeklyVendorCounts[vendorName]++;
            break;
          }
        }
      }
    });
    
    return assignments;
  }
  
  /**
   * Create rotation map for the week
   */
  createWeeklyRotationMap(houses, vendors, weekIndex) {
    const map = {};
    const vendorCount = vendors.length;
    
    houses.forEach((house, houseIndex) => {
      // Rotate vendors based on week number
      const vendorIndex = (houseIndex + weekIndex) % vendorCount;
      map[house] = vendors[vendorIndex];
    });
    
    return map;
  }
  
  /**
   * Select a secondary vendor for remaining slots
   */
  selectSecondaryVendor(program, date, allVendors, currentAssignments) {
    // Get vendors already assigned this week
    const assignedVendors = Object.values(currentAssignments)
      .map(a => a.vendor)
      .filter(v => v !== 'UNASSIGNED');
    
    // Filter available secondary vendors
    const availableSecondary = this.SECONDARY_VENDORS.filter(vendorName => {
      // Check if vendor exists in vendor sheet
      if (!allVendors[vendorName]) return false;
      
      // Check if not already assigned too many times this week
      const weeklyCount = assignedVendors.filter(v => v === vendorName).length;
      if (weeklyCount >= 3) return false; // Limit secondary vendors to 3 slots per week
      
      // Check if house hasn't had this vendor too recently
      return this.canAssignVendorToHouse(program.House, vendorName, 1);
    });
    
    // If we have available secondary vendors, pick one
    if (availableSecondary.length > 0) {
      // Rotate through secondary vendors
      const index = Object.keys(currentAssignments).length % availableSecondary.length;
      return availableSecondary[index];
    }
    
    // Fallback: pick any available vendor
    const allAvailable = Object.keys(allVendors).filter(vendorName => {
      if (!allVendors[vendorName].Active) return false;
      if (assignedVendors.includes(vendorName)) return false;
      return true;
    });
    
    return allAvailable.length > 0 ? allAvailable[0] : 'UNASSIGNED';
  }
  
  /**
   * Check if vendor can be assigned to house
   */
  canAssignVendorToHouse(house, vendorName, minWeeksGap) {
    const history = this.houseHistory[house];
    if (!history || history.length === 0) return true;
    
    // Find last assignment of this vendor to this house
    const lastAssignment = history
      .filter(h => h.vendor === vendorName)
      .sort((a, b) => b.date - a.date)[0];
    
    if (!lastAssignment) return true;
    
    // Check weeks since last assignment
    const weeksSince = Math.floor((new Date() - lastAssignment.date) / (7 * 24 * 60 * 60 * 1000));
    return weeksSince >= minWeeksGap;
  }
  
  /**
   * Log schedule statistics
   */
  logScheduleStats(schedule) {
    const stats = {
      totalWeeks: schedule.length,
      vendorCounts: {},
      houseVendorMatrix: {}
    };
    
    schedule.forEach(week => {
      Object.values(week.assignments).forEach(assignment => {
        // Count vendor usage
        if (!stats.vendorCounts[assignment.vendor]) {
          stats.vendorCounts[assignment.vendor] = 0;
        }
        stats.vendorCounts[assignment.vendor]++;
        
        // Track house-vendor relationships
        if (!stats.houseVendorMatrix[assignment.house]) {
          stats.houseVendorMatrix[assignment.house] = {};
        }
        if (!stats.houseVendorMatrix[assignment.house][assignment.vendor]) {
          stats.houseVendorMatrix[assignment.house][assignment.vendor] = 0;
        }
        stats.houseVendorMatrix[assignment.house][assignment.vendor]++;
      });
    });
    
    console.log('Schedule Generation Complete:', stats);
  }
  
  // Keep existing helper methods
  generateTuesdays(startDate, weeks) {
    const tuesdays = [];
    let currentDate = this.nextTuesday(new Date(startDate));
    
    for (let i = 0; i < weeks; i++) {
      tuesdays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return tuesdays;
  }
  
  nextTuesday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day <= 2 ? (2 - day) : (9 - day);
    d.setDate(d.getDate() + diff);
    return d;
  }
  
  updateHouseHistory(house, vendorName, date) {
    if (!this.houseHistory[house]) {
      this.houseHistory[house] = [];
    }
    this.houseHistory[house].push({ vendor: vendorName, date: date });
  }
  
  /**
   * Refill current week with smart selection
   */
  refillCurrentWeek() {
    const ss = this.dataManager.ss;
    const scheduleSheet = ss.getSheetByName('SCHEDULE');
    
    if (!scheduleSheet) {
      return { success: false, error: 'SCHEDULE sheet not found' };
    }
    
    // Find current week
    const today = new Date();
    const data = scheduleSheet.getDataRange().getValues();
    let currentWeekRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      const weekDate = new Date(data[i][0]);
      if (this.isSameWeek(weekDate, today)) {
        currentWeekRow = i + 1; // 1-based for sheet
        break;
      }
    }
    
    if (currentWeekRow === -1) {
      return { success: false, error: 'Current week not found in schedule' };
    }
    
    // Get week index for rotation
    const weekIndex = currentWeekRow - 2; // Adjust for header row
    
    // Regenerate assignments for this week
    const weekDate = new Date(data[currentWeekRow - 1][0]);
    const newWeekSchedule = this.scheduleWeekWithRotation(weekDate, weekIndex);
    
    // Update the sheet
    const headers = data[0];
    const newRow = [weekDate];
    
    for (let col = 1; col < headers.length; col++) {
      const house = headers[col].split('\n')[0]; // Get house name
      const time = headers[col].split('\n')[1];  // Get time
      const key = `${house}_${time}`;
      
      const assignment = newWeekSchedule.assignments[key];
      newRow.push(assignment ? assignment.vendor : 'UNASSIGNED');
    }
    
    scheduleSheet.getRange(currentWeekRow, 1, 1, newRow.length).setValues([newRow]);
    
    return { 
      success: true, 
      assignments: newWeekSchedule.assignments,
      message: 'Week refilled with rotation rules applied'
    };
  }
  
  isSameWeek(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstMonday = new Date(date1.getTime() - ((date1.getDay() + 6) % 7) * oneDay);
    const secondMonday = new Date(date2.getTime() - ((date2.getDay() + 6) % 7) * oneDay);
    return Math.abs(firstMonday - secondMonday) < oneDay;
  }
}

// ======================== ROTATION VISUALIZATION ========================

/**
 * Create a visual rotation calendar
 */
function createRotationCalendar() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActive();
    let calendarSheet = ss.getSheetByName('ROTATION_CALENDAR');
    
    if (!calendarSheet) {
      calendarSheet = ss.insertSheet('ROTATION_CALENDAR');
    }
    
    // Clear existing content
    calendarSheet.clear();
    
    // Get programs to determine houses
    const dataManager = new DataManager(ss);
    const programs = dataManager.getPrograms();
    const houses = [...new Set(programs.map(p => p.House))].sort();
    
    // Priority vendors
    const vendors = Object.keys({
      'Groovy Goat Farm': true,
      'Johnson Folly Equestrian Farm': true,
      'Surf Therapy': true,
      'The Peach Therapeutic Painting': true
    });
    
    // Create 12-week rotation calendar
    const weeks = 12;
    const calendar = [];
    
    // Header row
    calendar.push(['Week', 'Date', ...houses]);
    
    // Generate rotation for each week
    const startDate = new Date();
    const scheduler = new SmartScheduler(dataManager);
    
    for (let w = 0; w < weeks; w++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(weekDate.getDate() + (w * 7));
      
      const row = [
        `Week ${w + 1}`,
        Utilities.formatDate(weekDate, Session.getScriptTimeZone(), 'MMM dd')
      ];
      
      // Get rotation for this week
      const rotationMap = scheduler.createWeeklyRotationMap(houses, vendors, w);
      
      houses.forEach(house => {
        row.push(rotationMap[house] || 'N/A');
      });
      
      calendar.push(row);
    }
    
    // Write to sheet
    calendarSheet.getRange(1, 1, calendar.length, calendar[0].length).setValues(calendar);
    
    // Format header
    calendarSheet.getRange(1, 1, 1, calendar[0].length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    // Apply vendor colors
    const vendorColors = {
      'Groovy Goat Farm': '#90EE90',
      'Johnson Folly Equestrian Farm': '#FFE4B5', 
      'Surf Therapy': '#87CEEB',
      'The Peach Therapeutic Painting': '#FFB6C1'
    };
    
    for (let row = 2; row <= calendar.length; row++) {
      for (let col = 3; col <= calendar[0].length; col++) {
        const vendorName = calendarSheet.getRange(row, col).getValue();
        if (vendorColors[vendorName]) {
          calendarSheet.getRange(row, col).setBackground(vendorColors[vendorName]);
        }
      }
    }
    
    // Auto-resize columns
    calendarSheet.autoResizeColumns(1, calendar[0].length);
    
    ui.alert(
      '📅 Rotation Calendar Created',
      `Created 12-week rotation calendar in "ROTATION_CALENDAR" sheet.\n\n` +
      'This shows how priority vendors rotate through houses weekly.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Failed to create calendar: ' + error.toString(), ui.ButtonSet.OK);
  }
}

// ======================== MENU UPDATE ========================

/**
 * Update your onOpen function to include rotation features
 */
function updateMenuWithRotation() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('FFAS Scheduler');
  
  // Core Operations
  menu.addItem('Generate Schedule', 'generateScheduleWithUI')
      .addItem('Refill This Week', 'refillThisWeekSmart')
      .addSeparator()
      .addItem('📧 Send Weekly Email NOW', 'sendWeeklyEmailNow')
      .addSeparator();
  
  // Vendor Rotation submenu
  menu.addSubMenu(ui.createMenu('🔄 Vendor Rotation')
        .addItem('📅 View Rotation Calendar', 'createRotationCalendar')
        .addItem('✅ Validate Current Rotation', 'validateRotationCompliance')
        .addItem('📊 Rotation Statistics', 'showRotationStats'))
      .addSeparator();
  
  // Rest of existing menu items...
  
  menu.addToUi();
}
