// 启动画面组件 - 真实的系统初始化

import React, { useState, useEffect, useCallback } from 'react';

// 初始化任务类型
interface InitTask {
  id: string;
  name: string;
  weight: number; // 权重用于计算进度
  execute: () => Promise<void>;
}

// 启动阶段
type BootStage = 
  | 'kernel' 
  | 'filesystem' 
  | 'services' 
  | 'resources' 
  | 'desktop'
  | 'complete';

interface BootScreenProps {
  onComplete: () => void;
}

// 系统初始化器
class SystemInitializer {
  private tasks: InitTask[] = [];
  private completedWeight = 0;
  private totalWeight = 0;
  private onProgress?: (task: string, progress: number) => void;

  constructor() {
    this.registerTasks();
  }

  private registerTasks() {
    // 阶段1: 内核初始化 (权重: 15)
    this.addTask({
      id: 'kernel.init',
      name: 'Initializing kernel...',
      weight: 5,
      execute: async () => {
        // 确保 WebOS API 已初始化
        if (!window.webos) {
          throw new Error('Kernel initialization failed');
        }
        await this.delay(50);
      }
    });

    this.addTask({
      id: 'kernel.api',
      name: 'Loading system APIs...',
      weight: 10,
      execute: async () => {
        // API 已在 kernel 中初始化
        const api = window.webos;
        if (!api.window || !api.fs || !api.i18n) {
          throw new Error('System APIs incomplete');
        }
        await this.delay(30);
      }
    });

    // 阶段2: 文件系统 (权重: 20)
    this.addTask({
      id: 'fs.root',
      name: 'Mounting root filesystem...',
      weight: 5,
      execute: async () => {
        // 验证文件系统根目录
        const rootFiles = window.webos.fs.list('/');
        if (rootFiles.length === 0) {
          throw new Error('Filesystem mount failed');
        }
        await this.delay(20);
      }
    });

    this.addTask({
      id: 'fs.directories',
      name: 'Creating system directories...',
      weight: 10,
      execute: async () => {
        const fs = window.webos.fs;
        // 确保系统目录存在
        const dirs = ['/tmp', '/var', '/var/log', '/var/cache'];
        for (const dir of dirs) {
          if (!fs.exists(dir)) {
            fs.mkdir(dir);
          }
        }
        await this.delay(30);
      }
    });

    this.addTask({
      id: 'fs.cache',
      name: 'Initializing cache...',
      weight: 5,
      execute: async () => {
        // 初始化缓存目录
        if (!window.webos.fs.exists('/var/cache/apps')) {
          window.webos.fs.mkdir('/var/cache/apps');
        }
        await this.delay(20);
      }
    });

    // 阶段3: 服务 (权重: 25)
    this.addTask({
      id: 'services.i18n',
      name: 'Loading language packs...',
      weight: 10,
      execute: async () => {
        // 加载保存的语言设置
        const savedLocale = window.webos.config.get<string>('locale');
        if (savedLocale) {
          window.webos.i18n.setLocale(savedLocale);
        }
        await this.delay(30);
      }
    });

    this.addTask({
      id: 'services.user',
      name: 'Loading user profiles...',
      weight: 10,
      execute: async () => {
        // 检查是否有保存的用户会话
        const bootState = localStorage.getItem('webos-boot');
        if (bootState) {
          // 恢复用户会话信息
          await this.delay(20);
        }
        await this.delay(20);
      }
    });

    this.addTask({
      id: 'services.time',
      name: 'Synchronizing time...',
      weight: 5,
      execute: async () => {
        // 时间同步（模拟）
        window.webos.time.getCurrent();
        await this.delay(20);
      }
    });

    // 阶段4: 资源 (权重: 25)
    this.addTask({
      id: 'resources.fonts',
      name: 'Loading fonts...',
      weight: 10,
      execute: async () => {
        // 预加载字体
        await document.fonts.ready;
        await this.delay(20);
      }
    });

    this.addTask({
      id: 'resources.icons',
      name: 'Loading icon set...',
      weight: 10,
      execute: async () => {
        // 图标系统已内联，无需额外加载
        await this.delay(20);
      }
    });

    this.addTask({
      id: 'resources.styles',
      name: 'Applying system theme...',
      weight: 5,
      execute: async () => {
        // 应用保存的主题
        const theme = window.webos.config.get<string>('theme');
        if (theme) {
          document.documentElement.setAttribute('data-theme', theme);
        }
        await this.delay(20);
      }
    });

    // 阶段5: 桌面 (权重: 15)
    this.addTask({
      id: 'desktop.wm',
      name: 'Starting window manager...',
      weight: 8,
      execute: async () => {
        // 窗口管理器已初始化
        await this.delay(30);
      }
    });

    this.addTask({
      id: 'desktop.ready',
      name: 'Preparing desktop...',
      weight: 7,
      execute: async () => {
        // 最终准备
        await this.delay(50);
      }
    });
  }

