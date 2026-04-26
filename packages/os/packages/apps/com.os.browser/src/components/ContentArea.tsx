/**
 * 内容区域组件
 * 包含Canvas渲染和新建标签页界面
 */

import React, { useRef, useEffect, type FC } from 'react';
import type { Tab } from '../types';
import { BrowserKernel, type RenderResult } from '../kernel';

interface ContentAreaProps {
  activeTab?: Tab;
  onNewTab?: () => void;
}

/**
 * 内容区域组件
 */
export const ContentArea: FC<ContentAreaProps> = ({ activeTab, onNewTab }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 渲染到Canvas
   */
  const renderToCanvas = (): void => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || !activeTab) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 绘制内容
    if (activeTab.renderResult?.layout) {
      activeTab.kernel.paint(ctx);
    }
  };

  /**
   * 处理窗口大小变化
   */
  useEffect(() => {
    const handleResize = (): void => renderToCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 监听渲染结果变化
   */
  useEffect(() => {
    if (activeTab?.renderResult?.layout) {
      requestAnimationFrame(renderToCanvas);
    }
  }, [activeTab?.renderResult]);

  if (activeTab?.url === 'about:blank') {
    return (
      <div className="browser-content" ref={containerRef}>
        <div className="browser-new-tab-page">
          <h1>WebOS Browser</h1>
          <p>Enter a URL or search term to get started</p>
          <div className="browser-quick-links">
            <button onClick={() => onNewTab?.()}>Bing</button>
            <button onClick={() => onNewTab?.()}>Google</button>
            <button onClick={() => onNewTab?.()}>GitHub</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="browser-content" ref={containerRef}>
      <canvas ref={canvasRef} className="browser-canvas" />
    </div>
  );
};

export default ContentArea;