const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');

router.get('/', programController.getPrograms);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);
router.post('/check-conflicts', programController.checkTimeConflicts);

module.exports = router;
