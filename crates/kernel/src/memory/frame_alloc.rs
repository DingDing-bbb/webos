//! 物理内存帧分配器 - 位图分配
//!
//! 使用 wasm 线性内存的前 N 页作为物理内存池。
//! 每帧 4KB，用位图跟踪分配状态。

use core::sync::atomic::{AtomicBool, AtomicU32, Ordering};

/// 物理帧大小: 4KB
pub const FRAME_SIZE: usize = 4096;

/// 总帧数: 1024 (4MB 物理内存池)
pub const TOTAL_FRAMES: usize = 1024;

/// 保留帧数（内核用）: 前 64 帧 (256KB)
pub const RESERVED_FRAMES: usize = 64;

/// 位图大小（每个 bit 对应一帧）
pub const BITMAP_SIZE: usize = (TOTAL_FRAMES + 7) / 8;

/// 帧分配器状态
static mut BITMAP: [u8; BITMAP_SIZE] = [0u8; BITMAP_SIZE];
static INITIALIZED: AtomicBool = AtomicBool::new(false);
static mut USED_FRAMES: AtomicU32 = AtomicU32::new(0);

/// 内存统计
pub struct MemoryStats {
    pub total_frames: usize,
    pub used_frames: usize,
    pub free_frames: usize,
    pub total_memory: usize,
    pub used_memory: usize,
}

/// 初始化帧分配器
pub fn init() {
    if INITIALIZED.swap(true, Ordering::SeqCst) {
        return;
    }

    // 标记保留帧为已分配
    for i in 0..RESERVED_FRAMES {
        set_bit(i);
    }

    unsafe {
        USED_FRAMES.store(RESERVED_FRAMES as u32, Ordering::SeqCst);
    }
}

/// 分配一个物理帧，返回帧索引
pub fn alloc_frame() -> Option<usize> {
    for i in RESERVED_FRAMES..TOTAL_FRAMES {
        if !test_bit(i) {
            set_bit(i);
            unsafe {
                USED_FRAMES.fetch_add(1, Ordering::SeqCst);
            }
            // 清零帧内容
            let frame_ptr = (i * FRAME_SIZE) as *mut u8;
            unsafe {
                core::ptr::write_bytes(frame_ptr, 0, FRAME_SIZE);
            }
            return Some(i);
        }
    }
    None
}

/// 释放一个物理帧
pub fn free_frame(index: usize) -> bool {
    if index < RESERVED_FRAMES || index >= TOTAL_FRAMES {
        return false;
    }
    if !test_bit(index) {
        return false; // 已经是空闲的
    }
    clear_bit(index);
    unsafe {
        USED_FRAMES.fetch_sub(1, Ordering::SeqCst);
    }
    true
}

/// 分配连续的多个帧，返回起始帧索引
pub fn alloc_frames(count: usize) -> Option<usize> {
    if count == 0 {
        return None;
    }

    let mut consecutive = 0;
    let mut start = 0;

    for i in RESERVED_FRAMES..TOTAL_FRAMES {
        if !test_bit(i) {
            if consecutive == 0 {
                start = i;
            }
            consecutive += 1;
            if consecutive == count {
                // 标记所有帧为已分配
                for j in start..start + count {
                    set_bit(j);
                }
                unsafe {
                    USED_FRAMES.fetch_add(count as u32, Ordering::SeqCst);
                }
                return Some(start);
            }
        } else {
            consecutive = 0;
        }
    }
    None
}

/// 获取内存统计
pub fn get_stats() -> MemoryStats {
    let used = unsafe { USED_FRAMES.load(Ordering::SeqCst) as usize };
    MemoryStats {
        total_frames: TOTAL_FRAMES,
        used_frames: used,
        free_frames: TOTAL_FRAMES - used,
        total_memory: TOTAL_FRAMES * FRAME_SIZE,
        used_memory: used * FRAME_SIZE,
    }
}

// 内部位图操作

fn test_bit(index: usize) -> bool {
    let byte_idx = index / 8;
    let bit_idx = index % 8;
    unsafe { (BITMAP[byte_idx] >> bit_idx) & 1 != 0 }
}

fn set_bit(index: usize) {
    let byte_idx = index / 8;
    let bit_idx = index % 8;
    unsafe {
        BITMAP[byte_idx] |= 1 << bit_idx;
    }
}

fn clear_bit(index: usize) {
    let byte_idx = index / 8;
    let bit_idx = index % 8;
    unsafe {
        BITMAP[byte_idx] &= !(1 << bit_idx);
    }
}
