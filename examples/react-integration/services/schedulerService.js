import api from './schedulerAPI';

export const schedulerService = {
  // Programs
  getPrograms: () => api.get('/programs'),
  createProgram: (data) => api.post('/programs', data),
  updateProgram: (id, data) => api.put(`/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/programs/${id}`),

  // Vendors
  getVendors: () => api.get('/vendors'),
  createVendor: (data) => api.post('/vendors', data),
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/vendors/${id}`),

  // Schedules
  generateYearSchedule: (data) => api.post('/advanced-schedules/generate-year', data),
  getScheduleDetails: (date) => api.get(`/advanced-schedules/${date}/details`),
  getScheduleRange: (startDate, endDate) => 
    api.get('/advanced-schedules/range', { params: { start_date: startDate, end_date: endDate } }),
  updateAssignment: (date, data) => api.put(`/advanced-schedules/${date}/assignment`, data),
  
  // PDF Download - returns the URL for direct download
  downloadPDF: (date) => `${api.defaults.baseURL}/advanced-schedules/${date}/pdf`,
  
  // Notifications
  sendNotifications: (date, programs) => 
    api.post(`/advanced-schedules/${date}/notify`, { programs }),
  
  // Google Sheets
  syncGoogleSheets: (data) => api.post('/advanced-schedules/sync-sheets', data),
  
  // Conflicts
  checkConflicts: (data) => api.post('/advanced-schedules/check-conflicts', data),
  
  // Weekly View
  getWeeklySchedule: (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return api.get('/advanced-schedules/range', { 
      params: { 
        start_date: startDate.toISOString().split('T')[0], 
        end_date: endDate.toISOString().split('T')[0] 
      } 
    });
  },
  
  // Monthly View
  getMonthlySchedule: (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return api.get('/advanced-schedules/range', { 
      params: { 
        start_date: startDate.toISOString().split('T')[0], 
        end_date: endDate.toISOString().split('T')[0] 
      } 
    });
  },
  
  // Batch Operations
  batchUpdateSchedules: (updates) => api.put('/advanced-schedules/batch', { updates }),
  
  // Search
  searchSchedules: (params) => api.get('/advanced-schedules/search', { params }),
  
  // Statistics
  getScheduleStats: (year) => api.get(`/advanced-schedules/stats/${year}`),
  
  // Export
  exportSchedulesToCSV: (startDate, endDate) => 
    api.get('/advanced-schedules/export/csv', { 
      params: { start_date: startDate, end_date: endDate },
      responseType: 'blob'
    }),
  
  // Outing Expectations
  getOutingExpectations: () => api.get('/outing-expectations'),
  updateOutingExpectations: (id, data) => api.put(`/outing-expectations/${id}`, data),
  
  // Facility Settings (for multi-tenant support)
  getFacilitySettings: () => api.get('/facilities/current'),
  updateFacilitySettings: (data) => api.put('/facilities/current', data),
};

// Helper functions for common operations
export const scheduleHelpers = {
  // Format date for API calls
  formatDate: (date) => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },
  
  // Parse schedule data for calendar display
  parseScheduleForCalendar: (schedules) => {
    const events = [];
    
    schedules.forEach(schedule => {
      const date = new Date(schedule.schedule_date);
      
      // AM assignments
      schedule.am_assignments?.forEach(assignment => {
        events.push({
          id: `${schedule.id}-am-${assignment.program_id}`,
          title: `${assignment.program_name} - ${assignment.vendor_name}`,
          start: new Date(date.setHours(10, 0, 0)),
          end: new Date(date.setHours(12, 0, 0)),
          color: assignment.program_color,
          extendedProps: {
            type: 'am',
            programId: assignment.program_id,
            vendorId: assignment.vendor_id,
            scheduleId: schedule.id,
            vendorColor: assignment.vendor_color,
          }
        });
      });
      
      // PM assignments
      schedule.pm_assignments?.forEach(assignment => {
        events.push({
          id: `${schedule.id}-pm-${assignment.program_id}`,
          title: `${assignment.program_name} - ${assignment.vendor_name}`,
          start: new Date(date.setHours(14, 0, 0)),
          end: new Date(date.setHours(16, 0, 0)),
          color: assignment.program_color,
          extendedProps: {
            type: 'pm',
            programId: assignment.program_id,
            vendorId: assignment.vendor_id,
            scheduleId: schedule.id,
            vendorColor: assignment.vendor_color,
          }
        });
      });
    });
    
    return events;
  },
  
  // Check if a vendor is available for a specific date and rotation
  isVendorAvailable: (vendor, date, weekInMonth) => {
    const rotationKey = `rotation_week_${weekInMonth}`;
    return vendor[rotationKey] === true;
  },
  
  // Get week number in month (1-4)
  getWeekInMonth: (date) => {
    const d = new Date(date);
    const firstMonday = new Date(d.getFullYear(), d.getMonth(), 1);
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    const weekNumber = Math.ceil((d.getDate() - firstMonday.getDate() + 1) / 7) + 1;
    return Math.min(weekNumber, 4); // Cap at 4 weeks
  }
};

export default schedulerService;
