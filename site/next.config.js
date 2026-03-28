const path = require('path');
const webpack = require('webpack');

// 系统配置
const OS_NAME = 'WebOS';
const OS_VERSION = '0.0.1-alpha';

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');

// 路径别名配置 - Turbopack 和 Webpack 都使用
const resolveAlias = {
  '@kernel': path.resolve(ROOT_DIR, 'packages/os/packages/kernel/src'),
  '@kernel/*': path.resolve(ROOT_DIR, 'packages/os/packages/kernel/src/*'),
  '@i18n': path.resolve(ROOT_DIR, 'packages/os/packages/i18n/src'),
  '@i18n/*': path.resolve(ROOT_DIR, 'packages/os/packages/i18n/src/*'),
  '@ui': path.resolve(ROOT_DIR, 'packages/os/packages/ui/src'),
  '@ui/*': path.resolve(ROOT_DIR, 'packages/os/packages/ui/src/*'),
  '@oobe': path.resolve(ROOT_DIR, 'packages/os/packages/oobe/src'),
  '@oobe/*': path.resolve(ROOT_DIR, 'packages/os/packages/oobe/src/*'),
  '@bootloader': path.resolve(ROOT_DIR, 'packages/os/packages/bootloader/src'),
  '@bootloader/*': path.resolve(ROOT_DIR, 'packages/os/packages/bootloader/src/*'),
  '@recovery': path.resolve(ROOT_DIR, 'packages/os/packages/recovery/src'),
  '@recovery/*': path.resolve(ROOT_DIR, 'packages/os/packages/recovery/src/*'),
  '@tablet': path.resolve(ROOT_DIR, 'packages/os/packages/tablet/src'),
  '@tablet/*': path.resolve(ROOT_DIR, 'packages/os/packages/tablet/src/*'),
  '@app': path.resolve(ROOT_DIR, 'packages/os/packages/apps'),
  '@app/*': path.resolve(ROOT_DIR, 'packages/os/packages/apps/*'),
  '@apps': path.resolve(ROOT_DIR, 'packages/os/packages/apps'),
  '@apps/*': path.resolve(ROOT_DIR, 'packages/os/packages/apps/*'),
  // 添加 workspace 包别名
  '@webos/os': path.resolve(ROOT_DIR, 'packages/os/src'),
  '@webos/os/*': path.resolve(ROOT_DIR, 'packages/os/src/*'),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Turbopack 配置
  turbopack: {
    resolveAlias,
  },
  
  // Webpack 配置
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...resolveAlias,
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

    return config;
  },
  
  allowedDevOrigins: [
    'preview-chat-83a703b1-4689-40c0-900d-8067f6ea5e30.space.z.ai',
    'preview-chat-f71f39e6-5f0e-4eb6-94d5-8047d63f91cd.space.z.ai'
  ]
};

module.exports = nextConfig;
