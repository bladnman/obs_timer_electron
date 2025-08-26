const { chromium } = require('@playwright/test');
const path = require('path');
const { calculateHeight } = require('./src/config/dimensions');

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
    console.log('🔍 Layout Visibility Test\n');
    console.log(`Viewport: ${testWidth}x${testHeight}px\n`);
    
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForSelector('.app-layout-window', { timeout: 5000 });
    
    // Check viewport boundaries
    const viewportInfo = await page.evaluate(() => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      return viewport;
    });
    
    console.log('📐 Viewport Dimensions:');
    console.log(`Width: ${viewportInfo.width}px, Height: ${viewportInfo.height}px\n`);
    
    // Check visibility of each layout region
    const layoutAnalysis = await page.evaluate(() => {
      const checkVisibility = (selector, name) => {
        const el = document.querySelector(selector);
        if (!el) return { name, found: false };
        
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        
        // Check if element is within viewport
        const inViewport = 
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth;
        
        // Check if element is actually visible
        const isVisible = 
          rect.width > 0 &&
          rect.height > 0 &&
          styles.display !== 'none' &&
          styles.visibility !== 'hidden' &&
          styles.opacity !== '0';
        
        return {
          name,
          found: true,
          inViewport,
          isVisible,
          position: {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            bottom: Math.round(rect.bottom),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          styles: {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            overflow: styles.overflow
          }
        };
      };
      
      const elements = [
        // Main containers
        { selector: '.app-layout-window', name: 'Window' },
        { selector: '.app-layout-body', name: 'Body' },
        { selector: '.app-layout-status-bar', name: 'Status Bar' },
        
        // Content regions
        { selector: '.app-layout-icon', name: 'Icon Rail' },
        { selector: '.app-layout-content', name: 'Content Area' },
        { selector: '.app-layout-action', name: 'Action Rail' },
        
        // Content sub-regions
        { selector: '.app-layout-title', name: 'Title' },
        { selector: '.app-layout-display', name: 'Display' },
        { selector: '.app-layout-sub-display', name: 'Sub-Display' },
        
        // Actual content
        { selector: '.v2-mode-title', name: 'Title Text (RECORDING TIMER)' },
        { selector: '.v2-time-display', name: 'Time Display (00:00:00)' },
        { selector: '.v2-status-icon', name: 'Status Icon' },
        { selector: '.v2-action-button', name: 'Action Button' },
      ];
      
      return elements.map(el => checkVisibility(el.selector, el.name));
    });
    
    // Print visibility report
    console.log('🎯 Element Visibility Report:\n');
    console.log('Element                        | Found | Visible | In Viewport | Position');
    console.log('-------------------------------|-------|---------|-------------|----------');
    
    layoutAnalysis.forEach(el => {
      const found = el.found ? '✅' : '❌';
      const visible = el.found ? (el.isVisible ? '✅' : '❌') : '-';
      const inView = el.found ? (el.inViewport ? '✅' : '❌') : '-';
      const pos = el.found ? 
        `T:${el.position.top} B:${el.position.bottom} (H:${el.position.height})` : 
        'N/A';
      
      const name = el.name.padEnd(30);
      console.log(`${name} | ${found}    | ${visible}      | ${inView}          | ${pos}`);
    });
    
    // Calculate overflow issues
    console.log('\n📊 Overflow Analysis:\n');
    
    const overflowAnalysis = await page.evaluate(() => {
      const window = document.querySelector('.app-layout-window');
      const body = document.querySelector('.app-layout-body');
      const statusBar = document.querySelector('.app-layout-status-bar');
      const display = document.querySelector('.app-layout-display');
      
      const windowRect = window?.getBoundingClientRect();
      const bodyRect = body?.getBoundingClientRect();
      const statusRect = statusBar?.getBoundingClientRect();
      const displayRect = display?.getBoundingClientRect();
      
      return {
        windowHeight: windowRect?.height || 0,
        bodyHeight: bodyRect?.height || 0,
        statusHeight: statusRect?.height || 0,
        totalUsed: (bodyRect?.height || 0) + (statusRect?.height || 0),
        displayBottom: displayRect?.bottom || 0,
        viewportHeight: window.innerHeight
      };
    });
    
    console.log(`Window Height: ${overflowAnalysis.windowHeight}px`);
    console.log(`Body Height: ${overflowAnalysis.bodyHeight}px`);
    console.log(`Status Bar Height: ${overflowAnalysis.statusHeight}px`);
    console.log(`Total Used: ${overflowAnalysis.totalUsed}px`);
    console.log(`Viewport Height: ${overflowAnalysis.viewportHeight}px`);
    console.log(`Overflow: ${overflowAnalysis.totalUsed > overflowAnalysis.viewportHeight ? '❌ YES' : '✅ NO'}`);
    
    if (overflowAnalysis.displayBottom > overflowAnalysis.viewportHeight) {
      console.log(`\n⚠️  Display extends ${overflowAnalysis.displayBottom - overflowAnalysis.viewportHeight}px below viewport!`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'playwright-screenshots', 'layout-visibility.png'),
      fullPage: false
    });
    
    console.log('\n📸 Screenshot saved to playwright-screenshots/layout-visibility.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();