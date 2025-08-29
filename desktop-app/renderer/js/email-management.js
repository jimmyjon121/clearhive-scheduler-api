// Email Management JavaScript
class EmailManagement {
    constructor() {
        this.apiUrl = 'https://clearhive-scheduler-api-production-4c35.up.railway.app/api/v1';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEmailSettings();
        this.loadEmailArchives();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Email settings form
        document.getElementById('emailSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmailSettings();
        });

        // Quick action buttons
        document.getElementById('sendDailyReminders')?.addEventListener('click', () => {
            this.sendDailyReminders();
        });

        document.getElementById('previewEmail')?.addEventListener('click', () => {
            this.showEmailPreview();
        });

        document.getElementById('viewStatistics')?.addEventListener('click', () => {
            this.showEmailStatistics();
        });

        // Archive search
        document.getElementById('searchArchives')?.addEventListener('click', () => {
            this.searchArchives();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        // Preview generation
        document.getElementById('generatePreview')?.addEventListener('click', () => {
            this.generateEmailPreview();
        });
    }

    setupAnimations() {
        if (document.body.classList.contains('advanced-animations')) {
            document.querySelectorAll('.color-card').forEach((card, index) => {
                card.style.setProperty('--card-index', index);
            });

            document.querySelectorAll('.action-btn').forEach((btn, index) => {
                btn.style.setProperty('--btn-index', index);
            });
        }
    }

    async loadEmailSettings() {
        try {
            const response = await fetch(`${this.apiUrl}/emails/settings`);
            
            if (response.ok) {
                const data = await response.json();
                const settings = data.settings;

                // Populate form fields
                document.getElementById('smtp_host').value = settings.smtp_host || '';
                document.getElementById('smtp_port').value = settings.smtp_port || '';
                document.getElementById('smtp_user').value = settings.smtp_user || '';
                document.getElementById('from_email').value = settings.from_email || '';
                document.getElementById('admin_email').value = settings.admin_email || '';
                document.getElementById('auto_reminders_enabled').checked = settings.auto_reminders_enabled;
                document.getElementById('color_coding_enabled').checked = settings.color_coding_enabled;
                document.getElementById('archive_enabled').checked = settings.archive_enabled;
            }
        } catch (error) {
            console.error('Error loading email settings:', error);
            this.showNotification('Failed to load email settings', 'error');
        }
    }

    async saveEmailSettings() {
        try {
            const formData = {
                smtp_host: document.getElementById('smtp_host').value,
                smtp_port: parseInt(document.getElementById('smtp_port').value),
                smtp_user: document.getElementById('smtp_user').value,
                smtp_pass: document.getElementById('smtp_pass').value,
                from_email: document.getElementById('from_email').value,
                admin_email: document.getElementById('admin_email').value,
                auto_reminders_enabled: document.getElementById('auto_reminders_enabled').checked,
                color_coding_enabled: document.getElementById('color_coding_enabled').checked,
                archive_enabled: document.getElementById('archive_enabled').checked
            };

            // Remove empty password field
            if (!formData.smtp_pass) {
                delete formData.smtp_pass;
            }

            const response = await fetch(`${this.apiUrl}/emails/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Email settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving email settings:', error);
            this.showNotification('Failed to save email settings', 'error');
        }
    }

    async sendDailyReminders() {
        try {
            const button = document.getElementById('sendDailyReminders');
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="icon">⏳</span><span>Sending...</span>';
            button.disabled = true;

            const response = await fetch(`${this.apiUrl}/emails/reminders/daily`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showNotification('Daily reminders sent successfully!', 'success');
            } else {
                throw new Error('Failed to send reminders');
            }
        } catch (error) {
            console.error('Error sending daily reminders:', error);
            this.showNotification('Failed to send daily reminders', 'error');
        } finally {
            const button = document.getElementById('sendDailyReminders');
            button.innerHTML = '<span class="icon">⏰</span><span>Send Daily Reminders</span>';
            button.disabled = false;
        }
    }

    showEmailPreview() {
        document.getElementById('previewModal').style.display = 'flex';
    }

    generateEmailPreview() {
        const house = document.getElementById('previewHouse').value;
        const previewContent = document.getElementById('previewContent');
        
        // Generate sample email HTML
        const sampleEmail = this.generateSampleEmailHTML(house);
        previewContent.innerHTML = `<iframe srcdoc="${sampleEmail.replace(/"/g, '&quot;')}"></iframe>`;
    }

    generateSampleEmailHTML(houseName) {
        const houseColors = {
            'Cove': '#3498db',
            'Banyan': '#2ecc71',
            'Sunrise': '#f39c12'
        };
        
        const color = houseColors[houseName] || '#667eea';
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
                    .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .house-header { background: linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, -20)} 100%); color: white; padding: 20px; }
                    .content { padding: 30px; }
                    .schedule-info { background: #f8f9fb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color}; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="house-header">
                        <h1 style="margin: 0; font-size: 28px;">🏡 ${houseName}</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Therapeutic Outing Schedule</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: ${color};">📅 Tuesday, August 29, 2025</h2>
                        
                        <div class="schedule-info">
                            <h3>🎯 Today's Outing</h3>
                            <p><strong>Vendor:</strong> Johnson Folly Equestrian Farm</p>
                            <p><strong>Activity:</strong> Equine Therapy Session</p>
                            <p><strong>Time:</strong> 10:00 AM - 12:00 PM</p>
                            <p><strong>Location:</strong> 14052 52nd Ave S, Delray Beach, FL</p>
                        </div>
                        
                        <p style="background: #f1f3f4; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 14px; color: #666;">
                            <strong>Reminder:</strong> Please confirm receipt of this schedule and report any issues immediately.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    adjustColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
          (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
          (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    async showEmailStatistics() {
        try {
            const response = await fetch(`${this.apiUrl}/emails/statistics?days=30`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayStatistics(data);
                document.getElementById('statisticsModal').style.display = 'flex';
            } else {
                throw new Error('Failed to load statistics');
            }
        } catch (error) {
            console.error('Error loading email statistics:', error);
            this.showNotification('Failed to load email statistics', 'error');
        }
    }

    displayStatistics(data) {
        const statsContent = document.getElementById('statisticsContent');
        
        const totals = data.totals;
        const byHouse = data.by_house;
        
        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-value">${totals.total_emails}</span>
                    <span class="stat-label">Total Emails</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${totals.houses_contacted}</span>
                    <span class="stat-label">Houses Contacted</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${totals.schedule_emails}</span>
                    <span class="stat-label">Schedule Emails</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${totals.reminder_emails}</span>
                    <span class="stat-label">Reminder Emails</span>
                </div>
            </div>
            
            <h4>By House (Last 30 Days)</h4>
            <div class="house-stats">
                ${byHouse.map(house => `
                    <div class="house-stat-item">
                        <strong>${house.house_name}</strong>: ${house.total_emails} emails
                        <small>(${house.schedule_emails} schedules, ${house.reminder_emails} reminders)</small>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async loadEmailArchives() {
        try {
            const response = await fetch(`${this.apiUrl}/emails/archives?limit=20`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayArchives(data.archives);
            }
        } catch (error) {
            console.error('Error loading email archives:', error);
        }
    }

    async searchArchives() {
        try {
            const houseFilter = document.getElementById('houseFilter').value;
            const dateFrom = document.getElementById('dateFrom').value;
            const dateTo = document.getElementById('dateTo').value;
            
            let url = `${this.apiUrl}/emails/archives?limit=50`;
            if (houseFilter) url += `&house_name=${houseFilter}`;
            if (dateFrom) url += `&date_from=${dateFrom}`;
            if (dateTo) url += `&date_to=${dateTo}`;
            
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                this.displayArchives(data.archives);
            }
        } catch (error) {
            console.error('Error searching archives:', error);
            this.showNotification('Failed to search archives', 'error');
        }
    }

    displayArchives(archives) {
        const archivesList = document.getElementById('archivesList');
        
        if (!archives || archives.length === 0) {
            archivesList.innerHTML = '<p>No email archives found.</p>';
            return;
        }
        
        archivesList.innerHTML = archives.map(archive => `
            <div class="archive-item">
                <div class="archive-info">
                    <h4>${archive.house_name} - ${new Date(archive.schedule_date).toLocaleDateString()}</h4>
                    <p>Sent: ${new Date(archive.created_at).toLocaleString()}</p>
                    <p>Type: ${archive.email_type}</p>
                </div>
                <div class="archive-actions">
                    <button onclick="emailManagement.viewArchive(${archive.id}, 'html')">View HTML</button>
                    ${archive.pdf_path ? `<button onclick="emailManagement.viewArchive(${archive.id}, 'pdf')">View PDF</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    async viewArchive(archiveId, type) {
        try {
            const response = await fetch(`${this.apiUrl}/emails/archives/${archiveId}?type=${type}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                throw new Error('Failed to load archive');
            }
        } catch (error) {
            console.error('Error viewing archive:', error);
            this.showNotification('Failed to load archive', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#34c759' : type === 'error' ? '#ff3b30' : '#667eea'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emailManagement = new EmailManagement();
});
