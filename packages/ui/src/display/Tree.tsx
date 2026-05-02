/**
 * @fileoverview Tree Component
 * @module @ui/display/Tree
 *
 * A tree component with expand/collapse, drag-and-drop sorting,
 * and right-click context menu support.
 *
 * @example
 * ```tsx
 * import { Tree } from '@webos/ui/display';
 *
 * const treeData = [
 *   {
 *     key: '1',
 *     title: 'Node 1',
 *     children: [
 *       { key: '1-1', title: 'Child 1' },
 *     ],
 *   },
 * ];
 *
 * <Tree
 *   treeData={treeData}
 *   checkable
 *   draggable
 *   onDrop={handleDrop}
 * />
 * ```
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  memo,
  createContext,
  useContext,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TreeNodeData {
  /** Unique node key */
  key: string;
  /** Node title */
  title: React.ReactNode;
  /** Node icon */
  icon?: React.ReactNode;
  /** Children nodes */
  children?: TreeNodeData[];
  /** Disabled state */
  disabled?: boolean;
  /** Selectable state */
  selectable?: boolean;
  /** Checkable state (when tree is checkable) */
  checkable?: boolean;
  /** Disable checkbox */
  disableCheckbox?: boolean;
  /** Is leaf node */
  isLeaf?: boolean;
  /** Custom data */
  [key: string]: unknown;
}

export interface TreeProps {
  /** Tree data */
  treeData: TreeNodeData[];
  /** Selected keys */
  selectedKeys?: string[];
  /** Default selected keys */
  defaultSelectedKeys?: string[];
  /** Expanded keys */
  expandedKeys?: string[];
  /** Default expanded keys */
  defaultExpandedKeys?: string[];
  /** Checked keys */
  checkedKeys?: string[];
  /** Default checked keys */
  defaultCheckedKeys?: string[];
  /** Enable checkbox */
  checkable?: boolean;
  /** Check strictly (parent and children are not linked) */
  checkStrictly?: boolean;
  /** Enable drag and drop */
  draggable?: boolean;
  /** Enable multiple selection */
  multiple?: boolean;
  /** Show line */
  showLine?: boolean;
  /** Show icon */
  showIcon?: boolean;
  /** Block node (full width highlight) */
  blockNode?: boolean;
  /** Default expand all */
  defaultExpandAll?: boolean;
  /** Expand root nodes by default */
  defaultExpandRoot?: boolean;
  /** Auto expand parent when child is expanded */
  autoExpandParent?: boolean;
  /** Filter function */
  filterTreeNode?: (node: TreeNodeData) => boolean;
  /** Select callback */
  onSelect?: (selectedKeys: string[], info: { node: TreeNodeData; selected: boolean }) => void;
  /** Expand callback */
  onExpand?: (expandedKeys: string[], info: { node: TreeNodeData; expanded: boolean }) => void;
  /** Check callback */
  onCheck?: (checkedKeys: string[], info: { node: TreeNodeData; checked: boolean }) => void;
  /** Drag start callback */
  onDragStart?: (info: { node: TreeNodeData; event: React.DragEvent }) => void;
  /** Drag end callback */
  onDragEnd?: (info: { node: TreeNodeData; event: React.DragEvent }) => void;
  /** Drag over callback */
  onDragOver?: (info: { node: TreeNodeData; event: React.DragEvent }) => void;
  /** Drag leave callback */
  onDragLeave?: (info: { node: TreeNodeData; event: React.DragEvent }) => void;
  /** Drop callback */
  onDrop?: (info: {
    node: TreeNodeData;
    dragNode: TreeNodeData;
    dropPosition: number;
    dropToGap: boolean;
    event: React.DragEvent;
  }) => void;
  /** Right-click callback */
  onRightClick?: (info: { node: TreeNodeData; event: React.MouseEvent }) => void;
  /** Custom title render */
  titleRender?: (node: TreeNodeData) => React.ReactNode;
  /** Custom icon render */
  iconRender?: (node: TreeNodeData) => React.ReactNode;
  /** Load data dynamically */
  loadData?: (node: TreeNodeData) => Promise<void>;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Virtual scroll height */
  height?: number;
  /** Item height for virtual scroll */
  itemHeight?: number;
}

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  parentKey?: string;
}

