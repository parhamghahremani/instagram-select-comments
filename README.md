# Instagram Bulk Select

**Professional Tampermonkey userscript for bulk-selecting items on Instagram "Your Activity" pages.**

Selects comments, likes, and story replies in configurable batches with OneShot (instant) and Continuous modes.

---

## Features

| Feature | Description |
|---------|-------------|
| **True OneShot** | Selects only currently visible items — **zero scrolling**, completes in ~300ms for 100 items |
| **Continuous Mode** | Scrolls automatically, selects batch after batch until stopped |
| **Pause/Resume** | Menu stays open during operation with dedicated controls; **long-press main button (400ms)** for instant toggle |
| **Zero Duplicates** | Tracks every clicked checkbox — never clicks the same item twice |
| **Max Performance** | Hides header/nav/aside/footer, disables all animations/transitions, fullscreen container |
| **Cross-Page** | Works on Comments, Likes, and Story Replies uniformly |
| **SPA Persistent** | Button survives Instagram's client-side navigation |
| **Mobile Ready** | Tested on Firefox Android (touch events, responsive UI) |

---

## Installation

### Desktop (Firefox/Chrome/Edge)
1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Click **[Raw Script URL](https://github.com/parhamghahremani/userscripts/raw/main/instagram-select-comments/dist/instagram-select-comments.user.js)** → Tampermonkey will prompt to install
3. Or: Copy `src/instagram-select-comments.user.js` → Tampermonkey → Create new script → Paste → Save

### Android (Firefox + Tampermonkey)
1. Install [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) + [Tampermonkey](https://addons.mozilla.org/android/addon/tampermonkey/)
2. Open this README on phone → tap **Raw Script URL** above → Tampermonkey Android will import automatically
3. Or: In Tampermonkey Android → `+` → Import from URL → paste raw GitHub URL

---

## Usage

1. Navigate to any Instagram "Your Activity" page:
   - `https://www.instagram.com/your_activity/interactions/comments`
   - `https://www.instagram.com/your_activity/interactions/likes`
   - `https://www.instagram.com/your_activity/interactions/story_replies`

2. **Blue circular button** appears at middle-right of screen

3. **Click button** → menu opens:
   - **Batch Size** — how many items per batch (default: 100)
   - **Mode** — One Shot (instant, visible only) or Continuous (scrolls & batches)
   - **Run One Shot (N)** — instant select visible items
   - **Start Continuous** — begins scrolling + batch selection

4. **During Continuous operation:**
   - Menu stays open with **Pause / Resume / Stop** buttons
   - **Long-press main button (400ms)** toggles pause/resume instantly
   - Status shows: `Running... X selected. Y available.`

5. **Reset** clears the internal tracker (allows re-selecting if needed)

---

## Configuration

Edit these constants at top of script:

```javascript
const DEFAULT_BATCH_SIZE = 100;    // Default batch size
const CLICK_DELAY_MS = 0;          // Delay between clicks (0 = max speed)
const SCROLL_DELAY_MS = 30;        // Wait after scroll (ms)
const SCROLL_STEP = 2000;          // Pixels per scroll step
const MAX_SCROLL_ATTEMPTS = 15;    // Max scrolls before giving up
```

---

## Technical Details

### Selectors Used
| Target | Selector |
|--------|----------|
| Checkbox (modern) | `[data-testid="bulk_action_checkbox"]` |
| Toggle button | `[role="button"][aria-label="Toggle checkbox"]` |
| Selected state | `div[style*="74,93,249"]` (Instagram blue) |
| Scroll containers | `[data-testid="*_container_non_empty_state"]` |

### Navigation Prevention
Checkboxes wrap in `<a>` links. Script uses **capture-phase listener** on parent link:
```javascript
link.addEventListener('click', e => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
}, true); // capture phase!
```

### SPA Handling
- `setInterval` re-injects button every 1s
- `MutationObserver` detects DOM changes
- Performance mode stores container reference in `window._igPerformanceTarget`

### Performance Mode (Auto-enabled During Run)
Injects CSS that:
- Hides `header`, `nav`, `aside`, `footer`, `[role="banner/navigation/complementary"]`
- Hides all fixed/sticky elements except script UI
- Disables **all** animations & transitions: `animation-duration: 0s !important; transition-duration: 0s !important;`
- Makes target container fixed fullscreen: `100vw × 100vh`

---

## Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| **5.1.0** | 2026-11-14 | True OneShot, pause/resume controls, duplicate prevention, max performance, mobile ready |
| 5.0.0 | 2026-11-13 | Menu system, performance mode, SPA persistence, debug API |
| 4.x | 2026-11-13 | Selector fixes, scroll detection, OneShot logic |
| 1-3.x | 2026-11-12 | Early prototypes, class-based selectors |

See [CHANGELOG.md](CHANGELOG.md) for full details.

---

## Debug API

Access via console: `window.IG_BULK_SELECT`

```javascript
IG_BULK_SELECT.getCheckboxes()           // All checkbox elements
IG_BULK_SELECT.getUnselectedCheckboxes() // Available for selection
IG_BULK_SELECT.startContinuous()         // Start continuous mode
IG_BULK_SELECT.pause()                   // Pause
IG_BULK_SELECT.resume()                  // Resume
IG_BULK_SELECT.stop()                    // Stop & cleanup
IG_BULK_SELECT.runOneShot()              // Run OneShot manually
IG_BULK_SELECT.setBatchSize(50)          // Change batch size
IG_BULK_SELECT.setMode('oneshot')        // Change mode
IG_BULK_SELECT.getState()                // Current state object
IG_BULK_SELECT.forceCreateButton()       // Re-inject button
```

---

## Development

### Workspace Structure
```
instagram-select-comments/
├── src/
│   └── instagram-select-comments.user.js   # Production script (EDIT THIS)
├── dist/
│   └── instagram-select-comments.user.js   # Build output (latest)
├── versions/
│   ├── instagram-select-comments-v5.1.0.user.js
│   └── ...
├── tests/
│   ├── test-plan.md                        # Manual + automated test cases
│   └── screenshots/
├── docs/                                   # Documentation
├── backups/                                # Local backups (gitignored)
├── global/                                 # Cross-script knowledge
├── .gitignore
├── .prettierrc
├── build.js
├── CHANGELOG.md
├── CLAUDE.md
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── playwright.config.js
├── PROJECT_STATUS.md
├── README.md
└── LEARNED.md
```

### Testing
```bash
# From project root
npm install          # Install dependencies
npm run lint         # Check code style
npm run format       # Auto-format
npm test             # Run Playwright tests
npm run build        # Create versioned release
```

### Contributing
1. Read `LEARNED.md` for known patterns
2. Follow test plan in `tests/test-plan.md`
3. Edit `src/instagram-select-comments.user.js`
4. Run `npm run lint` + `npm run format`
5. Run `npm test` (Playwright)
6. Bump version: `npm run version:patch|minor|major` (updates package.json + src/@version + git tag)
7. Run `npm run build` (creates dist/ + versions/)
8. Update `CHANGELOG.md` + `LEARNED.md` + `docs/` if needed
9. Commit + push after manual test approval

---

## License

MIT — Free to use, modify, distribute.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/parhamghahremani/userscripts/issues)
- **Discussions:** [GitHub Discussions](https://github.com/parhamghahremani/userscripts/discussions)

---

**Made for Firefox Desktop + Android. Works on all Instagram "Your Activity" interaction pages.**