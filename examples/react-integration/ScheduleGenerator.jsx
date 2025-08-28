import React, { useState, useEffect } from 'react';
import { schedulerService } from '../services/schedulerService';
import './ScheduleGenerator.css';

const ScheduleGenerator = ({ onGenerate }) => {
  const [programs, setPrograms] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    start_month: 1,
    end_month: 12,
    selected_programs: [],
    selected_vendors: [],
    check_conflicts: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programsRes, vendorsRes] = await Promise.all([
        schedulerService.getPrograms(),
        schedulerService.getVendors()
      ]);
      
      setPrograms(programsRes.data);
      setVendors(vendorsRes.data.filter(v => v.active));
      
      // Select all programs and vendors by default
      setFormData(prev => ({
        ...prev,
        selected_programs: programsRes.data.map(p => p.id),
        selected_vendors: vendorsRes.data.filter(v => v.active).map(v => v.id)
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.selected_programs.length === 0) {
      alert('Please select at least one program');
      return;
    }
    
    if (formData.selected_vendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }
    
    try {
      setGenerating(true);
      setConflicts([]);
      
      // Check conflicts if enabled
      if (formData.check_conflicts) {
        const conflictRes = await schedulerService.checkConflicts({
          year: formData.year,
          start_month: formData.start_month,
          end_month: formData.end_month,
          program_ids: formData.selected_programs,
          vendor_ids: formData.selected_vendors
        });
        
        if (conflictRes.data.conflicts && conflictRes.data.conflicts.length > 0) {
          setConflicts(conflictRes.data.conflicts);
          const proceed = window.confirm(
            `Found ${conflictRes.data.conflicts.length} potential conflicts. Do you want to proceed anyway?`
          );
          if (!proceed) {
            setGenerating(false);
            return;
          }
        }
      }
      
      // Generate schedule
      const response = await schedulerService.generateYearSchedule({
        year: formData.year,
        start_month: formData.start_month,
        end_month: formData.end_month,
        program_ids: formData.selected_programs,
        vendor_ids: formData.selected_vendors
      });
      
      alert(`Successfully generated schedule for ${response.data.weeks_generated} weeks!`);
      
      if (onGenerate) {
        onGenerate();
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Error generating schedule. Please check the console for details.');
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProgramToggle = (programId) => {
    setFormData(prev => ({
      ...prev,
      selected_programs: prev.selected_programs.includes(programId)
        ? prev.selected_programs.filter(id => id !== programId)
        : [...prev.selected_programs, programId]
    }));
  };

  const handleVendorToggle = (vendorId) => {
    setFormData(prev => ({
      ...prev,
      selected_vendors: prev.selected_vendors.includes(vendorId)
        ? prev.selected_vendors.filter(id => id !== vendorId)
        : [...prev.selected_vendors, vendorId]
    }));
  };

  const selectAllPrograms = () => {
    setFormData(prev => ({
      ...prev,
      selected_programs: programs.map(p => p.id)
    }));
  };

  const selectNoPrograms = () => {
    setFormData(prev => ({
      ...prev,
      selected_programs: []
    }));
  };

  const selectAllVendors = () => {
    setFormData(prev => ({
      ...prev,
      selected_vendors: vendors.map(v => v.id)
    }));
  };

  const selectNoVendors = () => {
    setFormData(prev => ({
      ...prev,
      selected_vendors: []
    }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="schedule-generator">
      <h2>Schedule Generator</h2>
      
      <form onSubmit={handleSubmit} className="generator-form">
        <div className="form-section">
          <h3>Time Period</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                name="year"
                type="number"
                min="2024"
                max="2030"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="start_month">Start Month</label>
              <select
                id="start_month"
                name="start_month"
                value={formData.start_month}
                onChange={handleChange}
                required
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="end_month">End Month</label>
              <select
                id="end_month"
                name="end_month"
                value={formData.end_month}
                onChange={handleChange}
                required
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <div className="section-header">
            <h3>Programs</h3>
            <div className="selection-actions">
              <button type="button" onClick={selectAllPrograms} className="btn-link">
                Select All
              </button>
              <button type="button" onClick={selectNoPrograms} className="btn-link">
                Select None
              </button>
            </div>
          </div>
          
          <div className="selection-grid">
            {programs.map(program => (
              <label
                key={program.id}
                className={`selection-item ${formData.selected_programs.includes(program.id) ? 'selected' : ''}`}
                style={{ borderColor: program.color }}
              >
                <input
                  type="checkbox"
                  checked={formData.selected_programs.includes(program.id)}
                  onChange={() => handleProgramToggle(program.id)}
                />
                <span 
                  className="selection-label"
                  style={{ backgroundColor: program.color }}
                >
                  {program.name}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <div className="section-header">
            <h3>Vendors</h3>
            <div className="selection-actions">
              <button type="button" onClick={selectAllVendors} className="btn-link">
                Select All
              </button>
              <button type="button" onClick={selectNoVendors} className="btn-link">
                Select None
              </button>
            </div>
          </div>
          
          <div className="selection-grid">
            {vendors.map(vendor => {
              const activeWeeks = [];
              if (vendor.rotation_week_1) activeWeeks.push('1');
              if (vendor.rotation_week_2) activeWeeks.push('2');
              if (vendor.rotation_week_3) activeWeeks.push('3');
              if (vendor.rotation_week_4) activeWeeks.push('4');
              
              return (
                <label
                  key={vendor.id}
                  className={`selection-item ${formData.selected_vendors.includes(vendor.id) ? 'selected' : ''}`}
                  style={{ borderColor: vendor.color }}
                >
                  <input
                    type="checkbox"
                    checked={formData.selected_vendors.includes(vendor.id)}
                    onChange={() => handleVendorToggle(vendor.id)}
                  />
                  <span 
                    className="selection-label"
                    style={{ backgroundColor: vendor.color }}
                  >
                    {vendor.name}
                    <small className="vendor-weeks">
                      Week {activeWeeks.join(', ')}
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        
        <div className="form-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="check_conflicts"
              checked={formData.check_conflicts}
              onChange={handleChange}
            />
            Check for scheduling conflicts before generating
          </label>
        </div>
        
        {conflicts.length > 0 && (
          <div className="conflicts-warning">
            <h4>Potential Conflicts Detected:</h4>
            <ul>
              {conflicts.map((conflict, index) => (
                <li key={index}>
                  {conflict.date}: {conflict.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>
      </form>
      
      <div className="generator-info">
        <h3>How it works</h3>
        <ul>
          <li>The generator will create a schedule for all Mondays in the selected period</li>
          <li>Vendors are assigned based on their rotation settings (Week 1-4)</li>
          <li>Each program gets one vendor assignment per week</li>
          <li>The system prevents double-booking vendors on the same day</li>
          <li>Existing assignments will be overwritten</li>
        </ul>
      </div>
    </div>
  );
};

export default ScheduleGenerator;
