# Configuration & Permissions — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0

---

## Userscript Metadata

```javascript
// ==UserScript==
// @name         Instagram Bulk Select (Comments, Likes, Story Replies)
// @namespace    http://tampermonkey.net/
// @version      5.1.0
// @description  Instant OneShot, pause/resume anytime, zero duplicates, max performance for all activity pages.
// @author       parham
// @match        https://www.instagram.com/your_activity/interactions/comments*
// @match        https://www.instagram.com/your_activity/interactions/likes*
// @match        https://www.instagram.com/your_activity/interactions/story_replies*
// @icon         https://www.instagram.com/favicon.ico
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/parhamghahremani/userscripts/raw/main/instagram-select-comments/versions/instagram-select-comments-v5.1.0.user.js
// @updateURL    https://github.com/parhamghahremani/userscripts/raw/main/instagram-select-comments/versions/instagram-select-comments-v5.1.0.user.js
// @supportURL   https://github.com/parhamghahremani/userscripts/issues
// @homepageURL  https://github.com/parhamghahremani/userscripts/tree/main/instagram-select-comments
// @license      MIT
// ==/UserScript==
```

---

## Metadata Field Analysis

| Field | Value | Rationale |
|-------|-------|-----------|
| `@name` | Instagram Bulk Select (Comments, Likes, Story Replies) | User-visible name in Tampermonkey |
| `@namespace` | http://tampermonkey.net/ | Default namespace (can be GitHub profile) |
| `@version` | 5.1.0 | Semantic version, matches package.json + Git tag |
| `@description` | Instant OneShot, pause/resume anytime... | Concise purpose |
| `@author` | parham | Attribution |
| `@match` | 3 Instagram Your Activity URLs | Precise scope — only target pages |
| `@icon` | Instagram favicon | Recognizable icon in dashboard |
| `@grant` | none | No GM APIs needed; CSP compatible; maximum compatibility |
| `@run-at` | document-start | Critical: early injection for SPA persistence |
| `@downloadURL` | Versioned GitHub raw URL | Tampermonkey update checks |
| `@updateURL` | Versioned GitHub raw URL | Tampermonkey update checks |
| `@supportURL` | GitHub issues | User support channel |
| `@homepageURL` | GitHub repo tree | Project home |
| `@license` | MIT | Open source license |

---

## Configuration Constants (CONFIG)

All behavior controlled via constants at top of script:

```javascript
const DEFAULT_BATCH_SIZE = 100;    // Default batch size
const CLICK_DELAY_MS = 0;          // Delay between clicks (0 = max speed)
const SCROLL_DELAY_MS = 30;        // Wait after scroll (ms)
const SCROLL_STEP = 2000;          // Pixels per scroll step
const MAX_SCROLL_ATTEMPTS = 15;    // Max scrolls before giving up
const BUTTON_SIZE = 48;            // Main button diameter (px)
const MENU_WIDTH = 280;            // Menu width (px)

const COLORS = {
    primary: '#0095f6',
    active: '#00c853',
    paused: '#ff9800',
    danger: '#ff3333',
    background: '#1a1a1a',
    surface: '#262626',
    border: '#333',
    text: '#fff',
    textMuted: '#aaa',
};
```

### Runtime Configuration (via Menu)

| Setting | Default | Range | Persisted |
|---------|---------|-------|-----------|
| Batch Size | 100 | 1–1000 | Yes (menu reopen) |
| Mode | oneshot | oneshot / continuous | Yes |

### Debug API Configuration

Access via console: `window.IG_BULK_SELECT`

```javascript
IG_BULK_SELECT.setBatchSize(50)          // Change batch size
IG_BULK_SELECT.setMode('continuous')     // Change mode
IG_BULK_SELECT.getState()                // Current state object
```

---

## Permissions & Security

### `@grant none` — No Elevated Permissions

**Benefits**:
- Content Security Policy (CSP) compatible
- Works on all sites without permission prompts
- Maximum browser compatibility
- No access to `GM_*` APIs (not needed)

**APIs Used (Standard Web APIs)**:
- `document.createElement`, `appendChild` — DOM manipulation
- `MutationObserver` — DOM change detection
- `setInterval`, `setTimeout` — Timing
- `requestAnimationFrame` — Smooth scrolling
- `MouseEvent` — Synthetic click events
- `localStorage` — State persistence (optional)
- `history.pushState/replaceState` — SPA navigation detection
- `addEventListener` (capture phase) — Navigation blocking

### No Cross-Origin Requests

- No `fetch`, `GM_xmlhttpRequest`, or `XMLHttpRequest`
- No external API calls
- All operations local to Instagram pages

---

## CSP Compatibility

Script works under strict CSP because:
1. No `eval()` or `new Function()`
2. No inline scripts (single IIFE injected by Tampermonkey)
3. Styles injected via `style.textContent` (not `styleSheet.cssText`)
4. No external resources loaded (icon is Instagram favicon)

---

## Tampermonkey Version Requirements

| Feature | Min Version |
|---------|-------------|
| `@run-at document-start` | 4.0+ |
| `@grant none` | 3.0+ |
| `@downloadURL`/`@updateURL` | 4.0+ |
| `page.addScriptTag()` (Playwright) | N/A (test only) |

**Tested**: Tampermonkey 5.3+ (latest)

---

## Installation URLs

| Environment | URL |
|-------------|-----|
| **Production (latest)** | `https://github.com/parhamghahremani/userscripts/raw/main/instagram-select-comments/dist/instagram-select-comments.user.js` |
| **Versioned (v5.1.0)** | `https://github.com/parhamghahremani/userscripts/raw/main/instagram-select-comments/versions/instagram-select-comments-v5.1.0.user.js` |
| **Source (for inspection)** | `https://github.com/parhamghahremani/userscripts/tree/main/instagram-select-comments/src/instagram-select-comments.user.js` |

**Android Import**: Tap versioned URL in Firefox Android → Tampermonkey imports automatically