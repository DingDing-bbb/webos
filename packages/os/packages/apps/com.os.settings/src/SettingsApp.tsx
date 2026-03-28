/**
 * WebOS Settings Application
 * Complete system settings with all UI components
 */

import React, { useState } from 'react';
import { useTheme, AccentColor, ThemeMode, BlurIntensity } from '@webos/ui/theme';
import { Button, Icon, Heading, Text, Divider, Spacer } from '@webos/ui/base';
import { Stack, Flex, Box, Container, Grid } from '@webos/ui/layout';
import { Menu, Breadcrumb } from '@webos/ui/navigation';
import { Select, Switch, Slider } from '@webos/ui/input';
import { Card } from '@webos/ui/display';
import { Modal } from '@webos/ui/feedback';
import { VisualEffectsPanel } from './panes/VisualEffects';
import './styles.css';

// 设置分类
const settingsCategories = [
  { id: 'system', label: '系统', icon: 'Settings' },
  { id: 'display', label: '显示', icon: 'Monitor' },
  { id: 'personalization', label: '个性化', icon: 'Palette' },
  { id: 'apps', label: '应用', icon: 'Grid' },
  { id: 'accounts', label: '账户', icon: 'User' },
  { id: 'time', label: '时间和语言', icon: 'Clock' },
  { id: 'accessibility', label: '辅助功能', icon: 'Accessibility' },
  { id: 'privacy', label: '隐私和安全', icon: 'Shield' },
  { id: 'update', label: '更新和安全', icon: 'Download' },
  { id: 'about', label: '关于', icon: 'Info' },
];

// 主设置应用组件
export const SettingsApp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('system');

  // 渲染右侧内容
  const renderContent = () => {
    switch (activeCategory) {
      case 'system':
        return <SystemSettings />;
      case 'display':
        return <DisplaySettings />;
      case 'personalization':
        return <PersonalizationSettings />;
      default:
        return (
          <div className="settings-placeholder">
            <Icon name="Construction" size="xl" />
            <Text>此设置页面正在开发中</Text>
          </div>
        );
    }
  };

  return (
    <div className="settings-app">
      {/* 侧边栏 */}
      <aside className="settings-sidebar">
        <div className="sidebar-header">
          <Heading level="h2">设置</Heading>
        </div>
        <Menu
          items={settingsCategories.map(cat => ({
            id: cat.id,
            label: cat.label,
            icon: cat.icon,
            active: activeCategory === cat.id,
          }))}
          onSelect={(id) => setActiveCategory(id)}
          variant="sidebar"
        />
      </aside>

      {/* 主内容区 */}
      <main className="settings-main">
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </main>
    </div>
  );
};

// 系统设置
const SystemSettings: React.FC = () => {
  const [showVisualEffects, setShowVisualEffects] = useState(false);

  return (
    <div className="settings-section">
      <Breadcrumb items={[{ label: '系统' }]} />
      <Heading level="h1">系统</Heading>
      <Text color="secondary">显示、声音、通知、电源</Text>

      <Divider />

      {/* 快速操作 */}
      <Grid columns={3} gap="md">
        <Card variant="glass" className="quick-action-card" onClick={() => setShowVisualEffects(true)}>
          <Icon name="Sparkles" size="lg" />
          <Heading level="h4">视觉效果</Heading>
          <Text size="sm" color="secondary">调整系统动画和效果</Text>
        </Card>

        <Card variant="glass" className="quick-action-card">
          <Icon name="Monitor" size="lg" />
          <Heading level="h4">显示</Heading>
          <Text size="sm" color="secondary">分辨率、亮度、缩放</Text>
        </Card>

        <Card variant="glass" className="quick-action-card">
          <Icon name="Volume2" size="lg" />
          <Heading level="h4">声音</Heading>
          <Text size="sm" color="secondary">音量、输出设备</Text>
        </Card>
      </Grid>

      <Divider label="系统信息" />

      <Card variant="outline">
        <Flex justify="space-between" align="center">
          <Box>
            <Text weight="medium">设备名称</Text>
            <Text color="secondary">DESKTOP-WEBOS</Text>
          </Box>
          <Button variant="ghost" size="sm">重命名</Button>
        </Flex>
        <Divider />
        <Grid columns={2} gap="md">
          <Box>
            <Text size="sm" color="secondary">处理器</Text>
            <Text>Virtual CPU @ 2.4GHz</Text>
          </Box>
          <Box>
            <Text size="sm" color="secondary">内存</Text>
            <Text>8 GB RAM</Text>
          </Box>
          <Box>
            <Text size="sm" color="secondary">系统类型</Text>
            <Text>WebOS x64</Text>
          </Box>
          <Box>
            <Text size="sm" color="secondary">版本</Text>
            <Text>WebOS 1.0.0</Text>
          </Box>
        </Grid>
      </Card>

      {/* 视觉效果弹窗 */}
      <Modal
        open={showVisualEffects}
        onClose={() => setShowVisualEffects(false)}
        title="视觉效果"
        size="lg"
      >
        <VisualEffectsPanel />
      </Modal>
    </div>
  );
};

