/**
 * 开始菜单配置管理器
 * 提供JSON配置的加载、验证、更新和查询功能
 */

import type {
  StartMenuConfig,
  StartMenuTile,
  StartMenuCategory,
  StartMenuLayout,
  StartMenuTheme,
  StartMenuUserPrefs,
  TileCategory,
  TileSize
} from './startMenu.types';

/**
 * 默认开始菜单配置
 */
export const DEFAULT_START_MENU_CONFIG: StartMenuConfig = {
  version: '1.0.0',
  name: 'WebOS 默认开始菜单',
  description: 'WebOS 操作系统默认开始菜单配置',
  
  tiles: [
    // 系统工具
    {
      id: 'app-explorer',
      name: '文件管理器',
      description: '浏览和管理文件系统',
      icon: '📁',
      size: 'medium',
      category: 'system',
      isPinned: true,
      backgroundColor: '#2563eb',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'file-explorer',
        params: {}
      }
    },
    {
      id: 'app-settings',
      name: '设置',
      description: '系统设置和配置',
      icon: '⚙️',
      size: 'small',
      category: 'system',
      isPinned: true,
      backgroundColor: '#059669',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'settings',
        params: {}
      }
    },
    {
      id: 'app-terminal',
      name: '终端',
      description: '命令行终端',
      icon: '💻',
      size: 'small',
      category: 'system',
      isPinned: true,
      backgroundColor: '#000000',
      textColor: '#00ff00',
      action: {
        type: 'app',
        target: 'terminal',
        params: {}
      }
    },
    
    // 生产力工具
    {
      id: 'app-editor',
      name: '代码编辑器',
      description: '代码编辑和开发',
      icon: '📝',
      size: 'wide',
      category: 'development',
      isPinned: true,
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'code-editor',
        params: {}
      }
    },
    {
      id: 'app-calculator',
      name: '计算器',
      description: '科学计算器',
      icon: '🧮',
      size: 'small',
      category: 'productivity',
      backgroundColor: '#2563eb',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'calculator',
        params: {}
      }
    },
    {
      id: 'app-calendar',
      name: '日历',
      description: '日程管理和日历',
      icon: '📅',
      size: 'medium',
      category: 'productivity',
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'calendar',
        params: {}
      }
    },
    
    // 娱乐应用
    {
      id: 'app-music',
      name: '音乐播放器',
      description: '音频播放和管理',
      icon: '🎵',
      size: 'medium',
      category: 'entertainment',
      backgroundColor: '#db2777',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'music-player',
        params: {}
      }
    },
    {
      id: 'app-gallery',
      name: '图片查看器',
      description: '图片浏览和管理',
      icon: '🖼️',
      size: 'small',
      category: 'entertainment',
      backgroundColor: '#ea580c',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'image-viewer',
        params: {}
      }
    },
    
    // 网络应用
    {
      id: 'app-browser',
      name: '网页浏览器',
      description: '浏览互联网',
      icon: '🌐',
      size: 'large',
      category: 'web',
      backgroundColor: '#059669',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'web-browser',
        params: {}
      }
    },
    {
      id: 'app-email',
      name: '邮件',
      description: '电子邮件客户端',
      icon: '📧',
      size: 'medium',
      category: 'web',
      backgroundColor: '#2563eb',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'email-client',
        params: {}
      }
    },
    
    // 实用工具
    {
      id: 'app-weather',
      name: '天气',
      description: '天气预报',
      icon: '☀️',
      size: 'small',
      category: 'utilities',
      backgroundColor: '#0284c7',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'weather-app',
        params: {}
      }
    },
    {
      id: 'app-clock',
      name: '时钟',
      description: '世界时钟和闹钟',
      icon: '⏰',
      size: 'small',
      category: 'utilities',
      backgroundColor: '#475569',
      textColor: '#ffffff',
      action: {
        type: 'app',
        target: 'clock-app',
        params: {}
      }
    }
  ],
  
  categories: [
    {
      id: 'system',
      name: '系统工具',
      description: '操作系统核心工具',
      visible: true,
      tileIds: ['app-explorer', 'app-settings', 'app-terminal'],
      weight: 100
    },
    {
      id: 'productivity',
      name: '生产力',
      description: '办公和学习工具',
      visible: true,
      tileIds: ['app-calculator', 'app-calendar'],
      weight: 90
    },
    {
      id: 'development',
      name: '开发工具',
      description: '编程和开发工具',
      visible: true,
      tileIds: ['app-editor'],
      weight: 80
    },
    {
      id: 'entertainment',
      name: '娱乐',
      description: '多媒体和娱乐应用',
      visible: true,
      tileIds: ['app-music', 'app-gallery'],
      weight: 70
    },
    {
      id: 'web',
      name: '网络应用',
      description: '网络和通信应用',
      visible: true,
      tileIds: ['app-browser', 'app-email'],
      weight: 60
    },
    {
      id: 'utilities',
      name: '实用工具',
      description: '日常实用工具',
      visible: true,
      tileIds: ['app-weather', 'app-clock'],
      weight: 50
    }
  ],
  
  layout: {
    grid: {
      columns: 6,
      rows: 8,
      gap: 12,
      borderRadius: 8,
      showGrid: false
    },
    pinnedArea: {
      tileIds: ['app-explorer', 'app-settings', 'app-terminal', 'app-editor'],
      title: '已固定',
      visible: true
    },
    recommendedArea: {
      tileIds: ['app-browser', 'app-music', 'app-calendar', 'app-email'],
      title: '推荐',
      visible: true,
      maxItems: 6,
      algorithm: 'frequent'
    },
    recentArea: {
      visible: true,
      maxItems: 8,
      maxAgeDays: 30
    },
    search: {
      provider: 'local',
      suggestionCount: 5,
      historyCount: 10,
      voiceEnabled: false
    }
  },
  
  theme: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    backgroundOpacity: 0.95,
    backdropBlur: 10,
    textColor: '#f9fafb',
    accentColor: '#3b82f6',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    shadow: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.3)',
      offsetX: 0,
      offsetY: 4,
      blur: 12,
      spread: 0
    },
    animations: {
      enabled: true,
      openDuration: 200,
      closeDuration: 150,
      tileHover: true,
      tileClick: true
    }
  },
  
  liveTiles: {
    enabled: true,
    refreshInterval: 60,
    enabledTileIds: ['app-weather', 'app-calendar', 'app-email']
  },
  
  systemDefaults: {
    defaultPinnedIds: ['app-explorer', 'app-settings', 'app-terminal', 'app-editor'],
    defaultRecommendedIds: ['app-browser', 'app-music', 'app-calendar'],
    defaultVisibleCategories: ['system', 'productivity', 'development', 'entertainment']
  },
  
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: 'WebOS System',
    source: 'system'
  }
};

