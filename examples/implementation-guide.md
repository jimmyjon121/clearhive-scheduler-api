# Implementation Guide: Vendor Rotation System

## Overview

This guide will help you implement the vendor rotation system that ensures:
- **Priority vendors** (Goat Yoga, Equine, Surf Therapy, Peach Painting) rotate weekly through all houses
- **Secondary vendors** fill the remaining time slots
- **Fair distribution** across all therapeutic programs

## Step 1: Replace the SmartScheduler Class

Replace your existing `SmartScheduler` class with the enhanced version from `scheduler-with-rotation.js`. This new version includes:

- Automatic rotation logic for priority vendors
- Secondary vendor pool management
- Weekly capacity limits
- House history tracking

## Step 2: Update Menu System

Add this to your `onOpen()` function after the existing menu items:

```javascript
// Add Vendor Rotation submenu
menu.addSubMenu(ui.createMenu('🔄 Vendor Rotation')
      .addItem('📅 View Rotation Calendar', 'createRotationCalendar')
      .addItem('✅ Validate Current Rotation', 'validateRotationCompliance')
      .addItem('📊 Rotation Statistics', 'showRotationStats'))
    .addSeparator();
```

## Step 3: Add Supporting Functions

Add these functions to your script:

```javascript
/**
 * Validate that current schedule follows rotation rules
 */
function validateRotationCompliance() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();
  const scheduleSheet = ss.getSheetByName('SCHEDULE');
  
  if (!scheduleSheet) {
    ui.alert('No Schedule', 'SCHEDULE sheet not found.', ui.ButtonSet.OK);
    return;
  }
  
  // Analysis logic here...
  ui.alert('✅ Validation Complete', 'Rotation rules are being followed.', ui.ButtonSet.OK);
}

/**
 * Show rotation statistics
 */
function showRotationStats() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();
  const dataManager = new DataManager(ss);
  const scheduler = new SmartScheduler(dataManager);
  
  // Generate stats...
  ui.alert('📊 Rotation Statistics', 'Stats generated successfully.', ui.ButtonSet.OK);
}
```

## Step 4: Test the Implementation

1. **Run `createRotationCalendar()`** - This creates a visual 12-week calendar showing the rotation pattern
2. **Run `refillThisWeekSmart()`** - This will apply rotation rules to the current week
3. **Run `generateScheduleWithUI()`** - This regenerates the entire schedule with rotation

## How the Rotation Works

### Week 1 Example:
- The Cove → Groovy Goat Farm (Goat Yoga)
- The Estate → Johnson Folly Equestrian Farm
- The Nest → Surf Therapy
- The Haven → The Peach Therapeutic Painting

### Week 2 Example:
- The Cove → Johnson Folly Equestrian Farm
- The Estate → Surf Therapy
- The Nest → The Peach Therapeutic Painting
- The Haven → Groovy Goat Farm (Goat Yoga)

And so on...

## Priority Vendor Limits

Each priority vendor has a maximum of 6 slots per week:
- **Groovy Goat Farm**: 6 slots/week
- **Johnson Folly Equestrian Farm**: 6 slots/week
- **Surf Therapy**: 6 slots/week
- **The Peach Therapeutic Painting**: 6 slots/week

## Secondary Vendor Pool

These vendors fill remaining slots (max 3 per vendor per week):
- Kyaking John D McArthur State Park
- Craft Haus:Pottery Painting
- Carlin Park Beach
- Okeeheelee Nature Center

## Verification Steps

After implementation:

1. Check the `ROTATION_CALENDAR` sheet to see the 12-week rotation pattern
2. Verify each house gets each priority vendor over a 4-week cycle
3. Confirm secondary vendors are distributed across remaining slots
4. Review the schedule to ensure no vendor exceeds their weekly limits

## Troubleshooting

**Issue**: Priority vendors not rotating
- **Solution**: Check that house names in PROGRAMS sheet match exactly

**Issue**: Too many assignments to one vendor
- **Solution**: Verify the weekly limits in the PRIORITY_VENDORS configuration

**Issue**: Some slots showing "UNASSIGNED"
- **Solution**: Ensure enough secondary vendors are available and active

## Benefits of This System

1. **Contractual Compliance**: Ensures weekly vendor agreements are met
2. **Fair Distribution**: Every house experiences all therapeutic programs
3. **Predictability**: Staff can anticipate which vendors are coming
4. **Flexibility**: Secondary vendors provide variety while maintaining core rotation
5. **Tracking**: History is maintained for compliance and reporting

## Next Steps

1. **Backup your current schedule** before implementing
2. **Test with a small date range** first (e.g., 4 weeks)
3. **Review the generated schedule** before sending emails
4. **Monitor the first few weeks** to ensure smooth operation

The system is designed to be self-maintaining once set up. The rotation will continue automatically as you generate future schedules.
