// ELA Learning Platform - Interactive Activities
// JavaScript functionality for educational activities

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Add animation to cards when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    const cards = document.querySelectorAll('.about-card, .activity-card, .book-card, .stat-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Activity navigation function
function openActivity(ageGroup) {
    // Create modal or redirect to activity page
    showActivityModal(ageGroup);
}

// Show activity modal with sample content
function showActivityModal(ageGroup) {
    const activities = {
        'ages-2-5': {
            title: 'Early Learners Activities (Ages 2-5)',
            activities: [
                {
                    name: 'Letter Hunt',
                    description: 'Find and identify letters in colorful pictures',
                    type: 'Interactive Game'
                },
                {
                    name: 'Rhyme Time',
                    description: 'Listen to songs and identify rhyming words',
                    type: 'Audio Activity'
                },
                {
                    name: 'Story Pictures',
                    description: 'Look at pictures and tell what\'s happening',
                    type: 'Speaking Activity'
                },
                {
                    name: 'Trace & Write',
                    description: 'Practice writing letters with guided tracing',
                    type: 'Writing Practice'
                }
            ]
        },
        'ages-6-9': {
            title: 'Elementary Activities (Ages 6-9)',
            activities: [
                {
                    name: 'Reading Detective',
                    description: 'Read short stories and answer comprehension questions',
                    type: 'Reading Comprehension'
                },
                {
                    name: 'Word Builder',
                    description: 'Create new words using prefixes and suffixes',
                    type: 'Vocabulary Building'
                },
                {
                    name: 'Story Starter',
                    description: 'Complete creative writing prompts with imagination',
                    type: 'Creative Writing'
                },
                {
                    name: 'Character Chat',
                    description: 'Discuss favorite book characters and their traits',
                    type: 'Literary Discussion'
                }
            ]
        },
        'ages-10-14': {
            title: 'Middle School Activities (Ages 10-14)',
            activities: [
                {
                    name: 'Text Analysis',
                    description: 'Analyze themes, symbols, and literary devices',
                    type: 'Literary Analysis'
                },
                {
                    name: 'Essay Workshop',
                    description: 'Learn to structure and write persuasive essays',
                    type: 'Essay Writing'
                },
                {
                    name: 'Poetry Corner',
                    description: 'Explore different poetry forms and create original poems',
                    type: 'Poetry Writing'
                },
                {
                    name: 'Book Club',
                    description: 'Join discussions about classic and contemporary literature',
                    type: 'Group Discussion'
                }
            ]
        }
    };

    const activityData = activities[ageGroup];
    
    // Create modal HTML
    const modalHTML = `
        <div class="activity-modal" id="activityModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${activityData.title}</h2>
                    <button class="close-btn" onclick="closeActivityModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="activities-list">
                        ${activityData.activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-info">
                                    <h3>${activity.name}</h3>
                                    <p>${activity.description}</p>
                                    <span class="activity-type">${activity.type}</span>
                                </div>
                                <button class="start-activity-btn" onclick="startActivity('${activity.name}')">
                                    Start Activity
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <p>💡 <strong>Coming Soon:</strong> Full interactive activities with progress tracking!</p>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    addModalStyles();
    
    // Show modal
    document.getElementById('activityModal').style.display = 'flex';
}

// Close activity modal
function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.remove();
    }
}

// Start individual activity
function startActivity(activityName) {
    alert(`🎉 Starting "${activityName}"!\n\nThis is a demo version. In the full platform, this would launch an interactive activity tailored to help children learn and grow their ELA skills.`);
}

// Add modal styles dynamically
function addModalStyles() {
    if (!document.getElementById('modalStyles')) {
        const styles = `
            <style id="modalStyles">
                .activity-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s ease;
                }
                
                .modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 15px 15px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-body {
                    padding: 2rem;
                }
                
                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .activity-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border: 2px solid #f0f0f0;
                    border-radius: 10px;
                    transition: border-color 0.3s ease;
                }
                
                .activity-item:hover {
                    border-color: #667eea;
                }
                
                .activity-info h3 {
                    margin: 0 0 0.5rem 0;
                    color: #333;
                    font-size: 1.2rem;
                }
                
                .activity-info p {
                    margin: 0 0 0.5rem 0;
                    color: #666;
                }
                
                .activity-type {
                    background: #667eea;
                    color: white;
                    padding: 0.3rem 0.8rem;
                    border-radius: 15px;
                    font-size: 0.8rem;
                }
                
                .start-activity-btn {
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.3s ease;
                    white-space: nowrap;
                }
                
                .start-activity-btn:hover {
                    background: #ff5252;
                }
                
                .modal-footer {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 0 0 15px 15px;
                    text-align: center;
                    color: #666;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (max-width: 768px) {
                    .activity-item {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }
                    
                    .modal-content {
                        width: 95%;
                        margin: 20px;
                    }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('activityModal');
    if (modal && e.target === modal) {
        closeActivityModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeActivityModal();
    }
});

// Add some educational quotes that rotate
const educationalQuotes = [
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go. - Dr. Seuss",
    "Reading is to the mind what exercise is to the body. - Joseph Addison",
    "A person who won't read has no advantage over one who can't read. - Mark Twain",
    "The art of writing is the art of discovering what you believe. - Gustave Flaubert"
];

// Function to add inspirational elements (could be used for future enhancements)
function addInspirationalQuote() {
    const randomQuote = educationalQuotes[Math.floor(Math.random() * educationalQuotes.length)];
    console.log('💡 Inspiration:', randomQuote);
}
