/**
 * @fileoverview Select Component
 * @module @ui/components/Select
 *
 * A flexible select component with dropdown, search, option groups,
 * clearable, and keyboard navigation support.
 */

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import './styles.css';

// ============================================
// Types
// ============================================

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectStatus = 'default' | 'error' | 'success';

export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Custom option data */
  data?: Record<string, unknown>;
}

export interface SelectOptionGroup {
  /** Group label */
  label: string;
  /** Group options */
  options: SelectOption[];
}

export type SelectOptions = (SelectOption | SelectOptionGroup)[];

export interface SelectProps {
  /** Select options */
  options: SelectOptions;
  /** Current value */
  value?: string | number;
  /** Default value */
  defaultValue?: string | number;
  /** Placeholder text */
  placeholder?: string;
  /** Select size */
  size?: SelectSize;
  /** Select status */
  status?: SelectStatus;
  /** Enable search/filter */
  searchable?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom class name */
  className?: string;
  /** Container class name */
  wrapperClassName?: string;
  /** Custom option render function */
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  /** Custom selected value render function */
  renderValue?: (option: SelectOption | null) => ReactNode;
  /** On change callback */
  onChange?: (value: string | number, option: SelectOption | null) => void;
  /** On search callback */
  onSearch?: (query: string) => void;
  /** On clear callback */
  onClear?: () => void;
  /** On dropdown open/close callback */
  onOpenChange?: (open: boolean) => void;
  /** Filter function */
  filterOption?: (option: SelectOption, query: string) => boolean;
}

export interface SelectRef {
  /** Focus the select */
  focus: () => void;
  /** Blur the select */
  blur: () => void;
  /** Clear the select */
  clear: () => void;
  /** Open the dropdown */
  open: () => void;
  /** Close the dropdown */
  close: () => void;
  /** Get selected option */
  getSelectedOption: () => SelectOption | null;
}

// ============================================
// Helper Functions
// ============================================

function isOptionGroup(option: SelectOption | SelectOptionGroup): option is SelectOptionGroup {
  return 'options' in option;
}

function flattenOptions(options: SelectOptions): SelectOption[] {
  return options.reduce<SelectOption[]>((acc, option) => {
    if (isOptionGroup(option)) {
      return [...acc, ...option.options];
    }
    return [...acc, option];
  }, []);
}

function filterOptions(
  options: SelectOptions,
  query: string,
  filterFn?: (option: SelectOption, query: string) => boolean
): SelectOptions {
  if (!query) return options;

  const defaultFilter = (option: SelectOption, q: string) =>
    option.label.toLowerCase().includes(q.toLowerCase());

  const filter = filterFn || defaultFilter;

  return options.map((option) => {
    if (isOptionGroup(option)) {
      const filteredOpts = option.options.filter((o) => filter(o, query));
      return filteredOpts.length > 0 ? { label: option.label, options: filteredOpts } : null;
    }
    return filter(option, query) ? option : null;
  }).filter(Boolean) as SelectOptions;
}

// ============================================
// Component
// ============================================

