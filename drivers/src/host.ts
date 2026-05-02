/**
 * Host Functions - Rust 内核的 WASM import object
 *
 * 这些是 Rust 内核通过 `extern "C"` 声明的宿主函数，
 * 浏览器（JS）提供实现，内核在运行时调用。
 */

interface KernelRef {
  exports: { memory: WebAssembly.Memory };
}

let kernelRef: KernelRef | null = null;

export function setKernelRef(ref: KernelRef): void {
  kernelRef = ref;
}

function readWasmString(ptr: number, len: number): string {
  if (!kernelRef) return '';
  const mem = new Uint8Array(kernelRef.exports.memory.buffer);
  return new TextDecoder().decode(mem.slice(ptr, ptr + len));
}

/** 内核调试日志 */
export function hostDebugLog(msgPtr: number, msgLen: number): void {
  console.log(`[kernel] ${readWasmString(msgPtr, msgLen)}`);
}

/** 文件系统读 */
export function hostFsRead(pathPtr: number, pathLen: number, bufPtr: number, bufLen: number): number {
  const path = readWasmString(pathPtr, pathLen);
  const fs = (window as any).webos?.fs;
  if (!fs) return -2;
  const content = fs.read(path);
  if (content === null) return -3;
  const bytes = new TextEncoder().encode(content);
  const len = Math.min(bytes.length, bufLen);
  if (!kernelRef) return -1;
  const mem = new Uint8Array(kernelRef.exports.memory.buffer);
  mem.set(bytes.slice(0, len), bufPtr);
  return len;
}

/** 文件系统写 */
export function hostFsWrite(pathPtr: number, pathLen: number, dataPtr: number, dataLen: number): number {
  const path = readWasmString(pathPtr, pathLen);
  const data = readWasmString(dataPtr, dataLen);
  const fs = (window as any).webos?.fs;
  if (!fs) return -2;
  return fs.write(path, data) ? dataLen : -3;
}

/** 获取当前时间戳（毫秒） */
export function hostTimeNow(): bigint {
  return BigInt(Date.now());
}

/** 终端输出 */
export function hostConsoleWrite(dataPtr: number, dataLen: number): void {
  console.log(`[console] ${readWasmString(dataPtr, dataLen)}`);
}
