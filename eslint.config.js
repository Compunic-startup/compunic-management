import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']), // Ignore the 'dist' directory globally

  {
    files: ['**/*.{js,jsx}'], // Apply to all .js and .jsx files
    extends: [
      js.configs.recommended, // Recommended ESLint rules
      reactHooks.configs['recommended-latest'], // Recommended rules for React Hooks
      reactRefresh.configs.vite, // Rules for React Refresh (Vite specific)
    ],
    languageOptions: {
      ecmaVersion: 2020, // ECMAScript version for parsing (can be 'latest' too)
      globals: {
        ...globals.browser, // Browser global variables (window, document, etc.)
        // Add any other specific global variables your project might use here, e.g.:
        // myGlobalVar: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest', // Use the latest ECMAScript version
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
        sourceType: 'module', // Allow ES modules
      },
    },
    rules: {
      // Allow unused variables, but only if they start with an underscore or are destructuring rest
      'no-unused-vars': 'off',

      // Disable 'no-undef' for React JSX
      'no-undef': 'off',

      // Disable 'react/react-in-jsx-scope' for React 17+ with new JSX transform
      'react/react-in-jsx-scope': 'off',

      // --- NEW ADDITIONS TO DISABLE SPECIFIC RULES ---

      // Disable 'no-useless-catch' as you intentionally re-throw errors
      'no-useless-catch': 'off',

      // Disable 'no-useless-escape' if it's causing issues with strings/regex
      'no-useless-escape': 'off',

      // Optional: If you want to relax rules around console logs in development
      // 'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 'no-debugger': 'warn',
      // 'no-trailing-spaces': 'warn',
    },
  },
]);