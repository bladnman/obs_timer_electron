module.exports = {
  testEnvironment: 'jsdom', // Use jsdom for React components
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
    '^.+\\.jsx?$': 'babel-jest', // If you have any JS files to transform (e.g. from node_modules)
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub', // Mock static assets
    '\\.(css|less|scss|sass)$': 'jest-transform-stub' // Mock CSS files
  },
  moduleNameMapper: {
    // If you use module aliases in tsconfig.json, map them here
    // '^@components/(.*)$': '<rootDir>/src/client/components/$1',
    // Mock CSS Modules if you were using them (not in this project currently)
    // '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/client/**/*.{ts,tsx}',
    '!src/client/**/*.d.ts', // Exclude type definition files
    '!src/client/main.tsx', // Usually exclude entry point
    '!src/electron/**/*', // Exclude main process files if not separately tested with Node env
    // Add other specific exclusions if needed
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'], // For @testing-library/jest-dom
  testTimeout: 10000,
  // setupFiles: ['<rootDir>/__tests__/setup.js'] // setup.js can still be used if needed, but setupTests.ts is more common for RTL
};
