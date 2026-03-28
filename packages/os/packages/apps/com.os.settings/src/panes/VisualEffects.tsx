/**
 * Visual Effects Settings Panel
 * 视觉效果设置面板
 * 允许用户自定义系统的视觉表现
 */

import React, { useCallback } from 'react';
import { useVisualEffects, VisualEffectsConfig } from '@webos/ui/theme';
import { Card } from '@webos/ui/display';
import { Checkbox } from '@webos/ui/input';
import { Heading, Text } from '@webos/ui/base';
import { Divider } from '@webos/ui/base';
import { Stack } from '@webos/ui/layout';
import './VisualEffects.css';

// 视觉效果选项定义
export interface VisualEffectOption {
  key: keyof VisualEffectsConfig;
  label: string;
  description: string;
  category: 'appearance' | 'animation' | 'shadow' | 'performance';
}

export const visualEffectOptions: VisualEffectOption[] = [
  // 外观类别
  {
    key: 'taskbarThumbnails',
    label: '保存任务栏缩略图预览',
    description: '在任务栏悬停时显示窗口缩略图预览',
    category: 'appearance'
  },
  {
    key: 'showThumbnails',
    label: '显示缩略图，而不是显示图标',
    description: '在文件资源管理器中显示文件缩略图',
    category: 'appearance'
  },
  {
    key: 'transparentSelection',
    label: '显示透明选择矩形',
    description: '选择文件时显示半透明的选择框',
    category: 'appearance'
  },
  {
    key: 'fontSmoothing',
    label: '平滑屏幕字体边缘',
    description: '启用ClearType字体平滑，使文字显示更清晰',
    category: 'appearance'
  },
  
  // 动画类别
  {
    key: 'windowAnimations',
    label: '窗口内的动画控件和元素',
    description: '启用窗口内部元素的过渡动画',
    category: 'animation'
  },
  {
    key: 'menuFadeSlide',
    label: '淡入淡出或滑动菜单到视图',
    description: '菜单打开和关闭时使用渐变动画',
    category: 'animation'
  },
  {
    key: 'comboBoxSlide',
    label: '滑动打开组合框',
    description: '下拉框展开时使用滑动动画',
    category: 'animation'
  },
  {
    key: 'smoothScroll',
    label: '平滑滚动列表框',
    description: '滚动列表时使用平滑滚动效果',
    category: 'animation'
  },
  {
    key: 'peekEnabled',
    label: '启用速览',
    description: '悬停任务栏缩略图时显示窗口预览',
    category: 'animation'
  },
  {
    key: 'taskbarAnimations',
    label: '任务栏中的动画',
    description: '启用任务栏图标和按钮的动画效果',
    category: 'animation'
  },
  {
    key: 'menuFadeOnClose',
    label: '在单击后淡出菜单',
    description: '菜单关闭时使用淡出效果',
    category: 'animation'
  },
  {
    key: 'tooltipAnimations',
    label: '在视图中淡入淡出或滑动工具提示',
    description: '工具提示显示和隐藏时的动画效果',
    category: 'animation'
  },
  {
    key: 'minMaxAnimations',
    label: '在最大化和最小化时显示窗口动画',
    description: '窗口最大化/最小化时的缩放动画',
    category: 'animation'
  },
  
  // 阴影类别
  {
    key: 'windowShadows',
    label: '在窗口下显示阴影',
    description: '为窗口添加投影效果，增加层次感',
    category: 'shadow'
  },
  {
    key: 'cursorShadows',
    label: '在鼠标指针下显示阴影',
    description: '为鼠标光标添加阴影效果',
    category: 'shadow'
  },
  {
    key: 'iconLabelShadows',
    label: '在桌面上为图标标签使用阴影',
    description: '为桌面图标文字添加阴影，提高可读性',
    category: 'shadow'
  },
  
  // 性能类别
  {
    key: 'dragWindowContent',
    label: '拖动时显示窗口内容',
    description: '拖动窗口时显示完整内容，而非仅显示边框',
    category: 'performance'
  }
];

