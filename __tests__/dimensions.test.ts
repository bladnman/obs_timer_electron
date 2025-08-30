import { ASPECT_RATIO, calculateHeight, calculateWidth, getDefaultDimensions, getMinimumDimensions } from '../src/config/dimensions';

describe('Dimensions Configuration', () => {
  test('aspect ratio constant is 0.3', () => {
    expect(ASPECT_RATIO.HEIGHT_RATIO).toBe(0.3);
  });

  test('default width is 422px', () => {
    expect(ASPECT_RATIO.DEFAULT_WIDTH).toBe(422);
  });

  test('minimum width is 211px', () => {
    expect(ASPECT_RATIO.MIN_WIDTH).toBe(211);
  });

  test('calculateHeight returns correct height for given width', () => {
    expect(calculateHeight(422)).toBe(127); // 422 * 0.3 = 126.6 → rounds to 127
    expect(calculateHeight(600)).toBe(180); // 600 * 0.3 = 180
    expect(calculateHeight(211)).toBe(63);  // 211 * 0.3 = 63.3 → rounds to 63
  });

  test('calculateWidth returns correct width for given height', () => {
    expect(calculateWidth(127)).toBe(423); // 127 / 0.3 = 423.33... → rounds to 423
    expect(calculateWidth(180)).toBe(600); // 180 / 0.3 = 600
    expect(calculateWidth(63)).toBe(210);  // 63 / 0.3 = 210
  });

  test('getDefaultDimensions returns correct default dimensions', () => {
    const dims = getDefaultDimensions();
    expect(dims.width).toBe(422);
    expect(dims.height).toBe(127);
  });

  test('getMinimumDimensions returns correct minimum dimensions', () => {
    const dims = getMinimumDimensions();
    expect(dims.width).toBe(211);
    expect(dims.height).toBe(63);
  });

  test('aspect ratio is consistent across calculations', () => {
    // Test that calculating height then width returns close to original value
    const originalWidth = 500;
    const height = calculateHeight(originalWidth);
    const recalculatedWidth = calculateWidth(height);
    
    // Due to rounding, we allow a small difference
    expect(Math.abs(recalculatedWidth - originalWidth)).toBeLessThanOrEqual(2);
  });

  test('Playwright test dimensions match aspect ratio', () => {
    // Common test widths should produce correct heights
    const testWidth = 600;
    const expectedHeight = calculateHeight(testWidth);
    expect(expectedHeight).toBe(180); // This is what Playwright tests should use
  });
});
