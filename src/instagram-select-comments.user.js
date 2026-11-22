// ==UserScript==
// @name         Instagram Bulk Select (Comments, Likes, Story Replies)
// @namespace    http://tampermonkey.net/
// @version      5.1.0
// @description  Instant OneShot, pause/resume anytime, zero duplicates, max performance for all activity pages.
// @author       You
// @match        https://www.instagram.com/your_activity/interactions/comments*
// @match        https://www.instagram.com/your_activity/interactions/likes*
// @match        https://www.instagram.com/your_activity/interactions/story_replies*
// @icon         https://www.instagram.com/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ============ CONFIGURATION ============
    const DEFAULT_BATCH_SIZE = 100;
    const CLICK_DELAY_MS = 0;           // Zero delay
    const SCROLL_DELAY_MS = 30;         // Faster scroll
    const SCROLL_STEP = 2000;           // Larger scroll steps
    const MAX_SCROLL_ATTEMPTS = 15;
    const BUTTON_SIZE = 48;
    const MENU_WIDTH = 280;

    const COLORS = {
        primary: '#0095f6',
        active: '#00c853',
        paused: '#ff9800',
        danger: '#ff3333',
        background: '#1a1a1a',
        surface: '#262626',
        border: '#333',
        text: '#fff',
        textMuted: '#aaa',
    };

    // ============ STATE ============
    let isRunning = false;
    let isPaused = false;
    let batchSize = DEFAULT_BATCH_SIZE;
    let mode = 'oneshot'; // Default to oneshot per user request
    let button = null;
    let menu = null;
    let menuOpen = false;
    let scrollContainer = null;
    let scrollAttempts = 0;
    let performanceMode = false;
    const processedInSession = new Set();
    const currentBatchPromise = null; // For cancellation

    // ============ LOGGING ============
    function log(...args) {
        console.log('%c[IG Bulk Select]', 'color: #0095f6; font-weight: bold;', ...args);
    }
    function logError(...args) {
        console.error('%c[IG Bulk Select ERROR]', 'color: #ff3333; font-weight: bold;', ...args);
    }

    // ============ PERFORMANCE MODE: MAXIMUM CLEANUP ============
    function enablePerformanceMode() {
        if (performanceMode) return;
        performanceMode = true;
        log('Enabling MAX performance mode...');

        const containerSelectors = [
            'div[data-testid="comments_container_non_empty_state"]',
            'div[data-testid="likes_container_non_empty_state"]',
            'div[data-testid="story_replies_container_non_empty_state"]',
            'div[data-testid="interactions_container_non_empty_state"]',
            'main[role="main"]',
        ];

        let targetContainer = null;
        for (const sel of containerSelectors) {
            const el = document.querySelector(sel);
            if (el) { targetContainer = el; break; }
        }

        if (!targetContainer) {
            const checkbox = document.querySelector('[data-testid="bulk_action_checkbox"]');
            if (checkbox) {
                let parent = checkbox.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.scrollHeight > parent.clientHeight + 50) {
                        targetContainer = parent;
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        }

        if (!targetContainer) {
            log('No container found for performance mode');
            performanceMode = false;
            return;
        }

        window._igPerformanceTarget = targetContainer;

        // Inject aggressive performance CSS
        const style = document.createElement('style');
        style.id = 'ig-bulk-perf-style';
        style.textContent = `
            /* Hide all UI chrome */
            header, nav, aside, footer,
            [role="banner"], [role="navigation"], [role="complementary"],
            div[style*="position: fixed"]:not(#ig-bulk-select-btn):not(#ig-bulk-select-menu),
            div[style*="position: sticky"] {
                display: none !important;
            }
            /* Keep only our target container and UI */
            body > *:not(#ig-bulk-select-btn):not(#ig-bulk-select-menu):not([data-testid="comments_container_non_empty_state"]):not([data-testid="likes_container_non_empty_state"]):not([data-testid="story_replies_container_non_empty_state"]):not([data-testid="interactions_container_non_empty_state"]):not(main[role="main"]) {
                display: none !important;
            }
            /* Disable all animations/transitions for speed */
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
            }
            html, body { overflow: hidden !important; height: 100% !important; margin: 0 !important; padding: 0 !important; }
        `;
        document.head.appendChild(style);

        // Fullscreen the target container
        Object.assign(targetContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '999999',
            overflow: 'auto',
            background: '#000',
            margin: '0',
            padding: '0',
        });

        if (button) button.style.zIndex = '2147483647';
        if (menu) menu.style.zIndex = '2147483646';

        log('Performance mode enabled');
    }

    function disablePerformanceMode() {
        if (!performanceMode) return;
        performanceMode = false;
        log('Disabling performance mode...');

        const style = document.getElementById('ig-bulk-perf-style');
        if (style) style.remove();

        const targetContainer = window._igPerformanceTarget;
        if (targetContainer) {
            Object.assign(targetContainer.style, {
                position: '', top: '', left: '', width: '', height: '',
                zIndex: '', overflow: '', background: '', margin: '', padding: ''
            });
            window._igPerformanceTarget = null;
        }

        if (button) button.style.zIndex = '2147483647';
        if (menu) menu.style.zIndex = '2147483646';

        log('Performance mode disabled');
    }

    // ============ FIND SCROLL CONTAINER ============
    function findScrollContainer() {
        if (window._igPerformanceTarget && window._igPerformanceTarget.scrollHeight > window._igPerformanceTarget.clientHeight + 50) {
            return window._igPerformanceTarget;
        }

        const containerSelectors = [
            'div[data-testid="comments_container_non_empty_state"]',
            'div[data-testid="likes_container_non_empty_state"]',
            'div[data-testid="story_replies_container_non_empty_state"]',
            'div[data-testid="interactions_container_non_empty_state"]',
        ];

        for (const sel of containerSelectors) {
            const el = document.querySelector(sel);
            if (el && (el.scrollHeight > el.clientHeight + 50)) return el;
        }

        const childCandidates = [
            'div[data-testid="comments_container_non_empty_state"] > div > div',
            'div[data-testid="likes_container_non_empty_state"] > div > div',
            'div[data-testid="story_replies_container_non_empty_state"] > div > div',
            'div[data-testid="interactions_container_non_empty_state"] > div > div',
            'main[role="main"]',
            'div.x1iyjqo2.xg6iff7',
            'div.xvbhtw8.x78zum5.xdt5ytf.x1iyjqo2.xl56j7k',
            'div[style*="--x-height"]',
        ];

        for (const sel of childCandidates) {
            const el = document.querySelector(sel);
            if (el && (el.scrollHeight > el.clientHeight + 50)) return el;
        }

        const main = document.querySelector('main[role="main"]') || document.body;
        const allDivs = main.querySelectorAll('div');
        for (const div of allDivs) {
            if (div.scrollHeight > div.clientHeight + 100 && div.clientHeight > 200) return div;
        }
        return window;
    }

    // ============ CHECKBOX DETECTION ============
    function getCheckboxes() {
        const checkboxes = [];
        const seen = new Set();

        document.querySelectorAll('[data-testid="bulk_action_checkbox"]').forEach(el => {
            if (!seen.has(el)) {
                seen.add(el);
                checkboxes.push(el);
            }
        });

        // Fallback for old comments UI
        document.querySelectorAll('svg.x1lliihq.x1n2onr6.x1roi4f4').forEach(svg => {
            if (svg.getAttribute('aria-label') !== null && svg.getAttribute('aria-label') !== '') return;
            const checkboxDiv = svg.closest('div[aria-selected]');
            if (checkboxDiv && !seen.has(checkboxDiv)) {
                const required = ['x9f619', 'xxk0z11', 'xii2z7h', 'x11xpdln', 'x19c4wfv', 'xvy4d1p'];
                if (required.every(cls => checkboxDiv.classList.contains(cls))) {
                    seen.add(checkboxDiv);
                    checkboxes.push(checkboxDiv);
                }
            }
        });

        return checkboxes;
    }

    function getUnselectedCheckboxes() {
        const all = getCheckboxes();
        const result = [];
        for (const cb of all) {
            if (!isSelected(cb) && !processedInSession.has(cb)) result.push(cb);
        }
        return result;
    }

    function isSelected(el) {
        const btn = el.querySelector('[role="button"][aria-label="Toggle checkbox"]');
        if (btn) {
            const inner = btn.querySelector('div');
            if (inner) {
                const style = inner.style.cssText || inner.getAttribute('style') || '';
                if (style.includes('74,93,249') || style.includes('rgb(74, 93, 249)')) return true;
            }
        }
        return el.getAttribute('aria-selected') === 'true';
    }

    // ============ ULTRA-FAST CLICK ============
    function clickCheckbox(el) {
        if (isSelected(el) || processedInSession.has(el)) return false;

        try {
            const btn = el.querySelector('[role="button"][aria-label="Toggle checkbox"]');
            const target = btn || el;

            const rect = target.getBoundingClientRect();
            const clientX = rect.left + rect.width / 2;
            const clientY = rect.top + rect.height / 2;

            // Single composed click event - fastest method
            const evt = new MouseEvent('click', {
                bubbles: true, cancelable: true, view: window,
                clientX, clientY, button: 0, buttons: 0, composed: true
            });
            target.dispatchEvent(evt);
            target.click();

            processedInSession.add(el);

            // Block navigation on parent link (capture phase)
            const link = target.closest('a[href]');
            if (link) {
                const blocker = e => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    link.removeEventListener('click', blocker, true);
                };
                link.addEventListener('click', blocker, true);
            }

            return true;
        } catch (e) {
            logError('Click failed:', e);
            return false;
        }
    }

    // ============ SCROLL ============
    function scrollForMore() {
        if (performanceMode || !scrollContainer) scrollContainer = findScrollContainer();

        if (scrollContainer === window) window.scrollBy(0, SCROLL_STEP);
        else scrollContainer.scrollTop += SCROLL_STEP;

        scrollAttempts++;
        return new Promise(r => setTimeout(r, SCROLL_DELAY_MS));
    }

    async function ensureMinItems(minCount) {
        scrollAttempts = 0;
        let prev = -1, stable = 0;

        while (scrollAttempts < MAX_SCROLL_ATTEMPTS) {
            const count = getUnselectedCheckboxes().length;
            if (count >= minCount) return true;
            if (count === prev) { if (++stable >= 2) break; }
            else { stable = 0; prev = count; }
            await scrollForMore();
            scrollAttempts++;
        }
        return getUnselectedCheckboxes().length >= minCount;
    }

    // ============ SELECTION: TRUE ONESHOT (INSTANT) ============
    async function runOneShot() {
        log('=== INSTANT ONE SHOT ===');
        isRunning = true; isPaused = false;
        updateButtonColor();

        enablePerformanceMode();

        try {
            // NO SCROLL - only what's visible NOW
            const visible = getUnselectedCheckboxes();
            const take = Math.min(batchSize, visible.length);
            if (take === 0) { log('Nothing visible'); return; }

            log(`OneShot: selecting ${take} visible items instantly`);
            let done = 0;
            for (let i = 0; i < take && isRunning && !isPaused; i++) {
                if (clickCheckbox(visible[i])) done++;
            }
            log(`OneShot done: ${done}/${take}`);
        } finally {
            stop();
            disablePerformanceMode();
        }
    }

    // ============ CONTINUOUS MODE ============
    async function runContinuous() {
        log('=== CONTINUOUS MODE ===');
        enablePerformanceMode();

        try {
            while (isRunning && !isPaused) {
                const available = getUnselectedCheckboxes();

                if (available.length === 0) {
                    const before = available.length;
                    await scrollForMore();
                    if (getUnselectedCheckboxes().length <= before) await sleep(300);
                    continue;
                }

                const take = Math.min(batchSize, available.length);
                let done = 0;
                for (let i = 0; i < take && isRunning && !isPaused; i++) {
                    if (clickCheckbox(available[i])) done++;
                }
                log(`Batch done: ${done}/${take}`);

                if (isPaused) break;
                await sleep(0); // yield for pause check
            }
        } finally {
            disablePerformanceMode();
        }
    }

    // ============ UI BUTTON ============
    function createButton() {
        const old = document.getElementById('ig-bulk-select-btn');
        if (old) old.remove();

        button = document.createElement('button');
        button.id = 'ig-bulk-select-btn';
        button.setAttribute('aria-label', 'Bulk Select');
        button.setAttribute('aria-expanded', 'false');
        Object.assign(button.style, {
            position: 'fixed', top: '50%', right: '16px', transform: 'translateY(-50%)',
            zIndex: '2147483647', width: `${BUTTON_SIZE}px`, height: `${BUTTON_SIZE}px`,
            borderRadius: '50%', backgroundColor: COLORS.primary, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,149,246,0.5), 0 0 0 2px rgba(255,255,255,0.1)',
            transition: 'all 0.15s', opacity: '1', visibility: 'visible', pointerEvents: 'auto',
        });
        button.innerHTML = getButtonIcon();

        button.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            if (menuOpen) closeMenu(); else openMenu();
        });

        // Long press on main button = PAUSE/RESUME (works during operation!)
        let pressTimer = null;
        button.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                if (isRunning) { isPaused ? resume() : pause(); }
            }, 400);
        });
        button.addEventListener('mouseup', () => clearTimeout(pressTimer));
        button.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        button.addEventListener('touchstart', () => {
            pressTimer = setTimeout(() => {
                if (isRunning) { isPaused ? resume() : pause(); }
            }, 400);
        }, {passive: true});
        button.addEventListener('touchend', () => clearTimeout(pressTimer));

        document.body.appendChild(button);

        // SPA persistence
        setInterval(() => {
            if (!document.getElementById('ig-bulk-select-btn')) createButton();
        }, 1000);

        // Outside click closes menu ONLY when not running
        document.addEventListener('click', e => {
            if (menuOpen && !menu?.contains(e.target) && e.target !== button && !isRunning) closeMenu();
        });
    }

    function getButtonIcon() {
        if (isRunning && !isPaused) return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="5" y="5" width="14" height="14" rx="2" fill="white"/></svg>';
        if (isPaused) return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="6" y="4" width="4" height="16" fill="white"/><rect x="14" y="4" width="4" height="16" fill="white"/></svg>';
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 12 13 16 21 8" opacity="0.7"/></svg>';
    }

    function updateButtonColor() {
        if (!button) return;
        button.style.backgroundColor = isRunning && !isPaused ? COLORS.active : isPaused ? COLORS.paused : COLORS.primary;
        button.innerHTML = getButtonIcon();
    }

    // ============ MENU ============
    function createMenu() {
        if (document.getElementById('ig-bulk-select-menu')) return;

        menu = document.createElement('div');
        menu.id = 'ig-bulk-select-menu';
        menu.setAttribute('role', 'dialog');
        Object.assign(menu.style, {
            position: 'fixed', top: '50%', right: `${BUTTON_SIZE + 24}px`, transform: 'translateY(-50%)',
            zIndex: '2147483646', width: `${MENU_WIDTH}px`, backgroundColor: COLORS.background,
            border: `1px solid ${COLORS.border}`, borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '16px',
            fontFamily: 'system-ui', fontSize: '14px', color: COLORS.text,
            display: 'none', flexDirection: 'column', gap: '12px',
        });

        menu.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${COLORS.border};padding-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">Bulk Select</h3>
                <button id="ig-menu-close" style="background:none;border:none;color:${COLORS.textMuted};cursor:pointer;padding:4px;font-size:18px;">✕</button>
            </div>
            <div>
                <label style="display:block;margin-bottom:6px;font-weight:500;">Batch Size</label>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="number" id="ig-batch-size" value="${batchSize}" min="1" max="2000" step="1"
                        style="flex:1;padding:10px 12px;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:8px;color:${COLORS.text};font-size:14px;outline:none;">
                    <span style="color:${COLORS.textMuted};font-size:13px;">items</span>
                </div>
            </div>
            <div>
                <label style="display:block;margin-bottom:6px;font-weight:500;">Mode</label>
                <div style="display:flex;gap:8px;">
                    <button class="ig-mode-btn" data-mode="continuous" style="flex:1;padding:10px;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:8px;color:${COLORS.text};font-size:13px;font-weight:500;cursor:pointer;">Continuous</button>
                    <button class="ig-mode-btn" data-mode="oneshot" style="flex:1;padding:10px;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:8px;color:${COLORS.text};font-size:13px;font-weight:500;cursor:pointer;">One Shot</button>
                </div>
                <p style="margin:6px 0 0;font-size:12px;color:${COLORS.textMuted};"><span id="ig-mode-desc">One Shot: selects only visible items instantly (no scroll).</span></p>
            </div>
            <div style="display:flex;gap:8px;margin-top:4px;">
                <button id="ig-btn-oneshot" style="flex:1;padding:12px;background:${COLORS.primary};border:none;border-radius:8px;color:white;font-size:14px;font-weight:600;cursor:pointer;">Run One Shot Now</button>
                <button id="ig-btn-continuous" style="flex:1;padding:12px;background:${COLORS.active};border:none;border-radius:8px;color:white;font-size:14px;font-weight:600;cursor:pointer;">Start Continuous</button>
            </div>
            <div style="display:flex;gap:8px;margin-top:4px;">
                <button id="ig-btn-pause-resume" style="flex:1;padding:12px;background:${COLORS.paused};border:none;border-radius:8px;color:white;font-size:14px;font-weight:600;cursor:pointer;display:none;">Pause</button>
                <button id="ig-btn-stop" style="flex:1;padding:12px;background:${COLORS.danger};border:none;border-radius:8px;color:white;font-size:14px;font-weight:600;cursor:pointer;display:none;">Stop</button>
            </div>
            <div style="border-top:1px solid ${COLORS.border};padding-top:12px;display:flex;gap:8px;">
                <button id="ig-btn-reset" style="flex:1;padding:10px;background:transparent;border:1px solid ${COLORS.danger};border-radius:8px;color:${COLORS.danger};font-size:13px;font-weight:500;cursor:pointer;">Reset</button>
                <button id="ig-btn-scroll-top" style="flex:1;padding:10px;background:transparent;border:1px solid ${COLORS.border};border-radius:8px;color:${COLORS.text};font-size:13px;font-weight:500;cursor:pointer;">Scroll Top</button>
            </div>
            <div id="ig-status" style="font-size:12px;color:${COLORS.textMuted};text-align:center;padding:8px;background:${COLORS.surface};border-radius:8px;">Ready.</div>
        `;

        document.body.appendChild(menu);

        // Listeners
        menu.querySelector('#ig-menu-close').onclick = e => { e.stopPropagation(); closeMenu(); };

        menu.querySelector('#ig-batch-size').onchange = e => {
            const v = parseInt(e.target.value, 10);
            if (v >= 1 && v <= 2000) { batchSize = v; updateMenu(); log('Batch:', batchSize); }
        };

        menu.querySelectorAll('.ig-mode-btn').forEach(b => b.onclick = e => {
            mode = e.target.dataset.mode; updateMenu(); log('Mode:', mode);
        });

        menu.querySelector('#ig-btn-oneshot').onclick = async e => {
            e.stopPropagation(); closeMenu();
            if (!isRunning) await runOneShot();
        };

        menu.querySelector('#ig-btn-continuous').onclick = e => {
            e.stopPropagation();
            if (!isRunning) startContinuous();
            else if (!isPaused) pause();
            else resume();
            // Keep menu OPEN during operation for pause/resume/stop
        };

        menu.querySelector('#ig-btn-pause-resume').onclick = e => {
            e.stopPropagation(); isPaused ? resume() : pause();
        };

        menu.querySelector('#ig-btn-stop').onclick = e => {
            e.stopPropagation(); stop(); closeMenu();
        };

        menu.querySelector('#ig-btn-reset').onclick = e => {
            e.stopPropagation(); processedInSession.clear(); updateMenu(); log('Reset');
        };

        menu.querySelector('#ig-btn-scroll-top').onclick = e => {
            e.stopPropagation();
            if (scrollContainer && scrollContainer !== window) scrollContainer.scrollTop = 0;
            else window.scrollTo(0, 0);
            scrollContainer = null; log('Scrolled to top');
        };
    }

    function updateMenu() {
        if (!menu) return;

        menu.querySelectorAll('.ig-mode-btn').forEach(b => {
            b.style.background = b.dataset.mode === mode ? COLORS.primary : COLORS.surface;
            b.style.borderColor = b.dataset.mode === mode ? COLORS.primary : COLORS.border;
        });

        menu.querySelector('#ig-mode-desc').textContent =
            mode === 'continuous' ? 'Continuous: scrolls & selects until stopped.'
                : 'One Shot: selects only visible items instantly (no scroll).';

        const oneshotBtn = menu.querySelector('#ig-btn-oneshot');
        if (oneshotBtn) oneshotBtn.textContent = 'Run One Shot (' + batchSize + ')';

        // Show/hide pause/stop during operation
        const pauseBtn = menu.querySelector('#ig-btn-pause-resume');
        const stopBtn = menu.querySelector('#ig-btn-stop');
        const contBtn = menu.querySelector('#ig-btn-continuous');

        if (isRunning) {
            pauseBtn.style.display = 'block';
            stopBtn.style.display = 'block';
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            contBtn.textContent = isPaused ? 'Resume Continuous' : 'Pause Continuous';
            contBtn.style.background = isPaused ? COLORS.active : COLORS.paused;
        } else {
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            contBtn.textContent = 'Start Continuous';
            contBtn.style.background = COLORS.active;
        }

        // Status
        const unsel = getUnselectedCheckboxes().length;
        const proc = processedInSession.size;
        const status = menu.querySelector('#ig-status');
        if (status) {
            if (isRunning && !isPaused) status.textContent = `Running... ${proc} selected. ${unsel} available.`, status.style.color = COLORS.active;
            else if (isPaused) status.textContent = `Paused. ${proc} selected. ${unsel} available.`, status.style.color = COLORS.paused;
            else status.textContent = `Ready. ${unsel} available.`, status.style.color = COLORS.textMuted;
        }
    }

    function openMenu() { if (!menu) createMenu(); menu.style.display = 'flex'; menuOpen = true; button.setAttribute('aria-expanded','true'); updateMenu(); updateButtonColor(); }
    function closeMenu() { if (menu) { menu.style.display = 'none'; menuOpen = false; button.setAttribute('aria-expanded','false'); } }

    // ============ CONTROL ============
    function startContinuous() {
        isRunning = true; isPaused = false;
        processedInSession.clear(); scrollContainer = null;
        updateButtonColor(); updateMenu();
        mode === 'oneshot' ? runOneShot() : runContinuous();
    }
    function pause() { isPaused = true; updateButtonColor(); updateMenu(); log('PAUSED'); }
    function resume() { isPaused = false; updateButtonColor(); updateMenu(); log('RESUMED'); mode === 'oneshot' ? runOneShot() : runContinuous(); }
    function stop() { isRunning = false; isPaused = false; updateButtonColor(); updateMenu(); log('STOPPED'); }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ============ INIT ============
    function init() {
        log('=== IG Bulk Select v5.1 ==='); log('URL:', location.href);
        createButton();
        setInterval(() => { if (menuOpen) updateMenu(); }, 1000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    // Debug API
    window.IG_BULK_SELECT = {
        getCheckboxes, getUnselectedCheckboxes, startContinuous, pause, resume, stop, runOneShot,
        setBatchSize: n => { batchSize = n; updateMenu(); },
        setMode: m => { mode = m; updateMenu(); },
        getState: () => ({ isRunning, isPaused, batchSize, mode, processed: processedInSession.size, performanceMode }),
        forceCreateButton: createButton,
    };

    log('Loaded v5.1');
})();