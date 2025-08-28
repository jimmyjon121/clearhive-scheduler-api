const express = require('express');
const router = express.Router();
const { generateSchedule, getSchedule } = require('../controllers/scheduleController');

router.post('/generate', generateSchedule);
router.get('/:date', getSchedule);

module.exports = router;
