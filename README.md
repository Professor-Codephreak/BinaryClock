# JavaScript Binary Clock Widget (BCD & Binary Date)

An interactive 3D binary clock packaged as a self-contained `<binary-clock>` Web Component. Drop one script tag into **any** page and place the clock anywhere: drag it to move, Shift-drag (or right-drag) to rotate it in 3D, and pull the corner grip to resize. Position, size, rotation, and display modes persist in `localStorage`.

## Quick Start (embed in any page)

```html
<script src="binary-clock.js"></script>
<binary-clock></binary-clock>
```

That's it — no build step, no dependencies. The component renders in shadow DOM (host-page styles cannot bleed in), floats above the page with `position: fixed`, and injects the VT323 Google Font link into the document head once (with a monospace fallback if offline).

## Interaction

| Gesture | Action |
| :--- | :--- |
| Drag the clock face | **Move** the widget (clamped to the viewport) |
| Shift-drag or right-drag | **Rotate** in 3D (X clamped to ±90°) |
| Top-left corner grip (dotted) | **Rotate** — touch-friendly |
| Bottom-right corner grip (solid) | **Resize** — proportional scaling of the whole widget |
| `BIN`/`BCD`/`DEC` button | Cycle the time display: Standard Binary → BCD → Decimal (readable digital time) |
| Hour-format button | Toggle 12/24 hour format (label shows the target mode in the active encoding) |
| `DATE` button | Toggle the date row between binary (default) and human-readable (`Y: 2026 M: JUL D: 13`) |

Corner grips fade in on hover (faintly visible on touch devices). A press that moves less than 5px is treated as a click, so the toggle buttons never fight with dragging.

## Attributes

All attributes are optional and act as **first-run defaults**; saved state wins on later loads.

| Attribute | Values | Description |
| :--- | :--- | :--- |
| `storage-key` | any string | localStorage namespace (`binary-clock:v1:<key>`). Set explicit keys when using multiple instances. |
| `display-mode` | `binary` \| `bcd` \| `time` | Initial time display (default `binary`; `time` = decimal digital readout) |
| `hour-mode` | `24` \| `12` | Initial hour format (default `24`) |
| `date-mode` | `binary` \| `human` | Initial date format (default `binary`) |
| `x`, `y` | px numbers | Initial position (default: centered in viewport) |
| `scale` | px number | Initial base font size, 12–64 (default 28.8) |
| `no-persist` | boolean | Disable localStorage entirely |

```html
<binary-clock storage-key="desk" display-mode="bcd" hour-mode="12" x="40" y="40" scale="20"></binary-clock>
```

## JavaScript API

```js
const clock = document.querySelector('binary-clock');
clock.displayMode = 'bcd';   // or 'binary' / 'time'
clock.hourMode = '12';       // or '24'
clock.dateMode = 'human';    // or 'binary'
clock.scale;                 // read-only current base font size (px)
clock.resetView();           // default rotation + scale, re-center
clock.clearSavedState();     // drop this instance's localStorage entry
clock.addEventListener('binary-clock-change', (e) => console.log(e.detail)); // {displayMode, hourMode, dateMode}
```

## Theming

Set CSS custom properties on the element (or any ancestor):

```css
binary-clock {
    --binary-clock-color: #00ffff;                 /* primary glow color */
    --binary-clock-dim-color: #005050;             /* inactive labels/borders */
    --binary-clock-bg: rgba(0, 20, 20, 0.9);       /* face background */
    --binary-clock-z: 500;                          /* stacking order */
}
```

## What is BCD?

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
```
Unlike standard binary which converts the entire number (e.g., decimal 23 -> binary 10111), BCD handles each digit separately. This makes conversion to and from decimal displays simpler, which was useful in early digital electronics.

#### How the Clock Uses BCD for Time

--> The clock gets the current time in HH:MM:SS format (e.g., 16:15:42)<br />
--> For each component (Hours, Minutes, Seconds), it looks at the two decimal digits individually<br />
    * Example Hour (HH = 16): It processes the '1' and the '6' separately<br />
    * Example Minute (MM = 15): It processes the '1' and the '5' separately<br />
    * Example Second (SS = 42): It processes the '4' and the '2' separately<br /><br />
--> It converts each decimal digit into its 4-bit BCD equivalent using the table above<br /><br />
--> It displays these two 4-bit BCD groups, separated by a space, next to the corresponding label (H:, M:, S:)<br />

```txt
* Example Time: **16:15:42**
    * **H:** Decimal '1' -> BCD `0001`, Decimal '6' -> BCD `0110`. Display: `H: 0001 0110`
    * **M:** Decimal '1' -> BCD `0001`, Decimal '5' -> BCD `0101`. Display: `M: 0001 0101`
    * **S:** Decimal '4' -> BCD `0100`, Decimal '2' -> BCD `0010`. Display: `S: 0100 0010`
