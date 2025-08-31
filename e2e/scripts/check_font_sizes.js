const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 600, height: 146 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForSelector('.app-layout-window', { timeout: 5000 });
  
  const fontInfo = await page.evaluate(() => {
    const timeDisplay = document.querySelector('.v2-time-display');
    const container = document.querySelector('.v2-display-container');
    const appDisplay = document.querySelector('.app-layout-display');
    
    const getComputedInfo = (el, name) => {
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        name,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        padding: styles.padding,
        margin: styles.margin,
        height: rect.height,
        computedHeight: styles.height
      };
    };
    
    return [
      getComputedInfo(timeDisplay, 'Time Display'),
      getComputedInfo(container, 'Display Container'),
      getComputedInfo(appDisplay, 'App Layout Display')
    ].filter(Boolean);
  });
  
  console.log('Font Size Analysis:\n');
  fontInfo.forEach(info => {
    console.log(`${info.name}:`);
    console.log(`  Font Size: ${info.fontSize}`);
    console.log(`  Line Height: ${info.lineHeight}`);
    console.log(`  Padding: ${info.padding}`);
    console.log(`  Margin: ${info.margin}`);
    console.log(`  Actual Height: ${info.height}px`);
    console.log(`  Computed Height: ${info.computedHeight}\n`);
  });
  
  await page.waitForTimeout(2000);
  await browser.close();
})();