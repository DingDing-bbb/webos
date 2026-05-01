/**
 * 开始菜单配置类型定义
 * JSON配置驱动的开始菜单系统
 */

/**
 * 应用磁贴类别
 */
export type TileCategory = 
  | 'system'      // 系统工具
  | 'productivity' // 生产力
  | 'development' // 开发工具
  | 'entertainment' // 娱乐
  | 'utilities'   // 实用工具
  | 'games'       // 游戏
  | 'web'         // 网络应用
  | 'custom';     // 自定义

/**
 * 磁贴尺寸枚举
 */
export type TileSize = 
  | 'small'       // 小磁贴 (1x1)
  | 'medium'      // 中磁贴 (2x2) 
  | 'wide'        // 宽磁贴 (4x2)
  | 'large'       // 大磁贴 (4x4)
  | 'full'        // 全宽磁贴 (full width)

/**
 * 磁贴布局接口
 */
export interface TileLayout {
  /** 列数 (1-6) */
  columns: number;
  /** 行数 (1-8) */
  rows: number;
}

/**
 * 开始菜单应用磁贴定义
 */
export interface StartMenuTile {
  /** 磁贴唯一ID */
  id: string;
  /** 显示名称 */
  name: string;
  /** 磁贴描述 */
  description?: string;
  /** 磁贴图标URL或组件名称 */
  icon: string;
  /** 磁贴尺寸 */
  size: TileSize;
  /** 磁贴位置（自动计算或手动指定） */
  position?: {
    /** 行位置 (0-based) */
    row: number;
    /** 列位置 (0-based) */
    column: number;
  };
  /** 磁贴背景色 (支持CSS颜色值) */
  backgroundColor?: string;
  /** 磁贴文字颜色 */
  textColor?: string;
  /** 是否显示名称 */
  showName?: boolean;
  /** 是否为新应用 */
  isNew?: boolean;
  /** 是否推荐 */
  isRecommended?: boolean;
  /** 是否固定到开始菜单 */
  isPinned?: boolean;
  /** 磁贴类别 */
  category: TileCategory;
  /** 应用执行命令或URL */
  action: {
    /** 命令类型: 'app' | 'url' | 'command' | 'system' */
    type: 'app' | 'url' | 'command' | 'system';
    /** 应用ID或命令 */
    target: string;
    /** 启动参数 */
    params?: Record<string, any>;
  };
  /** 元数据 */
  metadata?: {
    /** 应用版本 */
    version?: string;
    /** 开发者 */
    developer?: string;
    /** 安装日期 */
    installedAt?: string;
    /** 最后使用时间 */
    lastUsed?: string;
    /** 使用频率计数 */
    usageCount?: number;
  };
}

/**
 * 开始菜单分类定义
 */
export interface StartMenuCategory {
  /** 分类ID */
  id: TileCategory;
  /** 分类名称 */
  name: string;
  /** 分类图标 */
  icon?: string;
  /** 分类描述 */
  description?: string;
  /** 是否在开始菜单中显示 */
  visible?: boolean;
  /** 分类中的磁贴ID列表 */
  tileIds: string[];
  /** 分类排序权重 */
  weight: number;
}

/**
 * 开始菜单布局配置
 */
export interface StartMenuLayout {
  /** 磁贴网格布局 */
  grid: {
    /** 列数 (默认6) */
    columns: number;
    /** 行数 (默认8) */
    rows: number;
    /** 磁贴间距 (像素) */
    gap: number;
    /** 磁贴圆角半径 */
    borderRadius: number;
    /** 显示网格线 (调试用) */
    showGrid?: boolean;
  };
  /** 固定磁贴区域配置 */
  pinnedArea: {
    /** 固定磁贴ID列表（按顺序） */
    tileIds: string[];
    /** 固定磁贴区域标题 */
    title: string;
    /** 是否显示固定区域 */
    visible: boolean;
  };
  /** 推荐区域配置 */
  recommendedArea: {
    /** 推荐磁贴ID列表 */
    tileIds: string[];
    /** 推荐区域标题 */
    title: string;
    /** 是否显示推荐区域 */
    visible: boolean;
    /** 最多显示数量 */
    maxItems: number;
    /** 推荐算法: 'recent' | 'frequent' | 'manual' */
    algorithm: 'recent' | 'frequent' | 'manual';
  };
  /** 最近使用区域配置 */
  recentArea: {
    /** 是否显示最近使用区域 */
    visible: boolean;
    /** 最多显示数量 */
    maxItems: number;
    /** 最大保留天数 */
    maxAgeDays: number;
  };
  /** 搜索配置 */
  search: {
    /** 搜索提供商: 'local' | 'web' | 'hybrid' */
    provider: 'local' | 'web' | 'hybrid';
    /** 搜索建议数量 */
    suggestionCount: number;
    /** 搜索历史记录数量 */
    historyCount: number;
    /** 是否启用语音搜索 */
    voiceEnabled?: boolean;
  };
}

