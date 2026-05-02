/**
 * Tree Component - 树形导航组件
 * 支持展开/折叠、复选框支持、搜索过滤
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react';

// ========== Types ==========
export interface TreeNode {
  key: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  data?: unknown;
}

export interface TreeProps {
  treeData: TreeNode[];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  checkedKeys?: string[] | { checked: string[]; halfChecked: string[] };
  defaultCheckedKeys?: string[];
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onSelect?: (selectedKeys: string[], info: { node: TreeNode; selected: boolean }) => void;
  onCheck?: (
    checkedKeys: string[],
    info: { node: TreeNode; checked: boolean; checkedNodes: TreeNode[] }
  ) => void;
  onExpand?: (expandedKeys: string[], info: { node: TreeNode; expanded: boolean }) => void;
  onSearch?: (value: string) => void;
  checkable?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  defaultExpandAll?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  height?: number;
}

interface TreeContextType {
  selectedKeys: string[];
  checkedKeys: string[];
  halfCheckedKeys: string[];
  expandedKeys: string[];
  checkable: boolean;
  selectable: boolean;
  multiple: boolean;
  onSelect: (key: string, node: TreeNode, selected: boolean) => void;
  onCheck: (key: string, node: TreeNode, checked: boolean) => void;
  onExpand: (key: string, node: TreeNode, expanded: boolean) => void;
}

const TreeContext = createContext<TreeContextType | null>(null);

// ========== Search Input Component ==========
interface TreeSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const TreeSearch: React.FC<TreeSearchProps> = ({ placeholder, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="nav-tree-search">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="nav-tree-search-input"
      />
      {value && (
        <button className="nav-tree-search-clear" onClick={handleClear} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
};

// ========== TreeNode Component ==========
interface TreeNodeProps {
  node: TreeNode;
  level: number;
  searchValue?: string;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({ node, level, searchValue }) => {
  const context = useContext(TreeContext);
  if (!context) return null;

  const {
    selectedKeys,
    checkedKeys,
    halfCheckedKeys,
    expandedKeys,
    checkable,
    selectable: _selectable,
    multiple: _multiple,
    onSelect,
    onCheck,
    onExpand,
  } = context;

  const isExpanded = expandedKeys.includes(node.key);
  const isSelected = selectedKeys.includes(node.key);
  const isChecked = checkedKeys.includes(node.key);
  const isHalfChecked = halfCheckedKeys.includes(node.key);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = node.isLeaf ?? !hasChildren;

  // Highlight search match
  const highlightMatch = (text: React.ReactNode): React.ReactNode => {
    if (!searchValue || typeof text !== 'string') return text;
    const lowerText = text.toLowerCase();
    const lowerSearch = searchValue.toLowerCase();
    const index = lowerText.indexOf(lowerSearch);
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="nav-tree-node-highlight">
          {text.slice(index, index + searchValue.length)}
        </span>
        {text.slice(index + searchValue.length)}
      </>
    );
  };

  const handleToggle = () => {
    if (node.disabled) return;
    onExpand(node.key, node, !isExpanded);
  };

  const handleSelect = (e: React.MouseEvent) => {
    if (node.disabled || node.selectable === false) return;
    e.stopPropagation();
    onSelect(node.key, node, !isSelected);
  };

  const handleCheck = (e: React.MouseEvent) => {
    if (node.disabled || node.disableCheckbox || !checkable) return;
    e.stopPropagation();
    onCheck(node.key, node, !isChecked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(e as unknown as React.MouseEvent);
    } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      handleToggle();
    } else if (e.key === 'ArrowLeft' && isExpanded) {
      handleToggle();
    }
  };

  return (
    <li
      className={`
        nav-tree-node
        ${isSelected ? 'nav-tree-node-selected' : ''}
        ${node.disabled ? 'nav-tree-node-disabled' : ''}
        ${isLeaf ? 'nav-tree-node-leaf' : ''}
      `.trim()}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={node.disabled}
      aria-level={level}
    >
      <div
        className="nav-tree-node-content"
        style={{ paddingLeft: level * 20 }}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        tabIndex={node.disabled ? -1 : 0}
        role="button"
      >
        {/* Expand/Collapse switcher */}
        <span
          className={`
            nav-tree-node-switcher
            ${hasChildren ? '' : 'nav-tree-node-switcher-noop'}
            ${isExpanded ? 'nav-tree-node-switcher-expanded' : ''}
          `.trim()}
          onClick={handleToggle}
          aria-hidden
        >
          {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
        </span>

        {/* Checkbox */}
        {checkable && (
          <span
            className={`
              nav-tree-node-checkbox
              ${isChecked ? 'nav-tree-node-checkbox-checked' : ''}
              ${isHalfChecked ? 'nav-tree-node-checkbox-indeterminate' : ''}
              ${node.disableCheckbox ? 'nav-tree-node-checkbox-disabled' : ''}
            `.trim()}
            onClick={handleCheck}
            aria-checked={isChecked}
          >
            {isChecked ? '☑' : isHalfChecked ? '⊟' : '☐'}
          </span>
        )}

        {/* Icon */}
        {node.icon && <span className="nav-tree-node-icon">{node.icon}</span>}

        {/* Title */}
        <span className="nav-tree-node-title">{highlightMatch(node.title)}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <ul className="nav-tree-node-children" role="group">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.key}
              node={child}
              level={level + 1}
              searchValue={searchValue}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// ========== Utility Functions ==========
