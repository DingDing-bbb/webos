#!/bin/bash
# 构建所有用户态 Rust 程序

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$SCRIPT_DIR/../public/wasm"

echo "🔧 Building WebOS userland programs..."

# Shell
echo "  Building shell..."
cd "$SCRIPT_DIR/shell"
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/webos_shell.wasm "$PUBLIC_DIR/shell.wasm"

# ls
echo "  Building ls..."
cd "$SCRIPT_DIR/ls"
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/webos_ls.wasm "$PUBLIC_DIR/ls.wasm"

# cat
echo "  Building cat..."
cd "$SCRIPT_DIR/cat"
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/webos_cat.wasm "$PUBLIC_DIR/cat.wasm"

# init
echo "  Building init..."
cd "$SCRIPT_DIR/init"
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/webos_init.wasm "$PUBLIC_DIR/init.wasm"

echo "✅ All userland programs built successfully"
ls -la "$PUBLIC_DIR/"
