/**
 * Playwright automated tests for Instagram Bulk Select
 * Run with: npm test
 */

import { test, expect } from '@playwright/test';

const scriptPath = 'src/instagram-select-comments.user.js';

const pages = [
    'https://www.instagram.com/your_activity/interactions/comments',
    'https://www.instagram.com/your_activity/interactions/likes',
    'https://www.instagram.com/your_activity/interactions/story_replies',
];

test.describe.configure({ retries: 0 });

for (const url of pages) {
    test.describe(`Page: ${url}`, () => {
        test('Button injects and is visible', async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            const btn = await page.waitForSelector('#ig-bulk-select-btn', { timeout: 15000 });
            expect(btn).toBeTruthy();

            const isVisible = await btn.isVisible();
            expect(isVisible).toBe(true);
        });

        test('Menu opens on button click', async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            const btn = await page.waitForSelector('#ig-bulk-select-btn', { timeout: 15000 });
            await btn.click();

            const menu = await page.waitForSelector('#ig-bulk-select-menu', { timeout: 5000 });
            expect(menu).toBeTruthy();

            const isVisible = await menu.isVisible();
            expect(isVisible).toBe(true);
        });

        test('Menu closes on outside click', async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            const btn = await page.waitForSelector('#ig-bulk-select-btn', { timeout: 15000 });
            await btn.click();

            const menu = await page.waitForSelector('#ig-bulk-select-menu', { timeout: 5000 });

            // Click outside (on body)
            await page.locator('body').click({ position: { x: 10, y: 10 } });

            await page.waitForTimeout(500);
            const isVisible = await menu.isVisible();
            expect(isVisible).toBe(false);
        });

        test('Batch size input updates value', async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            const btn = await page.waitForSelector('#ig-bulk-select-btn', { timeout: 15000 });
            await btn.click();

            const batchInput = await page.waitForSelector('#ig-batch-size', { timeout: 5000 });
            await batchInput.fill('50');
            await batchInput.press('Enter');

            // Verify the value is reflected in the debug API
            const batchSize = await page.evaluate(() => window.IG_BULK_SELECT.getState().batchSize);
            expect(batchSize).toBe(50);
        });

        test('Mode toggle switches correctly', async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            const btn = await page.waitForSelector('#ig-bulk-select-btn', { timeout: 15000 });
            await btn.click();

            // Click "Continuous" mode button
            const continuousBtn = await page.waitForSelector('.ig-mode-btn[data-mode="continuous"]', { timeout: 5000 });
            await continuousBtn.click();

            // Verify mode changed via debug API
            const state = await page.evaluate(() => window.IG_BULK_SELECT.getState());
            expect(state.mode).toBe('continuous');
        });

        test('Debug API exposed and functional', async ({ page }) => {
            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            const state = await page.evaluate(() => window.IG_BULK_SELECT.getState());
            expect(state).toHaveProperty('isRunning');
            expect(state).toHaveProperty('isPaused');
            expect(state).toHaveProperty('batchSize');
            expect(state).toHaveProperty('mode');
            expect(state).toHaveProperty('processed');
            expect(state).toHaveProperty('performanceMode');
        });

        test('No console errors during injection', async ({ page }) => {
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error' && msg.text().includes('IG Bulk Select')) {
                    errors.push(msg.text());
                }
            });

            await page.addScriptTag({ path: scriptPath });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForSelector('#ig-bulk-select-btn', { timeout: 15000 });

            // Give some time for any async errors
            await page.waitForTimeout(1000);

            expect(errors.length).toBe(0);
        });
    });
}