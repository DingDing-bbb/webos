/**
 * Pack Command - Package application for distribution
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

interface PackOptions {
  output?: string;
}

export async function packCommand(options: PackOptions) {
  console.log(chalk.blue.bold('\n📦 WebOS SDK - Pack\n'));

  const distDir = path.resolve('dist');
  const outputFile = path.resolve(options.output || 'app.webos');

  // 检查 dist 目录
  if (!(await fs.pathExists(distDir))) {
    console.error(chalk.red('Error: dist directory not found. Run "build" first.'));
    process.exit(1);
  }

  // 检查必要文件
  const requiredFiles = ['appinfo.json', 'index.js'];
  for (const file of requiredFiles) {
    if (!(await fs.pathExists(path.join(distDir, file)))) {
      console.error(chalk.red(`Error: Missing required file: ${file}`));
      process.exit(1);
    }
  }

  try {
    // 读取 appinfo
    const appInfo = await fs.readJson(path.join(distDir, 'appinfo.json'));
    console.log(chalk.gray('Packing:'), chalk.cyan(appInfo.name));
    console.log(chalk.gray('Version:'), chalk.cyan(appInfo.version));
    console.log(chalk.gray('Output:'), chalk.cyan(outputFile));
    console.log();

    // 创建打包清单
    const manifest = {
      version: '1.0',
      app: appInfo,
      files: [] as string[],
      createdAt: new Date().toISOString(),
    };

    // 列出所有文件
    const files = await getAllFiles(distDir);
    manifest.files = files.map((f) => path.relative(distDir, f));

    // 写入清单
    await fs.writeJson(path.join(distDir, 'manifest.json'), manifest, { spaces: 2 });

    // 在实际实现中，这里应该创建 .webos 包文件
    // 目前只是复制 dist 目录
    const packDir = outputFile.replace('.webos', '');
    await fs.copy(distDir, packDir);

    console.log(chalk.green.bold('✓ Package created successfully!\n'));
    console.log(chalk.gray('Package directory:'), chalk.cyan(packDir));
    console.log();
  } catch (error) {
    console.error(chalk.red('Pack failed:'), error);
    process.exit(1);
  }
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}
