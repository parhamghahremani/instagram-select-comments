# References — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0

---

## Official Documentation

### Tampermonkey
- **Documentation**: https://www.tampermonkey.net/documentation.php
- **Metadata Block**: https://www.tampermonkey.net/documentation.php#_metadata_block
- **API Reference**: https://www.tampermonkey.net/documentation.php#_api
- **Compatibility**: https://www.tampermonkey.net/documentation.php#_browser_compatibility

### Mozilla Developer Network (MDN)
- **MutationObserver**: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
- **MouseEvent**: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
- **EventTarget.addEventListener()**: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
- **capture phase**: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_capturing_and_bubbling
- **composed events**: https://developer.mozilla.org/en-US/docs/Web/API/Event/composed
- **requestAnimationFrame**: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- **Element.scrollBy()**: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
- **Element.getBoundingClientRect()**: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
- **history.pushState()**: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
- **localStorage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Touch Events**: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

### Web Standards
- **HTML Living Standard**: https://html.spec.whatwg.org/
- **DOM Living Standard**: https://dom.spec.whatwg.org/
- **CSSOM View Module**: https://drafts.csswg.org/cssom-view/
- **Pointer Events**: https://www.w3.org/TR/pointerevents/
- **Touch Events**: https://www.w3.org/TR/touch-events/

---

## Instagram-Specific

### Instagram Web Architecture
- **React-based SPA** — client-side routing, virtual DOM
- **wbloks UI framework** — `data-testid` attributes for testing
- **CSS-in-JS** — utility classes randomized per build (`.x1iyjqo2`, etc.)
- **GraphQL API** — internal, not publicly documented

### Selector Research
- **Instagram data-testid patterns**: Found via DevTools inspection
- **Common containers**:
  - `comments_container_non_empty_state`
  - `likes_container_non_empty_state`
  - `story_replies_container_non_empty_state`
  - `interactions_container_non_empty_state`
- **Checkbox**: `bulk_action_checkbox` (all 3 pages)
- **Toggle button**: `[role="button"][aria-label="Toggle checkbox"]`

---

## Performance Optimization References

### Scroll Performance
- **Scrolling Performance**: https://developer.chrome.com/docs/devtools/rendering-tools/scrolling-performance
- **CSS Triggers**: https://csstriggers.com/
- **will-change**: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
- **content-visibility**: https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility

### Animation/Transition Control
- **prefers-reduced-motion**: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- **Disabling Animations**: https://css-tricks.com/control-css-animations-transitions-javascript/

### React Event System
- **React Synthetic Events**: https://react.dev/learn/responding-to-events
- **Event Delegation in React**: https://react.dev/learn/responding-to-events#event-propagation
- **composed: true for Shadow DOM**: https://developer.mozilla.org/en-US/docs/Web/API/Event/composed

---

## Firefox Android Specific

### Firefox for Android
- **Firefox Android Add-ons**: https://addons.mozilla.org/android/
- **Tampermonkey for Firefox Android**: https://addons.mozilla.org/android/addon/tampermonkey/
- **Firefox Remote Debugging**: https://developer.mozilla.org/en-US/docs/Tools/Remote_Debugging
- **Firefox Android Performance**: https://developer.mozilla.org/en-US/docs/Web/Performance/Firefox_Android

### Mobile Testing
- **Playwright Mobile Emulation**: https://playwright.dev/docs/emulation
- **Device Descriptors**: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json

---

## Prior Art & Similar Projects

### Instagram Automation
- **Instagram Scraper Patterns**: Various GitHub repos (educational only)
- **Userscript Patterns**: GreasyFork, OpenUserJS repositories

### Bulk Selection Patterns
- **Gmail Bulk Select**: Native implementation reference
- **GitHub Issue Bulk Actions**: Checkbox selection patterns
- **Generic List Selection**: Virtualized list handling

---

## Debugging Tools

### Firefox DevTools Snippets
```javascript
// Find all elements with data-testid
$$('[data-testid]').map(el => el.getAttribute('data-testid'))

// Find scrollable containers
$$('div').filter(el => el.scrollHeight > el.clientHeight + 50)

// Monitor all clicks (capture phase)
document.addEventListener('click', e => console.log('CLICK', e.target), true);

// Watch MutationObserver
const obs = new MutationObserver(m => console.log(m));
obs.observe(document.body, { childList: true, subtree: true, attributes: true });

// Check computed styles for animation/transition
$$('*').filter(el => {
  const cs = getComputedStyle(el);
  return cs.animationDuration !== '0s' || cs.transitionDuration !== '0s';
})
```

---

## Versioning & Release

### Semantic Versioning
- **Spec**: https://semver.org/
- **Conventional Commits**: https://www.conventionalcommits.org/

### GitHub Releases
- **Creating Releases**: https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
- **Raw File URLs**: `https://github.com/{owner}/{repo}/raw/{branch}/{path}`

---

## License

- **MIT License**: https://opensource.org/licenses/MIT
- **Choose a License**: https://choosealicense.com/licenses/mit/