// 显示设置
const DisplaySettings: React.FC = () => {
  const [resolution, setResolution] = useState('1920x1080');
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(80);
  const [nightLight, setNightLight] = useState(false);

  const resolutions = [
    { value: '1920x1080', label: '1920 × 1080 (推荐)' },
    { value: '2560x1440', label: '2560 × 1440' },
    { value: '3840x2160', label: '3840 × 2160 (4K)' },
  ];

  return (
    <div className="settings-section">
      <Breadcrumb items={[{ label: '系统' }, { label: '显示' }]} />
      <Heading level="h1">显示</Heading>
      <Text color="secondary">显示器、亮度、夜间模式</Text>

      <Divider />

      <Stack direction="vertical" gap="lg">
        {/* 分辨率 */}
        <Card variant="glass">
          <Heading level="h4">显示分辨率</Heading>
          <Spacer size="sm" />
          <Select
            value={resolution}
            onChange={setResolution}
            options={resolutions}
            style={{ width: '100%' }}
          />
        </Card>

        {/* 缩放 */}
        <Card variant="glass">
          <Flex justify="space-between" align="center">
            <Heading level="h4">缩放</Heading>
            <Text>{scale}%</Text>
          </Flex>
          <Spacer size="sm" />
          <Slider
            value={scale}
            onChange={setScale}
            min={75}
            max={200}
            step={25}
            marks={[
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
              { value: 125, label: '125%' },
              { value: 150, label: '150%' },
              { value: 200, label: '200%' },
            ]}
          />
        </Card>

        {/* 亮度 */}
        <Card variant="glass">
          <Flex justify="space-between" align="center">
            <Heading level="h4">亮度</Heading>
            <Text>{brightness}%</Text>
          </Flex>
          <Spacer size="sm" />
          <Slider
            value={brightness}
            onChange={setBrightness}
            min={0}
            max={100}
          />
        </Card>

        {/* 夜间模式 */}
        <Card variant="glass">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading level="h4">夜间模式</Heading>
              <Text size="sm" color="secondary">减少蓝光，保护眼睛</Text>
            </Box>
            <Switch checked={nightLight} onChange={setNightLight} />
          </Flex>
        </Card>
      </Stack>
    </div>
  );
};

// 个性化设置
const PersonalizationSettings: React.FC = () => {
  const { config, updateConfig } = useTheme();
  const [selectedAccent, setSelectedAccent] = useState(config.accent);

  const accentColors = [
    { value: 'blue', label: '蓝色', color: '#0078d4' },
    { value: 'purple', label: '紫色', color: '#8764b8' },
    { value: 'pink', label: '粉色', color: '#e3008c' },
    { value: 'red', label: '红色', color: '#d13438' },
    { value: 'orange', label: '橙色', color: '#ff8c00' },
    { value: 'yellow', label: '黄色', color: '#ffb900' },
    { value: 'green', label: '绿色', color: '#107c10' },
    { value: 'teal', label: '青色', color: '#00b294' },
  ];

  const handleAccentChange = (accent: string) => {
    setSelectedAccent(accent);
    updateConfig({ accent: accent as AccentColor });
  };

  return (
    <div className="settings-section">
      <Breadcrumb items={[{ label: '系统' }, { label: '个性化' }]} />
      <Heading level="h1">个性化</Heading>
      <Text color="secondary">背景、颜色、主题、锁屏</Text>

      <Divider />

      {/* 主题模式 */}
      <Card variant="glass">
        <Heading level="h4">选择模式</Heading>
        <Spacer size="sm" />
        <Grid columns={3} gap="md">
          {['light', 'dark', 'system'].map((mode) => (
            <Card
              key={mode}
              variant={config.mode === mode ? 'selected' : 'outline'}
              className="theme-option-card"
              onClick={() => updateConfig({ mode: mode as ThemeMode })}
            >
              <Icon 
                name={mode === 'light' ? 'Sun' : mode === 'dark' ? 'Moon' : 'Laptop'} 
                size="lg" 
              />
              <Text>
                {mode === 'light' ? '浅色' : mode === 'dark' ? '深色' : '跟随系统'}
              </Text>
            </Card>
          ))}
        </Grid>
      </Card>

      <Divider />

      {/* 强调色 */}
      <Card variant="glass">
        <Heading level="h4">强调色</Heading>
        <Spacer size="sm" />
        <Flex gap="sm" wrap>
          {accentColors.map((accent) => (
            <button
              key={accent.value}
              className={`color-swatch ${selectedAccent === accent.value ? 'selected' : ''}`}
              style={{ backgroundColor: accent.color }}
              onClick={() => handleAccentChange(accent.value)}
              title={accent.label}
            />
          ))}
        </Flex>
      </Card>

      <Divider />

      {/* 透明度 */}
      <Card variant="glass">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading level="h4">透明度</Heading>
            <Text size="sm" color="secondary">调整窗口和面板的透明度</Text>
          </Box>
          <Text>{config.transparency}%</Text>
        </Flex>
        <Spacer size="sm" />
        <Slider
          value={config.transparency}
          onChange={(v) => updateConfig({ transparency: v })}
          min={0}
          max={100}
        />
      </Card>

      <Divider />

      {/* 模糊强度 */}
      <Card variant="glass">
        <Heading level="h4">模糊强度</Heading>
        <Spacer size="sm" />
        <Grid columns={4} gap="sm">
          {['low', 'medium', 'high', 'ultra'].map((intensity) => (
            <Button
              key={intensity}
              variant={config.blurIntensity === intensity ? 'primary' : 'outline'}
              onClick={() => updateConfig({ blurIntensity: intensity as BlurIntensity })}
              block
            >
              {intensity === 'low' ? '低' : intensity === 'medium' ? '中' : intensity === 'high' ? '高' : '超高'}
            </Button>
          ))}
        </Grid>
      </Card>
    </div>
  );
};

export default SettingsApp;
