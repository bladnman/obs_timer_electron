/* src/client/utils/timeUtils.ts */

/**
 * Formats a duration in seconds into HH:MM:SS string.
 * @param totalSeconds The duration in seconds.
 * @returns The formatted time string (e.g., "01:23:45").
 */
export function formatHMS(totalSeconds: number): string {
  // Handle negative values by treating them as 0
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);

  const pad = (num: number): string => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Parses a timecode string (HH:MM:SS or HH:MM:SS.ms) into total seconds.
 * @param timecode The timecode string.
 * @returns The total duration in seconds.
 */
export function parseTimecodeToSeconds(timecode: string): number {
  if (!timecode || typeof timecode !== "string") {
    return 0;
  }
  try {
    const parts = timecode.split(".")[0]; // Remove milliseconds if present
    const [hours, minutes, seconds] = parts.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }
    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    console.error("Error parsing timecode:", timecode, error);
    return 0;
  }
}

/**
 * Gets elapsed seconds from a start time.
 * @param startTime The start time (timestamp from Date.now()).
 * @returns Elapsed seconds, or 0 if startTime is null.
 */
export function getElapsedSeconds(startTime: number | null): number {
  if (!startTime) {
    return 0;
  }
  return Math.floor((Date.now() - startTime) / 1000);
}
