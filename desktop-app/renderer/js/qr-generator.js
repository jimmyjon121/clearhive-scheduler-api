// QR Code Generator JavaScript
class QRGenerator {
    constructor() {
        this.qrcode = null;
        this.baseURL = window.location.origin;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
    }

    setupEventListeners() {
        document.getElementById('generateBtn')?.addEventListener('click', () => {
            this.generateQRCode();
        });

        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            this.downloadQRCode();
        });

        document.getElementById('printBtn')?.addEventListener('click', () => {
            this.printQRCode();
        });

        document.getElementById('newQrBtn')?.addEventListener('click', () => {
            this.resetForm();
        });

        // Auto-generate label based on program selection
        document.getElementById('programSelect')?.addEventListener('change', (e) => {
            const labelInput = document.getElementById('labelInput');
            if (!labelInput.value && e.target.value) {
                const selectedText = e.target.options[e.target.selectedIndex].text;
                labelInput.value = `${selectedText} - Quick Report`;
            }
        });
    }

    setupAnimations() {
        if (document.body.classList.contains('advanced-animations')) {
            document.querySelectorAll('.instruction-card').forEach((card, index) => {
                card.style.setProperty('--card-index', index);
            });
        }
    }

    generateQRCode() {
        const program = document.getElementById('programSelect').value;
        const location = document.getElementById('locationInput').value;
        const label = document.getElementById('labelInput').value || 'Quick Report QR Code';

        // Build URL with parameters
        let url = `${this.baseURL}/incident-form.html`;
        const params = new URLSearchParams();
        
        if (program) {
            params.append('program', program);
        }
        
        if (location) {
            params.append('location', encodeURIComponent(location));
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        // Clear previous QR code if exists
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';

        // Generate new QR code
        this.qrcode = new QRCode(qrContainer, {
            text: url,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Update label
        document.getElementById('qrLabel').textContent = label;

        // Show display section with animation
        const displaySection = document.getElementById('qrDisplaySection');
        displaySection.style.display = 'block';
        
        // Smooth scroll to QR code
        setTimeout(() => {
            displaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        // Add success notification
        this.showNotification('QR Code generated successfully!', 'success');
    }

    downloadQRCode() {
        const canvas = document.querySelector('#qrcode canvas');
        const label = document.getElementById('qrLabel').textContent;
        
        if (canvas) {
            // Create a new canvas with label
            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');
            
            // Set canvas size
            downloadCanvas.width = 300;
            downloadCanvas.height = 350;
            
            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            
            // Draw QR code
            ctx.drawImage(canvas, 22, 20);
            
            // Draw label
            ctx.fillStyle = 'black';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, 150, 310);
            
            // Smaller instruction text
            ctx.font = '12px Arial';
            ctx.fillText('Scan to submit incident report', 150, 330);
            
            // Download
            const link = document.createElement('a');
            link.download = `qr-code-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = downloadCanvas.toDataURL();
            link.click();
            
            this.showNotification('QR Code downloaded!', 'success');
        }
    }

    printQRCode() {
        window.print();
        this.showNotification('Print dialog opened', 'info');
    }

    resetForm() {
        document.getElementById('programSelect').value = '';
        document.getElementById('locationInput').value = '';
        document.getElementById('labelInput').value = '';
        document.getElementById('qrDisplaySection').style.display = 'none';
        
        // Scroll back to form
        document.querySelector('.qr-config-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
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
            background: ${type === 'success' ? '#34c759' : '#667eea'};
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
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
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
    window.qrGenerator = new QRGenerator();
});
