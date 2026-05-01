//! 两级页表实现
//!
//! 4KB 页，32位地址空间
//! - L1 页表 (Page Directory): 1024 项，每项指向 L2 页表
//! - L2 页表 (Page Table): 1024 项，每项映射一个 4KB 物理帧
//!
//! 虚拟地址格式: [L1 index (10 bits)][L2 index (10 bits)][Offset (12 bits)]
//!
//! 注意：在 WASM 环境中，页表是模拟的数据结构。
//! 实际地址转换由内核在软件中完成。

use crate::memory::frame_alloc;

/// 页大小: 4KB
pub const PAGE_SIZE: usize = 4096;

/// L1/L2 页表项数
pub const PT_ENTRIES: usize = 1024;

/// 页表项标志
pub const PTE_PRESENT: u32 = 1 << 0;
pub const PTE_WRITABLE: u32 = 1 << 1;
pub const PTE_USER: u32 = 1 << 2;

/// 页表项结构 (4 bytes)
#[derive(Clone, Copy)]
#[repr(C)]
pub struct PageTableEntry {
    pub value: u32,
}

impl PageTableEntry {
    pub fn new(frame: u32, flags: u32) -> Self {
        PageTableEntry {
            value: (frame & 0xFFFFF000) | (flags & 0xFFF),
        }
    }

    pub fn is_present(&self) -> bool {
        self.value & PTE_PRESENT != 0
    }

    pub fn frame(&self) -> u32 {
        self.value & 0xFFFFF000
    }

    pub fn flags(&self) -> u32 {
        self.value & 0xFFF
    }
}

/// L2 页表 (1024 项 * 4 bytes = 4KB = 1 帧)
#[repr(C)]
pub struct PageTable {
    pub entries: [PageTableEntry; PT_ENTRIES],
}

impl PageTable {
    pub fn new() -> Self {
        PageTable {
            entries: [PageTableEntry { value: 0 }; PT_ENTRIES],
        }
    }
}

/// L1 页目录 (1024 项 * 4 bytes = 4KB = 1 帧)
#[repr(C)]
pub struct PageDirectory {
    pub entries: [PageTableEntry; PT_ENTRIES],
}

impl PageDirectory {
    pub fn new() -> Self {
        PageDirectory {
            entries: [PageTableEntry { value: 0 }; PT_ENTRIES],
        }
    }
}

/// 活跃地址空间列表
const MAX_ADDRESS_SPACES: usize = 64;

struct AddressSpace {
    root_frame: u32,
    pid: u32,
    active: bool,
}

static mut ADDRESS_SPACES: [AddressSpace; MAX_ADDRESS_SPACES] = {
    const EMPTY: AddressSpace = AddressSpace {
        root_frame: 0,
        pid: 0,
        active: false,
    };
    [EMPTY; MAX_ADDRESS_SPACES]
};

/// 辅助函数：帧索引转指针
fn frame_to_ptr<T>(frame: u32) -> *mut T {
    (frame as usize * frame_alloc::FRAME_SIZE) as *mut T
}

/// 辅助函数：帧索引转 const 指针
fn frame_to_ptr_const<T>(frame: u32) -> *const T {
    (frame as usize * frame_alloc::FRAME_SIZE) as *const T
}

/// 创建新的地址空间，返回 L1 页目录的帧索引
pub fn create_address_space() -> Option<u32> {
    let root_frame = frame_alloc::alloc_frame()? as u32;

    // 初始化页目录为空
    let pd = unsafe { &mut *frame_to_ptr::<PageDirectory>(root_frame) };
    *pd = PageDirectory::new();

    // 记录地址空间
    for i in 0..MAX_ADDRESS_SPACES {
        unsafe {
            if !ADDRESS_SPACES[i].active {
                ADDRESS_SPACES[i] = AddressSpace {
                    root_frame,
                    pid: 0,
                    active: true,
                };
                return Some(root_frame);
            }
        }
    }

    frame_alloc::free_frame(root_frame as usize);
    None
}

