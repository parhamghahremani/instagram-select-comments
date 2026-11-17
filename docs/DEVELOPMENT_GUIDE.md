# Development Guide — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0

---

## Project Structure

```
instagram-select-comments/
├── src/
│   └── instagram-select-comments.user.js    # Source userscript (EDIT THIS)
├── dist/
│   └── instagram-select-comments.user.js    # Build output (latest, auto-generated)
├── versions/
│   └── instagram-select-comments-v*.user.js # Versioned releases (auto-generated)
├── tests/
│   ├── test-plan.md                         # Manual + automated test cases
│   └── screenshots/
├── docs/                                    # Documentation
├── backups/                                 # Local backups (never committed)
├── global/                                  # Cross-script knowledge (shared)
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

---

## Editing the Source

**Only edit**: `src/instagram-select-comments.user.js`

**Never edit directly**:
- `dist/instagram-select-comments.user.js` — build output
- `versions/instagram-select-comments-v*.user.js` — versioned archives
- Root `instagram-select-comments.user.js` — synced from src via build

**Sync root file**: After editing `src/`, run `npm run build` to update root and `versions/`

---

## Development Workflow

### 1. Make Changes
Edit `src/instagram-select-comments.user.js`

### 2. Lint & Format
```bash
npm run lint      # Check code style
npm run format    # Auto-format with Prettier
```

### 3. Test
```bash
npm test              # Run Playwright tests
npm run test:headed   # Run with browser visible
npm run test:debug    # Debug mode
```

### 4. Build Versioned Release
```bash
npm run build
```
Creates:
- `versions/instagram-select-comments-v{version}.user.js` — versioned archive
- `dist/instagram-select-comments.user.js` — latest with updated URLs
- Root `instagram-select-comments.user.js` — synced copy

### 5. Version Bump
```bash
npm run version:patch  # 5.1.0 → 5.1.1
npm run version:minor  # 5.1.0 → 5.2.0
npm run version:major  # 5.1.0 → 6.0.0
```
**Automatically**: Updates `package.json` + `src/@version` + creates git tag

### 6. Documentation Updates
After changes, update:
- `CHANGELOG.md` — new version entry
- `LEARNED.md` — new selectors, gotchas, snippets
- `docs/` — if architecture/config changed
- `README.md` — if user-facing features changed

---

## Build Process

`build.js` reads `@version` from source, creates:
- `versions/instagram-select-comments-v{version}.user.js` — versioned archive
- `dist/instagram-select-comments.user.js` — latest with updated `@downloadURL`/`@updateURL` pointing to versioned file

**Never edit `dist/` or `versions/` directly** — they are build outputs.

---

## Testing

### Playwright Tests
- Location: `tests/` (auto-test.js if created)
- Run: `npm test`
- Browsers: Desktop Firefox, Mobile Firefox (Pixel 7), Mobile Firefox (Galaxy S23)
- Tests inject script via `page.addScriptTag()` and verify button injection

### Manual Testing (Required)
Follow `tests/test-plan.md`:
- T01-T22 on Desktop Firefox
- T01-T22 on Mobile Firefox (emulated)
- Zero console errors
- No visual regression

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

## Release Checklist

Before releasing new version:
- [ ] All Playwright tests pass (`npm test`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Manual test plan passes (Desktop + Mobile)
- [ ] `CHANGELOG.md` updated
- [ ] `LEARNED.md` updated
- [ ] Version bumped: `npm run version:patch|minor|major`
- [ ] Build runs: `npm run build`
- [ ] Root file synced
- [ ] Commit + tag pushed to GitHub (after approval)
- [ ] Backup created (full snapshot + git bundle)