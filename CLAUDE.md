# Instagram Bulk Select — Project Instructions

**Project**: `instagram-select-comments`  
**Canonical Name**: `instagram-select-comments`  
**Userscript File**: `src/instagram-select-comments.user.js` (built to `dist/` and `versions/`)  
**GitHub Repo**: `parhamghahremani/instagram-select-comments` (Private)  
**Current Version**: 5.1.0  
**Target**: Firefox Desktop + Firefox Android  
**Site**: `https://www.instagram.com/your_activity/interactions/*`

---

## Quick Reference

| Aspect | Value |
|--------|-------|
| `@run-at` | `document-start` |
| `@grant` | `none` |
| `@match` | 3 Instagram Your Activity URLs |
| Build | `npm run build` → `dist/`, `versions/` |
| Lint | `npm run lint` |
| Test | `npm test` (Playwright) |
| Version bump | `npm run version:patch\|minor\|major` |

---

## Architecture Summary

Single-file userscript (IIFE) with these modules:

1. **Configuration** (constants at top) — 7 constants + COLORS object
2. **Button Injection & SPA Persistence** — `createButton()`, `setInterval` + `MutationObserver`
3. **Menu System** — Dynamic UI, state-dependent content
4. **Checkbox Detection** — `data-testid` primary, ARIA + SVG fallback
5. **Click Engine** — `fastClick()` with composed MouseEvent + capture-phase navigation block
6. **Scroll Engine** — `findScrollContainer()`, `scrollDown()`, performance mode handling
7. **OneShot Mode** — `runOneShot()` — zero scroll, instant visible-only selection
8. **Continuous Mode** — `startContinuous()` — scroll + batch loop with pause/resume
9. **Performance Mode** — `enablePerformanceMode()` / `disablePerformanceMode()` — DOM cleanup
10. **Long-Press Detection** — 400ms on main button for pause/resume
11. **Debug API** — `window.IG_BULK_SELECT` exposed for console access
12. **Cleanup** — `stop()` — restores DOM, clears timers, disconnects observers

---

## Key Design Decisions (from DECISIONS.md)

- **Single IIFE, no build required**: Tampermonkey native, zero deps
- **`@run-at document-start`**: Early injection for SPA persistence
- **`data-testid` selectors**: Stable semantic attributes (not utility classes)
- **Capture-phase navigation blocking**: Only way to prevent React link navigation
- **Composed MouseEvent**: Works through Shadow DOM, triggers React handlers
- **Set for duplicate tracking**: O(1) lookup, survives re-renders by reference
- **OneShot = zero scroll**: Instant visible-only, Continuous for scroll-and-batch
- **Performance mode auto-enable**: Maximum speed during continuous, restored after
- **Long-press (400ms)**: Mobile-friendly pause/resume without menu
- **Debug API on `window`**: Easy console testing
- **Versioned GitHub URLs**: Tampermonkey update checks get specific version
- **Firefox Android primary**: Mobile constraints stricter — if works mobile, works desktop

---

## Configuration (Constants)

| Constant | Default | Description |
|----------|---------|-------------|
| `DEFAULT_BATCH_SIZE` | `100` | Default batch size |
| `CLICK_DELAY_MS` | `0` | Delay between clicks (0 = max speed) |
| `SCROLL_DELAY_MS` | `30` | Wait after scroll (ms) |
| `SCROLL_STEP` | `2000` | Pixels per scroll step |
| `MAX_SCROLL_ATTEMPTS` | `15` | Max scrolls before giving up |
| `BUTTON_SIZE` | `48` | Main button diameter (px) |
| `MENU_WIDTH` | `280` | Menu width (px) |

---

## Development Commands

```bash
# From project root: D:\Desktop\project\scripts\instagram-select-comments

# Install deps
npm install

# Lint source
npm run lint

# Format source
npm run format

# Run Playwright tests
npm test

# Build versioned release
npm run build

# Version bumps (updates package.json + src/@version + git tag)
npm run version:patch  # 5.1.0 → 5.1.1
npm run version:minor  # 5.1.0 → 5.2.0
npm run version:major  # 5.1.0 → 6.0.0
```

---

## Build Process

`build.js` reads `@version` from source, creates:
- `versions/instagram-select-comments-v{version}.user.js` — versioned archive
- `dist/instagram-select-comments.user.js` — latest with updated `@downloadURL`/`@updateURL` pointing to versioned file

**Never edit `dist/` or `versions/` directly** — they are build outputs.
**Root `instagram-select-comments.user.js`** is synced from `src/` via build.

---

## Testing

- **Playwright tests** in `tests/` — run with `npm test`
- Tests inject script via `page.addScriptTag()` and verify button injection
- **Final verification always manual** in real Firefox + Tampermonkey (Desktop + Android)
- Follow `tests/test-plan.md` (22 test cases TC-01 through TC-22)

---

## Git Workflow

```bash
# Always use explicit path
cd "D:\Desktop\project\scripts\instagram-select-comments"

# Check status
git status

# Stage changes
git add .

# Commit with conventional message
git commit -m "type: description"

# Version bump (includes commit + tag)
npm run version:patch  # or minor/major

# Push (ONLY after manual review + explicit approval)
git push origin master --tags
```

---

## Backup Protocol

Pre-change snapshot before each logical batch:
```bash
# Create timestamped snapshot (exclude .git/, backups/, node_modules/, dist/, versions/)
# Verify with Get-FileHash -Algorithm SHA256
# Record in backups/BACKUP_MANIFEST.md
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | User-facing: install, usage, config, version |
| `CHANGELOG.md` | Versioned history |
| `LEARNED.md` | Selectors, gotchas, snippets, metrics |
| `PROJECT_STATUS.md` | Current state, version, backups, next steps |
| `docs/SPECIFICATION.md` | Requirements, acceptance criteria |
| `docs/ARCHITECTURE.md` | Module breakdown, data flow |
| `docs/DEVELOPMENT_GUIDE.md` | Editing, build, testing workflow |
| `docs/CONFIGURATION_AND_PERMISSIONS.md` | Metadata, grants, CONFIG |
| `docs/COMPATIBILITY.md` | Verified browsers, unverified areas |
| `docs/MANUAL_TEST_PLAN.md` | User test checklist (TC-01 to TC-22) |
| `docs/DEVELOPMENT_LOG.md` | Milestones, diagnosed issues |
| `docs/DECISIONS.md` | Key technical decisions + rationale |
| `docs/KNOWN_ISSUES.md` | Confirmed defects, workarounds |
| `docs/REFERENCES.md` | Official docs, research sources |

---

## Constraints & Rules

1. **Never modify sibling projects** — Only touch `instagram-select-comments/`
2. **Source of truth** = `src/instagram-select-comments.user.js`
3. **Version consistency**: `@version` in source = `package.json` = Git tag = CHANGELOG
4. **Private GitHub repo** — Never make public without explicit permission
5. **Sync only after approval** — Push after manual test + user go-ahead
6. **Persian communication** — All user messages in Persian; code/docs in English
7. **No automated test suites** — Playwright for research only; user tests manually

---

## Current Status (2026-11-17)

- **Version**: 5.1.0 (stable)
- **Git**: Initialized, ready for commit
- **GitHub**: Private repo to be created at `parhamghahremani/instagram-select-comments`
- **Documentation**: Complete (15 files including docs/)
- **Backups**: Directory structure created, manifest ready
- **Next**: Initial commit, npm install, test, build, manual test, push