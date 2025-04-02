// binaryclock.js
// Handles clock logic, date display, time formatting (BCD/Standard),
// hour format (12/24), and mode toggles, including linked button text format.
// License: BANKON
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let displayMode = 'binary'; // 'bcd' or 'binary' (standard binary = default)
    let hourMode = '24';      // '12' or '24' (24-hour = default)

    // --- DOM Elements ---
    const yearBinEl = document.getElementById('year-binary');
    const monthBinEl = document.getElementById('month-binary');
    const dayBinEl = document.getElementById('day-binary');
    const hoursBinEl = document.getElementById('hours-binary');
    const minutesBinEl = document.getElementById('minutes-binary');
    const secondsBinEl = document.getElementById('seconds-binary');
    const toggleBcdBtn = document.getElementById('toggle-mode-btn');
    const toggleHourBtn = document.getElementById('toggle-hour-mode-btn');

    // --- Check if all critical elements exist ---
    if (!yearBinEl || !monthBinEl || !dayBinEl || !hoursBinEl || !minutesBinEl || !secondsBinEl || !toggleBcdBtn || !toggleHourBtn) {
        console.error("CRITICAL ERROR: One or more clock display/control elements not found! Clock cannot start.");
        if(document.body) document.body.innerHTML = '<p style="color:red; font-size:2em; text-align:center; padding-top: 20px;">Error: Clock UI elements missing.</p>';
        return;
    }

    // --- Constants for Binary Padding ---
    const YEAR_BITS = 11;
    const MONTH_BITS = 4;
    const DAY_BITS = 5;
    const HOURS_STD_BITS_24 = 5;
    const HOURS_STD_BITS_12 = 4;
    const MIN_SEC_STD_BITS = 6;

    // --- Binary/BCD Representations for Button Labels ---
    const HOUR_MODE_VALUES = {
        '12': { std: '1100',  bcd: '0001 0010' }, // Represents "12"
        '24': { std: '11000', bcd: '0010 0100' }  // Represents "24"
    };

    // --- Helper Functions ---
    function decimalToBCD(digit) {
        const num = parseInt(digit, 10);
        if (isNaN(num) || num < 0 || num > 9) {
            console.warn(`Invalid digit provided to decimalToBCD: ${digit}`);
            return "0000";
        }
        return num.toString(2).padStart(4, '0');
    }

    // --- Update Clock Function ---
    function updateClock() {
        try {
            const now = new Date();

            // 1. Update Date (Always Standard Binary)
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            yearBinEl.textContent = year.toString(2).padStart(YEAR_BITS, '0');
            monthBinEl.textContent = month.toString(2).padStart(MONTH_BITS, '0');
            dayBinEl.textContent = day.toString(2).padStart(DAY_BITS, '0');

            // 2. Process Hours based on 12/24 mode
            const rawHours24 = now.getHours(); // 0-23
            let displayHours;
            let hoursStdBits;

            if (hourMode === '12') {
                displayHours = rawHours24 % 12;
                if (displayHours === 0) displayHours = 12;
                hoursStdBits = HOURS_STD_BITS_12;
            } else { // 24-hour mode
                displayHours = rawHours24;
                hoursStdBits = HOURS_STD_BITS_24;
            }

            const hoursStr = String(displayHours).padStart(2, '0');
            const minutesStr = String(now.getMinutes()).padStart(2, '0');
            const secondsStr = String(now.getSeconds()).padStart(2, '0');

            // 3. Update Time Display (Based on displayMode BCD/Standard)
            if (displayMode === 'bcd') {
                // BCD Mode
                hoursBinEl.textContent = decimalToBCD(hoursStr[0]) + " " + decimalToBCD(hoursStr[1]);
                minutesBinEl.textContent = decimalToBCD(minutesStr[0]) + " " + decimalToBCD(minutesStr[1]);
                secondsBinEl.textContent = decimalToBCD(secondsStr[0]) + " " + decimalToBCD(secondsStr[1]);
            } else {
                // Standard Binary Mode
                const minutesValue = parseInt(minutesStr, 10);
                const secondsValue = parseInt(secondsStr, 10);

                hoursBinEl.textContent = displayHours.toString(2).padStart(hoursStdBits, '0');
                minutesBinEl.textContent = minutesValue.toString(2).padStart(MIN_SEC_STD_BITS, '0');
                secondsBinEl.textContent = secondsValue.toString(2).padStart(MIN_SEC_STD_BITS, '0');
            }
        } catch (error) {
            console.error("Error during clock update:", error);
        }
    }

     // --- Toggle Button Update Logic ---

     /** Updates the BCD toggle button's active appearance. */
     function updateBcdButtonAppearance() {
        toggleBcdBtn.classList.toggle('active', displayMode === 'bcd');
     }

     /** Updates the 12/24 toggle button's text based on BOTH hourMode and displayMode. */
     function updateHourButtonText() {
         // Determine which number to display (12 or 24) - the one it will switch TO
         const targetModeValue = (hourMode === '24') ? '12' : '24';
         // Determine which format to use (std or bcd) based on the main displayMode
         const formatType = (displayMode === 'bcd') ? 'bcd' : 'std';
         // Set the button text
         toggleHourBtn.textContent = HOUR_MODE_VALUES[targetModeValue][formatType];
     }

     // --- Event Listeners ---

     // Listener for BCD/Standard Toggle
     toggleBcdBtn.addEventListener('click', () => {
        displayMode = (displayMode === 'bcd') ? 'binary' : 'bcd';
        updateBcdButtonAppearance(); // Update *this* button's look
        updateHourButtonText();    // Update the *other* button's text format
        updateClock();             // Update the main clock display
     });

     // Listener for 12/24 Hour Toggle
     toggleHourBtn.addEventListener('click', () => {
         hourMode = (hourMode === '24') ? '12' : '24';
         updateHourButtonText(); // Update *this* button's text content/format
         updateClock();          // Update the main clock display
     });

    // --- Initial Setup ---
    try {
        updateBcdButtonAppearance(); // Set initial BCD button state (inactive)
        updateHourButtonText();      // Set initial 12/24 button text ("1100")
        updateClock();               // Run clock update once immediately
        const clockInterval = setInterval(updateClock, 1000); // Set interval
        console.log("Binary Clock initialized successfully.");
    } catch (error) {
        console.error("CRITICAL ERROR during clock initialization:", error);
        if(document.body) document.body.innerHTML = '<p style="color:red; font-size:2em; text-align:center; padding-top: 20px;">Error: Clock failed to initialize.</p>';
    }
});
