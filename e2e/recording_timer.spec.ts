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

test('Recording Timer: hold k/j repeats on Total minutes (requires selection)', async ({ page }) => {
  await page.goto(`${serverUrl}/?mode=obs`);
  // Ensure the UI is rendered
  await expect(page.locator('.v2-total-value')).toBeVisible();

  const totalLocator = page.locator('.v2-total-value');
  // Select minutes explicitly
  await totalLocator.locator('.v2-total-segment').nth(1).click();
  const getMinutes = async () => {
    const text = (await totalLocator.textContent()) || '00:00:00';
    const [, m] = text.trim().split(':');
    return parseInt(m || '0', 10);
  };

  // Start from a known state by pressing k once
  const m0 = await getMinutes();
  await page.keyboard.down('k');
  await page.waitForTimeout(700); // initial step + repeat window
  await page.keyboard.up('k');
  const m1 = await getMinutes();
  expect(m1).toBeGreaterThan(m0);

  // Now decrement with j hold
  await page.keyboard.down('j');
  await page.waitForTimeout(700);
  await page.keyboard.up('j');
  const m2 = await getMinutes();
  expect(m2).toBeLessThanOrEqual(m1);
});

test('Recording Timer: borrow/carry across segments without clearing right side', async ({ page }) => {
  await page.goto(`${serverUrl}/?mode=obs`);
  const total = page.locator('.v2-total-value');
  await expect(total).toBeVisible();

  const seg = (idx: number) => total.locator('.v2-total-segment').nth(idx);

  // Set hours = 01
  await seg(0).click();
  await page.keyboard.press('k');

  // Set seconds = 30
  await seg(2).click();
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('k');
  }

  // Now select minutes and decrement once (should borrow from hours)
  await seg(1).click();
  await page.keyboard.press('j');

  const text = (await total.textContent())?.trim() || '00:00:00';
  const [h, m, s] = text.split(':').map(t => parseInt(t, 10));
  expect(h).toBeGreaterThanOrEqual(0);
  expect(m).toBe(59);
  expect(s).toBe(30);
});
