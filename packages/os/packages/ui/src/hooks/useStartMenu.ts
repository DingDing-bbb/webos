/**
 * 开始菜单React Hook
 * 提供开始菜单状态管理和配置操作
 */

import { useState, useCallback, useEffect } from 'react';
import {
  StartMenuConfigManager,
  defaultConfigManager
} from '../config/startMenu.config';
import type { StartMenuApp } from '../desktop/StartMenu';

/**
 * 开始菜单状态接口
 */
export interface StartMenuState {
  /** 菜单是否打开 */
  isOpen: boolean;
  /** 当前搜索查询 */
  searchQuery: string;
  /** 搜索建议 */
  searchSuggestions: string[];
  /** 当前显示的页面: 'pinned' | 'all' | 'search' */
  currentView: 'pinned' | 'all' | 'search';
  /** 是否显示电源菜单 */
  showPowerMenu: boolean;
}

/**
 * 开始菜单Hook初始化参数
 */
export interface UseStartMenuOptions {
  /** 自定义配置管理器 */
  configManager?: StartMenuConfigManager;
  /** 初始搜索查询 */
  initialSearchQuery?: string;
  /** 初始是否打开 */
  initialIsOpen?: boolean;
  /** 当应用被启动时的回调 */
  onAppLaunch?: (appId: string) => void;
  /** 当设置被点击时的回调 */
  onSettings?: () => void;
  /** 当电源选项被点击时的回调 */
  onPower?: (action: 'sleep' | 'restart' | 'shutdown') => void;
  /** 当前用户信息 */
  user?: {
    name: string;
    avatar?: React.ReactNode;
  };
}

/**
 * 开始菜单Hook返回值
 */
export interface UseStartMenuResult {
  /** 开始菜单状态 */
  state: StartMenuState;
  /** 开始菜单配置数据 */
  data: {
    /** 所有应用列表 */
    apps: StartMenuApp[];
    /** 固定应用列表 */
    pinnedApps: StartMenuApp[];
    /** 推荐应用列表 */
    recommendedApps: StartMenuApp[];
    /** 最近使用应用列表 */
    recentApps: StartMenuApp[];
    /** 搜索结果 */
    searchResults: StartMenuApp[];
    /** 搜索历史 */
    searchHistory: string[];
    /** 用户信息 */
    user: {
      name: string;
      avatar?: React.ReactNode;
    };
  };
  /** 操作方法 */
  actions: {
    /** 打开开始菜单 */
    openMenu: () => void;
    /** 关闭开始菜单 */
    closeMenu: () => void;
    /** 切换开始菜单 */
    toggleMenu: () => void;
    /** 更新搜索查询 */
    setSearchQuery: (query: string) => void;
    /** 执行搜索 */
    performSearch: (query: string) => void;
    /** 清除搜索 */
    clearSearch: () => void;
    /** 启动应用 */
    launchApp: (appId: string) => void;
    /** 切换视图 */
    switchView: (view: 'pinned' | 'all' | 'search') => void;
    /** 切换电源菜单显示 */
    togglePowerMenu: () => void;
    /** 执行电源操作 */
    performPowerAction: (action: 'sleep' | 'restart' | 'shutdown') => void;
    /** 固定应用 */
    pinApp: (appId: string) => void;
    /** 取消固定应用 */
    unpinApp: (appId: string) => void;
    /** 刷新开始菜单 */
    refreshMenu: () => void;
    /** 获取应用启动命令 */
    getAppAction: (appId: string) => {
      type: 'app' | 'url' | 'command' | 'system';
      target: string;
      params?: Record<string, any>;
    } | null;
  };
  /** 错误状态 */
  error?: string;
  /** 加载状态 */
  loading: boolean;
}

/**
 * 开始菜单React Hook
 */
