# Compatibility — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0

---

## Verified Environments

| Environment | Version | Status | Test Date | Notes |
|-------------|---------|--------|-----------|-------|
| Firefox Desktop | Latest (Win 11) | ❌ Unverified | — | Playwright tests only |
| Firefox Android | Latest | ❌ Unverified | — | Primary target, needs manual test |
| Tampermonkey | Latest | ❌ Unverified | — | Assumed compatible |

---

## Target Browsers (Design Targets)

| Browser | Platform | Priority | Notes |
|---------|----------|----------|-------|
| Firefox Desktop | Windows 11 | High | Development environment |
| Firefox for Android | Android 13+ | **Critical** | Primary target — mobile GPU constraints |

---

## API Compatibility Matrix

| API / Feature | Firefox Desktop | Firefox Android | Notes |
|---------------|-----------------|-----------------|-------|
| `document-start` `@run-at` | ✅ | ✅ | Tampermonkey supported |
| `createElement('style')` | ✅ | ✅ | Standard DOM |
| `MutationObserver` | ✅ | ✅ | Standard |
| `setInterval` / `setTimeout` | ✅ | ✅ | Standard |
| `requestAnimationFrame` | ✅ | ✅ | Standard |
| `MouseEvent` with `composed: true` | ✅ | ✅ | Standard (Shadow DOM) |
| `addEventListener` (capture phase) | ✅ | ✅ | Standard |
| `history.pushState` override | ✅ | ✅ | Standard |
| `localStorage` | ✅ | ✅ | Standard |
| `Element.getBoundingClientRect()` | ✅ | ✅ | Standard |
| `Element.scrollBy()` | ✅ | ✅ | Standard |
| Touch events (`touchstart`, `touchend`) | ✅ | ✅ | Standard |
| Passive event listeners | ✅ | ✅ | Standard |

---

## CSS Feature Support

| Feature | Firefox Desktop | Firefox Android | Notes |
|---------|-----------------|-----------------|-------|
| `position: fixed` | ✅ | ✅ | Used for button + performance mode |
| `z-index` layering | ✅ | ✅ | 2147483647 for button |
| `display: none !important` | ✅ | ✅ | Performance mode hiding |
| `overflow: hidden` on html/body | ✅ | ✅ | Performance mode |
| `animation-duration: 0s` | ✅ | ✅ | Animation killing |
| `transition-duration: 0s` | ✅ | ✅ | Transition killing |

---

## Instagram Page Compatibility

| Page | URL Pattern | Status | Selectors |
|------|-------------|--------|-----------|
| Comments | `/your_activity/interactions/comments*` | ✅ Designed for | `[data-testid="bulk_action_checkbox"]`, `[data-testid="comments_container_non_empty_state"]` |
| Likes | `/your_activity/interactions/likes*` | ✅ Designed for | `[data-testid="bulk_action_checkbox"]`, `[data-testid="likes_container_non_empty_state"]` |
| Story Replies | `/your_activity/interactions/story_replies*` | ✅ Designed for | `[data-testid="bulk_action_checkbox"]`, `[data-testid="story_replies_container_non_empty_state"]` |
| Old Comments UI | (pre-wbloks) | ⚠️ Fallback only | `svg.x1lliihq.x1n2onr6.x1roi4f4[aria-label=""]` |

---

## Known Instagram Selector Stability

| Selector Type | Stability | Notes |
|---------------|-----------|-------|
| `data-testid` | **High** | Semantic, stable across builds |
| ARIA attributes (`role`, `aria-label`) | **High** | Accessibility-driven, stable |
| Structural (`parent > child`) | **Medium** | DOM hierarchy stable |
| Utility classes (`.x1iyjqo2`) | **Low** | Instagram randomizes per build — AVOID |

---

## Mobile-Specific Considerations

| Aspect | Implementation |
|--------|----------------|
| Viewport | Tested at 375×812 (Pixel 7), 412×915 (Galaxy S23) |
| Touch Events | `touchstart`/`touchend` for long-press detection |
| Button Size | 48px (touch-friendly) |
| Menu Width | 280px (fits mobile viewports) |
| Performance Mode | Critical for mobile — kills animations, fullscreen container |
| Background Tab Kill | ~5 min limit — fast re-init via setInterval |

---

## Tampermonkey Compatibility

| Feature | Support |
|---------|---------|
| `@run-at document-start` | ✅ 4.0+ |
| `@grant none` | ✅ 3.0+ |
| `@downloadURL`/`@updateURL` | ✅ 4.0+ |
| `@icon` (external URL) | ✅ |
| `GM_*` APIs | Not used |
| Settings/UI | Not used |

---

## Playwright Test Matrix

| Browser Config | Device | Status |
|----------------|--------|--------|
| Desktop Firefox | Desktop | Configured |
| Mobile Firefox | Pixel 7 | Configured |
| Mobile Firefox | Galaxy S23 | Configured |

---

## Limitations & Known Gaps

1. **No automated visual regression** — manual screenshot comparison only
2. **Instagram UI changes** — `data-testid` selectors may break if Instagram rewrites pages
3. **No GreaseMonkey testing** — only Tampermonkey targeted
4. **No Chrome/Edge testing** — Firefox focus (primary target)
5. **Android real device testing needed** — emulation only so far