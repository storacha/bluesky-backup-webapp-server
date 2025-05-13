import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals.js'
import nextTypescript from 'eslint-config-next/typescript.js'
import * as importPlugin from 'eslint-plugin-import'

/** @import { Linter } from 'eslint' */

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

// `nextCoreWebVitals` already defines the plugin "import", and when
// `importPlugin.flatConfigs.recommended` tries to define it as well, ESLint
// doesn't like that. They're the same definition, we just need it to only
// happen once, so we strip it here.
const importRecommendedWithoutPlugin = Object.fromEntries(
  Object.entries(importPlugin.flatConfigs.recommended).filter(
    ([key]) => key !== 'plugins'
  )
)

const eslintConfig = [
  ...compat.config(nextCoreWebVitals),
  ...compat.config(nextTypescript),
  importRecommendedWithoutPlugin,
  importPlugin.flatConfigs.typescript,
  importPlugin.flatConfigs.react,
  {
    files: ['**/*.ts', '**/*.tsx', 'src/app/globalStyle.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disabled until a future PR.
      // '@typescript-eslint/no-unnecessary-condition': 'warn'
    },
  },
  {
    rules: {
      'no-useless-rename': 'warn',
      'import/first': 'warn',
      // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          named: {
            enabled: true,
            types: 'types-last',
          },
          groups: [
            // Node.js builtins
            'builtin',
            // Installed packages
            'external',
            // Absolute internal references (@/*)
            'internal',
            // Modules higher up the tree (../*)
            'parent',
            // The index module of the current directory
            'index',
            // Other modules at the same level (./*)
            'sibling',
            // Type-only imports
            'type',
          ],
        },
      ],
    },
  },
  {
    // Use `ignores` rather than `target` below, because `target` doesn't
    // support negated patterns.
    // https://github.com/import-js/eslint-plugin-import/issues/2800
    ignores: ['src/app/**/*'],
    rules: {
      'import/no-restricted-paths': [
        'warn',
        {
          zones: [
            {
              target: '.',
              from: './src/app',
              message:
                "Modules in the `app` directory should not be imported from outside it. Perhaps something is in the `app` directory which shouldn't be?",
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
