import React, { useState, useEffect } from 'react';
import { schedulerService } from '../services/schedulerService';
import './ProgramManager.css';

const ProgramManager = ({ onUpdate }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    color: '#3788d8',
    am_time_slot: '10:00 AM',
    pm_time_slot: '2:00 PM'
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await schedulerService.getPrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        await schedulerService.updateProgram(editingProgram.id, formData);
      } else {
        await schedulerService.createProgram(formData);
      }
      await loadPrograms();
      resetForm();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      short_name: program.short_name,
      color: program.color,
      am_time_slot: program.am_time_slot,
      pm_time_slot: program.pm_time_slot
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await schedulerService.deleteProgram(id);
        await loadPrograms();
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      short_name: '',
      color: '#3788d8',
      am_time_slot: '10:00 AM',
      pm_time_slot: '2:00 PM'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && programs.length === 0) {
    return <div className="loading">Loading programs...</div>;
  }

  return (
    <div className="program-manager">
      <h2>Program Management</h2>
      
      <form onSubmit={handleSubmit} className="program-form">
        <h3>{editingProgram ? 'Edit' : 'Add'} Program</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">House Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Banyan House"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="short_name">Short Name</label>
            <input
              id="short_name"
              name="short_name"
              type="text"
              value={formData.short_name}
              onChange={handleChange}
              placeholder="e.g., BAN"
              maxLength="10"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
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
          
          <div className="form-group">
            <label htmlFor="am_time_slot">AM Time</label>
            <input
              id="am_time_slot"
              name="am_time_slot"
              type="text"
              value={formData.am_time_slot}
              onChange={handleChange}
              placeholder="e.g., 10:00 AM"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pm_time_slot">PM Time</label>
            <input
              id="pm_time_slot"
              name="pm_time_slot"
              type="text"
              value={formData.pm_time_slot}
              onChange={handleChange}
              placeholder="e.g., 2:00 PM"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingProgram ? 'Update' : 'Add'} Program
          </button>
          {editingProgram && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className="programs-list">
        <h3>Current Programs</h3>
        <div className="programs-grid">
          {programs.map(program => (
            <div 
              key={program.id} 
              className="program-card"
              style={{ borderLeftColor: program.color }}
            >
              <div className="program-header">
                <h4>{program.name}</h4>
                <span className="short-name" style={{ backgroundColor: program.color }}>
                  {program.short_name}
                </span>
              </div>
              
              <div className="program-details">
                <div className="time-slots">
                  <span className="time-slot">
                    <strong>AM:</strong> {program.am_time_slot}
                  </span>
                  <span className="time-slot">
                    <strong>PM:</strong> {program.pm_time_slot}
                  </span>
                </div>
              </div>
              
              <div className="program-actions">
                <button 
                  onClick={() => handleEdit(program)}
                  className="btn btn-sm btn-outline"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(program.id)}
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

export default ProgramManager;
