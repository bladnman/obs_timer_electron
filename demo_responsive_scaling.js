/**
 * Demo script to visually demonstrate the responsive scaling system
 * Opens the app at different window sizes to show proportional scaling
 */

const { chromium } = require('@playwright/test');
const { calculateHeight, ASPECT_RATIO } = require('./src/config/dimensions');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    deviceScaleFactor: 2,
  });
  
  const page = await context.newPage();
  
  console.log('🎨 Responsive Scaling Demo\n');
  console.log('This demo shows how the UI scales proportionally at different window sizes.\n');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3003', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForSelector('.AppV2', { timeout: 10000 });
    
    // Demo sizes
    const demoSizes = [
      { width: 211, name: 'Minimum (50% scale)', duration: 3000 },
      { width: 422, name: 'Default (100% scale)', duration: 3000 },
      { width: 633, name: 'Medium (150% scale)', duration: 3000 },
      { width: 844, name: 'Large (200% scale)', duration: 3000 },
      { width: 422, name: 'Back to Default', duration: 2000 }
    ];
    
    console.log('Starting demonstration...\n');
    
    for (const size of demoSizes) {
      const height = calculateHeight(size.width);
      const scaleFactor = (size.width / ASPECT_RATIO.DEFAULT_WIDTH * 100).toFixed(0);
      
      console.log(`📐 ${size.name}`);
      console.log(`   Window: ${size.width}x${height}px`);
      console.log(`   Scale: ${scaleFactor}%`);
      console.log(`   All UI elements scale proportionally\n`);
      
      await page.setViewportSize({ width: size.width, height });
      await page.waitForTimeout(size.duration);
    }
    
    // Smooth continuous resize demo
    console.log('🔄 Smooth Resize Demo');
    console.log('   Gradually resizing from minimum to maximum...\n');
    
    const startWidth = 211;
    const endWidth = 844;
    const steps = 20;
    const stepSize = (endWidth - startWidth) / steps;
    const stepDelay = 100;
    
    for (let i = 0; i <= steps; i++) {
      const currentWidth = Math.round(startWidth + (stepSize * i));
      const currentHeight = calculateHeight(currentWidth);
      await page.setViewportSize({ width: currentWidth, height: currentHeight });
      
      if (i % 5 === 0) {
        const progress = Math.round((i / steps) * 100);
        console.log(`   Progress: ${progress}% (${currentWidth}px)`);
      }
      
      await page.waitForTimeout(stepDelay);
    }
    
    console.log('\n✅ Demo Complete!');
    console.log('\nKey Features Demonstrated:');
    console.log('• All text scales proportionally with window size');
    console.log('• Icons and buttons maintain relative sizes');
    console.log('• Status bar height adjusts with content');
    console.log('• Layout maintains perfect aspect ratio');
    console.log('• Smooth transitions during resize');
    console.log('\nThe app will remain open for inspection. Close the browser when done.');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // 5 minutes
    
  } catch (error) {
    console.error('Demo failed:', error.message);
    console.log('\nMake sure the dev server is running on port 3003:');
    console.log('  npm run dev:client');
  } finally {
    await browser.close();
  }
})();