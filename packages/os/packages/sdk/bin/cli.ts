#!/usr/bin/env node
/**
 * WebOS SDK CLI
 *
 * 用法：
 *   webos-sdk create <app-id>    创建新应用
 *   webos-sdk build              构建应用
 *   webos-sdk dev                开发模式
 *   webos-sdk pack               打包应用
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createAppCommand } from './commands/create.js';
import { buildCommand } from './commands/build.js';
import { devCommand } from './commands/dev.js';
import { packCommand } from './commands/pack.js';

const program = new Command();

program.name('webos-sdk').description('WebOS Application Development Kit').version('1.0.0');

// 创建应用命令
program
  .command('create <app-id>')
  .description('Create a new WebOS application')
  .option('-n, --name <name>', 'Application name')
  .option('-c, --category <category>', 'Application category', 'utilities')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('-d, --directory <directory>', 'Target directory')
  .action(createAppCommand);

// 构建命令
program
  .command('build')
  .description('Build the application')
  .option('-c, --config <config>', 'Config file path', 'appinfo.json')
  .option('-o, --output <output>', 'Output directory', 'dist')
  .option('-m, --minify', 'Minify output', false)
  .option('-s, --sourcemap', 'Generate source map', false)
  .action(buildCommand);

// 开发模式命令
program
  .command('dev')
  .description('Start development mode')
  .option('-p, --port <port>', 'Dev server port', '3000')
  .option('-w, --watch', 'Watch for changes', true)
  .action(devCommand);

// 打包命令
program
  .command('pack')
  .description('Pack application for distribution')
  .option('-o, --output <output>', 'Output file', 'app.webos')
  .action(packCommand);

// 错误处理
program.exitOverride();

try {
  program.parse();
} catch (error) {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
}
