# JavaScript Binary Clock (BCD & Binary Date)

## Overview

This project is a web-based binary clock created using vanilla JavaScript, HTML, and CSS. It displays the current date (Year, Month, Day) in standard binary format and the current time (Hours, Minutes, Seconds) using Binary-Coded Decimal (BCD). The clock features a retro terminal-like aesthetic and updates in real-time.

*(Optional: Consider adding a screenshot of the clock here)*
*(Optional: Or add a link to a live demo if hosted)*
## How It Works

The clock fetches the current date and time from your system every second and updates the display accordingly. It uses two different binary representation methods:

### Date Display (Standard Binary)

* The top section shows the current Year, Month, and Day.
* Each component (Y, M, D) is converted into its standard **binary representation** (base-2).
* To ensure consistent length, the binary strings are padded with leading zeros:
    * **Year (Y):** Padded to 11 bits (sufficient for years up to 2047).
    * **Month (M):** Padded to 4 bits (sufficient for months 1-12).
    * **Day (D):** Padded to 5 bits (sufficient for days 1-31).
* These binary strings are displayed horizontally.

### Time Display (Binary-Coded Decimal - BCD)

* The main section displays the Hours (H), Minutes (M), and Seconds (S), stacked vertically.
* This part uses **Binary-Coded Decimal (BCD)** representation.

#### What is BCD?

