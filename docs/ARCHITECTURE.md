# Architecture — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0

---

## High-Level Structure

```
instagram-select-comments.user.js (IIFE)
│
├── Configuration Constants          → DEFAULT_BATCH_SIZE, CLICK_DELAY_MS, etc.
├── State Management                 → isRunning, isPaused, batchSize, mode, processedInSession
├── Button Injection                 → createButton(), SPA re-injection (setInterval + MutationObserver)
├── Menu System                      → createMenu(), dynamic UI updates during run
├── Checkbox Detection               → getCheckboxes(), getUnselectedCheckboxes(), SVG fallback
├── Click Engine                     → fastClick() with composed MouseEvent + capture-phase navigation block
├── Scroll Engine                    → findScrollContainer(), scrollDown(), performance mode handling
├── OneShot Mode                     → runOneShot() — zero scroll, instant selection
├── Continuous Mode                  → startContinuous() — scroll + batch loop with pause/resume
├── Performance Mode                 → enablePerformanceMode() / disablePerformanceMode() — DOM cleanup
├── Long-Press Detection             → touchstart/touchend + mousedown/mouseup on main button
├── Debug API                        → window.IG_BULK_SELECT exposed for console access
└── Cleanup                          → stop() — restores DOM, clears timers, disconnects observers
```

---

## Module Breakdown

### 1. Configuration (Constants at Top)

```javascript
const DEFAULT_BATCH_SIZE = 100;
const CLICK_DELAY_MS = 0;
const SCROLL_DELAY_MS = 30;
const SCROLL_STEP = 2000;
const MAX_SCROLL_ATTEMPTS = 15;
const BUTTON_SIZE = 48;
const MENU_WIDTH = 280;

const COLORS = { ... };
```

Single source of truth for all thresholds and UI constants.

---

### 2. State Management

```javascript
let isRunning = false;        // Continuous mode active
let isPaused = false;         // Paused during continuous
let batchSize = DEFAULT_BATCH_SIZE;
let mode = 'oneshot';         // 'oneshot' | 'continuous'
let button = null;            // Main button element
let menu = null;              // Menu element
let menuOpen = false;
let scrollContainer = null;   // Detected scrollable container
let scrollAttempts = 0;
let performanceMode = false;  // Performance mode active
let processedInSession = new Set();  // Clicked checkbox references
let currentBatchPromise = null;      // For cancellation
```

---

### 3. Button Injection & SPA Persistence

**Timing**: `@run-at document-start` → executes early

**Strategies**:
1. `setInterval(createButton, 1000)` — simple, reliable fallback
2. `MutationObserver` on body — detects DOM rebuilds
3. URL change detection via `popstate` + `history.pushState` override

**Button Features**:
- Fixed position, middle-right, z-index 2147483647
- Touch + click handlers
- Long-press detection (400ms) for pause/resume
- Visual state: primary (idle), active (running), paused, danger (error)

---

### 4. Menu System

**Dynamic UI**: Menu content changes based on state:
- **Idle**: Batch input, mode toggle, "Run One Shot", "Start Continuous"
- **Running**: Pause/Resume/Stop buttons, status display
- **Persisted**: Batch size, mode survive menu close/reopen

**Outside-click guard**: `!isRunning` prevents auto-close during operation

---

### 5. Checkbox Detection

**Priority Selectors**:
1. `[data-testid="bulk_action_checkbox"]` — modern wbloks UI (all 3 pages)
2. `[role="button"][aria-label="Toggle checkbox"]` — inner toggle
3. `div[style*="74,93,249"]` — blue selection indicator
4. **Fallback**: `svg.x1lliihq.x1n2onr6.x1roi4f4[aria-label=""]` — old comments UI

**Processed Tracking**: `processedInSession` (WeakSet would be ideal but Set works)

---

### 6. Click Engine

**Fast Click** (React-compatible):
```javascript
const evt = new MouseEvent('click', {
    bubbles: true, cancelable: true, view: window,
    clientX, clientY, button: 0, buttons: 0, composed: true
});
target.dispatchEvent(evt);
target.click(); // fallback
```

