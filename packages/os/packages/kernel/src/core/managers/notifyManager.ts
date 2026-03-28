/**
 * Notify Manager - 通知管理
 */

import type { NotifyOptions } from '../../types';

export class NotifyManager {
  private container: HTMLElement | null = null;

  setContainer(element: HTMLElement): void {
    this.container = element;
  }

  show(title: string, message: string, options?: Partial<NotifyOptions>): void {
    if (!this.container) return;

    const notification = document.createElement('div');
    notification.className = 'os-notification';
    notification.innerHTML = `
      <div class="os-notification-header">
        <span class="os-notification-title">${title}</span>
        <button class="os-notification-close">×</button>
      </div>
      <div class="os-notification-body">${message}</div>
    `;

    const closeBtn = notification.querySelector('.os-notification-close');
    closeBtn?.addEventListener('click', () => {
      notification.remove();
    });

    this.container.appendChild(notification);

    // 自动关闭
    const duration = options?.duration || 5000;
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}
