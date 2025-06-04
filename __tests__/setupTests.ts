import '@testing-library/jest-dom';

// Mock localStorage globally for all tests if needed, or per test file
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true), // Default to true, can be overridden in tests
  writable: true,
});


// You can add other global mocks or setup here if necessary
// For example, mocking obs-websocket-js globally if all tests need it:
// jest.mock('obs-websocket-js', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       connect: jest.fn().mockResolvedValue(undefined),
//       disconnect: jest.fn().mockResolvedValue(undefined),
//       call: jest.fn().mockResolvedValue({}),
//       on: jest.fn(),
//       off: jest.fn(),
//     };
//   });
// });
