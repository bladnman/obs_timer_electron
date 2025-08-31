const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  
  // Test at different viewport sizes
  const sizes = [
    { width: 400, height: 100, name: 'Small' },
    { width: 600, height: 146, name: 'Medium' },
    { width: 800, height: 195, name: 'Large' },
    { width: 1200, height: 293, name: 'Extra Large' }
  ];
  
  for (const size of sizes) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height }
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('.app-layout-window', { timeout: 5000 });
    
    const fontSizes = await page.evaluate(() => {
      const root = document.querySelector('.AppV2');
      const timeDisplay = document.querySelector('.v2-time-display');
      const statusIcon = document.querySelector('.v2-status-icon');
      const title = document.querySelector('.v2-mode-title');
      
      return {
        rootFontSize: root ? window.getComputedStyle(root).fontSize : 'N/A',
        timeDisplaySize: timeDisplay ? window.getComputedStyle(timeDisplay).fontSize : 'N/A',
        statusIconSize: statusIcon ? window.getComputedStyle(statusIcon).fontSize : 'N/A',
        titleSize: title ? window.getComputedStyle(title).fontSize : 'N/A'
      };
    });
    
    console.log(`\n${size.name} (${size.width}x${size.height}):`);
    console.log(`  Root font size: ${fontSizes.rootFontSize}`);
    console.log(`  Time display: ${fontSizes.timeDisplaySize}`);
    console.log(`  Status icon: ${fontSizes.statusIconSize}`);
    console.log(`  Title: ${fontSizes.titleSize}`);
    
    await context.close();
  }
  
  await browser.close();
})();