document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dashboard = document.getElementById('dashboard');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const downloadBtn = document.getElementById('downloadBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');
    
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
    }
    
    // Render the dashboard with namaz cards
    function renderDashboard() {
        dashboard.innerHTML = '';
        
        namazData.forEach((namaz, index) => {
            const card = document.createElement('div');
            card.className = 'namaz-card';
            card.innerHTML = `
                <div class="namaz-header">
                    <span class="namaz-name">${namaz.name}</span>
                    <span class="namaz-count">${namaz.count}</span>
                </div>
                <div class="namaz-actions">
                    <button class="btn-decrement" data-index="${index}">-1</button>
                    <button class="btn-undo" data-index="${index}" title="Undo last change">
                        <i class="fas fa-undo"></i>
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
    }
    
    // Decrement namaz count
    function decrementCount(e) {
        const index = e.target.getAttribute('data-index');
        if (namazData[index].count > 0) {
            // Store previous count before decrementing
            namazData[index].previousCount = namazData[index].count;
            namazData[index].count--;
            saveToLocalStorage();
            renderDashboard();
        }
    }
    
    // Undo the last count change
    function undoCount(e) {
        const index = e.target.getAttribute('data-index');
        if (namazData[index].previousCount !== null) {
            // Swap current and previous counts
            const temp = namazData[index].count;
            namazData[index].count = namazData[index].previousCount;
            namazData[index].previousCount = temp;
            saveToLocalStorage();
            renderDashboard();
            
            // Show undo notification
            showNotification(`Undo successful for ${namazData[index].name}`);
        }
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'undo-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification
        notification.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
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
