// 窗口管理器 - 使用自定义元素实现

import type { WindowOptions, WindowState } from '../types';

// 窗口自定义元素
class OSWindow extends HTMLElement {
  private state: WindowState;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartWindowX = 0;
  private dragStartWindowY = 0;
  private isDragging = false;
  private resizeDirection = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private resizeStartX_pos = 0;
  private resizeStartY_pos = 0;
  private headerEl: HTMLElement | null = null;
  private contentEl: HTMLElement | null = null;
  private pendingContent: string | HTMLElement | null = null;
  private isRendered = false;
  private onCloseCallback: (() => void) | null = null;
  private onMinimizeCallback: (() => void) | null = null;
  private onMaximizeCallback: (() => void) | null = null;
  private onFocusCallback: (() => void) | null = null;

  // Touch support
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartWindowX = 0;
  private touchStartWindowY = 0;
  private isTouchDragging = false;
  private lastTapTime = 0;
  private lastTapX = 0;
  private lastTapY = 0;
  private touchResizeDirection = '';
  private touchResizeStartX = 0;
  private touchResizeStartY = 0;
  private touchResizeStartWidth = 0;
  private touchResizeStartHeight = 0;
  private touchResizeStartX_pos = 0;
  private touchResizeStartY_pos = 0;

  static get observedAttributes() {
    return ['data-window-id', 'data-active'];
  }

  constructor() {
    super();
    this.state = this.createDefaultState();
  }

