//! 系统调用分发器
//!
//! 系统调用号与 JS 内核 IPC types.ts 中的 SyscallNumber 保持一致。
//! 返回值为 u64，低 32 位为返回值，高 32 位为错误码（0=成功）。

use crate::process::table;

/// 系统调用号（与 JS SyscallNumber 枚举对应）
pub mod syscall_num {
    // 文件系统调用 (0x0100-0x01FF)
    pub const FS_READ: u32 = 0x0100;
    pub const FS_WRITE: u32 = 0x0101;
    pub const FS_OPEN: u32 = 0x0102;
    pub const FS_CLOSE: u32 = 0x0103;
    pub const FS_SEEK: u32 = 0x0104;
    pub const FS_STAT: u32 = 0x0105;
    pub const FS_UNLINK: u32 = 0x0106;
    pub const FS_MKDIR: u32 = 0x0107;
    pub const FS_RMDIR: u32 = 0x0108;

    // 进程管理调用 (0x0200-0x02FF)
    pub const PROCESS_FORK: u32 = 0x0200;
    pub const PROCESS_EXEC: u32 = 0x0201;
    pub const PROCESS_EXIT: u32 = 0x0202;
    pub const PROCESS_WAIT: u32 = 0x0203;
    pub const PROCESS_KILL: u32 = 0x0204;
    pub const PROCESS_GETPID: u32 = 0x0205;
    pub const PROCESS_GETPPID: u32 = 0x0206;

    // 内存管理调用 (0x0300-0x03FF)
    pub const MEMORY_ALLOC: u32 = 0x0300;
    pub const MEMORY_FREE: u32 = 0x0301;
    pub const MEMORY_PROTECT: u32 = 0x0302;
    pub const MEMORY_MAP: u32 = 0x0303;
    pub const MEMORY_UNMAP: u32 = 0x0304;

    // 时间调用 (0x0400-0x04FF)
    pub const TIME_NOW: u32 = 0x0400;
    pub const TIME_SLEEP: u32 = 0x0401;
    pub const TIME_ALARM: u32 = 0x0402;

    // 设备I/O调用 (0x0500-0x05FF)
    pub const IO_READ: u32 = 0x0500;
    pub const IO_WRITE: u32 = 0x0501;

    // 网络调用 (0x0600-0x06FF)
    pub const NET_SOCKET: u32 = 0x0600;
    pub const NET_CONNECT: u32 = 0x0601;

    // 调试调用 (0x0700-0x07FF)
    pub const DEBUG_LOG: u32 = 0x0700;
    pub const DEBUG_BREAK: u32 = 0x0701;

    // IPC调用 (0x0800-0x08FF)
    pub const IPC_SEND: u32 = 0x0800;
    pub const IPC_RECEIVE: u32 = 0x0801;
    pub const IPC_CREATE_CHANNEL: u32 = 0x0802;

    // 通知调用 (0x0900-0x09FF)
    pub const NOTIFY_SHOW: u32 = 0x0900;
}

/// 构造成功返回值
fn ok(val: u32) -> u64 {
    val as u64 // 高 32 位为 0 = 成功
}

/// 构造错误返回值
fn err(code: u32) -> u64 {
    ((code as u64) << 32) | 1 // 高 32 位为错误码，低 32 位为 1
}

// 宿主函数声明 - 由 JS 在 WebAssembly.instantiate 时通过 import object 提供
extern "C" {
    /// 宿主日志输出
    fn host_debug_log(msg_ptr: *const u8, msg_len: usize);
    /// 宿主文件系统读 - 返回读取字节数，负数表示错误
    fn host_fs_read(path_ptr: *const u8, path_len: usize, buf_ptr: *mut u8, buf_len: usize) -> i32;
    /// 宿主文件系统写 - 返回写入字节数，负数表示错误
    fn host_fs_write(path_ptr: *const u8, path_len: usize, data_ptr: *const u8, data_len: usize) -> i32;
    /// 宿主获取时间戳
    fn host_time_now() -> u64;
    /// 宿主输出到终端
    fn host_console_write(data_ptr: *const u8, data_len: usize);
}

/// 初始化系统调用表
pub fn init() {
    // 系统调用直接在 handle() 中分发，无需额外初始化
}

