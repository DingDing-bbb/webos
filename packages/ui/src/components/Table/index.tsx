/**
 * @fileoverview Table Component
 * @module @ui/components/Table
 *
 * A comprehensive table component with sorting, selection, and responsive design.
 *
 * @example
 * ```tsx
 * import { Table, Thead, Tbody, Tr, Th, Td } from '@ui/components/Table';
 *
 * const data = [
 *   { id: 1, name: 'John', email: 'john@example.com' },
 *   { id: 2, name: 'Jane', email: 'jane@example.com' },
 * ];
 *
 * <Table>
 *   <Thead>
 *     <Tr>
 *       <Th sortable sortKey="name">Name</Th>
 *       <Th>Email</Th>
 *     </Tr>
 *   </Thead>
 *   <Tbody>
 *     {data.map(row => (
 *       <Tr key={row.id} selectable selected={selectedIds.includes(row.id)}>
 *         <Td>{row.name}</Td>
 *         <Td>{row.email}</Td>
 *       </Tr>
 *     ))}
 *   </Tbody>
 * </Table>
 * ```
 */

import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import './styles.css';

// ============================================================================
// Types
// ============================================================================

export type TableSortDirection = 'asc' | 'desc' | 'none';

export interface TableContextValue {
  striped: boolean;
  hoverable: boolean;
  fixedHeader: boolean;
  sortKey: string | null;
  sortDirection: TableSortDirection;
  onSort: (key: string) => void;
  selectedRows: Set<string | number>;
  onSelectRow: (id: string | number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Enable striped rows */
  striped?: boolean;
  /** Enable row hover effect */
  hoverable?: boolean;
  /** Fixed header when scrolling */
  fixedHeader?: boolean;
  /** Responsive horizontal scroll */
  responsive?: boolean;
  /** Table size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface TheadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface TbodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface TfootProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Row is selectable */
  selectable?: boolean;
  /** Row is selected */
  selected?: boolean;
  /** Row ID for selection */
  rowId?: string | number;
  /** Row is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Column is sortable */
  sortable?: boolean;
  /** Sort key for sorting */
  sortKey?: string;
  /** Custom sort direction override */
  sortDirection?: TableSortDirection;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width */
  width?: string | number;
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Col span */
  colSpan?: number;
  /** Row span */
  rowSpan?: number;
  /** Additional CSS class */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const TableContext = createContext<TableContextValue>({
  striped: false,
  hoverable: false,
  fixedHeader: false,
  sortKey: null,
  sortDirection: 'none',
  onSort: () => {},
  selectedRows: new Set(),
  onSelectRow: () => {},
  onSelectAll: () => {},
  allSelected: false,
  someSelected: false,
});

const useTableContext = () => useContext(TableContext);

// ============================================================================
// Sort Icons
// ============================================================================

const SortIcon: React.FC<{ direction: TableSortDirection }> = ({ direction }) => (
  <span className={`table__sort-icon table__sort-icon--${direction}`}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      {direction === 'asc' ? (
        <path d="M7 14l5-5 5 5z" />
      ) : direction === 'desc' ? (
        <path d="M7 10l5 5 5-5z" />
      ) : (
        <path d="M7 10l5-5 5 5zm0 4l5 5 5-5z" opacity="0.4" />
      )}
    </svg>
  </span>
);

// ============================================================================
// Table Component
// ============================================================================

/**
 * Table container component with sorting and selection support.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      striped = false,
      hoverable = true,
      fixedHeader = false,
      responsive = true,
      size = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>('none');
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

    const handleSort = useCallback((key: string) => {
      setSortKey(key);
      setSortDirection((prev) => {
        if (prev === 'none' || prev === 'desc') return 'asc';
        return 'desc';
      });
    }, []);

    const handleSelectRow = useCallback((id: string | number, selected: boolean) => {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (selected) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    }, []);

    const handleSelectAll = useCallback((selected: boolean) => {
      setSelectedRows((prev) => {
        // Get all row IDs from children (simplified)
        // In real implementation, this would need to track all row IDs
        return selected ? new Set(prev) : new Set();
      });
    }, []);

    const contextValue = useMemo<TableContextValue>(
      () => ({
        striped,
        hoverable,
        fixedHeader,
        sortKey,
        sortDirection,
        onSort: handleSort,
        selectedRows,
        onSelectRow: handleSelectRow,
        onSelectAll: handleSelectAll,
        allSelected: false,
        someSelected: selectedRows.size > 0,
      }),
      [striped, hoverable, fixedHeader, sortKey, sortDirection, handleSort, selectedRows, handleSelectRow, handleSelectAll]
    );

    const tableContent = (
      <table
        ref={ref}
        className={`table table--${size} ${striped ? 'table--striped' : ''} ${className}`}
        {...props}
      >
        {children}
      </table>
    );

    if (responsive) {
      return (
        <TableContext.Provider value={contextValue}>
          <div className="table__wrapper">{tableContent}</div>
        </TableContext.Provider>
      );
    }

    return (
      <TableContext.Provider value={contextValue}>
        {tableContent}
      </TableContext.Provider>
    );
  }
);

Table.displayName = 'Table';

// ============================================================================
// Thead Component
// ============================================================================

export const Thead = forwardRef<HTMLTableSectionElement, TheadProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <thead ref={ref} className={`table__thead ${className}`} {...props}>
        {children}
      </thead>
    );
  }
);

Thead.displayName = 'Thead';

// ============================================================================
// Tbody Component
// ============================================================================

export const Tbody = forwardRef<HTMLTableSectionElement, TbodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={`table__tbody ${className}`} {...props}>
        {children}
      </tbody>
    );
  }
);

Tbody.displayName = 'Tbody';

// ============================================================================
// Tfoot Component
// ============================================================================

export const Tfoot = forwardRef<HTMLTableSectionElement, TfootProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tfoot ref={ref} className={`table__tfoot ${className}`} {...props}>
        {children}
      </tfoot>
    );
  }
);

Tfoot.displayName = 'Tfoot';

// ============================================================================
// Tr Component
// ============================================================================

export const Tr = forwardRef<HTMLTableRowElement, TrProps>(
  (
    {
      selectable = false,
      selected = false,
      rowId,
      disabled = false,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { onSelectRow, hoverable } = useTableContext();

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (selectable && rowId !== undefined && !disabled) {
        onSelectRow(rowId, !selected);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (selectable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (rowId !== undefined && !disabled) {
          onSelectRow(rowId, !selected);
        }
      }
    };

    return (
      <tr
        ref={ref}
        className={`table__tr ${hoverable ? 'table__tr--hoverable' : ''} ${selected ? 'table__tr--selected' : ''} ${disabled ? 'table__tr--disabled' : ''} ${className}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={selectable ? 'row' : undefined}
        aria-selected={selectable ? selected : undefined}
        tabIndex={selectable && !disabled ? 0 : undefined}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

Tr.displayName = 'Tr';

// ============================================================================
// Th Component
// ============================================================================

export const Th = forwardRef<HTMLTableCellElement, ThProps>(
  (
    {
      sortable = false,
      sortKey,
      sortDirection: propSortDirection,
      align = 'left',
      width,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { sortKey: activeSortKey, sortDirection, onSort } = useTableContext();

    const isActive = sortKey === activeSortKey;
    const currentDirection = propSortDirection ?? (isActive ? sortDirection : 'none');

    const handleClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
      if (sortable && sortKey) {
        onSort(sortKey);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (sortable && sortKey && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSort(sortKey);
      }
    };

    return (
      <th
        ref={ref}
        className={`table__th table__th--${align} ${sortable ? 'table__th--sortable' : ''} ${isActive ? 'table__th--sorted' : ''} ${className}`}
        style={{ width }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={sortable ? 0 : undefined}
        aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
        {...props}
      >
        <span className="table__th-content">
          {children}
          {sortable && <SortIcon direction={currentDirection} />}
        </span>
      </th>
    );
  }
);

Th.displayName = 'Th';

// ============================================================================
// Td Component
// ============================================================================

export const Td = forwardRef<HTMLTableCellElement, TdProps>(
  ({ align = 'left', className = '', children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`table__td table__td--${align} ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);

Td.displayName = 'Td';

// ============================================================================
// Exports
// ============================================================================

export default Table;
