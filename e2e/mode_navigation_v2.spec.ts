import { test, expect } from '@playwright/test';
import { createServer, ViteDevServer } from 'vite';
import path from 'path';

let server: ViteDevServer;
let serverUrl: string;

test.beforeAll(async () => {
  server = await createServer({
    configFile: path.resolve(process.cwd(), 'vite.config.js'),
    mode: 'development',
  });
  await server.listen();
  const urls: any = (server as any).resolvedUrls;
  serverUrl = urls?.local?.[0] || `http://localhost:${server.config.server?.port || 3000}`;
});

test.afterAll(async () => {
  await server?.close();
});

test('V2 arrow navigation: obs -> timer with Right', async ({ page }) => {
  await page.goto(`${serverUrl}/?mode=obs`);
  // Verify we are on Recording Timer V2: status bar shows Total label
  await expect(page.getByText('Total:')).toBeVisible();

  // Ensure no edit selection
  await page.evaluate(() => {
    localStorage.setItem('obsTimerCurrentMode', 'obs');
  });

  // Press Right to go to next mode (Timer)
  await page.keyboard.press('ArrowRight');

  // Expect Timer display (not setup) to be visible by default
  await expect(page.locator('.v2-display-container')).toBeVisible();
});

test('V2 gating: obs selection prevents mode change with Right', async ({ page }) => {
  await page.goto(`${serverUrl}/?mode=obs`);
  const total = page.locator('.v2-total-value');
  await expect(total).toBeVisible();
  // Select a segment to enter edit mode
  await total.locator('.v2-total-segment').nth(1).click();

  // Attempt to navigate
  await page.keyboard.press('ArrowRight');

  // Still on Recording Timer (verify by Total label present)
  await expect(page.getByText('Total:')).toBeVisible();
});

test('V2 gating: timer setup prevents mode change with Right/Left', async ({ page }) => {
  await page.goto(`${serverUrl}/?mode=timer`);
  // Enter setup via the settings button in status bar
  await page.getByTitle('Set Duration').click();
  await expect(page.getByRole('group', { name: 'Set duration' })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  // Should remain on Timer setup
  await expect(page.getByRole('group', { name: 'Set duration' })).toBeVisible();
});
