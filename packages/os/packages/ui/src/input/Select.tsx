/**
 * @fileoverview Select Component - 选择器组件
 * @module @ui/input/Select
 *
 * Features:
 * - 单选/多选
 * - 搜索过滤
 * - 分组
 * - 远程加载
 * - 亚克力背景效果
 * - 完整的键盘交互
 * - 无障碍支持
 */

import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
  ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  /** 选中的值（单选） */
  value?: string | number;
  /** 选中的值（多选） */
  values?: Array<string | number>;
  /** 默认选中的值 */
  defaultValue?: string | number | Array<string | number>;
  /** 选项列表 */
  options?: SelectOption[];
  /** 分组选项 */
  groups?: SelectGroup[];
  /** 是否多选 */
  multiple?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否远程加载 */
  loading?: boolean;
  /** 空状态文本 */
  emptyText?: string;
  /** 是否清除 */
  allowClear?: boolean;
  /** 值改变回调 */
  onChange?: (value: string | number | Array<string | number>) => void;
  /** 搜索回调 */
  onSearch?: (query: string) => void;
  /** 自定义类名 */
  className?: string;
  /** ID */
  id?: string;
  /** 名称 */
  name?: string;
}

// ============================================================================
// Icons
// ============================================================================

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: 'spinner-rotate 1s linear infinite' }}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value: propValue,
      values: propValues,
      defaultValue,
      options: propOptions = [],
      groups: propGroups,
      multiple = false,
      placeholder = '请选择',
      disabled = false,
      searchable = false,
      loading = false,
      emptyText = '暂无数据',
      allowClear = false,
      onChange,
      onSearch,
      className = '',
      id: propId,
      name,
    },
    ref
  ) => {
    const autoId = useId();
    const id = propId || autoId;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Handle value state
    const [internalValue, setInternalValue] = useState<string | number | Array<string | number>>(
      defaultValue ?? (multiple ? [] : '')
    );

    // Determine current value
    const isControlled = multiple ? propValues !== undefined : propValue !== undefined;

    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentValue needs to be stable for useCallback dependencies, wrapping in useMemo would add unnecessary complexity
    const currentValue = isControlled ? (multiple ? propValues || [] : propValue) : internalValue;

    // Flatten options for searching
    const allOptions = propGroups ? propGroups.flatMap((group) => group.options) : propOptions;

    // Filter options based on search
    const filteredOptions =
      searchable && searchQuery
        ? allOptions.filter((option) =>
            String(option.label).toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allOptions;

    // Get selected option(s)
    const getSelectedOption = useCallback(
      (val: string | number) => allOptions.find((opt) => opt.value === val),
      [allOptions]
    );

    const selectedOptions = multiple
      ? ((currentValue as Array<string | number>) || []).map(getSelectedOption).filter(Boolean)
      : getSelectedOption(currentValue as string | number);

    // Handle selection
    const handleSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        let newValue: string | number | Array<string | number>;

        if (multiple) {
          const values = (currentValue as Array<string | number>) || [];
          const isSelected = values.includes(option.value);
          newValue = isSelected
            ? values.filter((v) => v !== option.value)
            : [...values, option.value];
        } else {
          newValue = option.value;
          setIsOpen(false);
        }

        if (!isControlled) {
          setInternalValue(newValue);
        }

        onChange?.(newValue);
        setSearchQuery('');
      },
      [multiple, currentValue, isControlled, onChange]
    );

    // Handle clear
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = multiple ? [] : '';
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [multiple, isControlled, onChange]
    );

    // Handle search
    const handleSearch = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch?.(e.target.value);
      },
      [onSearch]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0) {
              const option = filteredOptions[highlightedIndex];
              if (option) handleSelect(option);
            } else {
              setIsOpen(!isOpen);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            break;
          case 'Escape':
            setIsOpen(false);
            break;
          case 'Tab':
            setIsOpen(false);
            break;
        }
      },
      [disabled, isOpen, highlightedIndex, filteredOptions, handleSelect]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Build class names
    const wrapperClasses = [
      'webos-select-wrapper',
      isOpen && 'webos-select-wrapper--open',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const triggerClasses = [
      'webos-select-trigger',
      isFocused && 'webos-select-trigger--focused',
      disabled && 'webos-select-trigger--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    // Render option
    const renderOption = (option: SelectOption, index: number) => {
      const isSelected = multiple
        ? ((currentValue as Array<string | number>) || []).includes(option.value)
        : currentValue === option.value;

      const isHighlighted = index === highlightedIndex;

      return (
        <div
          key={option.value}
          className={[
            'webos-select-option',
            isSelected && 'webos-select-option--selected',
            option.disabled && 'webos-select-option--disabled',
            isHighlighted && 'webos-select-option--highlighted',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => handleSelect(option)}
          onMouseEnter={() => setHighlightedIndex(index)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
        >
          <span>{option.label}</span>
          {isSelected && (
            <span className="webos-select-option-check">
              <CheckIcon />
            </span>
          )}
        </div>
      );
    };

    return (
      <div ref={wrapperRef} className={wrapperClasses} onKeyDown={handleKeyDown}>
        <input type="hidden" name={name} value={String(currentValue)} />

        <div
          ref={ref}
          id={id}
          className={triggerClasses}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          role="combobox"
          aria-expanded={isOpen}
          aria-disabled={disabled}
          aria-haspopup="listbox"
        >
          <div className="webos-select-value">
            {!selectedOptions ||
            (Array.isArray(selectedOptions) && selectedOptions.length === 0) ? (
              <span className="webos-select-placeholder">{placeholder}</span>
            ) : multiple ? (
              (selectedOptions as SelectOption[]).map((option) => (
                <span key={option.value} className="webos-select-tag">
                  {option.label}
                  <button
                    type="button"
                    className="webos-select-tag-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                  >
                    <CloseIcon size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span>{(selectedOptions as SelectOption)?.label}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {allowClear && selectedOptions && (
              <button
                type="button"
                className="webos-select-tag-close"
                onClick={handleClear}
                style={{ marginRight: 4 }}
              >
                <CloseIcon />
              </button>
            )}
            <span className="webos-select-arrow">
              {loading ? <SpinnerIcon /> : <ChevronDownIcon />}
            </span>
          </div>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="webos-select-dropdown webos-animate-slide-up"
            role="listbox"
          >
            {searchable && (
              <div className="webos-select-search">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="webos-select-search-input"
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="webos-select-empty">{emptyText}</div>
            ) : propGroups ? (
              propGroups.map((group) => (
                <div key={group.label}>
                  <div className="webos-select-group-label">{group.label}</div>
                  {group.options
                    .filter(
                      (opt) =>
                        !searchQuery ||
                        String(opt.label).toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((option, _index) => {
                      const globalIndex = filteredOptions.findIndex(
                        (o) => o.value === option.value
                      );
                      return renderOption(option, globalIndex);
                    })}
                </div>
              ))
            ) : (
              filteredOptions.map((option, index) => renderOption(option, index))
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