interface DragInfo {
  node: TreeNodeData;
  nodeKey: string;
}

interface TreeContextValue {
  selectedKeys: Set<string>;
  expandedKeys: Set<string>;
  checkedKeys: Set<string>;
  checkable: boolean;
  checkStrictly: boolean;
  draggable: boolean;
  showLine: boolean;
  showIcon: boolean;
  blockNode: boolean;
  filter: ((node: TreeNodeData) => boolean) | null;
  dragInfo: DragInfo | null;
  onSelect: (key: string, node: TreeNodeData, selected: boolean) => void;
  onExpand: (key: string, node: TreeNodeData, expanded: boolean) => void;
  onCheck: (key: string, node: TreeNodeData, checked: boolean) => void;
  onDragStart: (node: TreeNodeData, event: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (node: TreeNodeData, event: React.DragEvent) => void;
  onDragLeave: (node: TreeNodeData, event: React.DragEvent) => void;
  onDrop: (
    node: TreeNodeData,
    dropPosition: number,
    dropToGap: boolean,
    event: React.DragEvent
  ) => void;
  onRightClick: (node: TreeNodeData, event: React.MouseEvent) => void;
  titleRender: ((node: TreeNodeData) => React.ReactNode) | null;
  iconRender: ((node: TreeNodeData) => React.ReactNode) | null;
  loadData: ((node: TreeNodeData) => Promise<void>) | null;
  loadingKeys: Set<string>;
  setLoadingKey: (key: string, loading: boolean) => void;
}

// ============================================================================
// Context
// ============================================================================

const TreeContext = createContext<TreeContextValue | null>(null);

const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('TreeNode must be used within Tree');
  }
  return context;
};

// ============================================================================
// Utility Functions
// ============================================================================

function flattenTreeData(
  treeData: TreeNodeData[],
  parentKey?: string
): Map<string, { node: TreeNodeData; parentKey?: string; children?: string[] }> {
  const map = new Map<string, { node: TreeNodeData; parentKey?: string; children?: string[] }>();

  const traverse = (nodes: TreeNodeData[], parent?: string) => {
    nodes.forEach((node) => {
      const children = node.children?.map((child) => child.key);
      map.set(node.key, { node, parentKey: parent, children });
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.key);
      }
    });
  };

  traverse(treeData, parentKey);
  return map;
}

function getAllDescendantKeys(
  nodeKey: string,
  nodeMap: Map<string, { children?: string[] }>
): string[] {
  const nodeInfo = nodeMap.get(nodeKey);
  if (!nodeInfo?.children) return [];

  const keys: string[] = [];
  const traverse = (keys: string[]) => {
    keys.forEach((key) => {
      const info = nodeMap.get(key);
      if (info) {
        keys.push(key);
        if (info.children) {
          traverse(info.children);
        }
      }
    });
  };

  traverse(nodeInfo.children);
  return keys;
}

// ============================================================================
// Context Menu Component
// ============================================================================

