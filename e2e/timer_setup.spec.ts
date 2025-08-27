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

async function enterTimerSetup(page) {
  await page.goto('/?mode=timer');
  await expect(page.getByRole('group', { name: 'Set duration' })).toBeVisible();
}

test('ArrowUp hold repeats on minutes field', async ({ page }) => {
  await enterTimerSetup(page);

  const minutesBtn = page.getByRole('button', { name: 'Minutes' });
  const initial = await minutesBtn.textContent();

  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(700); // initial step + repeat window
  await page.keyboard.up('ArrowUp');

  const after = await minutesBtn.textContent();
  expect(after).not.toBe(initial);
});

test('ArrowDown hold repeats on minutes field', async ({ page }) => {
  await enterTimerSetup(page);

  const minutesBtn = page.getByRole('button', { name: 'Minutes' });
  // Ensure minutes > 0 to observe decrement
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowUp');

  const initial = await minutesBtn.textContent();

  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowDown');

  const after = await minutesBtn.textContent();
  expect(after).not.toBe(initial);
});
