// 终端应用

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalIcon } from './icon';
import type { AppInfo } from '../../registry';

interface TerminalProps {
  windowId?: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export const Terminal: React.FC<TerminalProps> = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [isRoot, setIsRoot] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  useEffect(() => {
    // 显示欢迎信息
    setLines([
      { type: 'output', content: `${__OS_NAME__} Terminal v${__OS_VERSION__}` },
      { type: 'output', content: t('terminal.welcome') },
      { type: 'output', content: t('terminal.prompt') },
      { type: 'output', content: '' }
    ]);
  }, [t]);

  useEffect(() => {
    // 自动滚动到底部
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const getPrompt = () => {
    const user = isRoot ? 'root' : (window.webos?.user.getCurrentUser()?.username || 'user');
    const host = 'webos';
    return `${user}@${host}:${currentPath}$ `;
  };

  const resolvePath = (path: string): string => {
    if (path.startsWith('/')) return path;
    if (path === '~') return '/home/' + (window.webos?.user.getCurrentUser()?.username || 'user');
    if (path.startsWith('~/')) {
      return '/home/' + (window.webos?.user.getCurrentUser()?.username || 'user') + path.substring(1);
    }
    return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
  };

  const executeCommand = async (cmd: string) => {
    const args = cmd.trim().split(/\s+/);
    const command = args[0]?.toLowerCase();

    if (!command) return '';

    try {
      switch (command) {
        case 'help':
          return t('terminal.help');

        case 'time':
          return `${t('terminal.current.time')}: ${new Date().toLocaleString()}`;

        case 'clear':
          setLines([]);
          return '';

        case 'ls': {
          const targetPath = args[1] ? resolvePath(args[1]) : currentPath;
          const files = window.webos?.fs.list(targetPath);
          if (!files || files.length === 0) {
            return '';
          }
          return files.map(f => {
            const prefix = f.type === 'directory' ? 'd' : '-';
            const perms = f.permissions.substring(1);
            return `${prefix}${perms} ${f.owner.padEnd(8)} ${f.name}${f.type === 'directory' ? '/' : ''}`;
          }).join('\n');
        }

        case 'cat': {
          if (!args[1]) return `${t('terminal.usage')}: cat <file>`;
          const filePath = resolvePath(args[1]);
          const content = window.webos?.fs.read(filePath);
          if (content === null) {
            return t('terminal.no.such.file');
          }
          return content || '';
        }

        case 'pwd':
          return currentPath;

        case 'whoami':
          return window.webos?.user.getCurrentUser()?.username || t('terminal.unknown');

        case 'cd': {
          if (!args[1] || args[1] === '~') {
            const homePath = '/home/' + (window.webos?.user.getCurrentUser()?.username || 'user');
            setCurrentPath(homePath);
            return '';
          }
          
          let newPath: string;
          if (args[1] === '..') {
            const parts = currentPath.split('/').filter(Boolean);
            parts.pop();
            newPath = parts.length === 0 ? '/' : '/' + parts.join('/');
          } else if (args[1].startsWith('/')) {
            newPath = args[1];
          } else {
            newPath = currentPath === '/' ? `/${args[1]}` : `${currentPath}/${args[1]}`;
          }

          const node = window.webos?.fs.getNode(newPath);
          if (!node) {
            return t('terminal.no.such.file');
          }
          if (node.type !== 'directory') {
            return t('terminal.not.a.directory');
          }
          setCurrentPath(newPath);
          return '';
        }

        case 'mkdir': {
          if (!args[1]) return `${t('terminal.usage')}: mkdir <directory>`;
          const dirPath = resolvePath(args[1]);
          if (window.webos?.fs.exists(dirPath)) {
            return t('terminal.directory.exists');
          }
          const success = window.webos?.fs.mkdir(dirPath);
          return success ? '' : t('terminal.permission.denied');
        }

        case 'touch': {
          if (!args[1]) return `${t('terminal.usage')}: touch <file>`;
          const filePath = resolvePath(args[1]);
          if (window.webos?.fs.exists(filePath)) {
            return '';
          }
          const success = window.webos?.fs.write(filePath, '');
          return success ? '' : t('terminal.permission.denied');
        }

        case 'rm': {
          if (!args[1]) return `${t('terminal.usage')}: rm <path>`;
          const targetPath = resolvePath(args[1]);
          if (!window.webos?.fs.exists(targetPath)) {
            return t('terminal.no.such.file');
          }
          const success = window.webos?.fs.remove(targetPath);
          return success ? '' : t('terminal.permission.denied');
        }

        case 'echo':
          return args.slice(1).join(' ');

        case 'su': {
          if (isRoot) {
            return t('terminal.already.root');
          }
          // 在实际应用中这里需要密码验证
          // 简化版本：直接切换到 root
          const password = args[1] || '';
          if (window.webos?.user.authenticate(password)) {
            setIsRoot(true);
            return t('terminal.su.success');
          }
          return t('terminal.su.failed');
        }

        case 'exit':
          if (isRoot) {
            setIsRoot(false);
            return '';
          }
          return t('terminal.not.found').replace('{cmd}', 'exit');

        default:
          return `${t('terminal.not.found')}: ${command}`;
      }
    } catch (error) {
      return `${t('common.error')}: ${error}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentInput.trim()) return;

    // 添加输入行
    setLines(prev => [...prev, { type: 'input', content: getPrompt() + currentInput }]);

    // 执行命令
    const output = await executeCommand(currentInput);
    
    if (output || currentInput.trim().toLowerCase() !== 'clear') {
      if (currentInput.trim().toLowerCase() === 'clear') {
        // clear 命令已在 executeCommand 中处理
      } else if (output) {
        setLines(prev => [...prev, { type: 'output', content: output }]);
      }
    }

    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Consolas, Monaco, monospace',
        fontSize: '14px',
        padding: '8px',
        overflow: 'auto',
        cursor: 'text'
      }}
    >
      {lines.map((line, index) => (
        <div 
          key={index}
          style={{
            color: line.type === 'input' ? '#4ec9b0' : 
                   line.type === 'error' ? '#f14c4c' : '#d4d4d4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {line.content}
        </div>
      ))}
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: isRoot ? '#f14c4c' : '#4ec9b0' }}>
          {getPrompt()}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#d4d4d4',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: '#d4d4d4'
          }}
        />
      </div>
    </div>
  );
};

// 应用信息 - 放在组件定义之后
export const appInfo: AppInfo = {
  id: 'com.os.terminal',
  name: 'Terminal',
  nameKey: 'app.terminal',
  description: 'Command line interface',
  descriptionKey: 'app.terminal.desc',
  version: '1.0.0',
  category: 'development',
  icon: TerminalIcon,
  component: Terminal,
  defaultWidth: 700,
  defaultHeight: 450,
  minWidth: 400,
  minHeight: 300,
  resizable: true,
  singleton: false
};

export default Terminal;
