# Known Issues — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0  
**Status**: Open / Workaround / Fixed / Won't Fix

---

## Open Issues

### ISSUE-001: Instagram May Change `data-testid` Selectors
**Severity**: Medium  
**Description**: Instagram could rename or remove `data-testid` attributes in future redesigns, breaking checkbox/container detection.  
**Reproduction**: Monitor Instagram updates; test after major UI changes.  
**Workaround**: Fallback selectors in place (ARIA, structural, SVG). Update `LEARNED.md` with new selectors.  
**Status**: Open — monitoring

### ISSUE-002: Performance Mode May Hide Legitimate UI
**Severity**: Low  
**Description**: Aggressive CSS hiding (`body > *:not(...)`) may hide legitimate content if Instagram changes DOM structure.  
**Reproduction**: Start Continuous, inspect for missing content that should be visible.  
**Workaround**: Stop script → DOM restored. Update container selectors in `enablePerformanceMode()`.  
**Status**: Open — acceptable trade-off for speed

### ISSUE-003: Long-Press Detection Edge Cases
**Severity**: Low  
**Description**: 400ms threshold may conflict with slow taps or accessibility settings.  
**Reproduction**: Tap slowly on button; check if long-press triggers accidentally.  
**Workaround**: Adjust threshold in code; user can use menu Pause/Resume instead.  
**Status**: Open — monitor user feedback

### ISSUE-004: `processedInSession` Memory Growth
**Severity**: Info  
**Description**: `Set` grows indefinitely during long sessions (thousands of items).  
**Impact**: Negligible — few KB per thousand items.  
**Workaround**: Reset button clears Set; page reload clears all.  
**Status**: Known limitation — acceptable

### ISSUE-005: Story Replies Page Structure May Differ
**Severity**: Low  
**Description**: Story replies may have different container structure than comments/likes.  
**Reproduction**: Test on story replies page with many items.  
**Workaround**: Fallback to `main[role="main"]` and generic scroll detection.  
**Status**: Open — needs real testing

### ISSUE-006: Background Tab Kill on Android
**Severity**: Medium  
**Description**: Firefox Android kills background tabs after ~5 min → script state lost on resume.  
**Mitigation**: `setInterval` re-injects button fast (<100ms); `processedInSession` in memory only (lost on reload).  
**Workaround**: Export `processedInSession` to `localStorage` for persistence (future enhancement).  
**Status**: Open — platform limitation

### ISSUE-007: No Automated Visual Regression Testing
**Severity**: Info  
**Description**: Playwright tests verify injection only, not visual correctness.  
**Impact**: Manual screenshot comparison needed.  
**Status**: Known limitation — manual testing only

---

## Historical Issues (Fixed in v5.1.0+)

### FIXED: OneShot Was Secretly Scrolling
**Severity**: High (was)  
**Version Fixed**: 5.1.0  
**Description**: `ensureMinItems()` called in OneShot → scrolled to load more items, violating "instant visible only" principle.  
**Fix**: OneShot now uses `getUnselectedCheckboxes()` directly — **zero scroll**.

### FIXED: Menu Auto-Closed During Operation
**Severity**: High (was)  
**Version Fixed**: 5.1.0  
**Description**: `document.click` listener closed menu when clicking inside menu during Continuous run.  
**Fix**: Guard with `!isRunning` — menu stays open during operation.

### FIXED: Duplicate Clicks When Items Re-render
**Severity**: High (was)  
**Version Fixed**: 5.1.0  
**Description**: Instagram re-renders list items → same element reference lost → re-clicked.  
**Fix**: `processedInSession = new Set()` tracks clicked elements by reference.

### FIXED: Performance Mode Broke Scroll Detection
**Severity**: Medium (was)  
**Version Fixed**: 5.0.0  
**Description**: After making container fixed+fullscreen, old scroll container reference invalid.  
**Fix**: Store reference in `window._igPerformanceTarget`, check it first in `findScrollContainer()`.

### FIXED: React Click Handlers Not Triggered
**Severity**: High (was)  
**Version Fixed**: 5.0.0  
**Description**: `el.click()` alone doesn't trigger React synthetic event system.  
**Fix**: Dispatch composed `MouseEvent` with coordinates + `composed: true`.

### FIXED: Class-Based Selectors Broke Every Deploy
**Severity**: Critical (was)  
**Version Fixed**: 4.0.0  
**Description**: Instagram utility classes (`.x1iyjqo2`, etc.) randomized per build.  
**Fix**: Switched to `data-testid` semantic selectors.

### FIXED: Navigation on Checkbox Click
**Severity**: Critical (was)  
**Version Fixed**: 4.0.0  
**Description**: Clicking checkbox navigated to post (wrapped in `<a>`).  
**Fix**: Capture-phase event listener on parent link.

---

## Won't Fix

### WONTFIX: GreaseMonkey / Violentmonkey Support
**Reason**: `@grant none` + standard APIs should work, but not tested. Primary target is Tampermonkey.

### WONTFIX: Chrome/Edge/Safari Testing
**Reason**: Firefox Android is primary target. Other browsers work but not verified.

### WONTFIX: Automatic `localStorage` Persistence for `processedInSession`
**Reason**: Adds complexity; Reset button + page reload sufficient for current use case. Can be added if requested.