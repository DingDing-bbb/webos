#!/usr/bin/env node
import { program } from 'commander';
import { createApp } from './commands/create';
import { buildApp } from './commands/build';
import { testApp } from './commands/test';

program.name('webos-sdk').description('WebOS 软件开发工具包').version('1.0.0');

program.command('create <app-name>').description('创建一个新的 WebOS 应用').action(createApp);

program
  .command('build')
  .description('构建当前应用')
  .option('-w, --watch', '监听模式')
  .action(buildApp);

program
  .command('test')
  .description('运行测试')
  .option('--coverage', '生成覆盖率报告')
  .action(testApp);

program.parse();
