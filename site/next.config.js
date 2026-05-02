const path = require('path');
const webpack = require('webpack');

const OS_NAME = 'WebOS';
const OS_VERSION = '0.0.1-alpha';

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGES = path.resolve(ROOT_DIR, 'packages');

const webpackResolveAlias = {
  '@webos/kernel': path.resolve(PACKAGES, 'kernel/src'),
  '@webos/kernel/types': path.resolve(PACKAGES, 'kernel/src/types.ts'),
  '@webos/kernel/core': path.resolve(PACKAGES, 'kernel/src/core'),
  '@webos/ui': path.resolve(PACKAGES, 'ui/src'),
  '@webos/ui/base': path.resolve(PACKAGES, 'ui/src/base'),
  '@webos/ui/theme': path.resolve(PACKAGES, 'ui/src/theme'),
  '@webos/ui/display': path.resolve(PACKAGES, 'ui/src/display'),
  '@webos/ui/feedback': path.resolve(PACKAGES, 'ui/src/feedback'),
  '@webos/ui/input': path.resolve(PACKAGES, 'ui/src/input'),
  '@webos/ui/layout': path.resolve(PACKAGES, 'ui/src/layout'),
  '@webos/ui/navigation': path.resolve(PACKAGES, 'ui/src/navigation'),
  '@webos/ui/components': path.resolve(PACKAGES, 'ui/src/components'),
  '@webos/ui/hooks': path.resolve(PACKAGES, 'ui/src/hooks'),
  '@webos/ui/utils': path.resolve(PACKAGES, 'ui/src/utils'),
  '@webos/bootloader': path.resolve(PACKAGES, 'bootloader/src'),
  '@webos/i18n': path.resolve(PACKAGES, 'i18n/src'),
  '@webos/oobe': path.resolve(PACKAGES, 'oobe/src'),
  '@webos/recovery': path.resolve(PACKAGES, 'recovery/src'),
  '@webos/apps': path.resolve(PACKAGES, 'apps'),
  '@webos/sdk': path.resolve(PACKAGES, 'sdk/src'),
};

const turbopackResolveAlias = {
  '@webos/kernel': '../packages/kernel/src',
  '@webos/kernel/types': '../packages/kernel/src/types.ts',
  '@webos/kernel/core': '../packages/kernel/src/core',
  '@webos/ui': '../packages/ui/src',
  '@webos/ui/base': '../packages/ui/src/base',
  '@webos/ui/theme': '../packages/ui/src/theme',
  '@webos/ui/display': '../packages/ui/src/display',
  '@webos/ui/feedback': '../packages/ui/src/feedback',
  '@webos/ui/input': '../packages/ui/src/input',
  '@webos/ui/layout': '../packages/ui/src/layout',
  '@webos/ui/navigation': '../packages/ui/src/navigation',
  '@webos/ui/components': '../packages/ui/src/components',
  '@webos/ui/hooks': '../packages/ui/src/hooks',
  '@webos/ui/utils': '../packages/ui/src/utils',
  '@webos/bootloader': '../packages/bootloader/src',
  '@webos/i18n': '../packages/i18n/src',
  '@webos/oobe': '../packages/oobe/src',
  '@webos/recovery': '../packages/recovery/src',
  '@webos/apps': '../packages/apps',
  '@webos/sdk': '../packages/sdk/src',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },

  turbopack: {
    resolveAlias: turbopackResolveAlias,
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackResolveAlias,
    };

    config.plugins.push(
      new webpack.DefinePlugin({
        __OS_NAME__: JSON.stringify(OS_NAME),
        __OS_VERSION__: JSON.stringify(OS_VERSION),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      })
    );

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
