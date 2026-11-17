# Cross-Script Knowledge Base — Global Notes

> Maintained by the Tampermonkey Script Engineer. Updated after every script completion.

---

## Firefox Android Quirks (Critical)

| Quirk | Impact | Workaround |
|-------|--------|------------|
| **No `GM_download`** | Cannot save files programmatically | Use `<a href="data:..." download="...">` click |
| **`GM_xmlhttpRequest` cross-origin blocked** | API calls fail on some domains | Proxy via same-origin or avoid cross-origin |
| **Background tabs killed ~5 min** | Script state lost on tab resume | Fast re-init (<100ms), persist state in `localStorage` |
| **Tampermonkey menu: 3-dot → Tampermonkey** | Users can't find scripts easily | Document in README |
| **Touch + click both fire** | Double-trigger on tap | Use `{passive: true}` + guard flags |
| **Viewport meta ignored in userscript CSS** | Fixed positioning breaks | Test at 375×812, 412×915, 360×780 |
| **`localStorage` persists across restarts** | Reliable state storage | Use for session recovery |

---

## Universal SPA Patterns

### Instagram-style Client-Side Routing
```javascript
// Detect navigation
let lastUrl = location.href;
const onNavigate = () => { /* re-init UI */ };

const observer = new MutationObserver(onNavigate);
observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener('popstate', onNavigate);
const origPush = history.pushState;
history.pushState = function(...a) { origPush.apply(this, a); onNavigate(); };
const origReplace = history.replaceState;
history.replaceState = function(...a) { origReplace.apply(this, a); onNavigate(); };

// Persistence interval (fallback)
setInterval(() => { if (!document.getElementById('my-btn')) createBtn(); }, 1000);
```

### MutationObserver Best Practices
```javascript
// Observe efficiently
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,        // Only if needed
    characterData: false      // Only if needed
});

// Disconnect on cleanup
function cleanup() { observer.disconnect(); }
```

---

## Performance Optimization Patterns

### Maximum Speed DOM Cleanup
```javascript
function enableMaxPerformance(keepContainer) {
    const style = document.createElement('style');
    style.id = 'perf-style';
    style.textContent = `
        /* Hide Chrome UI */
        header, nav, aside, footer,
        [role="banner"], [role="navigation"], [role="complementary"],
        div[style*="position: fixed"]:not(#our-ui),
        div[style*="position: sticky"] { display: none !important; }

        /* Keep only our container */
        body > *:not(#our-ui):not(${keepSelector}) { display: none !important; }

        /* Kill all animations */
        *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
        }
        html, body { overflow: hidden !important; height: 100% !important; margin: 0 !important; padding: 0 !important; }
    `;
    document.head.appendChild(style);

    // Fullscreen the container
    Object.assign(keepContainer.style, {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 999999, overflow: 'auto', background: '#000', margin: 0, padding: 0
    });

    return () => { style.remove(); Object.keys(keepContainer.style).forEach(k => keepContainer.style[k] = ''); };
}
```

### Fast Click (React-compatible)
```javascript
function fastClick(el) {
    const rect = el.getBoundingClientRect();
    const evt = new MouseEvent('click', {
        bubbles: true, cancelable: true, view: window,
        clientX: rect.left + rect.width/2, clientY: rect.top + rect.height/2,
        composed: true  // Critical for Shadow DOM
    });
    el.dispatchEvent(evt);
    el.click(); // Fallback
}
```

### Navigation Blocking (Capture Phase)
```javascript
function blockNavigation(target) {
    const link = target.closest('a[href]');
    if (!link) return;
    const blocker = e => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        link.removeEventListener('click', blocker, true);
    };
    link.addEventListener('click', blocker, true); // CAPTURE PHASE!
}
```

---

## Selector Strategy (Priority Order)

1. **Semantic attributes** — `data-testid`, `aria-label`, `role` (stable)
2. **ARIA patterns** — `[role="button"][aria-label="..."]`
3. **Structural** — `parent > child > grandchild` (stable hierarchy)
4. **Fallback text** — `button:has-text("Accept")` via iteration
5. **Utility classes LAST** — `.x1iyjqo2` (Instagram randomizes per build)

---

## Debugging Checklist

Before delivery, verify:
- [ ] `@run-at document-start` (not `document-end`)
- [ ] No `console.error` in Firefox DevTools
- [ ] No layout shift (visual regression)
- [ ] Mobile viewport tested (375×812 minimum)
- [ ] Touch events handled (`touchstart`/`touchend`)
- [ ] SPA navigation survives (button persists)
- [ ] Cleanup on stop (DOM restored, listeners removed)
- [ ] Version bumped + `versions/` + `CHANGELOG.md` + `LEARNED.md`
- [ ] Raw GitHub URL works for Android import

---

## Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| `el.click()` alone on React | Dispatch `MouseEvent` with `composed: true` + coordinates |
| `bubbles: false` on events | Use `bubbles: true` + capture-phase blocker on parent |
| Class-based selectors on Instagram | Use `data-testid` or ARIA — utility classes change per build |
| Assuming scroll container is `window` | Detect scrollable ancestor dynamically |
| Menu auto-close during operation | Guard outside-click with `!isRunning` |
| Forgetting to clear intervals on stop | Store timer IDs, clear in `cleanup()` |
| Hardcoding pixel values | Use config constants at top of script |
| No Android testing | Emulate in Playwright: `device: 'Pixel 7'` |

---

## Versioning Convention

```
MAJOR.MINOR.PATCH
MAJOR: Breaking API change / rewrite
MINOR: New feature / significant improvement
PATCH: Bug fix / small tweak
```

Always copy to `versions/vX.Y.Z.user.js` on release.

---

## Useful Firefox DevTools Snippets

```javascript
// Find all elements with data-testid
$$('[data-testid]').map(el => el.getAttribute('data-testid'))

// Find scrollable containers
$$('div').filter(el => el.scrollHeight > el.clientHeight + 50)

// Monitor all clicks
document.addEventListener('click', e => console.log('CLICK', e.target), true);

// Watch MutationObserver
const obs = new MutationObserver(m => console.log(m));
obs.observe(document.body, { childList: true, subtree: true, attributes: true });
```

---

## Cross-Script Reusable Patterns

See `SELECTORS.md` for selector library, `SNIPPETS.md` for battle-tested code blocks.