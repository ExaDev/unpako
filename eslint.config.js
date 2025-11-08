import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import noEmojisRule from './eslint-rules/emoji-rule.js'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Use tab indentation
      'indent': ['error', 'tab'],

      // Disallow unused variables
      '@typescript-eslint/no-unused-vars': 'error',

      // Disallow underscore-prefixed variable names
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid'
        }
      ],

      // Disallow @ts-ignore comments
      '@typescript-eslint/ban-ts-comment': 'error',

      // Disallow eslint-disable comments
      'no-warning-comments': ['error', { terms: ['eslint-disable'] }]
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'packo-web': {
        rules: {
          'no-emojis': noEmojisRule
        }
      }
    },
    rules: {
      'packo-web/no-emojis': 'error'
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.unit.test.{ts,tsx}', '**/*.integration.test.{ts,tsx}', '**/*.component.test.{ts,tsx}', '**/*.e2e.test.{ts,tsx}'],
    rules: {
      // Allow eslint-disable in test files
      'no-warning-comments': 'off',

      // Allow @ts-ignore in test files
      '@typescript-eslint/ban-ts-comment': 'off',

      // Allow type coercion in test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // Allow unused variables in test files (for test setup)
      '@typescript-eslint/no-unused-vars': 'off',

      // Allow underscore-prefixed variables in test files
      '@typescript-eslint/naming-convention': 'off'
    }
  }
])