export const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      placeholder = 'Select...',
      size = 'md',
      status = 'default',
      searchable = false,
      clearable = false,
      disabled = false,
      loading = false,
      className = '',
      wrapperClassName = '',
      renderOption,
      renderValue,
      onChange,
      onSearch,
      onClear,
      onOpenChange,
      filterOption,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const isControlled = value !== undefined;

    // Flatten options for easy access
    const flatOptions = useMemo(() => flattenOptions(options), [options]);

    // Find selected option
    const selectedOption = useMemo(() => {
      const currentValue = isControlled ? value : defaultValue;
      return flatOptions.find((opt) => opt.value === currentValue) || null;
    }, [flatOptions, value, defaultValue, isControlled]);

    // Filter options based on search
    const filteredOptions = useMemo(
      () => filterOptions(options, searchQuery, filterOption),
      [options, searchQuery, filterOption]
    );

    const filteredFlatOptions = useMemo(
      () => flattenOptions(filteredOptions),
      [filteredOptions]
    );

    // Expose methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        handleChange(null as unknown as string, null);
      },
      open: () => !disabled && setIsOpen(true),
      close: () => setIsOpen(false),
      getSelectedOption: () => selectedOption,
    }));

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Notify on open change
    useEffect(() => {
      onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    // Handle value change
    const handleChange = useCallback(
      (newValue: string | number, option: SelectOption | null) => {
        if (!isControlled) {
          // For uncontrolled, we don't set state here
        }
        onChange?.(newValue, option);
        setIsOpen(false);
        setSearchQuery('');
      },
      [isControlled, onChange]
    );

    // Handle clear
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        handleChange('' as string, null);
        onClear?.();
      },
      [handleChange, onClear]
    );

    // Handle search
    const handleSearch = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setHighlightedIndex(-1);
        onSearch?.(query);
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
              const option = filteredFlatOptions[highlightedIndex];
              if (option && !option.disabled) {
                handleChange(String(option.value), option);
              }
            } else {
              setIsOpen(!isOpen);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setHighlightedIndex((prev) =>
                prev < filteredFlatOptions.length - 1 ? prev + 1 : prev
              );
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (isOpen) {
              setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            }
            break;
          case 'Home':
            e.preventDefault();
            setHighlightedIndex(0);
            break;
          case 'End':
            e.preventDefault();
            setHighlightedIndex(filteredFlatOptions.length - 1);
            break;
          case 'Tab':
            setIsOpen(false);
            break;
        }
      },
      [disabled, isOpen, highlightedIndex, filteredFlatOptions, handleChange]
    );

    // Build class names
    const wrapperClasses = [
      'select',
      `select--${size}`,
      status !== 'default' && `select--${status}`,
      disabled && 'select--disabled',
      isOpen && 'select--open',
      className,
      wrapperClassName,
    ]
      .filter(Boolean)
      .join(' ');

    // Render option content
    const renderOptionContent = (option: SelectOption, index: number) => {
      const isSelected = selectedOption?.value === option.value;
      const isHighlighted = highlightedIndex === index;

      return (
        <div
          key={option.value}
          className={[
            'select__option',
            isSelected && 'select__option--selected',
            isHighlighted && 'select__option--highlighted',
            option.disabled && 'select__option--disabled',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={(e) => {
            e.stopPropagation();
            if (!option.disabled) {
              handleChange(String(option.value), option);
            }
          }}
          onMouseEnter={() => setHighlightedIndex(index)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
        >
          {renderOption ? renderOption(option, isSelected) : (
            <>
              <span className="select__option-label">{option.label}</span>
              {isSelected && (
                <span className="select__option-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </>
          )}
        </div>
      );
    };

    return (
      <div
        ref={containerRef}
        className={wrapperClasses}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-haspopup="listbox"
      >
        {/* Selector */}
        <div
          className="select__selector"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={disabled ? -1 : 0}
          ref={inputRef as React.RefObject<HTMLDivElement>}
        >
          {searchable && isOpen ? (
            <input
              type="text"
              className="select__search-input"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={selectedOption?.label || placeholder}
              autoFocus
            />
          ) : (
            <span className={['select__value', !selectedOption && 'select__value--placeholder'].filter(Boolean).join(' ')}>
              {renderValue ? renderValue(selectedOption) : (selectedOption?.label || placeholder)}
            </span>
          )}

          {/* Arrow and clear */}
          <div className="select__icons">
            {loading && (
              <span className="select__loading">
                <svg viewBox="0 0 24 24" className="select__loading-icon">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeLinecap="round" />
                </svg>
              </span>
            )}
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                className="select__clear"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="Clear selection"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
            <span className={['select__arrow', isOpen && 'select__arrow--open'].filter(Boolean).join(' ')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="select__dropdown"
            role="listbox"
            aria-activedescendant={highlightedIndex >= 0 ? `option-${filteredFlatOptions[highlightedIndex]?.value}` : undefined}
          >
            {filteredOptions.length === 0 ? (
              <div className="select__empty">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                if (isOptionGroup(option)) {
                  return (
                    <div key={option.label} className="select__group">
                      <div className="select__group-label">{option.label}</div>
                      <div className="select__group-options">
                        {option.options.map((opt) => {
                          const globalIndex = filteredFlatOptions.indexOf(opt);
                          return renderOptionContent(opt, globalIndex);
                        })}
                      </div>
                    </div>
                  );
                }
                const globalIndex = filteredFlatOptions.indexOf(option);
                return renderOptionContent(option, globalIndex);
              })
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
