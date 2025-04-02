document.addEventListener('DOMContentLoaded', () => {
    // Get references for date display
    const yearBinEl = document.getElementById('year-binary');
    const monthBinEl = document.getElementById('month-binary');
    const dayBinEl = document.getElementById('day-binary');

    // Get references for time display (binary strings)
    const hoursBinEl = document.getElementById('hours-binary');
    const minutesBinEl = document.getElementById('minutes-binary');
    const secondsBinEl = document.getElementById('seconds-binary');

    // Define padding lengths for date binary representations
    const YEAR_BITS = 11;
    const MONTH_BITS = 4;
    const DAY_BITS = 5;

    // Helper function to convert a decimal digit (0-9) to a 4-bit BCD string
    function decimalToBCD(digit) {
        return parseInt(digit).toString(2).padStart(4, '0');
    }

    function updateClock() {
        const now = new Date();

        // --- Update Date (Binary) ---
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        const yearBin = year.toString(2).padStart(YEAR_BITS, '0');
        const monthBin = month.toString(2).padStart(MONTH_BITS, '0');
        const dayBin = day.toString(2).padStart(DAY_BITS, '0');

        yearBinEl.textContent = yearBin;
        monthBinEl.textContent = monthBin;
        dayBinEl.textContent = dayBin;

        // --- Update Time (Concatenated BCD Binary Strings) ---
        const hours = String(now.getHours()).padStart(2, '0'); // HH
        const minutes = String(now.getMinutes()).padStart(2, '0'); // MM
        const seconds = String(now.getSeconds()).padStart(2, '0'); // SS

        // Hours: Convert H1 and H2 to BCD and concatenate
        const hoursBCD = decimalToBCD(hours[0]) + " " + decimalToBCD(hours[1]);
        hoursBinEl.textContent = hoursBCD;

        // Minutes: Convert M1 and M2 to BCD and concatenate
        const minutesBCD = decimalToBCD(minutes[0]) + " " + decimalToBCD(minutes[1]);
        minutesBinEl.textContent = minutesBCD;

        // Seconds: Convert S1 and S2 to BCD and concatenate
        const secondsBCD = decimalToBCD(seconds[0]) + " " + decimalToBCD(seconds[1]);
        secondsBinEl.textContent = secondsBCD;
    }

    // Initial call
    updateClock();

    // Update every second
    setInterval(updateClock, 1000);
});
