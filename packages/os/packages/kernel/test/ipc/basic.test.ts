/**
 * 进程模型基本测试
 */

import { ProcessManager } from '../../src/core/ipc/manager';
import { SyscallHandler } from '../../src/core/ipc/syscall';
import { ProcessConfig } from '../../src/core/ipc/types';

// 模拟文件系统
const mockFileSystem = {
  read: (path: string) => {
    if (path === '/test.txt') {
      return 'Hello, World!';
    }
    return null;
  },
  write: (path: string, content: string) => {
    console.log(`[MockFS] Write to ${path}: ${content.substring(0, 50)}...`);
    return true;
  },
  exists: (path: string) => path === '/test.txt',
  stat: (path: string) => ({
    exists: path === '/test.txt',
    isFile: true,
    size: path === '/test.txt' ? 13 : 0,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  }),
  mkdir: (path: string) => {
    console.log(`[MockFS] Create directory: ${path}`);
    return true;
  },
  delete: (path: string) => {
    console.log(`[MockFS] Delete: ${path}`);
    return true;
  },
};

describe('进程模型测试', () => {
  let processManager: ProcessManager;
  let syscallHandler: SyscallHandler;

  beforeEach(() => {
    syscallHandler = new SyscallHandler({
      fileSystem: mockFileSystem,
      debugEnabled: false,
    });
    
    processManager = new ProcessManager(syscallHandler);
  });

  afterEach(() => {
    processManager.destroy();
  });

  test('应该能创建进程', () => {
    const config: ProcessConfig = {
      name: '测试进程',
      workerType: 'iframe-worker',
      priority: 5,
    };

    const result = processManager.spawn(config);
    
    expect(result.success).toBe(true);
    expect(result.pid).toBeGreaterThan(0);
    
    const processInfo = processManager.getProcessInfo(result.pid!);
    expect(processInfo).toBeTruthy();
    expect(processInfo?.name).toBe('测试进程');
  });

  test('应该能获取所有进程列表', () => {
    const config1: ProcessConfig = {
      name: '进程1',
      workerType: 'iframe-worker',
    };
    
    const config2: ProcessConfig = {
      name: '进程2',
      workerType: 'iframe-worker',
    };

    const result1 = processManager.spawn(config1);
    const result2 = processManager.spawn(config2);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    
    const processes = processManager.getAllProcesses();
    expect(processes.length).toBe(2);
    
    const pids = processes.map(p => p.pid);
    expect(pids).toContain(result1.pid);
    expect(pids).toContain(result2.pid);
  });

  test('应该能终止进程', async () => {
    const config: ProcessConfig = {
      name: '待终止进程',
      workerType: 'iframe-worker',
    };

    const result = processManager.spawn(config);
    expect(result.success).toBe(true);
    
    const killed = processManager.kill(result.pid!, 9); // SIGKILL
    expect(killed).toBe(true);
    
    // 等待进程终止
    const waitResult = await processManager.wait(result.pid!, 1000);
    expect(waitResult.success).toBe(true);
    expect(waitResult.exitCode).toBe(-9);
  });

  test('应该处理系统调用', async () => {
    // 测试文件系统调用
    const syscallHandler = processManager.getSyscallHandler();
    
    // 测试FS_READ
    const readResult = await syscallHandler.handle(0x0100, { path: '/test.txt' });
    expect(readResult.success).toBe(true);
    expect(readResult.data).toBe('Hello, World!');
    
    // 测试FS_WRITE
    const writeResult = await syscallHandler.handle(0x0101, { 
      path: '/output.txt', 
      data: 'Test data' 
    });
    expect(writeResult.success).toBe(true);
    
    // 测试FS_STAT
    const statResult = await syscallHandler.handle(0x0105, { path: '/test.txt' });
    expect(statResult.success).toBe(true);
    expect(statResult.data?.exists).toBe(true);
    expect(statResult.data?.size).toBe(13);
    
    // 测试TIME_NOW
    const timeResult = await syscallHandler.handle(0x0400, {});
    expect(timeResult.success).toBe(true);
    expect(timeResult.data?.timestamp).toBeGreaterThan(0);
    
    // 测试DEBUG_LOG
    const logResult = await syscallHandler.handle(0x0700, { message: 'Test log' });
    expect(logResult.success).toBe(true);
  });

  test('应该处理未知系统调用', async () => {
    const syscallHandler = processManager.getSyscallHandler();
    
    const result = await syscallHandler.handle(0x9999, {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown system call');
  });

  test('应该获取注册的系统调用列表', () => {
    const syscallHandler = processManager.getSyscallHandler();
    
    const syscalls = syscallHandler.getRegisteredSyscalls();
    expect(syscalls.length).toBeGreaterThan(0);
    
    // 检查是否包含基本系统调用
    const syscallNames = syscalls.map(s => s.name);
    expect(syscallNames).toContain('FS_READ');
    expect(syscallNames).toContain('FS_WRITE');
    expect(syscallNames).toContain('TIME_NOW');
    expect(syscallNames).toContain('DEBUG_LOG');
  });

  test('应该能通过IPC发送消息', () => {
    const config: ProcessConfig = {
      name: '测试IPC进程',
      workerType: 'iframe-worker',
    };

    const result = processManager.spawn(config);
    expect(result.success).toBe(true);
    
    // 注册消息处理器
    let receivedMessage = false;
    processManager.registerMessageHandler('test', (message) => {
      receivedMessage = true;
      expect(message.type).toBe('test');
      expect(message.data?.test).toBe('data');
    });
    
    // 发送消息
    const messageSent = processManager.sendMessage({
      id: 'test-msg-1',
      sourcePid: 0, // 内核
      targetPid: result.pid!,
      type: 'test',
      data: { test: 'data' },
      timestamp: Date.now(),
      priority: 5,
    });
    
    expect(messageSent).toBe(true);
    // 注意：iframe-worker需要实际的iframe才能接收消息
    // 这里只是测试发送是否成功
  });
});

// 运行测试的简单脚本
if (require.main === module) {
  console.log('运行进程模型测试...');
  
  const tests = new (require('./basic.test.ts'))();
  
  try {
    tests.test('应该能创建进程', () => {
      const config = { name: '测试', workerType: 'iframe-worker' as const };
      const result = processManager.spawn(config);
      console.log('✓ 创建进程测试通过:', result);
    });
    
    console.log('所有测试通过！');
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}