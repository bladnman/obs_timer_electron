const js = require('@eslint/js');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Base JS config
  js.configs.recommended,
  
  // Global settings for all files
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  
  // Configuration for JavaScript files (e.g., Electron main, preload, old utils if any)
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser, // For renderer context if any JS files are still used there
        // Electron-specific globals
        electronAPI: 'readonly',
        // Utility globals (if still exposed globally, ideally import them)
        timeUtils: 'readonly',
        Settings: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  // Configuration for TypeScript files (React components, client-side logic)
  {
    files: ['src/client/**/*.ts', 'src/client/**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json', // Link to your tsconfig.json
      },
      globals: {
        ...globals.browser,
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'react/jsx-uses-react': 'off', // Not needed with new JSX transform
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-filename-extension': [1, { 'extensions': ['.tsx'] }],
      'react/prop-types': 'off', // Handled by TypeScript
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      // Add any specific rule overrides here
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
  
  // Configuration for Jest test files (assuming they remain .js for now or are also converted to .ts)
  {
    files: ['__tests__/**/*.js', '__tests__/**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
          languageOptions: {
        parser: tsParser,
        parserOptions: {
          project: './tsconfig.json',
        },
        globals: {
          ...globals.jest,
          ...globals.browser, // Add browser globals for DOM access in tests
        },
      },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-ignore in tests
      // Specific rules for tests if needed
    }
  },
  
  // Ignore patterns
  {
    ignores: ['node_modules/', 'dist/', '.electron/', 'vite.config.js.timestamp-*.mjs', '__tests__/__mocks__/**/*.js'],
  }
];
