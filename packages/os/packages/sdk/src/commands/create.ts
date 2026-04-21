import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createApp(appName: string) {
  console.log(chalk.green(`创建应用: ${appName}`));
  const targetDir = path.join(process.cwd(), appName);

  if (await fs.pathExists(targetDir)) {
    console.error(chalk.red(`目录 ${appName} 已存在`));
    process.exit(1);
  }

  const templateDir = path.join(__dirname, '../../templates/app');
  if (!(await fs.pathExists(templateDir))) {
    console.error(chalk.red(`模板目录不存在: ${templateDir}`));
    process.exit(1);
  }

  await fs.copy(templateDir, targetDir);
  console.log(chalk.green(`✅ 应用创建成功，请进入 ${appName} 目录并运行以下命令：`));
  console.log(chalk.cyan(`  cd ${appName}`));
  console.log(chalk.cyan(`  bun install`));
  console.log(chalk.cyan(`  webos-sdk build`));
}