  private addTask(task: InitTask) {
    this.tasks.push(task);
    this.totalWeight += task.weight;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setProgressHandler(handler: (task: string, progress: number) => void) {
    this.onProgress = handler;
  }

  async run(): Promise<{ success: boolean; error?: string }> {
    this.completedWeight = 0;

    for (const task of this.tasks) {
      try {
        await task.execute();
        this.completedWeight += task.weight;
        
        if (this.onProgress) {
          const progress = Math.round((this.completedWeight / this.totalWeight) * 100);
          this.onProgress(task.name, progress);
        }
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    }

    return { success: true };
  }
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting...');
  const [stage, setStage] = useState<BootStage>('kernel');
  const [error, setError] = useState<string | null>(null);

  // 获取阶段对应的颜色
  const getStageColor = (currentStage: BootStage): string => {
    const colors: Record<BootStage, string> = {
      kernel: '#4ade80',
      filesystem: '#60a5fa',
      services: '#f472b6',
      resources: '#fbbf24',
      desktop: '#a78bfa',
      complete: '#22d3ee'
    };
    return colors[currentStage];
  };

  // 更新阶段
  const updateStage = useCallback((taskName: string) => {
    if (taskName.includes('kernel')) setStage('kernel');
    else if (taskName.includes('fs.') || taskName.includes('Mounting')) setStage('filesystem');
    else if (taskName.includes('services.')) setStage('services');
    else if (taskName.includes('resources.')) setStage('resources');
    else if (taskName.includes('desktop.') || taskName.includes('Preparing')) setStage('desktop');
  }, []);

  useEffect(() => {
    const initializer = new SystemInitializer();
    
    initializer.setProgressHandler((task, prog) => {
      setStatusText(task);
      setProgress(prog);
      updateStage(task);
    });

    // 开始初始化
    initializer.run().then((result) => {
      if (result.success) {
        setStage('complete');
        setStatusText('Welcome!');
        setProgress(100);
        
        // 短暂延迟后完成启动
        setTimeout(onComplete, 200);
      } else {
        setError(result.error || 'Unknown error');
        setStatusText(`Error: ${result.error}`);
      }
    });

  }, [onComplete, updateStage]);

  // 错误状态
  if (error) {
    return (
      <div className="os-boot-screen">
        <div className="os-boot-logo">
          <svg width="120" height="40" viewBox="0 0 120 40">
            <text 
              x="50%" 
              y="50%" 
              dominantBaseline="middle" 
              textAnchor="middle"
              fill="#ef4444"
              fontSize="24"
              fontFamily="inherit"
              fontWeight="300"
            >
              Error
            </text>
          </svg>
        </div>
        <div className="os-boot-error">
          {error}
        </div>
        <button 
          className="os-boot-retry"
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '8px 24px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="os-boot-screen">
      {/* Logo */}
      <div className="os-boot-logo">
        <svg width="120" height="40" viewBox="0 0 120 40">
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle"
            fill="white"
            fontSize="24"
            fontFamily="inherit"
            fontWeight="300"
          >
            {__OS_NAME__}
          </text>
        </svg>
      </div>

      {/* 进度条 */}
      <div className="os-boot-progress-container">
        <div 
          className="os-boot-progress" 
          style={{ 
            width: `${progress}%`,
            background: getStageColor(stage)
          }}
        />
      </div>

      {/* 状态文本 */}
      <div className="os-boot-text">{statusText}</div>

      {/* 阶段指示器 */}
      <div className="os-boot-stages" style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        opacity: 0.6
      }}>
        {['kernel', 'filesystem', 'services', 'resources', 'desktop'].map((s, _i) => (
          <div 
            key={s}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: stage === s ? getStageColor(s as BootStage) : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* 版本信息 */}
      <div className="os-boot-version" style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '12px',
        opacity: 0.5
      }}>
        v{__OS_VERSION__}
      </div>
    </div>
  );
};
