import React, { useState, useEffect } from 'react';
import { schedulerService } from '../services/schedulerService';
import './VendorManager.css';

const VendorManager = ({ onUpdate }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#28a745',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    google_maps_link: '',
    rotation_week_1: true,
    rotation_week_2: true,
    rotation_week_3: true,
    rotation_week_4: true,
    active: true
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await schedulerService.getVendors();
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await schedulerService.updateVendor(editingVendor.id, formData);
      } else {
        await schedulerService.createVendor(formData);
      }
      await loadVendors();
      resetForm();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      color: vendor.color,
      contact_name: vendor.contact_name || '',
      contact_phone: vendor.contact_phone || '',
      contact_email: vendor.contact_email || '',
      address: vendor.address || '',
      google_maps_link: vendor.google_maps_link || '',
      rotation_week_1: vendor.rotation_week_1,
      rotation_week_2: vendor.rotation_week_2,
      rotation_week_3: vendor.rotation_week_3,
      rotation_week_4: vendor.rotation_week_4,
      active: vendor.active
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await schedulerService.deleteVendor(id);
        await loadVendors();
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      color: '#28a745',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      address: '',
      google_maps_link: '',
      rotation_week_1: true,
      rotation_week_2: true,
      rotation_week_3: true,
      rotation_week_4: true,
      active: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getActiveWeeks = (vendor) => {
    const weeks = [];
    if (vendor.rotation_week_1) weeks.push('1');
    if (vendor.rotation_week_2) weeks.push('2');
    if (vendor.rotation_week_3) weeks.push('3');
    if (vendor.rotation_week_4) weeks.push('4');
    return weeks;
  };

  if (loading && vendors.length === 0) {
    return <div className="loading">Loading vendors...</div>;
  }

  return (
    <div className="vendor-manager">
      <h2>Vendor Management</h2>
      
      <form onSubmit={handleSubmit} className="vendor-form">
        <h3>{editingVendor ? 'Edit' : 'Add'} Vendor</h3>
        
        <div className="form-row">
          <div className="form-group form-group-wide">
            <label htmlFor="name">Vendor Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Orlando Science Center"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-input-wrapper">
              <input
                id="color"
                name="color"
                type="color"
                value={formData.color}
                onChange={handleChange}
                required
              />
              <span className="color-preview" style={{ backgroundColor: formData.color }}>
                {formData.color}
              </span>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contact_name">Contact Name</label>
            <input
              id="contact_name"
              name="contact_name"
              type="text"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="e.g., John Smith"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact_phone">Contact Phone</label>
            <input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="e.g., (407) 555-1234"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact_email">Contact Email</label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="e.g., contact@vendor.com"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group form-group-wide">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., 777 E Princeton St, Orlando, FL 32803"
            />
          </div>
          
          <div className="form-group form-group-wide">
            <label htmlFor="google_maps_link">Google Maps Link</label>
            <input
              id="google_maps_link"
              name="google_maps_link"
              type="url"
              value={formData.google_maps_link}
              onChange={handleChange}
              placeholder="e.g., https://maps.google.com/..."
            />
          </div>
        </div>
        
        <div className="form-section">
          <h4>Rotation Schedule</h4>
          <div className="rotation-weeks">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rotation_week_1"
                checked={formData.rotation_week_1}
                onChange={handleChange}
              />
              Week 1
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rotation_week_2"
                checked={formData.rotation_week_2}
                onChange={handleChange}
              />
              Week 2
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rotation_week_3"
                checked={formData.rotation_week_3}
                onChange={handleChange}
              />
              Week 3
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rotation_week_4"
                checked={formData.rotation_week_4}
                onChange={handleChange}
              />
              Week 4
            </label>
          </div>
        </div>
        
        <div className="form-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            Active Vendor
          </label>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingVendor ? 'Update' : 'Add'} Vendor
          </button>
          {editingVendor && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className="vendors-list">
        <h3>Current Vendors ({vendors.length})</h3>
        <div className="vendors-grid">
          {vendors.map(vendor => (
            <div 
              key={vendor.id} 
              className={`vendor-card ${!vendor.active ? 'inactive' : ''}`}
              style={{ borderLeftColor: vendor.color }}
            >
              <div className="vendor-header">
                <h4>{vendor.name}</h4>
                <span 
                  className="vendor-badge" 
                  style={{ backgroundColor: vendor.color }}
                >
                  {vendor.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="vendor-details">
                {(vendor.contact_name || vendor.contact_phone || vendor.contact_email) && (
                  <div className="contact-info">
                    {vendor.contact_name && <p><strong>Contact:</strong> {vendor.contact_name}</p>}
                    {vendor.contact_phone && (
                      <p>
                        <strong>Phone:</strong> 
                        <a href={`tel:${vendor.contact_phone}`}>{vendor.contact_phone}</a>
                      </p>
                    )}
                    {vendor.contact_email && (
                      <p>
                        <strong>Email:</strong> 
                        <a href={`mailto:${vendor.contact_email}`}>{vendor.contact_email}</a>
                      </p>
                    )}
                  </div>
                )}
                
                {vendor.address && (
                  <div className="address-info">
                    <p><strong>Address:</strong> {vendor.address}</p>
                    {vendor.google_maps_link && (
                      <a 
                        href={vendor.google_maps_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="maps-link"
                      >
                        Open in Maps →
                      </a>
                    )}
                  </div>
                )}
                
                <div className="rotation-info">
                  <strong>Active Weeks:</strong> 
                  <span className="rotation-weeks-display">
                    {getActiveWeeks(vendor).length > 0 
                      ? `Week ${getActiveWeeks(vendor).join(', ')}` 
                      : 'No weeks selected'
                    }
                  </span>
                </div>
              </div>
              
              <div className="vendor-actions">
                <button 
                  onClick={() => handleEdit(vendor)}
                  className="btn btn-sm btn-outline"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(vendor.id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorManager;
