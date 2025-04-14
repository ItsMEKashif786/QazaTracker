/**
 * NamazManager.js
 * Manages all the namaz data and operations
 */

class NamazManager {
    constructor() {
        // Initialize the namaz types
        this.namazTypes = [
            { id: 'fajr', name: 'Fajr', count: 0 },
            { id: 'zohar', name: 'Zohar', count: 0 },
            { id: 'asar', name: 'Asar', count: 0 },
            { id: 'maghrib', name: 'Maghrib', count: 0 },
            { id: 'isha', name: 'Isha', count: 0 },
            { id: 'witr', name: 'Witr', count: 0 }
        ];
        
        // History for undo functionality
        this.history = {};
        this.namazTypes.forEach(namaz => {
            this.history[namaz.id] = [];
        });
        
        // Load data from localStorage
        this.loadData();
    }
    
    /**
     * Load namaz count data from localStorage
     */
    loadData() {
        const savedData = localStorage.getItem('qazaNamazData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.namazTypes.forEach(namaz => {
                    if (parsedData[namaz.id] !== undefined) {
                        namaz.count = parseInt(parsedData[namaz.id]) || 0;
                    }
                });
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
            }
        }
    }
    
    /**
     * Save namaz count data to localStorage
     */
    saveData() {
        const dataToSave = {};
        this.namazTypes.forEach(namaz => {
            dataToSave[namaz.id] = namaz.count;
        });
        
        try {
            localStorage.setItem('qazaNamazData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }
    
    /**
     * Get all namaz types with their current counts
     * @returns {Array} Array of namaz objects
     */
    getAllNamaz() {
        return this.namazTypes;
    }
    
    /**
     * Get a specific namaz by its ID
     * @param {string} id - The ID of the namaz
     * @returns {Object|null} The namaz object or null if not found
     */
    getNamazById(id) {
        return this.namazTypes.find(namaz => namaz.id === id) || null;
    }
    
    /**
     * Decrease the count of a specific namaz
     * @param {string} id - The ID of the namaz
     * @returns {boolean} True if successful, false otherwise
     */
    decreaseCount(id) {
        const namaz = this.getNamazById(id);
        if (namaz && namaz.count > 0) {
            // Save the current state for undo
            this.history[id].push(namaz.count);
            
            // Only keep the last 10 history items
            if (this.history[id].length > 10) {
                this.history[id].shift();
            }
            
            namaz.count -= 1;
            this.saveData();
            return true;
        }
        return false;
    }
    
    /**
     * Undo the last decrease for a specific namaz
     * @param {string} id - The ID of the namaz
     * @returns {boolean} True if successful, false otherwise
     */
    undoDecrease(id) {
        if (this.history[id] && this.history[id].length > 0) {
            const namaz = this.getNamazById(id);
            if (namaz) {
                namaz.count = this.history[id].pop();
                this.saveData();
                return true;
            }
        }
        return false;
    }
    
    /**
     * Update counts for multiple namaz types
     * @param {Object} counts - Object with namaz IDs as keys and counts as values
     */
    updateCounts(counts) {
        let updated = false;
        
        this.namazTypes.forEach(namaz => {
            if (counts[namaz.id] !== undefined) {
                // Save current count for undo
                this.history[namaz.id].push(namaz.count);
                
                // Only keep the last 10 history items
                if (this.history[namaz.id].length > 10) {
                    this.history[namaz.id].shift();
                }
                
                // Update the count
                const newCount = parseInt(counts[namaz.id]);
                if (!isNaN(newCount) && newCount >= 0) {
                    namaz.count = newCount;
                    updated = true;
                }
            }
        });
        
        if (updated) {
            this.saveData();
        }
        
        return updated;
    }
    
    /**
     * Generate the text content for download
     * @returns {string} Formatted text content
     */
    generateDownloadContent() {
        let content = "Qaza Namaz Tracker - Counts\n";
        content += "===========================\n\n";
        
        this.namazTypes.forEach(namaz => {
            content += `${namaz.name}: ${namaz.count}\n`;
        });
        
        content += "\nGenerated on: " + new Date().toLocaleString();
        return content;
    }
}
