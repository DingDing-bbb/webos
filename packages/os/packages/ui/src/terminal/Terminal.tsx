/**
 * 终端仿真窗口组件
 * 提供类Unix命令行界面
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Terminal.css';

// ============================================================================
// Types
// ============================================================================

export interface TerminalProps {
  /** 初始工作目录 */
  initialCwd?: string;
  /** 初始用户 */
  user?: string;
  /** 主机名 */
  hostname?: string;
  /** 终端标题 */
  title?: string;
  /** 窗口ID */
  windowId?: string;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义样式类名 */
  className?: string;
}

export interface CommandHistory {
  command: string;
  timestamp: Date;
  output: string;
  exitCode: number;
}

export interface ShellCommand {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[], cwd: string) => Promise<{
    output: string;
    exitCode: number;
    newCwd?: string;
  }>;
}

// ============================================================================
// 简单Shell解释器
// ============================================================================

class SimpleShellInterpreter {
  private commands: Map<string, ShellCommand> = new Map();
  private cwd: string = '/home/user';
  private user: string = 'user';
  private hostname: string = 'webos';

  constructor(user: string = 'user', hostname: string = 'webos') {
    this.user = user;
    this.hostname = hostname;
    this.registerBuiltinCommands();
  }

  /**
   * 注册内置命令
   */
  private registerBuiltinCommands(): void {
    this.registerCommand({
      name: 'help',
      description: '显示可用命令列表',
      usage: 'help [command]',
      handler: async (args) => {
        if (args.length > 0) {
          const cmd = this.commands.get(args[0]);
          if (cmd) {
            return {
              output: `${cmd.name} - ${cmd.description}\n用法: ${cmd.usage}`,
              exitCode: 0
            };
          }
          return {
            output: `help: 未找到命令: ${args[0]}`,
            exitCode: 1
          };
        }

        const commandsList = Array.from(this.commands.values())
          .map(cmd => `  ${cmd.name.padEnd(12)} ${cmd.description}`)
          .join('\n');
        
        return {
          output: `可用命令:\n${commandsList}\n\n输入 "help <command>" 查看具体命令帮助`,
          exitCode: 0
        };
      }
    });

    this.registerCommand({
      name: 'echo',
      description: '显示一行文本',
      usage: 'echo [text...]',
      handler: async (args) => ({
        output: args.join(' '),
        exitCode: 0
      })
    });

    this.registerCommand({
      name: 'pwd',
      description: '打印当前工作目录',
      usage: 'pwd',
      handler: async () => ({
        output: this.cwd,
        exitCode: 0
      })
    });

    this.registerCommand({
      name: 'ls',
      description: '列出目录内容',
      usage: 'ls [path]',
      handler: async (args) => {
        const path = args[0] || this.cwd;
        // 模拟文件系统
        const mockFiles = [
          'README.md',
          'Documents/',
          'Downloads/',
          'Pictures/',
          'Music/',
          'Desktop/'
        ];
        return {
          output: mockFiles.join('  '),
          exitCode: 0
        };
      }
    });

    this.registerCommand({
      name: 'clear',
      description: '清空终端屏幕',
      usage: 'clear',
      handler: async () => ({
        output: '',
        exitCode: 0
      })
    });

    this.registerCommand({
      name: 'whoami',
      description: '显示当前用户名',
      usage: 'whoami',
      handler: async () => ({
        output: this.user,
        exitCode: 0
      })
    });

    this.registerCommand({
      name: 'hostname',
      description: '显示主机名',
      usage: 'hostname',
      handler: async () => ({
        output: this.hostname,
        exitCode: 0
      })
    });

    this.registerCommand({
      name: 'date',
      description: '显示当前日期和时间',
      usage: 'date',
      handler: async () => ({
        output: new Date().toLocaleString(),
        exitCode: 0
      })
    });
  }

