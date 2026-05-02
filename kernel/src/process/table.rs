//! 进程表管理

use crate::process::process::{Process, ProcessState, MAX_PROCESSES};
use crate::scheduler::round_robin;
use crate::pagetable;
use crate::process::process::ProcessInfoSerialized;
use core::sync::atomic::{AtomicU32, Ordering};

static NEXT_PID: AtomicU32 = AtomicU32::new(1);

/// 进程表（全局静态）
static mut PROCESS_TABLE: [Option<Process>; MAX_PROCESSES] = {
    const NONE: Option<Process> = None;
    [NONE; MAX_PROCESSES]
};

/// 初始化进程表
pub fn init() {
    NEXT_PID.store(1, Ordering::SeqCst);
}

/// 创建新进程，返回 PID
pub fn spawn(name: &str, parent_pid: u32) -> Option<u32> {
    let pid = NEXT_PID.fetch_add(1, Ordering::SeqCst);
    if pid as usize >= MAX_PROCESSES {
        return None;
    }

    let mut proc = Process::new(pid, parent_pid, name);
    proc.state = ProcessState::Ready;

    // 为进程分配页表
    if let Some(root) = pagetable::create_address_space() {
        proc.page_table_root = root;
    }

    unsafe {
        PROCESS_TABLE[pid as usize] = Some(proc);
    }

    // 将进程加入调度器就绪队列
    round_robin::add_to_ready_queue(pid);

    Some(pid)
}

/// 终止进程
pub fn kill(pid: u32, signal: u32) -> bool {
    if pid as usize >= MAX_PROCESSES {
        return false;
    }

    let proc = unsafe { PROCESS_TABLE[pid as usize].as_mut() };
    if proc.is_none() {
        return false;
    }

    let proc = unsafe { PROCESS_TABLE[pid as usize].as_mut().unwrap() };

    if !proc.is_alive() {
        return false;
    }

    // SIGKILL (9) 立即终止
    if signal == 9 {
        proc.state = ProcessState::Zombie;
        proc.exit_code = -(signal as i32);

        round_robin::remove_from_ready_queue(pid);

        if proc.page_table_root != 0 {
            pagetable::destroy_address_space(proc.page_table_root);
            proc.page_table_root = 0;
        }

        return true;
    }

    proc.state = ProcessState::Zombie;
    proc.exit_code = -(signal as i32);
    round_robin::remove_from_ready_queue(pid);

    true
}

/// 终止所有进程
pub fn kill_all() {
    for i in 1..MAX_PROCESSES {
        unsafe {
            if let Some(ref mut proc) = PROCESS_TABLE[i] {
                if proc.is_alive() {
                    proc.state = ProcessState::Dead;
                    if proc.page_table_root != 0 {
                        pagetable::destroy_address_space(proc.page_table_root);
                        proc.page_table_root = 0;
                    }
                }
            }
            PROCESS_TABLE[i] = None;
        }
    }
    round_robin::clear_ready_queue();
}

/// 获取进程引用（只读）
pub fn get(pid: u32) -> Option<&'static Process> {
    if pid as usize >= MAX_PROCESSES {
        return None;
    }
    unsafe { PROCESS_TABLE[pid as usize].as_ref() }
}

/// 获取进程可变引用
pub fn get_mut(pid: u32) -> Option<&'static mut Process> {
    if pid as usize >= MAX_PROCESSES {
        return None;
    }
    unsafe { PROCESS_TABLE[pid as usize].as_mut() }
}

/// 获取进程信息序列化数据
pub fn get_info(pid: u32) -> Option<ProcessInfoSerialized> {
    get(pid).map(|p| p.serialize())
}

/// 获取活跃进程数
pub fn count() -> usize {
    let mut c = 0;
    for i in 1..MAX_PROCESSES {
        unsafe {
            if PROCESS_TABLE[i].is_some() && PROCESS_TABLE[i].as_ref().unwrap().is_alive() {
                c += 1;
            }
        }
    }
    c
}

/// 设置进程状态
pub fn set_state(pid: u32, state: ProcessState) -> bool {
    if let Some(proc) = get_mut(pid) {
        proc.state = state;
        true
    } else {
        false
    }
}