/**
 * 默认用户个性化配置
 */
export const DEFAULT_USER_PREFS: StartMenuUserPrefs = {
  userId: 'default',
  hiddenTileIds: [],
  customPinnedIds: [],
  recentAppIds: [],
  searchHistory: [],
  position: 'bottom-left',
  size: 'normal'
};

/**
 * 配置验证错误
 */
export class ConfigValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(`${message}: ${errors.join(', ')}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * 开始菜单配置管理器类
 */
export class StartMenuConfigManager {
  private config: StartMenuConfig;
  private userPrefs: StartMenuUserPrefs;
  
  constructor(config?: StartMenuConfig, userPrefs?: StartMenuUserPrefs) {
    this.config = config || DEFAULT_START_MENU_CONFIG;
    this.userPrefs = userPrefs || DEFAULT_USER_PREFS;
  }
  
  /**
   * 从JSON字符串加载配置
   */
  static fromJson(jsonString: string): StartMenuConfigManager {
    try {
      const data = JSON.parse(jsonString);
      
      if (typeof data === 'object' && data.config) {
        return new StartMenuConfigManager(data.config, data.userPrefs);
      }
      
      // 尝试解析为纯配置对象
      return new StartMenuConfigManager(data);
    } catch (error) {
      console.error('Failed to parse JSON config:', error);
      return new StartMenuConfigManager();
    }
  }
  
  /**
   * 导出为JSON字符串
   */
  toJson(): string {
    return JSON.stringify({
      config: this.config,
      userPrefs: this.userPrefs
    }, null, 2);
  }
  
  /**
   * 验证配置完整性
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 基本验证
    if (!this.config.version) errors.push('缺少版本号');
    if (!this.config.name) errors.push('缺少配置名称');
    
    // 磁贴验证
    const tileIds = new Set<string>();
    this.config.tiles.forEach((tile, index) => {
      if (!tile.id) errors.push(`磁贴 #${index} 缺少ID`);
      if (!tile.name) errors.push(`磁贴 ${tile.id || `#${index}`} 缺少名称`);
      if (!tile.size) errors.push(`磁贴 ${tile.id} 缺少尺寸`);
      
      if (tileIds.has(tile.id)) {
        errors.push(`重复磁贴ID: ${tile.id}`);
      }
      tileIds.add(tile.id);
    });
    
    // 分类验证
    this.config.categories.forEach((category, index) => {
      if (!category.id) errors.push(`分类 #${index} 缺少ID`);
      if (!category.name) errors.push(`分类 ${category.id || `#${index}`} 缺少名称`);
      
      // 验证分类中的磁贴ID是否存在
      category.tileIds.forEach(tileId => {
        if (!tileIds.has(tileId)) {
          errors.push(`分类 ${category.id} 包含不存在的磁贴ID: ${tileId}`);
        }
      });
    });
    
    // 布局验证
    if (this.config.layout) {
      const layout = this.config.layout;
      
      if (layout.grid.columns <= 0) errors.push('网格列数必须大于0');
      if (layout.grid.rows <= 0) errors.push('网格行数必须大于0');
      
      // 验证固定磁贴ID
      layout.pinnedArea.tileIds.forEach(tileId => {
        if (!tileIds.has(tileId)) {
          errors.push(`固定区域包含不存在的磁贴ID: ${tileId}`);
        }
      });
      
      // 验证推荐磁贴ID
      layout.recommendedArea.tileIds.forEach(tileId => {
        if (!tileIds.has(tileId)) {
          errors.push(`推荐区域包含不存在的磁贴ID: ${tileId}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 获取配置对象
   */
  getConfig(): StartMenuConfig {
    return this.config;
  }
  
  /**
   * 获取用户个性化配置
   */
  getUserPrefs(): StartMenuUserPrefs {
    return this.userPrefs;
  }
  
  /**
   * 获取所有磁贴
   */
  getTiles(): StartMenuTile[] {
    return this.config.tiles;
  }
  
  /**
   * 根据ID获取磁贴
   */
  getTileById(tileId: string): StartMenuTile | undefined {
    return this.config.tiles.find(tile => tile.id === tileId);
  }
  
  /**
   * 获取所有分类
   */
  getCategories(): StartMenuCategory[] {
    return this.config.categories;
  }
  
  /**
   * 根据ID获取分类
   */
  getCategoryById(categoryId: string): StartMenuCategory | undefined {
    return this.config.categories.find(cat => cat.id === categoryId);
  }
  
  /**
   * 获取固定磁贴
   */
  getPinnedTiles(): StartMenuTile[] {
    const pinnedTiles: StartMenuTile[] = [];
    
    // 首先添加用户固定的磁贴
    this.userPrefs.customPinnedIds.forEach(tileId => {
      const tile = this.getTileById(tileId);
      if (tile) pinnedTiles.push(tile);
    });
    
    // 然后添加系统默认的固定磁贴（如果未在用户固定中）
    this.config.systemDefaults.defaultPinnedIds.forEach(tileId => {
      if (!this.userPrefs.customPinnedIds.includes(tileId)) {
        const tile = this.getTileById(tileId);
        if (tile) pinnedTiles.push(tile);
      }
    });
    
    return pinnedTiles;
  }
  
  /**
   * 获取推荐磁贴
   */
  getRecommendedTiles(): StartMenuTile[] {
    const recommendedTiles: StartMenuTile[] = [];
    
    // 根据算法选择推荐磁贴
    const algorithm = this.config.layout.recommendedArea.algorithm;
    const maxItems = this.config.layout.recommendedArea.maxItems;
    
    let tileIds: string[] = [];
    
    switch (algorithm) {
      case 'recent':
        // 最近使用的应用
        tileIds = this.userPrefs.recentAppIds.slice(0, maxItems);
        break;
      case 'frequent':
        // TODO: 实现基于使用频率的推荐
        tileIds = this.config.systemDefaults.defaultRecommendedIds.slice(0, maxItems);
        break;
      case 'manual':
      default:
        tileIds = this.config.layout.recommendedArea.tileIds.slice(0, maxItems);
    }
    
    // 转换为磁贴对象
    tileIds.forEach(tileId => {
      const tile = this.getTileById(tileId);
      if (tile) recommendedTiles.push(tile);
    });
    
    return recommendedTiles;
  }
  
  /**
   * 搜索磁贴
   */
  searchTiles(query: string): StartMenuTile[] {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.config.tiles.filter(tile => {
      return (
        tile.name.toLowerCase().includes(searchTerm) ||
        (tile.description && tile.description.toLowerCase().includes(searchTerm)) ||
        tile.id.toLowerCase().includes(searchTerm)
      );
    });
  }
  
  /**
   * 更新用户个性化配置
   */
  updateUserPrefs(updates: Partial<StartMenuUserPrefs>): void {
    this.userPrefs = { ...this.userPrefs, ...updates };
  }
  
  /**
   * 记录应用使用
   */
  recordAppUsage(appId: string): void {
    // 从最近使用列表中移除已存在的记录
    this.userPrefs.recentAppIds = this.userPrefs.recentAppIds.filter(id => id !== appId);
    
    // 添加到列表开头
    this.userPrefs.recentAppIds.unshift(appId);
    
    // 限制列表长度
    const maxItems = this.config.layout.recentArea.maxItems;
    if (this.userPrefs.recentAppIds.length > maxItems) {
      this.userPrefs.recentAppIds = this.userPrefs.recentAppIds.slice(0, maxItems);
    }
    
    // 记录搜索历史
    const tile = this.getTileById(appId);
    if (tile) {
      // TODO: 更新使用频率计数
    }
  }
  
  /**
   * 添加搜索历史
   */
  addSearchHistory(query: string): void {
    // 移除重复项
    this.userPrefs.searchHistory = this.userPrefs.searchHistory.filter(item => item !== query);
    
    // 添加到开头
    this.userPrefs.searchHistory.unshift(query);
    
    // 限制长度
    const maxItems = this.config.layout.search.historyCount;
    if (this.userPrefs.searchHistory.length > maxItems) {
      this.userPrefs.searchHistory = this.userPrefs.searchHistory.slice(0, maxItems);
    }
  }
  
  /**
   * 获取磁贴布局信息
   */
  getTileLayout(tileSize: TileSize): { columns: number; rows: number } {
    const layout = this.config.layout.grid;
    
    switch (tileSize) {
      case 'small': return { columns: 1, rows: 1 };
      case 'medium': return { columns: 2, rows: 2 };
      case 'wide': return { columns: 4, rows: 2 };
      case 'large': return { columns: 4, rows: 4 };
      case 'full': return { columns: layout.columns, rows: 1 };
      default: return { columns: 1, rows: 1 };
    }
  }
  
  /**
   * 获取所有可见分类
   */
  getVisibleCategories(): StartMenuCategory[] {
    return this.config.categories.filter(cat => cat.visible !== false);
  }
  
  /**
   * 按分类获取磁贴
   */
  getTilesByCategory(categoryId: string): StartMenuTile[] {
    const category = this.getCategoryById(categoryId);
    if (!category) return [];
    
    return category.tileIds
      .map(tileId => this.getTileById(tileId))
      .filter((tile): tile is StartMenuTile => tile !== undefined);
  }
  
  /**
   * 获取分类的磁贴分类统计
   */
  getCategoryTileStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.config.categories.forEach(category => {
      stats[category.id] = category.tileIds.length;
    });
    
    return stats;
  }
}

/**
 * 默认配置管理器实例
 */
export const defaultConfigManager = new StartMenuConfigManager();