const categoryLabels: Record<string, string> = {
  appearance: '外观',
  animation: '动画',
  shadow: '阴影',
  performance: '性能'
};

const categoryOrder = ['appearance', 'animation', 'shadow', 'performance'];

export const VisualEffectsPanel: React.FC = () => {
  const { effects, updateEffects } = useVisualEffects();

  // 处理单个效果切换
  const handleToggle = useCallback((key: keyof VisualEffectsConfig) => {
    const newValue = !effects[key];
    updateEffects({ [key]: newValue });
  }, [effects, updateEffects]);

  // 批量启用/禁用
  const enableAll = useCallback(() => {
    const allEnabled = Object.keys(effects).reduce((acc, key) => {
      acc[key as keyof VisualEffectsConfig] = true;
      return acc;
    }, {} as VisualEffectsConfig);
    updateEffects(allEnabled);
  }, [effects, updateEffects]);

  const disableAll = useCallback(() => {
    const allDisabled = Object.keys(effects).reduce((acc, key) => {
      acc[key as keyof VisualEffectsConfig] = false;
      return acc;
    }, {} as VisualEffectsConfig);
    updateEffects(allDisabled);
  }, [effects, updateEffects]);

  // 恢复默认
  const restoreDefaults = useCallback(() => {
    const defaults: VisualEffectsConfig = {
      taskbarThumbnails: true,
      windowAnimations: true,
      menuFadeSlide: true,
      comboBoxSlide: true,
      smoothScroll: true,
      fontSmoothing: true,
      peekEnabled: true,
      taskbarAnimations: true,
      dragWindowContent: true,
      showThumbnails: true,
      transparentSelection: true,
      windowShadows: true,
      menuFadeOnClose: true,
      tooltipAnimations: true,
      cursorShadows: true,
      iconLabelShadows: true,
      minMaxAnimations: true
    };
    updateEffects(defaults);
  }, [updateEffects]);

  // 按类别分组选项
  const groupedOptions = categoryOrder.reduce((acc, category) => {
    acc[category] = visualEffectOptions.filter(opt => opt.category === category);
    return acc;
  }, {} as Record<string, VisualEffectOption[]>);

  return (
    <div className="visual-effects-panel">
      <div className="panel-header">
        <Heading level="h2">视觉效果</Heading>
        <Text color="secondary" size="sm">
          自定义系统的视觉表现，平衡美观与性能
        </Text>
      </div>

      <div className="panel-actions">
        <button className="action-btn" onClick={enableAll}>
          全部启用
        </button>
        <button className="action-btn" onClick={disableAll}>
          全部禁用
        </button>
        <button className="action-btn secondary" onClick={restoreDefaults}>
          恢复默认
        </button>
      </div>

      <Divider />

      {categoryOrder.map(category => (
        <div key={category} className="effect-category">
          <div className="category-header">
            <Heading level="h3">{categoryLabels[category]}</Heading>
            <Text color="tertiary" size="xs">
              {groupedOptions[category].filter(opt => effects[opt.key]).length} / {groupedOptions[category].length} 已启用
            </Text>
          </div>

          <Card className="effect-options-card" variant="glass">
            <Stack direction="vertical" gap="sm">
              {groupedOptions[category].map(option => (
                <div key={option.key} className="effect-option">
                  <Checkbox
                    checked={effects[option.key]}
                    onChange={() => handleToggle(option.key)}
                    label={option.label}
                  />
                  <Text color="tertiary" size="xs" className="effect-description">
                    {option.description}
                  </Text>
                </div>
              ))}
            </Stack>
          </Card>
        </div>
      ))}

      <Divider />

      <div className="performance-info">
        <Text color="secondary" size="sm">
          💡 提示：禁用某些视觉效果可以提高系统性能，特别是在低配置设备上。
        </Text>
      </div>
    </div>
  );
};

export default VisualEffectsPanel;
