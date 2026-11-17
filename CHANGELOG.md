# Changelog

All notable changes to Instagram Bulk Select are documented here.

## [5.1.0] - 2026-11-14

### Added
- **True OneShot mode**: Selects only currently visible items instantly — zero scrolling
- **Pause/Resume during operation**: Menu stays open with dedicated Pause/Resume/Stop buttons
- **Long-press main button** (400ms) for instant Pause/Resume without opening menu
- **Duplicate prevention**: `processedInSession` Set tracks every clicked checkbox
- **Maximum performance mode**: Aggressive CSS hides header/nav/aside/footer, disables all animations/transitions, fullscreen container
- **Cross-page support**: Works on comments, likes, and story_replies via `[data-testid="bulk_action_checkbox"]` + SVG fallback

### Changed
- Default mode changed to `oneshot` (per user workflow)
- Click delay reduced to 0ms for maximum speed
- Scroll step increased to 2000px, scroll delay reduced to 30ms
- Menu UI: Two action buttons ("Run One Shot", "Start Continuous"), dynamic Pause/Stop during run

### Fixed
- OneShot now truly instant (was scrolling before)
- Menu was unusable during operation (now stays open with controls)
- Duplicate/partial selects eliminated via tracking Set
- Site lag eliminated via DOM cleanup + animation disabling
- All three activity pages now supported uniformly

## [5.0.0] - 2026-11-13

### Added
- Professional menu with batch size input, mode toggle (OneShot/Continuous)
- Performance mode with DOM cleanup (hides non-essential elements)
- SPA navigation persistence (button survives route changes)
- Debug API exposed on `window.IG_BULK_SELECT`

### Changed
- Rewrote scroll container detection for performance mode
- Optimized click sequence to single composed MouseEvent

## [4.2.0] - 2026-11-13

### Fixed
- OneShot mode logic (was behaving like continuous)
- Scroll container detection after performance mode activation
- Mode toggle now respected in selection logic

## [4.1.0] - 2026-11-13

### Added
- Performance mode (DOM cleanup)
- Menu system with configuration

## [4.0.0] - 2026-11-13

### Added
- Initial working version with data-testid selectors
- Navigation prevention on checkbox click
- Basic continuous selection loop

## [1.0.0 - 3.0.0] - 2026-11-12

### Early iterations
- Class-based selectors (fragile)
- Basic button injection
- Debug logger development