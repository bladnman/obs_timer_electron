/**
 * Type definitions for application dimension configuration.
 * Provides strong typing for TS consumers while runtime uses CommonJS JS.
 */

export declare const ASPECT_RATIO: {
  readonly HEIGHT_RATIO: number;
  readonly DEFAULT_WIDTH: number;
  readonly MIN_WIDTH: number;
};

export declare function calculateHeight(width: number): number;
export declare function calculateWidth(height: number): number;

export declare function getDefaultDimensions(): {
  width: number;
  height: number;
};

export declare function getMinimumDimensions(): {
  width: number;
  height: number;
};

