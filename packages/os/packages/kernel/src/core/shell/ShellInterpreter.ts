/**
 * Shell 解释器核心
 * 提供类Unix命令执行环境
 */

import { FileSystem } from '../../fs/src/core/FileSystem';
import { UserInfo } from '../../fs/src/types';

// ============================================================================
// Types
// ============================================================================

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  newCwd?: string;
}

export interface ShellCommand {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  execute: (
    args: string[],
    cwd: string,
    env: ShellEnvironment,
    fs: FileSystem,
    user: UserInfo
  ) => Promise<CommandResult>;
}

export interface ShellEnvironment {
  [key: string]: string;
}

export interface ShellOptions {
  fs: FileSystem;
  user: UserInfo;
  initialCwd?: string;
  hostname?: string;
}

// ============================================================================
// 内置命令实现
// ============================================================================

const builtinCommands: ShellCommand[] = [
  {
    name: 'echo',
    description: '显示一行文本',
    usage: 'echo [text...]',
    execute: async (args) => ({
      stdout: args.join(' '),
      stderr: '',
      exitCode: 0
    })
  },
  {
    name: 'pwd',
    description: '打印当前工作目录',
    usage: 'pwd',
    execute: async (_, cwd) => ({
      stdout: cwd,
      stderr: '',
      exitCode: 0
    })
  },
  {
    name: 'ls',
    description: '列出目录内容',
    usage: 'ls [path]',
    execute: async (args, cwd, env, fs) => {
      const path = args[0] || cwd;
      
      try {
        // 这里应该调用文件系统 API
        // 暂时模拟
        const mockFiles = [
          'README.md',
          'Documents/',
          'Downloads/',
          'Pictures/',
          'Music/',
          'Desktop/'
        ];
        
        return {
          stdout: mockFiles.join('  '),
          stderr: '',
          exitCode: 0
        };
      } catch (error) {
        return {
          stdout: '',
          stderr: `ls: 无法访问 '${path}': 没有那个文件或目录`,
          exitCode: 1
        };
      }
    }
  },
  {
    name: 'cd',
    description: '切换工作目录',
    usage: 'cd [directory]',
    execute: async (args, cwd, env, fs, user) => {
      const target = args[0] || '/home/' + user.username;
      const newPath = target.startsWith('/') ? target : `${cwd}/${target}`;
      
      try {
        // 检查目录是否存在
        // 暂时简单处理
        return {
          stdout: '',
          stderr: '',
          exitCode: 0,
          newCwd: newPath
        };
      } catch (error) {
        return {
          stdout: '',
          stderr: `cd: ${target}: 没有那个文件或目录`,
          exitCode: 1
        };
      }
    }
  },
  {
    name: 'cat',
    description: '连接文件并打印',
    usage: 'cat [file...]',
    execute: async (args) => {
      if (args.length === 0) {
        return {
          stdout: '',
          stderr: 'cat: 用法: cat [文件...]',
          exitCode: 1
        };
      }
      
      // 模拟文件内容
      const contents = args.map(file => `这是 ${file} 的内容。`);
      return {
        stdout: contents.join('\n'),
        stderr: '',
        exitCode: 0
      };
    }
  },
  {
    name: 'mkdir',
    description: '创建目录',
    usage: 'mkdir [目录...]',
    execute: async (args, cwd, env, fs) => {
      if (args.length === 0) {
        return {
          stdout: '',
          stderr: 'mkdir: 用法: mkdir [目录...]',
          exitCode: 1
        };
      }
      
      // 模拟创建目录
      const created = args.join(', ');
      return {
        stdout: `已创建目录: ${created}`,
        stderr: '',
        exitCode: 0
      };
    }
  },
  {
    name: 'touch',
    description: '创建空文件或更新时间戳',
    usage: 'touch [文件...]',
    execute: async (args) => {
      if (args.length === 0) {
        return {
          stdout: '',
          stderr: 'touch: 用法: touch [文件...]',
          exitCode: 1
        };
      }
      
      const created = args.join(', ');
      return {
        stdout: `已创建/更新文件: ${created}`,
        stderr: '',
        exitCode: 0
      };
    }
  },
  {
    name: 'rm',
    description: '删除文件或目录',
    usage: 'rm [文件...]',
    execute: async (args) => {
      if (args.length === 0) {
        return {
          stdout: '',
          stderr: 'rm: 用法: rm [文件...]',
          exitCode: 1
        };
      }
      
      const removed = args.join(', ');
      return {
        stdout: `已删除: ${removed}`,
        stderr: '',
        exitCode: 0
      };
    }
  },
  {
    name: 'whoami',
    description: '显示当前用户',
    usage: 'whoami',
    execute: async (args, cwd, env, fs, user) => ({
      stdout: user.username,
      stderr: '',
      exitCode: 0
    })
  },
  {
    name: 'hostname',
    description: '显示主机名',
    usage: 'hostname',
    execute: async (args, cwd, env) => ({
      stdout: env.HOSTNAME || 'webos',
      stderr: '',
      exitCode: 0
    })
  },
  {
    name: 'env',
    description: '显示环境变量',
    usage: 'env',
    execute: async (args, cwd, env) => {
      const envStr = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      return {
        stdout: envStr,
        stderr: '',
        exitCode: 0
      };
    }
  },
  {
    name: 'clear',
    description: '清空终端屏幕',
    usage: 'clear',
    execute: async () => ({
      stdout: '',
      stderr: '',
      exitCode: 0
    })
  },
  {
    name: 'help',
    description: '显示帮助信息',
    usage: 'help [命令]',
    aliases: ['?'],
    execute: async (args, cwd, env, fs, user, commands) => {
      if (args.length > 0) {
        const cmdName = args[0];
        const cmd = commands.find(c => c.name === cmdName || c.aliases?.includes(cmdName));
        
        if (cmd) {
          return {
            stdout: `${cmd.name} - ${cmd.description}\n用法: ${cmd.usage}`,
            stderr: '',
            exitCode: 0
          };
        }
        
        return {
          stdout: '',
          stderr: `help: 未找到命令: ${cmdName}`,
          exitCode: 1
        };
      }
      
      const commandsList = commands
        .map(cmd => `  ${cmd.name.padEnd(12)} ${cmd.description}`)
        .join('\n');
      
      return {
        stdout: `可用命令:\n${commandsList}\n\n输入 "help <命令>" 查看具体命令帮助`,
        stderr: '',
        exitCode: 0
      };
    }
  }
];

