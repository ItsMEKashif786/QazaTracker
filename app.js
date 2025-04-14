/**
 * app.js
 * Main application entry point with enhanced animations and dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application with beautiful animations
    showInitialLoadingAnimation().then(() => {
        // Create the namaz manager
        const namazManager = new NamazManager();
        
        // Create the dashboard manager
        const dashboardManager = new DashboardManager(namazManager);
        
        // Create the UI manager with the namaz manager and dashboard manager
        const uiManager = new UIManager(namazManager, dashboardManager);
        
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: false,
                mirror: true
            });
        }
        
        // Log initialization
        console.log('Qaza Namaz Tracker initialized successfully');
    });
});

/**
 * Show an initial loading animation before revealing the app content
 * @returns {Promise} A promise that resolves when animation completes
 */
function showInitialLoadingAnimation() {
    return new Promise(resolve => {
        // Create and append loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content animate__animated animate__fadeIn">
                <div class="loading-icon">
                    <i class="fas fa-pray"></i>
                </div>
                <div class="loading-text">Loading Qaza Namaz Tracker</div>
                <div class="loading-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Add loading overlay styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #4a6da7 0%, #3a5a8c 100%);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .loading-content {
                text-align: center;
                color: white;
            }
            
            .loading-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: floatIcon 2s ease-in-out infinite;
            }
            
            .loading-text {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }
            
            .loading-dots {
                display: flex;
                justify-content: center;
                gap: 8px;
            }
            
            .dot {
                width: 10px;
                height: 10px;
                background-color: white;
                border-radius: 50%;
                display: inline-block;
            }
            
            .dot:nth-child(1) {
                animation: bounce 1.4s ease infinite;
            }
            
            .dot:nth-child(2) {
                animation: bounce 1.4s ease 0.2s infinite;
            }
            
            .dot:nth-child(3) {
                animation: bounce 1.4s ease 0.4s infinite;
            }
            
            @keyframes bounce {
                0%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-15px); }
            }
            
            @keyframes floatIcon {
                0%, 100% { transform: translateY(0) rotate(0); }
                50% { transform: translateY(-10px) rotate(10deg); }
            }
        `;
        
        document.head.appendChild(style);
        
        // Set timeout to remove overlay after animations
        setTimeout(() => {
            loadingOverlay.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                document.body.removeChild(loadingOverlay);
                resolve();
            }, 500);
        }, 2000);
    });
}
