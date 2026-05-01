//! WebOS Shell - Rust 用户态程序
//!
//! 交互式命令行 shell，支持内置命令和外部程序执行

#![no_std]

extern crate webos_userland as userland;

use userland::{debug_log, fs_read, fs_write, fs_mkdir, fs_unlink, getpid, kill, time_now, ipc_send, ipc_receive, exit};

/// 命令缓冲区大小
const CMD_BUF_SIZE: usize = 256;

/// 输出缓冲区大小
const OUT_BUF_SIZE: usize = 4096;

/// Shell 主入口
#[no_mangle]
pub extern "C" fn _start() {
    debug_log("shell: WebOS Rust Shell started");
    debug_log("shell: Type 'help' for available commands");

    // 写入 shell 启动日志
    fs_write("/var/log/shell.log", "shell: started\n");

    // Shell 主循环
    loop {
        // 在 WASM 环境中，实际输入通过 IPC 从终端 UI 组件获取
        // 这里先实现命令处理逻辑

        // 检查 IPC 消息
        let mut msg_buf = [0u8; 512];
        let msg_len = ipc_receive(&mut msg_buf);

        if msg_len > 0 {
            // 解析命令
            let cmd_str = core::str::from_utf8(&msg_buf[..msg_len as usize]).unwrap_or("");
            process_command(cmd_str);
        }
    }
}

/// 处理命令
fn process_command(cmd: &str) {
    let cmd = cmd.trim();
    if cmd.is_empty() {
        return;
    }

    // 分割命令和参数
    let (command, args) = split_command(cmd);

    match command {
        "help" => cmd_help(),
        "echo" => cmd_echo(args),
        "ls" => cmd_ls(args),
        "cat" => cmd_cat(args),
        "mkdir" => cmd_mkdir(args),
        "rm" => cmd_rm(args),
        "write" => cmd_write(args),
        "ps" => cmd_ps(),
        "kill" => cmd_kill(args),
        "time" => cmd_time(),
        "pid" => cmd_pid(),
        "exit" => cmd_exit(),
        "clear" => cmd_clear(),
        "whoami" => cmd_whoami(),
        "uname" => cmd_uname(),
        _ => {
            debug_log("shell: unknown command - type 'help' for list");
        }
    }
}

/// 分割命令和参数
fn split_command(cmd: &str) -> (&str, &str) {
    if let Some(pos) = cmd.find(' ') {
        (&cmd[..pos], cmd[pos + 1..].trim())
    } else {
        (cmd, "")
    }
}

// ============================================================================
// 内置命令实现
// ============================================================================

fn cmd_help() {
    debug_log("WebOS Shell Commands:");
    debug_log("  help     - Show this help");
    debug_log("  echo     - Echo text");
    debug_log("  ls       - List directory");
    debug_log("  cat      - Display file contents");
    debug_log("  mkdir    - Create directory");
    debug_log("  rm       - Remove file");
    debug_log("  write    - Write text to file (write <path> <content>)");
    debug_log("  ps       - List processes");
    debug_log("  kill     - Kill process (kill <pid>)");
    debug_log("  time     - Show current time");
    debug_log("  pid      - Show current PID");
    debug_log("  exit     - Exit shell");
    debug_log("  clear    - Clear terminal");
    debug_log("  whoami   - Show current user");
    debug_log("  uname    - Show system info");
}

fn cmd_echo(args: &str) {
    if args.is_empty() {
        debug_log("");
    } else {
        debug_log(args);
    }
}

fn cmd_ls(args: &str) {
    let path = if args.is_empty() { "/" } else { args };
    let mut buf = [0u8; OUT_BUF_SIZE];
    let bytes_read = fs_read(path, &mut buf);

    if bytes_read > 0 {
        let content = core::str::from_utf8(&buf[..bytes_read as usize]).unwrap_or("(binary data)");
        debug_log(content);
    } else {
        debug_log("ls: cannot list directory");
    }

    // 同时通过 IPC 通知终端 UI
    let msg = "ls: directory listing requested";
    ipc_send(0, 0x0500, msg.as_bytes());
}

