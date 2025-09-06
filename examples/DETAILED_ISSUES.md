# Detailed Code Issues and Recommendations

## 1. Duplicate Email Functions

### Current State
The codebase has 4 different functions for sending emails:
- `emailMondayPdfEnhanced()` (Line 1807) - Main automated function
- `testEmailGeneration()` (Line 1906) - Test function 
- `sendWeeklyEmailNow()` (Line 1944) - Manual send function
- `sendTestEmail()` (Referenced in menu but not found)

### Problem
Each function duplicates similar logic for:
- Getting current week data
- Checking email cache
- Calling EmailScheduler class
- Error handling

### Recommendation
```javascript
// Consolidate into single function with parameters
function sendWeeklyEmail(options = {}) {
  const {
    isTest = false,
    skipCache = false,
    recipients = CONFIG.EMAIL_RECIPIENTS,
    isManual = false
  } = options;
  
  // Unified logic here
  const emailScheduler = new EmailScheduler();
  return emailScheduler.generateAndEmail({
    isTest,
    skipCache,
    recipients,
    isManual
  });
}

// Then create wrapper functions
function emailMondayPdfEnhanced() {
  return sendWeeklyEmail({ isManual: false });
}

function sendWeeklyEmailNow() {
  return sendWeeklyEmail({ isManual: true, skipCache: true });
}

function sendTestEmail() {
  return sendWeeklyEmail({ isTest: true, recipients: [Session.getActiveUser().getEmail()] });
}
```

## 2. Console.log Statements

### Current State
- 40+ console.log statements throughout code
- Debug logging mixed with production code
- No consistent logging strategy

### Problem
- Performance impact in production
- Cluttered logs
- No log levels or filtering

### Recommendation
```javascript
// Create logging utility
class Logger {
  static LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  
  static currentLevel = Logger.LOG_LEVELS.INFO;
  
  static debug(...args) {
    if (this.currentLevel <= this.LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  }
  
  static info(...args) {
    if (this.currentLevel <= this.LOG_LEVELS.INFO) {
      console.log('[INFO]', ...args);
    }
  }
  
  static error(...args) {
    console.error('[ERROR]', ...args);
  }
}

// Replace console.log with Logger
// From: console.log('System initialized successfully');
// To: Logger.info('System initialized successfully');
```

## 3. Vendor Assignment Logic Issues

### Current State
The vendor assignment has multiple issues:
1. Key generation was inconsistent (fixed)
2. Time slot calculation duplicated 3 times
3. Complex nested loops without optimization

### Problem
- Performance: O(n²) complexity in some cases
- Maintainability: Same logic in multiple places
- Readability: Deep nesting makes it hard to follow

### Recommendation
```javascript
// Extract time slot calculation
function getTimeSlotKey(program, dataManager) {
  const startTime = dataManager.formatTime(program.TuesdayStart);
  const endTime = dataManager.formatTime(program.TuesdayEnd);
  const timeSlot = (startTime && endTime && startTime !== 'Time TBD' && endTime !== 'Time TBD') 
    ? `${startTime} - ${endTime}` 
    : '10:00 AM - 12:00 PM';
  return { timeSlot, key: `${program.House}_${timeSlot}` };
}

// Use throughout code
programs.forEach(program => {
  const { timeSlot, key } = getTimeSlotKey(program, this.dataManager);
  // Rest of logic
});
```

## 4. Error Handling Inconsistencies

### Current State
- Some functions use try-catch
- Others let errors bubble up
- Different error messages and handling strategies

### Problem
- Unpredictable error behavior
- Hard to debug issues
- Poor user experience

### Recommendation
```javascript
// Standardize error handling
class AppError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

// Wrapper for consistent error handling
function withErrorHandling(fn, context) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      const appError = new AppError(
        error.message,
        error.code || 'UNKNOWN',
        { ...context, function: fn.name }
      );
      
      handleError(appError);
      throw appError;
    }
  };
}
```

## 5. Performance Issues

### Current State
- Multiple full spreadsheet reads
- No caching between operations
- Individual cell updates instead of batch

### Problem
- Slow execution, especially with large datasets
- Hitting Google Apps Script quotas
- Poor user experience

### Recommendation
```javascript
// Implement data caching
class DataCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Use batch operations
function updateScheduleSheet(schedule) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('SCHEDULE');
  const range = sheet.getRange(3, 1, schedule.length, maxColumns);
  
  // Build all data first
  const values = schedule.map(week => buildWeekRow(week));
  
  // Single batch update
  range.setValues(values);
}
```

## 6. Code Organization

### Current State
- 7600+ lines in single file
- Mixed concerns (UI, business logic, data access)
- No clear separation of responsibilities

### Problem
- Hard to navigate
- Difficult to test
- High coupling between components

### Recommendation
Split into multiple files:
```
├── config.gs          // Configuration and constants
├── models/
│   ├── Program.gs     // Program data model
│   ├── Vendor.gs      // Vendor data model
│   └── Schedule.gs    // Schedule data model
├── services/
│   ├── SchedulerService.gs    // Core scheduling logic
│   ├── EmailService.gs        // Email functionality
│   └── DataService.gs         // Data access layer
├── utils/
│   ├── Logger.gs      // Logging utility
│   ├── Cache.gs       // Caching utility
│   └── Validation.gs  // Data validation
├── ui/
│   ├── Menu.gs        // Menu definitions
│   └── Dialogs.gs     // UI dialogs
└── main.gs            // Entry points and initialization
```

## 7. Testing Strategy

### Current State
- No automated tests
- Manual testing functions scattered
- No test coverage metrics

### Problem
- Regression risks with changes
- Manual testing time-consuming
- No confidence in refactoring

### Recommendation
```javascript
// Add test framework
class TestRunner {
  static tests = [];
  
  static test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  static async runAll() {
    const results = [];
    
    for (const test of this.tests) {
      try {
        await test.fn();
        results.push({ name: test.name, passed: true });
      } catch (error) {
        results.push({ 
          name: test.name, 
          passed: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }
}

// Example tests
TestRunner.test('Vendor uniqueness per week', () => {
  const scheduler = new SmartScheduler();
  const schedule = scheduler.generateYearlySchedule();
  
  schedule.forEach(week => {
    const vendors = new Set();
    Object.values(week.assignments).forEach(assignment => {
      if (vendors.has(assignment.vendor)) {
        throw new Error(`Duplicate vendor ${assignment.vendor} in week`);
      }
      vendors.add(assignment.vendor);
    });
  });
});
```

## Priority Fixes

1. **Immediate** (Breaking Issues)
   - Remove duplicate console.log statements
   - Fix any remaining vendor assignment bugs
   - Consolidate email functions

2. **Short-term** (Performance & Stability)
   - Implement caching layer
   - Add batch operations
   - Standardize error handling

3. **Long-term** (Architecture)
   - Split into multiple files
   - Add automated tests
   - Implement proper logging
   - Create documentation

The codebase is functional but needs significant refactoring to be maintainable and scalable.
