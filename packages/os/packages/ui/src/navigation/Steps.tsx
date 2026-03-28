/**
 * Steps Component - 步骤条组件
 * 支持水平/垂直、状态 wait/process/finish/error、图标自定义
 */

import React, { createContext, useContext, useMemo } from 'react';

// ========== Types ==========
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepItem {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatus;
  disabled?: boolean;
  onClick?: () => void;
}

export interface StepsProps {
  items: StepItem[];
  current?: number;
  direction?: 'horizontal' | 'vertical';
  status?: StepStatus;
  size?: 'default' | 'small';
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  onChange?: (current: number) => void;
  labelPlacement?: 'horizontal' | 'vertical';
  progressDot?: boolean;
}

interface StepsContextType {
  current: number;
  direction: 'horizontal' | 'vertical';
  status: StepStatus;
  onChange?: (current: number) => void;
  progressDot: boolean;
}

const StepsContext = createContext<StepsContextType | null>(null);

// ========== Default Icons ==========
const defaultIcons: Record<StepStatus, React.ReactNode> = {
  wait: '○',
  process: '◐',
  finish: '✓',
  error: '✕',
};

// ========== Step Component ==========
interface StepProps {
  item: StepItem;
  index: number;
  total: number;
}

const Step: React.FC<StepProps> = ({ item, index, total }) => {
  const context = useContext(StepsContext);
  if (!context) return null;

  const { current, direction, status: overallStatus, onChange, progressDot } = context;

  // Determine step status
  const getStepStatus = (): StepStatus => {
    if (item.status) return item.status;
    if (index < current) return 'finish';
    if (index === current) return overallStatus;
    return 'wait';
  };

  const stepStatus = getStepStatus();
  const isLast = index === total - 1;
  const isClickable = !item.disabled && onChange;

  const handleClick = () => {
    if (item.disabled || !onChange) return;
    onChange(index);
    item.onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
      e.preventDefault();
      handleClick();
    }
  };

  // Render icon
  const renderIcon = () => {
    if (progressDot) {
      return <span className="nav-steps-dot" />;
    }
    if (item.icon) {
      return <span className="nav-steps-icon-custom">{item.icon}</span>;
    }
    if (stepStatus === 'finish') {
      return <span className="nav-steps-icon-check">{defaultIcons.finish}</span>;
    }
    if (stepStatus === 'error') {
      return <span className="nav-steps-icon-error">{defaultIcons.error}</span>;
    }
    return <span className="nav-steps-number">{index + 1}</span>;
  };

  return (
    <div
      className={`
        nav-steps-item
        nav-steps-item-${stepStatus}
        ${item.disabled ? 'nav-steps-item-disabled' : ''}
        ${isClickable ? 'nav-steps-item-clickable' : ''}
        ${direction === 'vertical' ? 'nav-steps-item-vertical' : ''}
      `.trim()}
      role="listitem"
    >
      {/* Icon */}
      <div
        className="nav-steps-item-icon"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isClickable ? 0 : -1}
        role={isClickable ? 'button' : undefined}
        aria-current={stepStatus === 'process' ? 'step' : undefined}
      >
        {renderIcon()}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className={`nav-steps-item-tail nav-steps-item-tail-${stepStatus}`} />
      )}

      {/* Content */}
      <div className="nav-steps-item-content">
        <div className="nav-steps-item-title">{item.title}</div>
        {item.description && (
          <div className="nav-steps-item-description">{item.description}</div>
        )}
      </div>
    </div>
  );
};

// ========== Main Steps Component ==========
export const Steps: React.FC<StepsProps> = ({
  items,
  current = 0,
  direction = 'horizontal',
  status = 'process',
  size = 'default',
  className = '',
  style,
  acrylic = true,
  onChange,
  labelPlacement = 'horizontal',
  progressDot = false,
}) => {
  const contextValue: StepsContextType = useMemo(
    () => ({
      current,
      direction,
      status,
      onChange,
      progressDot,
    }),
    [current, direction, status, onChange, progressDot]
  );

  return (
    <StepsContext.Provider value={contextValue}>
      <div
        className={`
          nav-steps
          nav-steps-${direction}
          nav-steps-${size}
          nav-steps-label-${labelPlacement}
          ${progressDot ? 'nav-steps-progress-dot' : ''}
          ${acrylic ? 'nav-steps-acrylic' : ''}
          ${className}
        `.trim()}
        style={style}
        role="list"
        aria-label="Progress steps"
      >
        {items.map((item, index) => (
          <Step
            key={item.key}
            item={item}
            index={index}
            total={items.length}
          />
        ))}
      </div>
    </StepsContext.Provider>
  );
};

// ========== Step Group Component ==========
export interface StepGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const StepGroup: React.FC<StepGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`nav-steps-group ${className}`}>
      {children}
    </div>
  );
};

export default Steps;