interface ContextMenuProps {
  x: number;
  y: number;
  node: TreeNodeData;
  onClose: () => void;
  items?: Array<{
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, items }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const defaultItems = items || [
    {
      key: 'add',
      label: 'Add Child' as React.ReactNode,
      icon: (<PlusIcon />) as React.ReactNode,
      disabled: false,
      onClick: undefined,
    },
    {
      key: 'edit',
      label: 'Edit' as React.ReactNode,
      icon: (<EditIcon />) as React.ReactNode,
      disabled: false,
      onClick: undefined,
    },
    {
      key: 'delete',
      label: 'Delete' as React.ReactNode,
      icon: (<DeleteIcon />) as React.ReactNode,
      disabled: false,
      onClick: undefined,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="ui-tree-context-menu"
      style={{ position: 'fixed', left: x, top: y, zIndex: 1000 }}
    >
      {defaultItems.map((item, _index) => (
        <div
          key={item.key}
          className={`ui-tree-context-menu-item ${item.disabled ? 'disabled' : ''}`}
          onClick={() => {
            if (!item.disabled) {
              item.onClick?.();
              onClose();
            }
          }}
        >
          {item.icon && <span className="menu-icon">{item.icon}</span>}
          <span className="menu-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Icons
// ============================================================================

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// ============================================================================
// Tree Node Component
// ============================================================================

const TreeNode = memo<TreeNodeProps>(({ node, level, parentKey: _parentKey }) => {
  const {
    selectedKeys,
    expandedKeys,
    checkedKeys,
    checkable,
    checkStrictly: _checkStrictly,
    draggable,
    showLine,
    showIcon,
    blockNode,
    filter,
    dragInfo,
    onSelect,
    onExpand,
    onCheck,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onRightClick,
    titleRender,
    iconRender,
    loadData,
    loadingKeys,
    setLoadingKey,
  } = useTreeContext();

  const nodeRef = useRef<HTMLDivElement>(null);
  const [dropPosition, setDropPosition] = useState<number | null>(null);

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKeys.has(node.key);
  const isChecked = checkedKeys.has(node.key);
  const isLoading = loadingKeys.has(node.key);
  const isDisabled = node.disabled;
  const isFiltered = filter ? filter(node) : true;
  const isDragging = dragInfo?.nodeKey === node.key;
  const isDragTarget = dragInfo !== null && dragInfo.nodeKey !== node.key;

  const handleToggle = async () => {
    if (isDisabled) return;

    if (hasChildren || loadData) {
      if (!isExpanded && loadData && !hasChildren) {
        setLoadingKey(node.key, true);
        try {
          await loadData(node);
        } finally {
          setLoadingKey(node.key, false);
        }
      }
      onExpand(node.key, node, !isExpanded);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    if (isDisabled || node.selectable === false) return;
    e.stopPropagation();
    onSelect(node.key, node, !isSelected);
  };

  const handleCheck = (e: React.MouseEvent) => {
    if (isDisabled || node.checkable === false || node.disableCheckbox) return;
    e.stopPropagation();
    onCheck(node.key, node, !isChecked);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(node, e);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable || isDisabled) {
      e.preventDefault();
      return;
    }
    onDragStart(node, e);
  };

  const handleDragEnd = () => {
    onDragEnd();
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggable || !isDragTarget || isDisabled) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      const y = e.clientY - rect.top;
      const height = rect.height;
      if (y < height / 3) {
        setDropPosition(-1); // Before
      } else if (y > (height * 2) / 3) {
        setDropPosition(1); // After
      } else {
        setDropPosition(0); // Inside
      }
    }

    onDragOver(node, e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDropPosition(null);
    onDragLeave(node, e);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!draggable || !isDragTarget || isDisabled || dropPosition === null) return;

    e.preventDefault();
    onDrop(node, dropPosition, dropPosition !== 0, e);
    setDropPosition(null);
  };

  if (!isFiltered) return null;

  const nodeClasses = [
    'ui-tree-node',
    isSelected ? 'selected' : '',
    isDisabled ? 'disabled' : '',
    blockNode ? 'block-node' : '',
    isDragging ? 'dragging' : '',
    dropPosition !== null ? `drop-target drop-${dropPosition}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const indentStyle = {
    '--node-level': level,
    paddingLeft: `${level * 20}px`,
  } as React.CSSProperties;

  return (
    <div className={nodeClasses}>
      <div
        ref={nodeRef}
        className="ui-tree-node-content"
        style={indentStyle}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        draggable={draggable && !isDisabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Expand Arrow */}
        <span
          className={`ui-tree-switcher ${hasChildren || loadData ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {isLoading ? (
            <span className="loading-icon">
              <svg className="spin" viewBox="0 0 24 24" width="14" height="14">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="31.4"
                  strokeDashoffset="10"
                />
              </svg>
            </span>
          ) : hasChildren ? (
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : null}
        </span>

        {/* Checkbox */}
        {checkable && (
          <span
            className={`ui-tree-checkbox ${isChecked ? 'checked' : ''} ${node.disableCheckbox ? 'disabled' : ''}`}
            onClick={handleCheck}
          >
            <span className="checkbox-inner" />
          </span>
        )}

        {/* Icon */}
        {showIcon && (
          <span className="ui-tree-icon">{iconRender ? iconRender(node) : node.icon}</span>
        )}

        {/* Title */}
        <span className="ui-tree-title">{titleRender ? titleRender(node) : node.title}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ui-tree-children">
          {showLine && <span className="ui-tree-line" />}
          {node.children!.map((child) => (
            <TreeNode key={child.key} node={child} level={level + 1} parentKey={node.key} />
          ))}
        </div>
      )}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';

// ============================================================================
// Main Tree Component
// ============================================================================

export const Tree = forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      treeData,
      selectedKeys: controlledSelectedKeys,
      defaultSelectedKeys = [],
      expandedKeys: controlledExpandedKeys,
      defaultExpandedKeys = [],
      checkedKeys: controlledCheckedKeys,
      defaultCheckedKeys = [],
      checkable = false,
      checkStrictly = false,
      draggable = false,
      multiple = false,
      showLine = false,
      showIcon = false,
      blockNode = false,
      defaultExpandAll = false,
      defaultExpandRoot = false,
      autoExpandParent = true,
      filterTreeNode,
      onSelect,
      onExpand,
      onCheck,
      onDragStart,
      onDragEnd: _onDragEnd,
      onDragOver,
      onDragLeave,
      onDrop,
      onRightClick,
      titleRender,
      iconRender,
      loadData,
      className = '',
      style,
      height,
      itemHeight: _itemHeight = 28,
    },
    ref
  ) => {
    // Node map for lookups
    const nodeMap = useMemo(() => flattenTreeData(treeData), [treeData]);

    // State
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
      new Set(controlledSelectedKeys ?? defaultSelectedKeys)
    );
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
      if (controlledExpandedKeys) return new Set(controlledExpandedKeys);
      if (defaultExpandAll) {
        return new Set(Array.from(nodeMap.keys()));
      }
      if (defaultExpandRoot) {
        return new Set(treeData.map((n) => n.key));
      }
      return new Set(defaultExpandedKeys);
    });
    const [checkedKeys, setCheckedKeys] = useState<Set<string>>(
      new Set(controlledCheckedKeys ?? defaultCheckedKeys)
    );
    const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      node: TreeNodeData;
    } | null>(null);

    // Sync controlled state
    useEffect(() => {
      if (controlledSelectedKeys !== undefined) {
        setSelectedKeys(new Set(controlledSelectedKeys));
      }
    }, [controlledSelectedKeys]);

    useEffect(() => {
      if (controlledExpandedKeys !== undefined) {
        setExpandedKeys(new Set(controlledExpandedKeys));
      }
    }, [controlledExpandedKeys]);

    useEffect(() => {
      if (controlledCheckedKeys !== undefined) {
        setCheckedKeys(new Set(controlledCheckedKeys));
      }
    }, [controlledCheckedKeys]);

    // Handlers
    const handleSelect = useCallback(
      (key: string, node: TreeNodeData, selected: boolean) => {
        const newKeys = new Set(selectedKeys);
        if (multiple) {
          if (selected) {
            newKeys.add(key);
          } else {
            newKeys.delete(key);
          }
        } else {
          newKeys.clear();
          if (selected) {
            newKeys.add(key);
          }
        }
        setSelectedKeys(newKeys);
        onSelect?.(Array.from(newKeys), { node, selected });
      },
      [selectedKeys, multiple, onSelect]
    );

    const handleExpand = useCallback(
      (key: string, node: TreeNodeData, expanded: boolean) => {
        const newKeys = new Set(expandedKeys);
        if (expanded) {
          newKeys.add(key);
          if (autoExpandParent) {
            // Add parent keys
            let current = nodeMap.get(key);
            while (current?.parentKey) {
              newKeys.add(current.parentKey);
              current = nodeMap.get(current.parentKey);
            }
          }
        } else {
          newKeys.delete(key);
          // Remove all descendant keys
          const descendants = getAllDescendantKeys(key, nodeMap);
          descendants.forEach((k) => newKeys.delete(k));
        }
        setExpandedKeys(newKeys);
        onExpand?.(Array.from(newKeys), { node, expanded });
      },
      [expandedKeys, autoExpandParent, nodeMap, onExpand]
    );

    const handleCheck = useCallback(
      (key: string, node: TreeNodeData, checked: boolean) => {
        if (checkStrictly) {
          const newKeys = new Set(checkedKeys);
          if (checked) {
            newKeys.add(key);
          } else {
            newKeys.delete(key);
          }
          setCheckedKeys(newKeys);
          onCheck?.(Array.from(newKeys), { node, checked });
        } else {
          const newKeys = new Set(checkedKeys);
          if (checked) {
            newKeys.add(key);
            // Check all descendants
            const descendants = getAllDescendantKeys(key, nodeMap);
            descendants.forEach((k) => newKeys.add(k));
          } else {
            newKeys.delete(key);
            // Uncheck all descendants
            const descendants = getAllDescendantKeys(key, nodeMap);
            descendants.forEach((k) => newKeys.delete(k));
          }
          setCheckedKeys(newKeys);
          onCheck?.(Array.from(newKeys), { node, checked });
        }
      },
      [checkedKeys, checkStrictly, nodeMap, onCheck]
    );

    const handleDragStart = useCallback(
      (node: TreeNodeData, event: React.DragEvent) => {
        setDragInfo({ node, nodeKey: node.key });
        onDragStart?.({ node, event });
      },
      [onDragStart]
    );

    const handleDragEnd = useCallback(() => {
      setDragInfo(null);
    }, []);

    const handleDragOver = useCallback(
      (node: TreeNodeData, event: React.DragEvent) => {
        onDragOver?.({ node, event });
      },
      [onDragOver]
    );

    const handleDragLeave = useCallback(
      (node: TreeNodeData, event: React.DragEvent) => {
        onDragLeave?.({ node, event });
      },
      [onDragLeave]
    );

    const handleDrop = useCallback(
      (node: TreeNodeData, dropPos: number, dropToGap: boolean, event: React.DragEvent) => {
        if (dragInfo) {
          onDrop?.({
            node,
            dragNode: dragInfo.node,
            dropPosition: dropPos,
            dropToGap,
            event,
          });
        }
        setDragInfo(null);
      },
      [dragInfo, onDrop]
    );

    const handleRightClick = useCallback(
      (node: TreeNodeData, event: React.MouseEvent) => {
        setContextMenu({ x: event.clientX, y: event.clientY, node });
        onRightClick?.({ node, event });
      },
      [onRightClick]
    );

    const setLoadingKey = useCallback((key: string, loading: boolean) => {
      setLoadingKeys((prev) => {
        const next = new Set(prev);
        if (loading) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    }, []);

    // Context value
    const contextValue: TreeContextValue = {
      selectedKeys,
      expandedKeys,
      checkedKeys,
      checkable,
      checkStrictly,
      draggable,
      showLine,
      showIcon,
      blockNode,
      filter: filterTreeNode || null,
      dragInfo,
      onSelect: handleSelect,
      onExpand: handleExpand,
      onCheck: handleCheck,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onRightClick: handleRightClick,
      titleRender: titleRender || null,
      iconRender: iconRender || null,
      loadData: loadData || null,
      loadingKeys,
      setLoadingKey,
    };

    const treeClasses = ['ui-tree', showLine ? 'show-line' : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <TreeContext.Provider value={contextValue}>
        <div ref={ref} className={treeClasses} style={style}>
          <div className="ui-tree-list" style={height ? { height, overflow: 'auto' } : undefined}>
            {treeData.map((node) => (
              <TreeNode key={node.key} node={node} level={0} />
            ))}
          </div>
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            node={contextMenu.node}
            onClose={() => setContextMenu(null)}
          />
        )}
      </TreeContext.Provider>
    );
  }
);

Tree.displayName = 'Tree';

// ============================================================================
// Directory Tree Variant
// ============================================================================

export interface DirectoryTreeProps extends Omit<TreeProps, 'showIcon'> {
  /** Show directory icons */
  showIcon?: boolean;
}

export const DirectoryTree: React.FC<DirectoryTreeProps> = ({ showIcon = true, ...props }) => {
  const iconRender = useCallback(
    (node: TreeNodeData) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = props.expandedKeys?.includes(node.key);

      if (hasChildren) {
        return isExpanded ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );
      }

      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    },
    [props.expandedKeys]
  );

  return <Tree {...props} showIcon={showIcon} iconRender={iconRender} />;
};

export default Tree;
