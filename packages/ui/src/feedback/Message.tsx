/**
 * @fileoverview Message Component
 * @module @ui/feedback/Message
 *
 * Message bar component for displaying inline messages with actions.
 * Supports multiple types, action buttons, and queue management.
 *
 * @example
 * ```tsx
 * import { Message, MessageProvider, useMessage } from '@webos/ui/feedback';
 *
 * // Standalone message
 * <Message type="info" actions={[{ label: 'Learn More', onClick: () => {} }]}>
 *   New features are available!
 * </Message>
 *
 * // With provider for queue management
 * <MessageProvider>
 *   <App />
 * </MessageProvider>
 *
 * const message = useMessage();
 * message.show({ content: 'Saved successfully', type: 'success' });
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface MessageAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface MessageItem {
  id: string;
  content: React.ReactNode;
  type: MessageType;
  icon?: React.ReactNode;
  duration?: number;
  actions?: MessageAction[];
  closable?: boolean;
  onClose?: () => void;
  createdAt: number;
}

export interface MessageOptions {
  content: React.ReactNode;
  type?: MessageType;
  icon?: React.ReactNode;
  duration?: number;
  actions?: MessageAction[];
  closable?: boolean;
  onClose?: () => void;
}

interface MessageContextValue {
  messages: MessageItem[];
  show: (options: MessageOptions) => string;
  info: (content: React.ReactNode, options?: Omit<MessageOptions, 'content' | 'type'>) => string;
  success: (content: React.ReactNode, options?: Omit<MessageOptions, 'content' | 'type'>) => string;
  warning: (content: React.ReactNode, options?: Omit<MessageOptions, 'content' | 'type'>) => string;
  error: (content: React.ReactNode, options?: Omit<MessageOptions, 'content' | 'type'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================================================
// Context
// ============================================================================

const MessageContext = createContext<MessageContextValue | null>(null);

// ============================================================================
// Icons
// ============================================================================

const DEFAULT_ICONS: Record<MessageType, React.ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm1-11a1 1 0 11-2 0 1 1 0 012 0zM7 5a1 1 0 002 0v4a1 1 0 11-2 0V5zm1 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 112 0v3a1 1 0 11-2 0V4zm1 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zM5.293 5.293a1 1 0 011.414 0L8 6.586l1.293-1.293a1 1 0 111.414 1.414L9.414 8l1.293 1.293a1 1 0 01-1.414 1.414L8 9.414l-1.293 1.293a1 1 0 01-1.414-1.414L6.586 8 5.293 6.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// ============================================================================
// Provider Component
// ============================================================================

export interface MessageProviderProps {
  children: React.ReactNode;
  maxCount?: number;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children, maxCount = 3 }) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const show = useCallback(
    (options: MessageOptions): string => {
      const id = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const message: MessageItem = {
        ...options,
        id,
        type: options.type || 'info',
        duration: options.duration ?? 0, // 0 means no auto-close
        createdAt: Date.now(),
      };

      setMessages((prev) => {
        const updated = [...prev, message];
        return updated.slice(-maxCount);
      });

      return id;
    },
    [maxCount]
  );

  const dismiss = useCallback((id: string) => {
    setMessages((prev) => {
      const message = prev.find((m) => m.id === id);
      message?.onClose?.();
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const dismissAll = useCallback(() => {
    setMessages([]);
  }, []);

  const typedShow = useCallback(
    (type: MessageType) =>
      (content: React.ReactNode, options?: Omit<MessageOptions, 'content' | 'type'>) =>
        show({ ...options, content, type }),
    [show]
  );

  const contextValue: MessageContextValue = {
    messages,
    show,
    info: typedShow('info'),
    success: typedShow('success'),
    warning: typedShow('warning'),
    error: typedShow('error'),
    dismiss,
    dismissAll,
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
      <MessageContainer />
    </MessageContext.Provider>
  );
};

// ============================================================================
// Container Component
// ============================================================================

const MessageContainer: React.FC = () => {
  const context = useContext(MessageContext);
  if (!context) return null;

  const { messages } = context;

  if (messages.length === 0) return null;

  return (
    <div className="message-container">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
};

// ============================================================================
// Message Card Component
// ============================================================================

interface MessageCardProps {
  message: MessageItem;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const context = useContext(MessageContext);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = useCallback(() => {
    context?.dismiss(message.id);
  }, [context, message.id]);

  useEffect(() => {
    if (message.duration && message.duration > 0) {
      timerRef.current = setTimeout(handleClose, message.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message.duration, handleClose]);

  const icon = message.icon ?? DEFAULT_ICONS[message.type];

  return (
    <div className={`message message--${message.type}`} role="alert" aria-live="polite">
      {icon && <div className="message__icon">{icon}</div>}

      <div className="message__content">{message.content}</div>

      {message.actions && message.actions.length > 0 && (
        <div className="message__actions">
          {message.actions.map((action, index) => (
            <button
              key={index}
              className={`message__action ${action.primary ? 'message__action--primary' : ''}`}
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {message.closable && (
        <button
          className="message__close"
          onClick={handleClose}
          aria-label="Dismiss message"
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5.589 5l2.956-2.956a.417.417 0 00-.59-.589L5 4.411 2.044 1.455a.417.417 0 00-.589.59L4.411 5l-2.956 2.956a.417.417 0 00.59.589L5 5.589l2.956 2.956a.417.417 0 00.589-.59L5.589 5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useMessage = (): MessageContextValue => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

// ============================================================================
// Standalone Message Component
// ============================================================================

export interface MessageProps {
  /** Message content */
  children: React.ReactNode;
  /** Message type */
  type?: MessageType;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Action buttons */
  actions?: MessageAction[];
  /** Whether message can be closed */
  closable?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Additional class name */
  className?: string;
  /** Whether to use filled style */
  filled?: boolean;
  /** Whether to use acrylic style */
  acrylic?: boolean;
}

export const Message: React.FC<MessageProps> = ({
  children,
  type = 'info',
  icon,
  actions,
  closable = false,
  onClose,
  showIcon = true,
  className = '',
  filled = false,
  acrylic = false,
}) => {
  const displayIcon = icon ?? (showIcon ? DEFAULT_ICONS[type] : null);

  return (
    <div
      className={`message message--${type} ${filled ? 'message--filled' : ''} ${acrylic ? 'message--acrylic' : ''} ${className}`}
      role="alert"
    >
      {displayIcon && <div className="message__icon">{displayIcon}</div>}

      <div className="message__content">{children}</div>

      {actions && actions.length > 0 && (
        <div className="message__actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`message__action ${action.primary ? 'message__action--primary' : ''}`}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {closable && (
        <button
          className="message__close"
          onClick={onClose}
          aria-label="Dismiss message"
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5.589 5l2.956-2.956a.417.417 0 00-.59-.589L5 4.411 2.044 1.455a.417.417 0 00-.589.59L4.411 5l-2.956 2.956a.417.417 0 00.59.589L5 5.589l2.956 2.956a.417.417 0 00.589-.59L5.589 5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Message;