**Navigation Blocking** (Capture Phase):
```javascript
const link = target.closest('a[href]');
link.addEventListener('click', e => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
}, true); // CAPTURE PHASE!
```

---

### 7. Scroll Engine

**Container Detection Priority**:
1. `window._igPerformanceTarget` (performance mode reference)
2. `[data-testid="*_container_non_empty_state"]` (page-specific)
3. Child scrollable areas: `> div > div`
4. Generic: `main[role="main"]`, utility class fallbacks

**Scroll Loop**: `scrollDown()` → `scrollBy(0, SCROLL_STEP)` → wait `SCROLL_DELAY_MS`

---

### 8. OneShot Mode

```javascript
async function runOneShot() {
    const checkboxes = getUnselectedCheckboxes(); // visible only!
    const toClick = checkboxes.slice(0, batchSize);
    for (const cb of toClick) { await fastClick(cb); }
    // NO SCROLL — zero scrolling by design
}
```

---

### 9. Continuous Mode

```javascript
async function startContinuous() {
    while (isRunning && !isPaused) {
        const checkboxes = getUnselectedCheckboxes();
        if (checkboxes.length === 0) {
            if (!await scrollDown()) break; // no more content
            continue;
        }
        const batch = checkboxes.slice(0, batchSize);
        for (const cb of batch) { await fastClick(cb); }
    }
}
```

**Pause/Resume**: `isPaused` flag checked each iteration

---

### 10. Performance Mode

**CSS Injected**:
```css
/* Hide Chrome UI */
header, nav, aside, footer, [role="banner"], [role="navigation"], [role="complementary"],
div[style*="position: fixed"]:not(#our-ui), div[style*="position: sticky"] { display: none !important; }

/* Keep only target container */
body > *:not(#our-ui):not([data-testid="..."]) { display: none !important; }

/* Kill ALL animations */
*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }

/* Fullscreen container */
html, body { overflow: hidden !important; height: 100% !important; margin: 0 !important; padding: 0 !important; }
```

**Container Transformation**:
```javascript
Object.assign(container.style, {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: '999999', overflow: 'auto', background: '#000'
});
```

**Cleanup**: Remove style, restore container styles, `window._igPerformanceTarget = null`

---

### 11. Debug API (`window.IG_BULK_SELECT`)

| Method | Purpose |
|--------|---------|
| `getCheckboxes()` | All checkbox elements |
| `getUnselectedCheckboxes()` | Available for selection |
| `startContinuous()` | Start continuous mode |
| `pause()` / `resume()` / `stop()` | Control |
| `runOneShot()` | Manual OneShot |
| `setBatchSize(n)` / `setMode('oneshot'\|'continuous')` | Config |
| `getState()` | Current state object |
| `forceCreateButton()` | Re-inject button |

---

## Data Flow

```
Page Load
    ↓
createButton() → inject button
    ↓
User clicks button → createMenu()
    ↓
User clicks "Run One Shot" → runOneShot()
    ↓
getUnselectedCheckboxes() → [checkboxes]
    ↓
for each: fastClick() + blockNavigation() + track in processedInSession
    ↓
Done → update status

OR

User clicks "Start Continuous" → startContinuous()
    ↓
enablePerformanceMode() → inject CSS, fullscreen container
    ↓
Loop: getUnselectedCheckboxes() → click batch → scrollDown() → repeat
    ↓
Pause/Resume via isPaused flag
    ↓
Stop → disablePerformanceMode() → restore DOM
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single IIFE, no build required | Tampermonkey native, zero deps, max compatibility |
| `@run-at document-start` | Early injection, SPA persistence from start |
| `data-testid` selectors | Stable across Instagram builds (unlike utility classes) |
| Capture-phase navigation blocking | Only way to prevent React link navigation |
| `composed: true` MouseEvent | Works through Shadow DOM boundaries |
| `Set` for duplicate tracking | O(1) lookup, survives re-renders by reference |
| Performance mode auto-enable | Maximum speed during continuous, restored after |
| Long-press on main button | Mobile-friendly, no menu navigation needed |
| Debug API on `window` | Easy console testing, no dev tools needed |