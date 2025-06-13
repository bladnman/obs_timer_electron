import {
  formatHMS,
  getElapsedSeconds,
  parseTimecodeToSeconds,
} from "../src/client/utils/timeUtils";

describe("timeUtils", () => {
  describe("formatHMS", () => {
    test("formats 0 seconds correctly", () => {
      expect(formatHMS(0)).toBe("00:00:00");
    });
    test("formats seconds only", () => {
      expect(formatHMS(45)).toBe("00:00:45");
    });
    test("formats minutes and seconds", () => {
      expect(formatHMS(125)).toBe("00:02:05");
    });
    test("formats hours, minutes, and seconds", () => {
      expect(formatHMS(3661)).toBe("01:01:01");
    });
    // Negative values are not explicitly handled by current formatHMS to return e.g. negative time,
    // it defaults to 00:00:00 if totalSeconds is < 0. This behavior can be confirmed.
    test("handles negative values by treating as 0 (or positive equivalent if logic changes)", () => {
      // Assuming current logic floors to 0 if negative, or Math.abs is used.
      // The provided code effectively floors negative to 0 for hours/mins/secs.
      expect(formatHMS(-10)).toBe("00:00:00");
    });
  });

  describe("parseTimecodeToSeconds", () => {
    test("parses HH:MM:SS correctly", () => {
      expect(parseTimecodeToSeconds("01:01:01")).toBe(3661);
    });
    test("parses HH:MM:SS.ms correctly (ignores ms)", () => {
      expect(parseTimecodeToSeconds("00:02:05.123")).toBe(125);
    });
    test("returns 0 for invalid timecode string", () => {
      expect(parseTimecodeToSeconds("invalid")).toBe(0);
      expect(parseTimecodeToSeconds("01:xx:01")).toBe(0);
    });
    test("returns 0 for empty or null timecode string", () => {
      expect(parseTimecodeToSeconds("")).toBe(0);
      // @ts-ignore to test runtime robustness with null/undefined
      expect(parseTimecodeToSeconds(null)).toBe(0);
      // @ts-ignore
      expect(parseTimecodeToSeconds(undefined)).toBe(0);
    });
  });

  describe("getElapsedSeconds", () => {
    let originalDateNow: () => number;
    beforeEach(() => {
      originalDateNow = Date.now;
    });
    afterEach(() => {
      Date.now = originalDateNow;
    });

    test("calculates elapsed time correctly", () => {
      const mockNow = 1670000005000; // Example: 5000ms past an epoch second
      Date.now = jest.fn(() => mockNow);
      const startTime = mockNow - 5000; // 5 seconds ago
      expect(getElapsedSeconds(startTime)).toBe(5);
    });

    test("returns 0 if startTime is null", () => {
      expect(getElapsedSeconds(null)).toBe(0);
    });

    test("handles start time of zero", () => {
      const mockNow = 5000;
      Date.now = jest.fn(() => mockNow);
      expect(getElapsedSeconds(0)).toBe(5);
    });

    test("returns negative for future start time", () => {
      const mockNow = 1670000000000;
      Date.now = jest.fn(() => mockNow);
      const futureTime = mockNow + 5000; // 5 seconds in the future
      expect(getElapsedSeconds(futureTime)).toBe(-5); // Or 0 based on implementation preference
    });
  });
});
