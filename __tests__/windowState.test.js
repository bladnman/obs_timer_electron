const WindowStateManager = require('../src/utils/windowState');
const fs = require('fs');

// Mock electron modules
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp/test-config')
  },
  screen: {
    getAllDisplays: jest.fn(() => [
      {
        id: 1,
        bounds: { x: 0, y: 0, width: 1920, height: 1080 }
      },
      {
        id: 2,
        bounds: { x: 1920, y: 0, width: 1920, height: 1080 }
      }
    ]),
    getPrimaryDisplay: jest.fn(() => ({
      id: 1,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 }
    })),
    getDisplayMatching: jest.fn(() => ({
      id: 1,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 }
    }))
  }
}));

// Mock fs
jest.mock('fs');

describe('WindowStateManager', () => {
  let windowStateManager;

  beforeEach(() => {
    windowStateManager = new WindowStateManager();
    jest.clearAllMocks();
  });

  describe('isValidState', () => {
    test('should return true for valid state', () => {
      const validState = {
        width: 300,
        height: 120,
        x: 100,
        y: 100,
        isMaximized: false,
        displayId: 1
      };

      expect(windowStateManager.isValidState(validState)).toBe(true);
    });

    test('should return false for invalid dimensions', () => {
      const invalidState = {
        width: 0,
        height: 120
      };

      expect(windowStateManager.isValidState(invalidState)).toBe(false);
    });

    test('should return false for oversized dimensions', () => {
      const oversizedState = {
        width: 5000,
        height: 3000
      };

      expect(windowStateManager.isValidState(oversizedState)).toBe(false);
    });
  });

  describe('isPositionOnDisplay', () => {
    test('should return true when position is within display bounds', () => {
      const state = { x: 100, y: 100 };
      const display = {
        bounds: { x: 0, y: 0, width: 1920, height: 1080 }
      };

      expect(windowStateManager.isPositionOnDisplay(state, display)).toBe(true);
    });

    test('should return false when position is outside display bounds', () => {
      const state = { x: 2000, y: 100 };
      const display = {
        bounds: { x: 0, y: 0, width: 1920, height: 1080 }
      };

      expect(windowStateManager.isPositionOnDisplay(state, display)).toBe(false);
    });
  });

  describe('getDefaultState', () => {
    test('should return centered state on primary display', () => {
      const defaultState = windowStateManager.getDefaultState();

      expect(defaultState).toEqual({
        width: 300,
        height: 120,
        x: 810, // (1920 - 300) / 2
        y: 480, // (1080 - 120) / 2
        isMaximized: false,
        displayId: 1,
        isCurrentTimeFocused: true
      });
    });
  });

  describe('loadState', () => {
    test('should return default state when no config file exists', () => {
      fs.existsSync.mockReturnValue(false);

      const state = windowStateManager.loadState();
      const defaultState = windowStateManager.getDefaultState();

      expect(state).toEqual(defaultState);
    });

    test('should return saved state when valid config exists', () => {
      const savedState = {
        width: 400,
        height: 200,
        x: 200,
        y: 200,
        isMaximized: false,
        displayId: 1
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(savedState));

      const state = windowStateManager.loadState();

      expect(state).toEqual(savedState);
    });

    test('should return default state when saved config is invalid', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const state = windowStateManager.loadState();
      const defaultState = windowStateManager.getDefaultState();

      expect(state).toEqual(defaultState);
    });
  });

  describe('getWindowOptions', () => {
    test('should include position when valid coordinates exist', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        width: 400,
        height: 200,
        x: 200,
        y: 200,
        isMaximized: false,
        displayId: 1,
        isCurrentTimeFocused: false
      }));

      const options = windowStateManager.getWindowOptions();

      expect(options).toEqual({
        width: 400,
        height: 200,
        x: 200,
        y: 200,
        show: false
      });
    });

    test('should not include position when coordinates are undefined', () => {
      fs.existsSync.mockReturnValue(false); // Will use default state

      const options = windowStateManager.getWindowOptions();

      expect(options.x).toBeDefined();
      expect(options.y).toBeDefined();
      expect(options.show).toBe(false);
    });
  });

  describe('display mode management', () => {
    test('should return default display mode when no saved state exists', () => {
      fs.existsSync.mockReturnValue(false);

      const displayMode = windowStateManager.getDisplayMode();

      expect(displayMode).toBe(true);
    });

    test('should return saved display mode when state exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        width: 300,
        height: 120,
        x: 100,
        y: 100,
        isMaximized: false,
        displayId: 1,
        isCurrentTimeFocused: false
      }));

      const displayMode = windowStateManager.getDisplayMode();

      expect(displayMode).toBe(false);
    });

    test('should save display mode immediately', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        width: 300,
        height: 120,
        x: 100,
        y: 100,
        isMaximized: false,
        displayId: 1,
        isCurrentTimeFocused: true
      }));

      windowStateManager.saveDisplayMode(false);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        windowStateManager.configPath,
        expect.stringContaining('"isCurrentTimeFocused": false'),
        'utf8'
      );
    });

    test('should update app state when updating display mode', () => {
      windowStateManager.updateDisplayMode(false);

      expect(windowStateManager.appState.isCurrentTimeFocused).toBe(false);
    });
  });
}); 