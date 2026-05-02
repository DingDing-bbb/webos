#!/bin/bash
# 构建 Rust 内核 WASM

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KERNEL_DIR="$SCRIPT_DIR"
PUBLIC_DIR="$SCRIPT_DIR/../public/wasm"

echo "🔧 Building WebOS Rust kernel..."

cd "$KERNEL_DIR"

# 编译为 WASM
cargo build --target wasm32-unknown-unknown --release

# 复制到 public 目录
mkdir -p "$PUBLIC_DIR"
cp target/wasm32-unknown-unknown/release/webos_kernel.wasm "$PUBLIC_DIR/kernel.wasm"

echo "✅ Kernel WASM built: $(wc -c < "$PUBLIC_DIR/kernel.wasm") bytes"