export function useStartMenu(options: UseStartMenuOptions = {}): UseStartMenuResult {
  const {
    configManager = defaultConfigManager,
    initialSearchQuery = '',
    initialIsOpen = false,
    onAppLaunch,
    onSettings,
    onPower,
    user
  } = options;

  // 状态管理
  const [state, setState] = useState<StartMenuState>({
    isOpen: initialIsOpen,
    searchQuery: initialSearchQuery,
    searchSuggestions: [],
    currentView: 'pinned',
    showPowerMenu: false
  });

  const [data, setData] = useState({
    apps: [] as StartMenuApp[],
    pinnedApps: [] as StartMenuApp[],
    recommendedApps: [] as StartMenuApp[],
    recentApps: [] as StartMenuApp[],
    searchResults: [] as StartMenuApp[],
    searchHistory: [] as string[],
    user: user || { name: 'User' }
  });

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  /**
   * 加载开始菜单数据
   */
  const loadMenuData = useCallback(() => {
    try {
      setLoading(true);
      setError(undefined);

      // 从配置管理器获取数据
      const tiles = configManager.getTiles();
      const pinnedTiles = configManager.getPinnedTiles();
      const recommendedTiles = configManager.getRecommendedTiles();
      const recentApps = Array.from(new Set([
        ...configManager.getUserPrefs().recentAppIds
      ]))
        .map(appId => configManager.getTileById(appId))
        .filter(tile => tile !== undefined)
        .map(tile => convertTileToApp(tile!));

      // 转换为React组件格式
      const apps = tiles.map(convertTileToApp);
      const pinnedApps = pinnedTiles.map(convertTileToApp);
      const recommendedApps = recommendedTiles.map(convertTileToApp);

      // 获取搜索历史
      const searchHistory = configManager.getUserPrefs().searchHistory;

      // 如果有搜索查询，执行搜索
      let searchResults: StartMenuApp[] = [];
      if (state.searchQuery.trim()) {
        const searchTiles = configManager.searchTiles(state.searchQuery);
        searchResults = searchTiles.map(convertTileToApp);
        
        // 生成搜索建议
        const suggestions = searchTiles
          .slice(0, configManager.getConfig().layout.search.suggestionCount)
          .map(tile => tile.name);
        
        setState(prev => ({ ...prev, searchSuggestions: suggestions }));
      }

      setData({
        apps,
        pinnedApps,
        recommendedApps,
        recentApps,
        searchResults,
        searchHistory,
        user: user || { name: 'User' }
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load start menu data:', err);
      setError('无法加载开始菜单配置');
      setLoading(false);
    }
  }, [configManager, state.searchQuery, user]);

  /**
   * 将Tile转换为React App格式
   */
  const convertTileToApp = (tile: any): StartMenuApp => {
    return {
      id: tile.id,
      name: tile.name,
      icon: tile.icon || '📄',
      isPinned: tile.isPinned || false,
      onClick: () => launchApp(tile.id)
    };
  };

  /**
   * 打开开始菜单
   */
  const openMenu = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
    // 加载最新数据
    loadMenuData();
  }, [loadMenuData]);

  /**
   * 关闭开始菜单
   */
  const closeMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      searchQuery: '',
      showPowerMenu: false
    }));
  }, []);

  /**
   * 切换开始菜单
   */
  const toggleMenu = useCallback(() => {
    setState(prev => {
      const newIsOpen = !prev.isOpen;
      if (newIsOpen) {
        // 打开时加载最新数据
        setTimeout(loadMenuData, 0);
      }
      return {
        ...prev,
        isOpen: newIsOpen,
        searchQuery: newIsOpen ? prev.searchQuery : '',
        showPowerMenu: false
      };
    });
  }, [loadMenuData]);

  /**
   * 更新搜索查询
   */
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    
    // 自动执行搜索
    if (query.trim()) {
      performSearch(query);
    }
  }, []);

  /**
   * 执行搜索
   */
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    try {
      // 记录搜索历史
      configManager.addSearchHistory(query);
      
      // 执行搜索并更新结果
      const searchTiles = configManager.searchTiles(query);
      const searchResults = searchTiles.map(convertTileToApp);
      
      // 生成搜索建议
      const suggestions = searchTiles
        .slice(0, configManager.getConfig().layout.search.suggestionCount)
        .map(tile => tile.name);

      setData(prev => ({
        ...prev,
        searchResults,
        searchHistory: configManager.getUserPrefs().searchHistory
      }));

      setState(prev => ({
        ...prev,
        currentView: 'search',
        searchSuggestions: suggestions
      }));
    } catch (err) {
      console.error('Search failed:', err);
    }
  }, [configManager]);

  /**
   * 清除搜索
   */
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      searchSuggestions: [],
      currentView: 'pinned'
    }));
    
    setData(prev => ({ ...prev, searchResults: [] }));
  }, []);

  /**
   * 启动应用
   */
  const launchApp = useCallback((appId: string) => {
    try {
      // 记录应用使用
      configManager.recordAppUsage(appId);
      
      // 获取应用操作
      const tile = configManager.getTileById(appId);
      if (!tile) {
        throw new Error(`应用未找到: ${appId}`);
      }
      
      // 调用应用启动回调
      onAppLaunch?.(appId);
      
      // 关闭开始菜单
      closeMenu();
      
      // 返回应用操作信息
      return tile.action;
    } catch (err) {
      console.error('Failed to launch app:', err);
      setError(`无法启动应用: ${appId}`);
      return null;
    }
  }, [configManager, onAppLaunch, closeMenu]);

  /**
   * 切换视图
   */
  const switchView = useCallback((view: 'pinned' | 'all' | 'search') => {
    setState(prev => ({ ...prev, currentView: view }));
    
    // 如果是搜索视图且没有搜索查询，显示空白
    if (view === 'search' && !state.searchQuery.trim()) {
      setData(prev => ({ ...prev, searchResults: [] }));
    }
  }, [state.searchQuery]);

  /**
   * 切换电源菜单显示
   */
  const togglePowerMenu = useCallback(() => {
    setState(prev => ({ ...prev, showPowerMenu: !prev.showPowerMenu }));
  }, []);

  /**
   * 执行电源操作
   */
  const performPowerAction = useCallback((action: 'sleep' | 'restart' | 'shutdown') => {
    onPower?.(action);
    closeMenu();
  }, [onPower, closeMenu]);

  /**
   * 固定应用
   */
  const pinApp = useCallback((appId: string) => {
    const userPrefs = configManager.getUserPrefs();
    if (!userPrefs.customPinnedIds.includes(appId)) {
      configManager.updateUserPrefs({
        customPinnedIds: [...userPrefs.customPinnedIds, appId]
      });
      loadMenuData();
    }
  }, [configManager, loadMenuData]);

  /**
   * 取消固定应用
   */
  const unpinApp = useCallback((appId: string) => {
    const userPrefs = configManager.getUserPrefs();
    configManager.updateUserPrefs({
      customPinnedIds: userPrefs.customPinnedIds.filter(id => id !== appId)
    });
    loadMenuData();
  }, [configManager, loadMenuData]);

  /**
   * 刷新开始菜单
   */
  const refreshMenu = useCallback(() => {
    loadMenuData();
  }, [loadMenuData]);

  /**
   * 获取应用启动命令
   */
  const getAppAction = useCallback((appId: string) => {
    const tile = configManager.getTileById(appId);
    return tile?.action || null;
  }, [configManager]);

  // 初始化加载
  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // 搜索查询变化时的效果
  useEffect(() => {
    if (state.searchQuery.trim()) {
      const timer = setTimeout(() => {
        performSearch(state.searchQuery);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setData(prev => ({ ...prev, searchResults: [] }));
      setState(prev => ({
        ...prev,
        currentView: 'pinned',
        searchSuggestions: []
      }));
    }
  }, [state.searchQuery, performSearch]);

  return {
    state,
    data,
    actions: {
      openMenu,
      closeMenu,
      toggleMenu,
      setSearchQuery,
      performSearch,
      clearSearch,
      launchApp,
      switchView,
      togglePowerMenu,
      performPowerAction,
      pinApp,
      unpinApp,
      refreshMenu,
      getAppAction
    },
    error,
    loading
  };
}