const getAllKeys = (nodes: TreeNode[]): string[] => {
  const keys: string[] = [];
  const traverse = (nodeList: TreeNode[]) => {
    nodeList.forEach((node) => {
      keys.push(node.key);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return keys;
};

const filterTree = (nodes: TreeNode[], searchValue: string): TreeNode[] => {
  if (!searchValue) return nodes;

  return nodes.reduce<TreeNode[]>((acc, node) => {
    const titleMatch =
      typeof node.title === 'string' &&
      node.title.toLowerCase().includes(searchValue.toLowerCase());

    let filteredChildren: TreeNode[] = [];
    if (node.children) {
      filteredChildren = filterTree(node.children, searchValue);
    }

    if (titleMatch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }

    return acc;
  }, []);
};

// ========== Main Tree Component ==========
export const Tree: React.FC<TreeProps> = ({
  treeData,
  selectedKeys: controlledSelectedKeys,
  defaultSelectedKeys = [],
  checkedKeys: controlledCheckedKeys,
  defaultCheckedKeys = [],
  expandedKeys: controlledExpandedKeys,
  defaultExpandedKeys = [],
  onSelect,
  onCheck,
  onExpand,
  onSearch,
  checkable = false,
  selectable = true,
  multiple = false,
  defaultExpandAll = false,
  showSearch = false,
  searchPlaceholder = 'Search...',
  className = '',
  style,
  acrylic = true,
  height,
}) => {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);
  const [internalCheckedKeys, setInternalCheckedKeys] = useState<string[]>(defaultCheckedKeys);
  const [internalHalfCheckedKeys, _setInternalHalfCheckedKeys] = useState<string[]>([]);
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(
    defaultExpandAll ? getAllKeys(treeData) : defaultExpandedKeys
  );
  const [searchValue, setSearchValue] = useState('');

  const treeRef = useRef<HTMLUListElement>(null);

  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const expandedKeys = controlledExpandedKeys ?? internalExpandedKeys;

  // Parse checked keys
  const parsedCheckedKeys = useMemo(() => {
    if (Array.isArray(controlledCheckedKeys)) {
      return { checked: controlledCheckedKeys, halfChecked: internalHalfCheckedKeys };
    }
    return (
      controlledCheckedKeys ?? {
        checked: internalCheckedKeys,
        halfChecked: internalHalfCheckedKeys,
      }
    );
  }, [controlledCheckedKeys, internalCheckedKeys, internalHalfCheckedKeys]);

  // Filter tree based on search
  const filteredData = useMemo(() => {
    return filterTree(treeData, searchValue);
  }, [treeData, searchValue]);

  // Auto expand when searching
  useEffect(() => {
    if (searchValue && !controlledExpandedKeys) {
      setInternalExpandedKeys(getAllKeys(filteredData));
    }
  }, [searchValue, filteredData, controlledExpandedKeys]);

  const handleSelect = useCallback(
    (key: string, node: TreeNode, selected: boolean) => {
      let newSelectedKeys: string[];

      if (multiple) {
        newSelectedKeys = selected ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key);
      } else {
        newSelectedKeys = selected ? [key] : [];
      }

      setInternalSelectedKeys(newSelectedKeys);
      onSelect?.(newSelectedKeys, { node, selected });
    },
    [selectedKeys, multiple, onSelect]
  );

  const handleCheck = useCallback(
    (key: string, node: TreeNode, checked: boolean) => {
      // Simple check logic - in a real implementation you'd need to handle parent/child relationships
      let newCheckedKeys: string[];

      if (checked) {
        newCheckedKeys = [...parsedCheckedKeys.checked, key];
      } else {
        newCheckedKeys = parsedCheckedKeys.checked.filter((k) => k !== key);
      }

      setInternalCheckedKeys(newCheckedKeys);
      onCheck?.(newCheckedKeys, { node, checked, checkedNodes: [] });
    },
    [parsedCheckedKeys, onCheck]
  );

  const handleExpand = useCallback(
    (key: string, node: TreeNode, expanded: boolean) => {
      let newExpandedKeys: string[];

      if (expanded) {
        newExpandedKeys = [...expandedKeys, key];
      } else {
        newExpandedKeys = expandedKeys.filter((k) => k !== key);
      }

      setInternalExpandedKeys(newExpandedKeys);
      onExpand?.(newExpandedKeys, { node, expanded });
    },
    [expandedKeys, onExpand]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  // Keyboard navigation
  useEffect(() => {
    const tree = treeRef.current;
    if (!tree) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableItems = tree.querySelectorAll<HTMLElement>(
        '.nav-tree-node-content[tabindex="0"]'
      );
      const currentIndex = Array.from(focusableItems).findIndex(
        (item) => item === document.activeElement
      );

      let nextIndex: number;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = focusableItems.length - 1;
          break;
        default:
          return;
      }

      focusableItems[nextIndex]?.focus();
    };

    tree.addEventListener('keydown', handleKeyDown);
    return () => tree.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue: TreeContextType = {
    selectedKeys,
    checkedKeys: parsedCheckedKeys.checked,
    halfCheckedKeys: parsedCheckedKeys.halfChecked,
    expandedKeys,
    checkable,
    selectable,
    multiple,
    onSelect: handleSelect,
    onCheck: handleCheck,
    onExpand: handleExpand,
  };

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        className={`
          nav-tree
          ${acrylic ? 'nav-tree-acrylic' : ''}
          ${className}
        `.trim()}
        style={style}
      >
        {showSearch && (
          <TreeSearch placeholder={searchPlaceholder} value={searchValue} onChange={handleSearch} />
        )}

        <ul
          ref={treeRef}
          className="nav-tree-list"
          role="tree"
          aria-label="Tree navigation"
          style={height ? { maxHeight: height, overflow: 'auto' } : undefined}
        >
          {filteredData.map((node) => (
            <TreeNodeComponent key={node.key} node={node} level={0} searchValue={searchValue} />
          ))}
        </ul>

        {filteredData.length === 0 && searchValue && (
          <div className="nav-tree-empty">No results found</div>
        )}
      </div>
    </TreeContext.Provider>
  );
};

// ========== TreeNode Export for standalone usage ==========
export { TreeNodeComponent as TreeNode };

export default Tree;
