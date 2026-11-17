# Instagram Bulk Select — Learnings

## Selectors That Worked (2026-11-14)

### Primary (Modern wbloks UI — all 3 pages)
```javascript
// Checkbox container (click target)
'[data-testid="bulk_action_checkbox"]'

// Inner toggle button (for precise click)
'[data-testid="bulk_action_checkbox"] [role="button"][aria-label="Toggle checkbox"]'

// Selection state indicator (blue = selected)
'[data-testid="bulk_action_checkbox"] [role="button"][aria-label="Toggle checkbox"] div[style*="74,93,249"]'
```

### Scroll Containers (in priority order)
```javascript
// Performance mode target (stored in window._igPerformanceTarget)
window._igPerformanceTarget

// Direct container elements
'div[data-testid="comments_container_non_empty_state"]'
'div[data-testid="likes_container_non_empty_state"]'
'div[data-testid="story_replies_container_non_empty_state"]'
'div[data-testid="interactions_container_non_empty_state"]'

// Child scrollable areas (fallback)
'div[data-testid="comments_container_non_empty_state"] > div > div'
// ... same pattern for likes, story_replies, interactions

// Generic fallbacks
'main[role="main"]'
'div.x1iyjqo2.xg6iff7'
'div.xvbhtw8.x78zum5.xdt5ytf.x1iyjqo2.xl56j7k'
'div[style*="--x-height"]'
```

### Fallback (Old Comments UI — pre-wbloks)
```javascript
// SVG with empty aria-label inside specific div structure
'svg.x1lliihq.x1n2onr6.x1roi4f4[aria-label=""]'
// Parent checkbox div classes
'div.x9f619.xxk0z11.xii2z7h.x11xpdln.x19c4wfv.xvy4d1p[aria-selected]'
```

## Selectors That Failed

| Selector | Reason |
|----------|--------|
| `.x1i10hfl` (link wrapper) | Too generic, matches all links |
| `svg[aria-label="Select"]` | Label changes per language |
| `.x1lliihq` alone | Multiple SVGs share this class |
| `:has(> svg)` | Not supported in all Firefox versions |
| Fixed class chains like `.x1iyjqo2.xg6iff7` | Instagram randomizes utility classes per build |

## SPA Navigation Patterns

### Instagram Your Activity URLs
- `/your_activity/interactions/comments*`
- `/your_activity/interactions/likes*`
- `/your_activity/interactions/story_replies*`

### Navigation Behavior
- **Client-side routing** — full page reloads rare
- **pushState/replaceState** on tab switches
- **DOM rebuild** on each view — button must re-inject
- **MutationObserver on body** catches new containers

### Re-injection Strategy
```javascript
// Interval-based persistence (simple, reliable)
setInterval(() => {
    if (!document.getElementById('ig-bulk-select-btn')) createButton();
}, 1000);
```

## Gotchas

### 1. Checkbox Inside `<a>` Link → Navigation
**Problem:** Clicking checkbox navigates to post
**Solution:** Capture-phase event listener on parent link
```javascript
const link = target.closest('a[href]');
if (link) {
    link.addEventListener('click', e => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
    }, true); // capture phase!
}
```

### 2. React Click Handlers Need Proper Events
**Problem:** `el.click()` alone doesn't trigger React handlers
**Solution:** Dispatch composed MouseEvent with coordinates
```javascript
const evt = new MouseEvent('click', {
    bubbles: true, cancelable: true, view: window,
    clientX, clientY, button: 0, buttons: 0, composed: true
});
target.dispatchEvent(evt);
target.click(); // fallback
```

### 3. Performance Mode Breaks Scroll Detection
**Problem:** After making container fixed+fullscreen, old scroll container reference invalid
**Solution:** Store reference in `window._igPerformanceTarget`, check it first in `findScrollContainer()`

### 4. Duplicate Clicks When Items Re-render
**Problem:** Instagram re-renders list items → same element reference lost → re-clicked
**Solution:** `processedInSession = new Set()` tracks clicked elements by reference

### 5. OneShot Was Secretly Scrolling
**Problem:** `ensureMinItems()` called in OneShot → scrolled to load more
**Fix:** OneShot now uses `getUnselectedCheckboxes()` directly — **zero scroll**

### 6. Menu Auto-closed During Operation
**Problem:** `document.click` listener closed menu when clicking inside
**Fix:** Guard with `!isRunning` — menu stays open during operation

### 7. Android Firefox Touch Events
**Requirement:** Handle both `click` and `touchstart`/`touchend`
**Implementation:** Long-press detection on main button works on both

### 8. Animation/Transition Lag
**Problem:** Page animations (fade, slide) cause layout thrashing during rapid clicks
**Fix:** Inject CSS disabling ALL animations/transitions during performance mode
```css
*, *::before, *::after {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
}
```

