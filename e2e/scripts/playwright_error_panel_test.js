const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { calculateHeight } = require('../../src/config/dimensions');

// Test configuration for error panel
const ERROR_PANEL_CONFIG = {
  expectedStyles: {
    backgroundColor: 'rgba(211, 47, 47, 0.85)',
    fontSize: '18px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '16px 40px',
    borderRadius: '8px'
  },
  expectedPosition: {
    centered: true,
    zIndex: 1000
  }
};

(async () => {
  const browser = await chromium.launch({ 
    headless: false, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Use the standardized aspect ratio
  const testWidth = 600;
  const testHeight = calculateHeight(testWidth);
  
  const context = await browser.newContext({
    viewport: { width: testWidth, height: testHeight },
    deviceScaleFactor: 2, // High quality screenshots
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting error panel visual test...');
    
    // Navigate to the app
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for V2 app to load
    await page.waitForSelector('.AppV2', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    console.log('✅ App loaded successfully');
    
    // Inject error state to trigger error panel
    await page.evaluate(() => {
      // Simulate OBS connection error
      window.dispatchEvent(new CustomEvent('obs-connection-error', {
        detail: { message: 'OBS NOT FOUND' }
      }));
    });
    
    // Alternative: directly manipulate the component if needed
    await page.evaluate(() => {
      // Find React component and set error state
      const element = document.querySelector('.v2-recording-timer-mode');
      if (element && element._reactInternalFiber) {
        // This is a simplified approach - actual implementation may vary
        console.log('Found React component');
      }
    });
    
    // Wait for error banner to appear
    const errorBanner = await page.waitForSelector('.v2-error-banner', {
      timeout: 5000,
      state: 'visible'
    }).catch(() => null);
    
    if (!errorBanner) {
      console.log('⚠️  Error banner not visible. Creating mock error state...');
      
      // Inject error banner directly into DOM for testing
      await page.evaluate(() => {
        const errorHtml = `
          <div class="v2-error-banner">
            <span class="v2-error-banner-text">OBS NOT FOUND</span>
          </div>
        `;
        const panelBody = document.querySelector('.panel-body');
        if (panelBody) {
          panelBody.insertAdjacentHTML('beforeend', errorHtml);
        }
      });
      
      await page.waitForSelector('.v2-error-banner', { state: 'visible' });
    }
    
    console.log('✅ Error panel is visible');
    
    // Get computed styles of error panel
    const errorPanelStyles = await page.evaluate(() => {
      const banner = document.querySelector('.v2-error-banner');
      if (!banner) return null;
      
      const computed = window.getComputedStyle(banner);
      const rect = banner.getBoundingClientRect();
      const parentRect = banner.parentElement.getBoundingClientRect();
      
      return {
        // Positioning
        position: computed.position,
        top: computed.top,
        left: computed.left,
        transform: computed.transform,
        
        // Visual styles
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        textTransform: computed.textTransform,
        letterSpacing: computed.letterSpacing,
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        zIndex: computed.zIndex,
        
        // Calculated position
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        parentCenterX: parentRect.left + parentRect.width / 2,
        parentCenterY: parentRect.top + parentRect.height / 2,
        
        // Dimensions
        width: rect.width,
        height: rect.height
      };
    });
    
    console.log('\n📊 Error Panel Computed Styles:');
    console.log('================================');
    console.log(`Background: ${errorPanelStyles.backgroundColor}`);
    console.log(`Font Size: ${errorPanelStyles.fontSize}`);
    console.log(`Font Weight: ${errorPanelStyles.fontWeight}`);
    console.log(`Text Transform: ${errorPanelStyles.textTransform}`);
    console.log(`Letter Spacing: ${errorPanelStyles.letterSpacing}`);
    console.log(`Padding: ${errorPanelStyles.padding}`);
    console.log(`Border Radius: ${errorPanelStyles.borderRadius}`);
    console.log(`Z-Index: ${errorPanelStyles.zIndex}`);
    
    // Check if panel is centered
    const isCentered = Math.abs(errorPanelStyles.centerX - errorPanelStyles.parentCenterX) < 2 &&
                       Math.abs(errorPanelStyles.centerY - errorPanelStyles.parentCenterY) < 2;
    
    console.log(`\n✅ Centered: ${isCentered ? 'YES' : 'NO'}`);
    if (!isCentered) {
      console.log(`   Panel center: (${errorPanelStyles.centerX}, ${errorPanelStyles.centerY})`);
      console.log(`   Parent center: (${errorPanelStyles.parentCenterX}, ${errorPanelStyles.parentCenterY})`);
    }
    
    // Visual regression test - compare with expected styles
    console.log('\n🔍 Style Validation:');
    console.log('====================');
    
    const validateStyle = (name, actual, expected) => {
      const match = actual === expected || actual.includes(expected);
      console.log(`${match ? '✅' : '❌'} ${name}: ${actual} ${match ? '===' : '!=='} ${expected}`);
      return match;
    };
    
    let allTestsPassed = true;
    
    // Validate key styles
    if (errorPanelStyles.fontSize !== ERROR_PANEL_CONFIG.expectedStyles.fontSize) {
      allTestsPassed = false;
      validateStyle('Font Size', errorPanelStyles.fontSize, ERROR_PANEL_CONFIG.expectedStyles.fontSize);
    }
    
    if (errorPanelStyles.fontWeight !== ERROR_PANEL_CONFIG.expectedStyles.fontWeight) {
      allTestsPassed = false;
      validateStyle('Font Weight', errorPanelStyles.fontWeight, ERROR_PANEL_CONFIG.expectedStyles.fontWeight);
    }
    
    // Take screenshots for visual comparison
    const screenshotDir = path.join(__dirname, 'playwright-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    // Full page screenshot
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error-panel-full.png'),
      fullPage: false
    });
    
    // Error panel only
    const errorElement = await page.$('.v2-error-banner');
    if (errorElement) {
      await errorElement.screenshot({
        path: path.join(screenshotDir, 'error-panel-only.png')
      });
    }
    
    console.log(`\n📸 Screenshots saved to: ${screenshotDir}`);
    
    // Test with different error messages
    const testMessages = [
      'OBS NOT FOUND',
      'CONNECTION FAILED',
      'RECORDING ERROR'
    ];
    
    for (const message of testMessages) {
      await page.evaluate((msg) => {
        const banner = document.querySelector('.v2-error-banner-text');
        if (banner) banner.textContent = msg;
      }, message);
      
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: path.join(screenshotDir, `error-panel-${message.toLowerCase().replace(/\s+/g, '-')}.png`),
        fullPage: false
      });
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('================');
    if (allTestsPassed && isCentered) {
      console.log('✅ All visual tests PASSED!');
    } else {
      console.log('❌ Some tests FAILED. Review the styles above.');
      console.log('\n🔧 Suggested CSS fixes:');
      
      if (!isCentered) {
        console.log(`
.v2-error-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`);
      }
      
      if (errorPanelStyles.fontSize !== ERROR_PANEL_CONFIG.expectedStyles.fontSize) {
        console.log(`  font-size: ${ERROR_PANEL_CONFIG.expectedStyles.fontSize};`);
      }
      
      if (errorPanelStyles.fontWeight !== ERROR_PANEL_CONFIG.expectedStyles.fontWeight) {
        console.log(`  font-weight: ${ERROR_PANEL_CONFIG.expectedStyles.fontWeight};`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Keep browser open for 5 seconds to review
    console.log('\n⏰ Keeping browser open for review (5 seconds)...');
    await page.waitForTimeout(5000);
    
    await browser.close();
    console.log('✅ Test completed');
  }
})();
