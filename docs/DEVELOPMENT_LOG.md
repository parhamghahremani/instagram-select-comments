# Development Log — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Format**: Date | Version | Milestone / Issue / Decision

---

## 2026-11-17 | 5.1.0 | Project Setup & Documentation (Current Session)
- Created workspace-standard project structure
- Added `.gitignore`, `package.json`, `build.js`, `eslint.config.mjs`, `playwright.config.js`, `.prettierrc`
- Created `docs/` with 10 documentation files
- Created `backups/` with `BACKUP_MANIFEST.md`
- Created `PROJECT_STATUS.md` and `CLAUDE.md` (project-specific)
- Initialized Git repository
- Created GitHub private repo: `parhamghahremani/instagram-select-comments`
- Initial commit + tag v5.1.0 pushed
- Initial backup snapshots created
- **Next**: Manual Firefox/Android testing, user approval

---

## 2026-11-14 | 5.1.0 | Release v5.1.0
- **True OneShot mode**: Selects only currently visible items instantly — zero scrolling
- **Pause/Resume during operation**: Menu stays open with dedicated Pause/Resume/Stop buttons
- **Long-press main button** (400ms) for instant Pause/Resume without opening menu
- **Duplicate prevention**: `processedInSession` Set tracks every clicked checkbox
- **Maximum performance mode**: Aggressive CSS hides header/nav/aside/footer, disables all animations/transitions, fullscreen container
- **Cross-page support**: Works on comments, likes, and story_replies via `[data-testid="bulk_action_checkbox"]` + SVG fallback
- Default mode changed to `oneshot` (per user workflow)
- Click delay reduced to 0ms for maximum speed
- Scroll step increased to 2000px, scroll delay reduced to 30ms
- Menu UI: Two action buttons ("Run One Shot", "Start Continuous"), dynamic Pause/Stop during run

---

## 2026-11-13 | 5.0.0 | Menu System & Performance Mode
- Professional menu with batch size input, mode toggle (OneShot/Continuous)
- Performance mode with DOM cleanup (hides non-essential elements)
- SPA navigation persistence (button survives route changes)
- Debug API exposed on `window.IG_BULK_SELECT`
- Rewrote scroll container detection for performance mode
- Optimized click sequence to single composed MouseEvent

---

## 2026-11-13 | 4.2.0 | Selector & Logic Fixes
- OneShot mode logic (was behaving like continuous)
- Scroll container detection after performance mode activation
- Mode toggle now respected in selection logic

---

## 2026-11-13 | 4.1.0 | Performance Mode & Menu
- Performance mode (DOM cleanup)
- Menu system with configuration

---

## 2026-11-13 | 4.0.0 | Initial Working Version
- Initial working version with data-testid selectors
- Navigation prevention on checkbox click
- Basic continuous selection loop

---

## 2026-11-12 | 1.0.0–3.0.0 | Early Iterations
- Class-based selectors (fragile)
- Basic button injection
- Debug logger development