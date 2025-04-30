// @ts-check

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals.js'
import nextTypescript from 'eslint-config-next/typescript.js'

/** @import { Linter } from 'eslint' */

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/** @type {Linter.Config[]} */
const eslintConfig = [
  ...compat.config(nextCoreWebVitals),
  ...compat.config(nextTypescript),
]

export default eslintConfig
