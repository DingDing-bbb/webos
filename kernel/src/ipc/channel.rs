//! IPC 消息通道
//!
//! 简单的消息队列，每个进程一个接收队列。
//! 支持同步发送和异步接收。

use core::sync::atomic::{AtomicU32, AtomicBool, Ordering};

/// 每个进程的消息队列容量
const MSG_QUEUE_SIZE: usize = 32;

/// 单条消息最大长度
const MAX_MSG_DATA: usize = 4096;

/// IPC 消息
pub struct IPCMessage {
    pub source_pid: u32,
    pub target_pid: u32,
    pub msg_type: u32,
    pub data_len: usize,
    pub data: [u8; MAX_MSG_DATA],
}

impl IPCMessage {
    pub fn new(src: u32, dst: u32, msg_type: u32, data: &[u8]) -> Self {
        let mut msg = IPCMessage {
            source_pid: src,
            target_pid: dst,
            msg_type,
            data_len: 0,
            data: [0u8; MAX_MSG_DATA],
        };
        let len = core::cmp::min(data.len(), MAX_MSG_DATA);
        msg.data[..len].copy_from_slice(&data[..len]);
        msg.data_len = len;
        msg
    }
}

/// 进程消息队列
struct MessageQueue {
    messages: [Option<IPCMessage>; MSG_QUEUE_SIZE],
    head: usize,
    tail: usize,
    count: usize,
}

impl MessageQueue {
    const fn new() -> Self {
        const NONE: Option<IPCMessage> = None;
        MessageQueue {
            messages: [NONE; MSG_QUEUE_SIZE],
            head: 0,
            tail: 0,
            count: 0,
        }
    }

    fn enqueue(&mut self, msg: IPCMessage) -> bool {
        if self.count >= MSG_QUEUE_SIZE {
            return false;
        }
        self.messages[self.tail] = Some(msg);
        self.tail = (self.tail + 1) % MSG_QUEUE_SIZE;
        self.count += 1;
        true
    }

    fn dequeue(&mut self) -> Option<&IPCMessage> {
        if self.count == 0 {
            return None;
        }
        let msg = self.messages[self.head].as_ref();
        if msg.is_some() {
            self.head = (self.head + 1) % MSG_QUEUE_SIZE;
            self.count -= 1;
        }
        msg
    }
}

/// 全局消息队列数组（每个 PID 对应一个）
const MAX_QUEUES: usize = 256;
static mut MESSAGE_QUEUES: [MessageQueue; MAX_QUEUES] = {
    const Q: MessageQueue = MessageQueue::new();
    [Q; MAX_QUEUES]
};

static INITIALIZED: AtomicBool = AtomicBool::new(false);

/// 初始化 IPC 子系统
pub fn init() {
    INITIALIZED.store(true, Ordering::SeqCst);
}

/// 发送 IPC 消息
pub fn send(src_pid: u32, dst_pid: u32, msg_type: u32, data: &[u8]) -> bool {
    if dst_pid as usize >= MAX_QUEUES {
        return false;
    }

    let msg = IPCMessage::new(src_pid, dst_pid, msg_type, data);

    unsafe {
        MESSAGE_QUEUES[dst_pid as usize].enqueue(msg)
    }
}

/// 接收 IPC 消息（非阻塞）
/// 将消息数据写入 buf，返回实际写入字节数
pub fn receive(pid: u32, buf: &mut [u8]) -> usize {
    if pid as usize >= MAX_QUEUES {
        return 0;
    }

    unsafe {
        if let Some(msg) = MESSAGE_QUEUES[pid as usize].dequeue() {
            let len = core::cmp::min(msg.data_len, buf.len());
            buf[..len].copy_from_slice(&msg.data[..len]);
            len
        } else {
            0
        }
    }
}

/// 检查进程是否有待接收消息
pub fn has_messages(pid: u32) -> bool {
    if pid as usize >= MAX_QUEUES {
        return false;
    }
    unsafe { MESSAGE_QUEUES[pid as usize].count > 0 }
}
