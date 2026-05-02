/**
 * @fileoverview Advanced Table Component
 * @module @ui/display/Table
 *
 * A feature-rich table component with sorting, filtering, pagination,
 * fixed columns/headers, expandable rows, and virtual scrolling.
 *
 * @example
 * ```tsx
 * import { Table } from '@webos/ui/display';
 *
 * const columns = [
 *   { key: 'name', title: 'Name', sortable: true },
 *   { key: 'age', title: 'Age', sortable: true },
 * ];
 *
 * <Table
 *   columns={columns}
 *   data={data}
 *   pagination={{ pageSize: 10 }}
 *   sortable
 *   filterable
 * />
 * ```
 */

import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
import type { JSX } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TableColumn<T = Record<string, unknown>> {
  /** Unique column key */
  key: string;
  /** Column header title */
  title: React.ReactNode;
  /** Column width */
  width?: number | string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Fixed position: left or right */
  fixed?: 'left' | 'right';
  /** Custom render function */
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  /** Custom filter function */
  filter?: (value: unknown, filterValue: string) => boolean;
  /** Column align */
  align?: 'left' | 'center' | 'right';
  /** Ellipsis overflow */
  ellipsis?: boolean;
}

export interface TablePagination {
  /** Current page (1-indexed) */
  current?: number;
  /** Items per page */
  pageSize?: number;
  /** Total items */
  total?: number;
  /** Page change callback */
  onChange?: (page: number, pageSize: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Show page size selector */
  showSizeChanger?: boolean;
  /** Show quick jumper */
  showQuickJumper?: boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Data source */
  data: T[];
  /** Row key field or function */
  rowKey?: string | ((record: T) => string);
  /** Pagination config */
  pagination?: TablePagination | false;
  /** Enable sorting */
  sortable?: boolean;
  /** Enable filtering */
  filterable?: boolean;
  /** Fixed header */
  fixedHeader?: boolean;
  /** Table height for fixed header/virtual scroll */
  height?: number | string;
  /** Enable virtual scrolling */
  virtualScroll?: boolean;
  /** Row expandable config */
  expandable?: {
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
  /** Custom row class name */
  rowClassName?: string | ((record: T, index: number) => string);
  /** Row click handler */
  onRowClick?: (record: T, index: number) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty text */
  emptyText?: React.ReactNode;
  /** Table size */
  size?: 'small' | 'middle' | 'large';
  /** Border style */
  bordered?: boolean;
  /** Sticky header offset */
  stickyOffset?: number;
  /** Additional class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

interface SortState {
  key: string;
  order: 'asc' | 'desc' | null;
}

interface FilterState {
  [key: string]: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PAGE_SIZE = 10;
const ROW_HEIGHT = 48;
const VIRTUAL_SCROLL_OVERSCAN = 5;

// ============================================================================
// Utility Functions
// ============================================================================

function getRowKey<T>(
  record: T,
  rowKey: string | ((record: T) => string) | undefined,
  index: number
): string {
  if (typeof rowKey === 'function') {
    return rowKey(record);
  }
  if (typeof rowKey === 'string') {
    return String((record as Record<string, unknown>)[rowKey]);
  }
  return `row-${index}`;
}

function sortData<T>(data: T[], sortState: SortState, columns: TableColumn<T>[]): T[] {
  if (!sortState.key || !sortState.order) {
    return data;
  }

  const column = columns.find((col) => col.key === sortState.key);
  if (!column?.sortable) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sortState.key];
    const bVal = (b as Record<string, unknown>)[sortState.key];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const compareResult = aVal < bVal ? -1 : 1;
    return sortState.order === 'asc' ? compareResult : -compareResult;
  });
}

function filterData<T>(data: T[], filters: FilterState, columns: TableColumn<T>[]): T[] {
  const activeFilters = Object.entries(filters).filter(([, value]) => value);
  if (activeFilters.length === 0) {
    return data;
  }

  return data.filter((record) => {
    return activeFilters.every(([key, filterValue]) => {
      const column = columns.find((col) => col.key === key);
      const recordValue = (record as Record<string, unknown>)[key];

      if (column?.filter) {
        return column.filter(recordValue, filterValue);
      }

      return String(recordValue).toLowerCase().includes(filterValue.toLowerCase());
    });
  });
}

// ============================================================================
// Sub-Components
// ============================================================================

interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  sortState: SortState;
  filters: FilterState;
  onSort: (key: string) => void;
  onFilter: (key: string, value: string) => void;
  fixedHeader?: boolean;
  stickyOffset?: number;
}

function TableHeader<T>({
  columns,
  sortState,
  filters,
  onSort,
  onFilter,
  fixedHeader,
  stickyOffset,
}: TableHeaderProps<T>): JSX.Element {
  const handleSort = (key: string) => {
    onSort(key);
  };

  return (
    <thead
      className="ui-table-header"
      style={fixedHeader ? { position: 'sticky', top: stickyOffset || 0, zIndex: 10 } : undefined}
    >
      <tr>
        {columns.map((column) => {
          const isSortable = column.sortable;
          const sortActive = sortState.key === column.key;
          const isFixedLeft = column.fixed === 'left';
          const isFixedRight = column.fixed === 'right';

          const headerStyle: React.CSSProperties = {
            width: column.width,
            textAlign: column.align,
          };

          if (isFixedLeft) {
            headerStyle.position = 'sticky';
            headerStyle.left = 0;
            headerStyle.zIndex = 11;
          }
          if (isFixedRight) {
            headerStyle.position = 'sticky';
            headerStyle.right = 0;
            headerStyle.zIndex = 11;
          }

          return (
            <th
              key={column.key}
              className={`ui-table-header-cell ${isSortable ? 'sortable' : ''} ${sortActive ? 'sorted' : ''}`}
              style={headerStyle}
              onClick={() => isSortable && handleSort(column.key)}
            >
              <div className="ui-table-header-content">
                <span className="ui-table-header-title">{column.title}</span>
                {isSortable && (
                  <span className="ui-table-sorter">
                    <span
                      className={`sort-icon asc ${sortActive && sortState.order === 'asc' ? 'active' : ''}`}
                    >
                      ▲
                    </span>
                    <span
                      className={`sort-icon desc ${sortActive && sortState.order === 'desc' ? 'active' : ''}`}
                    >
                      ▼
                    </span>
                  </span>
                )}
                {column.filterable && (
                  <input
                    type="text"
                    className="ui-table-filter-input"
                    placeholder="Filter..."
                    value={filters[column.key] || ''}
                    onChange={(e) => onFilter(column.key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

interface TableRowProps<T> {
  columns: TableColumn<T>[];
  record: T;
  index: number;
  rowKey: string;
  expanded?: boolean;
  expandable?: TableProps<T>['expandable'];
  onExpand?: (expanded: boolean) => void;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
}

const TableRow = memo(
  <T,>({
    columns,
    record,
    index,
    rowKey: _rowKey,
    expanded,
    expandable,
    onExpand,
    rowClassName,
    onRowClick,
  }: TableRowProps<T>) => {
    const isExpandable = expandable?.rowExpandable?.(record) ?? true;
    const hasExpandRender = expandable?.expandedRowRender;

    const handleRowClick = () => {
      onRowClick?.(record, index);
    };

    const handleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      onExpand?.(!expanded);
    };

    const rowClasses = [
      'ui-table-row',
      typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName,
      expanded ? 'expanded' : '',
      hasExpandRender ? 'expandable' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        <tr className={rowClasses} onClick={handleRowClick}>
          {hasExpandRender && (
            <td className="ui-table-expand-cell">
              {isExpandable && (
                <button
                  className="ui-table-expand-btn"
                  onClick={handleExpand}
                  aria-expanded={expanded}
                >
                  <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▶</span>
                </button>
              )}
            </td>
          )}
          {columns.map((column) => {
            const value = (record as Record<string, unknown>)[column.key];
            const isFixedLeft = column.fixed === 'left';
            const isFixedRight = column.fixed === 'right';

            const cellStyle: React.CSSProperties = {
              textAlign: column.align,
            };

            if (isFixedLeft) {
              cellStyle.position = 'sticky';
              cellStyle.left = hasExpandRender ? 40 : 0;
              cellStyle.zIndex = 5;
            }
            if (isFixedRight) {
              cellStyle.position = 'sticky';
              cellStyle.right = 0;
              cellStyle.zIndex = 5;
            }

            return (
              <td
                key={column.key}
                className={`ui-table-cell ${column.ellipsis ? 'ellipsis' : ''}`}
                style={cellStyle}
              >
                {column.render
                  ? column.render(value, record, index)
                  : value !== undefined
                    ? String(value)
                    : null}
              </td>
            );
          })}
        </tr>
        {expanded && hasExpandRender && (
          <tr className="ui-table-expanded-row">
            <td colSpan={columns.length + 1}>
              <div className="ui-table-expanded-content">
                {expandable.expandedRowRender!(record, index)}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
) as <T>(props: TableRowProps<T>) => JSX.Element;

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

function Pagination({
  current,
  pageSize,
  total,
  onChange,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = true,
  showQuickJumper = false,
}: PaginationProps): JSX.Element {
  const totalPages = Math.ceil(total / pageSize);
  const [jumperValue, setJumperValue] = useState('');

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleJumperSubmit = () => {
    const page = parseInt(jumperValue, 10);
    if (page >= 1 && page <= totalPages) {
      onChange(page, pageSize);
    }
    setJumperValue('');
  };

  return (
    <div className="ui-table-pagination">
      <div className="pagination-info">
        Showing {(current - 1) * pageSize + 1} - {Math.min(current * pageSize, total)} of {total}
      </div>

      <div className="pagination-pages">
        <button
          className="pagination-btn"
          disabled={current === 1}
          onClick={() => onChange(current - 1, pageSize)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination-btn ${page === current ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
            disabled={page === '...'}
            onClick={() => typeof page === 'number' && onChange(page, pageSize)}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-btn"
          disabled={current === totalPages}
          onClick={() => onChange(current + 1, pageSize)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {showSizeChanger && (
        <select
          className="pagination-size-select"
          value={pageSize}
          onChange={(e) => onChange(1, Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}

      {showQuickJumper && (
        <div className="pagination-jumper">
          <span>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumperValue}
            onChange={(e) => setJumperValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJumperSubmit()}
          />
          <button onClick={handleJumperSubmit}>Go</button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Virtual Scroll Implementation
// ============================================================================

interface VirtualScrollProps {
  height: number;
  rowHeight: number;
  itemCount: number;
  children: (index: number, style: React.CSSProperties) => React.ReactNode;
}

function VirtualScroll({
  height,
  rowHeight,
  itemCount,
  children,
}: VirtualScrollProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = itemCount * rowHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - VIRTUAL_SCROLL_OVERSCAN);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + height) / rowHeight) + VIRTUAL_SCROLL_OVERSCAN
  );

  const visibleItems: { index: number; style: React.CSSProperties }[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      style: {
        position: 'absolute',
        top: i * rowHeight,
        height: rowHeight,
        width: '100%',
      },
    });
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className="ui-table-virtual-scroll"
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, style }) => children(index, style))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data,
  rowKey,
  pagination,
  sortable = false,
  filterable = false,
  fixedHeader = false,
  height,
  virtualScroll = false,
  expandable,
  rowClassName,
  onRowClick,
  loading = false,
  emptyText = 'No data',
  size = 'middle',
  bordered = false,
  stickyOffset,
  className = '',
  style,
}: TableProps<T>): JSX.Element {
  // State
  const [sortState, setSortState] = useState<SortState>({ key: '', order: null });
  const [filters, setFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(
    pagination !== false ? pagination?.current || 1 : 1
  );
  const [pageSize, setPageSize] = useState(
    pagination !== false ? pagination?.pageSize || DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(expandable?.expandedRowKeys)
  );

  // Filter columns that should have filter input
  const processedColumns = useMemo(() => {
    return filterable
      ? columns.map((col) => ({ ...col, filterable: col.filterable ?? true }))
      : columns;
  }, [columns, filterable]);

  // Process data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (Object.values(filters).some((v) => v)) {
      result = filterData(result, filters, processedColumns);
    }

    // Apply sorting
    if (sortState.key && sortState.order) {
      result = sortData(result, sortState, processedColumns);
    }

    return result;
  }, [data, filters, sortState, processedColumns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return processedData;
    }
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, pagination, currentPage, pageSize]);

  // Handlers
  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;

      setSortState((prev) => {
        if (prev.key !== key) {
          return { key, order: 'asc' };
        }
        if (prev.order === 'asc') {
          return { key, order: 'desc' };
        }
        return { key: '', order: null };
      });
    },
    [sortable]
  );

  const handleFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
    // Reset to first page when filtering
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number, newPageSize: number) => {
      setCurrentPage(page);
      setPageSize(newPageSize);
      if (pagination !== false) {
        (pagination as TablePagination).onChange?.(page, newPageSize);
      }
    },
    [pagination]
  );

  const handleExpand = useCallback(
    (record: T, key: string) => {
      const newExpanded = new Set(expandedKeys);
      if (newExpanded.has(key)) {
        newExpanded.delete(key);
        expandable?.onExpand?.(false, record);
      } else {
        newExpanded.add(key);
        expandable?.onExpand?.(true, record);
      }
      setExpandedKeys(newExpanded);
    },
    [expandedKeys, expandable]
  );

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Update from controlled pagination
  useEffect(() => {
    if (pagination !== false) {
      if ((pagination as TablePagination).current) {
        setCurrentPage((pagination as TablePagination).current!);
      }
      if ((pagination as TablePagination).pageSize) {
        setPageSize((pagination as TablePagination).pageSize!);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pagination object reference shouldn't trigger effect, only specific properties matter
  }, [
    pagination !== false ? (pagination as TablePagination).current : undefined,
    pagination !== false ? (pagination as TablePagination).pageSize : undefined,
  ]);

  // Update from controlled expanded keys
  useEffect(() => {
    if (expandable?.expandedRowKeys) {
      setExpandedKeys(new Set(expandable.expandedRowKeys));
    }
  }, [expandable?.expandedRowKeys]);

  // Render virtual scroll table
  const renderVirtualTable = () => (
    <VirtualScroll
      height={typeof height === 'number' ? height : 400}
      rowHeight={ROW_HEIGHT}
      itemCount={paginatedData.length}
    >
      {(index, style) => {
        const record = paginatedData[index];
        const key = getRowKey(record, rowKey, index);
        return (
          <div key={key} style={style}>
            <TableRow
              columns={processedColumns}
              record={record}
              index={index}
              rowKey={key}
              expanded={expandedKeys.has(key)}
              expandable={expandable}
              onExpand={() => handleExpand(record, key)}
              rowClassName={rowClassName}
              onRowClick={onRowClick}
            />
          </div>
        );
      }}
    </VirtualScroll>
  );

  // Render regular table
  const renderTable = () => (
    <table className="ui-table-element">
      <TableHeader
        columns={processedColumns}
        sortState={sortState}
        filters={filters}
        onSort={handleSort}
        onFilter={handleFilter}
        fixedHeader={fixedHeader}
        stickyOffset={stickyOffset}
      />
      <tbody className="ui-table-body">
        {loading ? (
          <tr>
            <td colSpan={processedColumns.length} className="ui-table-loading">
              <div className="loading-spinner" />
              <span>Loading...</span>
            </td>
          </tr>
        ) : paginatedData.length === 0 ? (
          <tr>
            <td colSpan={processedColumns.length} className="ui-table-empty">
              {emptyText}
            </td>
          </tr>
        ) : (
          paginatedData.map((record, index) => {
            const key = getRowKey(record, rowKey, index);
            return (
              <TableRow
                key={key}
                columns={processedColumns}
                record={record}
                index={index}
                rowKey={key}
                expanded={expandedKeys.has(key)}
                expandable={expandable}
                onExpand={() => handleExpand(record, key)}
                rowClassName={rowClassName}
                onRowClick={onRowClick}
              />
            );
          })
        )}
      </tbody>
    </table>
  );

  const tableClasses = [
    'ui-table',
    `ui-table-${size}`,
    bordered ? 'ui-table-bordered' : '',
    fixedHeader ? 'ui-table-fixed-header' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle: React.CSSProperties = {
    ...style,
    height: fixedHeader ? height || 'auto' : 'auto',
  };

  return (
    <div className={tableClasses} style={containerStyle}>
      <div className="ui-table-wrapper">{virtualScroll ? renderVirtualTable() : renderTable()}</div>

      {pagination !== false && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={pagination?.total ?? processedData.length}
          onChange={handlePageChange}
          pageSizeOptions={pagination?.pageSizeOptions}
          showSizeChanger={pagination?.showSizeChanger}
          showQuickJumper={pagination?.showQuickJumper}
        />
      )}
    </div>
  );
}

export default Table;
