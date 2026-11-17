# Key Decisions — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Format**: Decision | Rationale | Alternatives Considered | Date

---

## 1. Single-File IIFE Userscript (No Build Required for Core)

**Decision**: Core script is a single self-contained IIFE in `src/instagram-select-comments.user.js`. Build step (`npm run build`) only creates versioned archives and updates update URLs.

**Rationale**:
- Tampermonkey userscripts are traditionally single files
- No transpilation needed — modern Firefox supports all used APIs
- Zero dependencies = maximum compatibility, minimum attack surface
- Easy to inspect, debug, and install manually
- Build is optional convenience, not requirement

**Alternatives**: Webpack/Rollup bundle, TypeScript compilation, modular source with build  
**Rejected Because**: Overkill for ~800 lines of vanilla JS; adds complexity without benefit

**Date**: 2026-11-12 (v1.0.0)

---

## 2. `@run-at document-start` with Early Button Injection

**Decision**: Inject button and set up SPA persistence at `document-start`, before `document.body` exists.

**Rationale**:
- Instagram uses client-side routing — button must exist immediately on navigation
- `setInterval` + `MutationObserver` catch DOM rebuilds from start
- Prevents flash of missing button during SPA transitions

**Alternatives**: `@run-at document-end` with DOMContentLoaded, `@run-at document-idle`  
**Rejected Because**: Too late — navigation already happened, button missing during transition

**Date**: 2026-11-12 (v1.0.0)

---

## 3. `data-testid` Selectors Over Utility Classes

**Decision**: Use semantic `data-testid` attributes as primary selectors, not Instagram's utility classes (`.x1iyjqo2`, etc.).

**Rationale**:
- Instagram randomizes utility classes per build (CSS-in-JS)
- `data-testid` is semantic, stable, accessibility-driven
- Used by Instagram's own test infrastructure — less likely to change

**Alternatives**: Class-based selectors, XPath, text-based selectors  
**Rejected Because**: Class selectors break every Instagram deploy; XPath brittle; text varies by language

**Date**: 2026-11-13 (v4.0.0)

---

## 4. Capture-Phase Navigation Blocking

**Decision**: Use capture-phase event listener on parent `<a>` links to prevent navigation on checkbox click.

**Rationale**:
- Checkboxes wrap in `<a>` links → click navigates to post
- React handles clicks in bubble phase — capture phase intercepts first
- `stopImmediatePropagation()` prevents other handlers
- Cleanup: remove listener after one block

**Alternatives**: `pointer-events: none` on link, `href="javascript:void(0)"`, overlay element  
**Rejected Because**: `pointer-events` breaks checkbox; modifying href breaks React; overlay complex

**Date**: 2026-11-13 (v4.0.0)

---

## 5. Composed MouseEvent for React Compatibility

**Decision**: Dispatch `MouseEvent` with `composed: true` + coordinates + `target.click()` fallback.

**Rationale**:
- `el.click()` alone doesn't trigger React synthetic event system
- `composed: true` penetrates Shadow DOM boundaries
- Coordinates ensure `clientX/clientY` available for React handlers
- Fallback `click()` catches edge cases

**Alternatives**: `mousedown`+`mouseup`+`click` sequence, `dispatchEvent` only, React Testing Library fireEvent  
**Rejected Because**: Sequence slower; dispatch only misses some handlers; RTL not available in userscript

**Date**: 2026-11-13 (v5.0.0)

---

## 6. Set for Duplicate Tracking (Not WeakSet)

**Decision**: Use `Set` with element references for `processedInSession`, not `WeakSet`.

**Rationale**:
- `WeakSet` only holds weak references — elements can be GC'd
- Instagram re-renders list items → same element reference lost
- `Set` keeps strong reference → survives re-renders if same element object
- Memory impact negligible (max ~few thousand checkboxes)

**Alternatives**: `WeakSet`, `Map` with IDs, attribute marking (`data-processed`)  
**Rejected Because**: `WeakSet` loses tracking on re-render; IDs not stable; attribute marking mutates DOM

**Date**: 2026-11-14 (v5.1.0)

---

## 7. OneShot = Zero Scroll (Not "Ensure Min Items")

**Decision**: OneShot mode selects ONLY currently visible items — no scrolling to load more.

**Rationale**:
- User expectation: "One Shot" = instant, visible only
- Previous versions secretly scrolled → violated principle
- Continuous mode exists for scroll-and-batch workflow
- ~300ms for 100 items vs ~3s with scroll

**Alternatives**: Scroll until batch size reached, hybrid approach  
**Rejected Because**: Defeats purpose of "One Shot"; user can use Continuous for that

**Date**: 2026-11-14 (v5.1.0)

---

## 8. Performance Mode Auto-Enable During Continuous

**Decision**: Performance mode (DOM cleanup, animation killing, fullscreen container) auto-enables on "Start Continuous", disables on "Stop".

**Rationale**:
- Maximum speed needed during continuous batch processing
- User doesn't need Instagram chrome UI during bulk select
- Animations cause layout thrashing during rapid clicks
- Auto-cleanup prevents forgotten state

**Alternatives**: Manual toggle, always on, never on  
**Rejected Because**: Manual = forgotten; always = breaks normal browsing; never = slow

**Date**: 2026-11-14 (v5.1.0)

---

## 9. Long-Press (400ms) for Pause/Resume

**Decision**: Hold main button 400ms toggles pause/resume during Continuous mode.

**Rationale**:
- Mobile-friendly: no menu navigation needed during operation
- 400ms distinguishes from tap (click)
- Works on both `touchstart/end` and `mousedown/up`
- Visual feedback (color change) confirms action

**Alternatives**: Double-tap, swipe gesture, menu-only, keyboard shortcut  
**Rejected Because**: Double-tap conflicts with click; swipe not discoverable; menu requires navigation; no keyboard on mobile

**Date**: 2026-11-14 (v5.1.0)

---

## 10. Debug API on `window.IG_BULK_SELECT`

**Decision**: Expose control methods on `window.IG_BULK_SELECT` for console access.

**Rationale**:
- Easy testing without modifying script
- No dev tools extension needed
- Works in Tampermonkey console
- Read-only state + control methods

**Alternatives**: `GM_registerMenuCommand`, separate debug script, URL params  
**Rejected Because**: GM APIs need `@grant`; separate script = sync issues; URL params limited

**Date**: 2026-11-13 (v5.0.0)

---

## 11. Versioned GitHub URLs for Updates

**Decision**: `@downloadURL` and `@updateURL` point to versioned files in `versions/` folder.

**Rationale**:
- Tampermonkey checks update URL periodically
- Versioned URL = users get specific version, not latest (which may break)
- Build script updates dist file with correct versioned URL
- Matches userscripts repo structure

**Alternatives**: Point to main branch raw, use GitHub releases, no update URL  
**Rejected Because**: Main branch = unstable; releases = extra step; no URL = no auto-update

**Date**: 2026-11-14 (v5.1.0)

---

## 12. Firefox Android as Primary Target

**Decision**: Optimize for Firefox Android (mobile) first, Desktop second.

**Rationale**:
- Mobile GPU constraints make performance mode critical
- Touch events, viewport, background tab limits are mobile-specific
- Desktop has more resources, fewer constraints
- User's primary use case is mobile

**Alternatives**: Desktop-first, equal priority  
**Rejected Because**: Mobile constraints are stricter — if it works on mobile, it works on desktop

**Date**: 2026-11-12 (v1.0.0)