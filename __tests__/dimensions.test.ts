import { ASPECT_RATIO, calculateHeight, calculateWidth, getDefaultDimensions, getMinimumDimensions } from '../src/config/dimensions';

describe('Dimensions Configuration', () => {
  test('aspect ratio constant is 0.244', () => {
    expect(ASPECT_RATIO.HEIGHT_RATIO).toBe(0.244);
  });

  test('default width is 422px', () => {
    expect(ASPECT_RATIO.DEFAULT_WIDTH).toBe(422);
  });

  test('minimum width is 211px', () => {
    expect(ASPECT_RATIO.MIN_WIDTH).toBe(211);
  });

  test('calculateHeight returns correct height for given width', () => {
    expect(calculateHeight(422)).toBe(103); // 422 * 0.244 = 102.968 → rounds to 103
    expect(calculateHeight(600)).toBe(146); // 600 * 0.244 = 146.4 → rounds to 146
    expect(calculateHeight(211)).toBe(51);  // 211 * 0.244 = 51.484 → rounds to 51
  });

  test('calculateWidth returns correct width for given height', () => {
    expect(calculateWidth(103)).toBe(422); // 103 / 0.244 = 422.13... → rounds to 422
    expect(calculateWidth(146)).toBe(598); // 146 / 0.244 = 598.36... → rounds to 598
    expect(calculateWidth(51)).toBe(209);  // 51 / 0.244 = 209.01... → rounds to 209
  });

  test('getDefaultDimensions returns correct default dimensions', () => {
    const dims = getDefaultDimensions();
    expect(dims.width).toBe(422);
    expect(dims.height).toBe(103);
  });

  test('getMinimumDimensions returns correct minimum dimensions', () => {
    const dims = getMinimumDimensions();
    expect(dims.width).toBe(211);
    expect(dims.height).toBe(51);
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
    expect(expectedHeight).toBe(146); // This is what Playwright tests should use
  });
});