BCD is a way of encoding decimal numbers where each individual *decimal digit* (0 through 9) is represented by its own fixed 4-bit binary number.
```txt
| Decimal Digit | BCD Representation |
| :-----------: | :----------------: |
|       0       |        0000        |
|       1       |        0001        |
|       2       |        0010        |
|       3       |        0011        |
|       4       |        0100        |
|       5       |        0101        |
|       6       |        0110        |
|       7       |        0111        |
|       8       |        1000        |
|       9       |        1001        |

Unlike standard binary which converts the entire number (e.g., decimal 23 -> binary 10111), BCD handles each digit separately. This makes conversion to and from decimal displays simpler, which was useful in early digital electronics.

#### How the Clock Uses BCD for Time

-->  The clock gets the current time in HH:MM:SS format (e.g., 16:15:42).
--> For each component (Hours, Minutes, Seconds), it looks at the two decimal digits individually.
    * Example Hour (HH = 16): It processes the '1' and the '6' separately.
    * Example Minute (MM = 15): It processes the '1' and the '5' separately.
    * Example Second (SS = 42): It processes the '4' and the '2' separately.
--> It converts each decimal digit into its 4-bit BCD equivalent using the table above.
--> It displays these two 4-bit BCD groups, separated by a space, next to the corresponding label (H:, M:, S:).

* Example Time: **16:15:42**
    * **H:** Decimal '1' -> BCD `0001`, Decimal '6' -> BCD `0110`. Display: `H: 0001 0110`
    * **M:** Decimal '1' -> BCD `0001`, Decimal '5' -> BCD `0101`. Display: `M: 0001 0101`
    * **S:** Decimal '4' -> BCD `0100`, Decimal '2' -> BCD `0010`. Display: `S: 0100 0010`

This BCD representation correctly handles the full range of hours (00-23), minutes (00-59), and seconds (00-59) by encoding each constituent decimal digit.

## Features

* Real-time display of date and time.
* Date (Y, M, D) shown in standard binary representation.
* Time (H, M, S) shown using Binary-Coded Decimal (BCD).
* Retro terminal aesthetic (monospace font, green-on-black).
* Uses CSS Custom Properties (`:root`) for easy color theming.
* Built with plain HTML, CSS, and JavaScript (no external libraries/frameworks needed besides the font).

## Files

* `index.html`: The main HTML structure.
* `styled.css`: Contains all the styling rules, including layout and terminal theme.
* `binaryclock.js`: Handles fetching the time/date, performing binary/BCD conversions, and updating the DOM.

## How to Run

Download the three files (`index.html`, `styled.css`, `binaryclock.js`) into the same folder.
Open the `index.html` file in your web browser.

The binary clock should appear and start updating immediately.

## Customization

The visual theme (colors) can be easily customized by modifying the CSS variables defined in the `:root` section at the top of `styled.css`.

# Interactive 3D Binary Clock

## Overview

This project presents an interactive, web-based binary clock rendered within a draggable 3D interface. It utilizes vanilla JavaScript, HTML5, and CSS3 to display the current date and time using different binary formats, all wrapped in a retro terminal aesthetic. Users can rotate the clock face using mouse drag and toggle time display modes via unique binary-labeled buttons.

---

*(Placeholder: Consider adding a high-quality screenshot or GIF demonstrating the clock and its 3D rotation)*


*(Placeholder: Add link if hosted online)*

`[Live Demo](your-live-demo-link-here)`

---

## Features

* **Real-Time Clock:** Updates every second to display the current time and date.
* **Date Display:** Shows the current Year, Month, and Day in standard binary format, padded for consistency.
* **Time Display:** Vertically stacks Hours, Minutes, and Seconds.
* **Switchable Time Encoding:** Toggle between:
    * **Standard Binary (Default):** Displays the full value of H, M, S in base-2 (e.g., 19:00 -> `10011`). Padding ensures consistent bit length (5 for 24hr, 4 for 12hr; 6 for M/S).
    * **Binary-Coded Decimal (BCD):** Displays each decimal digit of H, M, S as a separate 4-bit binary group (e.g., 19:00 -> `0001 1001`).
* **Switchable Hour Format:** Toggle between:
    * **24-Hour Format (Default):** Displays hours from 00 to 23.
    * **12-Hour Format:** Displays hours from 01 to 12.
* **Dynamic Toggle Buttons:**
    * The "BCD" button visually indicates the active time encoding mode (dim for Standard, bright/active for BCD).
    * The 12/24 button dynamically displays the *target* mode ("12" or "24") using the currently active *encoding* (Standard Binary or BCD).
* **Interactive 3D Rotation:** Click and drag the clock face or background to rotate the view in 3D space.
* **Retro Terminal Aesthetic:** Uses a monospace font (`VT323`), green-on-black color scheme, and glow effects.
* **Customizable Theme:** Colors can be easily modified using CSS Custom Properties (variables).
* **Responsive Elements:** Basic responsiveness for usability on smaller screens.

## How It Works

### Date Display

The Year, Month, and Day values are obtained from the system `Date` object. Each value is converted to its standard base-2 (binary) representation using `number.toString(2)` and then padded with leading zeros to a fixed length for consistent alignment:
* Year: 11 bits
* Month: 4 bits
* Day: 5 bits

### Time Display & Toggles

1.  **Hour Format (12/24):**
    * The application maintains an internal state for 12-hour or 24-hour mode (defaulting to 24).
    * The raw hour (0-23) is fetched. If 12-hour mode is active, it's converted mathematically to the 1-12 range.
    * The corresponding toggle button displays the *other* mode's value ("12" or "24") as its label.
2.  **Time Encoding (Standard/BCD):**
    * The application maintains a state for Standard Binary or BCD mode (defaulting to Standard).
    * **Standard Binary:** The (potentially 12/24 adjusted) hour value (0-23 or 1-12) and the minute/second values (0-59) are converted to base-2 using `number.toString(2)` and padded to the appropriate bit length (5/4 for H, 6 for M/S).
    * **BCD:** The 2-digit string representation of the (potentially adjusted) hour, minute, and second is processed. Each *individual decimal digit* is converted to its 4-bit BCD equivalent (e.g., '7' -> `0111`). The two 4-bit groups for each time component are displayed with a space.
    * The "BCD" toggle button changes appearance (dim/bright) to reflect the active mode.
    * The 12/24 button's *label format* (standard binary vs. BCD for "12"/"24") also updates based on the active time encoding mode.
3.  **Updates:** JavaScript's `setInterval` function calls an `updateClock` routine every 1000ms to refresh the date and time display based on the current state of the two toggles.

### 3D Interaction

* CSS sets up a 3D perspective environment using the `perspective` property on a container element.
* The clock face is wrapped in an element (`#interactive-cube`) with `transform-style: preserve-3d;`.
* JavaScript (`motion.js`) listens for mouse drag events.
* During a drag, it calculates the change in mouse position and updates the `rotateX` and `rotateY` CSS transform properties of `#interactive-cube` via inline styles, allowing smooth rotation.

## File Structure

.
├── index.html         # HTML structure
├── styled.css         # CSS styling (layout, theme, 3D)
├── binaryclock.js     # Clock logic, date/time updates, toggle handlers
└── motion.js          # 3D drag rotation handling


## Setup

1.  Ensure all four files (`index.html`, `styled.css`, `binaryclock.js`, `motion.js`) are located in the same directory.
2.  Open the `index.html` file in a modern web browser that supports CSS 3D transforms (e.g., Chrome, Firefox, Edge, Safari).

No build steps or external dependencies (other than the Google Font) are required.

## Customization

* **Theme:** Modify color variables (e.g., `--primary-color`, `--bg-color`) in the `:root` section of `styled.css`.
* **3D:** Adjust the `perspective` value in `.showcase-container` (CSS) or the rotation `sensitivity` constant in `motion.js`.
* **Initial View:** Change the `initialRotation` values in `motion.js`.
* **Binary Padding:** Modify bit-length constants (e.g., `YEAR_BITS`) in `binaryclock.js` if different padding is desired.

## Author

* Gregory L. Magnusson

## License

* BANKON

