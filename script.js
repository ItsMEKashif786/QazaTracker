document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dashboard = document.getElementById('dashboard');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const downloadBtn = document.getElementById('downloadBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');
    const notification = document.getElementById('notification');
    
    // Namaz data structure
    let namazData = [
        { name: 'Fajr', count: 0, previousCount: 0 },
        { name: 'Zohar', count: 0, previousCount: 0 },
        { name: 'Asar', count: 0, previousCount: 0 },
        { name: 'Maghrib', count: 0, previousCount: 0 },
        { name: 'Isha', count: 0, previousCount: 0 },
        { name: 'Witr', count: 0, previousCount: 0 }
    ];
    
    // Initialize the app
    function init() {
        loadFromLocalStorage();
        renderDashboard();
        addRippleEffects();
    }
    
    // Render the dashboard with namaz cards
    function renderDashboard() {
        dashboard.innerHTML = '';
        
        namazData.forEach((namaz, index) => {
            const card = document.createElement('div');
            card.className = 'namaz-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="namaz-header">
                    <span class="namaz-name">${namaz.name}</span>
                </div>
                <div class="namaz-count" id="count-${index}">${namaz.count}</div>
                <div class="namaz-actions">
                    <button class="btn-decrement ripple" data-index="${index}">-1</button>
                    <button class="btn-undo ripple" data-index="${index}" title="Undo last change">
                        <i class="fas fa-undo"></i> Undo
                    </button>
                </div>
            `;
            dashboard.appendChild(card);
        });
        
        // Add event listeners to the new buttons
        document.querySelectorAll('.btn-decrement').forEach(btn => {
            btn.addEventListener('click', decrementCount);
        });
        
        document.querySelectorAll('.btn-undo').forEach(btn => {
            btn.addEventListener('click', undoCount);
        });
        
        // Re-add ripple effects
        addRippleEffects();
    }
    
    // Add ripple effect to buttons
    function addRippleEffects() {
        document.querySelectorAll('.ripple').forEach(button => {
            // Remove existing event listener to prevent duplicates
            button.removeEventListener('click', createRipple);
            button.addEventListener('click', createRipple);
        });
    }
    
    function createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Decrement namaz count with animation
    function decrementCount(e) {
        const index = e.target.getAttribute('data-index');
        if (namazData[index].count > 0) {
            // Store previous count before decrementing
            namazData[index].previousCount = namazData[index].count;
            namazData[index].count--;
            
            // Update with animation
            const countElement = document.getElementById(`count-${index}`);
            if (countElement) {
                countElement.textContent = namazData[index].count;
                countElement.classList.add('count-updated');
                setTimeout(() => {
                    countElement.classList.remove('count-updated');
                }, 500);
            }
            
            saveToLocalStorage();
            
            // Button press feedback
            e.target.classList.add('button-shake');
            setTimeout(() => {
                e.target.classList.remove('button-shake');
            }, 400);
        } else {
            // Shake button if count is already 0
            e.target.classList.add('button-shake');
            setTimeout(() => {
                e.target.classList.remove('button-shake');
            }, 400);
            showNotification(`${namazData[index].name} count is already 0`);
        }
    }
    
    // Undo the last count change with animation
    function undoCount(e) {
        const index = e.target.getAttribute('data-index');
        if (namazData[index].previousCount !== null && namazData[index].previousCount !== namazData[index].count) {
            // Swap current and previous counts
            const temp = namazData[index].count;
            namazData[index].count = namazData[index].previousCount;
            namazData[index].previousCount = temp;
            
            // Update with animation
            const countElement = document.getElementById(`count-${index}`);
            if (countElement) {
                countElement.textContent = namazData[index].count;
                countElement.classList.add('count-updated');
                setTimeout(() => {
                    countElement.classList.remove('count-updated');
                }, 500);
            }
            
            saveToLocalStorage();
            
            // Button press feedback
            e.target.classList.add('button-shake');
            setTimeout(() => {
                e.target.classList.remove('button-shake');
            }, 400);
            
            showNotification(`Undo successful for ${namazData[index].name}`);
        } else {
            // Shake button if nothing to undo
            e.target.classList.add('button-shake');
            setTimeout(() => {
                e.target.classList.remove('button-shake');
            }, 400);
            showNotification(`Nothing to undo for ${namazData[index].name}`);
        }
    }
    
    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Reset animation
        notification.style.animation = 'none';
        void notification.offsetWidth; // Trigger reflow
        notification.style.animation = 'slideInUp 0.3s ease forwards, fadeOut 0.3s ease 2.7s forwards';
        
        // Hide after animation completes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // Open settings panel
    function openSettings() {
        settingsPanel.classList.add('active');
        overlay.classList.add('active');
        
        // Populate input fields with current values
        document.getElementById('fajrCount').value = namazData[0].count;
        document.getElementById('zoharCount').value = namazData[1].count;
        document.getElementById('asarCount').value = namazData[2].count;
        document.getElementById('maghribCount').value = namazData[3].count;
        document.getElementById('ishaCount').value = namazData[4].count;
        document.getElementById('witrCount').value = namazData[5].count;
    }
    
    // Close settings panel
    function closeSettingsPanel() {
        settingsPanel.classList.remove('active');
        overlay.classList.remove('active');
    }
    
    // Save settings
    function saveSettingsHandler() {
        // Update namaz data from input fields
        namazData[0].count = parseInt(document.getElementById('fajrCount').value) || 0;
        namazData[1].count = parseInt(document.getElementById('zoharCount').value) || 0;
        namazData[2].count = parseInt(document.getElementById('asarCount').value) || 0;
        namazData[3].count = parseInt(document.getElementById('maghribCount').value) || 0;
        namazData[4].count = parseInt(document.getElementById('ishaCount').value) || 0;
        namazData[5].count = parseInt(document.getElementById('witrCount').value) || 0;
        
        // Reset previous counts
        namazData.forEach(namaz => {
            namaz.previousCount = namaz.count;
        });
        
        saveToLocalStorage();
        renderDashboard();
        closeSettingsPanel();
        showNotification('Counts updated successfully');
    }
    
    // Download namaz data as text file
    function downloadData() {
        let content = 'Qaza Namaz Summary\n\n';
        namazData.forEach(namaz => {
            content += `${namaz.name}: ${namaz.count}\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qaza_namaz_summary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Download started');
    }
    
    // Save data to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('qazaNamazData', JSON.stringify(namazData));
    }
    
    // Load data from localStorage
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('qazaNamazData');
        if (savedData) {
            namazData = JSON.parse(savedData);
        }
    }
    
    // Event listeners
    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsPanel);
    saveSettings.addEventListener('click', saveSettingsHandler);
    downloadBtn.addEventListener('click', downloadData);
    overlay.addEventListener('click', closeSettingsPanel);
    
    // Initialize the app
    init();
});
