const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { calculateHeight, ASPECT_RATIO } = require('./src/config/dimensions');

/**
 * Comprehensive Playwright test suite for responsive scaling behavior
 * Tests that all UI elements scale proportionally with window size
 */
(async () => {
  const browser = await chromium.launch({ 
    headless: false, // Visual inspection during testing
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    deviceScaleFactor: 2, // High DPI testing
  });
  
  const page = await context.newPage();
  
  // Test configuration
  const TEST_SIZES = [
    { width: 211, name: 'minimum' },      // Minimum allowed size
    { width: 422, name: 'default' },      // Default size
    { width: 600, name: 'medium' },       // Medium size
    { width: 844, name: 'large' },        // Double default size
    { width: 1200, name: 'extra-large' }  // Extra large size
  ];
  
  // Create screenshots directory
  const screenshotDir = path.join(__dirname, 'playwright-screenshots', 'responsive-scaling');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  console.log('🚀 Starting Responsive Scaling Test Suite\n');
  console.log('=' .repeat(60));
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3003', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for V2 app to load
    await page.waitForSelector('.AppV2', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    console.log('✅ App loaded successfully\n');
    
    // Store measurements for comparison
    const measurements = [];
    
    // Test 1: Static Size Tests - Verify proportions at different fixed sizes
    console.log('\n📏 TEST 1: Static Size Proportions');
    console.log('-' .repeat(40));
    
    for (const testSize of TEST_SIZES) {
      const height = calculateHeight(testSize.width);
      
      // Set viewport to specific size
      await page.setViewportSize({ width: testSize.width, height });
      
      // Wait for resize to complete
      await page.waitForTimeout(300);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotDir, `${testSize.name}-${testSize.width}x${height}.png`),
        fullPage: false 
      });
      
      // Measure elements
      const baseFontSize = await page.evaluate(() => {
        const appElement = document.querySelector('.AppV2');
        return appElement ? parseFloat(window.getComputedStyle(appElement).fontSize) : null;
      });
      
      const elementSizes = await page.evaluate(() => {
        const measurements = {};
        
        // Measure time display
        const timeDisplay = document.querySelector('.v2-time-display');
        if (timeDisplay) {
          const style = window.getComputedStyle(timeDisplay);
          measurements.timeDisplayFontSize = parseFloat(style.fontSize);
        }
        
        // Measure status bar
        const statusBar = document.querySelector('.panel-status-bar');
        if (statusBar) {
          measurements.statusBarHeight = statusBar.offsetHeight;
        }
        
        // Measure status icon
        const statusIcon = document.querySelector('.v2-status-icon');
        if (statusIcon) {
          const style = window.getComputedStyle(statusIcon);
          measurements.statusIconSize = parseFloat(style.fontSize);
        }
        
        // Measure total time text
        const totalTime = document.querySelector('.v2-total-time');
        if (totalTime) {
          const style = window.getComputedStyle(totalTime);
          measurements.totalTimeFontSize = parseFloat(style.fontSize);
        }
        
        // Measure clock time
        const clockTime = document.querySelector('.v2-clock-time');
        if (clockTime) {
          const style = window.getComputedStyle(clockTime);
          measurements.clockTimeFontSize = parseFloat(style.fontSize);
        }
        
        return measurements;
      });
      
      // Calculate expected sizes (based on EM values in CSS)
      const expectedSizes = {
        baseFontSize: 16 * (testSize.width / ASPECT_RATIO.DEFAULT_WIDTH),
        timeDisplayFontSize: baseFontSize * 3,        // 3em
        statusBarHeight: baseFontSize * 2.25,         // 2.25em
        statusIconSize: baseFontSize * 1.5,           // 1.5em
        totalTimeFontSize: baseFontSize * 0.8125,     // 0.8125em
        clockTimeFontSize: baseFontSize * 0.6875      // 0.6875em
      };
      
      // Store measurements for comparison
      measurements.push({
        size: testSize,
        baseFontSize,
        actual: elementSizes,
        expected: expectedSizes
      });
      
      // Log results
      console.log(`\n📐 Size: ${testSize.name} (${testSize.width}x${height})`);
      console.log(`   Base font-size: ${baseFontSize?.toFixed(2)}px (expected: ${expectedSizes.baseFontSize.toFixed(2)}px)`);
      console.log(`   Time display: ${elementSizes.timeDisplayFontSize?.toFixed(2)}px`);
      console.log(`   Status bar height: ${elementSizes.statusBarHeight}px`);
      console.log(`   Scale factor: ${(testSize.width / ASPECT_RATIO.DEFAULT_WIDTH).toFixed(2)}x`);
      
      // Verify proportions are maintained
      const tolerance = 2; // 2px tolerance for rounding
      if (baseFontSize) {
        const fontSizeDiff = Math.abs(baseFontSize - expectedSizes.baseFontSize);
        if (fontSizeDiff <= tolerance) {
          console.log(`   ✅ Base font size is correct`);
        } else {
          console.log(`   ⚠️  Base font size differs by ${fontSizeDiff.toFixed(2)}px`);
        }
      }
    }
    
    // Test 2: Dynamic Resize Test - Verify smooth transitions
    console.log('\n\n🔄 TEST 2: Dynamic Resize Behavior');
    console.log('-' .repeat(40));
    
    const startWidth = 422;
    const endWidth = 844;
    const steps = 5;
    const stepSize = (endWidth - startWidth) / steps;
    
    console.log(`Resizing from ${startWidth}px to ${endWidth}px in ${steps} steps...`);
    
    for (let i = 0; i <= steps; i++) {
      const currentWidth = Math.round(startWidth + (stepSize * i));
      const currentHeight = calculateHeight(currentWidth);
      
      await page.setViewportSize({ width: currentWidth, height: currentHeight });
      await page.waitForTimeout(200); // Allow transition to complete
      
      // Check for smooth transition
      const transitionStyle = await page.evaluate(() => {
        const appElement = document.querySelector('.AppV2');
        return appElement ? window.getComputedStyle(appElement).transition : null;
      });
      
      if (i === 0) {
        console.log(`   Transition style: ${transitionStyle || 'none'}`);
      }
      
      // Take screenshot of transition state
      if (i === Math.floor(steps / 2)) {
        await page.screenshot({ 
          path: path.join(screenshotDir, `transition-midpoint-${currentWidth}.png`),
          fullPage: false 
        });
      }
    }
    
    console.log(`   ✅ Dynamic resize completed`);
    
    // Test 3: Overflow and Clipping Test
    console.log('\n\n📦 TEST 3: Overflow and Clipping Check');
    console.log('-' .repeat(40));
    
    for (const testSize of TEST_SIZES) {
      const height = calculateHeight(testSize.width);
      await page.setViewportSize({ width: testSize.width, height });
      await page.waitForTimeout(200);
      
      const overflowCheck = await page.evaluate(() => {
        const checks = {
          hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
          hasVerticalScroll: document.body.scrollHeight > window.innerHeight,
          textOverflow: false,
          elementClipping: false
        };
        
        // Check for text overflow
        const allTextElements = document.querySelectorAll('.v2-time-display, .v2-total-time, .v2-clock-time, .element-top-label');
        allTextElements.forEach(element => {
          if (element.scrollWidth > element.clientWidth) {
            checks.textOverflow = true;
          }
        });
        
        // Check if any element is clipped
        const panelBody = document.querySelector('.panel-body');
        if (panelBody) {
          const bodyRect = panelBody.getBoundingClientRect();
          const children = panelBody.querySelectorAll('*');
          children.forEach(child => {
            const childRect = child.getBoundingClientRect();
            if (childRect.right > bodyRect.right || childRect.bottom > bodyRect.bottom) {
              checks.elementClipping = true;
            }
          });
        }
        
        return checks;
      });
      
      console.log(`\n   ${testSize.name} (${testSize.width}px):`);
      console.log(`   Horizontal scroll: ${overflowCheck.hasHorizontalScroll ? '❌ Yes' : '✅ No'}`);
      console.log(`   Vertical scroll: ${overflowCheck.hasVerticalScroll ? '❌ Yes' : '✅ No'}`);
      console.log(`   Text overflow: ${overflowCheck.textOverflow ? '❌ Yes' : '✅ No'}`);
      console.log(`   Element clipping: ${overflowCheck.elementClipping ? '❌ Yes' : '✅ No'}`);
    }
    
    // Test 4: Aspect Ratio Maintenance
    console.log('\n\n📐 TEST 4: Aspect Ratio Maintenance');
    console.log('-' .repeat(40));
    
    for (const testSize of TEST_SIZES) {
      const expectedHeight = calculateHeight(testSize.width);
      await page.setViewportSize({ width: testSize.width, height: expectedHeight });
      await page.waitForTimeout(200);
      
      const actualDimensions = await page.evaluate(() => {
        const app = document.querySelector('.AppV2');
        return app ? {
          width: app.offsetWidth,
          height: app.offsetHeight
        } : null;
      });
      
      if (actualDimensions) {
        const actualRatio = actualDimensions.height / actualDimensions.width;
        const expectedRatio = ASPECT_RATIO.HEIGHT_RATIO;
        const ratioDiff = Math.abs(actualRatio - expectedRatio);
        
        console.log(`\n   ${testSize.name} (${testSize.width}px):`);
        console.log(`   Expected ratio: ${expectedRatio.toFixed(4)}`);
        console.log(`   Actual ratio: ${actualRatio.toFixed(4)}`);
        console.log(`   Difference: ${ratioDiff.toFixed(4)}`);
        console.log(`   ${ratioDiff < 0.001 ? '✅ Ratio maintained' : '⚠️  Ratio differs'}`);
      }
    }
    
    // Test 5: Icon Scaling Test
    console.log('\n\n🎨 TEST 5: Icon and Button Scaling');
    console.log('-' .repeat(40));
    
    for (const testSize of [TEST_SIZES[0], TEST_SIZES[1], TEST_SIZES[3]]) {
      const height = calculateHeight(testSize.width);
      await page.setViewportSize({ width: testSize.width, height });
      await page.waitForTimeout(200);
      
      const iconMeasurements = await page.evaluate(() => {
        const measurements = {};
        
        // Measure action button (reload icon)
        const actionButton = document.querySelector('.v2-action-button');
        if (actionButton) {
          const svg = actionButton.querySelector('svg');
          if (svg) {
            const rect = svg.getBoundingClientRect();
            measurements.actionButtonSize = { width: rect.width, height: rect.height };
          }
        }
        
        // Measure settings button (gear icon)
        const settingsButton = document.querySelector('.v2-settings-button');
        if (settingsButton) {
          const svg = settingsButton.querySelector('svg');
          if (svg) {
            const rect = svg.getBoundingClientRect();
            measurements.settingsButtonSize = { width: rect.width, height: rect.height };
          }
        }
        
        return measurements;
      });
      
      console.log(`\n   ${testSize.name} (${testSize.width}px):`);
      if (iconMeasurements.actionButtonSize) {
        console.log(`   Action button: ${iconMeasurements.actionButtonSize.width.toFixed(1)}x${iconMeasurements.actionButtonSize.height.toFixed(1)}px`);
      }
      if (iconMeasurements.settingsButtonSize) {
        console.log(`   Settings button: ${iconMeasurements.settingsButtonSize.width.toFixed(1)}x${iconMeasurements.settingsButtonSize.height.toFixed(1)}px`);
      }
    }
    
    // Test 6: Error Banner Scaling
    console.log('\n\n⚠️  TEST 6: Error Banner Scaling');
    console.log('-' .repeat(40));
    
    // Simulate error state to show error banner
    await page.evaluate(() => {
      // Create a mock error banner for testing
      const errorBanner = document.createElement('div');
      errorBanner.className = 'v2-error-banner';
      errorBanner.innerHTML = '<span class="v2-error-banner-text">OBS NOT FOUND</span>';
      const panelBody = document.querySelector('.panel-body');
      if (panelBody) {
        panelBody.appendChild(errorBanner);
      }
    });
    
    for (const testSize of [TEST_SIZES[0], TEST_SIZES[1], TEST_SIZES[3]]) {
      const height = calculateHeight(testSize.width);
      await page.setViewportSize({ width: testSize.width, height });
      await page.waitForTimeout(200);
      
      const errorBannerMeasurements = await page.evaluate(() => {
        const banner = document.querySelector('.v2-error-banner');
        if (banner) {
          const style = window.getComputedStyle(banner);
          const rect = banner.getBoundingClientRect();
          return {
            fontSize: parseFloat(style.fontSize),
            width: rect.width,
            height: rect.height,
            padding: style.padding
          };
        }
        return null;
      });
      
      if (errorBannerMeasurements) {
        console.log(`\n   ${testSize.name} (${testSize.width}px):`);
        console.log(`   Font size: ${errorBannerMeasurements.fontSize.toFixed(1)}px`);
        console.log(`   Banner size: ${errorBannerMeasurements.width.toFixed(1)}x${errorBannerMeasurements.height.toFixed(1)}px`);
        console.log(`   Padding: ${errorBannerMeasurements.padding}`);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotDir, `error-banner-${testSize.name}.png`),
        fullPage: false 
      });
    }
    
    // Clean up test error banner
    await page.evaluate(() => {
      const banner = document.querySelector('.v2-error-banner');
      if (banner) banner.remove();
    });
    
    // Final Summary
    console.log('\n\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Analyze measurements for summary
    measurements.forEach(m => {
      totalTests++;
      const fontSizeDiff = Math.abs(m.baseFontSize - m.expected.baseFontSize);
      if (fontSizeDiff <= 2) passedTests++;
    });
    
    console.log(`\n✅ Passed: ${passedTests}/${totalTests} size scaling tests`);
    console.log(`📸 Screenshots saved to: ${screenshotDir}`);
    console.log(`\n🎉 Responsive scaling test suite completed!`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();