// 通知容器组件

import React, { useEffect, useRef } from 'react';

export const NotificationContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.webos) {
      (window.webos as { _internal?: { notify?: { setContainer?: (el: HTMLDivElement) => void } } })._internal?.notify?.setContainer?.(containerRef.current);
    }
  }, []);

  return (
    <div className="os-notification-container" ref={containerRef} />
  );
};
