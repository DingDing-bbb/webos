/**
 * @fileoverview Virtual List Component
 * @module @ui/display/List
 *
 * A high-performance list component with virtual scrolling,
 * infinite scrolling, and load more functionality.
 *
 * @example
 * ```tsx
 * import { List } from '@ui/display';
 *
 * <List
 *   data={items}
 *   itemHeight={50}
 *   height={400}
 *   renderItem={(item, index) => <div>{item.name}</div>}
 *   onLoadMore={handleLoadMore}
 *   hasMore={hasMore}
 * />
 * ```
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ListProps<T> {
  /** Data source */
  data: T[];
  /** Item height (required for virtual scrolling) */
  itemHeight: number;
  /** Container height */
  height: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string;
  /** Enable virtual scrolling */
  virtual?: boolean;
  /** Enable infinite scrolling */
  infiniteScroll?: boolean;
  /** Distance from bottom to trigger load more (px) */
  loadMoreThreshold?: number;
  /** Whether there is more data to load */
  hasMore?: boolean;
  /** Load more callback */
  onLoadMore?: () => void | Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Loading indicator */
  loadingIndicator?: React.ReactNode;
  /** Empty state */
  emptyText?: React.ReactNode;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Divider between items */
  divider?: boolean;
  /** Custom item class name */
  itemClassName?: string;
  /** Custom container class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Overscan count for virtual scrolling */
  overscan?: number;
  /** On item click */
  onItemClick?: (item: T, index: number) => void;
  /** Scroll event handler */
  onScroll?: (scrollTop: number) => void;
}

export interface ListItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  divider?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OVERSCAN = 5;
const DEFAULT_LOAD_MORE_THRESHOLD = 100;

// ============================================================================
// Sub-Components
// ============================================================================

export const ListItem: React.FC<ListItemProps> = memo(
  ({ children, className = '', style, onClick, divider }) => {
    const classes = [
      'ui-list-item',
      onClick ? 'clickable' : '',
      divider ? 'has-divider' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes} style={style} onClick={onClick}>
        {children}
      </div>
    );
  }
);

ListItem.displayName = 'ListItem';

// ============================================================================
// Loading Indicator
// ============================================================================

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => (
  <div className="ui-list-loading">
    <div className="ui-list-spinner" />
    <span>{text}</span>
  </div>
);

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  text?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ text = 'No data' }) => (
  <div className="ui-list-empty">{text}</div>
);

// ============================================================================
// Virtual Scroll Implementation
// ============================================================================

interface VirtualListProps<T> {
  data: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan: number;
  onScroll?: (scrollTop: number) => void;
  onItemClick?: (item: T, index: number) => void;
  itemClassName?: string;
  divider?: boolean;
  infiniteScroll?: boolean;
  hasMore?: boolean;
  loading?: boolean;
  loadMoreThreshold?: number;
  onLoadMore?: () => void | Promise<void>;
  loadingIndicator?: React.ReactNode;
}

function VirtualList<T>({
  data,
  height,
  itemHeight,
  renderItem,
  keyExtractor,
  overscan,
  onScroll,
  onItemClick,
  itemClassName,
  divider,
  infiniteScroll,
  hasMore,
  loading,
  loadMoreThreshold,
  onLoadMore,
  loadingIndicator,
}: VirtualListProps<T>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const isLoadingRef = useRef(false);

  const totalHeight = data.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    const items: { item: T; index: number; style: React.CSSProperties }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (data[i] !== undefined) {
        items.push({
          item: data[i],
          index: i,
          style: {
            position: 'absolute',
            top: i * itemHeight,
            height: itemHeight,
            width: '100%',
          },
        });
      }
    }
    return items;
  }, [data, startIndex, endIndex, itemHeight]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const currentScrollTop = e.currentTarget.scrollTop;
      setScrollTop(currentScrollTop);
      onScroll?.(currentScrollTop);

      // Infinite scroll logic
      if (infiniteScroll && hasMore && !loading && !isLoadingRef.current && onLoadMore) {
        const scrollHeight = e.currentTarget.scrollHeight;
        const scrollBottom =
          currentScrollTop + e.currentTarget.clientHeight + (loadMoreThreshold || 0);

        if (scrollBottom >= scrollHeight - (loadMoreThreshold || DEFAULT_LOAD_MORE_THRESHOLD)) {
          isLoadingRef.current = true;
          Promise.resolve(onLoadMore()).finally(() => {
            isLoadingRef.current = false;
          });
        }
      }
    },
    [infiniteScroll, hasMore, loading, onLoadMore, loadMoreThreshold, onScroll]
  );

  return (
    <div
      ref={containerRef}
      className="ui-list-virtual-container"
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div
        className="ui-list-virtual-content"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div
            key={keyExtractor(item, index)}
            className={`ui-list-item ${itemClassName || ''} ${divider ? 'has-divider' : ''} ${onItemClick ? 'clickable' : ''}`}
            style={style}
            onClick={() => onItemClick?.(item, index)}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {loading && (
        <div className="ui-list-loading-container">{loadingIndicator || <LoadingSpinner />}</div>
      )}
    </div>
  );
}

// ============================================================================
// Regular List Implementation
// ============================================================================

