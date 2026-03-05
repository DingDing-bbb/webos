// 文件管理器应用

import React, { useState, useEffect, useCallback } from 'react';
import type { FileSystemNode } from '@kernel/types';
import { FileManagerIcon } from './icon';
import type { AppInfo } from '../../registry';

interface FileManagerProps {
  windowId?: string;
}

// 应用信息
export const appInfo: AppInfo = {
  id: 'com.os.filemanager',
  name: 'Files',
  nameKey: 'app.fileManager',
  description: 'File system browser',
  descriptionKey: 'app.fileManager.desc',
  version: '1.0.0',
  category: 'system',
  icon: FileManagerIcon,
  component: FileManager,
  defaultWidth: 700,
  defaultHeight: 450,
  minWidth: 500,
  minHeight: 300,
  resizable: true,
  singleton: false
};

// 图标组件
const FolderIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"/>
    <path d="M14 2V8H20"/>
  </svg>
);

export const FileManager: React.FC<FileManagerProps> = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  const loadDirectory = useCallback((path: string) => {
    if (window.webos) {
      const nodes = window.webos.fs.list(path);
      setFiles(nodes);
    }
  }, []);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const handleFileDoubleClick = async (file: FileSystemNode) => {
    if (file.type === 'directory') {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      setCurrentPath(newPath);
    } else {
      // 尝试打开文件
      const filePath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      
      // 检查是否需要提权
      if (file.permissions.includes('r--') && file.owner === 'root' && !window.webos?.user.isRoot()) {
        const granted = await window.webos?.user.requestPrivilege(
          t('auth.required')
        );
        if (!granted) return;
      }

      // 检查是否是文本文件
      if (file.name.endsWith('.txt') || file.name.endsWith('.js') || file.name.endsWith('.json')) {
        const content = window.webos?.fs.read(filePath);
        if (content !== null) {
          // 打开文本编辑器
          window.webos?.window.open('text-editor', {
            title: `${file.name} - ${t('app.textEditor')}`,
            width: 700,
            height: 500,
            content: createTextEditorContent(filePath, content, file.name)
          });
        }
      }
    }
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileType = (file: FileSystemNode): string => {
    if (file.type === 'directory') return t('file.folder');
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      'txt': 'Text',
      'js': 'JavaScript',
      'json': 'JSON',
      'css': 'CSS',
      'html': 'HTML'
    };
    return types[ext] || t('file.file');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        borderBottom: '1px solid var(--os-color-border)',
        gap: '8px'
      }}>
        <button
          onClick={navigateUp}
          disabled={currentPath === '/'}
          style={{
            padding: '4px 8px',
            border: '1px solid var(--os-color-border)',
            background: 'var(--os-color-bg-secondary)',
            cursor: currentPath === '/' ? 'not-allowed' : 'pointer',
            opacity: currentPath === '/' ? 0.5 : 1
          }}
        >
          ↑
        </button>
        <div style={{
          flex: 1,
          padding: '4px 8px',
          background: 'var(--os-color-bg-secondary)',
          border: '1px solid var(--os-color-border)',
          fontFamily: 'monospace'
        }}>
          {currentPath}
        </div>
      </div>

      {/* 文件列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--os-color-bg-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--os-color-border)' }}>
                {t('file.name')}
              </th>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--os-color-border)', width: '100px' }}>
                {t('file.type')}
              </th>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--os-color-border)', width: '120px' }}>
                {t('file.permissions')}
              </th>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--os-color-border)', width: '150px' }}>
                {t('file.modified')}
              </th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--os-color-text-muted)' }}>
                  {t('file.empty')}
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  style={{
                    background: selectedFile === file.name ? 'rgba(0, 120, 212, 0.1)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {file.type === 'directory' ? <FolderIcon /> : <FileIcon />}
                    {file.name}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--os-color-text-secondary)' }}>
                    {getFileType(file)}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {file.permissions}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--os-color-text-secondary)', fontSize: '12px' }}>
                    {formatDate(file.modifiedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 创建文本编辑器内容
function createTextEditorContent(filePath: string, content: string, fileName: string): string {
  return `
    <div style="display: flex; flex-direction: column; height: 100%;">
      <div style="padding: 8px; border-bottom: 1px solid var(--os-color-border);">
        <span style="color: var(--os-color-text-secondary);">${fileName}</span>
      </div>
      <textarea id="editor-content" style="
        flex: 1;
        width: 100%;
        padding: 8px;
        border: none;
        outline: none;
        font-family: monospace;
        font-size: 14px;
        resize: none;
        background: var(--os-color-bg);
        color: var(--os-color-text);
      ">${content}</textarea>
      <div style="padding: 8px; border-top: 1px solid var(--os-color-border); display: flex; gap: 8px;">
        <button onclick="saveFile()">Save</button>
        <button onclick="window.webos.window.close(window.currentWindowId)">Cancel</button>
      </div>
    </div>
    <script>
      function saveFile() {
        const content = document.getElementById('editor-content').value;
        window.webos.fs.write('${filePath}', content);
        window.webos.window.close(window.currentWindowId);
      }
    </script>
  `;
}

export default FileManager;
