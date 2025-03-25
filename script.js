// Load saved data from local storage
document.addEventListener("DOMContentLoaded", () => {
    let prayers = ["fajr", "zohr", "asr", "maghrib", "isha", "witr"];
    prayers.forEach(prayer => {
        let savedCount = localStorage.getItem(prayer) || 0;
        document.getElementById(`count-${prayer}`).innerText = savedCount;
    });
});

// Increase count
function increase(prayer) {
    let countElement = document.getElementById(`count-${prayer}`);
    let count = parseInt(countElement.innerText);
    count++;
    countElement.innerText = count;
    localStorage.setItem(prayer, count);
}

// Decrease count
function decrease(prayer) {
    let countElement = document.getElementById(`count-${prayer}`);
    let count = parseInt(countElement.innerText);
    if (count > 0) {
        count--;
        countElement.innerText = count;
        localStorage.setItem(prayer, count);
    }
}

// Reset all counts
function resetCounts() {
    let prayers = ["fajr", "zohr", "asr", "maghrib", "isha", "witr"];
    prayers.forEach(prayer => {
        document.getElementById(`count-${prayer}`).innerText = 0;
        localStorage.setItem(prayer, 0);
    });
}