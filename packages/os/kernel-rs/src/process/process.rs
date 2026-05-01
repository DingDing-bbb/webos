//! 进程描述符

/// 进程状态
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum ProcessState {
    New = 0,
    Ready = 1,
    Running = 2,
    Blocked = 3,
    Zombie = 4,
    Dead = 5,
}

/// 进程优先级
pub const DEFAULT_PRIORITY: u8 = 5;
pub const MAX_PROCESSES: usize = 256;

/// 进程描述符
pub struct Process {
    pub pid: u32,
    pub parent_pid: u32,
    pub name: [u8; 64],
    pub name_len: usize,
    pub state: ProcessState,
    pub priority: u8,
    pub memory_pages: u32,
    pub start_tick: u32,
    pub cpu_ticks: u32,
    pub exit_code: i32,
    /// 页表根索引（两级页表的 L1 索引）
    pub page_table_root: u32,
}

impl Process {
    pub fn new(pid: u32, parent_pid: u32, name: &str) -> Self {
        let mut name_buf = [0u8; 64];
        let name_bytes = name.as_bytes();
        let len = core::cmp::min(name_bytes.len(), 63);
        name_buf[..len].copy_from_slice(&name_bytes[..len]);

        Process {
            pid,
            parent_pid,
            name: name_buf,
            name_len: len,
            state: ProcessState::New,
            priority: DEFAULT_PRIORITY,
            memory_pages: 0,
            start_tick: 0,
            cpu_ticks: 0,
            exit_code: 0,
            page_table_root: 0,
        }
    }

    pub fn get_name(&self) -> &str {
        core::str::from_utf8(&self.name[..self.name_len]).unwrap_or("unknown")
    }

    pub fn is_alive(&self) -> bool {
        matches!(self.state, ProcessState::New | ProcessState::Ready | ProcessState::Running | ProcessState::Blocked)
    }

    pub fn set_state(&mut self, state: ProcessState) {
        self.state = state;
    }

    pub fn add_cpu_time(&mut self, ticks: u32) {
        self.cpu_ticks = self.cpu_ticks.saturating_add(ticks);
    }

    /// 序列化为字节数组
    pub fn serialize(&self) -> ProcessInfoSerialized {
        let mut data = [0u8; 128];
        // PID (4 bytes)
        data[0..4].copy_from_slice(&self.pid.to_le_bytes());
        // Parent PID (4 bytes)
        data[4..8].copy_from_slice(&self.parent_pid.to_le_bytes());
        // Name (64 bytes)
        data[8..72].copy_from_slice(&self.name);
        // State (1 byte)
        data[72] = self.state as u8;
        // Priority (1 byte)
        data[73] = self.priority;
        // Memory pages (4 bytes)
        data[74..78].copy_from_slice(&self.memory_pages.to_le_bytes());
        // Start tick (4 bytes)
        data[78..82].copy_from_slice(&self.start_tick.to_le_bytes());
        // CPU ticks (4 bytes)
        data[82..86].copy_from_slice(&self.cpu_ticks.to_le_bytes());
        // Exit code (4 bytes)
        data[86..90].copy_from_slice(&self.exit_code.to_le_bytes());
        // Page table root (4 bytes)
        data[90..94].copy_from_slice(&self.page_table_root.to_le_bytes());

        ProcessInfoSerialized { data, len: 94 }
    }
}

/// 进程信息序列化（用于 JS 桥接）
pub struct ProcessInfoSerialized {
    data: [u8; 128],
    len: usize,
}

impl ProcessInfoSerialized {
    pub fn as_bytes(&self) -> &[u8] {
        &self.data[..self.len]
    }
}
