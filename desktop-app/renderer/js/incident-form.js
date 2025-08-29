// Incident Form JavaScript
class IncidentForm {
    constructor() {
        this.reportType = 'incident';
        this.photos = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPrograms();
        this.setCurrentDateTime();
        this.checkURLParams();
    }

    setupEventListeners() {
        // Report type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.reportType = btn.dataset.type;
                this.toggleFormFields();
            });
        });

        // Severity buttons
        document.querySelectorAll('.severity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('severity').value = btn.dataset.severity;
            });
        });

        // Quick time button
        document.querySelector('.quick-time-btn')?.addEventListener('click', () => {
            this.setCurrentDateTime();
        });

        // Location button
        document.querySelector('.location-btn')?.addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Character counter
        const description = document.getElementById('description');
        const charCounter = document.querySelector('.char-counter');
        description?.addEventListener('input', () => {
            const length = description.value.length;
            charCounter.textContent = `${length}/500`;
            if (length > 500) {
                description.value = description.value.substring(0, 500);
                charCounter.textContent = '500/500';
            }
        });

        // Photo upload
        document.querySelector('.photo-btn')?.addEventListener('click', () => {
            document.getElementById('photoInput').click();
        });

        document.getElementById('photoInput')?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });

        // Add witness
        document.querySelector('.add-witness-btn')?.addEventListener('click', () => {
            this.addWitnessField();
        });

        // Form submission
        document.getElementById('reportForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });
    }

    toggleFormFields() {
        const incidentFields = document.querySelectorAll('.incident-fields');
        const progressFields = document.querySelectorAll('.progress-fields');

        if (this.reportType === 'incident') {
            incidentFields.forEach(field => field.style.display = 'block');
            progressFields.forEach(field => field.style.display = 'none');
            
            // Make incident fields required
            document.getElementById('incidentType').required = true;
            document.getElementById('severity').required = true;
        } else if (this.reportType === 'progress') {
            incidentFields.forEach(field => field.style.display = 'none');
            progressFields.forEach(field => field.style.display = 'block');
            
            // Remove required from incident fields
            document.getElementById('incidentType').required = false;
            document.getElementById('severity').required = false;
        } else {
            // Note type
            incidentFields.forEach(field => field.style.display = 'none');
            progressFields.forEach(field => field.style.display = 'none');
            
            document.getElementById('incidentType').required = false;
            document.getElementById('severity').required = false;
        }
    }

    loadPrograms() {
        // In production, this would fetch from API
        const programs = [
            { id: 1, name: 'House 1 - Sunrise' },
            { id: 2, name: 'House 2 - Sunset' },
            { id: 3, name: 'House 3 - Mountain View' },
            { id: 4, name: 'House 4 - Oceanside' },
            { id: 5, name: 'Day Program - Downtown' },
            { id: 6, name: 'Community Integration' }
        ];

        const select = document.getElementById('programSelect');
        programs.forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.name;
            select.appendChild(option);
        });
    }

    setCurrentDateTime() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].substring(0, 5);
        
        document.getElementById('incidentDate').value = date;
        document.getElementById('incidentTime').value = time;
    }

    getCurrentLocation() {
        if ('geolocation' in navigator) {
            const locationBtn = document.querySelector('.location-btn');
            locationBtn.textContent = '📍 Getting location...';
            locationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // In production, you'd reverse geocode this
                    document.getElementById('location').value = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
                    locationBtn.textContent = '📍 Use Current Location';
                    locationBtn.disabled = false;
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Could not get your location. Please enter manually.');
                    locationBtn.textContent = '📍 Use Current Location';
                    locationBtn.disabled = false;
                }
            );
        } else {
            alert('Location services not available on this device.');
        }
    }

    handlePhotoUpload(files) {
        const preview = document.getElementById('photoPreview');
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.onclick = () => {
                        if (confirm('Remove this photo?')) {
                            img.remove();
                            this.photos = this.photos.filter(p => p !== e.target.result);
                        }
                    };
                    preview.appendChild(img);
                    this.photos.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    addWitnessField() {
        const container = document.getElementById('witnessContainer');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'witness-input';
        input.placeholder = 'Witness name';
        container.appendChild(input);
    }

    checkURLParams() {
        // Check if opened from QR code with pre-filled data
        const params = new URLSearchParams(window.location.search);
        const programId = params.get('program');
        const location = params.get('location');
        
        if (programId) {
            document.getElementById('programSelect').value = programId;
        }
        
        if (location) {
            document.getElementById('location').value = decodeURIComponent(location);
        }
    }

    getWitnesses() {
        const witnesses = [];
        document.querySelectorAll('.witness-input').forEach(input => {
            if (input.value.trim()) {
                witnesses.push(input.value.trim());
            }
        });
        return witnesses;
    }

    async submitReport() {
        const submitBtn = document.querySelector('.submit-btn');
        const submitText = submitBtn.querySelector('.submit-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        
        // Show loading state
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        spinner.style.display = 'inline';

        // Collect form data
        const reportData = {
            type: this.reportType,
            program: document.getElementById('programSelect').value,
            clientName: document.getElementById('clientName').value,
            date: document.getElementById('incidentDate').value,
            time: document.getElementById('incidentTime').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            staffName: document.getElementById('staffName').value,
            staffRole: document.getElementById('staffRole').value,
            timestamp: new Date().toISOString()
        };

        // Add type-specific fields
        if (this.reportType === 'incident') {
            reportData.incidentType = document.getElementById('incidentType').value;
            reportData.severity = document.getElementById('severity').value;
            reportData.actionsTaken = document.getElementById('actionsTaken').value;
            reportData.witnesses = this.getWitnesses();
            reportData.notifications = {
                supervisor: document.getElementById('notifySupervisor').checked,
                parent: document.getElementById('notifyParent').checked,
                admin: document.getElementById('notifyAdmin').checked
            };
        } else if (this.reportType === 'progress') {
            reportData.progressArea = document.getElementById('progressArea').value;
        }

        // Add photos if any
        if (this.photos.length > 0) {
            reportData.photos = this.photos;
        }

        try {
            // In production, send to API
            console.log('Submitting report:', reportData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            document.getElementById('successMessage').style.display = 'flex';
            
            // Send notifications if needed
            if (this.reportType === 'incident' && reportData.severity === 'critical') {
                this.sendImmediateNotification(reportData);
            }
            
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
            
            // Reset button state
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }

    sendImmediateNotification(reportData) {
        // In production, this would trigger push notifications or SMS
        console.log('Sending immediate notification for critical incident');
    }
}

// Reset form function
function resetForm() {
    document.getElementById('reportForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('successMessage').style.display = 'none';
    window.incidentForm.photos = [];
    window.incidentForm.setCurrentDateTime();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.incidentForm = new IncidentForm();
});