/// 销毁地址空间
pub fn destroy_address_space(root_frame: u32) -> bool {
    let pd = unsafe { &*frame_to_ptr_const::<PageDirectory>(root_frame) };

    for i in 0..PT_ENTRIES {
        let entry = pd.entries[i];
        if entry.is_present() {
            let l2_frame = entry.frame();
            let pt = unsafe { &*frame_to_ptr_const::<PageTable>(l2_frame) };

            for j in 0..PT_ENTRIES {
                let pte = pt.entries[j];
                if pte.is_present() {
                    frame_alloc::free_frame(pte.frame() as usize);
                }
            }

            frame_alloc::free_frame(l2_frame as usize);
        }
    }

    frame_alloc::free_frame(root_frame as usize);

    for i in 0..MAX_ADDRESS_SPACES {
        unsafe {
            if ADDRESS_SPACES[i].active && ADDRESS_SPACES[i].root_frame == root_frame {
                ADDRESS_SPACES[i].active = false;
                return true;
            }
        }
    }
    false
}

/// 映射虚拟地址到物理帧
pub fn map_page(root_frame: u32, vaddr: u32, paddr: u32, flags: u32) -> bool {
    let l1_idx = ((vaddr >> 22) & 0x3FF) as usize;
    let l2_idx = ((vaddr >> 12) & 0x3FF) as usize;

    let pd = unsafe { &mut *frame_to_ptr::<PageDirectory>(root_frame) };

    // 如果 L2 页表不存在，分配一个
    if !pd.entries[l1_idx].is_present() {
        match frame_alloc::alloc_frame() {
            Some(l2_frame) => {
                let l2_frame_u32 = l2_frame as u32;
                let pt = unsafe { &mut *frame_to_ptr::<PageTable>(l2_frame_u32) };
                *pt = PageTable::new();

                pd.entries[l1_idx] = PageTableEntry::new(l2_frame_u32, PTE_PRESENT | PTE_WRITABLE);
            }
            None => return false,
        }
    }

    // 设置 L2 页表项
    let l2_frame = pd.entries[l1_idx].frame();
    let pt = unsafe { &mut *frame_to_ptr::<PageTable>(l2_frame) };

    pt.entries[l2_idx] = PageTableEntry::new(paddr, flags | PTE_PRESENT);
    true
}

/// 解除虚拟地址映射
pub fn unmap_page(root_frame: u32, vaddr: u32) -> bool {
    let l1_idx = ((vaddr >> 22) & 0x3FF) as usize;
    let l2_idx = ((vaddr >> 12) & 0x3FF) as usize;

    let pd = unsafe { &*frame_to_ptr_const::<PageDirectory>(root_frame) };

    if !pd.entries[l1_idx].is_present() {
        return false;
    }

    let l2_frame = pd.entries[l1_idx].frame();
    let pt = unsafe { &mut *frame_to_ptr::<PageTable>(l2_frame) };

    if !pt.entries[l2_idx].is_present() {
        return false;
    }

    pt.entries[l2_idx] = PageTableEntry { value: 0 };
    true
}

/// 虚拟地址到物理地址转换
pub fn translate(root_frame: u32, vaddr: u32) -> Option<u32> {
    let l1_idx = ((vaddr >> 22) & 0x3FF) as usize;
    let l2_idx = ((vaddr >> 12) & 0x3FF) as usize;
    let offset = vaddr & 0xFFF;

    let pd = unsafe { &*frame_to_ptr_const::<PageDirectory>(root_frame) };

    if !pd.entries[l1_idx].is_present() {
        return None;
    }

    let l2_frame = pd.entries[l1_idx].frame();
    let pt = unsafe { &*frame_to_ptr_const::<PageTable>(l2_frame) };

    if !pt.entries[l2_idx].is_present() {
        return None;
    }

    Some(pt.entries[l2_idx].frame() | offset)
}
