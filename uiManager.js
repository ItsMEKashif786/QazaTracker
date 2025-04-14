/**
 * UIManager.js
 * Manages all UI interactions and updates
 */

class UIManager {
    constructor(namazManager, dashboardManager) {
        this.namazManager = namazManager;
        this.dashboardManager = dashboardManager;
        
        // Current active page
        this.activePage = 'dashboard';
        
        // DOM Elements
        this.namazCardsContainer = document.getElementById('namazCards');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.overlay = document.getElementById('overlay');
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        
        // Confirmation dialog elements
        this.confirmationDialog = document.getElementById('confirmationDialog');
        this.confirmYesBtn = document.getElementById('confirmYes');
        this.confirmNoBtn = document.getElementById('confirmNo');
        this.currentConfirmationCallback = null;
        this.currentConfirmationNamazId = null;
        
        // Input elements for each namaz type
        this.namazInputs = {};
        this.namazManager.getAllNamaz().forEach(namaz => {
            this.namazInputs[namaz.id] = document.getElementById(`${namaz.id}Count`);
        });
        
        // Initialize UI
        this.initializeUI();
        this.setupEventListeners();
    }
    
    /**
     * Initialize the UI with existing data
     */
    initializeUI() {
        this.renderNamazCards();
        this.populateSettingsPanel();
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Navigation menu
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });
        
        // Settings panel toggle
        this.settingsBtn.addEventListener('click', () => this.toggleSettingsPanel(true));
        this.closeSettingsBtn.addEventListener('click', () => this.toggleSettingsPanel(false));
        this.overlay.addEventListener('click', () => this.toggleSettingsPanel(false));
        
        // Save settings
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadNamazData());
        
        // Confirmation dialog buttons
        this.confirmYesBtn.addEventListener('click', () => {
            this.handleConfirmationResponse(true);
        });
        
        this.confirmNoBtn.addEventListener('click', () => {
            this.handleConfirmationResponse(false);
        });
    }
    
    /**
     * Show confirmation dialog when decreasing namaz count
     * @param {string} namazId - The ID of the namaz to decrease
     */
    showConfirmationDialog(namazId) {
        this.currentConfirmationNamazId = namazId;
        this.confirmationDialog.classList.add('active');
        this.overlay.classList.add('active');
    }
    
    /**
     * Hide confirmation dialog
     */
    hideConfirmationDialog() {
        this.confirmationDialog.classList.remove('active');
        this.overlay.classList.remove('active');
        this.currentConfirmationNamazId = null;
    }
    
    /**
     * Handle user response to confirmation dialog
     * @param {boolean} confirmed - Whether user confirmed the action
     */
    handleConfirmationResponse(confirmed) {
        const namazId = this.currentConfirmationNamazId;
        
        if (confirmed && namazId) {
            // User selected "Yes" - proceed with decreasing count
            if (this.namazManager.decreaseCount(namazId)) {
                this.updateNamazCount(namazId);
                
                // Update dashboard if it exists
                if (this.dashboardManager) {
                    // Record the completed prayer in daily analytics
                    this.dashboardManager.recordCompletedPrayer();
                    
                    // Update the prayer data in the dashboard
                    this.dashboardManager.updatePrayerData(namazId);
                }
            }
        }
        
        // Hide dialog regardless of response
        this.hideConfirmationDialog();
    }
    
    /**
     * Navigate to a specific page
     * @param {string} pageName - The name of the page to navigate to
     */
    navigateToPage(pageName) {
        if (pageName === this.activePage) return;
        
        // Skip direct navigation to settings page - use settings panel instead
        if (pageName === 'settings') {
            this.toggleSettingsPanel(true);
            return;
        }
        
        // Update active navigation item
        this.navItems.forEach(item => {
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Hide current page with animation
        const currentPage = document.getElementById(`${this.activePage}Page`);
        if (currentPage) {
            // Use requestAnimationFrame for smoother transitions
            requestAnimationFrame(() => {
                currentPage.classList.remove('animate__fadeIn');
                currentPage.classList.add('animate__fadeOut');
                
                setTimeout(() => {
                    currentPage.style.display = 'none';
                    currentPage.classList.remove('animate__fadeOut');
                    
                    // Show new page with animation
                    const newPage = document.getElementById(`${pageName}Page`);
                    if (newPage) {
                        // Use GPU-accelerated properties
                        newPage.style.transform = 'translate3d(0,0,0)';
                        newPage.style.display = 'block';
                        newPage.classList.add('animate__fadeIn');
                        
                        // Update active page
                        this.activePage = pageName;
                        
                        // Refresh dashboard if needed
                        if (pageName === 'dashboard' && this.dashboardManager) {
                            this.dashboardManager.refreshDashboard();
                        }
                    }
                }, 250);  // Reduced transition time
            });
        }
    }
    
    /**
     * Render all namaz cards in the UI
     */
    renderNamazCards() {
        // Clear existing cards
        this.namazCardsContainer.innerHTML = '';
        
        // Get all namaz data
        const namazTypes = this.namazManager.getAllNamaz();
        
        // Create and append cards with staggered animation delays
        namazTypes.forEach((namaz, index) => {
            const card = this.createNamazCard(namaz, index);
            this.namazCardsContainer.appendChild(card);
        });
    }
    
    /**
     * Create a single namaz card element
     * @param {Object} namaz - The namaz object
     * @param {number} index - The index for animation delay
     * @returns {HTMLElement} The card element
     */
    createNamazCard(namaz, index) {
        const card = document.createElement('div');
        card.className = 'namaz-card';
        card.id = `namaz-card-${namaz.id}`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="namaz-card-header">
                <span class="namaz-name">${namaz.name}</span>
            </div>
            <div class="namaz-count" id="count-${namaz.id}">${namaz.count}</div>
            <div class="namaz-actions">
                <button class="btn-undo" id="undo-${namaz.id}">
                    <i class="fas fa-undo"></i> Undo
                </button>
                <button class="minus-one-btn animate__animated animate__pulse animate__infinite animate__slower" id="decrease-${namaz.id}">-1</button>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            const decreaseBtn = document.getElementById(`decrease-${namaz.id}`);
            const undoBtn = document.getElementById(`undo-${namaz.id}`);
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    // Show confirmation dialog instead of decreasing directly
                    this.showConfirmationDialog(namaz.id);
                });
            }
            
            if (undoBtn) {
                undoBtn.addEventListener('click', () => {
                    if (this.namazManager.undoDecrease(namaz.id)) {
                        this.updateNamazCount(namaz.id);
                        
                        // Update dashboard if it exists
                        if (this.dashboardManager) {
                            this.dashboardManager.updatePrayerData(namaz.id);
                        }
                    }
                });
            }
        }, 0);
        
        return card;
    }
    
    /**
     * Update the count display for a specific namaz
     * @param {string} id - The ID of the namaz
     */
    updateNamazCount(id) {
        const namaz = this.namazManager.getNamazById(id);
        if (namaz) {
            const countElement = document.getElementById(`count-${id}`);
            if (countElement) {
                // Create a counting animation
                this.animateCountChange(countElement, parseInt(countElement.textContent), namaz.count);
            }
        }
    }
    
    /**
     * Animate a number change with counting effect
     * @param {HTMLElement} element - Element to animate
     * @param {number} start - Start value
     * @param {number} end - End value
     */
    animateCountChange(element, start, end) {
        if (start === end) return;
        
        // Apply hardware acceleration
        element.style.transform = 'translate3d(0,0,0)';
        element.style.willChange = 'transform, opacity';
        
        // Add bounce animation class with shorter duration
        element.classList.add('animate__animated', 'animate__bounceIn');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            element.classList.remove('animate__animated', 'animate__bounceIn');
            // Reset will-change to avoid memory consumption
            element.style.willChange = 'auto';
        }, 800);
        
        // Smoother and faster animation
        const duration = 400; // Reduced duration
        const range = end - start;
        let startTime = null;
        
        const easeOutQuad = t => t * (2 - t); // Smooth easing function
        
        const step = timestamp => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuad(progress);
            const currentValue = Math.floor(easedProgress * range + start);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    /**
     * Populate the settings panel with current values
     */
    populateSettingsPanel() {
        const namazTypes = this.namazManager.getAllNamaz();
        
        namazTypes.forEach(namaz => {
            const input = this.namazInputs[namaz.id];
            if (input) {
                input.value = namaz.count;
            }
        });
    }
    
    /**
     * Toggle the settings panel visibility
     * @param {boolean} show - Whether to show or hide the panel
     */
    toggleSettingsPanel(show) {
        if (show) {
            this.populateSettingsPanel();
            this.settingsPanel.classList.add('active');
            this.overlay.classList.add('active');
        } else {
            this.settingsPanel.classList.remove('active');
            this.overlay.classList.remove('active');
        }
    }
    
    /**
     * Save settings from the panel
     */
    saveSettings() {
        const counts = {};
        
        // Collect values from inputs
        this.namazManager.getAllNamaz().forEach(namaz => {
            const input = this.namazInputs[namaz.id];
            if (input) {
                counts[namaz.id] = input.value;
            }
        });
        
        // Update the counts
        if (this.namazManager.updateCounts(counts)) {
            // Add success animation to save button
            this.saveSettingsBtn.classList.add('animate__animated', 'animate__bounceIn');
            setTimeout(() => {
                this.saveSettingsBtn.classList.remove('animate__animated', 'animate__bounceIn');
            }, 1000);
            
            // Update the UI
            this.namazManager.getAllNamaz().forEach(namaz => {
                this.updateNamazCount(namaz.id);
            });
            
            // Update dashboard if it exists
            if (this.dashboardManager) {
                this.dashboardManager.refreshDashboard();
            }
            
            // Close the settings panel
            this.toggleSettingsPanel(false);
        }
    }
    
    /**
     * Download namaz data as a text file
     */
    downloadNamazData() {
        // Add download animation
        this.downloadBtn.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            this.downloadBtn.classList.remove('animate__animated', 'animate__bounceIn');
        }, 1000);
        
        const content = this.namazManager.generateDownloadContent();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'namaz_details.txt';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}
