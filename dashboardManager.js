/**
 * DashboardManager.js
 * Manages the dashboard visualization and animations
 */

class DashboardManager {
    constructor(namazManager) {
        this.namazManager = namazManager;
        this.progressCircles = {};
        this.totalCircleProgress = null;
        this.maxPrayerCount = 100; // Default max value for progress calculation
        this.totalPrayerCapacity = 1000; // Max capacity for total progress circle
        
        // Track daily completion stats
        this.todayCompletedCount = 0;
        this.completionHistory = this.loadCompletionHistory();
        
        // Initialize dashboard metrics
        this.initializeDashboard();
    }
    
    /**
     * Initialize dashboard components and AOS animations
     */
    initializeDashboard() {
        // Initialize AOS animation library
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: false,
                mirror: true,
                offset: 50
            });
        }
        
        // Update the total remaining count and create total progress circle
        this.initializeTotalProgressCircle();
        
        // Initialize individual prayer progress circles
        this.initializeProgressCircles();
        
        // Update dashboard prayer counts
        this.updateDashboardCounts();
        
        // Update daily analysis data
        this.updateDailyAnalysis();
    }
    
    /**
     * Initialize the total prayers progress circle
     */
    initializeTotalProgressCircle() {
        const container = document.getElementById('totalCircleProgress');
        if (!container) return;
        
        const namazTypes = this.namazManager.getAllNamaz();
        const totalCount = namazTypes.reduce((sum, namaz) => sum + namaz.count, 0);
        
        // Update the total remaining count display
        const totalElement = document.getElementById('totalRemainingCount');
        if (totalElement) {
            totalElement.textContent = totalCount;
        }
        
        // Calculate total progress (reversed - lower count means more progress)
        const maxPossible = Math.max(totalCount, this.totalPrayerCapacity);
        const normalizedValue = totalCount / maxPossible;
        
        // Create fancy circle with simpler styling to avoid SVG gradient issues
        this.totalCircleProgress = new ProgressBar.Circle(container, {
            color: '#4a6da7',
            trailColor: 'rgba(255, 255, 255, 0.1)',
            strokeWidth: 15,
            trailWidth: 8,
            duration: 2000,
            easing: 'easeInOut',
            // Use simple color transition instead of gradient
            from: { color: '#4a6da7', width: 15 },
            to: { color: '#2d4478', width: 15 },
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
            }
        });
        
        // Add shadow effect to the SVG using CSS classes instead of direct style manipulation
        const svg = container.querySelector('svg');
        if (svg) {
            svg.classList.add('circle-shadow');
        }
        
        // Animate to the current value
        this.totalCircleProgress.animate(normalizedValue);
    }
    
    /**
     * Initialize all prayer progress circles
     */
    initializeProgressCircles() {
        const namazTypes = this.namazManager.getAllNamaz();
        
        // Find the maximum count to scale the progress correctly
        this.updateMaxPrayerCount();
        
        // Create progress circles for each prayer type
        namazTypes.forEach(namaz => {
            this.createProgressCircle(namaz.id, namaz.count);
        });
    }
    
    /**
     * Find the maximum prayer count for scaling progress bars
     */
    updateMaxPrayerCount() {
        const namazTypes = this.namazManager.getAllNamaz();
        const maxCount = Math.max(...namazTypes.map(namaz => namaz.count));
        this.maxPrayerCount = maxCount > 0 ? maxCount : 100;
    }
    
    /**
     * Create an animated progress circle for a prayer
     * @param {string} id - Prayer ID
     * @param {number} count - Prayer count
     */
    createProgressCircle(id, count) {
        const container = document.getElementById(`${id}Progress`);
        if (!container) return;
        
        // Calculate percentage (inverting so that 0 prayers = 100% complete)
        let normalizedValue = count / this.maxPrayerCount;
        if (normalizedValue > 1) normalizedValue = 1;
        
        // Define color based on prayer type
        let color;
        switch(id) {
            case 'fajr':
                color = '#8e44ad'; // Purple
                break;
            case 'zohar':
                color = '#3498db'; // Blue
                break;
            case 'asar':
                color = '#e67e22'; // Orange
                break;
            case 'maghrib':
                color = '#e74c3c'; // Red
                break;
            case 'isha':
                color = '#2c3e50'; // Dark Blue
                break;
            case 'witr':
                color = '#27ae60'; // Green
                break;
            default:
                color = '#4a6da7'; // Default blue
        }
        
        // Create circle with ProgressBar.js with enhanced styling
        this.progressCircles[id] = new ProgressBar.Circle(container, {
            color: color,
            trailColor: '#eee',
            strokeWidth: 10,
            trailWidth: 5,
            duration: 1500,
            easing: 'easeInOut',
            from: { color: color, width: 10 },
            to: { color: this.shadeColor(color, -20), width: 10 },
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
            }
        });
        
        // Add shadow effect to the SVG
        const svg = container.querySelector('svg');
        if (svg) {
            svg.classList.add('circle-shadow');
        }
        
        // Animate to the current value
        this.progressCircles[id].animate(normalizedValue);
    }
    
    /**
     * Darken or lighten a color
     * @param {string} color - Color in hex format
     * @param {number} percent - Percent to darken (negative) or lighten (positive)
     * @returns {string} Modified color in hex format
     */
    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }
    
    /**
     * Load completion history from localStorage
     * @returns {Array} Completion history array
     */
    loadCompletionHistory() {
        const historyStr = localStorage.getItem('namazCompletionHistory');
        if (historyStr) {
            try {
                return JSON.parse(historyStr);
            } catch (e) {
                console.error('Error parsing completion history:', e);
            }
        }
        return [];
    }
    
    /**
     * Save completion history to localStorage
     */
    saveCompletionHistory() {
        localStorage.setItem('namazCompletionHistory', JSON.stringify(this.completionHistory));
    }
    
    /**
     * Record a completed prayer
     */
    recordCompletedPrayer() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Check if we have an entry for today
        const todayEntry = this.completionHistory.find(entry => entry.date === today);
        
        if (todayEntry) {
            todayEntry.count++;
        } else {
            this.completionHistory.push({ date: today, count: 1 });
        }
        
        // Keep only the last 30 days
        if (this.completionHistory.length > 30) {
            this.completionHistory = this.completionHistory.slice(-30);
        }
        
        // Update today's count
        this.todayCompletedCount = this.getTodayCompletedCount();
        
        // Save history
        this.saveCompletionHistory();
        
        // Update the daily analysis display
        this.updateDailyAnalysis();
    }
    
    /**
     * Get the count of completed prayers today
     * @returns {number} Count of completed prayers today
     */
    getTodayCompletedCount() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = this.completionHistory.find(entry => entry.date === today);
        return todayEntry ? todayEntry.count : 0;
    }
    
    /**
     * Calculate the average daily completion rate
     * @returns {number} Average daily completion rate
     */
    getAverageDailyCompletion() {
        if (this.completionHistory.length === 0) {
            return 0;
        }
        
        const total = this.completionHistory.reduce((sum, entry) => sum + entry.count, 0);
        return Math.round((total / this.completionHistory.length) * 10) / 10; // One decimal place
    }
    
    /**
     * Update the daily analysis section
     */
    updateDailyAnalysis() {
        // Update today's completed count
        const todayCompletedElement = document.getElementById('todayCompletedCount');
        if (todayCompletedElement) {
            this.animateCounter(todayCompletedElement, parseInt(todayCompletedElement.textContent || 0), this.getTodayCompletedCount());
        }
        
        // Update average per day
        const averageElement = document.getElementById('averagePerDay');
        if (averageElement) {
            const average = this.getAverageDailyCompletion();
            averageElement.textContent = average.toFixed(1);
        }
        
        // Calculate and update completion forecast
        const forecastElement = document.getElementById('completionForecast');
        if (forecastElement) {
            const totalRemaining = this.namazManager.getAllNamaz().reduce((sum, namaz) => sum + namaz.count, 0);
            const avgDaily = this.getAverageDailyCompletion();
            
            if (totalRemaining > 0 && avgDaily > 0) {
                const daysNeeded = Math.ceil(totalRemaining / avgDaily);
                
                // Calculate the completion date
                const completionDate = new Date();
                completionDate.setDate(completionDate.getDate() + daysNeeded);
                
                // Format the date
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                forecastElement.textContent = completionDate.toLocaleDateString(undefined, options);
            } else {
                forecastElement.textContent = 'N/A';
            }
        }
    }
    
    /**
     * Update the total prayer count in the dashboard
     */
    updateTotalCount() {
        const totalElement = document.getElementById('totalRemainingCount');
        if (!totalElement) return;
        
        const namazTypes = this.namazManager.getAllNamaz();
        const totalCount = namazTypes.reduce((sum, namaz) => sum + namaz.count, 0);
        
        // Animate the counter
        this.animateCounter(totalElement, parseInt(totalElement.textContent || 0), totalCount);
        
        // Update total progress circle
        if (this.totalCircleProgress) {
            const maxPossible = Math.max(totalCount, this.totalPrayerCapacity);
            const normalizedValue = totalCount / maxPossible;
            this.totalCircleProgress.animate(normalizedValue);
        }
    }
    
    /**
     * Animate a counter from start to end value
     * @param {HTMLElement} element - Element to animate
     * @param {number} start - Start value
     * @param {number} end - End value
     */
    animateCounter(element, start, end) {
        if (start === end) return;
        
        // Apply GPU acceleration
        element.style.transform = 'translate3d(0,0,0)';
        element.style.willChange = 'transform, opacity';
        
        const duration = 1000;
        const range = end - start;
        let startTime = null;
        
        // Use easing function for smoother animation
        const easeOutQuad = t => t * (2 - t);
        
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
                // Reset will-change to avoid memory consumption
                element.style.willChange = 'auto';
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    /**
     * Update all prayer counts in the dashboard
     */
    updateDashboardCounts() {
        const namazTypes = this.namazManager.getAllNamaz();
        
        namazTypes.forEach(namaz => {
            const countElement = document.getElementById(`${namaz.id}DashCount`);
            if (countElement) {
                this.animateCounter(countElement, parseInt(countElement.textContent || 0), namaz.count);
            }
        });
    }
    
    /**
     * Update a single prayer's data in the dashboard
     * @param {string} id - Prayer ID
     */
    updatePrayerData(id) {
        const namaz = this.namazManager.getNamazById(id);
        if (!namaz) return;
        
        // Update the count display
        const countElement = document.getElementById(`${id}DashCount`);
        if (countElement) {
            this.animateCounter(countElement, parseInt(countElement.textContent || 0), namaz.count);
        }
        
        // Check if we need to recalculate max count
        this.updateMaxPrayerCount();
        
        // Update the progress circle if it exists
        if (this.progressCircles[id]) {
            let normalizedValue = namaz.count / this.maxPrayerCount;
            if (normalizedValue > 1) normalizedValue = 1;
            
            // Animate to the new value
            this.progressCircles[id].animate(normalizedValue);
        }
        
        // Update total count
        this.updateTotalCount();
    }
    
    /**
     * Update all dashboard elements after any data change
     */
    refreshDashboard() {
        this.updateMaxPrayerCount();
        this.updateTotalCount();
        this.updateDashboardCounts();
        this.updateDailyAnalysis();
        
        // Update all progress circles
        const namazTypes = this.namazManager.getAllNamaz();
        namazTypes.forEach(namaz => {
            if (this.progressCircles[namaz.id]) {
                let normalizedValue = namaz.count / this.maxPrayerCount;
                if (normalizedValue > 1) normalizedValue = 1;
                
                this.progressCircles[namaz.id].animate(normalizedValue);
            }
        });
        
        // Refresh AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
}