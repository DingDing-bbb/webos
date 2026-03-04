// 设备检测模块

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface DeviceInfo {
  type: DeviceType;
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

class DeviceDetector {
  private deviceInfo: DeviceInfo;
  private listeners: Set<(info: DeviceInfo) => void> = new Set();

  constructor() {
    this.deviceInfo = this.detect();
    this.setupListeners();
  }

  private detect(): DeviceInfo {
    const ua = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 检测触摸支持
    const isTouch = this.checkTouchSupport();
    
    // 检测设备类型
    const isTablet = this.checkTablet(ua, screenWidth);
    const isMobile = this.checkMobile(ua, screenWidth) && !isTablet;
    const isDesktop = !isTablet && !isMobile;
    
    // 确定设备类型
    let type: DeviceType = 'desktop';
    if (isMobile) type = 'mobile';
    else if (isTablet) type = 'tablet';

    return {
      type,
      isTouch,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait'
    };
  }

  private checkTouchSupport(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0
    );
  }

  private checkTablet(ua: string, screenWidth: number): boolean {
    // 平板检测
    const tabletPatterns = [
      /ipad/i,
      /android(?!.*mobile)/i,
      /tablet/i,
      /kindle/i,
      /silk/i,
      /playbook/i
    ];

    // UA 检测
    if (tabletPatterns.some(pattern => pattern.test(ua))) {
      return true;
    }

    // 屏幕尺寸检测 (触摸设备 + 大屏幕 = 可能是平板)
    const isTouch = this.checkTouchSupport();
    if (isTouch && screenWidth >= 600 && screenWidth <= 1366) {
      return true;
    }

    // iPad Pro 伪装成桌面浏览器时的检测
    if (isTouch && screenWidth >= 1024 && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      return true;
    }

    return false;
  }

  private checkMobile(ua: string, screenWidth: number): boolean {
    const mobilePatterns = [
      /iphone/i,
      /ipod/i,
      /android.*mobile/i,
      /windows phone/i,
      /blackberry/i,
      /webos/i,
      /mobile/i
    ];

    return mobilePatterns.some(pattern => pattern.test(ua)) || screenWidth < 600;
  }

  private setupListeners(): void {
    // 监听屏幕变化
    window.addEventListener('resize', () => {
      this.updateDeviceInfo();
    });

    // 监听方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateDeviceInfo(), 100);
    });

    // 监听触摸模式变化 (某些设备可以切换模式)
    window.matchMedia('(pointer: coarse)').addEventListener('change', () => {
      this.updateDeviceInfo();
    });
  }

  private updateDeviceInfo(): void {
    const oldType = this.deviceInfo.type;
    this.deviceInfo = this.detect();
    
    if (oldType !== this.deviceInfo.type) {
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.deviceInfo));
  }

  // 公共 API
  getInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  getType(): DeviceType {
    return this.deviceInfo.type;
  }

  isTablet(): boolean {
    return this.deviceInfo.isTablet;
  }

  isMobile(): boolean {
    return this.deviceInfo.isMobile;
  }

  isDesktop(): boolean {
    return this.deviceInfo.isDesktop;
  }

  isTouchDevice(): boolean {
    return this.deviceInfo.isTouch;
  }

  // 订阅设备变化
  onChange(callback: (info: DeviceInfo) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const deviceDetector = new DeviceDetector();