  private createDefaultState(): WindowState {
    return {
      id: '',
      title: 'Window',
      x: 100,
      y: 100,
      width: 600,
      height: 400,
      minWidth: 200,
      minHeight: 150,
      isMinimized: false,
      isMaximized: false,
      isActive: true,
      zIndex: 1,
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
    };
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.isRendered = true;

    // 恢复待处理的内容
    if (this.pendingContent && this.contentEl) {
      if (typeof this.pendingContent === 'string') {
        this.contentEl.innerHTML = this.pendingContent;
      } else {
        this.contentEl.innerHTML = '';
        this.contentEl.appendChild(this.pendingContent);
      }
      this.pendingContent = null;
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
    this.isRendered = false;
  }

  private render() {
    const s = this.state;

    this.className = 'os-window';
    this.style.cssText = `
      position: absolute;
      left: ${s.x}px;
      top: ${s.y}px;
      width: ${s.width}px;
      height: ${s.height}px;
      z-index: ${s.zIndex};
      display: ${s.isMinimized ? 'none' : 'flex'};
      flex-direction: column;
    `;

    this.innerHTML = `
      <div class="os-window-header" part="header">
        <div class="os-window-controls">
          ${s.closable ? '<button class="os-window-btn close" title="Close" aria-label="Close window"></button>' : ''}
          ${s.minimizable ? '<button class="os-window-btn minimize" title="Minimize" aria-label="Minimize window"></button>' : ''}
          ${s.maximizable ? '<button class="os-window-btn maximize" title="Maximize" aria-label="Maximize window"></button>' : ''}
        </div>
        <div class="os-window-title">${s.title}</div>
      </div>
      <div class="os-window-content" part="content"></div>
      ${
        s.resizable
          ? `
        <div class="os-window-resize-handle nw" data-dir="nw"></div>
        <div class="os-window-resize-handle n" data-dir="n"></div>
        <div class="os-window-resize-handle ne" data-dir="ne"></div>
        <div class="os-window-resize-handle e" data-dir="e"></div>
        <div class="os-window-resize-handle se" data-dir="se"></div>
        <div class="os-window-resize-handle s" data-dir="s"></div>
        <div class="os-window-resize-handle sw" data-dir="sw"></div>
        <div class="os-window-resize-handle w" data-dir="w"></div>
      `
          : ''
      }
    `;

    this.headerEl = this.querySelector('.os-window-header');
    this.contentEl = this.querySelector('.os-window-content');

    if (s.isActive) {
      this.classList.add('active');
      this.setAttribute('data-active', 'true');
    }
  }

  private attachEventListeners() {
    // 拖拽标题栏 - 鼠标事件
    this.headerEl?.addEventListener('mousedown', this.handleDragStart);

    // 拖拽标题栏 - 触摸事件
    this.headerEl?.addEventListener('touchstart', this.handleTouchStart, { passive: false });

    // 控制按钮
    this.querySelector('.os-window-btn.close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onCloseCallback?.();
    });

    this.querySelector('.os-window-btn.minimize')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onMinimizeCallback?.();
    });

    this.querySelector('.os-window-btn.maximize')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onMaximizeCallback?.();
    });

    // 缩放手柄 - 鼠标事件
    this.querySelectorAll('.os-window-resize-handle').forEach((handle) => {
      handle.addEventListener('mousedown', this.handleResizeStart as EventListener);
      // 触摸事件
      handle.addEventListener('touchstart', this.handleTouchResizeStart as EventListener, {
        passive: false,
      });
    });

    // 焦点 - 鼠标事件
    this.addEventListener('mousedown', () => {
      this.onFocusCallback?.();
    });

    // 焦点 - 触摸事件
    this.addEventListener(
      'touchstart',
      () => {
        this.onFocusCallback?.();
      },
      { passive: true }
    );
  }

  private removeEventListeners() {
    // 鼠标事件
    this.headerEl?.removeEventListener('mousedown', this.handleDragStart);
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);

    // 触摸事件
    this.headerEl?.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchmove', this.handleTouchResizeMove);
    document.removeEventListener('touchend', this.handleTouchResizeEnd);
  }

  private handleDragStart = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('os-window-btn')) return;
    if (this.state.isMaximized) return;

    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartWindowX = this.state.x;
    this.dragStartWindowY = this.state.y;

    // 添加拖动样式类，禁用 transition
    this.classList.add('dragging');

    // 绑定全局事件
    document.addEventListener('mousemove', this.handleDragMove, { passive: true });
    document.addEventListener('mouseup', this.handleDragEnd);

    e.preventDefault();
  };

  private handleDragMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    this.state.x = this.dragStartWindowX + dx;
    this.state.y = Math.max(0, this.dragStartWindowY + dy);

    // 直接更新样式，不触发重排
    this.style.left = `${this.state.x}px`;
    this.style.top = `${this.state.y}px`;
  };

  private handleDragEnd = () => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.classList.remove('dragging');

    // 检查窗口吸附
    this.checkSnapToScreenEdge();

    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
  };

  /**
   * 检查并应用窗口屏幕边缘吸附
   */
  private checkSnapToScreenEdge(): void {
    if (this.state.isMaximized) return;

    const windowWidth = this.state.width;
    const windowHeight = this.state.height;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const edgeThreshold = 32; // 吸附阈值，距离多少像素时触发吸附
    const snapMargin = 8; // 吸附后与边缘的距离

    let newX = this.state.x;
    let newY = Math.max(0, this.state.y);
    let snapped = false;

    // 左侧吸附
    if (Math.abs(this.state.x) <= edgeThreshold) {
      newX = snapMargin;
      snapped = true;
    }
    // 右侧吸附  
    else if (Math.abs(this.state.x + windowWidth - screenWidth) <= edgeThreshold) {
      newX = screenWidth - windowWidth - snapMargin;
      snapped = true;
    }
    // 顶部吸附
    if (Math.abs(this.state.y) <= edgeThreshold) {
      newY = snapMargin;
      snapped = true;
    }

    // 左右并排吸附（半屏宽度）
    if (!snapped) {
      const halfScreenWidth = Math.floor(screenWidth / 2);
      const quarterScreenWidth = Math.floor(screenWidth / 4);
      
      // 检查窗口是否接近屏幕左半部分中心
      if (Math.abs(this.state.x - quarterScreenWidth) <= edgeThreshold) {
        newX = snapMargin;
        newY = Math.max(0, this.state.y);
        this.state.width = halfScreenWidth - snapMargin * 2;
        this.state.height = Math.min(screenHeight - 48 - snapMargin, this.state.height);
        snapped = true;
      }
      // 检查窗口是否接近屏幕右半部分中心
      else if (Math.abs(this.state.x + windowWidth - (screenWidth - quarterScreenWidth)) <= edgeThreshold) {
        newX = screenWidth - halfScreenWidth - snapMargin;
        newY = Math.max(0, this.state.y);
        this.state.width = halfScreenWidth - snapMargin * 2;
        this.state.height = Math.min(screenHeight - 48 - snapMargin, this.state.height);
        snapped = true;
      }
    }

    // 全屏最大化吸附（拖到屏幕顶部）
    if (this.state.y <= edgeThreshold && this.state.x <= edgeThreshold && 
        this.state.x + windowWidth >= screenWidth - edgeThreshold) {
      // 延迟执行最大化，避免与拖拽冲突
      setTimeout(() => {
        if (this.state.maximizable) {
          this.onMaximizeCallback?.();
        }
      }, 50);
      return;
    }

    // 如果有吸附，更新窗口位置和大小
    if (snapped) {
      this.state.x = newX;
      this.state.y = newY;
      
      // 添加吸附动画类
      this.classList.add('snapping');
      
      // 更新样式
      this.style.left = `${newX}px`;
      this.style.top = `${newY}px`;
      this.style.width = `${this.state.width}px`;
      this.style.height = `${this.state.height}px`;
      
      // 移除吸附动画类
      setTimeout(() => {
        this.classList.remove('snapping');
      }, 200);
    }
  }

  private handleResizeStart = (e: MouseEvent) => {
    if (this.state.isMaximized) return;

    const target = e.target as HTMLElement;
    this.resizeDirection = target.dataset.dir || '';
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.resizeStartWidth = this.state.width;
    this.resizeStartHeight = this.state.height;
    this.resizeStartX_pos = this.state.x;
    this.resizeStartY_pos = this.state.y;

    // 添加拖动样式类，禁用 transition
    this.classList.add('resizing');

    // 绑定全局事件
    document.addEventListener('mousemove', this.handleResizeMove, { passive: true });
    document.addEventListener('mouseup', this.handleResizeEnd);

    e.preventDefault();
    e.stopPropagation();
  };

  private handleResizeMove = (e: MouseEvent) => {
    if (!this.resizeDirection) return;

    const dx = e.clientX - this.resizeStartX;
    const dy = e.clientY - this.resizeStartY;
    const dir = this.resizeDirection;
    const minW = this.state.minWidth;
    const minH = this.state.minHeight;

    let newWidth = this.resizeStartWidth;
    let newHeight = this.resizeStartHeight;
    let newX = this.resizeStartX_pos;
    let newY = this.resizeStartY_pos;

    // 根据方向计算新尺寸
    if (dir.includes('e')) newWidth = Math.max(minW, this.resizeStartWidth + dx);
    if (dir.includes('w')) {
      newWidth = Math.max(minW, this.resizeStartWidth - dx);
      if (newWidth > minW) newX = this.resizeStartX_pos + dx;
    }
    if (dir.includes('s')) newHeight = Math.max(minH, this.resizeStartHeight + dy);
    if (dir.includes('n')) {
      newHeight = Math.max(minH, this.resizeStartHeight - dy);
      if (newHeight > minH) newY = Math.max(0, this.resizeStartY_pos + dy);
    }

    this.state.width = newWidth;
    this.state.height = newHeight;
    this.state.x = newX;
    this.state.y = newY;

    this.style.width = `${newWidth}px`;
    this.style.height = `${newHeight}px`;
    this.style.left = `${newX}px`;
    this.style.top = `${newY}px`;
  };

  private handleResizeEnd = () => {
    if (!this.resizeDirection) return;

    this.resizeDirection = '';
    this.classList.remove('resizing');

    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
  };

  // ========================================
  // Touch Event Handlers
  // ========================================

  private handleTouchStart = (e: TouchEvent) => {
    if ((e.target as HTMLElement).classList.contains('os-window-btn')) return;
    if (this.state.isMaximized) return;

    const touch = e.touches[0];
    if (!touch) return;

    e.preventDefault();

    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartWindowX = this.state.x;
    this.touchStartWindowY = this.state.y;
    this.isTouchDragging = false;

    // Check for double tap to maximize
    const now = Date.now();
    const timeDiff = now - this.lastTapTime;

    if (
      timeDiff < 300 &&
      Math.abs(touch.clientX - this.lastTapX) < 30 &&
      Math.abs(touch.clientY - this.lastTapY) < 30
    ) {
      // Double tap - toggle maximize
      if (this.state.maximizable) {
        this.onMaximizeCallback?.();
      }
      this.lastTapTime = 0;
      return;
    }

    this.lastTapTime = now;
    this.lastTapX = touch.clientX;
    this.lastTapY = touch.clientY;

    this.classList.add('dragging');

    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);
  };

  private handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;

    // Start dragging only after moving a bit (to distinguish from tap)
    if (!this.isTouchDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this.isTouchDragging = true;
    }

    if (!this.isTouchDragging) return;

    e.preventDefault();

    this.state.x = this.touchStartWindowX + dx;
    this.state.y = Math.max(0, this.touchStartWindowY + dy);

    this.style.left = `${this.state.x}px`;
    this.style.top = `${this.state.y}px`;
  };

  private handleTouchEnd = () => {
    const wasDragging = this.isTouchDragging;
    this.isTouchDragging = false;
    this.classList.remove('dragging');

    // 检查窗口吸附（仅在拖拽后进行）
    if (wasDragging) {
      this.checkSnapToScreenEdge();
    }

    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  };

  private handleTouchResizeStart = (e: TouchEvent) => {
    if (this.state.isMaximized) return;

    const touch = e.touches[0];
    if (!touch) return;

    const target = e.target as HTMLElement;
    this.touchResizeDirection = target.dataset.dir || '';

    if (!this.touchResizeDirection) return;

    e.preventDefault();
    e.stopPropagation();

    this.touchResizeStartX = touch.clientX;
    this.touchResizeStartY = touch.clientY;
    this.touchResizeStartWidth = this.state.width;
    this.touchResizeStartHeight = this.state.height;
    this.touchResizeStartX_pos = this.state.x;
    this.touchResizeStartY_pos = this.state.y;

    this.classList.add('resizing');

    document.addEventListener('touchmove', this.handleTouchResizeMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchResizeEnd);
  };

  private handleTouchResizeMove = (e: TouchEvent) => {
    if (!this.touchResizeDirection) return;

    const touch = e.touches[0];
    if (!touch) return;

    e.preventDefault();

    const dx = touch.clientX - this.touchResizeStartX;
    const dy = touch.clientY - this.touchResizeStartY;
    const dir = this.touchResizeDirection;
    const minW = this.state.minWidth;
    const minH = this.state.minHeight;

    let newWidth = this.touchResizeStartWidth;
    let newHeight = this.touchResizeStartHeight;
    let newX = this.touchResizeStartX_pos;
    let newY = this.touchResizeStartY_pos;

    if (dir.includes('e')) newWidth = Math.max(minW, this.touchResizeStartWidth + dx);
    if (dir.includes('w')) {
      newWidth = Math.max(minW, this.touchResizeStartWidth - dx);
      if (newWidth > minW) newX = this.touchResizeStartX_pos + dx;
    }
    if (dir.includes('s')) newHeight = Math.max(minH, this.touchResizeStartHeight + dy);
    if (dir.includes('n')) {
      newHeight = Math.max(minH, this.touchResizeStartHeight - dy);
      if (newHeight > minH) newY = Math.max(0, this.touchResizeStartY_pos + dy);
    }

    this.state.width = newWidth;
    this.state.height = newHeight;
    this.state.x = newX;
    this.state.y = newY;

    this.style.width = `${newWidth}px`;
    this.style.height = `${newHeight}px`;
    this.style.left = `${newX}px`;
    this.style.top = `${newY}px`;
  };

  private handleTouchResizeEnd = () => {
    this.touchResizeDirection = '';
    this.classList.remove('resizing');

    document.removeEventListener('touchmove', this.handleTouchResizeMove);
    document.removeEventListener('touchend', this.handleTouchResizeEnd);
  };

  // 公共 API
  setState(newState: Partial<WindowState>) {
    Object.assign(this.state, newState);

    // 只有在 DOM 已渲染后才更新样式，避免覆盖内容
    if (this.isRendered) {
      this.updateStyles();
    }
  }

  private updateStyles() {
    const s = this.state;
    this.style.left = `${s.x}px`;
    this.style.top = `${s.y}px`;
    this.style.width = `${s.width}px`;
    this.style.height = `${s.height}px`;
    this.style.zIndex = String(s.zIndex);
    this.style.display = s.isMinimized ? 'none' : 'flex';

    if (s.isActive) {
      this.classList.add('active');
      this.setAttribute('data-active', 'true');
    } else {
      this.classList.remove('active');
      this.removeAttribute('data-active');
    }
  }

  getState(): WindowState {
    return { ...this.state };
  }

  setContent(content: string | HTMLElement) {
    if (!this.contentEl) {
      // DOM 未就绪，保存内容等待 connectedCallback
      this.pendingContent = content;
      return;
    }

    if (typeof content === 'string') {
      this.contentEl.innerHTML = content;
    } else {
      this.contentEl.innerHTML = '';
      this.contentEl.appendChild(content);
    }
  }

  getContentElement(): HTMLElement | null {
    return this.contentEl;
  }

  on(event: 'close' | 'minimize' | 'maximize' | 'focus', callback: () => void) {
    switch (event) {
      case 'close':
        this.onCloseCallback = callback;
        break;
      case 'minimize':
        this.onMinimizeCallback = callback;
        break;
      case 'maximize':
        this.onMaximizeCallback = callback;
        break;
      case 'focus':
        this.onFocusCallback = callback;
        break;
    }
  }

  minimize() {
    this.state.isMinimized = true;

    // 添加最小化动画
    this.classList.add('minimizing');
    this.style.transform = 'scale(0.1)';
    this.style.opacity = '0';

    // 动画结束后隐藏
    setTimeout(() => {
      this.style.display = 'none';
      this.classList.remove('minimizing');
      this.style.transform = '';
      this.style.opacity = '';
    }, 200);
  }

  restore() {
    this.state.isMinimized = false;
    this.style.display = 'flex';

    // 添加恢复动画
    this.classList.add('restoring');
    this.style.transform = 'scale(0.1)';
    this.style.opacity = '0';

    // 触发重绘
    void this.offsetWidth;

    this.style.transform = '';
    this.style.opacity = '';

    setTimeout(() => {
      this.classList.remove('restoring');
    }, 200);
  }

  maximize() {
    // 添加动画类
    this.classList.add('animating');

    if (this.state.isMaximized) {
      // 恢复 - 圆角从 0 恢复到 8px
      this.classList.remove('maximized');
      this.classList.add('unmaximizing');

      this.state.isMaximized = false;
      this.state.x = this.state.restoreX || 100;
      this.state.y = this.state.restoreY || 100;
      this.state.width = this.state.restoreWidth || 600;
      this.state.height = this.state.restoreHeight || 400;

      this.style.left = `${this.state.x}px`;
      this.style.top = `${this.state.y}px`;
      this.style.width = `${this.state.width}px`;
      this.style.height = `${this.state.height}px`;

      // 动画结束后清理
      setTimeout(() => {
        this.classList.remove('animating', 'unmaximizing');
      }, 200);
    } else {
      // 最大化 - 圆角从 8px 变为 0
      this.classList.add('maximizing');

      // 保存当前位置和大小
      this.state.restoreX = this.state.x;
      this.state.restoreY = this.state.y;
      this.state.restoreWidth = this.state.width;
      this.state.restoreHeight = this.state.height;
      this.state.isMaximized = true;
      this.state.x = 0;
      this.state.y = 0;
      this.state.width = window.innerWidth;
      this.state.height = window.innerHeight - 48; // 减去任务栏高度

      this.style.left = `${this.state.x}px`;
      this.style.top = `${this.state.y}px`;
      this.style.width = `${this.state.width}px`;
      this.style.height = `${this.state.height}px`;

      // 延迟添加 maximized 类，让动画平滑
      setTimeout(() => {
        this.classList.add('maximized');
        this.classList.remove('maximizing', 'animating');
      }, 200);
    }
  }

  focus() {
    this.state.isActive = true;
    this.classList.add('active');
    this.setAttribute('data-active', 'true');
  }

  blur() {
    this.state.isActive = false;
    this.classList.remove('active');
    this.removeAttribute('data-active');
  }
}

