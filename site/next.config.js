const path = require('path');
const webpack = require('webpack');

const OS_NAME = 'WebOS';
const OS_VERSION = '0.1.0';
const ROOT = path.resolve(__dirname, '..');

const webpackAlias = {
  '@webos/kernel': path.resolve(ROOT, 'kernel/bridge'),
  '@webos/kernel/types': path.resolve(ROOT, 'kernel/bridge/types.ts'),
  '@webos/kernel/core': path.resolve(ROOT, 'kernel/bridge/core'),
  '@webos/drivers': path.resolve(ROOT, 'drivers/src'),
  '@webos/ui': path.resolve(ROOT, 'ui/src'),
  '@webos/ui/base': path.resolve(ROOT, 'ui/src/base'),
  '@webos/ui/theme': path.resolve(ROOT, 'ui/src/theme'),
  '@webos/ui/display': path.resolve(ROOT, 'ui/src/display'),
  '@webos/ui/feedback': path.resolve(ROOT, 'ui/src/feedback'),
  '@webos/ui/input': path.resolve(ROOT, 'ui/src/input'),
  '@webos/ui/layout': path.resolve(ROOT, 'ui/src/layout'),
  '@webos/ui/navigation': path.resolve(ROOT, 'ui/src/navigation'),
  '@webos/ui/components': path.resolve(ROOT, 'ui/src/components'),
  '@webos/ui/hooks': path.resolve(ROOT, 'ui/src/hooks'),
  '@webos/ui/utils': path.resolve(ROOT, 'ui/src/utils'),
  '@webos/apps': path.resolve(ROOT, 'apps'),
  '@webos/i18n': path.resolve(ROOT, 'i18n/src'),
  '@webos/oobe': path.resolve(ROOT, 'oobe/src'),
  '@webos/recovery': path.resolve(ROOT, 'recovery/src'),
};

const turbopackAlias = {};
for (const [k, v] of Object.entries(webpackAlias)) {
  turbopackAlias[k] = path.relative(path.resolve(__dirname), v).replace(/\\/g, '/');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },

  turbopack: { resolveAlias: turbopackAlias },

  webpack: (config, { isServer }) => {
    config.resolve.alias = { ...config.resolve.alias, ...webpackAlias };

    config.plugins.push(
      new webpack.DefinePlugin({
        __OS_NAME__: JSON.stringify(OS_NAME),
        __OS_VERSION__: JSON.stringify(OS_VERSION),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      })
    );

    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.module.rules.push({ test: /\.wasm$/, type: 'asset/resource' });

    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false };
    }

    return config;
  },
};

module.exports = nextConfig;