fn cmd_cat(args: &str) {
    if args.is_empty() {
        debug_log("cat: missing file operand");
        return;
    }

    let mut buf = [0u8; OUT_BUF_SIZE];
    let bytes_read = fs_read(args, &mut buf);

    if bytes_read > 0 {
        let content = core::str::from_utf8(&buf[..bytes_read as usize]).unwrap_or("(binary data)");
        debug_log(content);
    } else {
        debug_log("cat: file not found or cannot be read");
    }
}

fn cmd_mkdir(args: &str) {
    if args.is_empty() {
        debug_log("mkdir: missing operand");
        return;
    }

    if fs_mkdir(args) {
        debug_log("mkdir: directory created");
    } else {
        debug_log("mkdir: cannot create directory");
    }
}

fn cmd_rm(args: &str) {
    if args.is_empty() {
        debug_log("rm: missing operand");
        return;
    }

    if fs_unlink(args) {
        debug_log("rm: file removed");
    } else {
        debug_log("rm: cannot remove file");
    }
}

fn cmd_write(args: &str) {
    // 格式: write <path> <content>
    let (path, content) = split_command(args);
    if path.is_empty() {
        debug_log("write: missing file path");
        return;
    }

    if fs_write(path, content) >= 0 {
        debug_log("write: file written");
    } else {
        debug_log("write: cannot write file");
    }
}

fn cmd_ps() {
    debug_log("  PID  PPID  STATE     NAME");
    debug_log("    1     0  running   init");
    debug_log("(full ps requires kernel process query via syscall)");
}

fn cmd_kill(args: &str) {
    if args.is_empty() {
        debug_log("kill: missing PID");
        return;
    }

    let pid = parse_u32(args);
    if pid == 0 {
        debug_log("kill: invalid PID");
        return;
    }

    if kill(pid, 9) {
        debug_log("kill: process terminated");
    } else {
        debug_log("kill: cannot kill process");
    }
}

fn cmd_time() {
    let t = time_now();
    debug_log("time: see console for timestamp");
}

fn cmd_pid() {
    debug_log("pid: see console for PID");
}

fn cmd_exit() {
    debug_log("shell: exiting...");
    fs_write("/var/log/shell.log", "shell: exited\n");
    exit();
}

fn cmd_clear() {
    // 通过 IPC 通知终端清屏
    ipc_send(0, 0x0501, "clear".as_bytes());
}

fn cmd_whoami() {
    debug_log("whoami: root");
}

fn cmd_uname() {
    debug_log("WebOS Rust Microkernel v0.1.0");
    debug_log("Architecture: wasm32-unknown-unknown");
    debug_log("Kernel: Rust + WebAssembly");
}

/// 解析 u32
fn parse_u32(s: &str) -> u32 {
    let mut result: u32 = 0;
    for c in s.bytes() {
        if c >= b'0' && c <= b'9' {
            result = result * 10 + (c - b'0') as u32;
        } else {
            return 0;
        }
    }
    result
}

/// 格式化字符串（简单实现）
fn format(template: &str, value: &str) -> &'static str {
    // 在 no_std 环境中简化处理
    debug_log(template);
    value;
    "ok"
}

/// 格式化 u64 为字符串（写入静态缓冲区）
fn format_u32(mut val: u32) -> &'static str {
    static mut BUF: [u8; 16] = [0u8; 16];
    unsafe {
        if val == 0 {
            BUF[0] = b'0';
            BUF[1] = 0;
            return core::str::from_utf8(&BUF[..1]).unwrap_or("0");
        }

        let mut pos = 15;
        while val > 0 {
            pos -= 1;
            BUF[pos] = b'0' + (val % 10) as u8;
            val /= 10;
        }
        let end = 15;
        core::str::from_utf8(&BUF[pos..end]).unwrap_or("?")
    }
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
