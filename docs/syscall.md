# WebOS 系统调用规范

## 概述

WebOS 系统调用（System Call）是用户态进程与内核交互的接口，通过 IPC 机制实现。每个系统调用都有一个唯一的调用号（0x0100-0x09FF），分配合下：

| 范围 | 类别 | 说明 |
|------|------|------|
| 0x0100-0x01FF | 文件系统 (FS) | 文件读写、目录管理、权限控制 |
| 0x0200-0x02FF | 进程管理 (PROCESS) | 进程创建、终止、状态查询 |
| 0x0300-0x03FF | 内存管理 (MEMORY) | 内存分配、释放、保护 |
| 0x0400-0x04FF | 时间服务 (TIME) | 时间获取、睡眠、定时器 |
| 0x0500-0x05FF | 设备I/O (IO) | 设备读写、控制 |
| 0x0600-0x06FF | 网络通信 (NET) | 套接字、连接、数据传输 |
| 0x0700-0x07FF | 调试服务 (DEBUG) | 日志输出、调试中断 |
| 0x0800-0x08FF | IPC通信 (IPC) | 进程间消息传递 |
| 0x0900-0x09FF | 通知服务 (NOTIFY) | 用户通知显示与管理 |

## 调用约定

所有系统调用通过 `window.webos.syscall` 接口调用，格式为：

```javascript
const result = await webos.syscall(syscallNumber, params);
```

**参数说明：**
- `syscallNumber`: 系统调用号（16位整数，0x0100-0x09FF）
- `params`: 参数对象（可选）

**返回值：**
```typescript
interface SyscallResult {
  success: boolean;  // 调用是否成功
  data?: any;        // 调用返回的数据
  error?: string;    // 错误信息（如果失败）
}
```

## 系统调用详细说明

### 文件系统调用 (0x0100-0x01FF)

#### 0x0100 - FS_READ
**功能**: 读取文件内容
**参数**:
- `path`: `string` - 文件路径
- `offset`: `number` (可选) - 读取偏移量，默认0
- `length`: `number` (可选) - 读取长度，默认到文件末尾
**返回值**:
- `success: true` 时 `data` 为文件内容字符串
- `success: false` 时 `error` 为错误信息
**错误码**: ENOENT（文件不存在）、EACCES（权限拒绝）、EINVAL（无效参数）

#### 0x0101 - FS_WRITE
**功能**: 写入文件内容
**参数**:
- `path`: `string` - 文件路径
- `data`: `string` - 要写入的内容
- `append`: `boolean` (可选) - 是否追加模式，默认false（覆盖）
**返回值**:
- `success: boolean` 表示写入是否成功
**错误码**: EACCES（权限拒绝）、ENOSPC（空间不足）、EROFS（只读文件系统）

#### 0x0102 - FS_OPEN
**功能**: 打开文件（简化版）
**参数**:
- `path`: `string` - 文件路径
- `mode`: `string` (可选) - 打开模式："r"（读）、"w"（写）、"a"（追加），默认"r"
**返回值**:
- `success: true` 时 `data` 包含文件描述符对象 `{ fd: string, path: string, mode: string }`
**错误码**: ENOENT（文件不存在）、EACCES（权限拒绝）

#### 0x0103 - FS_CLOSE
**功能**: 关闭文件描述符
**参数**:
- `fd`: `string` - 文件描述符
**返回值**:
- `success: boolean` 表示关闭是否成功

#### 0x0104 - FS_SEEK
**功能**: 移动文件指针（暂未实现）
**参数**:
- `fd`: `string` - 文件描述符
- `offset`: `number` - 偏移量
- `whence`: `string` (可选) - 参考位置："start"、"current"、"end"，默认"start"
**返回值**:
- `success: false`, `error: "System call 'fs.seek' not implemented yet"`

#### 0x0105 - FS_STAT
**功能**: 获取文件/目录信息
**参数**:
- `path`: `string` - 路径
**返回值**:
- `success: true` 时 `data` 包含 stat 对象：
  ```typescript
  {
    exists: boolean,      // 是否存在
    isFile: boolean,     // 是否为文件
    isDirectory: boolean, // 是否为目录
    size: number,        // 大小（字节）
    createdAt: number,   // 创建时间戳
    modifiedAt: number,  // 修改时间戳
    permissions: string, // 权限字符串 "drwxr-xr-x"
    owner: string,       // 所有者
    group: string        // 所属组
  }
  ```

