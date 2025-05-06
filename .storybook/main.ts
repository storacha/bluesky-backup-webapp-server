import path from 'path'

import loadConfig from 'next/dist/server/config'
import { PHASE_DEVELOPMENT_SERVER } from 'next/dist/shared/lib/constants'
import { Configuration as WebpackConfig, IgnorePlugin } from 'webpack'

import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    {
      directory: '../src/app',
      files: '**/*.stories.*',
      titlePrefix: 'Pages',
    },
    {
      directory: '../src/components',
      files: '**/*.stories.*',
      titlePrefix: 'Components',
    },
    {
      directory: '../src/stories',
      titlePrefix: 'Other',
    },
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],

  // Support Next-Yak. Next-Yak's Next config adds a loader which translates its
  // CSS to CSS modules. Storybook doesn't handle CSS modules by default, so we
  // also need to add support for them.
  webpackFinal: async (webpackConfig) =>
    ignoreServerFunctionModules(
      await applyNextWebpackConfig(supportCssModules(webpackConfig))
    ),
}
export default config

/**
 * Add support to {@link WebpackConfig} for CSS modules. Mutates the given
 * config, but also returns it.
 */
function supportCssModules(webpackConfig: WebpackConfig) {
  webpackConfig.module ||= { rules: [] }
  webpackConfig.module.rules ||= []

  const baseCssRuleIndex = webpackConfig.module.rules.findIndex(
    (rule) =>
      rule &&
      typeof rule === 'object' &&
      rule.test instanceof RegExp &&
      rule.test.toString() === '/\\.css$/'
  )

  if (
    baseCssRuleIndex !== -1 &&
    webpackConfig.module.rules[baseCssRuleIndex] !== '...'
  ) {
    webpackConfig.module.rules[baseCssRuleIndex] = {
      test: /\.css$/,
      oneOf: [
        {
          test: /\.module\.css$/,
          use: [
            {
              loader: require.resolve('style-loader'),
              options: {
                esModule: false,
              },
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                esModule: false,
                modules: {
                  exportLocalsConvention: 'asIs',
                  mode: 'pure',
                },
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                postcssOptions: {
                  plugins: [require.resolve('postcss-nested')],
                },
              },
            },
          ],
        },
        webpackConfig.module.rules[baseCssRuleIndex],
      ],
    }
  } else {
    throw 'Failed to find existing Webpack rule for `.css` imports.'
  }
  return webpackConfig
}

/**
 * Apply the Next.js Webpack config to the given Webpack config.
 */
async function applyNextWebpackConfig(webpackConfig: WebpackConfig) {
  // Load the Next.js config
  const nextConfig = await loadConfig(
    PHASE_DEVELOPMENT_SERVER,
    path.resolve(__dirname, '..')
  )

  // Apply the Next.js Webpack config. The `webpack` function takes a context
  // object which we attempt to fake here.
  return nextConfig.webpack!(webpackConfig, {
    dir: path.resolve(__dirname, '..'),
    dev: true,
    isServer: false,
    buildId: 'development',
    totalPages: 0,
    defaultLoaders: { babel: {} },
    config: nextConfig,
    webpack: webpackConfig,
  })
}

// This is a super unsophisticated way to ignore server function modules. We
// ignore them by explicit module name and then have to conditionally import
// them while checking `process.env.STORYBOOK`. Instead, it would be way better
// to, say, have a plugin/loader look for `'use server'` in the module and stub
// them automatically, maybe using the Actions addon. But for now, this'll do.
async function ignoreServerFunctionModules(
  webpackConfig: WebpackConfig
): Promise<WebpackConfig> {
  webpackConfig.plugins ||= []

  webpackConfig.plugins.push(
    new IgnorePlugin({
      checkResource(resource) {
        return ['./createSnapshot', './backups/new/createNewBackup'].includes(
          resource
        )
      },
    })
  )

  return webpackConfig
}
