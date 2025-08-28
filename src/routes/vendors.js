const express = require('express');
const router = express.Router();
const { getVendors, createVendor } = require('../controllers/vendorController');

router.get('/', getVendors);
router.post('/', createVendor);

module.exports = router;
