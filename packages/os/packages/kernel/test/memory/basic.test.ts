/**
 * 内存管理基本测试
 */

import { MemoryManager, ProtectionFlags } from '../../src/core/memory';

describe('内存管理测试', () => {
  let memoryManager: MemoryManager;

  beforeEach(() => {
    // 使用小内存配置进行测试
    memoryManager = new MemoryManager({
      totalFrames: 1024,    // 4MB
      reservedFrames: 64,   // 256KB
      frameSize: 4096,      // 4KB
    });
  });

  test('应该能初始化内存管理器', () => {
    const stats = memoryManager.getStats();
    
    expect(stats.totalPhysicalFrames).toBe(1024);
    expect(stats.freeFrames).toBeLessThan(1024);
    expect(stats.allocatedFrames).toBeGreaterThan(0); // 内核保留了帧
    expect(stats.kernelFrames).toBeGreaterThan(0);
    expect(stats.userFrames).toBe(0);
  });

  test('应该能为进程创建地址空间', () => {
    const space1 = memoryManager.createProcessAddressSpace(1);
    expect(space1).toBeTruthy();
    expect(space1.pid).toBe(1);
    expect(space1.regions.length).toBeGreaterThan(0);
    
    const space2 = memoryManager.createProcessAddressSpace(2);
    expect(space2).toBeTruthy();
    expect(space2.pid).toBe(2);
    
    // 不能重复创建
    expect(() => memoryManager.createProcessAddressSpace(1)).toThrow();
  });

  test('应该能分配和释放内存', () => {
    const pid = 1;
    memoryManager.createProcessAddressSpace(pid);
    
    // 分配内存
    const size = 8192; // 8KB (2页)
    const address = memoryManager.alloc(size, pid, {
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE | ProtectionFlags.USER,
    });
    
    expect(address).toBeGreaterThan(0);
    expect(address % 4096).toBe(0); // 页对齐
    
    // 分配的内存应该在进程地址空间中
    const stats = memoryManager.getStats();
    expect(stats.userFrames).toBeGreaterThanOrEqual(2); // 至少分配了2帧
    
    // 释放内存
    const freed = memoryManager.free(address!, size, pid);
    expect(freed).toBe(true);
    
    // 检查帧是否被释放
    const statsAfter = memoryManager.getStats();
    expect(statsAfter.userFrames).toBeLessThan(stats.userFrames);
  });

  test('应该能处理页错误', () => {
    const pid = 1;
    memoryManager.createProcessAddressSpace(pid);
    
    // 尝试访问未映射的地址（应该触发页错误）
    const virtualAddress = 0x400000; // 4MB处
    
    // 处理读页错误
    const readFault = memoryManager.handlePageFault(pid, virtualAddress, false, true);
    expect(readFault).toBe(true);
    
    // 处理写页错误
    const writeFault = memoryManager.handlePageFault(pid, virtualAddress + 4096, true, true);
    expect(writeFault).toBe(true);
    
    // 检查页表项是否存在
    const translated = memoryManager.translate(pid, virtualAddress);
    expect(translated).toBeGreaterThan(0);
    
    const stats = memoryManager.getStats();
    expect(stats.pageFaults).toBeGreaterThan(0);
  });

  test('应该能进行地址转换', () => {
    const pid = 1;
    memoryManager.createProcessAddressSpace(pid);
    
    // 分配内存
    const size = 4096;
    const virtualAddress = memoryManager.alloc(size, pid);
    expect(virtualAddress).toBeGreaterThan(0);
    
    // 转换为物理地址
    const physicalAddress = memoryManager.translate(pid, virtualAddress!);
    expect(physicalAddress).toBeGreaterThan(0);
    
    // 验证偏移量
    const offset = 0x123;
    const physicalWithOffset = memoryManager.translate(pid, virtualAddress! + offset);
    expect(physicalWithOffset).toBe(physicalAddress! + offset);
    
    // 未映射的地址应该返回null
    const unmapped = memoryManager.translate(pid, 0xDEADBEEF);
    expect(unmapped).toBeNull();
  });

  test('应该能获取内存统计', () => {
    const stats = memoryManager.getStats();
    
    expect(stats).toHaveProperty('totalPhysicalFrames');
    expect(stats).toHaveProperty('allocatedFrames');
    expect(stats).toHaveProperty('freeFrames');
    expect(stats).toHaveProperty('kernelFrames');
    expect(stats).toHaveProperty('userFrames');
    expect(stats).toHaveProperty('pageFaults');
    expect(stats).toHaveProperty('swaps');
    
    // 验证统计的一致性
    expect(stats.totalPhysicalFrames).toBe(1024);
    expect(stats.allocatedFrames + stats.freeFrames).toBe(stats.totalPhysicalFrames);
    expect(stats.kernelFrames + stats.userFrames).toBeLessThanOrEqual(stats.allocatedFrames);
  });

  test('应该能销毁进程地址空间', () => {
    const pid = 1;
    memoryManager.createProcessAddressSpace(pid);
    
    // 分配一些内存
    memoryManager.alloc(16384, pid); // 16KB
    memoryManager.alloc(8192, pid);  // 8KB
    
    const statsBefore = memoryManager.getStats();
    const userFramesBefore = statsBefore.userFrames;
    
    // 销毁地址空间
    const destroyed = memoryManager.destroyProcessAddressSpace(pid);
    expect(destroyed).toBe(true);
    
    // 再次销毁应该失败
    const destroyedAgain = memoryManager.destroyProcessAddressSpace(pid);
    expect(destroyedAgain).toBe(false);
    
    const statsAfter = memoryManager.getStats();
    expect(statsAfter.userFrames).toBeLessThan(userFramesBefore);
  });

  test('应该能处理内核内存分配', () => {
    const size = 4096 * 4; // 16KB (4页)
    const address = memoryManager.alloc(size, 0, {
      protection: ProtectionFlags.READ | ProtectionFlags.WRITE | ProtectionFlags.EXECUTE,
    });
    
    expect(address).toBeGreaterThan(0);
    
    const stats = memoryManager.getStats();
    expect(stats.kernelFrames).toBeGreaterThan(0);
    
    // 释放内核内存
    const freed = memoryManager.free(address!, size, 0);
    expect(freed).toBe(true);
  });

  test('应该处理分配失败', () => {
    const pid = 1;
    memoryManager.createProcessAddressSpace(pid);
    
    // 尝试分配超过可用内存的大小
    const hugeSize = 1024 * 1024 * 1024; // 1GB
    const address = memoryManager.alloc(hugeSize, pid);
    
    expect(address).toBeNull();
  });
});