## Performance Metrics

| Version | OneShot (100 items) | Continuous (per batch) | Memory |
|---------|---------------------|------------------------|--------|
| v4.0    | ~3s (with scroll)   | ~2s                    | High   |
| v5.0    | ~1.5s               | ~1.2s                  | Medium |
| **v5.1** | **~300ms**          | **~800ms**             | **Low** |

### Key Optimizations (v5.1)
- `CLICK_DELAY_MS = 0` (was 1ms)
- Single composed `MouseEvent` (was mousedown+mouseup+click sequence)
- Aggressive DOM hiding via CSS (not element-by-element)
- `SCROLL_STEP = 2000` (was 1200), `SCROLL_DELAY_MS = 30` (was 100)
- `MAX_SCROLL_ATTEMPTS = 15` (was 30)

## Android Firefox Quirks

### Verified Working
- `@run-at document-start` ✓
- `GM_addStyle` / style injection ✓
- `MutationObserver` ✓
- `MouseEvent` with `composed: true` ✓
- Touch events (`touchstart`, `touchend`) ✓
- `localStorage` persistence ✓
- `setInterval` for SPA re-injection ✓

### Limitations
- No `GM_download` — use `<a download>` instead
- `GM_xmlhttpRequest` cross-origin blocked on some domains
- Background tabs killed after ~5 min — script must re-init fast (<100ms)
- Tampermonkey menu: 3-dot → Tampermonkey → Userscripts

## Cross-Page Compatibility Matrix

| Feature | Comments | Likes | Story Replies |
|---------|----------|-------|---------------|
| `[data-testid="bulk_action_checkbox"]` | ✓ | ✓ | ✓ |
| Scroll container detection | ✓ | ✓ | ✓ |
| Performance mode | ✓ | ✓ | ✓ |
| SVG fallback | ✓ (old UI) | N/A | N/A |
| Navigation prevention | ✓ | ✓ | ✓ |

## Reusable Snippets (Add to global/SNIPPETS.md)

### `waitForElement(selector, timeout=5000)`
```javascript
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) { observer.disconnect(); resolve(el); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); reject(new Error('Timeout')); }, timeout);
    });
}
```

### `clickWhenReady(selector)`
```javascript
async function clickWhenReady(selector) {
    const el = await waitForElement(selector);
    const rect = el.getBoundingClientRect();
    const evt = new MouseEvent('click', {
        bubbles: true, cancelable: true, view: window,
        clientX: rect.left + rect.width/2, clientY: rect.top + rect.height/2,
        composed: true
    });
    el.dispatchEvent(evt);
    el.click();
}
```

### `observeSPA(callback)`
```javascript
function observeSPA(callback) {
    let lastUrl = location.href;
    const check = () => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            callback();
        }
    };
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', check);
    const originalPush = history.pushState;
    history.pushState = function(...args) {
        originalPush.apply(this, args);
        check();
    };
    return () => observer.disconnect();
}
```

### `enableMaxPerformance(targetContainer)`
```javascript
function enableMaxPerformance(container) {
    const style = document.createElement('style');
    style.id = 'max-perf-style';
    style.textContent = `
        header, nav, aside, footer, [role="banner"], [role="navigation"], [role="complementary"],
        div[style*="position: fixed"]:not(#our-ui), div[style*="position: sticky"] { display: none !important; }
        body > *:not(#our-ui):not(${container.matches('[data-testid]') ? `[data-testid="${container.getAttribute('data-testid')}"]` : 'main[role="main"]'}) { display: none !important; }
        *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }
        html, body { overflow: hidden !important; height: 100% !important; margin: 0 !important; padding: 0 !important; }
    `;
    document.head.appendChild(style);
    Object.assign(container.style, { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, overflow: 'auto', background: '#000' });
    return () => { style.remove(); Object.keys(container.style).forEach(k => container.style[k] = ''); };
}
```

## Test Cases (for tests/test-plan.md)

| Test | Expected |
|------|----------|
| Open comments page → click button → menu opens | ✓ |
| Set batch=50 → One Shot → 50 visible selected instantly | ✓ |
| Set batch=200 → One Shot → only visible (≤200) selected | ✓ |
| Continuous mode → selects batches until stopped | ✓ |
| Pause during continuous → stops selecting | ✓ |
| Resume → continues from where left off | ✓ |
| Stop → disables performance mode, restores DOM | ✓ |
| Long-press main button (400ms) → toggles pause | ✓ |
| Navigate between comments/likes/story_replies → button persists | ✓ |
| Click checkbox → no navigation to post | ✓ |
| Reset button → clears processed set | ✓ |
| Android Firefox (emulated 375×812) → all features work | ✓ |