interface RegularListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onItemClick?: (item: T, index: number) => void;
  itemClassName?: string;
  divider?: boolean;
  infiniteScroll?: boolean;
  hasMore?: boolean;
  loading?: boolean;
  loadMoreThreshold?: number;
  onLoadMore?: () => void | Promise<void>;
  loadingIndicator?: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
}

function RegularList<T>({
  data,
  renderItem,
  keyExtractor,
  onItemClick,
  itemClassName,
  divider,
  infiniteScroll,
  hasMore,
  loading,
  loadMoreThreshold,
  onLoadMore,
  loadingIndicator,
  onScroll,
}: RegularListProps<T>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!infiniteScroll || !hasMore || loading) return;

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current && onLoadMore) {
          isLoadingRef.current = true;
          Promise.resolve(onLoadMore()).finally(() => {
            isLoadingRef.current = false;
          });
        }
      },
      {
        rootMargin: `${loadMoreThreshold || DEFAULT_LOAD_MORE_THRESHOLD}px`,
      }
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [infiniteScroll, hasMore, loading, loadMoreThreshold, onLoadMore]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e.currentTarget.scrollTop);
    },
    [onScroll]
  );

  return (
    <div className="ui-list-regular-container" onScroll={handleScroll} ref={containerRef}>
      {data.map((item, index) => (
        <div
          key={keyExtractor(item, index)}
          className={`ui-list-item ${itemClassName || ''} ${divider ? 'has-divider' : ''} ${onItemClick ? 'clickable' : ''}`}
          onClick={() => onItemClick?.(item, index)}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {/* Load more trigger */}
      {infiniteScroll && <div ref={loadMoreRef} className="ui-list-load-more-trigger" />}

      {/* Loading indicator */}
      {loading && (
        <div className="ui-list-loading-container">{loadingIndicator || <LoadingSpinner />}</div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function List<T>({
  data,
  itemHeight,
  height,
  renderItem,
  keyExtractor,
  virtual = true,
  infiniteScroll = false,
  loadMoreThreshold = DEFAULT_LOAD_MORE_THRESHOLD,
  hasMore = false,
  onLoadMore,
  loading = false,
  loadingIndicator,
  emptyText = 'No data',
  header,
  footer,
  divider = false,
  itemClassName,
  className = '',
  style,
  overscan = DEFAULT_OVERSCAN,
  onItemClick,
  onScroll,
}: ListProps<T>): JSX.Element {
  const defaultKeyExtractor = useCallback((item: T, index: number) => `list-item-${index}`, []);

  const extractor = keyExtractor || defaultKeyExtractor;

  const listClasses = ['ui-list', className].filter(Boolean).join(' ');

  const isEmpty = data.length === 0 && !loading;

  return (
    <div className={listClasses} style={style}>
      {header && <div className="ui-list-header">{header}</div>}

      <div className="ui-list-content" style={virtual ? { height } : undefined}>
        {isEmpty ? (
          <EmptyState text={emptyText} />
        ) : virtual ? (
          <VirtualList
            data={data}
            height={height}
            itemHeight={itemHeight}
            renderItem={renderItem}
            keyExtractor={extractor}
            overscan={overscan}
            onScroll={onScroll}
            onItemClick={onItemClick}
            itemClassName={itemClassName}
            divider={divider}
            infiniteScroll={infiniteScroll}
            hasMore={hasMore}
            loading={loading}
            loadMoreThreshold={loadMoreThreshold}
            onLoadMore={onLoadMore}
            loadingIndicator={loadingIndicator}
          />
        ) : (
          <RegularList
            data={data}
            renderItem={renderItem}
            keyExtractor={extractor}
            onItemClick={onItemClick}
            itemClassName={itemClassName}
            divider={divider}
            infiniteScroll={infiniteScroll}
            hasMore={hasMore}
            loading={loading}
            loadMoreThreshold={loadMoreThreshold}
            onLoadMore={onLoadMore}
            loadingIndicator={loadingIndicator}
            onScroll={onScroll}
          />
        )}
      </div>

      {footer && <div className="ui-list-footer">{footer}</div>}
    </div>
  );
}

// ============================================================================
// Grid List Variant
// ============================================================================

export interface GridListProps<T> {
  /** Data source */
  data: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string;
  /** Number of columns */
  columns?: number;
  /** Gap between items */
  gap?: number;
  /** Loading state */
  loading?: boolean;
  /** Empty text */
  emptyText?: React.ReactNode;
  /** Item click handler */
  onItemClick?: (item: T, index: number) => void;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function GridList<T>({
  data,
  renderItem,
  keyExtractor,
  columns = 3,
  gap = 16,
  loading = false,
  emptyText = 'No data',
  onItemClick,
  className = '',
  style,
}: GridListProps<T>): JSX.Element {
  const defaultKeyExtractor = useCallback((item: T, index: number) => `grid-item-${index}`, []);

  const extractor = keyExtractor || defaultKeyExtractor;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    ...style,
  };

  return (
    <div className={`ui-grid-list ${className}`} style={gridStyle}>
      {loading ? (
        <div className="ui-grid-loading">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="ui-grid-empty">
          <EmptyState text={emptyText} />
        </div>
      ) : (
        data.map((item, index) => (
          <div
            key={extractor(item, index)}
            className={`ui-grid-item ${onItemClick ? 'clickable' : ''}`}
            onClick={() => onItemClick?.(item, index)}
          >
            {renderItem(item, index)}
          </div>
        ))
      )}
    </div>
  );
}

export default List;
