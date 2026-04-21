const path = require('path');
const webpack = require('webpack');

// 系统配置
const OS_NAME = 'WebOS';
const OS_VERSION = '0.0.1-alpha';

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
const OS_DIR = path.resolve(ROOT_DIR, 'packages/os');
const OS_PACKAGES = path.resolve(OS_DIR, 'packages');

// Webpack 路径别名配置（使用绝对路径）
const webpackResolveAlias = {
  // Kernel
  '@kernel': path.resolve(OS_PACKAGES, 'kernel/src'),
  '@kernel/types': path.resolve(OS_PACKAGES, 'kernel/src/types.ts'),
  '@kernel/core': path.resolve(OS_PACKAGES, 'kernel/src/core'),

  // UI
  '@ui': path.resolve(OS_PACKAGES, 'ui/src'),
  '@ui/base': path.resolve(OS_PACKAGES, 'ui/src/base'),
  '@ui/theme': path.resolve(OS_PACKAGES, 'ui/src/theme'),
  '@ui/display': path.resolve(OS_PACKAGES, 'ui/src/display'),
  '@ui/feedback': path.resolve(OS_PACKAGES, 'ui/src/feedback'),
  '@ui/input': path.resolve(OS_PACKAGES, 'ui/src/input'),
  '@ui/layout': path.resolve(OS_PACKAGES, 'ui/src/layout'),
  '@ui/navigation': path.resolve(OS_PACKAGES, 'ui/src/navigation'),
  '@ui/components': path.resolve(OS_PACKAGES, 'ui/src/components'),
  '@ui/hooks': path.resolve(OS_PACKAGES, 'ui/src/hooks'),
  '@ui/utils': path.resolve(OS_PACKAGES, 'ui/src/utils'),
  '@webos/ui': path.resolve(OS_PACKAGES, 'ui/src'),

  // i18n
  '@i18n': path.resolve(OS_PACKAGES, 'i18n/src'),

  // OOBE
  '@oobe': path.resolve(OS_PACKAGES, 'oobe/src'),

  // Bootloader
  '@bootloader': path.resolve(OS_PACKAGES, 'bootloader/src'),

  // Recovery
  '@recovery': path.resolve(OS_PACKAGES, 'recovery/src'),

  // Tablet
  '@tablet': path.resolve(OS_PACKAGES, 'tablet/src'),

  // Apps
  '@app': path.resolve(OS_PACKAGES, 'apps'),
  '@apps': path.resolve(OS_PACKAGES, 'apps'),

  // SDK
  '@webos/sdk': path.resolve(OS_PACKAGES, 'sdk/src'),
};

// Turbopack 需要使用相对路径
const turbopackResolveAlias = {
  // Kernel
  '@kernel': '../packages/os/packages/kernel/src',
  '@kernel/types': '../packages/os/packages/kernel/src/types.ts',
  '@kernel/core': '../packages/os/packages/kernel/src/core',

  // UI
  '@ui': '../packages/os/packages/ui/src',
  '@ui/base': '../packages/os/packages/ui/src/base',
  '@ui/theme': '../packages/os/packages/ui/src/theme',
  '@ui/display': '../packages/os/packages/ui/src/display',
  '@ui/feedback': '../packages/os/packages/ui/src/feedback',
  '@ui/input': '../packages/os/packages/ui/src/input',
  '@ui/layout': '../packages/os/packages/ui/src/layout',
  '@ui/navigation': '../packages/os/packages/ui/src/navigation',
  '@ui/components': '../packages/os/packages/ui/src/components',
  '@ui/hooks': '../packages/os/packages/ui/src/hooks',
  '@ui/utils': '../packages/os/packages/ui/src/utils',
  '@webos/ui': '../packages/os/packages/ui/src',

  // i18n
  '@i18n': '../packages/os/packages/i18n/src',

  // OOBE
  '@oobe': '../packages/os/packages/oobe/src',

  // Bootloader
  '@bootloader': '../packages/os/packages/bootloader/src',

  // Recovery
  '@recovery': '../packages/os/packages/recovery/src',

  // Tablet
  '@tablet': '../packages/os/packages/tablet/src',

  // Apps
  '@app': '../packages/os/packages/apps',
  '@apps': '../packages/os/packages/apps',

  // SDK
  '@webos/sdk': '../packages/os/packages/sdk/src',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Turbopack 配置
  turbopack: {
    resolveAlias: turbopackResolveAlias,
  },

  // Webpack 配置（Next.js 生产构建使用）
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackResolveAlias,
    };

    // 定义全局变量
    config.plugins.push(
      new webpack.DefinePlugin({
        __OS_NAME__: JSON.stringify(OS_NAME),
        __OS_VERSION__: JSON.stringify(OS_VERSION),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      })
    );

    // WebAssembly 支持
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // WASM 文件处理
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // 忽略 sql.js 的 Node.js 特定导入
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

  // 输出配置
  output: 'standalone',
};

module.exports = nextConfig;
