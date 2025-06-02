/**
 * Unit tests for timeUtils functions
 */

const { formatHMS, getElapsedSeconds, saveTotalTime, loadTotalTime } = require('../src/utils/timeUtils');

// Mock localStorage for testing
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value.toString();
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  })
};

// Set up global localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('timeUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('formatHMS', () => {
    test('formats 0 seconds correctly', () => {
      expect(formatHMS(0)).toBe('00:00:00');
    });

    test('formats seconds only', () => {
      expect(formatHMS(45)).toBe('00:00:45');
    });

    test('formats minutes and seconds', () => {
      expect(formatHMS(125)).toBe('00:02:05'); // 2 minutes, 5 seconds
    });

    test('formats hours, minutes, and seconds', () => {
      expect(formatHMS(3661)).toBe('01:01:01'); // 1 hour, 1 minute, 1 second
    });

    test('formats large time values', () => {
      expect(formatHMS(7322)).toBe('02:02:02'); // 2 hours, 2 minutes, 2 seconds
      expect(formatHMS(36000)).toBe('10:00:00'); // 10 hours
    });

    test('handles fractional seconds by flooring', () => {
      expect(formatHMS(59.9)).toBe('00:00:59');
      expect(formatHMS(3661.7)).toBe('01:01:01');
    });

    test('handles negative values', () => {
      expect(formatHMS(-10)).toBe('00:00:00');
      expect(formatHMS(-100)).toBe('00:00:00');
    });

    test('handles invalid input types', () => {
      expect(formatHMS('invalid')).toBe('00:00:00');
      expect(formatHMS(null)).toBe('00:00:00');
      expect(formatHMS(undefined)).toBe('00:00:00');
      expect(formatHMS([])).toBe('00:00:00');
      expect(formatHMS({})).toBe('00:00:00');
    });

    test('handles edge cases', () => {
      expect(formatHMS(59)).toBe('00:00:59');
      expect(formatHMS(60)).toBe('00:01:00');
      expect(formatHMS(3599)).toBe('00:59:59');
      expect(formatHMS(3600)).toBe('01:00:00');
    });
  });

  describe('getElapsedSeconds', () => {
    test('calculates elapsed time correctly', () => {
      const now = Date.now();
      const startTime = now - 5000; // 5 seconds ago
      
      // Mock Date.now to return consistent value
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      const elapsed = getElapsedSeconds(startTime);
      expect(elapsed).toBe(5);
      
      Date.now.mockRestore();
    });

    test('returns 0 for future start time', () => {
      const now = Date.now();
      const futureTime = now + 5000; // 5 seconds in future
      
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      const elapsed = getElapsedSeconds(futureTime);
      expect(elapsed).toBe(-5);
      
      Date.now.mockRestore();
    });
  });

  describe('localStorage functions', () => {
    test('saveTotalTime stores value correctly', () => {
      saveTotalTime(3661);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('obsTotal', '3661');
      expect(localStorageMock.store.obsTotal).toBe('3661');
    });

    test('loadTotalTime retrieves stored value', () => {
      localStorageMock.store.obsTotal = '1234';
      const result = loadTotalTime();
      expect(result).toBe(1234);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('obsTotal');
    });

    test('loadTotalTime returns 0 when no value stored', () => {
      const result = loadTotalTime();
      expect(result).toBe(0);
    });

    test('loadTotalTime handles invalid stored values', () => {
      localStorageMock.store.obsTotal = 'invalid';
      const result = loadTotalTime();
      expect(result).toBe(0);
    });

    test('loadTotalTime handles empty string', () => {
      localStorageMock.store.obsTotal = '';
      const result = loadTotalTime();
      expect(result).toBe(0);
    });
  });
}); 