/**
 * WebOS Application Types
 */

import type { FC, CSSProperties } from 'react';

// 应用状态
export type AppStatus = 'running' | 'stopped' | 'installed' | 'pending';

// 应用分类
export type AppCategory =
  | 'system' // 系统工具
  | 'productivity' // 生产力
  | 'media' // 媒体
  | 'games' // 游戏
  | 'network' // 网络
  | 'development' // 开发
  | 'utilities'; // 实用工具

// 图标属性
export interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

// 应用信息
export interface AppInfo {
  id: string; // 应用ID，如 com.os.filemanager
  name: string; // 应用名称
  nameKey: string; // 国际化键名
  description?: string; // 描述
  descriptionKey?: string; // 描述国际化键名
  version: string; // 版本号
  author?: string; // 作者
  category: AppCategory; // 分类
  icon: FC<IconProps>; // 图标组件
  component: FC; // 应用组件
  defaultWidth?: number; // 默认宽度
  defaultHeight?: number; // 默认高度
  minWidth?: number; // 最小宽度
  minHeight?: number; // 最小高度
  resizable?: boolean; // 是否可调整大小
  singleton?: boolean; // 是否单例（只能打开一个窗口）
  permissions?: AppPermission[]; // 应用权限
  entry?: string; // 入口文件路径
}

// 应用权限
export type AppPermission =
  | 'fs:read' // 文件系统读取
  | 'fs:write' // 文件系统写入
  | 'network' // 网络访问
  | 'notification' // 通知
  | 'clipboard' // 剪贴板
  | 'storage'; // 本地存储

// 应用实例
export interface AppInstance {
  id: string; // 实例ID
  appId: string; // 应用ID
  windowId?: string; // 窗口ID
  startTime: Date; // 启动时间
  status: AppStatus; // 状态
}

// 分类信息
export interface CategoryInfo {
  id: AppCategory;
  nameKey: string;
  icon: FC<IconProps>;
}

// 启动选项
export interface LaunchOptions {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

// 应用事件
export interface AppEvent {
  type: 'install' | 'uninstall' | 'launch' | 'close' | 'update';
  appId: string;
  timestamp: Date;
  data?: unknown;
}

// 应用事件监听器
export type AppEventListener = (event: AppEvent) => void;