/**
 * 开始菜单主题配置
 */
export interface StartMenuTheme {
  /** 菜单背景色 */
  backgroundColor: string;
  /** 背景透明度 (0-1) */
  backgroundOpacity: number;
  /** 背景模糊强度 (像素) */
  backdropBlur: number;
  /** 文字颜色 */
  textColor: string;
  /** 强调色 */
  accentColor: string;
  /** 边框颜色 */
  borderColor: string;
  /** 边框宽度 */
  borderWidth: number;
  /** 阴影配置 */
  shadow: {
    /** 是否启用阴影 */
    enabled: boolean;
    /** 阴影颜色 */
    color: string;
    /** 阴影偏移X */
    offsetX: number;
    /** 阴影偏移Y */
    offsetY: number;
    /** 阴影模糊半径 */
    blur: number;
    /** 阴影扩展半径 */
    spread: number;
  };
  /** 动画配置 */
  animations: {
    /** 是否启用动画 */
    enabled: boolean;
    /** 打开动画持续时间 (毫秒) */
    openDuration: number;
    /** 关闭动画持续时间 (毫秒) */
    closeDuration: number;
    /** 磁贴悬停动画 */
    tileHover: boolean;
    /** 磁贴点击动画 */
    tileClick: boolean;
  };
}

/**
 * 用户个性化配置
 */
export interface StartMenuUserPrefs {
  /** 用户ID */
  userId: string;
  /** 用户自定义排序 */
  customOrder?: Record<string, number>;
  /** 用户隐藏的磁贴ID列表 */
  hiddenTileIds: string[];
  /** 用户固定的自定义磁贴ID列表 */
  customPinnedIds: string[];
  /** 用户最近使用的应用ID列表（按时间顺序） */
  recentAppIds: string[];
  /** 用户搜索历史 */
  searchHistory: string[];
  /** 开始菜单位置偏好 */
  position: 'bottom-left' | 'center' | 'fullscreen';
  /** 开始菜单大小 */
  size: 'compact' | 'normal' | 'expanded';
}

/**
 * 完整的开始菜单配置
 */
export interface StartMenuConfig {
  /** 配置版本 */
  version: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 所有磁贴定义 */
  tiles: StartMenuTile[];
  /** 磁贴分类 */
  categories: StartMenuCategory[];
  /** 布局配置 */
  layout: StartMenuLayout;
  /** 主题配置 */
  theme: StartMenuTheme;
  /** 是否启用动态磁贴 */
  liveTiles: {
    /** 启用状态 */
    enabled: boolean;
    /** 刷新间隔 (秒) */
    refreshInterval: number;
    /** 启用动态磁贴的应用ID列表 */
    enabledTileIds: string[];
  };
  /** 系统默认配置 */
  systemDefaults: {
    /** 默认固定磁贴ID列表 */
    defaultPinnedIds: string[];
    /** 默认推荐磁贴ID列表 */
    defaultRecommendedIds: string[];
    /** 默认可见分类 */
    defaultVisibleCategories: TileCategory[];
  };
  /** 元数据 */
  metadata?: {
    /** 创建时间 */
    createdAt: string;
    /** 最后修改时间 */
    updatedAt: string;
    /** 创建者 */
    creator?: string;
    /** 配置来源 */
    source?: 'system' | 'user' | 'custom';
  };
}

/**
 * 开始菜单数据模型接口
 */
export interface StartMenuData {
  /** 配置 */
  config: StartMenuConfig;
  /** 用户个性化配置 */
  userPrefs: StartMenuUserPrefs;
  /** 运行时状态 */
  runtime: {
    /** 已安装应用ID列表 */
    installedAppIds: string[];
    /** 搜索索引 */
    searchIndex: Record<string, string[]>;
    /** 磁贴布局缓存 */
    tileLayoutCache: Record<string, TileLayout>;
    /** 磁贴状态 */
    tileStates: Record<string, {
      /** 是否可见 */
      visible: boolean;
      /** 是否启用 */
      enabled: boolean;
      /** 加载状态 */
      loading: boolean;
      /** 错误信息 */
      error?: string;
    }>;
  };
}