import { spawn } from 'child_process';
import chalk from 'chalk';

export async function testApp(options: { coverage?: boolean }) {
  console.log(chalk.blue('运行测试...'));
  const args = ['test'];
  if (options.coverage) args.push('--coverage');
  const proc = spawn('bun', args, { stdio: 'inherit', shell: true, cwd: process.cwd() });
  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`测试失败，退出码: ${code}`));
      process.exit(code || 1);
    } else {
      console.log(chalk.green('测试通过 ✅'));
    }
  });
}
