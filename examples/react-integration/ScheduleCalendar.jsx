import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { schedulerService } from '../../services/schedulerService';
import './ScheduleCalendar.css';

const ScheduleCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {
    loadWeekSchedules();
    loadPrograms();
  }, [currentWeek]);

  const loadPrograms = async () => {
    try {
      const response = await schedulerService.getPrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadWeekSchedules = async () => {
    setLoading(true);
    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
      
      const response = await schedulerService.getScheduleRange(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      );
      
      const scheduleMap = {};
      response.data.forEach(schedule => {
        scheduleMap[schedule.schedule_date] = schedule;
      });
      
      setSchedules(scheduleMap);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (date.getDay() === 2) { // Tuesday
      setShowPDFModal(true);
    }
  };

  const handleGenerateYear = async () => {
    if (window.confirm('Generate schedules for the next 52 weeks?')) {
      setLoading(true);
      try {
        const nextTuesday = getNextTuesday();
        await schedulerService.generateYearSchedule({
          facility_id: 1,
          start_date: format(nextTuesday, 'yyyy-MM-dd'),
          weeks: 52
        });
        await loadWeekSchedules();
        alert('Successfully generated year schedule!');
      } catch (error) {
        alert('Error generating schedule: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSyncGoogleSheets = async () => {
    setLoading(true);
    try {
      const response = await schedulerService.syncGoogleSheets({
        date_range: {
          start: format(startOfWeek(currentWeek), 'yyyy-MM-dd'),
          end: format(addWeeks(currentWeek, 12), 'yyyy-MM-dd')
        }
      });
      
      if (response.data.url) {
        window.open(response.data.url, '_blank');
      }
      alert('Successfully synced to Google Sheets!');
    } catch (error) {
      alert('Error syncing to Google Sheets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotifications = async (date) => {
    if (window.confirm(`Send email notifications for ${format(date, 'MMMM d, yyyy')}?`)) {
      try {
        await schedulerService.sendNotifications(format(date, 'yyyy-MM-dd'));
        alert('Notifications sent successfully!');
      } catch (error) {
        alert('Error sending notifications: ' + error.message);
      }
    }
  };

  const getNextTuesday = () => {
    const today = new Date();
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    return nextTuesday;
  };

  const renderWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const schedule = schedules[dateStr];
      const isTuesday = day.getDay() === 2;

      return (
        <div 
          key={dateStr} 
          className={`calendar-day ${isTuesday ? 'tuesday' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-header">
            <div className="day-name">{format(day, 'EEE')}</div>
            <div className="day-number">{format(day, 'd')}</div>
          </div>

          {isTuesday && schedule && (
            <div className="day-content">
              <div className="schedule-indicator">
                {Object.keys(schedule.assignments).length} outings
              </div>
              <button 
                className="pdf-button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(schedulerService.downloadPDF(dateStr), '_blank');
                }}
              >
                📄 PDF
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  const renderScheduleDetails = () => {
    if (!selectedDate || selectedDate.getDay() !== 2) return null;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const schedule = schedules[dateStr];

    if (!schedule) return null;

    return (
      <div className="schedule-details">
        <h3>Schedule for {format(selectedDate, 'MMMM d, yyyy')}</h3>
        
        <div className="programs-grid">
          {programs.map(program => {
            const assignment = schedule.assignments[program.house_name];
            if (!assignment) return null;

            return (
              <div 
                key={program.id} 
                className="program-card"
                style={{ borderLeftColor: program.color }}
              >
                <div className="program-header">
                  <span 
                    className="color-indicator" 
                    style={{ backgroundColor: program.color }}
                  />
                  <h4>{program.house_name}</h4>
                </div>
                
                <div className="vendor-info" style={{ backgroundColor: `${assignment.color}20` }}>
                  <div className="vendor-name">{assignment.vendor}</div>
                  <div className="vendor-time">{assignment.time}</div>
                  {assignment.address && (
                    <div className="vendor-address">
                      📍 {assignment.address}
                    </div>
                  )}
                  {assignment.phone && (
                    <div className="vendor-contact">
                      📞 {assignment.phone}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="schedule-actions">
          <button 
            onClick={() => window.open(schedulerService.downloadPDF(dateStr), '_blank')}
            className="action-button primary"
          >
            Download PDF
          </button>
          <button 
            onClick={() => handleSendNotifications(selectedDate)}
            className="action-button"
          >
            Send Notifications
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <h2>Therapeutic Outing Schedule</h2>
        
        <div className="calendar-controls">
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            ← Previous
          </button>
          
          <span className="current-week">
            {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
          </span>
          
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            Next →
          </button>
        </div>

        <div className="calendar-actions">
          <button 
            onClick={handleGenerateYear}
            className="action-button primary"
            disabled={loading}
          >
            Generate Year Schedule
          </button>
          <button 
            onClick={handleSyncGoogleSheets}
            className="action-button"
            disabled={loading}
          >
            Sync to Google Sheets
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading schedules...</div>
      ) : (
        <>
          <div className="calendar-grid">
            {renderWeekDays()}
          </div>
          
          {selectedDate && renderScheduleDetails()}
        </>
      )}
    </div>
  );
};

export default ScheduleCalendar;
