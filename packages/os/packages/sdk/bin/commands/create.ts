/**
 * Create App Command
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

interface CreateOptions {
  name?: string;
  category?: string;
  template?: string;
  directory?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  system: 'System',
  productivity: 'Productivity',
  media: 'Media',
  games: 'Games',
  network: 'Network',
  development: 'Development',
  utilities: 'Utilities',
};

export async function createAppCommand(appId: string, options: CreateOptions) {
  console.log(chalk.blue.bold('\n🚀 WebOS SDK - Create App\n'));

  // 验证应用ID格式
  if (!/^[a-z0-9]+(\.[a-z0-9]+)+$/.test(appId)) {
    console.error(chalk.red('Error: Invalid app ID format. Use format: com.company.appname'));
    process.exit(1);
  }

  // 解析应用名称
  const name = options.name || appId.split('.').pop() || 'MyApp';
  const category = options.category || 'utilities';
  
  if (!CATEGORY_NAMES[category]) {
    console.error(chalk.red(`Error: Invalid category "${category}"`));
    console.log(chalk.gray('Valid categories:'), Object.keys(CATEGORY_NAMES).join(', '));
    process.exit(1);
  }

  // 确定目标目录
  const targetDir = options.directory || path.join(process.cwd(), name);

  console.log(chalk.gray('App ID:'), chalk.cyan(appId));
  console.log(chalk.gray('Name:'), chalk.cyan(name));
  console.log(chalk.gray('Category:'), chalk.cyan(category));
  console.log(chalk.gray('Target:'), chalk.cyan(targetDir));
  console.log();

  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    console.error(chalk.red(`Error: Directory "${targetDir}" already exists`));
    process.exit(1);
  }

  // 创建目录结构
  await fs.ensureDir(targetDir);
  await fs.ensureDir(path.join(targetDir, 'src'));
  await fs.ensureDir(path.join(targetDir, 'public'));
  await fs.ensureDir(path.join(targetDir, 'locales'));

  // 生成文件
  await generateFiles(targetDir, { appId, name, category });

  console.log(chalk.green.bold('✓ Application created successfully!\n'));
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.cyan(`  cd ${name}`));
  console.log(chalk.cyan('  npm install'));
  console.log(chalk.cyan('  npm run dev'));
  console.log();
}

async function generateFiles(targetDir: string, config: { appId: string; name: string; category: string }) {
  const { appId, name, category } = config;

  // package.json
  const packageJson = {
    name: appId,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'webos-sdk dev',
      build: 'webos-sdk build',
      pack: 'webos-sdk pack',
    },
    dependencies: {
      '@webos/sdk': '^1.0.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      typescript: '^5.3.0',
    },
  };
  await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });

  // appinfo.json
  const appInfo = {
    id: appId,
    name: name,
    version: '1.0.0',
    category: category,
    main: './dist/index.js',
    icon: './dist/icon.js',
    defaultWidth: 800,
    defaultHeight: 600,
  };
  await fs.writeJson(path.join(targetDir, 'appinfo.json'), appInfo, { spaces: 2 });

  // tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      lib: ['ES2020', 'DOM'],
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      moduleResolution: 'bundler',
      outDir: './dist',
    },
    include: ['src/**/*'],
  };
  await fs.writeJson(path.join(targetDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // src/index.tsx - 主入口
  const indexContent = `/**
 * ${name} - WebOS Application
 */

import React from 'react';
import { createApp } from '@webos/sdk';
import App from './App';
import Icon from './icon';

export default createApp({
  id: '${appId}',
  name: '${name}',
  nameKey: 'app.${appId.split('.').pop()}.name',
  version: '1.0.0',
  category: '${category}',
  icon: Icon,
  component: App,
  defaultWidth: 800,
  defaultHeight: 600,
});
`;
  await fs.writeFile(path.join(targetDir, 'src/index.tsx'), indexContent);

  // src/App.tsx - 主组件
  const appContent = `/**
 * ${name} Application
 */

import React from 'react';
import { useTranslation, useTheme } from '@webos/sdk/react';
import './styles.css';

const App: React.FC = () => {
  const t = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>${name}</h1>
        <button onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <main className="app-content">
        <p>Welcome to ${name}!</p>
        <p>Start building your application here.</p>
      </main>
    </div>
  );
};

export default App;
`;
  await fs.writeFile(path.join(targetDir, 'src/App.tsx'), appContent);

  // src/icon.tsx - 图标
  const iconContent = `/**
 * ${name} Icon
 */

import React from 'react';
import type { IconProps } from '@webos/sdk/types';

const Icon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
  </svg>
);

export default Icon;
`;
  await fs.writeFile(path.join(targetDir, 'src/icon.tsx'), iconContent);

  // src/styles.css
  const stylesContent = `.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #000);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.app-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.app-header button {
  padding: 8px 12px;
  border: none;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.app-header button:hover {
  background: var(--bg-tertiary, #e0e0e0);
}

.app-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.app-content p {
  margin: 8px 0;
}
`;
  await fs.writeFile(path.join(targetDir, 'src/styles.css'), stylesContent);

  // locales/en.json
  const enLocale = {
    [`app.${appId.split('.').pop()}.name`]: name,
    [`app.${appId.split('.').pop()}.description`]: `A ${category} application for WebOS`,
  };
  await fs.writeJson(path.join(targetDir, 'locales/en.json'), enLocale, { spaces: 2 });

  // locales/zh-CN.json
  const zhLocale = {
    [`app.${appId.split('.').pop()}.name`]: name,
    [`app.${appId.split('.').pop()}.description`]: `一个 WebOS ${category} 应用`,
  };
  await fs.writeJson(path.join(targetDir, 'locales/zh-CN.json'), zhLocale, { spaces: 2 });

  // README.md
  const readmeContent = `# ${name}

A WebOS application.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Pack

\`\`\`bash
npm run pack
\`\`\`
`;
  await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent);
}
