import esbuild from 'esbuild';
import chalk from 'chalk';

export async function buildApp(options: { watch?: boolean }) {
  console.log(chalk.blue('开始构建...'));

  const buildOptions = {
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'dist/app.js',
    platform: 'browser',
    format: 'esm',
    sourcemap: true,
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
  };

  if (options.watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log(chalk.green('监听模式已启动，文件变化将自动重新构建'));
  } else {
    await esbuild.build(buildOptions);
    console.log(chalk.green('构建完成 ✅'));
  }
}
