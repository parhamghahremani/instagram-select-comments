# Project Status — Instagram Bulk Select

**Last Updated**: 2026-11-17  
**Current Stable Version**: 5.1.0  
**Git Branch**: master  
**GitHub Remote**: `parhamghahremani/instagram-select-comments` (Private)  
**Sync Status**: ✅ **Pushed** (commit 65866bc + tag v5.1.0)

---

## Current Work State

**Phase**: Project Setup Complete — Ready for Manual Testing  
**Active Task**: Awaiting user manual Firefox/Tampermonkey test of v5.1.0

### Completed Features (v5.1.0)

- ✅ True OneShot mode (visible only, zero scroll, ~300ms)
- ✅ Continuous mode with scroll + batch processing
- ✅ Pause/Resume during operation (menu stays open)
- ✅ Long-press main button (400ms) for instant pause/resume
- ✅ Duplicate prevention via `processedInSession` Set
- ✅ Maximum performance mode (DOM cleanup, animation killing, fullscreen container)
- ✅ Cross-page support: Comments, Likes, Story Replies
- ✅ SPA navigation persistence (button survives route changes)
- ✅ Navigation prevention on checkbox click (capture phase)
- ✅ React-compatible clicks (composed MouseEvent)
- ✅ Debug API exposed on `window.IG_BULK_SELECT`

### Build & Tooling

- ✅ ESLint + Prettier configured (0 errors, 3 warnings)
- ✅ Playwright tests configured (3 browser configs)
- ✅ Build script (`npm run build`) → `dist/`, `versions/`
- ✅ Version bump scripts (patch/minor/major)

### Documentation Status

| Document | Status |
|----------|--------|
| `README.md` | ✅ Complete for v5.1.0 |
| `CHANGELOG.md` | ✅ Complete through v5.1.0 |
| `LEARNED.md` | ✅ Complete (selectors, gotchas, snippets) |
| `CLAUDE.md` | ✅ Complete |
| `PROJECT_STATUS.md` | ✅ Complete |
| `docs/SPECIFICATION.md` | ✅ Complete |
| `docs/ARCHITECTURE.md` | ✅ Complete |
| `docs/DEVELOPMENT_GUIDE.md` | ✅ Complete |
| `docs/CONFIGURATION_AND_PERMISSIONS.md` | ✅ Complete |
| `docs/COMPATIBILITY.md` | ✅ Complete |
| `docs/MANUAL_TEST_PLAN.md` | ✅ Complete |
| `docs/DEVELOPMENT_LOG.md` | ✅ Complete |
| `docs/DECISIONS.md` | ✅ Complete |
| `docs/KNOWN_ISSUES.md` | ✅ Complete |
| `docs/REFERENCES.md` | ✅ Complete |

---

## Git Status

```
On branch master
nothing to commit, working tree clean
```

**Latest Commit**: 65866bc (Initial commit: v5.1.0 complete project setup)  
**Tag**: v5.1.0 (pushed)

---

## GitHub Remote Status

- **Repository**: `https://github.com/parhamghahremani/instagram-select-comments`
- **Visibility**: Private ✅
- **Pushed**: Yes ✅ (commit + tag)
- **Tags**: v5.1.0 ✅

---

## Backup Status

**Backup Root**: `D:\Desktop\project\scripts\instagram-select-comments\backups\`

| Backup Type | Status | Latest |
|-------------|--------|--------|
| `imported-original/` | ⏳ Empty (no imports) | — |
| `pre-change/` | ⏳ Empty (no changes yet) | — |
| `full-snapshots/` | ✅ Complete | `instagram-select-comments-20261117-initial-v5.1.0.zip` (SHA256: 2FB237F6C6EE8AE156E939C3CC82C01E5D3EC29A65A9918087F1B823BA3E3251) |
| `releases/` | ⏳ Empty | — |
| `git-bundles/` | ✅ Complete | `instagram-select-comments-v5.1.0.bundle` (SHA256: A59AC3B763CF2E59B532F81AD4C07B85B2A5345EB37520358736036B15C1AF91) |
| `checksums/` | ✅ Recorded in manifest | — |
| `BACKUP_MANIFEST.md` | ✅ Complete | 2 entries (verified) |

---

## Compatibility (Verified / Unverified)

| Environment | Status | Notes |
|-------------|--------|-------|
| Firefox Desktop (Windows 11) | ❌ Unverified | Playwright tests configured (partial pass on comments page) |
| Firefox Android | ❌ Unverified | **Primary target**, needs manual test |
| Tampermonkey (latest) | ❌ Unverified | Assumed compatible |
| `@grant none` / CSP | ✅ Designed for | No GM APIs used |
| `@run-at document-start` | ✅ Implemented | Early injection for SPA |

---

## Known Issues / Limitations

| Issue | Severity | Status |
|-------|----------|--------|
| Instagram may change `data-testid` selectors | Medium | Monitoring |
| Performance mode may hide legitimate UI | Low | Acceptable trade-off |
| Long-press detection edge cases | Low | Monitor feedback |
| `processedInSession` memory growth | Info | Known, negligible |
| Story Replies structure may differ | Low | Needs real testing |
| Background tab kill on Android | Medium | Platform limitation |
| No automated visual regression testing | Info | Manual testing only |

---

## Next Steps

1. **Manual Firefox/Tampermonkey test** of v5.1.0 (Desktop + Android)
2. **Test all scenarios** from `tests/test-plan.md` (T01-T22)
3. **Report any issues** for next version

---

## Version Alignment Check

| Location | Version | Aligned? |
|----------|---------|----------|
| `src/instagram-select-comments.user.js` (`@version`) | 5.1.0 | ✅ |
| `package.json` (`version`) | 5.1.0 | ✅ |
| `CHANGELOG.md` (latest entry) | 5.1.0 | ✅ |
| Git tag | v5.1.0 | ✅ |
| GitHub Release | v5.1.0 (tag) | ✅ |