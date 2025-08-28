import { useState, useCallback, useEffect } from 'react';
import { schedulerService } from '../../../services/schedulerService';

export const useScheduler = () => {
  const [programs, setPrograms] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [programsRes, vendorsRes] = await Promise.all([
        schedulerService.getPrograms(),
        schedulerService.getVendors()
      ]);
      
      setPrograms(programsRes.data);
      setVendors(vendorsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Schedule operations
  const generateYearSchedule = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const nextTuesday = getNextTuesday();
      const data = {
        facility_id: options.facilityId || 1,
        start_date: options.startDate || nextTuesday.toISOString().split('T')[0],
        weeks: options.weeks || 52
      };
      
      const response = await schedulerService.generateYearSchedule(data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSchedule = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schedulerService.getScheduleDetails(date);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssignment = useCallback(async (date, programName, vendorId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for conflicts first
      const conflictCheck = await schedulerService.checkConflicts({
        date,
        program_name: programName,
        vendor_id: vendorId,
        facility_id: 1
      });
      
      if (conflictCheck.data.conflicts.length > 0) {
        const conflict = conflictCheck.data.conflicts[0];
        throw new Error(conflict.message);
      }
      
      // Update assignment
      const response = await schedulerService.updateAssignment(date, {
        program_name: programName,
        vendor_id: vendorId,
        facility_id: 1
      });
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Program operations
  const createProgram = useCallback(async (programData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schedulerService.createProgram(programData);
      await loadInitialData(); // Refresh data
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgram = useCallback(async (id, programData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schedulerService.updateProgram(id, programData);
      await loadInitialData(); // Refresh data
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Vendor operations
  const createVendor = useCallback(async (vendorData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schedulerService.createVendor(vendorData);
      await loadInitialData(); // Refresh data
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendor = useCallback(async (id, vendorData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schedulerService.updateVendor(id, vendorData);
      await loadInitialData(); // Refresh data
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Notification operations
  const sendNotifications = useCallback(async (date, programNames = []) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schedulerService.sendNotifications(date, programNames);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Google Sheets operations
  const syncToGoogleSheets = useCallback(async (dateRange, spreadsheetId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = {
        date_range: dateRange,
        facility_id: 1
      };
      
      if (spreadsheetId) {
        data.spreadsheet_id = spreadsheetId;
      }
      
      const response = await schedulerService.syncGoogleSheets(data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility functions
  const getNextTuesday = () => {
    const today = new Date();
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    return nextTuesday;
  };

  const getRotationVendors = useCallback(() => {
    return vendors.filter(v => v.is_rotation_vendor && v.active);
  }, [vendors]);

  const getRegularVendors = useCallback(() => {
    return vendors.filter(v => !v.is_rotation_vendor && v.active);
  }, [vendors]);

  const getProgramByName = useCallback((name) => {
    return programs.find(p => p.house_name === name);
  }, [programs]);

  const getVendorById = useCallback((id) => {
    return vendors.find(v => v.id === id);
  }, [vendors]);

  // Check for scheduling conflicts
  const checkConflicts = useCallback(async (date, programName, vendorId) => {
    try {
      const response = await schedulerService.checkConflicts({
        date,
        program_name: programName,
        vendor_id: vendorId,
        facility_id: 1
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    // State
    programs,
    vendors,
    loading,
    error,
    
    // Schedule operations
    generateYearSchedule,
    getSchedule,
    updateAssignment,
    
    // Program operations
    createProgram,
    updateProgram,
    
    // Vendor operations
    createVendor,
    updateVendor,
    
    // Notifications
    sendNotifications,
    
    // Google Sheets
    syncToGoogleSheets,
    
    // Utility functions
    getNextTuesday,
    getRotationVendors,
    getRegularVendors,
    getProgramByName,
    getVendorById,
    checkConflicts,
    
    // Data refresh
    refreshData: loadInitialData
  };
};

// Context provider for app-wide scheduler state
import React, { createContext, useContext } from 'react';

const SchedulerContext = createContext();

export const SchedulerProvider = ({ children }) => {
  const scheduler = useScheduler();
  
  return (
    <SchedulerContext.Provider value={scheduler}>
      {children}
    </SchedulerContext.Provider>
  );
};

export const useSchedulerContext = () => {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error('useSchedulerContext must be used within a SchedulerProvider');
  }
  return context;
};
