import { test, expect } from '@playwright/test';
import { createServer, ViteDevServer } from 'vite';
import path from 'path';

let server: ViteDevServer;

test.beforeAll(async () => {
  server = await createServer({
    configFile: path.resolve(process.cwd(), 'vite.config.js'),
    mode: 'development',
  });
  await server.listen();
});

test.afterAll(async () => {
  await server?.close();
});

test('V2 arrow navigation: obs -> timer with Right', async ({ page }) => {
  await page.goto('/?mode=obs');
  // Verify we are on Recording Timer V2
  await expect(page.locator('.v2-mode-title', { hasText: 'RECORDING TIMER' })).toBeVisible();

  // Ensure no edit selection
  await page.evaluate(() => {
    localStorage.setItem('obsTimerCurrentMode', 'obs');
  });

  // Press Right to go to next mode (Timer)
  await page.keyboard.press('ArrowRight');

  // Expect Timer setup to be visible by default in Timer mode
  await expect(page.getByRole('group', { name: 'Set duration' })).toBeVisible();
});

test('V2 gating: obs selection prevents mode change with Right', async ({ page }) => {
  await page.goto('/?mode=obs');
  const total = page.locator('.v2-total-value');
  await expect(total).toBeVisible();
  // Select a segment to enter edit mode
  await total.locator('.v2-total-segment').nth(1).click();

  // Attempt to navigate
  await page.keyboard.press('ArrowRight');

  // Still on Recording Timer
  await expect(page.locator('.v2-mode-title', { hasText: 'RECORDING TIMER' })).toBeVisible();
});

test('V2 gating: timer setup prevents mode change with Right/Left', async ({ page }) => {
  await page.goto('/?mode=timer');
  // Timer setup uses a role="group" with name
  await expect(page.getByRole('group', { name: 'Set duration' })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  // Should remain on Timer setup
  await expect(page.getByRole('group', { name: 'Set duration' })).toBeVisible();
});