// ============================================================================
// Shell 解释器类
// ============================================================================

export class ShellInterpreter {
  private fs: FileSystem;
  private user: UserInfo;
  private cwd: string;
  private hostname: string;
  private commands: Map<string, ShellCommand> = new Map();
  private environment: ShellEnvironment;

  constructor(options: ShellOptions) {
    this.fs = options.fs;
    this.user = options.user;
    this.cwd = options.initialCwd || `/home/${options.user.username}`;
    this.hostname = options.hostname || 'webos';
    
    // 初始化环境变量
    this.environment = {
      USER: this.user.username,
      HOME: `/home/${this.user.username}`,
      SHELL: '/bin/sh',
      PATH: '/bin:/usr/bin:/usr/local/bin',
      PWD: this.cwd,
      HOSTNAME: this.hostname,
      TERM: 'xterm-256color'
    };
    
    this.registerBuiltinCommands();
  }

  /**
   * 注册内置命令
   */
  private registerBuiltinCommands(): void {
    for (const cmd of builtinCommands) {
      this.registerCommand(cmd);
    }
  }

  /**
   * 注册命令
   */
  registerCommand(command: ShellCommand): void {
    this.commands.set(command.name, command);
    
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.commands.set(alias, command);
      }
    }
  }

  /**
   * 设置环境变量
   */
  setEnv(key: string, value: string): void {
    this.environment[key] = value;
  }

  /**
   * 获取环境变量
   */
  getEnv(key: string): string | undefined {
    return this.environment[key];
  }

  /**
   * 获取当前工作目录
   */
  getCwd(): string {
    return this.cwd;
  }

  /**
   * 设置当前工作目录
   */
  setCwd(cwd: string): void {
    this.cwd = cwd;
    this.environment.PWD = cwd;
  }

  /**
   * 获取命令提示符
   */
  getPrompt(): string {
    const userString = this.user.isRoot ? 'root' : this.user.username;
    const hostString = this.hostname;
    const cwdString = this.cwd === `/home/${this.user.username}` ? '~' : this.cwd;
    
    return `${userString}@${hostString}:${cwdString}$ `;
  }

  /**
   * 执行命令
   */
  async execute(commandLine: string): Promise<CommandResult> {
    if (!commandLine.trim()) {
      return {
        stdout: '',
        stderr: '',
        exitCode: 0
      };
    }

    // 解析命令和参数
    const parts = this.parseCommandLine(commandLine);
    if (parts.length === 0) {
      return {
        stdout: '',
        stderr: '',
        exitCode: 0
      };
    }

    const commandName = parts[0];
    const args = parts.slice(1);

    // 查找命令
    const command = this.commands.get(commandName);
    if (!command) {
      return {
        stdout: '',
        stderr: `${commandName}: 命令未找到。输入 "help" 查看可用命令。`,
        exitCode: 127
      };
    }

    try {
      // 执行命令
      const result = await command.execute(
        args,
        this.cwd,
        this.environment,
        this.fs,
        this.user
      );
      
      // 更新工作目录
      if (result.newCwd) {
        this.setCwd(result.newCwd);
      }
      
      return result;
    } catch (error) {
      return {
        stdout: '',
        stderr: `${commandName}: 执行错误: ${error}`,
        exitCode: 1
      };
    }
  }

  /**
   * 解析命令行
   */
  private parseCommandLine(line: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' || char === "'") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (quoteChar === char) {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }
    
    return parts;
  }

  /**
   * 获取所有注册的命令
   */
  getCommands(): ShellCommand[] {
    return Array.from(this.commands.values())
      .filter((cmd, index, array) => 
        array.findIndex(c => c.name === cmd.name) === index
      );
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建默认的Shell解释器
 */
export function createDefaultShell(fs: FileSystem, user: UserInfo): ShellInterpreter {
  return new ShellInterpreter({
    fs,
    user,
    initialCwd: `/home/${user.username}`,
    hostname: 'webos'
  });
}