#### 0x0106 - FS_UNLINK
**功能**: 删除文件
**参数**:
- `path`: `string` - 文件路径
**返回值**:
- `success: boolean` 表示删除是否成功
**错误码**: ENOENT（文件不存在）、EACCES（权限拒绝）、EISDIR（是目录）

#### 0x0107 - FS_MKDIR
**功能**: 创建目录
**参数**:
- `path`: `string` - 目录路径
- `recursive`: `boolean` (可选) - 是否递归创建父目录，默认false
**返回值**:
- `success: boolean` 表示创建是否成功
**错误码**: EEXIST（目录已存在）、EACCES（权限拒绝）、ENOTDIR（路径中某段不是目录）

#### 0x0108 - FS_RMDIR
**功能**: 删除空目录
**参数**:
- `path`: `string` - 目录路径
**返回值**:
- `success: boolean` 表示删除是否成功
**错误码**: ENOTEMPTY（目录非空）、EACCES（权限拒绝）、ENOTDIR（不是目录）

### 进程管理调用 (0x0200-0x02FF)

#### 0x0200 - PROCESS_FORK
**功能**: 创建子进程（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'process.fork' not implemented yet"`

#### 0x0201 - PROCESS_EXEC
**功能**: 执行新程序（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'process.exec' not implemented yet"`

#### 0x0202 - PROCESS_EXIT
**功能**: 终止当前进程（暂未实现）
**参数**:
- `code`: `number` (可选) - 退出码，默认0
**返回值**:
- `success: false`, `error: "System call 'process.exit' not implemented yet"`

#### 0x0203 - PROCESS_WAIT
**功能**: 等待子进程终止（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'process.wait' not implemented yet"`

#### 0x0204 - PROCESS_KILL
**功能**: 向进程发送信号（暂未实现）
**参数**:
- `pid`: `number` - 进程ID
- `signal`: `number` (可选) - 信号编号，默认SIGTERM(15)
**返回值**:
- `success: false`, `error: "System call 'process.kill' not implemented yet"`

#### 0x0205 - PROCESS_GETPID
**功能**: 获取当前进程ID（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'process.getpid' not implemented yet"`

#### 0x0206 - PROCESS_GETPPID
**功能**: 获取父进程ID（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'process.getppid' not implemented yet"`

### 内存管理调用 (0x0300-0x03FF)

#### 0x0300 - MEMORY_ALLOC
**功能**: 分配内存（暂未实现）
**参数**:
- `size`: `number` - 分配大小（字节）
**返回值**:
- `success: false`, `error: "System call 'memory.alloc' not implemented yet"`

#### 0x0301 - MEMORY_FREE
**功能**: 释放内存（暂未实现）
**参数**:
- `address`: `number` - 内存地址
**返回值**:
- `success: false`, `error: "System call 'memory.free' not implemented yet"`

#### 0x0302 - MEMORY_PROTECT
**功能**: 修改内存保护属性（暂未实现）
**参数**:
- `address`: `number` - 内存地址
- `size`: `number` - 内存大小
- `prot`: `number` - 保护标志（READ=1, WRITE=2, EXECUTE=4）
**返回值**:
- `success: false`, `error: "System call 'memory.protect' not implemented yet"`

#### 0x0303 - MEMORY_MAP
**功能**: 映射内存区域（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'memory.map' not implemented yet"`

#### 0x0304 - MEMORY_UNMAP
**功能**: 取消内存映射（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'memory.unmap' not implemented yet"`

### 时间服务调用 (0x0400-0x04FF)

#### 0x0400 - TIME_NOW
**功能**: 获取当前时间
**参数**: 无
**返回值**:
- `success: true` 时 `data` 包含时间信息：
  ```typescript
  {
    timestamp: number,      // 时间戳（毫秒）
    isoString: string,     // ISO格式字符串
    milliseconds: number   // 毫秒数
  }
  ```

#### 0x0401 - TIME_SLEEP
**功能**: 使进程睡眠指定毫秒数
**参数**:
- `milliseconds`: `number` - 睡眠时长（毫秒，最大60000）
**返回值**:
- `success: boolean` 表示睡眠是否成功
**错误码**: EINVAL（无效时长）

#### 0x0402 - TIME_ALARM
**功能**: 设置定时器（简化版）
**参数**:
- `timestamp`: `number` - 触发时间戳（毫秒）
- `callbackId`: `string` - 回调标识符
**返回值**:
- `success: true` 时 `data` 包含定时器ID `{ alarmId: string }`
**错误码**: EINVAL（无效时间）

### 设备I/O调用 (0x0500-0x05FF)

