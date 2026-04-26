/**
 * 时钟应用工具函数
 */

/**
 * 格式化时间为 HH:MM:SS 格式
 * @param date - 要格式化的日期对象
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * 格式化日期为长格式
 * @param date - 要格式化的日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 验证小时值是否有效
 * @param hour - 小时值（字符串）
 * @returns 是否有效
 */
export const isValidHour = (hour: string): boolean => {
  const hourNum = parseInt(hour, 10);
  return !isNaN(hourNum) && hourNum >= 0 && hourNum <= 23;
};

/**
 * 验证分钟值是否有效
 * @param minute - 分钟值（字符串）
 * @returns 是否有效
 */
export const isValidMinute = (minute: string): boolean => {
  const minuteNum = parseInt(minute, 10);
  return !isNaN(minuteNum) && minuteNum >= 0 && minuteNum <= 59;
};

/**
 * 格式化时间输入值，确保两位数字
 * @param value - 输入值
 * @returns 格式化后的两位数字符串
 */
export const padTimeValue = (value: string): string => {
  return value.padStart(2, '0');
};

/**
 * 计算闹钟时间
 * @param hour - 小时
 * @param minute - 分钟
 * @returns 闹钟时间对象
 */
export const calculateAlarmTime = (hour: string, minute: string): Date | null => {
  if (!isValidHour(hour) || !isValidMinute(minute)) {
    return null;
  }

  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

  // 如果闹钟时间已过，设置为明天
  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }

  return alarmTime;
};

/**
 * 闹钟项接口
 */
export interface AlarmItem {
  id: string;
  time: Date;
}

/**
 * 闹钟表单数据接口
 */
export interface AlarmFormData {
  hour: string;
  minute: string;
}