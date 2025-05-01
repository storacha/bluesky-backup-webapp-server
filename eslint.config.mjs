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

const eslintConfig = [
  ...compat.config(nextCoreWebVitals),
  ...compat.config(nextTypescript),
  {
    plugins: { importPlugin },
    rules: {
      // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
      'importPlugin/order': [
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
]

export default eslintConfig
