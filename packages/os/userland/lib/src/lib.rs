//! WebOS 用户态共享库 - 系统调用接口
//!
//! 所有用户态程序通过此库与 Rust 内核通信

#![no_std]

/// 系统调用号
pub mod syscall_num {
    // 文件系统 (0x0100-0x01FF)
    pub const FS_READ: u32 = 0x0100;
    pub const FS_WRITE: u32 = 0x0101;
    pub const FS_OPEN: u32 = 0x0102;
    pub const FS_CLOSE: u32 = 0x0103;
    pub const FS_STAT: u32 = 0x0105;
    pub const FS_UNLINK: u32 = 0x0106;
    pub const FS_MKDIR: u32 = 0x0107;

    // 进程管理 (0x0200-0x02FF)
    pub const PROCESS_FORK: u32 = 0x0200;
    pub const PROCESS_EXIT: u32 = 0x0202;
    pub const PROCESS_KILL: u32 = 0x0204;
    pub const PROCESS_GETPID: u32 = 0x0205;
    pub const PROCESS_GETPPID: u32 = 0x0206;

    // 内存管理 (0x0300-0x03FF)
    pub const MEMORY_ALLOC: u32 = 0x0300;
    pub const MEMORY_FREE: u32 = 0x0301;

    // 时间 (0x0400-0x04FF)
    pub const TIME_NOW: u32 = 0x0400;

    // 调试 (0x0700-0x07FF)
    pub const DEBUG_LOG: u32 = 0x0700;

    // IPC (0x0800-0x08FF)
    pub const IPC_SEND: u32 = 0x0800;
    pub const IPC_RECEIVE: u32 = 0x0801;

    // 通知 (0x0900-0x09FF)
    pub const NOTIFY_SHOW: u32 = 0x0900;
}

// 宿主提供的系统调用入口
extern "C" {
    fn syscall(syscall_num: u32, arg0: u32, arg1: u32, arg2: u32, arg3: u32) -> u64;
}

/// 执行系统调用
#[inline]
pub fn sys_call(num: u32, a0: u32, a1: u32, a2: u32, a3: u32) -> u64 {
    unsafe { syscall(num, a0, a1, a2, a3) }
}

/// 获取当前 PID
pub fn getpid() -> u32 {
    sys_call(syscall_num::PROCESS_GETPID, 0, 0, 0, 0) as u32
}

/// 获取父 PID
pub fn getppid() -> u32 {
    sys_call(syscall_num::PROCESS_GETPPID, 0, 0, 0, 0) as u32
}

/// Fork
pub fn fork() -> u32 {
    sys_call(syscall_num::PROCESS_FORK, 0, 0, 0, 0) as u32
}

/// 退出
pub fn exit() {
    sys_call(syscall_num::PROCESS_EXIT, 0, 0, 0, 0);
}

/// 调试日志
pub fn debug_log(msg: &str) {
    let bytes = msg.as_bytes();
    sys_call(syscall_num::DEBUG_LOG, bytes.as_ptr() as u32, bytes.len() as u32, 0, 0);
}

/// 文件系统读 - 返回读取字节数
pub fn fs_read(path: &str, buf: &mut [u8]) -> i32 {
    let path_bytes = path.as_bytes();
    let result = sys_call(
        syscall_num::FS_READ,
        path_bytes.as_ptr() as u32,
        path_bytes.len() as u32,
        buf.as_ptr() as u32,
        buf.len() as u32,
    );
    // 检查错误码（高32位）
    let err = (result >> 32) as u32;
    if err != 0 {
        -(err as i32)
    } else {
        result as i32
    }
}

/// 文件系统写 - 返回写入字节数
pub fn fs_write(path: &str, data: &str) -> i32 {
    let path_bytes = path.as_bytes();
    let data_bytes = data.as_bytes();
    let result = sys_call(
        syscall_num::FS_WRITE,
        path_bytes.as_ptr() as u32,
        path_bytes.len() as u32,
        data_bytes.as_ptr() as u32,
        data_bytes.len() as u32,
    );
    let err = (result >> 32) as u32;
    if err != 0 {
        -(err as i32)
    } else {
        result as i32
    }
}

/// 创建目录
pub fn fs_mkdir(path: &str) -> bool {
    let path_bytes = path.as_bytes();
    let result = sys_call(
        syscall_num::FS_MKDIR,
        path_bytes.as_ptr() as u32,
        path_bytes.len() as u32,
        0,
        0,
    );
    (result & 0xFFFFFFFF) != 0
}

/// 删除文件
pub fn fs_unlink(path: &str) -> bool {
    let path_bytes = path.as_bytes();
    let result = sys_call(
        syscall_num::FS_UNLINK,
        path_bytes.as_ptr() as u32,
        path_bytes.len() as u32,
        0,
        0,
    );
    (result & 0xFFFFFFFF) != 0
}

/// 获取文件状态
pub fn fs_stat(path: &str, buf: &mut [u8]) -> i32 {
    let path_bytes = path.as_bytes();
    let result = sys_call(
        syscall_num::FS_STAT,
        path_bytes.as_ptr() as u32,
        path_bytes.len() as u32,
        buf.as_ptr() as u32,
        buf.len() as u32,
    );
    let err = (result >> 32) as u32;
    if err != 0 {
        -(err as i32)
    } else {
        result as i32
    }
}

/// Kill 进程
pub fn kill(pid: u32, signal: u32) -> bool {
    let result = sys_call(syscall_num::PROCESS_KILL, pid, signal, 0, 0);
    (result & 0xFFFFFFFF) != 0
}

/// 获取时间戳
pub fn time_now() -> u32 {
    sys_call(syscall_num::TIME_NOW, 0, 0, 0, 0) as u32
}

/// IPC 发送
pub fn ipc_send(dst_pid: u32, msg_type: u32, data: &[u8]) -> bool {
    let result = sys_call(
        syscall_num::IPC_SEND,
        dst_pid,
        msg_type,
        data.as_ptr() as u32,
        data.len() as u32,
    );
    (result & 0xFFFFFFFF) != 0
}

/// IPC 接收 - 返回接收字节数
pub fn ipc_receive(buf: &mut [u8]) -> u32 {
    sys_call(
        syscall_num::IPC_RECEIVE,
        buf.as_ptr() as u32,
        buf.len() as u32,
        0,
        0,
    ) as u32
}

/// 分配内存帧
pub fn memory_alloc(pages: u32) -> u32 {
    sys_call(syscall_num::MEMORY_ALLOC, pages, 0, 0, 0) as u32
}

/// 释放内存帧
pub fn memory_free(frame: u32) -> bool {
    sys_call(syscall_num::MEMORY_FREE, frame, 0, 0, 0) as u32 != 0
}

/// 显示通知
pub fn notify_show(title: &str, message: &str) {
    let title_bytes = title.as_bytes();
    let msg_bytes = message.as_bytes();
    sys_call(
        syscall_num::NOTIFY_SHOW,
        title_bytes.as_ptr() as u32,
        title_bytes.len() as u32,
        msg_bytes.as_ptr() as u32,
        msg_bytes.len() as u32,
    );
}
