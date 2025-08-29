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
            stats: {
                programs: 0,
                vendors: 0,
                schedules: 0
            }
        };
        
        this.init();
    }

    async init() {
        this.setupAnimationMode();
        this.setupEventListeners();
        await this.checkConnection();
        await this.loadInitialData();
        this.showTab('overview'); // Start with overview tab
        this.initAdvancedAnimations();
    }

    setupAnimationMode() {
        const modeToggle = document.getElementById('modeToggle');
        const savedMode = localStorage.getItem('animationMode') || 'advanced';
        
        if (savedMode === 'simple') {
            document.body.classList.remove('advanced-animations');
            document.body.classList.add('simple-mode');
            modeToggle.textContent = 'Simple Mode';
        }
        
        modeToggle.addEventListener('click', () => {
            const isAdvanced = document.body.classList.contains('advanced-animations');
            
            if (isAdvanced) {
                document.body.classList.remove('advanced-animations');
                document.body.classList.add('simple-mode');
                modeToggle.textContent = 'Simple Mode';
                localStorage.setItem('animationMode', 'simple');
            } else {
                document.body.classList.remove('simple-mode');
                document.body.classList.add('advanced-animations');
                modeToggle.textContent = 'Advanced Mode';
                localStorage.setItem('animationMode', 'advanced');
                this.initAdvancedAnimations();
            }
            
            // Add a ripple effect on mode change
            this.createRippleEffect(modeToggle);
        });
    }

    initAdvancedAnimations() {
        // Add staggered animations to elements
        document.querySelectorAll('.nav-item').forEach((item, index) => {
            item.style.setProperty('--item-index', index);
        });
        
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.style.setProperty('--card-index', index);
        });
        
        // Add parallax mouse effects
        if (document.body.classList.contains('advanced-animations')) {
            this.setupParallaxEffect();
        }
    }

    setupParallaxEffect() {
        const cards = document.querySelectorAll('.stat-card, .list-item');
        
        document.addEventListener('mousemove', (e) => {
            if (!document.body.classList.contains('advanced-animations')) return;
            
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;
                
                const angleX = (clientY - cardCenterY) * 0.01;
                const angleY = (clientX - cardCenterX) * 0.01;
                
                card.style.transform = `perspective(1000px) rotateX(${-angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
            });
        });
    }

    createRippleEffect(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.background = 'rgba(255,255,255,0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    setupEventListeners() {
        // Tab click events
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showTab(tab.dataset.tab);
                if (document.body.classList.contains('advanced-animations')) {
                    this.createRippleEffect(tab);
                }
            });
        });

        // Refresh buttons
        document.getElementById('refreshOverviewBtn')?.addEventListener('click', () => this.refreshOverview());
        document.getElementById('refreshProgramsBtn')?.addEventListener('click', () => this.loadPrograms());
        document.getElementById('refreshVendorsBtn')?.addEventListener('click', () => this.loadVendors());
        document.getElementById('refreshSchedulesBtn')?.addEventListener('click', () => this.loadSchedules());

        // Generate buttons
        document.getElementById('generateWeekBtn')?.addEventListener('click', () => this.generateWeekSchedule());
        document.getElementById('generateMonthBtn')?.addEventListener('click', () => this.generateMonthSchedules());

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('weekDate')?.setAttribute('value', today);
        const currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('monthDate')?.setAttribute('value', currentMonth);

        // Navigation menu (sidebar)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active class from all items
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                // Add active class to clicked item
                item.classList.add('active');
                
                // Map nav items to tabs
                const viewMap = {
                    'dashboard': 'overview',
                    'programs': 'programs',
                    'vendors': 'vendors',
                    'schedules': 'schedules',
                    'reports': 'generate'
                };
                
                const view = item.dataset.view;
                const tabName = viewMap[view] || view;
                this.showTab(tabName);
            });
        });
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
            // Load initial overview data
            await this.refreshOverview();
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showNotification('Failed to load data. Please check your connection.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300)">×</button>
            <div class="notification-progress"></div>
        `;
        
        container.appendChild(notification);
        
        // Animate progress bar
        if (document.body.classList.contains('advanced-animations')) {
            const progressBar = notification.querySelector('.notification-progress');
            progressBar.style.animation = 'notificationProgress 5s linear';
        }
        
        setTimeout(() => {
            notification.classList.add('removing');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
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
                            <button class="btn btn-sm btn-primary" onclick="app.showTab('generate')">
                                Generate Schedule
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="app.showTab('schedules')">
                                View Schedules
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
            const response = await fetch(`${this.apiUrl}/api/v1/schedules/generate`, {
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
                this.showTab('schedules');
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
            // Get status from setup endpoint
            const response = await fetch(`${API_BASE}/api/v1/setup/status`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Update counts
            if (data.stats) {
                document.getElementById('programCount').textContent = `${data.stats.programs || 0}`;
                document.getElementById('vendorCount').textContent = `${data.stats.vendors || 0}`;
                document.getElementById('scheduleCount').textContent = `${data.stats.schedules || 0}`;
            }
            
            // Also load the actual data for the overview
            await this.loadPrograms();
            await this.loadVendors();
            
        } catch (error) {
            console.error('Failed to refresh overview:', error);
            document.getElementById('programCount').textContent = 'Error loading';
            document.getElementById('vendorCount').textContent = 'Error loading';
            document.getElementById('scheduleCount').textContent = 'Error loading';
            this.showNotification(`❌ Failed to load data: ${error.message}`, 'error');
        }
    }

    async loadPrograms() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/programs?facility_id=1`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const programs = await response.json();
            
            this.data.programs = programs; // Store for later use
            
            const programsList = document.getElementById('programsList');
            if (programsList) {
                if (programs.length === 0) {
                    programsList.innerHTML = '<div class="empty-state">No programs found. Add your first program!</div>';
                } else {
                    programsList.innerHTML = programs.map(program => `
                        <div class="list-item" style="border-left: 4px solid ${program.color || '#3498db'}">
                            <h4>${program.house_name || program.name || 'Unnamed Program'}</h4>
                            <p><strong>Schedule:</strong> Tuesday ${program.tuesday_start || 'N/A'} - ${program.tuesday_end || 'N/A'}</p>
                            <p><strong>Priority:</strong> ${program.priority || 'N/A'}</p>
                            <p><strong>Coordinator Email:</strong> ${program.program_coordinator_email || 'Not set'}</p>
                            <p><strong>Color:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${program.color || '#ccc'}; vertical-align: middle;"></span> ${program.color || 'Not set'}</p>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Failed to load programs:', error);
            const programsList = document.getElementById('programsList');
            if (programsList) {
                programsList.innerHTML = `<div class="error-state">Failed to load programs: ${error.message}</div>`;
            }
        }
    }

    async loadVendors() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/vendors?facility_id=1`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const vendors = await response.json();
            
            this.data.vendors = vendors; // Store for later use
            
            const vendorsList = document.getElementById('vendorsList');
            if (vendorsList) {
                if (vendors.length === 0) {
                    vendorsList.innerHTML = '<div class="empty-state">No vendors found. Add your first vendor!</div>';
                } else {
                    vendorsList.innerHTML = vendors.map(vendor => `
                        <div class="list-item" style="border-left: 4px solid ${vendor.color || '#6c757d'}">
                            <h4>${vendor.name || 'Unnamed Vendor'}</h4>
                            <p><strong>Type:</strong> ${vendor.vendor_type || 'Not specified'}</p>
                            <p><strong>Contact:</strong> ${vendor.contact || 'N/A'} ${vendor.phone ? `- ${vendor.phone}` : ''}</p>
                            <p><strong>Email:</strong> ${vendor.email || 'Not provided'}</p>
                            <p><strong>Address:</strong> ${vendor.address || 'Not provided'}</p>
                            <p><strong>Capacity:</strong> ${vendor.capacity || 10} people</p>
                            ${vendor.is_rotation_vendor ? '<p><strong>🔄 Rotation Vendor</strong> (' + vendor.rotation_weeks + ' week rotation)</p>' : ''}
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Failed to load vendors:', error);
            const vendorsList = document.getElementById('vendorsList');
            if (vendorsList) {
                vendorsList.innerHTML = `<div class="error-state">Failed to load vendors: ${error.message}</div>`;
            }
        }
    }

    async loadSchedules() {
        try {
            const response = await fetch(`${API_BASE}/api/v1/schedules?facility_id=1`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const schedules = await response.json();
            
            this.data.schedules = schedules;
            
            const schedulesList = document.getElementById('schedulesList');
            if (schedulesList) {
                if (schedules.length === 0) {
                    schedulesList.innerHTML = `<div class="empty-state">
                        <p>No schedules found.</p>
                        <p>Use the Generate tab to create schedules!</p>
                    </div>`;
                } else {
                    schedulesList.innerHTML = schedules.map(schedule => {
                        const assignments = schedule.assignments || {};
                        const scheduleItems = Object.entries(assignments).map(([programName, vendorId]) => {
                            const vendor = this.data.vendors.find(v => v.id === vendorId);
                            return `<li>${programName} → ${vendor ? vendor.name : 'Unknown Vendor'}</li>`;
                        }).join('');
                        
                        return `
                            <div class="list-item">
                                <h4>Schedule for ${new Date(schedule.schedule_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                ${scheduleItems ? `<ul>${scheduleItems}</ul>` : '<p>No assignments yet</p>'}
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Failed to load schedules:', error);
            const schedulesList = document.getElementById('schedulesList');
            if (schedulesList) {
                schedulesList.innerHTML = `<div class="error-state">Failed to load schedules: ${error.message}</div>`;
            }
        }
    }

    async generateWeekSchedule() {
        const weekDate = document.getElementById('weekDate').value;
        if (!weekDate) {
            this.showNotification('Please select a date', 'error');
            return;
        }
        try {
            this.showNotification('🔄 Generating weekly schedule...', 'info');
            
            // Use the advanced schedule generation endpoint
            const response = await fetch(`${API_BASE}/api/v1/advanced-schedules/generate-week`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    facility_id: 1,
                    start_date: weekDate,
                    weeks: 1
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showNotification(`✅ Generated schedule for week of ${weekDate}!`, 'success');
            await this.loadSchedules(); // Reload schedules
            this.showTab('schedules'); // Switch to schedules tab
            
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
            this.showNotification('🔄 Generating monthly schedules...', 'info');
            
            // Calculate start date and weeks for the month
            const [year, month] = monthDate.split('-');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const weeks = Math.ceil((endDate.getDate()) / 7);
            
            // Find the first Tuesday of the month
            while (startDate.getDay() !== 2) {
                startDate.setDate(startDate.getDate() + 1);
            }
            
            const response = await fetch(`${API_BASE}/api/v1/advanced-schedules/generate-year`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    facility_id: 1,
                    start_date: startDate.toISOString().split('T')[0],
                    weeks: weeks
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showNotification(`✅ Generated ${result.schedules ? result.schedules.length : weeks} schedules for ${monthDate}!`, 'success');
            await this.loadSchedules(); // Reload schedules
            this.showTab('schedules'); // Switch to schedules tab
            
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