// 注册自定义元素（仅在浏览器环境）
if (typeof window !== 'undefined' && !customElements.get('os-window')) {
  customElements.define('os-window', OSWindow);
}

// 窗口管理器
class WindowManager {
  private windows: Map<string, OSWindow> = new Map();
  private nextZIndex = 100;
  private activeWindowId: string | null = null;
  private container: HTMLElement | null = null;
  private windowIdCounter = 0;
  
  // 层叠布局偏移步长
  private CASCADE_OFFSET_X = 30;
  private CASCADE_OFFSET_Y = 30;
  private CASCADE_MAX_WINDOWS = 5; // 最大层叠窗口数
  
  /**
   * 计算新窗口的层叠位置
   * 返回 { x: number, y: number }
   */
  private calculateCascadePosition(): { x: number, y: number } {
    const windowCount = this.windows.size;
    
    // 如果窗口太多，重置偏移（循环）
    const cascadeIndex = windowCount % this.CASCADE_MAX_WINDOWS;
    
    // 基础位置
    const baseX = 50 + Math.floor(windowCount / this.CASCADE_MAX_WINDOWS) * 100;
    const baseY = 50 + Math.floor(windowCount / this.CASCADE_MAX_WINDOWS) * 100;
    
    // 计算偏移
    const x = baseX + cascadeIndex * this.CASCADE_OFFSET_X;
    const y = baseY + cascadeIndex * this.CASCADE_OFFSET_Y;
    
    // 确保不超过屏幕边界
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      x: Math.min(x, screenWidth - 400), // 至少留400像素宽度
      y: Math.min(y, screenHeight - 200), // 至少留200像素高度（减去任务栏）
    };
  }

  setContainer(element: HTMLElement) {
    this.container = element;
    console.log('[WindowManager] Container set:', element);
  }

  open(options: WindowOptions): string {
    const id = options.id || `window-${++this.windowIdCounter}`;
    console.log('[WindowManager] Opening window:', id, options);

    // 创建窗口实例
    const windowEl = document.createElement('os-window') as OSWindow;
    windowEl.setAttribute('data-window-id', id);

    // 计算窗口位置：如果用户提供了x/y，使用用户设置，否则使用层叠布局
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    let x = options.x;
    let y = options.y;
    
    if (x === undefined || y === undefined) {
      const cascadePos = this.calculateCascadePosition();
      x = cascadePos.x;
      y = cascadePos.y;
    }
    
    // 确保窗口在屏幕内
    const width = options.width || 600;
    const height = options.height || 400;
    
    if (x + width > screenWidth) {
      x = Math.max(0, screenWidth - width - 50);
    }
    if (y + height > screenHeight) {
      y = Math.max(0, screenHeight - height - 80); // 减去任务栏高度
    }

    const state: WindowState = {
      id,
      title: options.title || 'Window',
      x,
      y,
      width,
      height,
      minWidth: options.minWidth || 200,
      minHeight: options.minHeight || 150,
      isMinimized: false,
      isMaximized: false,
      isActive: true,
      zIndex: this.nextZIndex++,
      resizable: options.resizable ?? true,
      minimizable: options.minimizable ?? true,
      maximizable: options.maximizable ?? true,
      closable: options.closable ?? true,
      appId: options.appId,
    };

    windowEl.setState(state);

    // 设置内容
    if (options.content) {
      windowEl.setContent(options.content);
    }

    // 绑定事件
    windowEl.on('close', () => this.close(id));
    windowEl.on('minimize', () => this.minimize(id));
    windowEl.on('maximize', () => this.maximize(id));
    windowEl.on('focus', () => this.focus(id));

    // 添加到容器
    if (this.container) {
      console.log('[WindowManager] Appending window to container:', this.container);
      this.container.appendChild(windowEl);
    } else {
      console.error('[WindowManager] No container set! Window will not be visible.');
    }

    this.windows.set(id, windowEl);
    this.focus(id);

    return id;
  }

  close(windowId: string) {
    const windowEl = this.windows.get(windowId);
    if (windowEl) {
      windowEl.remove();
      this.windows.delete(windowId);
    }
  }

  minimize(windowId: string) {
    const windowEl = this.windows.get(windowId);
    windowEl?.minimize();
  }

  maximize(windowId: string) {
    const windowEl = this.windows.get(windowId);
    windowEl?.maximize();
  }

  restore(windowId: string) {
    const windowEl = this.windows.get(windowId);
    windowEl?.restore();
  }

  focus(windowId: string) {
    // 取消之前的焦点
    if (this.activeWindowId && this.activeWindowId !== windowId) {
      const prevWindow = this.windows.get(this.activeWindowId);
      prevWindow?.blur();
    }

    const windowEl = this.windows.get(windowId);
    if (windowEl) {
      windowEl.setState({ zIndex: this.nextZIndex++ });
      windowEl.focus();
      this.activeWindowId = windowId;
    }
  }

  getAll(): WindowState[] {
    return Array.from(this.windows.values()).map((w) => w.getState());
  }

  getWindow(windowId: string): OSWindow | undefined {
    return this.windows.get(windowId);
  }

  getActiveWindow(): OSWindow | undefined {
    if (this.activeWindowId) {
      return this.windows.get(this.activeWindowId);
    }
    return undefined;
  }

  /**
   * 层叠排列所有窗口
   */
  cascadeWindows(): void {
    const windows = Array.from(this.windows.values());
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    const cols = Math.ceil(Math.sqrt(windows.length));
    const rows = Math.ceil(windows.length / cols);
    const baseWidth = Math.floor((screenWidth - 100) / cols);
    const baseHeight = Math.floor((screenHeight - 150) / rows);
    
    windows.forEach((win, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = 50 + col * (baseWidth + 10);
      const y = 50 + row * (baseHeight + 10);
      const width = Math.max(win.getState().minWidth || 200, baseWidth);
      const height = Math.max(win.getState().minHeight || 150, baseHeight);
      
      win.setState({ x, y, width, height, isMaximized: false });
      win.restore();
    });
  }

  /**
   * 平铺所有窗口（水平排列）
   */
  tileWindowsHorizontally(): void {
    const windows = Array.from(this.windows.values());
    if (windows.length === 0) return;
    
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    const windowHeight = Math.floor((screenHeight - 100) / windows.length);
    const windowWidth = screenWidth - 100;
    
    windows.forEach((win, index) => {
      const x = 50;
      const y = 50 + index * (windowHeight + 5);
      const height = Math.max(win.getState().minHeight || 150, windowHeight);
      
      win.setState({ x, y, width: windowWidth, height, isMaximized: false });
      win.restore();
    });
  }

  /**
   * 平铺所有窗口（垂直排列）
   */
  tileWindowsVertically(): void {
    const windows = Array.from(this.windows.values());
    if (windows.length === 0) return;
    
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    const windowWidth = Math.floor((screenWidth - 100) / windows.length);
    const windowHeight = screenHeight - 150;
    
    windows.forEach((win, index) => {
      const x = 50 + index * (windowWidth + 5);
      const y = 50;
      const width = Math.max(win.getState().minWidth || 200, windowWidth);
      
      win.setState({ x, y, width, height: windowHeight, isMaximized: false });
      win.restore();
    });
  }

  /**
   * 将所有窗口最小化
   */
  minimizeAll(): void {
    this.windows.forEach((win) => {
      if (win.getState().minimizable) {
        win.minimize();
      }
    });
  }

  /**
   * 将所有最小化窗口恢复
   */
  restoreAll(): void {
    this.windows.forEach((win) => {
      if (win.getState().isMinimized) {
        win.restore();
      }
    });
  }
}

export const windowManager = new WindowManager();
export { OSWindow, WindowManager };
