# Manual Test Plan — Instagram Bulk Select

**Project**: `instagram-select-comments`  
**Version**: 5.1.0  
**Tester**: [User Name]  
**Date**: [Test Date]  
**Firefox Version**: [Version]  
**Tampermonkey Version**: [Version]  
**Platform**: [Windows 11 Desktop / Android]

---

## Pre-Test Setup

1. Install Tampermonkey in Firefox
2. Install userscript from `dist/instagram-select-comments.user.js` or `src/instagram-select-comments.user.js`
3. Verify script appears in Tampermonkey dashboard (enabled)
4. Open DevTools Console (F12) for monitoring
5. Log into Instagram

---

## Test Cases

### TC-01: Button Injection & Basic Load
**Target**: `https://www.instagram.com/your_activity/interactions/comments`
**Steps**:
1. Navigate to comments page
2. Wait for page load
5. Check DevTools Console for errors
6. Verify button exists: `document.getElementById('ig-bulk-select-btn')`

**Expected**:
- No script-related console errors
- Blue circular button at middle-right
- Button visible and clickable

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-02: Menu Open/Close
**Target**: Comments page (button visible)
**Steps**:
1. Click button → menu opens
2. Click outside menu → menu closes
3. Click button again → menu reopens
4. Click button while menu open → menu closes

**Expected**:
- Menu opens on click
- Menu closes on outside click
- Menu toggles on button click
- No console errors

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-03: Batch Size Input
**Target**: Menu open
**Steps**:
1. Open menu
2. Change batch size to 50
3. Close menu
4. Reopen menu

**Expected**:
- Value accepts numeric input
- Value persists after close/reopen
- Button text updates: "Run One Shot (50)"

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-04: Mode Toggle
**Target**: Menu open
**Steps**:
1. Open menu
2. Click "One Shot" → verify description
3. Click "Continuous" → verify description
4. Verify button text updates

**Expected**:
- Mode switches between OneShot/Continuous
- Description updates accordingly
- Button text: "Run One Shot (N)" vs "Start Continuous"

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-05: OneShot — Visible Only (Zero Scroll)
**Target**: Comments page with ~30 visible items
**Steps**:
1. Scroll to show ~30 items (not 100+)
2. Set batch=100
3. Click "Run One Shot (100)"
4. Count selected items

**Expected**:
- Exactly 30 selected (visible only)
- **NO scrolling occurs**
- Completes in ~300ms
- Status shows "30 selected"

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-06: OneShot — Exact Count
**Target**: Comments page with 100+ visible items
**Steps**:
1. Scroll to show 100+ items
2. Set batch=50
3. Click "Run One Shot (50)"
4. Count selected items

**Expected**:
- Exactly 50 selected
- **NO scrolling occurs**
- Completes in ~300ms

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-07: Continuous — Basic
**Target**: Comments page with many items
**Steps**:
1. Set batch=20
2. Click "Start Continuous"
3. Wait for 2 batches (40 items)
4. Click "Pause"

**Expected**:
- ~40 items selected
- Pauses immediately on click
- Menu shows "Paused" status
- Performance mode active (UI hidden)

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-08: Continuous — Resume
**Target**: After TC-07 (paused)
**Steps**:
1. Click "Resume"
2. Wait for 1 more batch
3. Click "Pause"

**Expected**:
- Continues from where paused
- No duplicate selections
- Total ~60 selected

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-09: Continuous — Stop
**Target**: After TC-08 (paused)
**Steps**:
1. Click "Stop"
2. Verify DOM restored
3. Check header/nav/aside visible again

**Expected**:
- Stops selecting
- Performance mode disabled
- DOM fully restored (header, nav, aside visible)
- Animations/transitions restored
- Button returns to idle state

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-10: Long-Press Pause/Resume
**Target**: Continuous mode running
**Steps**:
1. Start Continuous
2. Hold main button 400ms (until visual feedback)
3. Verify paused
4. Hold again 400ms
5. Verify resumed