  /**
   * 注册命令
   */
  registerCommand(command: ShellCommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * 设置工作目录
   */
  setCwd(cwd: string): void {
    this.cwd = cwd;
  }

  /**
   * 获取当前工作目录
   */
  getCwd(): string {
    return this.cwd;
  }

  /**
   * 执行命令
   */
  async execute(commandLine: string): Promise<{
    output: string;
    exitCode: number;
    newCwd?: string;
  }> {
    if (!commandLine.trim()) {
      return {
        output: '',
        exitCode: 0
      };
    }

    const parts = commandLine.trim().split(/\s+/);
    const commandName = parts[0];
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    if (!command) {
      return {
        output: `${commandName}: 命令未找到。输入 "help" 查看可用命令。`,
        exitCode: 127
      };
    }

    try {
      const result = await command.handler(args, this.cwd);
      if (result.newCwd) {
        this.cwd = result.newCwd;
      }
      return result;
    } catch (error) {
      return {
        output: `${commandName}: 执行错误: ${error}`,
        exitCode: 1
      };
    }
  }

  /**
   * 获取命令提示符
   */
  getPrompt(): string {
    const path = this.cwd === '/home/user' ? '~' : this.cwd;
    return `${this.user}@${this.hostname}:${path}$ `;
  }
}

// ============================================================================
// Component
// ============================================================================

export const Terminal: React.FC<TerminalProps> = ({
  initialCwd = '/home/user',
  user = 'user',
  hostname = 'webos',
  title = '终端',
  windowId,
  onClose,
  className = ''
}) => {
  // ========================================
  // State
  // ========================================
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([
    `WebOS 终端 v1.0.0`,
    `输入 "help" 查看可用命令。`,
    ``
  ]);
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Shell解释器实例
  const [shell] = useState(() => new SimpleShellInterpreter(user, hostname));

  // ========================================
  // Effects
  // ========================================
  useEffect(() => {
    shell.setCwd(initialCwd);
    // 初始提示符
    addToOutput(shell.getPrompt(), false);
  }, [shell, initialCwd]);

  useEffect(() => {
    // 自动滚动到底部
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    // 聚焦输入
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ========================================
  // Helper Functions
  // ========================================
  const addToOutput = useCallback((text: string, includePrompt: boolean = true) => {
    setOutput(prev => {
      const newOutput = [...prev];
      if (includePrompt) {
        newOutput.push(`${shell.getPrompt()}${text}`);
      } else {
        newOutput.push(text);
      }
      return newOutput;
    });
  }, [shell]);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) {
      addToOutput('');
      return;
    }

    setIsProcessing(true);
    setInput('');

    // 添加到历史记录
    addToOutput(command);

    try {
      const result = await shell.execute(command);
      
      // 添加输出
      if (result.output) {
        setOutput(prev => [...prev, result.output]);
      }

      // 保存到历史记录
      setCommandHistory(prev => [...prev, {
        command,
        timestamp: new Date(),
        output: result.output,
        exitCode: result.exitCode
      }]);
    } catch (error) {
      setOutput(prev => [...prev, `执行错误: ${error}`]);
    } finally {
      setIsProcessing(false);
      // 添加新的提示符
      addToOutput('', false);
      setHistoryIndex(-1);
    }
  }, [shell, addToOutput]);

  // ========================================
  // Handlers
  // ========================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // 简单的Tab补全（未来可以增强）
      const current = input.trim();
      if (current) {
        // 这里可以添加命令补全逻辑
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
      addToOutput('', false);
    }
  };

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ========================================
  // Render
  // ========================================
  return (
    <div className={`desktop-terminal ${className}`}>
      {/* 终端标题栏 */}
      <div className="desktop-terminal-header">
        <div className="desktop-terminal-title">
          <span className="desktop-terminal-title-icon">🖥️</span>
          <span className="desktop-terminal-title-text">{title}</span>
          {windowId && (
            <span className="desktop-terminal-window-id">#{windowId}</span>
          )}
        </div>
        <div className="desktop-terminal-actions">
          <button 
            className="desktop-terminal-btn minimize"
            aria-label="最小化"
          />
          <button 
            className="desktop-terminal-btn maximize"
            aria-label="最大化"
          />
          <button 
            className="desktop-terminal-btn close"
            onClick={onClose}
            aria-label="关闭"
          />
        </div>
      </div>

      {/* 终端内容 */}
      <div 
        ref={terminalRef}
        className="desktop-terminal-content"
        onClick={handleTerminalClick}
      >
        {output.map((line, index) => (
          <div key={index} className="desktop-terminal-line">
            <span className="desktop-terminal-text">{line}</span>
          </div>
        ))}
        
        {/* 输入行 */}
        <div className="desktop-terminal-input-line">
          <span className="desktop-terminal-prompt">{shell.getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            className="desktop-terminal-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {isProcessing && (
            <span className="desktop-terminal-processing">▋</span>
          )}
        </div>
      </div>

      {/* 终端状态栏 */}
      <div className="desktop-terminal-footer">
        <div className="desktop-terminal-status">
          <span className="desktop-terminal-cwd">{shell.getCwd()}</span>
          <span className="desktop-terminal-user">@{user}</span>
        </div>
        <div className="desktop-terminal-info">
          <span className="desktop-terminal-history-count">
            历史: {commandHistory.length}
          </span>
          <span className="desktop-terminal-help-hint">
            按 Ctrl+L 清屏
          </span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;