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
    const { 
      name, 
      vendor_type, 
      capacity, 
      contact, 
      email,
      address, 
      phone, 
      maps_link,
      color,
      is_rotation_vendor,
      rotation_weeks,
      facility_id = 1 
    } = req.body;
    
    const result = await db.query(
      `INSERT INTO vendors (facility_id, name, vendor_type, capacity, contact, email, address, phone, maps_link, color, is_rotation_vendor, rotation_weeks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [facility_id, name, vendor_type, capacity, contact, email, address, phone, maps_link, color, is_rotation_vendor, rotation_weeks]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateVendor(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      vendor_type,
      capacity,
      contact,
      email,
      address,
      phone,
      maps_link,
      color,
      is_rotation_vendor,
      rotation_weeks,
      active
    } = req.body;

    const result = await db.query(
      `UPDATE vendors 
       SET name = COALESCE($2, name),
           vendor_type = COALESCE($3, vendor_type),
           capacity = COALESCE($4, capacity),
           contact = COALESCE($5, contact),
           email = COALESCE($6, email),
           address = COALESCE($7, address),
           phone = COALESCE($8, phone),
           maps_link = COALESCE($9, maps_link),
           color = COALESCE($10, color),
           is_rotation_vendor = COALESCE($11, is_rotation_vendor),
           rotation_weeks = COALESCE($12, rotation_weeks),
           active = COALESCE($13, active)
       WHERE id = $1
       RETURNING *`,
      [id, name, vendor_type, capacity, contact, email, address, phone, maps_link, color, is_rotation_vendor, rotation_weeks, active]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteVendor(req, res) {
  try {
    const { id } = req.params;
    
    // Soft delete by setting active to false
    const result = await db.query(
      'UPDATE vendors SET active = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deactivated successfully', vendor: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getVendors, createVendor, updateVendor, deleteVendor };
