/**
 * Build Command
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import * as esbuild from 'esbuild';

interface BuildOptions {
  config?: string;
  output?: string;
  minify?: boolean;
  sourcemap?: boolean;
}

export async function buildCommand(options: BuildOptions) {
  console.log(chalk.blue.bold('\n🔨 WebOS SDK - Build\n'));

  const configFile = path.resolve(options.config || 'appinfo.json');
  const outDir = path.resolve(options.output || 'dist');

  // 检查配置文件
  if (!await fs.pathExists(configFile)) {
    console.error(chalk.red(`Error: Config file not found: ${configFile}`));
    process.exit(1);
  }

  // 读取配置
  const appInfo = await fs.readJson(configFile);
  console.log(chalk.gray('Building:'), chalk.cyan(appInfo.name || appInfo.id));
  console.log(chalk.gray('Output:'), chalk.cyan(outDir));
  console.log();

  // 清理输出目录
  await fs.emptyDir(outDir);

  // 构建主入口
  const entryFile = appInfo.main?.replace('./dist/', './src/') || './src/index.tsx';
  const entryPath = path.resolve(entryFile);

  if (!await fs.pathExists(entryPath)) {
    console.error(chalk.red(`Error: Entry file not found: ${entryPath}`));
    process.exit(1);
  }

  try {
    // 使用 esbuild 构建
    await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      outfile: path.join(outDir, 'index.js'),
      format: 'esm',
      platform: 'browser',
      target: ['es2020', 'chrome80', 'firefox75', 'safari14'],
      jsx: 'automatic',
      minify: options.minify,
      sourcemap: options.sourcemap,
      external: ['react', 'react-dom', '@webos/sdk', '@webos/sdk/*'],
      loader: {
        '.css': 'css',
        '.json': 'json',
        '.png': 'file',
        '.jpg': 'file',
        '.svg': 'file',
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(options.minify ? 'production' : 'development'),
      },
    });

    // 构建图标
    const iconFile = appInfo.icon?.replace('./dist/', './src/') || './src/icon.tsx';
    const iconPath = path.resolve(iconFile);

    if (await fs.pathExists(iconPath)) {
      await esbuild.build({
        entryPoints: [iconPath],
        bundle: true,
        outfile: path.join(outDir, 'icon.js'),
        format: 'esm',
        platform: 'browser',
        target: ['es2020'],
        external: ['react', 'react-dom'],
      });
    }

    // 复制配置文件
    await fs.copy(configFile, path.join(outDir, 'appinfo.json'));

    // 复制 locales
    const localesDir = path.resolve('locales');
    if (await fs.pathExists(localesDir)) {
      await fs.copy(localesDir, path.join(outDir, 'locales'));
    }

    console.log(chalk.green.bold('✓ Build completed successfully!\n'));
  } catch (error) {
    console.error(chalk.red('Build failed:'), error);
    process.exit(1);
  }
}
