const { chromium } = require('@playwright/test');
const path = require('path');
const { calculateHeight } = require('../../src/config/dimensions');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const testWidth = 600;
  const testHeight = calculateHeight(testWidth);
  
  const context = await browser.newContext({
    viewport: { width: testWidth, height: testHeight },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 Error Elements Test\n');
    
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForSelector('.app-layout-window', { timeout: 5000 });
    
    // Find all error-related elements
    const errorElements = await page.evaluate(() => {
      const results = [];
      
      // Check sub-display
      const subDisplay = document.querySelector('.app-layout-sub-display');
      if (subDisplay) {
        const children = subDisplay.children;
        results.push({
          element: 'Sub-Display',
          hasChildren: children.length > 0,
          childrenCount: children.length,
          innerHTML: subDisplay.innerHTML.substring(0, 100),
          classList: Array.from(subDisplay.classList)
        });
        
        // Check for error banner in sub-display
        const errorInSub = subDisplay.querySelector('.v2-error-banner');
        if (errorInSub) {
          results.push({
            element: 'Error Banner in Sub-Display',
            text: errorInSub.textContent,
            parent: 'sub-display'
          });
        }
      }
      
      // Check display area
      const display = document.querySelector('.app-layout-display');
      if (display) {
        const children = display.children;
        results.push({
          element: 'Display',
          hasChildren: children.length > 0,
          childrenCount: children.length,
          innerHTML: display.innerHTML.substring(0, 100)
        });
        
        // Check for error banner in display
        const errorInDisplay = display.querySelector('.v2-error-banner');
        if (errorInDisplay) {
          results.push({
            element: 'Error Banner in Display',
            text: errorInDisplay.textContent,
            parent: 'display'
          });
        }
      }
      
      // Find all error banners anywhere
      const allErrors = document.querySelectorAll('.v2-error-banner');
      allErrors.forEach((error, index) => {
        const parent = error.parentElement;
        results.push({
          element: `Error Banner ${index + 1}`,
          text: error.textContent,
          parentClass: parent ? parent.className : 'unknown',
          position: {
            top: Math.round(error.getBoundingClientRect().top),
            height: Math.round(error.getBoundingClientRect().height)
          }
        });
      });
      
      return results;
    });
    
    console.log('📊 Error Elements Analysis:\n');
    errorElements.forEach(elem => {
      console.log(`\n${elem.element}:`);
      Object.keys(elem).forEach(key => {
        if (key !== 'element') {
          console.log(`  ${key}: ${JSON.stringify(elem[key])}`);
        }
      });
    });
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'playwright-screenshots', 'error-elements.png'),
      fullPage: false
    });
    
    console.log('\n📸 Screenshot saved to playwright-screenshots/error-elements.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
