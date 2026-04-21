/**
 * Dev Command - Development mode
 */

import chalk from 'chalk';

interface DevOptions {
  port?: string;
  watch?: boolean;
}

export async function devCommand(options: DevOptions) {
  console.log(chalk.blue.bold('\n🔧 WebOS SDK - Dev Mode\n'));

  const port = parseInt(options.port || '3000', 10);

  console.log(chalk.gray('Starting development server...'));
  console.log(chalk.gray('Port:'), chalk.cyan(port.toString()));
  console.log();

  console.log(chalk.yellow('⚠ Dev mode is not yet implemented.'));
  console.log(chalk.gray('For now, use:'));
  console.log(chalk.cyan('  npm run build && npm run dev'));
  console.log();
}
