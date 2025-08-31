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
    console.log('🔍 Error Display Test\n');
    console.log(`Viewport: ${testWidth}x${testHeight}px\n`);
    
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForSelector('.app-layout-window', { timeout: 5000 });
    
    // Simulate error state by setting error in app context
    await page.evaluate(() => {
      // Force error display
      const errorBanner = document.querySelector('.v2-error-banner');
      const subDisplay = document.querySelector('.app-layout-sub-display');
      
      if (!errorBanner && subDisplay) {
        // Create error banner for testing
        const errorDiv = document.createElement('div');
        errorDiv.className = 'v2-error-banner';
        const errorText = document.createElement('span');
        errorText.className = 'v2-error-banner-text';
        errorText.textContent = 'OBS NOT FOUND';
        errorDiv.appendChild(errorText);
        subDisplay.appendChild(errorDiv);
      }
    });
    
    // Check visibility of error components
    const errorAnalysis = await page.evaluate(() => {
      const errorBanner = document.querySelector('.v2-error-banner');
      const subDisplay = document.querySelector('.app-layout-sub-display');
      const display = document.querySelector('.app-layout-display');
      
      const results = {
        subDisplayFound: !!subDisplay,
        errorBannerFound: !!errorBanner,
        subDisplayBounds: null,
        errorBannerBounds: null,
        displayBounds: null
      };
      
      if (subDisplay) {
        const rect = subDisplay.getBoundingClientRect();
        results.subDisplayBounds = {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          visible: rect.height > 0
        };
      }
      
      if (errorBanner) {
        const rect = errorBanner.getBoundingClientRect();
        const styles = window.getComputedStyle(errorBanner);
        results.errorBannerBounds = {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          fontSize: styles.fontSize,
          color: styles.color
        };
      }
      
      if (display) {
        const rect = display.getBoundingClientRect();
        results.displayBounds = {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height)
        };
      }
      
      return results;
    });
    
    console.log('📊 Error Display Analysis:\n');
    console.log('Sub-Display:', errorAnalysis.subDisplayFound ? '✅ Found' : '❌ Not Found');
    if (errorAnalysis.subDisplayBounds) {
      console.log(`  Position: T:${errorAnalysis.subDisplayBounds.top} B:${errorAnalysis.subDisplayBounds.bottom}`);
      console.log(`  Height: ${errorAnalysis.subDisplayBounds.height}px`);
      console.log(`  Visible: ${errorAnalysis.subDisplayBounds.visible ? '✅' : '❌'}`);
    }
    
    console.log('\nError Banner:', errorAnalysis.errorBannerFound ? '✅ Found' : '❌ Not Found');
    if (errorAnalysis.errorBannerBounds) {
      console.log(`  Position: T:${errorAnalysis.errorBannerBounds.top} B:${errorAnalysis.errorBannerBounds.bottom}`);
      console.log(`  Height: ${errorAnalysis.errorBannerBounds.height}px`);
      console.log(`  Font Size: ${errorAnalysis.errorBannerBounds.fontSize}`);
      console.log(`  Color: ${errorAnalysis.errorBannerBounds.color}`);
    }
    
    if (errorAnalysis.displayBounds) {
      console.log('\nMain Display:');
      console.log(`  Position: T:${errorAnalysis.displayBounds.top} B:${errorAnalysis.displayBounds.bottom}`);
      console.log(`  Height: ${errorAnalysis.displayBounds.height}px`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'playwright-screenshots', 'error-display.png'),
      fullPage: false
    });
    
    console.log('\n📸 Screenshot saved to playwright-screenshots/error-display.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
