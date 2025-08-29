// Family First Scheduler - Cleaner, Focused Implementation
const API_BASE = 'https://clearhive-scheduler-api-production-4c35.up.railway.app';

class SchedulerApp {
    constructor() {
        this.apiUrl = API_BASE;
        this.currentView = 'today';
        this.currentWeekOffset = 0;
        this.houses = [];
        this.vendors = [];
        this.schedules = [];
        
        // House colors matching the system
        this.houseColors = {
            'Banyan': '#FF6B6B',
            'Cove': '#4ECDC4',
            'Preserve': '#45B7D1',
            'Hedge': '#1ABC9C',
            'Meridian': '#9B59B6',
            'Prosperity': '#F39C12'
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkConnection();
        await this.loadData();
        this.showView('today');
        this.updateTodayView();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.showView(view);
            });
        });

        // Header actions
        document.getElementById('sendRemindersBtn').addEventListener('click', () => {
            this.sendMondayReminders();
        });

        // Footer actions
        document.getElementById('generatePdfBtn').addEventListener('click', () => {
            this.generatePDF();
        });

        document.getElementById('viewIncidentsBtn').addEventListener('click', () => {
            window.location.href = 'incident-form.html';
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // Week navigation
        document.getElementById('prevWeek')?.addEventListener('click', () => {
            this.currentWeekOffset--;
            this.updateWeeklyView();
        });

        document.getElementById('nextWeek')?.addEventListener('click', () => {
            this.currentWeekOffset++;
            this.updateWeeklyView();
        });

        // Modal close
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Vendor category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterVendors(e.target.dataset.category);
            });
        });
    }

    showView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update content
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`)?.classList.add('active');

        // Load view-specific data
        switch(viewName) {
            case 'today':
                this.updateTodayView();
                break;
            case 'schedule':
                this.updateWeeklyView();
                break;
            case 'houses':
                this.displayAllHouses();
                break;
            case 'vendors':
                this.displayVendors();
                break;
            case 'year-schedule':
                this.displayYearSchedule();
                break;
        }
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/programs`);
            if (response.ok) {
                this.updateConnectionStatus(true);
            }
        } catch (error) {
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(isConnected) {
        const statusEl = document.getElementById('connectionStatus');
        const statusDot = statusEl.querySelector('.status-dot');
        
        if (isConnected) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
            statusEl.innerHTML = '<span class="status-dot online"></span> Connected';
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            statusEl.innerHTML = '<span class="status-dot offline"></span> Offline';
        }
    }

    async loadData() {
        this.showLoading(true);
        try {
            const [programsRes, vendorsRes, schedulesRes] = await Promise.all([
                fetch(`${this.apiUrl}/api/v1/programs`),
                fetch(`${this.apiUrl}/api/v1/vendors`),
                fetch(`${this.apiUrl}/api/v1/schedules`)
            ]);

            if (programsRes.ok) this.houses = await programsRes.json();
            if (vendorsRes.ok) this.vendors = await vendorsRes.json();
            if (schedulesRes.ok) this.schedules = await schedulesRes.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Failed to load data. Working offline.', 'warning');
        }
        this.showLoading(false);
    }

    updateTodayView() {
        const container = document.getElementById('todayContent');
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const isTuesday = dayName === 'Tuesday';

        if (isTuesday) {
            container.innerHTML = `
                <div class="tuesday-outings">
                    <h3>🚌 Therapeutic Outings Today</h3>
                    <div class="outing-cards">
                        ${this.getTuesdayOutings()}
                    </div>
                    <div class="reminder-status">
                        <h3>📧 Monday Reminder Status</h3>
                        <p>✅ Emails sent yesterday at 3:00 PM</p>
                        <button class="btn-secondary" onclick="app.viewSentEmails()">View Sent Emails</button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="non-tuesday">
                    <div class="info-card">
                        <h3>No Therapeutic Outings Today</h3>
                        <p>Next outings scheduled for Tuesday</p>
                        <button class="btn-primary" onclick="app.showView('schedule')">View Weekly Schedule</button>
                    </div>
                    ${dayName === 'Monday' ? this.getMondayReminderPrompt() : ''}
                </div>
            `;
        }
    }

    getTuesdayOutings() {
        const outings = [
            { house: 'Banyan', vendor: 'Johnson Folly Farm', time: '10:00 AM - 12:00 PM', phone: '555-0101', address: '123 Farm Road' },
            { house: 'Cove', vendor: 'Surf Therapy', time: '10:00 AM - 12:00 PM', phone: '555-0102', address: '456 Beach Ave' },
            { house: 'Preserve', vendor: 'Happy Goat Yoga', time: '9:00 AM - 11:00 AM', phone: '555-0103', address: '789 Zen Lane' },
            { house: 'Hedge', vendor: 'Peach Painting Studio', time: '11:00 AM - 1:00 PM', phone: '555-0104', address: '321 Art Street' },
            { house: 'Meridian', vendor: 'Equestrian Center', time: '2:00 PM - 4:00 PM', phone: '555-0105', address: '654 Horse Trail' },
            { house: 'Prosperity', vendor: 'Music Therapy Studio', time: '1:00 PM - 3:00 PM', phone: '555-0106', address: '987 Melody Way' }
        ];

        return outings.map(outing => `
            <div class="outing-card" style="border-left: 4px solid ${this.houseColors[outing.house]}">
                <h4>🏠 ${outing.house}</h4>
                <p class="vendor-name">📍 ${outing.vendor}</p>
                <p class="time">⏰ ${outing.time}</p>
                <p class="address">${outing.address}</p>
                <div class="quick-actions">
                    <button onclick="app.showQRCode('${outing.house}')" class="action-btn">📱 QR</button>
                    <button onclick="app.openMap('${outing.address}')" class="action-btn">🗺️ Map</button>
                    <button onclick="app.callVendor('${outing.phone}')" class="action-btn">📞 Call</button>
                </div>
            </div>
        `).join('');
    }

    getMondayReminderPrompt() {
        return `
            <div class="reminder-prompt">
                <h3>📧 Monday Reminder</h3>
                <p>It's time to send Tuesday's outing reminders!</p>
                <button class="btn-primary large" onclick="app.sendMondayReminders()">
                    Send All Reminders Now
                </button>
            </div>
        `;
    }

    displayAllHouses() {
        const container = document.getElementById('housesList');
        
        // Ensure we have all 6 houses
        const allHouses = ['Banyan', 'Cove', 'Preserve', 'Hedge', 'Meridian', 'Prosperity'];
        
        container.innerHTML = `
            <div class="houses-grid">
                ${allHouses.map(houseName => {
                    const house = this.houses.find(h => h.name === houseName) || {
                        name: houseName,
                        coordinator_email: `${houseName.toLowerCase()}@familyfirst.org`,
                        priority: 1
                    };
                    
                    return `
                        <div class="house-card" style="border-top: 4px solid ${this.houseColors[houseName]}">
                            <h3>🏠 ${houseName}</h3>
                            <div class="house-details">
                                <p><strong>Coordinator:</strong></p>
                                <p>${house.coordinator_email || 'Not assigned'}</p>
                                <p><strong>Priority:</strong> ${house.priority || 1}</p>
                                <p><strong>Weekly Schedule:</strong></p>
                                <p>Tuesday Therapeutic Outings</p>
                            </div>
                            <div class="house-actions">
                                <button onclick="app.viewHouseSchedule('${houseName}')" class="btn-secondary">
                                    📅 View Schedule
                                </button>
                                <button onclick="app.editHouse('${houseName}')" class="btn-secondary">
                                    ✏️ Edit
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    displayVendors(category = 'all') {
        const container = document.getElementById('vendorsList');
        
        // Sample vendors - in real app, filter from this.vendors
        const vendors = [
            { name: 'Johnson Folly Farm', type: 'contracted', category: 'Equestrian', phone: '555-0101' },
            { name: 'Surf Therapy Institute', type: 'contracted', category: 'Water Sports', phone: '555-0102' },
            { name: 'Happy Goat Yoga', type: 'contracted', category: 'Animal Therapy', phone: '555-0103' },
            { name: 'Peach Painting Studio', type: 'backup', category: 'Art', phone: '555-0104' },
            { name: 'Local Beach', type: 'backup', category: 'Outdoor', phone: 'N/A' },
            { name: 'Community Park', type: 'backup', category: 'Outdoor', phone: 'N/A' }
        ];

        const filteredVendors = category === 'all' ? vendors : 
            vendors.filter(v => v.type === category);

        container.innerHTML = `
            <div class="vendors-list">
                ${filteredVendors.map(vendor => `
                    <div class="vendor-card ${vendor.type}">
                        <h4>${vendor.name}</h4>
                        <p class="category">${vendor.category}</p>
                        <p class="phone">📞 ${vendor.phone}</p>
                        <span class="vendor-type">${vendor.type}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Action methods
    showQRCode(house) {
        const modal = document.getElementById('modalContainer');
        modal.querySelector('.modal-title').textContent = `QR Code - ${house}`;
        modal.querySelector('.modal-body').innerHTML = `
            <div class="qr-display">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://clearhive-scheduler-api.up.railway.app/incident/${house}" alt="QR Code">
                <p>Scan for incident reporting</p>
                <a href="https://clearhive-scheduler-api.up.railway.app/incident/${house}" target="_blank">
                    Or click here to open form
                </a>
            </div>
        `;
        modal.classList.remove('hidden');
    }

    openMap(address) {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
    }

    callVendor(phone) {
        window.location.href = `tel:${phone}`;
    }

    async sendMondayReminders() {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/emails/send-reminders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day: 'monday' })
            });
            
            if (response.ok) {
                this.showNotification('✅ Reminders sent successfully!', 'success');
            } else {
                throw new Error('Failed to send reminders');
            }
        } catch (error) {
            this.showNotification('❌ Failed to send reminders', 'error');
        }
        this.showLoading(false);
    }

    generatePDF() {
        window.location.href = `${this.apiUrl}/api/v1/schedules/pdf/week`;
    }

    closeModal() {
        document.getElementById('modalContainer').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SchedulerApp();
});
