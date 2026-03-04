/**
 * 文件管理器应用
 */
import React, { useState, useEffect } from 'react';
import { registerApp } from '../../registry';
import { FileManagerIcon } from './icon';

// 注册应用
registerApp({
  id: 'com.os.filemanager',
  name: 'Files',
  nameKey: 'app.fileManager',
  description: 'File management application',
  descriptionKey: 'app.fileManagerDesc',
  version: '1.0.0',
  category: 'system',
  icon: FileManagerIcon,
  component: FileManager,
  defaultWidth: 700,
  defaultHeight: 450,
  minWidth: 400,
  minHeight: 300,
});

// 文件系统节点类型
interface FileNode {
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  size?: number;
  modifiedAt?: Date;
}

export const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState<FileNode[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = (path: string) => {
    if (!window.webos) return;
    
    const nodes = window.webos.fs.list(path);
    setItems(nodes.map(node => ({
      name: node.name,
      type: node.type,
      permissions: node.permissions,
      owner: node.owner,
      modifiedAt: node.modifiedAt,
    })));
  };

  const handleItemClick = (item: FileNode) => {
    setSelectedItem(item.name);
  };

  const handleItemDoubleClick = (item: FileNode) => {
    if (item.type === 'directory') {
      setCurrentPath(prev => prev === '/' ? `/${item.name}` : `${prev}/${item.name}`);
    }
  };

  const handleGoBack = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.length === 1 ? '/' : parts.join('/'));
  };

  const handleGoHome = () => {
    setCurrentPath('/');
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return date.toLocaleDateString();
  };

  const formatPermissions = (perms: string) => {
    return perms;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--os-color-bg)',
    }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderBottom: '1px solid var(--os-color-border)',
        background: 'var(--os-color-bg-secondary)',
      }}>
        <button
          onClick={handleGoBack}
          disabled={currentPath === '/'}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--os-color-border)',
            background: currentPath === '/' ? 'var(--os-color-bg-tertiary)' : 'var(--os-color-bg)',
            borderRadius: '4px',
            cursor: currentPath === '/' ? 'not-allowed' : 'pointer',
            opacity: currentPath === '/' ? 0.5 : 1,
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleGoHome}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--os-color-border)',
            background: 'var(--os-color-bg)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🏠 Home
        </button>
        <div style={{
          flex: 1,
          padding: '6px 12px',
          background: 'var(--os-color-bg)',
          border: '1px solid var(--os-color-border)',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}>
          {currentPath}
        </div>
      </div>

      {/* 文件列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--os-color-border)',
              textAlign: 'left',
            }}>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px', width: '100px' }}>Type</th>
              <th style={{ padding: '8px', width: '100px' }}>Permissions</th>
              <th style={{ padding: '8px', width: '100px' }}>Owner</th>
              <th style={{ padding: '8px', width: '120px' }}>Modified</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                style={{
                  background: selectedItem === item.name ? 'var(--os-color-selected)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {item.type === 'directory' ? '📁' : '📄'}
                    </span>
                    {item.name}
                  </div>
                </td>
                <td style={{ padding: '8px', color: 'var(--os-color-text-secondary)' }}>
                  {item.type}
                </td>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--os-color-text-secondary)' }}>
                  {formatPermissions(item.permissions)}
                </td>
                <td style={{ padding: '8px', color: 'var(--os-color-text-secondary)' }}>
                  {item.owner}
                </td>
                <td style={{ padding: '8px', color: 'var(--os-color-text-secondary)' }}>
                  {formatDate(item.modifiedAt)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--os-color-text-muted)' }}>
                  Empty directory
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 状态栏 */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid var(--os-color-border)',
        background: 'var(--os-color-bg-secondary)',
        fontSize: '12px',
        color: 'var(--os-color-text-secondary)',
      }}>
        {items.length} items
        {selectedItem && ` • Selected: ${selectedItem}`}
      </div>
    </div>
  );
};

export default FileManager;