**Expected**:
- Toggles pause/resume without menu
- Works on desktop (mousedown/up) and mobile (touchstart/end)
- No menu interaction needed

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-11: No Navigation on Checkbox Click
**Target**: Any activity page
**Steps**:
1. Click any checkbox manually → verify navigation to post
2. Run script OneShot
3. Verify no new tabs/pages opened
4. Check DevTools Network tab for navigation

**Expected**:
- Manual click navigates (normal Instagram behavior)
- Script clicks **do not navigate**
- Zero navigation events in Network tab

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-12: No Duplicates
**Target**: Comments page
**Steps**:
1. Run OneShot (select 50)
2. Run OneShot again
3. Verify no deselection, only new items added

**Expected**:
- Previously selected stay selected
- New items added up to batch size
- `processedInSession` prevents re-click

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-13: Reset Button
**Target**: After selecting items
**Steps**:
1. Select some items (OneShot or Continuous)
2. Click "Reset" in menu
3. Run OneShot again

**Expected**:
- Counter resets to 0
- All items available for selection again
- `processedInSession` cleared

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-14: SPA Navigation Persistence
**Target**: Comments → Likes navigation
**Steps**:
1. On comments page, open menu
2. Click "Likes" tab in Instagram UI (client-side)
3. Verify button still present
4. Open menu, verify it works

**Expected**:
- Button persists after navigation
- Menu opens and functions on new page
- No page reload occurred

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-15: Cross-Page: Likes
**Target**: `https://www.instagram.com/your_activity/interactions/likes`
**Steps**:
1. Navigate to likes page
2. Run OneShot batch=20

**Expected**:
- Works identically to comments
- Button injects, menu works, selection works

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-16: Cross-Page: Story Replies
**Target**: `https://www.instagram.com/your_activity/interactions/story_replies`
**Steps**:
1. Navigate to story replies page
2. Run OneShot batch=20

**Expected**:
- Works identically to comments
- Button injects, menu works, selection works

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-17: Performance Mode DOM Cleanup
**Target**: Continuous mode running
**Steps**:
1. Start Continuous
2. Inspect DOM: header/nav/aside/footer hidden?
3. Stop
4. Verify DOM restored

**Expected**:
- Chrome UI (header, nav, aside, footer) hidden during run
- Fixed/sticky elements hidden
- Fully restored after Stop

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-18: Animation Disabling
**Target**: Continuous mode running
**Steps**:
1. Start Continuous
2. Check computed style on animated elements
3. Stop

**Expected**:
- `animation-duration: 0s` on all elements
- `transition-duration: 0s` on all elements
- Restored after Stop

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-19: Scroll Container Detection
**Target**: Page with loaded items needing scroll
**Steps**:
1. Run Continuous until scroll needed
2. Verify scroll happens smoothly
3. Check container detection in console

**Expected**:
- Correct scroll container found
- Smooth scrolling via `scrollBy`
- No scroll errors

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-20: Mobile Viewport
**Target**: All above tests
**Steps**:
1. Emulate 375×812 (Pixel 7) or 412×915 (Galaxy S23)
2. Run TC-01 through TC-19

**Expected**:
- All features work at mobile viewport
- Button touch-friendly (48px)
- Menu fits viewport (280px)
- Long-press works on touch

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-21: Console Errors
**Target**: Full workflow
**Steps**:
1. Open DevTools Console
2. Run full workflow (TC-01 through TC-19)
3. Filter errors (exclude 404s, network errors)

**Expected**:
- Zero script-related errors
- Only network/404 errors from Instagram

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-22: Layout Stability
**Target**: During/after run
**Steps**:
1. Visual check during Continuous run
2. Visual check after Stop
3. Compare with baseline (no script)

**Expected**:
- No content shift
- Instagram UI intact after Stop
- No broken layouts

**Actual**: [Pass/Fail] | Notes: _______________

---

## Acceptance Criteria

**Release v5.1 passes if:**
- [ ] All TC-01 through TC-22 pass on Desktop Firefox
- [ ] All TC-01 through TC-22 pass on Mobile Firefox (emulated)
- [ ] Zero console errors in any test
- [ ] No visual regression (screenshots match baseline)
- [ ] `CHANGELOG.md`, `LEARNED.md` updated
- [ ] Version bumped in `src/` and `versions/`
- [ ] Build runs successfully (`npm run build`)