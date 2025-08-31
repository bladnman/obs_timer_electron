const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 600, height: 200 },
    deviceScaleFactor: 2,
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForSelector('.timer-container, .App', { 
      timeout: 10000,
      state: 'attached' 
    });
    
    await page.waitForTimeout(2000);
    
    // Take OBS mode screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshot_obs_final.png'),
      fullPage: false
    });
    console.log('OBS mode screenshot saved');
    
    // Click on timer mode using the correct selector
    await page.click('button.mode-button:nth-of-type(3)'); // Timer is 3rd button
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshot_timer_final.png'),
      fullPage: false
    });
    console.log('Timer mode screenshot saved');
    
    // Focus on timer input to see if labels clip
    const timeInput = await page.$('.time-input');
    if (timeInput) {
      await timeInput.click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshot_timer_focused.png'),
        fullPage: false
      });
      console.log('Timer mode with focus screenshot saved');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();