/**
 * Application dimension configuration
 * Ensures consistent aspect ratio across all environments
 */

export const ASPECT_RATIO = {
  /** Height to width ratio (height = width * HEIGHT_RATIO) */
  HEIGHT_RATIO: 0.244,
  
  /** Default window width in pixels */
  DEFAULT_WIDTH: 422,
  
  /** Minimum window width in pixels */
  MIN_WIDTH: 211,
} as const;

/**
 * Calculate height from width using the configured aspect ratio
 */
export function calculateHeight(width: number): number {
  return Math.round(width * ASPECT_RATIO.HEIGHT_RATIO);
}

/**
 * Calculate width from height using the configured aspect ratio
 */
export function calculateWidth(height: number): number {
  return Math.round(height / ASPECT_RATIO.HEIGHT_RATIO);
}

/**
 * Get default dimensions for the application
 */
export function getDefaultDimensions() {
  return {
    width: ASPECT_RATIO.DEFAULT_WIDTH,
    height: calculateHeight(ASPECT_RATIO.DEFAULT_WIDTH),
  };
}

/**
 * Get minimum dimensions for the application
 */
export function getMinimumDimensions() {
  return {
    width: ASPECT_RATIO.MIN_WIDTH,
    height: calculateHeight(ASPECT_RATIO.MIN_WIDTH),
  };
}