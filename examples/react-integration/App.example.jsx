import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { SchedulerProvider } from './hooks/useScheduler';
import ScheduleCalendar from './components/ScheduleCalendar';
import ProgramManager from './components/ProgramManager';
import VendorManager from './components/VendorManager';
import ScheduleGenerator from './components/ScheduleGenerator';
import { schedulerService } from './services/schedulerService';
import './App.css';

// Main App Component with Router
function App() {
  return (
    <Router>
      <SchedulerProvider>
        <AppContent />
      </SchedulerProvider>
    </Router>
  );
}

// App Content with Navigation
function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for saved auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('authToken');
    if (savedAuth) {
      setUser({ name: 'Admin', token: savedAuth });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>Family First Scheduler</h1>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/schedule">Schedule</Link></li>
          <li><Link to="/programs">Programs</Link></li>
          <li><Link to="/vendors">Vendors</Link></li>
          <li><Link to="/generate">Generate</Link></li>
          <li><Link to="/reports">Reports</Link></li>
        </ul>
        <div className="nav-user">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <button onClick={() => setUser({ name: 'Admin' })}>Login</button>
          )}
        </div>
      </nav>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<ScheduleCalendar />} />
          <Route path="/programs" element={<ProgramManager />} />
          <Route path="/vendors" element={<VendorManager />} />
          <Route path="/generate" element={<ScheduleGenerator onGenerate={() => navigate('/schedule')} />} />
          <Route path="/reports" element={<ReportsView />} />
        </Routes>
      </main>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalVendors: 0,
    upcomingOutings: 0,
    currentWeek: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [programsRes, vendorsRes, weekRes] = await Promise.all([
        schedulerService.getPrograms(),
        schedulerService.getVendors(),
        schedulerService.getWeeklySchedule(new Date())
      ]);

      setStats({
        totalPrograms: programsRes.data.length,
        totalVendors: vendorsRes.data.filter(v => v.active).length,
        upcomingOutings: weekRes.data.schedules.length * 2, // AM + PM
        currentWeek: weekRes.data.schedules
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalPrograms}</h3>
          <p>Active Programs</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalVendors}</h3>
          <p>Active Vendors</p>
        </div>
        <div className="stat-card">
          <h3>{stats.upcomingOutings}</h3>
          <p>This Week's Outings</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/schedule'}
          >
            View Today's Schedule
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => downloadWeeklyPDF()}
          >
            Download This Week's PDF
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/generate'}
          >
            Generate New Schedule
          </button>
        </div>
      </div>

      <div className="week-preview">
        <h3>This Week's Schedule</h3>
        <div className="week-grid">
          {stats.currentWeek.map(day => (
            <div key={day.schedule_date} className="day-preview">
              <h4>{new Date(day.schedule_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
              <div className="assignments-preview">
                {day.am_assignments?.map(a => (
                  <div key={`am-${a.program_id}`} className="assignment-preview" style={{ borderLeftColor: a.program_color }}>
                    <span className="time">AM:</span> {a.program_name} → {a.vendor_name}
                  </div>
                ))}
                {day.pm_assignments?.map(a => (
                  <div key={`pm-${a.program_id}`} className="assignment-preview" style={{ borderLeftColor: a.program_color }}>
                    <span className="time">PM:</span> {a.program_name} → {a.vendor_name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reports View Component
function ReportsView() {
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await schedulerService.getScheduleRange(dateRange.start, dateRange.end);
      
      // Process data for report
      const vendorStats = {};
      const programStats = {};
      
      response.data.schedules.forEach(schedule => {
        // Count vendor usage
        [...(schedule.am_assignments || []), ...(schedule.pm_assignments || [])].forEach(assignment => {
          vendorStats[assignment.vendor_name] = (vendorStats[assignment.vendor_name] || 0) + 1;
          programStats[assignment.program_name] = (programStats[assignment.program_name] || 0) + 1;
        });
      });
      
      setReportData({
        totalDays: response.data.schedules.length,
        totalOutings: response.data.schedules.length * 12, // 6 programs * 2 slots
        vendorStats,
        programStats
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      if (format === 'pdf') {
        // Generate PDF report
        const pdfUrl = schedulerService.downloadPDF(dateRange.start);
        window.open(pdfUrl, '_blank');
      } else if (format === 'csv') {
        // Export as CSV
        const blob = await schedulerService.exportSchedulesToCSV(dateRange.start, dateRange.end);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedule-report-${dateRange.start}-to-${dateRange.end}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  useEffect(() => {
    generateReport();
  }, [dateRange]);

  return (
    <div className="reports-view">
      <h2>Reports</h2>
      
      <div className="report-controls">
        <div className="date-range">
          <label>
            Start Date:
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </label>
          <label>
            End Date:
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </label>
        </div>
        
        <div className="export-buttons">
          <button onClick={() => exportReport('pdf')} className="btn btn-primary">
            Export PDF
          </button>
          <button onClick={() => exportReport('csv')} className="btn btn-secondary">
            Export CSV
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Generating report...</div>
      ) : reportData && (
        <div className="report-content">
          <div className="report-summary">
            <h3>Summary</h3>
            <p>Total Days: {reportData.totalDays}</p>
            <p>Total Outings: {reportData.totalOutings}</p>
          </div>
          
          <div className="report-stats">
            <div className="vendor-usage">
              <h3>Vendor Usage</h3>
              <table>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Times Used</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.vendorStats).sort((a, b) => b[1] - a[1]).map(([vendor, count]) => (
                    <tr key={vendor}>
                      <td>{vendor}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="program-stats">
              <h3>Program Outings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Total Outings</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.programStats).sort((a, b) => b[1] - a[1]).map(([program, count]) => (
                    <tr key={program}>
                      <td>{program}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for downloading weekly PDF
async function downloadWeeklyPDF() {
  const monday = new Date();
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  const dateStr = monday.toISOString().split('T')[0];
  const pdfUrl = schedulerService.downloadPDF(dateStr);
  window.open(pdfUrl, '_blank');
}

export default App;
