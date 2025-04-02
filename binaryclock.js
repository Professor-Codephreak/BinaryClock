document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let displayMode = 'bcd'; // 'bcd' or 'binary'

    // --- DOM Elements ---
    const yearBinEl = document.getElementById('year-binary');
    const monthBinEl = document.getElementById('month-binary');
    const dayBinEl = document.getElementById('day-binary');
    const hoursBinEl = document.getElementById('hours-binary');
    const minutesBinEl = document.getElementById('minutes-binary');
    const secondsBinEl = document.getElementById('seconds-binary');
    const toggleBtn = document.getElementById('toggle-mode-btn');

    // --- Constants for Binary Padding ---
    const YEAR_BITS = 11;
    const MONTH_BITS = 4;
    const DAY_BITS = 5;
    const HOURS_STD_BITS = 5; // Standard binary for 0-23 needs 5 bits
    const MIN_SEC_STD_BITS = 6; // Standard binary for 0-59 needs 6 bits

    // --- Helper Functions ---
    function decimalToBCD(digit) {
        // Converts a single decimal digit (0-9) char/string to 4-bit BCD
        return parseInt(digit).toString(2).padStart(4, '0');
    }

    // --- Update Function ---
    function updateClock() {
        const now = new Date();

        // 1. Update Date (Always Standard Binary)
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        yearBinEl.textContent = year.toString(2).padStart(YEAR_BITS, '0');
        monthBinEl.textContent = month.toString(2).padStart(MONTH_BITS, '0');
        dayBinEl.textContent = day.toString(2).padStart(DAY_BITS, '0');

        // 2. Update Time (Based on displayMode)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        if (displayMode === 'bcd') {
            // BCD Mode
            hoursBinEl.textContent = decimalToBCD(hours[0]) + " " + decimalToBCD(hours[1]);
            minutesBinEl.textContent = decimalToBCD(minutes[0]) + " " + decimalToBCD(minutes[1]);
            secondsBinEl.textContent = decimalToBCD(seconds[0]) + " " + decimalToBCD(seconds[1]);
        } else {
            // Standard Binary Mode
            const hoursValue = parseInt(hours);
            const minutesValue = parseInt(minutes);
            const secondsValue = parseInt(seconds);

            hoursBinEl.textContent = hoursValue.toString(2).padStart(HOURS_STD_BITS, '0');
            minutesBinEl.textContent = minutesValue.toString(2).padStart(MIN_SEC_STD_BITS, '0');
            // *** CORRECTED LINE: Use MIN_SEC_STD_BITS for seconds padding ***
            secondsBinEl.textContent = secondsValue.toString(2).padStart(MIN_SEC_STD_BITS, '0');
        }
    }

     // --- Toggle Button Logic ---
     function updateButtonText() {
        // *** UPDATED TEXT: Display the mode clicking will switch TO ***
        toggleBtn.textContent = (displayMode === 'bcd') ? 'Standard' : 'BCD';
     }

     toggleBtn.addEventListener('click', () => {
        // Switch mode
        displayMode = (displayMode === 'bcd') ? 'binary' : 'bcd';
        // Update button text to reflect the NEW current mode
        updateButtonText();
        // Immediately update clock display in the new mode
        updateClock();
     });

    // --- Initial Setup ---
    updateButtonText(); // Set initial button text ("Standard")
    updateClock();      // Initial clock display (in BCD mode)
    setInterval(updateClock, 1000); // Update every second
});
