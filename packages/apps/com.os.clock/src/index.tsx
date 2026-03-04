/**
 * 时钟应用
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ClockIcon } from './icon';

interface AlarmInfo {
  id: string;
  time: Date;
}

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState<AlarmInfo[]>([]);
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [alarmHour, setAlarmHour] = useState('08');
  const [alarmMinute, setAlarmMinute] = useState('00');

  const t = useCallback((key: string): string => {
    return window.webos?.t(key) || key;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSetAlarm = () => {
    if (!alarmHour || !alarmMinute) return;

    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(parseInt(alarmHour), parseInt(alarmMinute), 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const alarmId = window.webos?.time.setAlarm(alarmTime, () => {
      window.webos?.notify.show(t('notify.alarm'), formatTime(alarmTime), { duration: 10000 });
      setAlarms(prev => prev.filter(a => a.id !== alarmId));
    });

    if (alarmId) {
      setAlarms(prev => [...prev, { id: alarmId, time: alarmTime }]);
    }
    setShowAlarmForm(false);
  };

  const handleClearAlarm = (alarmId: string) => {
    window.webos?.time.clearAlarm(alarmId);
    setAlarms(prev => prev.filter(a => a.id !== alarmId));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '24px',
      gap: '24px',
      background: 'var(--os-color-bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '64px',
          fontWeight: '200',
          fontFamily: 'monospace',
          letterSpacing: '4px',
          color: 'var(--os-color-text)'
        }}>
          {formatTime(time)}
        </div>
        <div style={{
          fontSize: '16px',
          color: 'var(--os-color-text-secondary)',
          marginTop: '8px'
        }}>
          {formatDate(time)}
        </div>
      </div>

      {alarms.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '300px',
          borderTop: '1px solid var(--os-color-border)',
          paddingTop: '16px'
        }}>
          <h3 style={{
            fontSize: '14px',
            marginBottom: '8px',
            color: 'var(--os-color-text-secondary)'
          }}>
            {t('clock.alarms')}
          </h3>
          {alarms.map(alarm => (
            <div key={alarm.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              background: 'var(--os-color-bg-secondary)',
              marginBottom: '4px',
              borderRadius: '4px'
            }}>
              <span style={{ fontFamily: 'monospace' }}>{formatTime(alarm.time)}</span>
              <button
                onClick={() => handleClearAlarm(alarm.id)}
                style={{
                  padding: '4px 12px',
                  border: 'none',
                  background: 'var(--os-color-danger)',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAlarmForm(!showAlarmForm)}
        style={{
          padding: '10px 24px',
          border: '1px solid var(--os-color-border)',
          background: 'var(--os-color-bg-secondary)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--os-color-text)'
        }}
      >
        {t('clock.setAlarm')}
      </button>

      {showAlarmForm && (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '16px',
          background: 'var(--os-color-bg-secondary)',
          border: '1px solid var(--os-color-border)',
          borderRadius: '8px'
        }}>
          <input
            type="number"
            min="0"
            max="23"
            value={alarmHour}
            onChange={e => setAlarmHour(e.target.value.padStart(2, '0'))}
            style={{
              width: '50px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid var(--os-color-border)',
              background: 'var(--os-color-bg)',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="HH"
          />
          <span style={{ fontSize: '20px' }}>:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={alarmMinute}
            onChange={e => setAlarmMinute(e.target.value.padStart(2, '0'))}
            style={{
              width: '50px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid var(--os-color-border)',
              background: 'var(--os-color-bg)',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="MM"
          />
          <button
            onClick={handleSetAlarm}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--os-color-primary)',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('common.save')}
          </button>
        </div>
      )}
    </div>
  );
};

// 应用信息
export const appInfo = {
  id: 'com.os.clock',
  name: 'Clock',
  nameKey: 'app.clock',
  description: 'Clock and alarm application',
  version: '1.0.0',
  category: 'utilities' as const,
  icon: ClockIcon,
  component: Clock,
  defaultWidth: 400,
  defaultHeight: 350,
  minWidth: 300,
  minHeight: 250,
  singleton: true,
};

export default Clock;
