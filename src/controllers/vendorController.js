const db = require('../utils/db');

async function getVendors(req, res) {
  try {
    const facilityId = req.query.facility_id || 1;
    const result = await db.query(
      'SELECT * FROM vendors WHERE facility_id = $1 ORDER BY name',
      [facilityId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createVendor(req, res) {
  try {
    const { name, vendor_type, capacity, contact, address, phone, facility_id = 1 } = req.body;
    const result = await db.query(
      `INSERT INTO vendors (facility_id, name, vendor_type, capacity, contact, address, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [facility_id, name, vendor_type, capacity, contact, address, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getVendors, createVendor };