```
This BCD representation correctly handles the full range of hours (00-23) and minutes (00-59) by encoding each constituent decimal digit. Seconds are shown as a progress bar sweeping across the minute rather than as digits.

## How the Display Works

### Date Display

By default the Year, Month, and Day values are shown in standard binary, padded to fixed lengths for consistent alignment:
```txt
* Year: 11 bits
* Month: 4 bits
* Day: 5 bits
```
The `DATE` button toggles a human-readable format instead — `Y: 2026  M: JUL  D: 13` — glowing bright while active.

### Time Display & Toggles

--> **Hour Format (12/24):**
    * Internal state defaults to 24-hour mode<br />
    * In 12-hour mode the raw hour (0-23) is converted to the 1-12 range<br />
    * The toggle button displays the *other* mode's value ("12" or "24") as its label, rendered in the currently active encoding (e.g. `1100` in standard binary, `0001 0010` in BCD)<br />
--> **Time Display (Binary/BCD/Decimal):**<br />
    * **Standard Binary (default):** the full H/M/S values are converted to base-2 and padded (5 bits for 24hr hours, 4 bits for 12hr hours, 6 bits for minutes/seconds)<br />
    * **BCD:** each decimal digit is converted to its own 4-bit group, displayed with a space between digits<br />
    * **Decimal (`DEC`):** plain digital readout of H/M; in 12-hour mode the hours row carries an AM/PM suffix<br />
    * **Seconds:** in every mode the S row renders as a glowing progress bar that sweeps continuously across the minute (a 1s linear fill between updates) and snaps back at the minute rollover; the underlying value is exposed via `aria-valuenow`<br />
    * The mode button cycles `BIN` → `BCD` → `DEC`, glowing bright whenever a non-default mode is active<br />
--> **Updates:** a self-aligning timer fires just after every second boundary, so no seconds are skipped and there is no drift. The display refreshes immediately when a hidden tab becomes visible again.

### 3D Interaction

* Each widget establishes its own CSS `perspective` on the host element<br />
* The clock face lives inside a `preserve-3d` wrapper whose `rotateX`/`rotateY` transform is updated during Shift-drag / right-drag / grip-drag (sensitivity 0.4, X clamped to ±90°)<br />
* Plain drags move the widget via `left`/`top`, clamped to the viewport; the window `resize` event re-clamps it<br />
* Resizing writes a single `--base-font-size` custom property — every internal dimension is in `em`, so the whole widget scales proportionally (12px–64px base)

### Persistence

Each instance saves `{position, scale, rotation, displayMode, hourMode}` under `binary-clock:v1:<storage-key>`. Mode toggles and drag-ends save immediately; mid-drag movement is debounced (~200ms). On load, saved geometry is validated and clamped to the current viewport. Use the `no-persist` attribute to opt out.

## File Structure
```txt
.
├── index.html         # Demo page with two <binary-clock> instances
├── binary-clock.js    # The entire widget: custom element, styles, clock logic,
│                      # move/rotate/resize interaction, persistence, font loader
└── README.md
```

## Setup

Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari), or serve the directory (`python3 -m http.server`) — no build steps or dependencies beyond the Google Font.

To embed elsewhere, copy `binary-clock.js` next to your page and add the script tag plus a `<binary-clock>` element as shown in Quick Start.

## Customization

* **Theme:** the `--binary-clock-*` custom properties above<br />
* **3D:** `perspective` in the `:host` rule or the `ROTATE_SENSITIVITY` / `INITIAL_ROTATION` constants in `binary-clock.js`<br />
* **Binary padding:** the bit-length constants (e.g., `YEAR_BITS`) in `binary-clock.js`<br />
* **Scale limits:** `MIN_BASE` / `MAX_BASE` in `binary-clock.js`

## Author

* binaryclock (c) 2025 Gregory L. Magnusson BANKON License
