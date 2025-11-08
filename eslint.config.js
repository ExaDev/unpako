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
  }
])
