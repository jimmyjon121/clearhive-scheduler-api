// Family First Scheduler Desktop App - Main Application Logic
const API_BASE = 'https://clearhive-scheduler-api-production-4c35.up.railway.app';

class SchedulerApp {
    constructor() {
        this.apiUrl = API_BASE;
        this.currentView = 'dashboard';
        this.data = {
            programs: [],
            vendors: [],
            schedules: [],
            participants: []
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkConnection();
        await this.loadInitialData();
        this.showView('dashboard');
    }

    setupEventListeners() {
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.showView(view);
            });
        });

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-modal')) {
                this.closeModal();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.loadInitialData();
        });

        // Tab click events
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showTab(tab.dataset.tab);
            });
        });

        // Refresh buttons
        document.getElementById('refreshOverviewBtn')?.addEventListener('click', this.refreshOverview);
        document.getElementById('refreshProgramsBtn')?.addEventListener('click', this.loadPrograms);
        document.getElementById('refreshVendorsBtn')?.addEventListener('click', this.loadVendors);
        document.getElementById('refreshSchedulesBtn')?.addEventListener('click', this.loadSchedules);

        // Generate buttons
        document.getElementById('generateWeekBtn')?.addEventListener('click', this.generateWeekSchedule);
        document.getElementById('generateMonthBtn')?.addEventListener('click', this.generateMonthSchedules);

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('weekDate')?.setAttribute('value', today);
        const currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('monthDate')?.setAttribute('value', currentMonth);
    }

    async checkConnection() {
        const statusEl = document.getElementById('connectionStatus');
        const indicator = statusEl.querySelector('.status-indicator');
        const text = statusEl.querySelector('span');

        try {
            const response = await fetch(`${this.apiUrl}/health`);
            if (response.ok) {
                indicator.className = 'status-indicator online';
                text.textContent = 'Connected';
                return true;
            }
        } catch (error) {
            console.error('Connection failed:', error);
        }
        
        indicator.className = 'status-indicator offline';
        text.textContent = 'Disconnected';
        return false;
    }

    async loadInitialData() {
        try {
            // Load programs
            const programsResponse = await fetch(`${this.apiUrl}/api/programs`);
            this.data.programs = await programsResponse.json();

            // Load vendors
            const vendorsResponse = await fetch(`${this.apiUrl}/api/vendors`);
            this.data.vendors = await vendorsResponse.json();

            // Load schedules
            const schedulesResponse = await fetch(`${this.apiUrl}/api/schedules`);
            this.data.schedules = await schedulesResponse.json();

            // Update current view
            this.updateCurrentView();
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showNotification('Failed to load data. Please check your connection.', 'error');
        }
    }

    showView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update content area
        this.currentView = viewName;
        this.updateCurrentView();
    }

    updateCurrentView() {
        const content = document.getElementById('mainContent');
        
        switch (this.currentView) {
            case 'dashboard':
                content.innerHTML = this.renderDashboard();
                break;
            case 'programs':
                content.innerHTML = this.renderPrograms();
                break;
            case 'vendors':
                content.innerHTML = this.renderVendors();
                break;
            case 'schedules':
                content.innerHTML = this.renderSchedules();
                break;
            case 'reports':
                content.innerHTML = this.renderReports();
                break;
        }
    }

    renderDashboard() {
        const totalPrograms = this.data.programs.length;
        const totalVendors = this.data.vendors.length;
        const totalSchedules = this.data.schedules.length;
        const activePrograms = this.data.programs.filter(p => p.is_active).length;

        return `
            <div class="view-header">
                <h1>Dashboard</h1>
                <button class="btn btn-primary" id="refreshBtn">
                    <span>🔄</span> Refresh Data
                </button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-content">
                        <h3>${totalPrograms}</h3>
                        <p>Total Programs</p>
                        <small>${activePrograms} active</small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🏢</div>
                    <div class="stat-content">
                        <h3>${totalVendors}</h3>
                        <p>Total Vendors</p>
                        <small>${this.data.vendors.filter(v => v.is_active).length} active</small>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <h3>${totalSchedules}</h3>
                        <p>Total Schedules</p>
                        <small>This month</small>
                    </div>
                </div>
                
                <div class="stat-card action-card">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-content">
                        <h3>Quick Actions</h3>
                        <div class="quick-actions">
                            <button class="btn btn-sm btn-primary" onclick="app.showView('schedules')">
                                Generate Schedule
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="app.showView('reports')">
                                View Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="recent-activity">
                <h2>Recent Programs</h2>
                <div class="programs-preview">
                    ${this.data.programs.slice(0, 5).map(program => `
                        <div class="program-card">
                            <h4>${program.program_name}</h4>
                            <p>${program.description}</p>
                            <div class="program-meta">
                                <span class="capacity">👥 ${program.max_participants}</span>
                                <span class="status ${program.is_active ? 'active' : 'inactive'}">
                                    ${program.is_active ? '✅ Active' : '⏸️ Inactive'}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPrograms() {
        return `
            <div class="view-header">
                <h1>Therapeutic Programs</h1>
                <button class="btn btn-primary" onclick="app.showProgramModal()">
                    <span>➕</span> Add Program
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Program Name</th>
                            <th>Description</th>
                            <th>Max Participants</th>
                            <th>Duration (hours)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.programs.map(program => `
                            <tr>
                                <td><strong>${program.program_name}</strong></td>
                                <td>${program.description}</td>
                                <td>${program.max_participants}</td>
                                <td>${program.duration_hours}</td>
                                <td>
                                    <span class="status-badge ${program.is_active ? 'active' : 'inactive'}">
                                        ${program.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="app.editProgram(${program.id})">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="app.deleteProgram(${program.id})">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderVendors() {
        return `
            <div class="view-header">
                <h1>Vendors</h1>
                <button class="btn btn-primary" onclick="app.showVendorModal()">
                    <span>➕</span> Add Vendor
                </button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Vendor Name</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.vendors.map(vendor => `
                            <tr>
                                <td><strong>${vendor.vendor_name}</strong></td>
                                <td>${vendor.contact_person}</td>
                                <td>${vendor.phone}</td>
                                <td>${vendor.email}</td>
                                <td>${vendor.address}</td>
                                <td>
                                    <span class="status-badge ${vendor.is_active ? 'active' : 'inactive'}">
                                        ${vendor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="app.editVendor(${vendor.id})">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="app.deleteVendor(${vendor.id})">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderSchedules() {
        return `
            <div class="view-header">
                <h1>Schedule Management</h1>
                <button class="btn btn-primary" onclick="app.showScheduleGenerator()">
                    <span>🎯</span> Generate Schedule
                </button>
            </div>

            <div class="schedule-controls">
                <div class="control-group">
                    <label>Filter by Month:</label>
                    <input type="month" id="monthFilter" value="${new Date().toISOString().slice(0, 7)}">
                </div>
                <div class="control-group">
                    <label>Filter by Program:</label>
                    <select id="programFilter">
                        <option value="">All Programs</option>
                        ${this.data.programs.map(p => `<option value="${p.id}">${p.program_name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="schedules-view">
                ${this.data.schedules.length > 0 ? `
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Program</th>
                                    <th>Vendor</th>
                                    <th>Participants</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.data.schedules.map(schedule => `
                                    <tr>
                                        <td>${new Date(schedule.scheduled_date).toLocaleDateString()}</td>
                                        <td>${schedule.program_name || 'Unknown'}</td>
                                        <td>${schedule.vendor_name || 'Unknown'}</td>
                                        <td>${schedule.participant_count || 0}</td>
                                        <td>
                                            <span class="status-badge ${schedule.status}">
                                                ${schedule.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-secondary" onclick="app.viewSchedule(${schedule.id})">
                                                View
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="app.cancelSchedule(${schedule.id})">
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">📅</div>
                        <h3>No Schedules Yet</h3>
                        <p>Generate your first schedule to get started with therapeutic outings.</p>
                        <button class="btn btn-primary" onclick="app.showScheduleGenerator()">
                            Generate First Schedule
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    renderReports() {
        return `
            <div class="view-header">
                <h1>Reports & Analytics</h1>
                <button class="btn btn-primary" onclick="app.exportReport()">
                    <span>📤</span> Export Report
                </button>
            </div>

            <div class="reports-grid">
                <div class="report-card">
                    <h3>Program Utilization</h3>
                    <div class="report-chart">
                        <div class="chart-placeholder">
                            📊 Chart will render here
                        </div>
                    </div>
                </div>

                <div class="report-card">
                    <h3>Vendor Performance</h3>
                    <div class="report-chart">
                        <div class="chart-placeholder">
                            📈 Chart will render here
                        </div>
                    </div>
                </div>

                <div class="report-card">
                    <h3>Monthly Summary</h3>
                    <div class="summary-stats">
                        <div class="stat-row">
                            <span>Total Outings:</span>
                            <strong>${this.data.schedules.length}</strong>
                        </div>
                        <div class="stat-row">
                            <span>Active Programs:</span>
                            <strong>${this.data.programs.filter(p => p.is_active).length}</strong>
                        </div>
                        <div class="stat-row">
                            <span>Total Participants:</span>
                            <strong>${this.data.schedules.reduce((sum, s) => sum + (s.participant_count || 0), 0)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Modal and form handling methods
    showScheduleGenerator() {
        this.showModal('Schedule Generator', this.renderScheduleGeneratorForm());
    }

    renderScheduleGeneratorForm() {
        return `
            <form id="scheduleGeneratorForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="startDate">Start Date:</label>
                        <input type="date" id="startDate" name="startDate" required 
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="endDate">End Date:</label>
                        <input type="date" id="endDate" name="endDate" required 
                               value="${new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="selectedPrograms">Select Programs:</label>
                        <div class="checkbox-group">
                            ${this.data.programs.filter(p => p.is_active).map(program => `
                                <label class="checkbox-label">
                                    <input type="checkbox" name="selectedPrograms" value="${program.id}" checked>
                                    ${program.program_name}
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="maxPerWeek">Max Outings per Week:</label>
                        <input type="number" id="maxPerWeek" name="maxPerWeek" min="1" max="7" value="3">
                    </div>

                    <div class="form-group">
                        <label for="preferredDays">Preferred Days:</label>
                        <select id="preferredDays" name="preferredDays" multiple>
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3" selected>Wednesday</option>
                            <option value="4" selected>Thursday</option>
                            <option value="5" selected>Friday</option>
                            <option value="6">Saturday</option>
                            <option value="0">Sunday</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Generate Schedule</button>
                </div>
            </form>
        `;
    }

    async handleFormSubmit(e) {
        const form = e.target;
        
        if (form.id === 'scheduleGeneratorForm') {
            await this.generateSchedule(form);
        }
    }

    async generateSchedule(form) {
        const formData = new FormData(form);
        const selectedPrograms = Array.from(formData.getAll('selectedPrograms'));
        const preferredDays = Array.from(formData.getAll('preferredDays'));

        const scheduleData = {
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            programIds: selectedPrograms.map(id => parseInt(id)),
            maxPerWeek: parseInt(formData.get('maxPerWeek')),
            preferredDays: preferredDays.map(day => parseInt(day))
        };

        try {
            const response = await fetch(`${this.apiUrl}/api/schedules/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scheduleData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`Generated ${result.schedules.length} schedules successfully!`, 'success');
                this.closeModal();
                await this.loadInitialData();
                this.showView('schedules');
            } else {
                throw new Error('Failed to generate schedule');
            }
        } catch (error) {
            console.error('Schedule generation failed:', error);
            this.showNotification('Failed to generate schedule. Please try again.', 'error');
        }
    }

    showModal(title, content) {
        const modal = document.getElementById('modalContainer');
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body').innerHTML = content;
        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('modalContainer').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async exportReport() {
        try {
            const reportData = {
                programs: this.data.programs,
                vendors: this.data.vendors,
                schedules: this.data.schedules,
                generatedAt: new Date().toISOString()
            };

            // Use Electron's native dialog to save file
            const result = await window.electronAPI.saveReport(reportData);
            if (result.success) {
                this.showNotification('Report exported successfully!', 'success');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export report.', 'error');
        }
    }

    async refreshOverview() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/setup/status`);
            const data = await response.json();
            if (data.stats) {
                document.getElementById('programCount').textContent = `${data.stats.programs} programs`;
                document.getElementById('vendorCount').textContent = `${data.stats.vendors} vendors`;
                document.getElementById('scheduleCount').textContent = `${data.stats.schedules} schedules`;
            }
            const statusMsg = data.status === 'healthy' ? '✅ System is healthy and ready' : '⚠️ System needs attention';
            this.showNotification(statusMsg, data.status === 'healthy' ? 'success' : 'warning');
        } catch (error) {
            this.showNotification(`❌ Connection failed: ${error.message}`, 'error');
        }
    }

    async loadPrograms() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/programs`);
            const programs = await response.json();
            const programsList = document.getElementById('programsList');
            programsList.innerHTML = programs.map(program => `
                <div class="list-item">
                    <h4>${program.name}</h4>
                    <p><strong>Type:</strong> ${program.program_type}</p>
                    <p><strong>Duration:</strong> ${program.duration_hours} hours</p>
                    <p><strong>Description:</strong> ${program.description}</p>
                    <p><strong>Capacity:</strong> ${program.max_participants} participants</p>
                </div>
            `).join('');
        } catch (error) {
            document.getElementById('programsList').innerHTML = `<div class="status error">Failed to load programs: ${error.message}</div>`;
        }
    }

    async loadVendors() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/vendors`);
            const vendors = await response.json();
            const vendorsList = document.getElementById('vendorsList');
            vendorsList.innerHTML = vendors.map(vendor => `
                <div class="list-item">
                    <h4>${vendor.name}</h4>
                    <p><strong>Type:</strong> ${vendor.vendor_type}</p>
                    <p><strong>Contact:</strong> ${vendor.contact_info}</p>
                    <p><strong>Location:</strong> ${vendor.location}</p>
                    <p><strong>Capacity:</strong> ${vendor.capacity} people</p>
                    <p><strong>Available:</strong> ${vendor.availability}</p>
                </div>
            `).join('');
        } catch (error) {
            document.getElementById('vendorsList').innerHTML = `<div class="status error">Failed to load vendors: ${error.message}</div>`;
        }
    }

    async loadSchedules() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/schedules`);
            const schedules = await response.json();
            const schedulesList = document.getElementById('schedulesList');
            if (schedules.length === 0) {
                schedulesList.innerHTML = `<div class="status warning">No schedules found. Use the Generate tab to create some schedules!</div>`;
                return;
            }
            schedulesList.innerHTML = schedules.map(schedule => `
                <div class="list-item">
                    <h4>Schedule for ${new Date(schedule.schedule_date).toLocaleDateString()}</h4>
                    <p><strong>Program:</strong> ${schedule.program_name || 'N/A'}</p>
                    <p><strong>Vendor:</strong> ${schedule.vendor_name || 'N/A'}</p>
                    <p><strong>Time:</strong> ${schedule.start_time} - ${schedule.end_time}</p>
                    <p><strong>Participants:</strong> ${schedule.participant_count}</p>
                </div>
            `).join('');
        } catch (error) {
            document.getElementById('schedulesList').innerHTML = `<div class="status error">Failed to load schedules: ${error.message}</div>`;
        }
    }

    async generateWeekSchedule() {
        const weekDate = document.getElementById('weekDate').value;
        if (!weekDate) {
            this.showNotification('Please select a date', 'error');
            return;
        }
        try {
            this.showNotification('🔄 Generating weekly schedule...', 'warning');
            const response = await fetch(`${API_BASE}/api/v1/schedules/generate/week`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: weekDate })
            });
            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ Generated ${result.schedulesCreated} schedules for the week!`);
                this.refreshOverview();
            } else {
                this.showNotification(`❌ Failed: ${result.message}`, 'error');
            }
        } catch (error) {
            this.showNotification(`❌ Error: ${error.message}`, 'error');
        }
    }

    async generateMonthSchedules() {
        const monthDate = document.getElementById('monthDate').value;
        if (!monthDate) {
            this.showNotification('Please select a month', 'error');
            return;
        }
        try {
            this.showNotification('🔄 Generating monthly schedules...', 'warning');
            const [year, month] = monthDate.split('-');
            const response = await fetch(`${API_BASE}/api/v1/schedules/generate/month`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: parseInt(year), month: parseInt(month) })
            });
            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ Generated ${result.schedulesCreated} schedules for the month!`);
                this.refreshOverview();
            } else {
                this.showNotification(`❌ Failed: ${result.message}`, 'error');
            }
        } catch (error) {
            this.showNotification(`❌ Error: ${error.message}`, 'error');
        }
    }

    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
        if (tabName === 'programs') this.loadPrograms();
        if (tabName === 'vendors') this.loadVendors();
        if (tabName === 'schedules') this.loadSchedules();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SchedulerApp();
});
