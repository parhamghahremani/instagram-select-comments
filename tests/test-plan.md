# Test Plan — Instagram Bulk Select v5.1

## Test Environment
- **Desktop:** Firefox 120+ on Windows 11
- **Mobile:** Firefox Android (Playwright device emulation: Pixel 7, Galaxy S23)
- **Profile:** Dedicated `tampermonkey-test` profile with Tampermonkey extension

---

## Test Matrix

| ID | Scenario | Steps | Expected | Platform |
|----|----------|-------|----------|----------|
| **T01** | Button injection | 1. Open `https://www.instagram.com/your_activity/interactions/comments`<br>2. Wait for page load | Blue circular button appears at middle-right | Desktop, Mobile |
| **T02** | Menu open/close | 1. Click button<br>2. Click outside<br>3. Click button again | Menu opens on click, closes on outside click, reopens | Desktop, Mobile |
| **T03** | Batch size input | 1. Open menu<br>2. Change batch size to 50<br>3. Close & reopen menu | Value persists, updates button text | Desktop, Mobile |
| **T04** | Mode toggle | 1. Open menu<br>2. Click "One Shot" / "Continuous"<br>3. Verify description changes | Mode switches, description updates, button text updates | Desktop, Mobile |
| **T05** | OneShot — visible only | 1. Scroll to show ~30 items<br>2. Set batch=100<br>3. Click "Run One Shot (100)" | Exactly 30 selected (visible only), no scroll, instant | Desktop, Mobile |
| **T06** | OneShot — exact count | 1. Scroll to show 100+ items<br>2. Set batch=50<br>3. Click "Run One Shot (50)" | Exactly 50 selected, no scroll, instant | Desktop, Mobile |
| **T07** | Continuous — basic | 1. Set batch=20<br>2. Click "Start Continuous"<br>3. Wait for 2 batches<br>4. Click "Pause" | 40 selected, pauses on click | Desktop, Mobile |
| **T08** | Continuous — resume | 1. After T07, click "Resume" | Continues selecting from where paused | Desktop, Mobile |
| **T09** | Continuous — stop | 1. After T08, click "Stop" | Stops, performance mode disabled, DOM restored | Desktop, Mobile |
| **T10** | Long-press pause | 1. Start Continuous<br>2. Hold main button 400ms<br>3. Hold again 400ms | Toggles pause/resume without menu | Desktop, Mobile |
| **T11** | No navigation on click | 1. Click any checkbox manually<br>2. Run script OneShot<br>3. Verify no new tabs/pages | Zero navigation events | Desktop, Mobile |
| **T12** | No duplicates | 1. Run OneShot (select 50)<br>2. Run OneShot again<br>3. Verify no deselection | Previously selected stay selected, new ones added | Desktop, Mobile |
| **T13** | Reset button | 1. Select some items<br>2. Click "Reset"<br>3. Run OneShot again | Counter resets, all unselected available again | Desktop, Mobile |
| **T14** | SPA navigation persistence | 1. On comments page, open menu<br>2. Click "Likes" tab in Instagram UI<br>3. Verify button still works | Button persists, menu works on new page | Desktop, Mobile |
| **T15** | Cross-page: Likes | 1. Open `/your_activity/interactions/likes`<br>2. Run OneShot batch=20 | Works identically to comments | Desktop, Mobile |
| **T16** | Cross-page: Story Replies | 1. Open `/your_activity/interactions/story_replies`<br>2. Run OneShot batch=20 | Works identically to comments | Desktop, Mobile |
| **T17** | Performance mode DOM cleanup | 1. Start Continuous<br>2. Inspect DOM: header/nav/aside hidden?<br>3. Stop<br>4. Verify DOM restored | Chrome UI hidden during run, restored after | Desktop, Mobile |
| **T18** | Animation disabling | 1. Start Continuous<br>2. Check computed style on animated elements | `animation-duration: 0s`, `transition-duration: 0s` | Desktop, Mobile |
| **T19** | Scroll container detection | 1. On page with loaded items<br>2. Run Continuous until scroll needed<br>3. Verify scroll happens | Scroll container found, scrolls smoothly | Desktop, Mobile |
| **T20** | Mobile viewport | 1. Emulate 375×812<br>2. Run all T01-T19 | All features work at mobile viewport | Mobile |
| **T21** | Console errors | 1. Open DevTools Console<br>2. Run full workflow<br>3. Filter errors | Zero script-related errors | Desktop, Mobile |
| **T22** | Layout stability | 1. Visual check during/after run<br>2. No content shift, no broken UI | No layout shift, Instagram UI intact | Desktop, Mobile |

---

## Automation (Playwright)

```javascript
// tests/auto-test.js
const { test, expect } = require('@playwright/test');

test.describe('Instagram Bulk Select', () => {
    const scriptPath = '../src/instagram-select-comments.user.js';
    const pages = [
        'https://www.instagram.com/your_activity/interactions/comments',
        'https://www.instagram.com/your_activity/interactions/likes',
        'https://www.instagram.com/your_activity/interactions/story_replies',
    ];

    for (const url of pages) {
        test(`Button injects on ${url}`, async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle' });
            const btn = await page.waitForSelector('#ig-bulk-select-btn', { timeout: 10000 });
            expect(btn).toBeTruthy();
        });
    }
});
```

---

## Acceptance Criteria

**Release v5.1 passes if:**
- [ ] All T01-T22 pass on Desktop Firefox
- [ ] All T01-T22 pass on Mobile Firefox (emulated)
- [ ] Zero console errors in any test
- [ ] No visual regression (screenshots match baseline)
- [ ] `CHANGELOG.md`, `LEARNED.md` updated
- [ ] Version bumped in `src/` and `versions/`

---

## Bug Report Template

```markdown
## Bug: [Short title]

**Test ID:** T##
**Platform:** Desktop / Mobile
**Version:** 5.1.0
**URL:** https://www.instagram.com/...

**Steps to Reproduce:**
1.
2.
3.

**Expected:**
**Actual:**

**Console Output:**
```
[paste relevant logs]
```

**Screenshot:** [attach]
```