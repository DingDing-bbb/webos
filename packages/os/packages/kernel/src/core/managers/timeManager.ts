/**
 * Time Manager - 时间和闹钟管理
 */

import type { Alarm } from '../../types';

export class TimeManager {
  private alarms: Map<string, Alarm> = new Map();
  private alarmIdCounter = 0;
  private intervals: Map<string, number> = new Map();

  getCurrent(): Date {
    return new Date();
  }

  setAlarm(time: Date, callback: () => void): string {
    const id = `alarm-${++this.alarmIdCounter}`;
    const now = new Date();
    const delay = time.getTime() - now.getTime();

    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        callback();
        this.alarms.delete(id);
        this.intervals.delete(id);
      }, delay);

      this.alarms.set(id, { id, time, callback, enabled: true });
      this.intervals.set(id, timeoutId as unknown as number);
    }

    return id;
  }

  clearAlarm(alarmId: string): void {
    const timeoutId = this.intervals.get(alarmId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.intervals.delete(alarmId);
      this.alarms.delete(alarmId);
    }
  }

  getAlarms(): Alarm[] {
    return Array.from(this.alarms.values());
  }
}