#### 0x0500 - IO_READ
**功能**: 从设备读取数据（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'io.read' not implemented yet"`

#### 0x0501 - IO_WRITE
**功能**: 向设备写入数据（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'io.write' not implemented yet"`

### 网络通信调用 (0x0600-0x06FF)

#### 0x0600 - NET_SOCKET
**功能**: 创建套接字（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.socket' not implemented yet"`

#### 0x0601 - NET_CONNECT
**功能**: 连接远程主机（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.connect' not implemented yet"`

#### 0x0602 - NET_BIND
**功能**: 绑定地址（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.bind' not implemented yet"`

#### 0x0603 - NET_LISTEN
**功能**: 监听连接（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.listen' not implemented yet"`

#### 0x0604 - NET_ACCEPT
**功能**: 接受连接（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.accept' not implemented yet"`

#### 0x0605 - NET_SEND
**功能**: 发送数据（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.send' not implemented yet"`

#### 0x0606 - NET_RECV
**功能**: 接收数据（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'net.recv' not implemented yet"`

### 调试服务调用 (0x0700-0x07FF)

#### 0x0700 - DEBUG_LOG
**功能**: 输出调试日志
**参数**:
- `message`: `any` - 要记录的消息
- `level`: `string` (可选) - 日志级别："error"、"warn"、"info"、"debug"、"log"，默认"info"
**返回值**:
- `success: boolean` 表示日志输出是否成功

#### 0x0701 - DEBUG_BREAK
**功能**: 触发调试断点（仅开发模式）
**参数**: 无
**返回值**:
- `success: boolean` 表示是否成功触发

### IPC通信调用 (0x0800-0x08FF)

#### 0x0800 - IPC_SEND
**功能**: 发送IPC消息（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'ipc.send' not implemented yet"`

#### 0x0801 - IPC_RECEIVE
**功能**: 接收IPC消息（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'ipc.receive' not implemented yet"`

#### 0x0802 - IPC_CREATE_CHANNEL
**功能**: 创建IPC通道（暂未实现）
**返回值**:
- `success: false`, `error: "System call 'ipc.create_channel' not implemented yet"`

### 通知服务调用 (0x0900-0x09FF)

#### 0x0900 - NOTIFY_SHOW
**功能**: 显示用户通知（暂未实现）
**参数**:
- `title`: `string` - 通知标题
- `message`: `string` - 通知内容
- `options`: `object` (可选) - 通知选项
**返回值**:
- `success: false`, `error: "System call 'notify.show' not implemented yet"`

#### 0x0901 - NOTIFY_CLOSE
**功能**: 关闭通知（暂未实现）
**参数**:
- `notificationId`: `string` - 通知ID
**返回值**:
- `success: false`, `error: "System call 'notify.close' not implemented yet"`

#### 0x0902 - NOTIFY_LIST
**功能**: 列出活动通知（暂未实现）
**参数**: 无
**返回值**:
- `success: false`, `error: "System call 'notify.list' not implemented yet"`

## 错误码说明

| 错误码 | 说明 | 常见场景 |
|--------|------|----------|
| ENOENT | 文件或目录不存在 | FS_READ、FS_OPEN、FS_STAT |
| EACCES | 权限拒绝 | 文件读写、目录创建删除 |
| EEXIST | 文件或目录已存在 | FS_MKDIR |
| ENOTDIR | 不是目录 | FS_MKDIR（路径中某段不是目录） |
| EISDIR | 是目录 | FS_UNLINK（尝试删除目录） |
| ENOSPC | 空间不足 | FS_WRITE |
| EROFS | 只读文件系统 | FS_WRITE、FS_UNLINK |
| EINVAL | 无效参数 | TIME_SLEEP（时长过大） |

## 实现状态

| 类别 | 已实现 | 占位符 | 未注册 | 总计 |
|------|--------|--------|--------|------|
| 文件系统 | 8 | 1 | 0 | 9 |
| 进程管理 | 0 | 7 | 0 | 7 |
| 内存管理 | 0 | 5 | 0 | 5 |
| 时间服务 | 3 | 0 | 0 | 3 |
| 设备I/O | 0 | 2 | 0 | 2 |
| 网络通信 | 0 | 7 | 0 | 7 |
| 调试服务 | 2 | 0 | 0 | 2 |
| IPC通信 | 0 | 3 | 0 | 3 |
| 通知服务 | 0 | 3 | 0 | 3 |
| **合计** | **13** | **28** | **0** | **41** |

**最后更新**: 系统调用层整理完成，所有枚举值均已注册，文档规范建立。