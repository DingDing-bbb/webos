/**
 * 终端应用
 */
import React, { useState, useRef, useEffect } from 'react';
import { TerminalIcon } from './icon';

interface HistoryEntry {
  command: string;
  output: string;
}

const BUILTIN_COMMANDS: Record<string, (args: string[], webos: typeof window.webos, history: HistoryEntry[]) => string> = {
  help: () => `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  ls       - List directory contents
  pwd      - Print working directory
  echo     - Print text
  whoami   - Display current user
  date     - Display current date and time
  uname    - Display system information`,
  
  clear: () => '__CLEAR__',
  
  ls: (args, webos) => {
    const path = args[0] || '/';
    if (!webos) return 'Error: File system not available';
    const items = webos.fs.list(path);
    if (items.length === 0) return '(empty directory)';
    return items.map(item => `${item.type === 'directory' ? '📁' : '📄'} ${item.name}`).join('\n');
  },
  
  pwd: () => '/home/user',
  
  echo: (args) => args.join(' '),
  
  whoami: (webos) => webos?.user.getCurrentUser()?.username || 'guest',
  
  date: () => new Date().toString(),
  
  uname: (args) => {
    if (args.includes('-a')) {
      return `${__OS_NAME__} ${__OS_VERSION__} WebBrowser x86_64`;
    }
    return __OS_NAME__;
  },
  
  history: (_, __, history) => {
    return history.map((entry, i) => `  ${i + 1}  ${entry.command}`).join('\n') || 'No commands in history';
  },
};

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const historyIndex = useRef<number>(-1);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const processCommand = (cmd: string): string => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!command) return '';

    if (BUILTIN_COMMANDS[command]) {
      return BUILTIN_COMMANDS[command](args, window.webos, history);
    }

    return `${__OS_NAME__}: command not found: ${command}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const output = processCommand(cmd);
    
    if (output === '__CLEAR__') {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, { command: cmd, output }]);
    }
    
    setInput('');
    historyIndex.current = -1;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex.current < history.length - 1) {
        historyIndex.current++;
        setInput(history[history.length - 1 - historyIndex.current].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex.current > 0) {
        historyIndex.current--;
        setInput(history[history.length - 1 - historyIndex.current].command);
      } else if (historyIndex.current === 0) {
        historyIndex.current = -1;
        setInput('');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1E1E1E',
        color: '#D4D4D4',
        fontFamily: 'monospace',
        fontSize: '14px',
        padding: '8px',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={outputRef} style={{ flex: 1, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
        <div style={{ color: '#6A9955' }}>
          {`Welcome to ${__OS_NAME__} Terminal v${__OS_VERSION__}`}
        </div>
        <div style={{ color: '#6A9955', marginBottom: '8px' }}>
          Type 'help' for available commands.
        </div>

        {history.map((entry, index) => (
          <div key={index}>
            <div style={{ color: '#4EC9B0' }}>
              {`user@${__OS_NAME__.toLowerCase()}:~$ `}
              <span style={{ color: '#D4D4D4' }}>{entry.command}</span>
            </div>
            {entry.output && <div>{entry.output}</div>}
          </div>
        ))}

        <form onSubmit={handleSubmit} style={{ display: 'inline' }}>
          <span style={{ color: '#4EC9B0' }}>
            {`user@${__OS_NAME__.toLowerCase()}:~$ `}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#D4D4D4',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              width: 'calc(100% - 150px)',
            }}
          />
        </form>
      </div>
    </div>
  );
};

// 应用信息
export const appInfo = {
  id: 'com.os.terminal',
  name: 'Terminal',
  nameKey: 'app.terminal',
  description: 'Command line terminal',
  version: '1.0.0',
  category: 'development' as const,
  icon: TerminalIcon,
  component: Terminal,
  defaultWidth: 650,
  defaultHeight: 400,
  minWidth: 400,
  minHeight: 250,
};

export default Terminal;
