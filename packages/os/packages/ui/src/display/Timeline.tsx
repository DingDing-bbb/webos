/**
 * @fileoverview Timeline Component
 * @module @ui/display/Timeline
 *
 * A timeline component for displaying chronological events
 * with left/right/alternate positioning and customizable icons.
 *
 * @example
 * ```tsx
 * import { Timeline } from '@ui/display';
 *
 * <Timeline mode="alternate">
 *   <Timeline.Item color="primary">Event 1</Timeline.Item>
 *   <Timeline.Item dot={<CustomIcon />}>Event 2</Timeline.Item>
 * </Timeline>
 * ```
 */

import React, { createContext, useContext, forwardRef, memo } from 'react';

// ============================================================================
// Types
// ============================================================================

export type TimelineMode = 'left' | 'right' | 'alternate';
export type TimelineColor = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';

export interface TimelineProps {
  /** Timeline mode */
  mode?: TimelineMode;
  /** Reverse order */
  reverse?: boolean;
  /** Children (TimelineItem components) */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export interface TimelineItemProps {
  /** Custom dot/icon */
  dot?: React.ReactNode;
  /** Dot color */
  color?: TimelineColor | string;
  /** Item label (positioned on the opposite side) */
  label?: React.ReactNode;
  /** Item content */
  children?: React.ReactNode;
  /** Position override (for alternate mode) */
  position?: 'left' | 'right';
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Pending state */
  pending?: boolean;
}

interface TimelineContextValue {
  mode: TimelineMode;
}

// ============================================================================
// Context
// ============================================================================

const TimelineContext = createContext<TimelineContextValue>({ mode: 'left' });

const useTimelineContext = () => useContext(TimelineContext);

// ============================================================================
// Color Utilities
// ============================================================================

const colorMap: Record<TimelineColor, string> = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  gray: 'var(--text-tertiary)',
};

const isPresetColor = (color: string): color is TimelineColor => {
  return color in colorMap;
};

const getColorValue = (color: TimelineColor | string): string => {
  if (isPresetColor(color)) {
    return colorMap[color];
  }
  return color;
};

// ============================================================================
// Timeline Dot
// ============================================================================

interface TimelineDotProps {
  color?: TimelineColor | string;
  dot?: React.ReactNode;
  pending?: boolean;
}

const TimelineDot: React.FC<TimelineDotProps> = memo(({ color = 'primary', dot, pending }) => {
  const colorValue = getColorValue(color);

  if (dot) {
    return (
      <div className={`ui-timeline-dot ${pending ? 'pending' : ''}`} style={{ color: colorValue }}>
        {dot}
      </div>
    );
  }

  return (
    <div
      className={`ui-timeline-dot ${pending ? 'pending' : ''}`}
      style={{ backgroundColor: colorValue, borderColor: colorValue }}
    >
      {pending && <div className="dot-pulse" style={{ backgroundColor: colorValue }} />}
    </div>
  );
});

TimelineDot.displayName = 'TimelineDot';

// ============================================================================
// Timeline Item
// ============================================================================

export const TimelineItem = memo(
  forwardRef<HTMLDivElement, TimelineItemProps>(
    (
      { dot, color = 'primary', label, children, position, className = '', style, pending = false },
      ref
    ) => {
      const { mode } = useTimelineContext();

      // Determine position based on mode
      const getItemPosition = (): 'left' | 'right' => {
        if (position) return position;
        if (mode === 'left') return 'left';
        if (mode === 'right') return 'right';
        // Alternate mode - we'll determine this in the parent
        return 'left';
      };

      const itemPosition = getItemPosition();

      const itemClasses = [
        'ui-timeline-item',
        `ui-timeline-item-${mode === 'alternate' ? position || 'left' : itemPosition}`,
        pending ? 'ui-timeline-item-pending' : '',
        label ? 'has-label' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      const colorValue = getColorValue(color);

      return (
        <div ref={ref} className={itemClasses} style={style}>
          {/* Label */}
          {label && (
            <div
              className="ui-timeline-item-label"
              style={
                mode === 'alternate' && itemPosition === 'right'
                  ? { textAlign: 'left' }
                  : { textAlign: 'right' }
              }
            >
              {label}
            </div>
          )}

          {/* Tail */}
          {!pending && (
            <div
              className="ui-timeline-item-tail"
              style={dot ? { borderLeftColor: colorValue } : undefined}
            />
          )}

          {/* Head/Dot */}
          <div className="ui-timeline-item-head">
            <TimelineDot color={color} dot={dot} pending={pending} />
          </div>

          {/* Content */}
          <div className="ui-timeline-item-content">{children}</div>
        </div>
      );
    }
  )
);

TimelineItem.displayName = 'TimelineItem';

// ============================================================================
// Main Timeline Component
// ============================================================================

export const Timeline: React.FC<TimelineProps> & {
  Item: typeof TimelineItem;
} = ({ mode = 'left', reverse = false, children, className = '', style }) => {
  const contextValue: TimelineContextValue = { mode };

  // Process children to add position for alternate mode
  const processChildren = () => {
    const childArray = React.Children.toArray(children);
    const items = reverse ? childArray.reverse() : childArray;

    if (mode !== 'alternate') {
      return items;
    }

    return items.map((child, index) => {
      if (React.isValidElement<TimelineItemProps>(child)) {
        // Check if the child already has a position prop
        if (child.props.position) {
          return child;
        }
        // Determine position based on index for alternate mode
        const position = index % 2 === 0 ? 'left' : 'right';
        return React.cloneElement(child, { position });
      }
      return child;
    });
  };

  const timelineClasses = ['ui-timeline', `ui-timeline-${mode}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <TimelineContext.Provider value={contextValue}>
      <div className={timelineClasses} style={style}>
        {processChildren()}
      </div>
    </TimelineContext.Provider>
  );
};

Timeline.Item = TimelineItem;

// ============================================================================
// Timeline with Pending State
// ============================================================================

export interface TimelineWithPendingProps extends TimelineProps {
  /** Pending node (shown at the end) */
  pending?: React.ReactNode;
  /** Pending dot */
  pendingDot?: React.ReactNode;
}

export const TimelineWithPending: React.FC<TimelineWithPendingProps> = ({
  pending,
  pendingDot,
  children,
  ...props
}) => {
  return (
    <Timeline {...props}>
      {children}
      {pending && (
        <TimelineItem pending dot={pendingDot || <PendingDot />} color="gray">
          {pending}
        </TimelineItem>
      )}
    </Timeline>
  );
};

const PendingDot: React.FC = () => (
  <div className="ui-timeline-pending-dot">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
    </svg>
  </div>
);

// ============================================================================
// Timeline Group
// ============================================================================

export interface TimelineGroupProps {
  /** Group label */
  label?: React.ReactNode;
  /** Children */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  label,
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`ui-timeline-group ${className}`} style={style}>
      {label && <div className="ui-timeline-group-label">{label}</div>}
      <div className="ui-timeline-group-items">{children}</div>
    </div>
  );
};

export default Timeline;
