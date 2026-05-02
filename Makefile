.PHONY: all kernel userland wasm site dev build clean

# ============================================================
# WebOS 统一构建
#
#   make          - 构建所有（kernel + userland + site）
#   make kernel   - 构建 Rust 内核 WASM
#   make userland - 构建 Rust 用户态程序 WASM
#   make wasm     - 复制所有 WASM 到 site/public/wasm/
#   make site     - 构建 Next.js 站点
#   make dev      - 启动开发服务器
#   make clean    - 清理所有构建产物
# ============================================================

WASM_DIR  := site/public/wasm
RUST_TARGET := wasm32-unknown-unknown

all: kernel userland wasm site

# --- Rust 内核 ---
kernel:
	cargo build --manifest-path kernel/Cargo.toml --target $(RUST_TARGET) --release
	@echo "✓ Kernel built"

# --- Rust 用户态程序 ---
userland:
	cargo build --manifest-path userland/init/Cargo.toml --target $(RUST_TARGET) --release
	cargo build --manifest-path userland/shell/Cargo.toml --target $(RUST_TARGET) --release
	cargo build --manifest-path userland/ls/Cargo.toml --target $(RUST_TARGET) --release
	cargo build --manifest-path userland/cat/Cargo.toml --target $(RUST_TARGET) --release
	@echo "✓ Userland built"

# --- 复制 WASM 到 site ---
wasm: kernel userland
	@mkdir -p $(WASM_DIR)
	cp kernel/target/$(RUST_TARGET)/release/kernel.wasm $(WASM_DIR)/
	cp userland/init/target/$(RUST_TARGET)/release/init.wasm $(WASM_DIR)/ || \
	  cp target/$(RUST_TARGET)/release/init.wasm $(WASM_DIR)/ || true
	cp userland/shell/target/$(RUST_TARGET)/release/shell.wasm $(WASM_DIR)/ || \
	  cp target/$(RUST_TARGET)/release/shell.wasm $(WASM_DIR)/ || true
	cp userland/ls/target/$(RUST_TARGET)/release/ls.wasm $(WASM_DIR)/ || \
	  cp target/$(RUST_TARGET)/release/ls.wasm $(WASM_DIR)/ || true
	cp userland/cat/target/$(RUST_TARGET)/release/cat.wasm $(WASM_DIR)/ || \
	  cp target/$(RUST_TARGET)/release/cat.wasm $(WASM_DIR)/ || true
	@echo "✓ WASM copied to $(WASM_DIR)"

# --- Next.js ---
site:
	cd site && npx next build

# --- 开发 ---
dev:
	cd site && npx next dev -p 3000 --turbopack

# --- 清理 ---
clean:
	cargo clean --manifest-path kernel/Cargo.toml
	cd userland && for d in init shell ls cat; do cargo clean --manifest-path $$d/Cargo.toml 2>/dev/null; done
	rm -rf site/.next site/public/wasm/*.wasm
	rm -rf node_modules site/node_modules
	@echo "✓ Cleaned"
