//! WebOS init 进程 - 首个用户态进程
//!
//! 由 Rust 内核启动，PID 1
//! 输出 "Hello from Rust PID 1" 并创建 Shell 进程

#![no_std]
#![allow(unused)]

// 系统调用号（与内核定义一致）
mod syscall_num {
    pub const PROCESS_GETPID: u32 = 0x0205;
    pub const PROCESS_GETPPID: u32 = 0x0206;
    pub const PROCESS_FORK: u32 = 0x0200;
    pub const PROCESS_EXIT: u32 = 0x0202;
    pub const DEBUG_LOG: u32 = 0x0700;
    pub const IPC_SEND: u32 = 0x0800;
    pub const IPC_RECEIVE: u32 = 0x0801;
    pub const FS_WRITE: u32 = 0x0101;
    pub const FS_READ: u32 = 0x0100;
    pub const TIME_NOW: u32 = 0x0400;
}

// 宿主提供的系统调用入口
extern "C" {
    /// 系统调用分发 - 由宿主在实例化时注入
    fn syscall(syscall_num: u32, arg0: u32, arg1: u32, arg2: u32, arg3: u32) -> u64;
}

/// 执行系统调用
fn sys_call(num: u32, a0: u32, a1: u32, a2: u32, a3: u32) -> u64 {
    unsafe { syscall(num, a0, a1, a2, a3) }
}

/// 获取当前 PID
fn getpid() -> u32 {
    sys_call(syscall_num::PROCESS_GETPID, 0, 0, 0, 0) as u32
}

/// 获取父 PID
fn getppid() -> u32 {
    sys_call(syscall_num::PROCESS_GETPPID, 0, 0, 0, 0) as u32
}

/// Fork 当前进程
fn fork() -> u32 {
    sys_call(syscall_num::PROCESS_FORK, 0, 0, 0, 0) as u32
}

/// 退出进程
fn exit() {
    sys_call(syscall_num::PROCESS_EXIT, 0, 0, 0, 0);
}

/// 调试日志输出
fn debug_log(msg: &str) {
    let bytes = msg.as_bytes();
    sys_call(syscall_num::DEBUG_LOG, bytes.as_ptr() as u32, bytes.len() as u32, 0, 0);
}

/// init 进程入口
#[no_mangle]
pub extern "C" fn _start() {
    let pid = getpid();

    // 输出 Hello 消息
    let msg = "Hello from Rust PID 1 (init)";
    debug_log(msg);

    // 写入启动日志到文件系统
    let log_msg = "init: WebOS Rust microkernel started\n";
    let log_bytes = log_msg.as_bytes();
    let path = "/var/log/boot.log";
    let path_bytes = path.as_bytes();
    sys_call(
        syscall_num::FS_WRITE,
        path_bytes.as_ptr() as u32,
        path_bytes.len() as u32,
        log_bytes.as_ptr() as u32,
        log_bytes.len() as u32,
    );

    // 创建 Shell 进程（通过 fork）
    let child_pid = fork();
    if child_pid > 0 {
        // 父进程（init）：等待子进程
        debug_log("init: Shell process spawned");
    } else if child_pid == 0 {
        // 子进程：这里简化处理，实际上 shell 是独立的 wasm 模块
        debug_log("init: forked child process running");
    }

    // init 进程主循环：接收 IPC 消息
    loop {
        // 简单的等待循环
        // 在实际实现中，init 会监听 IPC 消息并响应
        let _time = sys_call(syscall_num::TIME_NOW, 0, 0, 0, 0);
    }
}

/// panic 处理
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
