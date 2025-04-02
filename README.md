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

1.  The clock gets the current time in HH:MM:SS format (e.g., 16:15:42).
2.  For each component (Hours, Minutes, Seconds), it looks at the two decimal digits individually.
    * Example Hour (HH = 16): It processes the '1' and the '6' separately.
    * Example Minute (MM = 15): It processes the '1' and the '5' separately.
    * Example Second (SS = 42): It processes the '4' and the '2' separately.
3.  It converts each decimal digit into its 4-bit BCD equivalent using the table above.
4.  It displays these two 4-bit BCD groups, separated by a space, next to the corresponding label (H:, M:, S:).

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
