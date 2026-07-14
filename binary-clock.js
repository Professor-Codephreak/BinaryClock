// binary-clock.js
// <binary-clock> — a self-contained, embeddable binary clock widget.
// Drop this script into any page and add <binary-clock></binary-clock>.
// Drag to move, Shift-drag / right-drag (or top-left grip) to rotate in 3D,
// bottom-right grip to resize. Position, scale, rotation, and display modes
// persist in localStorage per storage-key.
// License: BANKON
'use strict';

(() => {
    if (typeof customElements === 'undefined' || customElements.get('binary-clock')) return;

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

    const DEFAULT_BASE = 28.8;   // px; the old 1.8rem at a 16px root
    const MIN_BASE = 12;
    const MAX_BASE = 64;
    const DRAG_THRESHOLD = 5;    // px of movement before a press becomes a drag
    const INITIAL_ROTATION = { x: -15, y: 30 };
    const ROTATE_SENSITIVITY = 0.4;
    const STORAGE_PREFIX = 'binary-clock:v1:';
    const FONT_LINK_ID = 'binary-clock-font-vt323';

    let autoIndex = 0;

    // --- Font loading (shadow DOM can't host @font-face reliably) ---
    function ensureFontLoaded() {
        if (document.getElementById(FONT_LINK_ID)) return;
        const links = [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=VT323&display=swap', id: FONT_LINK_ID }
        ];
        for (const spec of links) {
            const link = document.createElement('link');
            link.rel = spec.rel;
            link.href = spec.href;
            if (spec.crossOrigin) link.crossOrigin = spec.crossOrigin;
            if (spec.id) link.id = spec.id;
            document.head.appendChild(link);
        }
    }

    // All interior dimensions are in em so the whole widget scales off one
    // custom property (--base-font-size) set inline on the host.
    const STYLES = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :host {
            --_c: var(--binary-clock-color, #00ff00);
            --_dim: var(--binary-clock-dim-color, #005000);
            --_bg: var(--binary-clock-bg, rgba(0, 20, 0, 0.9));
            --_glow: var(--_c);
            position: fixed;
            left: 0;
            top: 0;
            z-index: var(--binary-clock-z, 2147483000);
            display: block;
            width: max-content;
            font-size: var(--base-font-size, 28.8px);
            font-family: 'VT323', 'Courier New', monospace;
            color: var(--_c);
            line-height: 1.4;
            perspective: 41.7em;
            perspective-origin: 50% 50%;
            cursor: grab;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
        }
        :host([hidden]) { display: none; }
        :host(.dragging) { cursor: grabbing; }

        .cube {
            transform-style: preserve-3d;
            transition: transform 0.5s ease-out;
        }
        :host(.dragging) .cube { transition: none; }

        .clock-face {
            position: relative;
            padding: 0.868em;
            padding-top: 1.563em;
            border: 0.069em solid var(--_c);
            background-color: var(--_bg);
            box-shadow: 0 0 0.52em var(--_glow);
            transform: translateZ(1px);
            backface-visibility: hidden;
            min-width: 13.89em;
            transition: box-shadow 0.25s ease-out;
        }
        :host(.dragging-move) .clock-face { box-shadow: 0 0 0.9em var(--_glow); }

        .toggle-container {
            position: absolute;
            top: 0.278em;
            right: 0.278em;
            z-index: 5;
            display: flex;
            gap: 0.208em;
        }
        button {
            background-color: transparent;
            border: 0.058em solid var(--_dim);
            color: var(--_dim);
            padding: 0.116em 0.347em;
            font-family: inherit;
            font-size: 0.6em;
            cursor: pointer;
            transition: color 0.3s, border-color 0.3s, box-shadow 0.3s;
            border-radius: 0.174em;
            line-height: 1;
        }
        #toggle-hour-mode-btn {
            letter-spacing: 0.058em;
            min-width: 2.315em;
            text-align: center;
        }
        #toggle-mode-btn.active {
            color: var(--_c);
            border-color: var(--_c);
            box-shadow: 0 0 0.29em var(--_glow);
        }
        button:hover { color: var(--_c); border-color: var(--_c); }
        #toggle-mode-btn.active:hover { color: #aaffaa; border-color: #aaffaa; }

        .date-display {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 0.52em;
            border-bottom: 0.035em dashed var(--_dim);
            gap: 0.52em;
            flex-wrap: wrap;
        }
        .date-display > div { display: flex; align-items: baseline; gap: 0.347em; }
        .date-label { font-size: 0.85em; color: var(--_dim); }
        .binary-date {
            font-size: 0.8em;
            letter-spacing: 0.087em;
            text-shadow: 0 0 0.217em var(--_glow);
            word-break: break-all;
        }

        .binary-clock {
            margin-top: 0.694em;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.52em;
        }
        .time-section { display: flex; flex-direction: row; align-items: baseline; gap: 0.347em; width: 100%; }
        .label { font-size: 1em; color: var(--_c); flex-shrink: 0; width: 0.972em; text-align: right; }
        .binary-time {
            font-size: 0.9em;
            letter-spacing: 0.116em;
            text-shadow: 0 0 0.193em var(--_glow);
        }

        .handle {
            position: absolute;
            width: 0.9em;
            height: 0.9em;
            opacity: 0;
            transition: opacity 0.25s;
            z-index: 6;
        }
        .handle.resize {
            right: -0.2em;
            bottom: -0.2em;
            cursor: nwse-resize;
            border-right: 0.07em solid var(--_c);
            border-bottom: 0.07em solid var(--_c);
        }
        .handle.rotate {
            left: -0.2em;
            top: -0.2em;
            cursor: grab;
            border-left: 0.07em dotted var(--_c);
            border-top: 0.07em dotted var(--_c);
        }
        :host(:hover) .handle, :host(.dragging) .handle { opacity: 0.75; }
        :host(:hover) .handle:hover { opacity: 1; }
        @media (pointer: coarse) {
            .handle { opacity: 0.3; width: 1.3em; height: 1.3em; }
        }
    `;

    const TEMPLATE = `
        <div class="cube">
            <div class="clock-face">
                <div class="toggle-container">
                    <button id="toggle-hour-mode-btn" title="Toggle 12/24 Hour Format">1100</button>
                    <button id="toggle-mode-btn" title="Toggle BCD/Standard Time Display">BCD</button>
                </div>
                <div class="date-display">
                    <div><span class="date-label">Y:</span><span class="binary-date" id="year-binary">Loading..</span></div>
                    <div><span class="date-label">M:</span><span class="binary-date" id="month-binary">...</span></div>
                    <div><span class="date-label">D:</span><span class="binary-date" id="day-binary">...</span></div>
                </div>
                <div class="binary-clock">
                    <div class="time-section hours"><span class="label">H:</span><span class="binary-time" id="hours-binary">...</span></div>
                    <div class="time-section minutes"><span class="label">M:</span><span class="binary-time" id="minutes-binary">...</span></div>
                    <div class="time-section seconds"><span class="label">S:</span><span class="binary-time" id="seconds-binary">...</span></div>
                </div>
            </div>
        </div>
        <div class="handle rotate" title="Drag to rotate (or Shift-drag / right-drag anywhere)"></div>
        <div class="handle resize" title="Drag to resize"></div>
    `;

    let sharedSheet = null;
    try {
        sharedSheet = new CSSStyleSheet();
        sharedSheet.replaceSync(STYLES);
    } catch (e) {
        sharedSheet = null; // fall back to a <style> tag per instance
    }

    function decimalToBCD(digit) {
        const num = parseInt(digit, 10);
        if (isNaN(num) || num < 0 || num > 9) {
            console.warn(`Invalid digit provided to decimalToBCD: ${digit}`);
            return '0000';
        }
        return num.toString(2).padStart(4, '0');
    }

    class BinaryClockElement extends HTMLElement {
        static get observedAttributes() { return ['display-mode', 'hour-mode']; }

        constructor() {
            super();
            const root = this.attachShadow({ mode: 'open' });
            root.innerHTML = TEMPLATE;
            if (sharedSheet) {
                root.adoptedStyleSheets = [sharedSheet];
            } else {
                const style = document.createElement('style');
                style.textContent = STYLES;
                root.prepend(style);
            }

            this._cube = root.querySelector('.cube');
            this._yearEl = root.getElementById('year-binary');
            this._monthEl = root.getElementById('month-binary');
            this._dayEl = root.getElementById('day-binary');
            this._hoursEl = root.getElementById('hours-binary');
            this._minutesEl = root.getElementById('minutes-binary');
            this._secondsEl = root.getElementById('seconds-binary');
            this._toggleBcdBtn = root.getElementById('toggle-mode-btn');
            this._toggleHourBtn = root.getElementById('toggle-hour-mode-btn');
            this._resizeHandle = root.querySelector('.handle.resize');
            this._rotateHandle = root.querySelector('.handle.rotate');

            this._displayMode = 'binary'; // 'bcd' or 'binary'
            this._hourMode = '24';        // '12' or '24'
            this._rot = { ...INITIAL_ROTATION };
            this._base = DEFAULT_BASE;
            this._pos = { x: 0, y: 0 };
            this._pendingPos = null;      // saved/attribute position awaiting first layout
            this._autoCentered = false;   // true while auto-placed and untouched by the user
            this._drag = null;
            this._timer = null;
            this._saveTimer = null;
            this._initialized = false;

            this._onWindowResize = this._onWindowResize.bind(this);
            this._onVisibilityChange = this._onVisibilityChange.bind(this);

            this._toggleBcdBtn.addEventListener('click', () => {
                this._setDisplayMode(this._displayMode === 'bcd' ? 'binary' : 'bcd');
            });
            this._toggleHourBtn.addEventListener('click', () => {
                this._setHourMode(this._hourMode === '24' ? '12' : '24');
            });

            this.addEventListener('pointerdown', (e) => this._onPointerDown(e));
            this.addEventListener('pointermove', (e) => this._onPointerMove(e));
            this.addEventListener('pointerup', (e) => this._onPointerUp(e));
            this.addEventListener('pointercancel', (e) => this._onPointerUp(e));
            this.addEventListener('contextmenu', (e) => e.preventDefault());
            this.addEventListener('dragstart', (e) => e.preventDefault());
        }

        // --- Lifecycle ---

        connectedCallback() {
            ensureFontLoaded();
            if (!this._initialized) {
                this._initialized = true;
                this._storageKey = this.getAttribute('storage-key') || `bc${autoIndex++}`;
                this._restoreState();
                this._updateBcdButtonAppearance();
                this._updateHourButtonText();
                this._updateClock();
                this._applyBase();
                this._applyRotation();
                this._placeInitially();
            }
            window.addEventListener('resize', this._onWindowResize);
            document.addEventListener('visibilitychange', this._onVisibilityChange);
            this._tick();
        }

        disconnectedCallback() {
            clearTimeout(this._timer);
            this._timer = null;
            window.removeEventListener('resize', this._onWindowResize);
            document.removeEventListener('visibilitychange', this._onVisibilityChange);
            if (this._saveTimer) this._save(); // flush pending debounced save
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this._initialized || oldValue === newValue) return;
            if (name === 'display-mode') this._setDisplayMode(newValue);
            else if (name === 'hour-mode') this._setHourMode(newValue);
        }

        // --- Public API ---

        get displayMode() { return this._displayMode; }
        set displayMode(v) { this._setDisplayMode(String(v)); }
        get hourMode() { return this._hourMode; }
        set hourMode(v) { this._setHourMode(String(v)); }
        get scale() { return this._base; }

        /** Restore default rotation and scale, and re-center in the viewport. */
        resetView() {
            this._rot = { ...INITIAL_ROTATION };
            this._base = DEFAULT_BASE;
            this._applyBase();
            this._applyRotation();
            const rect = this.getBoundingClientRect();
            this._pos = this._clampPos({
                x: (window.innerWidth - rect.width) / 2,
                y: (window.innerHeight - rect.height) / 2
            }, rect);
            this._applyPos();
            this._save();
        }

        clearSavedState() {
            try { localStorage.removeItem(STORAGE_PREFIX + this._storageKey); } catch (e) { /* ignore */ }
        }

        // --- State / persistence ---

        _restoreState() {
            const saved = this._loadState();
            const attrMode = this.getAttribute('display-mode');
            const attrHour = this.getAttribute('hour-mode');
            const attrScale = parseFloat(this.getAttribute('scale'));
            const attrX = parseFloat(this.getAttribute('x'));
            const attrY = parseFloat(this.getAttribute('y'));

            const mode = saved?.displayMode ?? attrMode;
            if (mode === 'bcd' || mode === 'binary') this._displayMode = mode;
            const hour = saved?.hourMode ?? attrHour;
            if (hour === '12' || hour === '24') this._hourMode = hour;

            const base = saved?.base ?? attrScale;
            if (Number.isFinite(base)) this._base = Math.min(MAX_BASE, Math.max(MIN_BASE, base));

            if (Number.isFinite(saved?.rotX) && Number.isFinite(saved?.rotY)) {
                this._rot = { x: Math.max(-90, Math.min(90, saved.rotX)), y: saved.rotY };
            }

            const x = saved?.x ?? attrX;
            const y = saved?.y ?? attrY;
            if (Number.isFinite(x) && Number.isFinite(y)) this._pendingPos = { x, y };
        }

        _loadState() {
            if (this.hasAttribute('no-persist')) return null;
            try {
                const raw = localStorage.getItem(STORAGE_PREFIX + this._storageKey);
                if (!raw) return null;
                const state = JSON.parse(raw);
                return (state && state.v === 1) ? state : null;
            } catch (e) {
                return null;
            }
        }

        _save() {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
            if (this.hasAttribute('no-persist')) return;
            try {
                localStorage.setItem(STORAGE_PREFIX + this._storageKey, JSON.stringify({
                    v: 1,
                    x: Math.round(this._pos.x),
                    y: Math.round(this._pos.y),
                    base: Math.round(this._base * 100) / 100,
                    rotX: Math.round(this._rot.x * 10) / 10,
                    rotY: Math.round(this._rot.y * 10) / 10,
                    displayMode: this._displayMode,
                    hourMode: this._hourMode
                }));
            } catch (e) { /* storage full or unavailable */ }
        }

        _saveDebounced() {
            clearTimeout(this._saveTimer);
            this._saveTimer = setTimeout(() => this._save(), 200);
        }

        // --- Placement / geometry ---

        _placeInitially() {
            // Hide for one frame so we can measure, fit, and position before first paint.
            this.style.visibility = 'hidden';
            requestAnimationFrame(() => {
                if (!this.isConnected) { this.style.visibility = ''; return; }
                const wasAuto = !this._pendingPos;
                this._fitAndPlace(this._pendingPos);
                this._pendingPos = null;
                this.style.visibility = '';
                this._autoCentered = wasAuto;
                // Text metrics change once VT323 arrives; re-center if still untouched.
                if (wasAuto && document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        if (this._autoCentered && this.isConnected) this._fitAndPlace(null);
                    });
                }
            });
        }

        _fitAndPlace(target) {
            let rect = this.getBoundingClientRect();
            const fit = Math.min(
                1,
                rect.width ? (window.innerWidth * 0.95) / rect.width : 1,
                rect.height ? (window.innerHeight * 0.95) / rect.height : 1
            );
            if (fit < 1) {
                this._base = Math.max(MIN_BASE, this._base * fit);
                this._applyBase();
                rect = this.getBoundingClientRect();
            }
            const pos = target || {
                x: (window.innerWidth - rect.width) / 2,
                y: (window.innerHeight - rect.height) / 2
            };
            this._pos = this._clampPos(pos, rect);
            this._applyPos();
        }

        _clampPos(pos, rect) {
            const r = rect || this.getBoundingClientRect();
            return {
                x: Math.max(0, Math.min(pos.x, window.innerWidth - r.width)),
                y: Math.max(0, Math.min(pos.y, window.innerHeight - r.height))
            };
        }

        _applyPos() {
            this.style.left = `${this._pos.x}px`;
            this.style.top = `${this._pos.y}px`;
        }

        _applyBase() {
            this.style.setProperty('--base-font-size', `${this._base}px`);
        }

        _applyRotation() {
            this._cube.style.transform = `rotateX(${this._rot.x}deg) rotateY(${this._rot.y}deg)`;
        }

        _onWindowResize() {
            this._pos = this._clampPos(this._pos);
            this._applyPos();
            this._saveDebounced();
        }

        // --- Drag / rotate / resize state machine ---

        _onPointerDown(e) {
            if (this._drag) return;
            if (e.button !== 0 && e.button !== 2) return;
            const path = e.composedPath();
            // Buttons keep their native click behavior; never start a drag from them.
            if (path.some((n) => n.tagName === 'BUTTON')) return;

            let mode;
            if (path.includes(this._resizeHandle)) mode = 'resize';
            else if (path.includes(this._rotateHandle) || e.shiftKey || e.button === 2) mode = 'rotate';
            else mode = 'move';

            const rect = this.getBoundingClientRect();
            this._drag = {
                mode,
                pointerId: e.pointerId,
                active: mode === 'resize', // resize commits immediately; move/rotate wait for threshold
                startX: e.clientX,
                startY: e.clientY,
                startPos: { ...this._pos },
                startRot: { ...this._rot },
                startBase: this._base,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
            };
            if (this._drag.active) this._beginDrag();
            this.setPointerCapture(e.pointerId);
            e.preventDefault();
        }

        _onPointerMove(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.pointerId) return;
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;

            if (!d.active) {
                if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return; // still a click, not a drag
                d.active = true;
                this._beginDrag();
            }

            if (d.mode === 'move') {
                this._pos = this._clampPos({ x: d.startPos.x + dx, y: d.startPos.y + dy });
                this._applyPos();
            } else if (d.mode === 'rotate') {
                this._rot.y = d.startRot.y + dx * ROTATE_SENSITIVITY;
                this._rot.x = Math.max(-90, Math.min(90, d.startRot.x - dy * ROTATE_SENSITIVITY));
                this._applyRotation();
            } else { // resize: scale by diagonal displacement from the widget center
                const startDiag = Math.hypot(d.startX - d.centerX, d.startY - d.centerY) || 1;
                const newDiag = Math.hypot(e.clientX - d.centerX, e.clientY - d.centerY);
                this._base = Math.min(MAX_BASE, Math.max(MIN_BASE, d.startBase * (newDiag / startDiag)));
                this._applyBase();
                this._pos = this._clampPos(this._pos); // growing near an edge must not overflow
                this._applyPos();
            }
            this._saveDebounced();
        }

        _onPointerUp(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.pointerId) return;
            const wasActive = d.active;
            this._drag = null;
            this._endDrag();
            if (wasActive) this._save();
        }

        _beginDrag() {
            this._autoCentered = false; // user has taken control of placement
            this.classList.add('dragging');
            if (this._drag.mode === 'move') this.classList.add('dragging-move');
        }

        _endDrag() {
            this.classList.remove('dragging', 'dragging-move');
        }

        // --- Mode toggles ---

        _setDisplayMode(mode) {
            if ((mode !== 'bcd' && mode !== 'binary') || mode === this._displayMode) return;
            this._displayMode = mode;
            this._updateBcdButtonAppearance();
            this._updateHourButtonText();
            this._updateClock();
            this._save();
            this._emitChange();
        }

        _setHourMode(mode) {
            if ((mode !== '12' && mode !== '24') || mode === this._hourMode) return;
            this._hourMode = mode;
            this._updateHourButtonText();
            this._updateClock();
            this._save();
            this._emitChange();
        }

        _emitChange() {
            this.dispatchEvent(new CustomEvent('binary-clock-change', {
                bubbles: true,
                composed: true,
                detail: { displayMode: this._displayMode, hourMode: this._hourMode }
            }));
        }

        /** Updates the BCD toggle button's active appearance. */
        _updateBcdButtonAppearance() {
            this._toggleBcdBtn.classList.toggle('active', this._displayMode === 'bcd');
        }

        /** Updates the 12/24 toggle button's text based on BOTH hourMode and displayMode. */
        _updateHourButtonText() {
            // The button shows the mode it will switch TO, in the active encoding.
            const targetModeValue = (this._hourMode === '24') ? '12' : '24';
            const formatType = (this._displayMode === 'bcd') ? 'bcd' : 'std';
            this._toggleHourBtn.textContent = HOUR_MODE_VALUES[targetModeValue][formatType];
        }

        // --- Clock ---

        _tick() {
            clearTimeout(this._timer);
            this._updateClock();
            // Self-aligning: fire just after the next second boundary, no drift.
            const delay = 1000 - (Date.now() % 1000) + 5;
            this._timer = setTimeout(() => this._tick(), delay);
        }

        _onVisibilityChange() {
            if (!document.hidden) this._updateClock();
        }

        _updateClock() {
            try {
                const now = new Date();

                // 1. Update Date (Always Standard Binary)
                this._yearEl.textContent = now.getFullYear().toString(2).padStart(YEAR_BITS, '0');
                this._monthEl.textContent = (now.getMonth() + 1).toString(2).padStart(MONTH_BITS, '0');
                this._dayEl.textContent = now.getDate().toString(2).padStart(DAY_BITS, '0');

                // 2. Process Hours based on 12/24 mode
                const rawHours24 = now.getHours(); // 0-23
                let displayHours;
                let hoursStdBits;
                if (this._hourMode === '12') {
                    displayHours = rawHours24 % 12;
                    if (displayHours === 0) displayHours = 12;
                    hoursStdBits = HOURS_STD_BITS_12;
                } else {
                    displayHours = rawHours24;
                    hoursStdBits = HOURS_STD_BITS_24;
                }

                const hoursStr = String(displayHours).padStart(2, '0');
                const minutesStr = String(now.getMinutes()).padStart(2, '0');
                const secondsStr = String(now.getSeconds()).padStart(2, '0');

                // 3. Update Time Display (Based on displayMode BCD/Standard)
                if (this._displayMode === 'bcd') {
                    this._hoursEl.textContent = decimalToBCD(hoursStr[0]) + ' ' + decimalToBCD(hoursStr[1]);
                    this._minutesEl.textContent = decimalToBCD(minutesStr[0]) + ' ' + decimalToBCD(minutesStr[1]);
                    this._secondsEl.textContent = decimalToBCD(secondsStr[0]) + ' ' + decimalToBCD(secondsStr[1]);
                } else {
                    this._hoursEl.textContent = displayHours.toString(2).padStart(hoursStdBits, '0');
                    this._minutesEl.textContent = parseInt(minutesStr, 10).toString(2).padStart(MIN_SEC_STD_BITS, '0');
                    this._secondsEl.textContent = parseInt(secondsStr, 10).toString(2).padStart(MIN_SEC_STD_BITS, '0');
                }
            } catch (error) {
                console.error('Error during clock update:', error);
            }
        }
    }

    customElements.define('binary-clock', BinaryClockElement);
})();
