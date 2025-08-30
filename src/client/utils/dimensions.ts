/**
 * ESM-friendly dimensions utilities for the React client.
 * Mirrors values and helpers from `src/config/dimensions.js` (CommonJS).
 */

export const ASPECT_RATIO = {
  /** Height to width ratio (height = width * HEIGHT_RATIO) */
  HEIGHT_RATIO: 0.244,

  /** Default window width in pixels */
  DEFAULT_WIDTH: 422,

  /** Minimum window width in pixels */
  MIN_WIDTH: 211,
} as const;

export function calculateHeight(width: number): number {
  return Math.round(width * ASPECT_RATIO.HEIGHT_RATIO);
}

export function calculateWidth(height: number): number {
  return Math.round(height / ASPECT_RATIO.HEIGHT_RATIO);
}

