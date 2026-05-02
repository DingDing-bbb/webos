//! JS 桥接层
//!
//! 提供与宿主 JavaScript 环境通信的辅助函数。
//! 宿主通过 WASM import object 注入回调函数。

// 宿主函数声明（与 syscall/dispatch.rs 中的 extern 声明对应）
// 这些函数由 JS 在 WebAssembly.instantiate 时通过 import object 提供。

/// 通知宿主内核已初始化完成
#[no_mangle]
pub extern "C" fn kernel_ready() {
    // 通知宿主内核已就绪，可以开始加载用户态进程
    // 宿主会在调用 kernel_init() 后检查返回值
}

/// 宿主调用：加载 wasm 模块为用户进程
/// 返回加载的字节数
#[no_mangle]
pub extern "C" fn kernel_load_user_module(pid: u32, module_ptr: *const u8, module_len: usize) -> u32 {
    // 内核本身不直接执行 wasm 模块，而是记录模块信息
    // 实际的 wasm 实例化由宿主 JS 完成
    // 内核只维护进程表和调度

    if module_ptr.is_null() || module_len == 0 {
        return 0;
    }

    // 标记进程为就绪
    crate::process::table::set_state(pid, crate::process::process::ProcessState::Ready);
    crate::scheduler::round_robin::add_to_ready_queue(pid);

    module_len as u32
}