/// 处理系统调用
pub fn handle(pid: u32, syscall_num: u32, arg0: u32, arg1: u32, arg2: u32, arg3: u32) -> u64 {
    match syscall_num {
        // === 进程管理 ===
        syscall_num::PROCESS_GETPID => ok(pid),

        syscall_num::PROCESS_GETPPID => {
            match table::get(pid) {
                Some(proc) => ok(proc.parent_pid),
                None => err(1),
            }
        }

        syscall_num::PROCESS_EXIT => {
            table::kill(pid, 9);
            ok(0)
        }

        syscall_num::PROCESS_FORK => {
            // 简化实现：创建同名子进程
            let child_pid = match table::get(pid) {
                Some(proc) => {
                    let name = proc.get_name();
                    table::spawn(name, pid)
                }
                None => table::spawn("forked", pid),
            };

            match child_pid {
                Some(cpid) => ok(cpid),
                None => err(1),
            }
        }

        syscall_num::PROCESS_KILL => {
            let target_pid = arg0;
            let signal = arg1;
            if table::kill(target_pid, signal) {
                ok(1)
            } else {
                err(1)
            }
        }

        // === 内存管理 ===
        syscall_num::MEMORY_ALLOC => {
            let pages = arg0 as usize;
            match crate::memory::frame_alloc::alloc_frames(pages) {
                Some(frame) => ok(frame as u32),
                None => err(1),
            }
        }

        syscall_num::MEMORY_FREE => {
            let frame_idx = arg0 as usize;
            if crate::memory::frame_alloc::free_frame(frame_idx) {
                ok(1)
            } else {
                err(1)
            }
        }

        // === 文件系统 ===
        syscall_num::FS_READ => {
            // arg0 = path_ptr, arg1 = path_len, arg2 = buf_ptr, arg3 = buf_len
            let path_ptr = arg0 as *const u8;
            let path_len = arg1 as usize;
            let buf_ptr = arg2 as *mut u8;
            let buf_len = arg3 as usize;

            if path_ptr.is_null() || buf_ptr.is_null() {
                return err(2); // EINVAL
            }

            unsafe {
                let bytes_read = host_fs_read(path_ptr, path_len, buf_ptr, buf_len);
                if bytes_read >= 0 {
                    ok(bytes_read as u32)
                } else {
                    err(bytes_read.unsigned_abs())
                }
            }
        }

        syscall_num::FS_WRITE => {
            let path_ptr = arg0 as *const u8;
            let path_len = arg1 as usize;
            let data_ptr = arg2 as *const u8;
            let data_len = arg3 as usize;

            if path_ptr.is_null() || data_ptr.is_null() {
                return err(2);
            }

            unsafe {
                let bytes_written = host_fs_write(path_ptr, path_len, data_ptr, data_len);
                if bytes_written >= 0 {
                    ok(bytes_written as u32)
                } else {
                    err(bytes_written.unsigned_abs())
                }
            }
        }

        // === 时间 ===
        syscall_num::TIME_NOW => {
            unsafe { ok(host_time_now() as u32) }
        }

        // === 调试 ===
        syscall_num::DEBUG_LOG => {
            let msg_ptr = arg0 as *const u8;
            let msg_len = arg1 as usize;

            if !msg_ptr.is_null() && msg_len > 0 && msg_len <= 4096 {
                unsafe {
                    host_debug_log(msg_ptr, msg_len);
                }
            }
            ok(0)
        }

        // === IPC ===
        syscall_num::IPC_SEND => {
            let dst_pid = arg0;
            let msg_type = arg1;
            let data_ptr = arg2 as *const u8;
            let data_len = arg3 as usize;

            if data_ptr.is_null() || data_len == 0 || data_len > 4096 {
                return err(2);
            }

            let data = unsafe { core::slice::from_raw_parts(data_ptr, data_len) };
            if crate::ipc::channel::send(pid, dst_pid, msg_type, data) {
                ok(1)
            } else {
                err(1)
            }
        }

        syscall_num::IPC_RECEIVE => {
            let buf_ptr = arg0 as *mut u8;
            let buf_len = arg1 as usize;

            if buf_ptr.is_null() || buf_len == 0 {
                return err(2);
            }

            let buf = unsafe { core::slice::from_raw_parts_mut(buf_ptr, buf_len) };
            let received = crate::ipc::channel::receive(pid, buf);
            ok(received as u32)
        }

        // 未实现的系统调用
        _ => err(0x7FFFFFFF), // ENOSYS
    }
}
