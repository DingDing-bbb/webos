//! WebOS ls 命令 - 列出目录内容

#![no_std]

extern crate webos_userland as userland;

use userland::{debug_log, fs_read, fs_stat, getpid, exit};

#[no_mangle]
pub extern "C" fn _start() {
    let pid = getpid();
    debug_log(&concat_with_pid("ls: running as PID ", pid));

    // 读取当前目录（默认 /）
    let mut buf = [0u8; 4096];
    let bytes_read = fs_read("/", &mut buf);

    if bytes_read > 0 {
        let content = core::str::from_utf8(&buf[..bytes_read as usize]).unwrap_or("(error)");
        debug_log(content);
    } else {
        debug_log("ls: cannot read directory");
    }

    exit();
}

fn concat_with_pid(prefix: &str, pid: u32) -> &'static str {
    debug_log(prefix);
    debug_log(&u32_to_str(pid));
    "ok"
}

fn u32_to_str(mut val: u32) -> &'static str {
    static mut BUF: [u8; 12] = [0u8; 12];
    unsafe {
        if val == 0 {
            BUF[0] = b'0';
            return core::str::from_utf8(&BUF[..1]).unwrap_or("0");
        }
        let mut pos = 11;
        while val > 0 {
            pos -= 1;
            BUF[pos] = b'0' + (val % 10) as u8;
            val /= 10;
        }
        core::str::from_utf8(&BUF[pos..11]).unwrap_or("?")
    }
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
