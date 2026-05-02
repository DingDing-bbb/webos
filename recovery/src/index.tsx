/**
 * Recovery Mode - 恢复模式
 */

import React, { useState } from 'react';

const OS_NAME = 'WebOS';
const OS_VERSION = '0.1.0';

interface RecoveryModeProps {
  status: { message?: string; progress?: number };
  onRetry: () => void;
  onReset: () => void;
  onRecoverFromCache: () => void;
}

export const RecoveryMode: React.FC<RecoveryModeProps> = ({
  status,
  onRetry,
  onReset,
  onRecoverFromCache,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a1a 100%)',
        color: '#fff', fontFamily: 'system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ marginBottom: 30, textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 300, color: '#f44336' }}>{OS_NAME}</div>
        <div style={{ color: '#f44336', fontSize: 14, marginTop: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
          Recovery Mode
        </div>
      </div>

      <div style={{
        background: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)',
        borderRadius: 8, padding: '20px 30px', marginBottom: 30, maxWidth: 500, width: '100%',
      }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 18, color: '#f44336' }}>System Error</h2>
        <p style={{ color: '#ccc', fontSize: 14 }}>{status.message || 'An error occurred during boot.'}</p>
        <button onClick={() => setShowDetails(!showDetails)} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          color: '#888', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
        }}>
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 15, marginBottom: 20,
          maxWidth: 500, width: '100%', maxHeight: 200, overflow: 'auto', fontSize: 12,
          fontFamily: 'monospace', color: '#aaa',
        }}>
          Boot stage: {status.progress}% | Message: {status.message || 'N/A'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, width: '100%' }}>
        <button onClick={onRecoverFromCache} style={{
          background: 'linear-gradient(135deg, #2196f3, #1976d2)', border: 'none',
          borderRadius: 8, padding: '15px 20px', color: '#fff', fontSize: 14, cursor: 'pointer',
        }}>
          Restore from Cache
        </button>
        <button onClick={onRetry} style={{
          background: 'linear-gradient(135deg, #4caf50, #388e3c)', border: 'none',
          borderRadius: 8, padding: '15px 20px', color: '#fff', fontSize: 14, cursor: 'pointer',
        }}>
          Retry Boot
        </button>
        <button onClick={onReset} style={{
          background: 'rgba(244,67,54,0.2)', border: '1px solid rgba(244,67,54,0.3)',
          borderRadius: 8, padding: '15px 20px', color: '#f44336', fontSize: 14, cursor: 'pointer',
        }}>
          Reset System
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: 20, color: '#444', fontSize: 11 }}>
        {OS_NAME} v{OS_VERSION} | Recovery Mode
      </div>
    </div>
  );
};

export default RecoveryMode;
