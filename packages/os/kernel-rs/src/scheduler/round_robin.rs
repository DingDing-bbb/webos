//! 简单的轮转调度器 (Round-Robin)
//!
//! 时间片轮转，每个 tick 切换到下一个就绪进程。
//! 由宿主定时器驱动 kernel_tick()。

use crate::process::table;
use crate::process::process::ProcessState;
use core::sync::atomic::{AtomicBool, AtomicU32, Ordering};

/// 就绪队列最大容量
const QUEUE_SIZE: usize = 256;

/// 默认时间片（tick 数）
const DEFAULT_TIME_QUANTUM: u32 = 10;

static RUNNING: AtomicBool = AtomicBool::new(false);
static CURRENT_PID: AtomicU32 = AtomicU32::new(0);
static TICKS_REMAINING: AtomicU32 = AtomicU32::new(DEFAULT_TIME_QUANTUM);

/// 就绪队列
static mut READY_QUEUE: [u32; QUEUE_SIZE] = [0; QUEUE_SIZE];
static mut READY_QUEUE_HEAD: usize = 0;
static mut READY_QUEUE_TAIL: usize = 0;
static mut READY_QUEUE_COUNT: usize = 0;

/// 初始化调度器
pub fn init() {
    RUNNING.store(false, Ordering::SeqCst);
    CURRENT_PID.store(0, Ordering::SeqCst);
    TICKS_REMAINING.store(DEFAULT_TIME_QUANTUM, Ordering::SeqCst);
    unsafe {
        READY_QUEUE_HEAD = 0;
        READY_QUEUE_TAIL = 0;
        READY_QUEUE_COUNT = 0;
    }
}

/// 启动调度器
pub fn start() {
    RUNNING.store(true, Ordering::SeqCst);
}

/// 停止调度器
pub fn stop() {
    RUNNING.store(false, Ordering::SeqCst);
}

/// 添加进程到就绪队列
pub fn add_to_ready_queue(pid: u32) {
    unsafe {
        if READY_QUEUE_COUNT >= QUEUE_SIZE {
            return; // 队列满
        }
        READY_QUEUE[READY_QUEUE_TAIL] = pid;
        READY_QUEUE_TAIL = (READY_QUEUE_TAIL + 1) % QUEUE_SIZE;
        READY_QUEUE_COUNT += 1;

        // 设置进程状态为 Ready
        table::set_state(pid, ProcessState::Ready);
    }
}

/// 从就绪队列移除进程
pub fn remove_from_ready_queue(pid: u32) {
    unsafe {
        if READY_QUEUE_COUNT == 0 {
            return;
        }

        // 线性查找并移除
        let mut found = false;
        let count = READY_QUEUE_COUNT;
        let head = READY_QUEUE_HEAD;

        for i in 0..count {
            let idx = (head + i) % QUEUE_SIZE;
            if READY_QUEUE[idx] == pid {
                found = true;
            }
            if found && i + 1 < count {
                let next_idx = (head + i + 1) % QUEUE_SIZE;
                READY_QUEUE[idx] = READY_QUEUE[next_idx];
            }
        }

        if found {
            READY_QUEUE_TAIL = (READY_QUEUE_TAIL + QUEUE_SIZE - 1) % QUEUE_SIZE;
            READY_QUEUE_COUNT -= 1;
        }
    }
}

/// 清空就绪队列
pub fn clear_ready_queue() {
    unsafe {
        READY_QUEUE_HEAD = 0;
        READY_QUEUE_TAIL = 0;
        READY_QUEUE_COUNT = 0;
    }
}

/// 调度器 tick - 在每个定时器中断时调用
pub fn tick() {
    if !RUNNING.load(Ordering::Relaxed) {
        return;
    }

    let remaining = TICKS_REMAINING.fetch_sub(1, Ordering::SeqCst);

    if remaining <= 1 {
        // 时间片用完，执行调度
        schedule();
    }

    // 更新当前进程的 CPU 时间
    let current = CURRENT_PID.load(Ordering::Relaxed);
    if current > 0 {
        if let Some(proc) = table::get_mut(current) {
            proc.add_cpu_time(1);
        }
    }
}

/// 执行调度 - 轮转切换到下一个就绪进程
fn schedule() {
    TICKS_REMAINING.store(DEFAULT_TIME_QUANTUM, Ordering::SeqCst);

    let current = CURRENT_PID.load(Ordering::Relaxed);

    // 如果当前进程仍在运行，将其放回就绪队列末尾
    if current > 0 {
        if let Some(proc) = table::get(current) {
            if proc.state == ProcessState::Running {
                table::set_state(current, ProcessState::Ready);
                add_to_ready_queue(current);
            }
        }
    }

    // 从就绪队列取出下一个进程
    let next_pid = dequeue();

    if next_pid == 0 {
        // 没有就绪进程，空闲
        CURRENT_PID.store(0, Ordering::Relaxed);
        return;
    }

    // 切换到新进程
    table::set_state(next_pid, ProcessState::Running);
    CURRENT_PID.store(next_pid, Ordering::Relaxed);
}

/// 从就绪队列头部取出一个 PID
fn dequeue() -> u32 {
    unsafe {
        if READY_QUEUE_COUNT == 0 {
            return 0;
        }
        let pid = READY_QUEUE[READY_QUEUE_HEAD];
        READY_QUEUE_HEAD = (READY_QUEUE_HEAD + 1) % QUEUE_SIZE;
        READY_QUEUE_COUNT -= 1;
        pid
    }
}

/// 获取当前运行进程 PID
pub fn current_pid() -> u32 {
    CURRENT_PID.load(Ordering::Relaxed)
}

/// 获取就绪队列中的进程数
pub fn ready_count() -> usize {
    unsafe { READY_QUEUE_COUNT }
}
