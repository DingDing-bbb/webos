/**
 * 时钟应用主组件
 * 显示当前时间并支持设置闹钟
 */
import React, { useState, useEffect, useCallback, type FC } from 'react';
import { ClockIcon } from './icon';
import { 
  formatTime, 
  formatDate, 
  isValidHour, 
  isValidMinute, 
  padTimeValue,
  calculateAlarmTime,
  type AlarmItem,
  type AlarmFormData
} from './utils';
import type { AppInfo } from '../../types';
import styles from './Clock.module.css';

interface ClockProps {
  windowId?: string;
}

export const Clock: React.FC<ClockProps> = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [showAlarmForm, setShowAlarmForm] = useState<boolean>(false);
  const [alarmFormData, setAlarmFormData] = useState<AlarmFormData>({
    hour: '08',
    minute: '00'
  });

  /**
   * 翻译函数
   */
  const translate = useCallback((key: string): string => {
    return window.webos?.i18n?.t(key) || key;
  }, []);

  /**
   * 更新时间
   */
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  /**
   * 设置闹钟
   */
  const handleSetAlarm = (): void => {
    const { hour, minute } = alarmFormData;
    if (!hour || !minute) return;

    const alarmTime = calculateAlarmTime(hour, minute);
    if (!alarmTime) return;

    const alarmId = window.webos?.time.setAlarm(alarmTime, () => {
      window.webos?.notify.show(
        translate('notify.alarm'), 
        `${formatTime(alarmTime)}`, 
        { duration: 10000 }
      );
      setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
    });

    if (alarmId) {
      setAlarms((prev) => [...prev, { id: alarmId, time: alarmTime }]);
    }

    setShowAlarmForm(false);
  };

  /**
   * 清除闹钟
   */
  const handleClearAlarm = (alarmId: string): void => {
    window.webos?.time.clearAlarm(alarmId);
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
  };

  /**
   * 处理时间输入变化
   */
  const handleHourChange = (value: string): void => {
    const paddedValue = padTimeValue(value);
    setAlarmFormData((prev) => ({
      ...prev,
      hour: paddedValue
    }));
  };

  /**
   * 处理分钟输入变化
   */
  const handleMinuteChange = (value: string): void => {
    const paddedValue = padTimeValue(value);
    setAlarmFormData((prev) => ({
      ...prev,
      minute: paddedValue
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.timeDisplay}>
        <div className={styles.time}>
          {formatTime(time)}
        </div>
        <div className={styles.date}>
          {formatDate(time)}
        </div>
      </div>

      {alarms.length > 0 && (
        <div className={styles.alarmsSection}>
          <h3 className={styles.alarmsTitle}>
            {translate('clock.setAlarm')}
          </h3>
          <div className={styles.alarmList}>
            {alarms.map((alarm) => (
              <div key={alarm.id} className={styles.alarmItem}>
                <span className={styles.alarmTime}>
                  {formatTime(alarm.time)}
                </span>
                <button
                  onClick={() => handleClearAlarm(alarm.id)}
                  className={styles.alarmDeleteButton}
                  aria-label={translate('common.delete')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAlarmForm(!showAlarmForm)}
        className={styles.alarmToggleButton}
      >
        {translate('clock.setAlarm')}
      </button>

      {showAlarmForm && (
        <div className={styles.alarmForm}>
          <input
            type="number"
            min="0"
            max="23"
            value={alarmFormData.hour}
            onChange={(e) => handleHourChange(e.target.value)}
            className={styles.timeInput}
            placeholder="HH"
            aria-label="小时"
          />
          <span className={styles.timeSeparator}>:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={alarmFormData.minute}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className={styles.timeInput}
            placeholder="MM"
            aria-label="分钟"
          />
          <button
            onClick={handleSetAlarm}
            className={styles.saveButton}
          >
            {translate('common.save')}
          </button>
        </div>
      )}
    </div>
  );
};

// 应用信息 - 放在组件定义之后
export const appInfo: AppInfo = {
  id: 'com.os.clock',
  name: 'Clock',
  nameKey: 'app.clock',
  description: 'Digital clock with alarm',
  descriptionKey: 'app.clock.desc',
  version: '1.0.0',
  category: 'utilities',
  icon: ClockIcon,
  component: Clock,
  defaultWidth: 400,
  defaultHeight: 350,
  minWidth: 300,
  minHeight: 250,
  resizable: true,
  singleton: true,
};

export default Clock;
