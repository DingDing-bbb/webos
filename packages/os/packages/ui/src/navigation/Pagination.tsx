/**
 * Pagination Component - 分页组件
 * 支持页码显示、每页条数选择、快速跳转
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ========== Types ==========
export interface PaginationProps {
  current?: number;
  defaultCurrent?: number;
  total?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  simple?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
}

// ========== Page Number Generator ==========
const usePaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1,
  boundaryCount: number = 1
): (number | 'ellipsis')[] => {
  return useMemo(() => {
    // Total page numbers to show = siblingCount * 2 + boundaryCount * 2 + 3 (current, start, end)
    const totalPageNumbers = siblingCount * 2 + boundaryCount * 2 + 3;

    // If total pages is less than the numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

    const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - boundaryCount - 1;

    const pages: (number | 'ellipsis')[] = [];

    // Add left boundary pages
    for (let i = 1; i <= boundaryCount; i++) {
      pages.push(i);
    }

    // Add left ellipsis
    if (shouldShowLeftEllipsis) {
      pages.push('ellipsis');
    } else if (!shouldShowLeftEllipsis && leftSiblingIndex > boundaryCount) {
      // Fill gap
      for (let i = boundaryCount + 1; i < leftSiblingIndex; i++) {
        pages.push(i);
      }
    }

    // Add sibling pages around current
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Add right ellipsis
    if (shouldShowRightEllipsis) {
      pages.push('ellipsis');
    } else if (!shouldShowRightEllipsis && rightSiblingIndex < totalPages - boundaryCount) {
      // Fill gap
      for (let i = rightSiblingIndex + 1; i < totalPages - boundaryCount; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
    }

    // Add right boundary pages
    for (let i = totalPages - boundaryCount + 1; i <= totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages, siblingCount, boundaryCount]);
};

// ========== Main Pagination Component ==========
export const Pagination: React.FC<PaginationProps> = ({
  current: controlledCurrent,
  defaultCurrent = 1,
  total = 0,
  pageSize: controlledPageSize,
  defaultPageSize = 10,
  onChange,
  onShowSizeChange,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal = false,
  simple = false,
  disabled = false,
  className = '',
  style,
  acrylic = true,
  siblingCount = 1,
  boundaryCount = 1,
}) => {
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [jumpValue, setJumpValue] = useState('');
  const [sizeSelectOpen, setSizeSelectOpen] = useState(false);

  const current = controlledCurrent ?? internalCurrent;
  const pageSize = controlledPageSize ?? internalPageSize;
  const totalPages = Math.ceil(total / pageSize);
  const paginationRange = usePaginationRange(current, totalPages, siblingCount, boundaryCount);

  const sizeSelectRef = useRef<HTMLDivElement>(null);

  // Close size selector on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sizeSelectRef.current && !sizeSelectRef.current.contains(e.target as Node)) {
        setSizeSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (disabled) return;
      if (page < 1 || page > totalPages) return;
      if (page === current) return;

      setInternalCurrent(page);
      onChange?.(page, pageSize);
    },
    [disabled, totalPages, current, onChange, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      if (disabled) return;

      const newTotalPages = Math.ceil(total / newSize);
      const newCurrent = Math.min(current, newTotalPages);

      setInternalPageSize(newSize);
      setInternalCurrent(newCurrent);
      onShowSizeChange?.(newCurrent, newSize);
      onChange?.(newCurrent, newSize);
      setSizeSelectOpen(false);
    },
    [disabled, total, current, onShowSizeChange, onChange]
  );

  const handleJump = useCallback(() => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpValue('');
    }
  }, [jumpValue, totalPages, handlePageChange]);

  const handleJumpKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleJump();
      }
    },
    [handleJump]
  );

  // Render total info
  const renderTotal = () => {
    if (!showTotal) return null;

    const start = (current - 1) * pageSize + 1;
    const end = Math.min(current * pageSize, total);

    if (typeof showTotal === 'function') {
      return <span className="nav-pagination-total">{showTotal(total, [start, end])}</span>;
    }

    return (
      <span className="nav-pagination-total">
        {start}-{end} of {total} items
      </span>
    );
  };

  // Render size changer
  const renderSizeChanger = () => {
    if (!showSizeChanger) return null;

    return (
      <div ref={sizeSelectRef} className="nav-pagination-size-changer">
        <button
          className="nav-pagination-size-trigger"
          onClick={() => !disabled && setSizeSelectOpen(!sizeSelectOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={sizeSelectOpen}
        >
          {pageSize} / page
          <span className="nav-pagination-size-arrow">▼</span>
        </button>
        {sizeSelectOpen && (
          <ul className="nav-pagination-size-dropdown" role="listbox">
            {pageSizeOptions.map((size) => (
              <li
                key={size}
                className={`nav-pagination-size-option ${pageSize === size ? 'nav-pagination-size-option-selected' : ''}`}
                role="option"
                aria-selected={pageSize === size}
                onClick={() => handlePageSizeChange(size)}
              >
                {size} / page
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Render quick jumper
  const renderQuickJumper = () => {
    if (!showQuickJumper) return null;

    return (
      <div className="nav-pagination-jumper">
        <span>Go to</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={handleJumpKeyDown}
          disabled={disabled}
          className="nav-pagination-jumper-input"
        />
        <button className="nav-pagination-jumper-btn" onClick={handleJump} disabled={disabled}>
          Go
        </button>
      </div>
    );
  };

  // Simple mode render
  if (simple) {
    return (
      <nav
        className={`
          nav-pagination
          nav-pagination-simple
          ${acrylic ? 'nav-pagination-acrylic' : ''}
          ${disabled ? 'nav-pagination-disabled' : ''}
          ${className}
        `.trim()}
        style={style}
        aria-label="Pagination"
      >
        <button
          className="nav-pagination-btn"
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        <div className="nav-pagination-simple-pager">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={current}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                handlePageChange(page);
              }
            }}
            disabled={disabled}
          />
          <span>/</span>
          <span>{totalPages}</span>
        </div>
        <button
          className="nav-pagination-btn"
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </nav>
    );
  }

  return (
    <nav
      className={`
        nav-pagination
        ${acrylic ? 'nav-pagination-acrylic' : ''}
        ${disabled ? 'nav-pagination-disabled' : ''}
        ${className}
      `.trim()}
      style={style}
      aria-label="Pagination"
    >
      {renderTotal()}

      <ul className="nav-pagination-pages" role="list">
        {/* Previous button */}
        <li>
          <button
            className="nav-pagination-btn nav-pagination-prev"
            onClick={() => handlePageChange(current - 1)}
            disabled={disabled || current <= 1}
            aria-label="Previous page"
          >
            ‹
          </button>
        </li>

        {/* Page numbers */}
        {paginationRange.map((page, index) => (
          <li key={index}>
            {page === 'ellipsis' ? (
              <span className="nav-pagination-ellipsis">...</span>
            ) : (
              <button
                className={`
                  nav-pagination-item
                  ${current === page ? 'nav-pagination-item-active' : ''}
                `.trim()}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                aria-label={`Page ${page}`}
                aria-current={current === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <button
            className="nav-pagination-btn nav-pagination-next"
            onClick={() => handlePageChange(current + 1)}
            disabled={disabled || current >= totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </li>
      </ul>

      {renderSizeChanger()}
      {renderQuickJumper()}
    </nav>
  );
};

export default Pagination;
