const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 600, height: 200 },
    deviceScaleFactor: 2, // For higher quality screenshots
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the Electron app's dev server
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for the app to fully load - check for timer container instead
    await page.waitForSelector('.timer-container, .App', { 
      timeout: 10000,
      state: 'attached' 
    });
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, 'screenshot_obs_mode.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Also take screenshots of different modes
    
    // Click on stopwatch mode
    const stopwatchButton = await page.$('button.mode-button:has-text("⏱")');
    if (stopwatchButton) {
      await stopwatchButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshot_stopwatch_mode.png'),
        fullPage: false
      });
      console.log('Stopwatch mode screenshot saved');
    }
    
    // Click on timer mode  
    const timerButton = await page.$('button.mode-button:has-text("⏲")');
    if (timerButton) {
      await timerButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshot_timer_mode.png'),
        fullPage: false
      });
      console.log('Timer mode screenshot saved');
    }
    
    // Click on clock mode
    const clockButton = await page.$('button.mode-button:has-text("🕐")');
    if (clockButton) {
      await clockButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshot_clock_mode.png'),
        fullPage: false
      });
      console.log('Clock mode screenshot saved');
    }
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();