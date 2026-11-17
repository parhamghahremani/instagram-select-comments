# Specification — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0  
**Target Site**: `instagram.com` (Your Activity interaction pages)  
**Target Browsers**: Firefox Desktop (Windows 11), Firefox for Android  
**Userscript Manager**: Tampermonkey (latest)

---

## Purpose

Professional Tampermonkey userscript for bulk-selecting items on Instagram "Your Activity" pages (comments, likes, story replies) with configurable batch sizes, OneShot (instant) and Continuous modes, pause/resume capability, and maximum performance optimizations.

---

## Functional Requirements

### FR1: Button Injection & SPA Persistence
- **Trigger**: Page load on target URLs
- **Action**: Inject blue circular button at middle-right of screen
- **Persistence**: Survives Instagram client-side navigation via `setInterval` + `MutationObserver`
- **Target URLs**:
  - `https://www.instagram.com/your_activity/interactions/comments*`
  - `https://www.instagram.com/your_activity/interactions/likes*`
  - `https://www.instagram.com/your_activity/interactions/story_replies*`

### FR2: Menu System
- **Open**: Click button
- **Close**: Click outside menu or button again
- **Contents**:
  - Batch size input (number, default 100)
  - Mode toggle: OneShot / Continuous
  - Action buttons: "Run One Shot (N)" / "Start Continuous"
  - During run: "Pause" / "Resume" / "Stop" buttons
  - Status display: "Running... X selected. Y available."
  - Reset button

### FR3: OneShot Mode (True Instant)
- **Behavior**: Selects ONLY currently visible items — **zero scrolling**
- **Speed**: ~300ms for 100 items
- **Limit**: Batch size caps selection (e.g., batch=50 → max 50 selected)
- **No scroll**: Does not call `ensureMinItems()` or scroll to load more

### FR4: Continuous Mode
- **Behavior**: Scrolls automatically, selects batch after batch until stopped
- **Batch flow**: Scroll → wait → find checkboxes → click batch → repeat
- **Pause/Resume**: Menu stays open with dedicated controls
- **Long-press**: Hold main button 400ms toggles pause/resume instantly
- **Stop**: Disables performance mode, restores DOM, clears timers

### FR5: Duplicate Prevention
- **Mechanism**: `processedInSession = new Set()` tracks clicked checkbox elements by reference
- **Scope**: Session-wide (survives SPA navigation, reset via Reset button)

### FR6: Navigation Prevention
- **Problem**: Checkboxes wrap in `<a>` links → click navigates to post
- **Solution**: Capture-phase event listener on parent link:
  ```javascript
  link.addEventListener('click', e => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
  }, true); // capture phase!
  ```

### FR7: Maximum Performance Mode (Auto-enabled During Run)
- **CSS Injection**: Hides header/nav/aside/footer, fixed/sticky elements
- **Animation Killing**: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`
- **Fullscreen Container**: Target container made fixed 100vw × 100vh, z-index 999999
- **Cleanup**: On stop, all styles removed, DOM restored

### FR8: Cross-Page Support
- **Comments**: `[data-testid="comments_container_non_empty_state"]`
- **Likes**: `[data-testid="likes_container_non_empty_state"]`
- **Story Replies**: `[data-testid="story_replies_container_non_empty_state"]`
- **Unified Selector**: `[data-testid="bulk_action_checkbox"]` works on all three

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| OneShot Speed (100 items) | ≤ 300ms |
| Continuous Batch Speed | ≤ 800ms per batch |
| Memory Usage | Low (Set tracking only) |
| Console Errors | Zero |
| Layout Shift | None |
| Mobile Viewport | 375×812 minimum |
| Touch Events | Handled (touchstart/touchend) |

---

## Configuration Constants

| Constant | Default | Description |
|----------|---------|-------------|
| `DEFAULT_BATCH_SIZE` | 100 | Default batch size |
| `CLICK_DELAY_MS` | 0 | Delay between clicks (0 = max speed) |
| `SCROLL_DELAY_MS` | 30 | Wait after scroll (ms) |
| `SCROLL_STEP` | 2000 | Pixels per scroll step |
| `MAX_SCROLL_ATTEMPTS` | 15 | Max scrolls before giving up |
| `BUTTON_SIZE` | 48 | Main button diameter (px) |
| `MENU_WIDTH` | 280 | Menu width (px) |

---

## Acceptance Criteria

- [ ] Button injects on all 3 target pages
- [ ] Menu opens/closes correctly
- [ ] OneShot selects visible only, no scroll, instant
- [ ] Continuous scrolls, batches, pauses, resumes, stops
- [ ] Long-press (400ms) toggles pause/resume
- [ ] Zero navigation on checkbox click
- [ ] Zero duplicates across runs
- [ ] Reset clears tracker
- [ ] SPA navigation persists button
- [ ] Performance mode hides chrome, kills animations, fullscreen container
- [ ] DOM restored on stop
- [ ] Works on Desktop Firefox + Mobile Firefox (emulated)
- [ ] Zero console errors
- [ ] No visual regression