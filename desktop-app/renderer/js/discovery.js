// Discovery Page JavaScript
class DiscoverySystem {
    constructor() {
        this.activities = [];
        this.filteredActivities = [];
        this.init();
    }

    init() {
        this.loadActivities();
        this.setupEventListeners();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filterActivities();
        });

        document.querySelector('.search-btn')?.addEventListener('click', () => {
            this.filterActivities();
        });

        // Filter dropdowns
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.filterActivities();
        });

        document.getElementById('ageFilter')?.addEventListener('change', () => {
            this.filterActivities();
        });

        document.getElementById('skillFilter')?.addEventListener('change', () => {
            this.filterActivities();
        });

        // Clear filters
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('ageFilter').value = '';
            document.getElementById('skillFilter').value = '';
            this.filterActivities();
        });

        // Modals
        document.querySelector('.suggest-btn')?.addEventListener('click', () => {
            this.showModal('suggestionModal');
        });

        document.getElementById('vendorApplicationBtn')?.addEventListener('click', () => {
            // Open vendor application form or redirect
            alert('Vendor application feature coming soon!');
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        // Form submission
        document.getElementById('suggestionForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitSuggestion(e.target);
        });
    }

    setupAnimations() {
        if (document.body.classList.contains('advanced-animations')) {
            // Add staggered animations to cards
            setTimeout(() => {
                document.querySelectorAll('.activity-card').forEach((card, index) => {
                    card.style.setProperty('--card-index', index);
                });
            }, 100);
        }
    }

    loadActivities() {
        // Sample data - in production, this would come from your API
        this.activities = [
            {
                id: 1,
                name: "Equine Therapy Session",
                category: "animal",
                description: "Therapeutic horseback riding sessions that help develop balance, coordination, and emotional connection.",
                benefits: ["motor", "emotional", "social"],
                rating: 4.8,
                reviews: 156,
                cost: "$45-60",
                ageGroups: ["child", "teen"],
                featured: true,
                icon: "🐴"
            },
            {
                id: 2,
                name: "Beach Volleyball",
                category: "sports",
                description: "Team-based beach volleyball sessions focusing on cooperation, physical fitness, and social interaction.",
                benefits: ["social", "motor", "communication"],
                rating: 4.5,
                reviews: 89,
                cost: "$15-20",
                ageGroups: ["teen", "adult"],
                new: true,
                icon: "🏐"
            },
            {
                id: 3,
                name: "Art & Music Therapy",
                category: "creative",
                description: "Combined art and music therapy sessions for creative expression and emotional regulation.",
                benefits: ["emotional", "communication", "cognitive"],
                rating: 4.9,
                reviews: 234,
                cost: "$30-40",
                ageGroups: ["all"],
                featured: true,
                icon: "🎨"
            },
            {
                id: 4,
                name: "Adaptive Surfing",
                category: "sports",
                description: "Specialized surfing lessons with adaptive equipment and trained instructors.",
                benefits: ["motor", "emotional", "independence"],
                rating: 4.7,
                reviews: 67,
                cost: "$50-70",
                ageGroups: ["teen", "adult"],
                new: true,
                icon: "🏄"
            },
            {
                id: 5,
                name: "Cooking Skills Workshop",
                category: "educational",
                description: "Hands-on cooking classes focusing on life skills, following instructions, and healthy eating.",
                benefits: ["independence", "cognitive", "social"],
                rating: 4.6,
                reviews: 145,
                cost: "$25-35",
                ageGroups: ["teen", "adult"],
                icon: "👨‍🍳"
            },
            {
                id: 6,
                name: "Sensory Garden Experience",
                category: "sensory",
                description: "Guided tours through sensory gardens with various textures, scents, and interactive elements.",
                benefits: ["sensory", "emotional", "cognitive"],
                rating: 4.4,
                reviews: 98,
                cost: "$10-15",
                ageGroups: ["child", "all"],
                new: true,
                icon: "🌻"
            }
        ];

        this.displayActivities();
    }

    filterActivities() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const ageGroup = document.getElementById('ageFilter').value;
        const skill = document.getElementById('skillFilter').value;

        this.filteredActivities = this.activities.filter(activity => {
            const matchesSearch = !searchTerm || 
                activity.name.toLowerCase().includes(searchTerm) ||
                activity.description.toLowerCase().includes(searchTerm) ||
                activity.benefits.some(b => b.includes(searchTerm));
            
            const matchesCategory = !category || activity.category === category;
            const matchesAge = !ageGroup || activity.ageGroups.includes(ageGroup) || activity.ageGroups.includes('all');
            const matchesSkill = !skill || activity.benefits.includes(skill);

            return matchesSearch && matchesCategory && matchesAge && matchesSkill;
        });

        this.displayActivities();
    }

    displayActivities() {
        const activities = this.filteredActivities.length > 0 ? this.filteredActivities : this.activities;
        
        // Display featured activities
        const featured = activities.filter(a => a.featured);
        const featuredContainer = document.getElementById('featuredActivities');
        if (featuredContainer) {
            featuredContainer.innerHTML = featured.map(activity => this.createActivityCard(activity)).join('');
        }

        // Display new activities
        const newActivities = activities.filter(a => a.new);
        const newContainer = document.getElementById('newActivities');
        if (newContainer) {
            newContainer.innerHTML = newActivities.map(activity => this.createActivityCard(activity)).join('');
        }

        this.setupAnimations();
        this.attachCardListeners();
    }

    createActivityCard(activity) {
        const benefitTags = activity.benefits.map(b => `<span class="benefit-tag">${this.getBenefitLabel(b)}</span>`).join('');
        
        return `
            <div class="activity-card" data-id="${activity.id}">
                ${activity.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                ${activity.new ? '<span class="new-badge">New!</span>' : ''}
                <div class="activity-image">${activity.icon}</div>
                <div class="activity-content">
                    <h3 class="activity-title">${activity.name}</h3>
                    <span class="activity-category">${this.getCategoryLabel(activity.category)}</span>
                    <p class="activity-description">${activity.description}</p>
                    <div class="benefits-tags">${benefitTags}</div>
                    <div class="activity-meta">
                        <div class="activity-rating">
                            ⭐ ${activity.rating} (${activity.reviews})
                        </div>
                        <div class="activity-cost">${activity.cost}</div>
                    </div>
                </div>
            </div>
        `;
    }

    attachCardListeners() {
        document.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const activity = this.activities.find(a => a.id === parseInt(id));
                if (activity) this.showActivityDetails(activity);
            });
        });
    }

    showActivityDetails(activity) {
        const modal = document.getElementById('activityModal');
        const detailsContainer = document.getElementById('activityDetails');
        
        const benefitsList = activity.benefits.map(b => `<li>${this.getBenefitLabel(b)}</li>`).join('');
        
        detailsContainer.innerHTML = `
            <div class="activity-detail-header">
                <div class="activity-detail-image">${activity.icon}</div>
                <div class="activity-detail-info">
                    <h2>${activity.name}</h2>
                    <p>${activity.description}</p>
                    <div class="activity-stats">
                        <div class="stat-item">
                            <span class="stat-value">⭐ ${activity.rating}</span>
                            <span class="stat-label">${activity.reviews} reviews</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${activity.cost}</span>
                            <span class="stat-label">per person</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${activity.ageGroups.length}</span>
                            <span class="stat-label">age groups</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <h4>Therapeutic Benefits:</h4>
            <ul>${benefitsList}</ul>
            
            <div class="contact-section">
                <h4>How to Book:</h4>
                <div class="contact-info">
                    <div class="contact-item">
                        📞 <a href="tel:555-0123">Call (555) 012-3456</a>
                    </div>
                    <div class="contact-item">
                        📧 <a href="mailto:booking@example.com">Send Email</a>
                    </div>
                    <div class="contact-item">
                        🌐 <a href="#" onclick="alert('Website feature coming soon!')">Visit Website</a>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="alert('Booking feature coming soon!')">
                    Book This Activity
                </button>
                <button class="btn btn-secondary" onclick="alert('Added to favorites!')">
                    ❤️ Add to Favorites
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    submitSuggestion(form) {
        const formData = new FormData(form);
        const suggestion = {
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            benefits: Array.from(formData.getAll('benefits')),
            location: formData.get('location'),
            contact: formData.get('contact'),
            cost: formData.get('cost'),
            submittedAt: new Date().toISOString()
        };
        
        console.log('Suggestion submitted:', suggestion);
        
        // In production, send to API
        alert('Thank you for your suggestion! We\'ll review it and add it to our database.');
        
        // Close modal and reset form
        document.getElementById('suggestionModal').style.display = 'none';
        form.reset();
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    getCategoryLabel(category) {
        const labels = {
            outdoor: 'Outdoor Activities',
            creative: 'Creative Arts',
            animal: 'Animal Therapy',
            sports: 'Sports & Recreation',
            educational: 'Educational',
            social: 'Social Skills',
            sensory: 'Sensory Experiences'
        };
        return labels[category] || category;
    }

    getBenefitLabel(benefit) {
        const labels = {
            social: 'Social Skills',
            motor: 'Motor Skills',
            emotional: 'Emotional Regulation',
            cognitive: 'Cognitive Development',
            communication: 'Communication',
            independence: 'Independence',
            sensory: 'Sensory Processing'
        };
        return labels[benefit] || benefit;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.discoverySystem = new DiscoverySystem();
});
