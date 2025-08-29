const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/emailController');

// Send schedule notification to specific house
router.post('/schedules/:scheduleId/programs/:programId/notify', EmailController.sendScheduleNotification);

// Send bulk notifications for a specific date
router.post('/schedules/date/:scheduleDate/notify-all', EmailController.sendBulkNotifications);

// Get email archives with filters
router.get('/archives', EmailController.getEmailArchives);

// Get specific archived email content
router.get('/archives/:archiveId', EmailController.getArchivedEmail);

// Email settings management
router.get('/settings', EmailController.getEmailSettings);
router.put('/settings', EmailController.updateEmailSettings);

// Manual triggers
router.post('/reminders/daily', EmailController.sendDailyReminders);

// Email statistics
router.get('/statistics', EmailController.getEmailStatistics);

module.exports = router;
