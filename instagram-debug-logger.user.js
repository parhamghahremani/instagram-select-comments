// ==UserScript==
// @name         Instagram Activity Logger
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Record all page activity (clicks, scrolls, DOM changes) and export as TXT
// @author       You
// @match        https://www.instagram.com/your_activity/interactions/*
// @grant        GM_setClipboard
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ============ STATE ============
    let isRecording = false;
    let logs = [];
    let startTime = 0;
    let btn = null;
    let observer = null;

    // ============ LOGGING ============
    function log(type, data) {
        if (!isRecording) return;
        const elapsed = Date.now() - startTime;
        const entry = {
            time: elapsed,
            timestamp: new Date().toISOString(),
            type,
            data
        };
        logs.push(entry);
        console.log('[IG Logger]', type, data);
    }

    function formatLog(entry) {
        const ms = entry.time;
        const sec = (ms / 1000).toFixed(3);
        return `[+${sec}s] ${entry.type}: ${JSON.stringify(entry.data, null, 2)}`;
    }

    // ============ EVENT HANDLERS ============
    function onClick(e) {
        const target = e.target;
        const path = getElementPath(target);
        log('CLICK', {
            tag: target.tagName,
            id: target.id,
            classes: target.className,
            ariaLabel: target.getAttribute('aria-label'),
            role: target.getAttribute('role'),
            testId: target.getAttribute('data-testid'),
            href: target.href,
            text: target.innerText?.substring(0, 100),
            path,
            clientX: e.clientX,
            clientY: e.clientY,
            isTrusted: e.isTrusted
        });
    }

    function onScroll(e) {
        const target = e.target;
        log('SCROLL', {
            target: target === document || target === window ? 'window' : getElementPath(target),
            scrollTop: target.scrollTop,
            scrollLeft: target.scrollLeft,
            scrollHeight: target.scrollHeight,
            clientHeight: target.clientHeight
        });
    }

    function onKeyDown(e) {
        log('KEYDOWN', {
            key: e.key,
            code: e.code,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            target: getElementPath(e.target)
        });
    }

    function getElementPath(el) {
        if (!el || el === document || el === window) return 'window/document';
        const parts = [];
        while (el && el !== document.body) {
            let part = el.tagName.toLowerCase();
            if (el.id) part += '#' + el.id;
            if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(' ').filter(c => c && !c.startsWith('x') && !c.startsWith('wbloks')).slice(0, 3);
                if (classes.length) part += '.' + classes.join('.');
            }
            const testId = el.getAttribute('data-testid');
            if (testId) part += '[data-testid="' + testId + '"]';
            const ariaLabel = el.getAttribute('aria-label');
            if (ariaLabel) part += '[aria-label="' + ariaLabel.substring(0, 30) + '"]';
            parts.unshift(part);
            el = el.parentElement;
            if (parts.length > 10) break;
        }
        return parts.join(' > ');
    }

    // ============ MUTATION OBSERVER ============
    function setupMutationObserver() {
        observer = new MutationObserver(mutations => {
            if (!isRecording) return;
            mutations.forEach(m => {
                if (m.type === 'childList' && m.addedNodes.length > 0) {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element
                            log('DOM_ADDED', {
                                tag: node.tagName,
                                classes: node.className,
                                testId: node.getAttribute('data-testid'),
                                ariaLabel: node.getAttribute('aria-label'),
                                path: getElementPath(node)
                            });
                        }
                    });
                }
                if (m.type === 'attributes') {
                    log('DOM_ATTR', {
                        target: getElementPath(m.target),
                        attr: m.attributeName,
                        oldValue: m.oldValue,
                        newValue: m.target.getAttribute(m.attributeName)
                    });
                }
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ['aria-selected', 'style', 'class', 'aria-label', 'data-testid']
            });
        });
    }

    // ============ CHECKBOX SPECIFIC ============
    function setupCheckboxMonitoring() {
        // Monitor checkbox state changes
        const checkInterval = setInterval(() => {
            if (!isRecording) return;
            const checkboxes = document.querySelectorAll('[data-testid="bulk_action_checkbox"]');
            checkboxes.forEach((cb, idx) => {
                const btn = cb.querySelector('[role="button"][aria-label="Toggle checkbox"]');
                if (btn) {
                    const inner = btn.querySelector('div');
                    const style = inner?.style?.cssText || inner?.getAttribute('style') || '';
                    const isSelected = style.includes('74,93,249') || style.includes('rgb(74, 93, 249)');
                    cb.dataset._loggedSelected = isSelected;
                }
            });
        }, 500);
    }

    // ============ UI BUTTON ============
    function createButton() {
        if (document.getElementById('ig-debug-btn')) return;

        btn = document.createElement('button');
        btn.id = 'ig-debug-btn';
        btn.title = 'Click to START recording';
        btn.setAttribute('aria-label', 'Instagram Activity Logger');

        Object.assign(btn.style, {
            position: 'fixed',
            top: '50%',
            right: '70px', // Next to the other button
            transform: 'translateY(-50%)',
            zIndex: '2147483647',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#ff3333', // Red = not recording
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255,51,51,0.5), 0 0 0 2px rgba(255,255,255,0.1)',
            transition: 'all 0.2s',
            opacity: '1',
            visibility: 'visible',
            pointerEvents: 'auto',
        });

        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
            <span id="ig-debug-count" style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #fff;
                color: #ff3333;
                font-size: 10px;
                font-weight: 700;
                border-radius: 10px;
                padding: 0 6px;
                min-width: 20px;
                text-align: center;
                pointer-events: none;
                line-height: 18px;
                display: none;
            ">0</span>
        `;

        const countBadge = btn.querySelector('#ig-debug-count');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleRecording();
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-50%) scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(-50%) scale(1)';
        });

        document.body.appendChild(btn);
    }

    function toggleRecording() {
        if (!isRecording) {
            // START
            isRecording = true;
            startTime = Date.now();
            logs = [];
            btn.style.backgroundColor = '#00c853'; // Green = recording
            btn.title = 'Click to STOP and save log';
            btn.innerHTML = btn.innerHTML.replace('circle cx="12" cy="12" r="4" fill="white"', 'rect x="8" y="8" width="8" height="8" fill="white"');
            log('SYSTEM', { action: 'recording_started', url: location.href });
            console.log('%c[IG Logger] Recording STARTED', 'color: #00c853; font-weight: bold;');
        } else {
            // STOP & SAVE
            isRecording = false;
            btn.style.backgroundColor = '#ff3333'; // Red = stopped
            btn.title = 'Click to START recording';
            btn.innerHTML = btn.innerHTML.replace('rect x="8" y="8" width="8" height="8" fill="white"', 'circle cx="12" cy="12" r="4" fill="white"');
            log('SYSTEM', { action: 'recording_stopped', totalEvents: logs.length });

            saveLog();
            console.log('%c[IG Logger] Recording STOPPED - ' + logs.length + ' events', 'color: #ff3333; font-weight: bold;');
        }
    }

    function saveLog() {
        const header = `Instagram Activity Log
URL: ${location.href}
Started: ${new Date(startTime).toISOString()}
Stopped: ${new Date().toISOString()}
Duration: ${(Date.now() - startTime) / 1000}s
Total Events: ${logs.length}
==========================================\n\n`;

        const body = logs.map(formatLog).join('\n\n');

        const fullLog = header + body;

        // Create download
        const blob = new Blob([fullLog], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ig-activity-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Also copy to clipboard
        if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(fullLog);
            console.log('[IG Logger] Log copied to clipboard');
        }
    }

    // ============ INIT ============
    function init() {
        console.log('[IG Logger] Initializing...');
        createButton();
        setupMutationObserver();
        setupCheckboxMonitoring();

        // Global event listeners (capture phase for clicks)
        document.addEventListener('click', onClick, true);
        document.addEventListener('scroll', onScroll, true);
        document.addEventListener('keydown', onKeyDown, true);

        // Periodic status
        setInterval(() => {
            if (isRecording) {
                const badge = document.getElementById('ig-debug-count');
                if (badge) {
                    badge.textContent = logs.length;
                    badge.style.display = 'flex';
                }
            }
        }, 1000);

        console.log('[IG Logger] Ready - click the red circle button to start recording');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();