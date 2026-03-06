import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import * as WorkboxWebpackPlugin from 'workbox-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 系统配置 - 修改此处可全局更改系统名称
const OS_NAME = 'WebOS';
const OS_VERSION = '1.0.1';

export default (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './src/index.tsx'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[id].[contenthash].js' : '[id].js',
      clean: true,
      publicPath: '/'
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        '@kernel': path.resolve(__dirname, 'packages/kernel/src'),
        '@i18n': path.resolve(__dirname, 'packages/i18n/src'),
        '@ui': path.resolve(__dirname, 'packages/ui/src'),
        '@oobe': path.resolve(__dirname, 'packages/oobe/src'),
        '@bootloader': path.resolve(__dirname, 'packages/bootloader/src'),
        '@recovery': path.resolve(__dirname, 'packages/recovery/src'),
        '@tablet': path.resolve(__dirname, 'packages/tablet/src'),
        '@app': path.resolve(__dirname, 'packages/apps'),
        '@apps': path.resolve(__dirname, 'packages/apps')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.jsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: 'body',
        title: OS_NAME,
        favicon: './public/favicon.svg'
      }),
      new webpack.DefinePlugin({
        __OS_NAME__: JSON.stringify(OS_NAME),
        __OS_VERSION__: JSON.stringify(OS_VERSION),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __DEV__: JSON.stringify(!isProduction)  // 开发模式标识
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: '', noErrorOnMissing: true }
        ]
      }),
      ...(isProduction ? [
        new WorkboxWebpackPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          include: [/\.html$/, /\.js$/, /\.css$/],
          runtimeCaching: [
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'webos-static',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60
                }
              }
            }
          ]
        })
      ] : [])
    ],
    optimization: {
      minimizer: [
        '...',
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 5
          }
        }
      }
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: 'all',
      hot: false,
      liveReload: false,
      historyApiFallback: true,
      watchFiles: [],  // 禁用文件监视导致的刷新
      client: {
        overlay: false,  // 完全禁用 overlay，避免任何自动行为
        progress: false,
        reconnect: false  // 禁用断线重连
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
