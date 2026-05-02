/**
 * @fileoverview Calendar Component
 * @module @ui/display/Calendar
 *
 * A calendar component with month view, event markers,
 * and date selection capabilities.
 *
 * @example
 * ```tsx
 * import { Calendar } from '@webos/ui/display';
 *
 * <Calendar
 *   value={selectedDate}
 *   onChange={handleDateChange}
 *   events={[{ date: '2024-01-15', title: 'Event' }]}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback, forwardRef, memo, useRef, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CalendarEvent {
  /** Event date */
  date: string;
  /** Event title */
  title: string;
  /** Event color */
  color?: string;
  /** Event type for styling */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface CalendarProps {
  /** Selected date */
  value?: Date;
  /** Default selected date */
  defaultValue?: Date;
  /** Date change callback */
  onChange?: (date: Date) => void;
  /** Events to display */
  events?: CalendarEvent[];
  /** Disabled date function */
  disabledDate?: (date: Date) => boolean;
  /** Custom cell render function */
  cellRender?: (
    date: Date,
    info: { isCurrentMonth: boolean; isSelected: boolean; isToday: boolean }
  ) => React.ReactNode;
  /** Mode */
  mode?: 'month' | 'year';
  /** Mode change callback */
  onModeChange?: (mode: 'month' | 'year') => void;
  /** Panel change callback */
  onPanelChange?: (date: Date, mode: 'month' | 'year') => void;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** First day of week (0 = Sunday) */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Header render function */
  headerRender?: (props: {
    value: Date;
    onChange: (date: Date) => void;
    mode: 'month' | 'year';
    onModeChange: (mode: 'month' | 'year') => void;
  }) => React.ReactNode;
  /** Locale */
  locale?: {
    months?: string[];
    weekdays?: string[];
    weekdaysShort?: string[];
    today?: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LOCALE = {
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};

const WEEKDAY_CLASSES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

// ============================================================================
// Utility Functions
// ============================================================================

function getMonthDays(
  date: Date,
  firstDayOfWeek: number
): Array<{
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekNumber?: number;
}> {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Calculate the starting date (may be from previous month)
  const startDate = new Date(firstDay);
  const startDayOfWeek = startDate.getDay();
  const daysFromPrevMonth = (startDayOfWeek - firstDayOfWeek + 7) % 7;
  startDate.setDate(startDate.getDate() - daysFromPrevMonth);

  // Calculate the ending date (may be from next month)
  const endDate = new Date(lastDay);
  const endDayOfWeek = endDate.getDay();
  const daysFromNextMonth = (firstDayOfWeek - endDayOfWeek - 1 + 7) % 7;
  endDate.setDate(endDate.getDate() + daysFromNextMonth);

  // Generate all days
  const days: Array<{
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    weekNumber?: number;
  }> = [];

  const current = new Date(startDate);

  while (current <= endDate) {
    const isCurrentMonth = current.getMonth() === month;
    const isToday =
      current.getFullYear() === today.getFullYear() &&
      current.getMonth() === today.getMonth() &&
      current.getDate() === today.getDate();

    const weekNumber = getWeekNumber(current);

    // Only add week number for the first day of each week
    const isFirstDayOfWeek = current.getDay() === firstDayOfWeek;

    days.push({
      date: new Date(current),
      isCurrentMonth,
      isToday,
      weekNumber: isFirstDayOfWeek ? weekNumber : undefined,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getYearMonths(date: Date): Date[] {
  const year = date.getFullYear();
  const months: Date[] = [];
  for (let i = 0; i < 12; i++) {
    months.push(new Date(year, i, 1));
  }
  return months;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CalendarHeaderProps {
  currentDate: Date;
  mode: 'month' | 'year';
  locale: typeof DEFAULT_LOCALE;
  onPrev: () => void;
  onNext: () => void;
  onModeChange: (mode: 'month' | 'year') => void;
  onYearChange: (year: number) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = memo(
  ({ currentDate, mode, locale, onPrev, onNext, onModeChange, onYearChange }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return (
      <div className="ui-calendar-header">
        <button className="ui-calendar-nav-btn prev" onClick={onPrev} aria-label="Previous">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="ui-calendar-header-center">
          <button
            className="ui-calendar-title-btn"
            onClick={() => onModeChange(mode === 'month' ? 'year' : 'month')}
          >
            {mode === 'month' ? (
              <>
                <span className="year">{year}</span>
                <span className="month">{locale.months[month]}</span>
              </>
            ) : (
              <span className="year">{year}</span>
            )}
          </button>
        </div>

        <button className="ui-calendar-nav-btn next" onClick={onNext} aria-label="Next">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          className="ui-calendar-today-btn"
          onClick={() => {
            const today = new Date();
            onYearChange(today.getFullYear());
            onModeChange('month');
          }}
        >
          {locale.today}
        </button>
      </div>
    );
  }
);

CalendarHeader.displayName = 'CalendarHeader';

interface WeekdayHeaderProps {
  firstDayOfWeek: number;
  showWeekNumbers: boolean;
  locale: typeof DEFAULT_LOCALE;
}

const WeekdayHeader: React.FC<WeekdayHeaderProps> = memo(
  ({ firstDayOfWeek, showWeekNumbers, locale }) => {
    const weekdays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7;
      weekdays.push(locale.weekdaysShort[dayIndex]);
    }

    return (
      <div className="ui-calendar-weekdays">
        {showWeekNumbers && <div className="ui-calendar-weeknum-header">W</div>}
        {weekdays.map((day, index) => {
          const dayIndex = (firstDayOfWeek + index) % 7;
          return (
            <div key={index} className={`ui-calendar-weekday ${WEEKDAY_CLASSES[dayIndex]}`}>
              {day}
            </div>
          );
        })}
      </div>
    );
  }
);

WeekdayHeader.displayName = 'WeekdayHeader';

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  events?: CalendarEvent[];
  weekNumber?: number;
  showWeekNumbers: boolean;
  cellRender?: CalendarProps['cellRender'];
  onClick: () => void;
}

const DateCell: React.FC<DateCellProps> = memo(
  ({
    date,
    isCurrentMonth,
    isToday,
    isSelected,
    isDisabled,
    events,
    weekNumber,
    showWeekNumbers,
    cellRender,
    onClick,
  }) => {
    const dateKey = formatDateKey(date);
    const cellEvents = events?.filter((e) => e.date === dateKey);

    const cellClasses = [
      'ui-calendar-cell',
      isCurrentMonth ? 'current-month' : 'other-month',
      isToday ? 'today' : '',
      isSelected ? 'selected' : '',
      isDisabled ? 'disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

    if (cellRender) {
      return (
        <div className={cellClasses} onClick={!isDisabled ? onClick : undefined}>
          {cellRender(date, { isCurrentMonth, isSelected, isToday })}
        </div>
      );
    }

    return (
      <div className={cellClasses} onClick={!isDisabled ? onClick : undefined}>
        {showWeekNumbers && weekNumber !== undefined && (
          <div className="ui-calendar-weeknum">{weekNumber}</div>
        )}
        <div className="ui-calendar-date">
          <span className="date-number">{date.getDate()}</span>
        </div>
        {cellEvents && cellEvents.length > 0 && (
          <div className="ui-calendar-events">
            {cellEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`ui-calendar-event ${event.type || ''}`}
                style={event.color ? { backgroundColor: event.color } : undefined}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {cellEvents.length > 2 && (
              <div className="ui-calendar-event more">+{cellEvents.length - 2} more</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DateCell.displayName = 'DateCell';

interface YearCellProps {
  date: Date;
  isSelected: boolean;
  isCurrentMonth: boolean;
  locale: typeof DEFAULT_LOCALE;
  onClick: () => void;
}

const YearCell: React.FC<YearCellProps> = memo(
  ({ date, isSelected, isCurrentMonth, locale, onClick }) => {
    const month = date.getMonth();

    const cellClasses = [
      'ui-calendar-year-cell',
      isSelected ? 'selected' : '',
      isCurrentMonth ? 'current' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={cellClasses} onClick={onClick}>
        <span className="month-name">{locale.months[month]}</span>
      </div>
    );
  }
);

YearCell.displayName = 'YearCell';

// ============================================================================
// Main Component
// ============================================================================

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      events = [],
      disabledDate,
      cellRender,
      mode = 'month',
      onModeChange,
      onPanelChange,
      showWeekNumbers = false,
      firstDayOfWeek = 0,
      className = '',
      style,
      headerRender,
      locale = DEFAULT_LOCALE,
    },
    ref
  ) => {
    const mergedLocale = { ...DEFAULT_LOCALE, ...locale };

    // State
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ?? defaultValue ?? null);
    const [currentDate, setCurrentDate] = useState<Date>(value ?? defaultValue ?? new Date());
    const [currentMode, setCurrentMode] = useState<'month' | 'year'>(mode);

    // Sync with controlled value
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedDate(value);
        setCurrentDate(value);
      }
    }, [value]);

    React.useEffect(() => {
      setCurrentMode(mode);
    }, [mode]);

    // Handlers
    const handleDateSelect = useCallback(
      (date: Date) => {
        if (disabledDate?.(date)) return;

        setSelectedDate(date);
        onChange?.(date);

        // If we're in year view, switch to month view
        if (currentMode === 'year') {
          setCurrentDate(date);
          setCurrentMode('month');
          onModeChange?.('month');
        }
      },
      [disabledDate, onChange, currentMode, onModeChange]
    );

    const handlePrev = useCallback(() => {
      const newDate = new Date(currentDate);
      if (currentMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() - 1);
      }
      setCurrentDate(newDate);
      onPanelChange?.(newDate, currentMode);
    }, [currentDate, currentMode, onPanelChange]);

    const handleNext = useCallback(() => {
      const newDate = new Date(currentDate);
      if (currentMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
      setCurrentDate(newDate);
      onPanelChange?.(newDate, currentMode);
    }, [currentDate, currentMode, onPanelChange]);

    const handleModeChange = useCallback(
      (newMode: 'month' | 'year') => {
        setCurrentMode(newMode);
        onModeChange?.(newMode);
      },
      [onModeChange]
    );

    const handleYearChange = useCallback(
      (year: number) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setCurrentDate(newDate);
      },
      [currentDate]
    );

    // Memoized data
    const monthDays = useMemo(
      () => getMonthDays(currentDate, firstDayOfWeek),
      [currentDate, firstDayOfWeek]
    );

    const yearMonths = useMemo(() => getYearMonths(currentDate), [currentDate]);

    const today = useMemo(() => new Date(), []);

    // Render
    const calendarClasses = ['ui-calendar', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={calendarClasses} style={style}>
        {headerRender ? (
          headerRender({
            value: currentDate,
            onChange: (date) => {
              setCurrentDate(date);
              handleDateSelect(date);
            },
            mode: currentMode,
            onModeChange: handleModeChange,
          })
        ) : (
          <CalendarHeader
            currentDate={currentDate}
            mode={currentMode}
            locale={mergedLocale}
            onPrev={handlePrev}
            onNext={handleNext}
            onModeChange={handleModeChange}
            onYearChange={handleYearChange}
          />
        )}

        {currentMode === 'month' ? (
          <>
            <WeekdayHeader
              firstDayOfWeek={firstDayOfWeek}
              showWeekNumbers={showWeekNumbers}
              locale={mergedLocale}
            />
            <div className="ui-calendar-body">
              {monthDays.map((day, index) => (
                <DateCell
                  key={index}
                  date={day.date}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={day.isToday}
                  isSelected={selectedDate ? isSameDay(day.date, selectedDate) : false}
                  isDisabled={disabledDate?.(day.date) ?? false}
                  events={events}
                  weekNumber={day.weekNumber}
                  showWeekNumbers={showWeekNumbers}
                  cellRender={cellRender}
                  onClick={() => handleDateSelect(day.date)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="ui-calendar-year-body">
            {yearMonths.map((monthDate, index) => (
              <YearCell
                key={index}
                date={monthDate}
                isSelected={selectedDate ? isSameDay(monthDate, selectedDate) : false}
                isCurrentMonth={
                  today.getFullYear() === monthDate.getFullYear() &&
                  today.getMonth() === monthDate.getMonth()
                }
                locale={mergedLocale}
                onClick={() => handleDateSelect(monthDate)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

// ============================================================================
// Date Picker Variant
// ============================================================================

export interface DatePickerProps {
  /** Selected date */
  value?: Date;
  /** Default selected date */
  defaultValue?: Date;
  /** Date change callback */
  onChange?: (date: Date) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled date function */
  disabledDate?: (date: Date) => boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder = 'Select date',
  disabledDate,
  disabled = false,
  className = '',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ?? defaultValue ?? null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString();
  };

  return (
    <div ref={containerRef} className={`ui-datepicker ${className}`} style={style}>
      <div
        className={`ui-datepicker-input ${disabled ? 'disabled' : ''} ${isOpen ? 'focused' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedDate ? '' : 'placeholder'}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <svg
          className="ui-datepicker-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {isOpen && (
        <div className="ui-datepicker-dropdown">
          <Calendar
            value={selectedDate ?? new Date()}
            onChange={handleDateChange}
            disabledDate={disabledDate}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;
