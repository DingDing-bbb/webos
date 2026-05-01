//! WebOS Microkernel - Rust + WebAssembly
//!
//! 微内核架构，在浏览器中运行。内核维护：
//! - 进程表：每个进程对应一个 wasm 模块实例（含独立内存）
//! - 物理内存分配器：位图分配
//! - 两级页表：4KB 页，32位地址空间
//! - 系统调用表：通过宿主导入函数分派
//! - 简单的轮转调度器

#![no_std]

extern crate wee_alloc;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod process;
mod memory;
mod pagetable;
mod scheduler;
mod syscall;
mod ipc;
mod bridge;

// 内核全局状态
use core::sync::atomic::{AtomicBool, AtomicU32, Ordering};

static KERNEL_INITIALIZED: AtomicBool = AtomicBool::new(false);
static CURRENT_PID: AtomicU32 = AtomicU32::new(0);
static TICK_COUNT: AtomicU32 = AtomicU32::new(0);

/// 内核初始化入口 - 由 JS Bootloader 调用
#[no_mangle]
pub extern "C" fn kernel_init() -> u32 {
    if KERNEL_INITIALIZED.swap(true, Ordering::SeqCst) {
        return 1; // 已初始化
    }

    // 初始化物理内存分配器
    memory::frame_alloc::init();

    // 初始化进程表
    process::table::init();

    // 初始化系统调用表
    syscall::dispatch::init();

    // 初始化 IPC 子系统
    ipc::channel::init();

    // 初始化调度器
    scheduler::round_robin::init();

    // 启动调度器
    scheduler::round_robin::start();

    0 // 成功
}

/// 调度器 tick - 由宿主定时器驱动
#[no_mangle]
pub extern "C" fn kernel_tick() {
    TICK_COUNT.fetch_add(1, Ordering::Relaxed);
    scheduler::round_robin::tick();
}

/// 创建用户进程 - 返回 PID
#[no_mangle]
pub extern "C" fn kernel_spawn_process(name_ptr: *const u8, name_len: usize, parent_pid: u32) -> u32 {
    let name = unsafe {
        if name_ptr.is_null() || name_len == 0 || name_len > 256 {
            return 0; // 无效参数
        }
        core::slice::from_raw_parts(name_ptr, name_len)
    };

    let name_str = core::str::from_utf8(name).unwrap_or("unknown");

    match process::table::spawn(name_str, parent_pid) {
        Some(pid) => pid,
        None => 0,
    }
}

/// 终止进程
#[no_mangle]
pub extern "C" fn kernel_kill_process(pid: u32, signal: u32) -> u32 {
    if process::table::kill(pid, signal) {
        1
    } else {
        0
    }
}

/// 获取当前运行进程 PID
#[no_mangle]
pub extern "C" fn kernel_get_current_pid() -> u32 {
    CURRENT_PID.load(Ordering::Relaxed)
}

/// 系统调用分发
#[no_mangle]
pub extern "C" fn kernel_syscall(pid: u32, syscall_num: u32, arg0: u32, arg1: u32, arg2: u32, arg3: u32) -> u64 {
    syscall::dispatch::handle(pid, syscall_num, arg0, arg1, arg2, arg3)
}

/// IPC 发送消息
#[no_mangle]
pub extern "C" fn kernel_ipc_send(src_pid: u32, dst_pid: u32, msg_type: u32, data_ptr: *const u8, data_len: usize) -> u32 {
    if data_ptr.is_null() || data_len == 0 || data_len > 4096 {
        return 0;
    }

    let data = unsafe { core::slice::from_raw_parts(data_ptr, data_len) };

    if ipc::channel::send(src_pid, dst_pid, msg_type, data) {
        1
    } else {
        0
    }
}

/// IPC 接收消息（非阻塞） - 返回消息长度，0 表示无消息
#[no_mangle]
pub extern "C" fn kernel_ipc_receive(pid: u32, buf_ptr: *mut u8, buf_len: usize) -> u32 {
    let buf = unsafe {
        if buf_ptr.is_null() || buf_len == 0 {
            return 0;
        }
        core::slice::from_raw_parts_mut(buf_ptr, buf_len)
    };

    ipc::channel::receive(pid, buf) as u32
}

/// 分配物理帧 - 返回帧索引，0 表示失败
#[no_mangle]
pub extern "C" fn kernel_alloc_frame() -> u32 {
    memory::frame_alloc::alloc_frame().unwrap_or(0) as u32
}

/// 释放物理帧
#[no_mangle]
pub extern "C" fn kernel_free_frame(frame_idx: u32) -> u32 {
    if memory::frame_alloc::free_frame(frame_idx as usize) {
        1
    } else {
        0
    }
}

/// 获取内存统计
#[no_mangle]
pub extern "C" fn kernel_get_memory_stats() -> u64 {
    let stats = memory::frame_alloc::get_stats();
    // 打包: (total_frames << 32) | used_frames
    ((stats.total_frames as u64) << 32) | (stats.used_frames as u64)
}

/// 获取进程数量
#[no_mangle]
pub extern "C" fn kernel_get_process_count() -> u32 {
    process::table::count() as u32
}

/// 获取进程信息 - 写入到 buffer，返回写入字节数
#[no_mangle]
pub extern "C" fn kernel_get_process_info(pid: u32, buf_ptr: *mut u8, buf_len: usize) -> u32 {
    if let Some(info) = process::table::get_info(pid) {
        let bytes = info.as_bytes();
        let len = core::cmp::min(bytes.len(), buf_len);
        unsafe {
            if !buf_ptr.is_null() {
                core::ptr::copy_nonoverlapping(bytes.as_ptr(), buf_ptr, len);
            }
        }
        len as u32
    } else {
        0
    }
}

/// 关闭内核
#[no_mangle]
pub extern "C" fn kernel_shutdown() {
    scheduler::round_robin::stop();
    process::table::kill_all();
    KERNEL_INITIALIZED.store(false, Ordering::SeqCst);
}

/// panic 处理
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