// 运行测试的简单脚本
if (require.main === module) {
  console.log('运行内存管理测试...');
  
  const mm = new MemoryManager({
    totalFrames: 1024,
    reservedFrames: 64,
  });
  
  try {
    console.log('测试1: 初始化检查');
    const stats = mm.getStats();
    console.log('✓ 内存管理器初始化成功');
    console.log(`  总帧数: ${stats.totalPhysicalFrames}`);
    console.log(`  空闲帧: ${stats.freeFrames}`);
    console.log(`  已分配帧: ${stats.allocatedFrames}`);
    
    console.log('\n测试2: 进程地址空间');
    const space = mm.createProcessAddressSpace(1001);
    console.log(`✓ 创建进程地址空间 PID 1001`);
    console.log(`  区域数量: ${space.regions.length}`);
    
    console.log('\n测试3: 内存分配');
    const addr = mm.alloc(8192, 1001);
    console.log(`✓ 分配8KB内存: 0x${addr?.toString(16)}`);
    
    console.log('\n测试4: 地址转换');
    const phys = mm.translate(1001, addr!);
    console.log(`✓ 地址转换: 虚拟0x${addr?.toString(16)} -> 物理0x${phys?.toString(16)}`);
    
    console.log('\n测试5: 内存释放');
    const freed = mm.free(addr!, 8192, 1001);
    console.log(`✓ 内存释放: ${freed ? '成功' : '失败'}`);
    
    console.log('\n所有基本测试通过！');
  } catch (error: any) {
    console.error('测试失败:', error.message);
    process.exit(1);
  }
}