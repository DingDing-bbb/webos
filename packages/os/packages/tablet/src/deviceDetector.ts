/**
 * 设备检测模块
 * 基于 Windows 硬件兼容性规范
 */

export type DeviceType = 'desktop' | 'tablet' | 'phone' | 'twoInOne';

export type InputMode = 'mouse' | 'touch' | 'pen';

export type DeviceCapability = {
  touch: boolean;
  pen: boolean;
  mouse: boolean;
  keyboard: boolean;
  accelerometer: boolean;
  gyroscope: boolean;
};

export type DeviceInfo = {
  type: DeviceType;
  inputMode: InputMode;
  capabilities: DeviceCapability;
  screen: {
    width: number;
    height: number;
    physicalWidth: number | null;
    physicalHeight: number | null;
    pixelRatio: number;
    touchPoints: number;
  };
  orientation: 'portrait' | 'landscape';
  isTabletMode: boolean;
  isConvertible: boolean;
};

class DeviceDetector {
  private info: DeviceInfo;
  private listeners: Set<(info: DeviceInfo) => void> = new Set();

  constructor() {
    this.info = this.detect();
    this.setupListeners();
  }

  private detect(): DeviceInfo {
    const capabilities = this.detectCapabilities();
    const screen = this.getScreenInfo();
    const type = this.determineDeviceType(capabilities, screen);
    const inputMode = this.determineInputMode(capabilities);
    const isConvertible = this.checkConvertible(capabilities, screen);
    const isTabletMode = this.checkTabletMode(capabilities, type);

    return {
      type,
      inputMode,
      capabilities,
      screen,
      orientation: screen.width > screen.height ? 'landscape' : 'portrait',
      isTabletMode,
      isConvertible
    };
  }

  private detectCapabilities(): DeviceCapability {
    return {
      touch: this.hasTouch(),
      pen: this.hasPen(),
      mouse: this.hasMouse(),
      keyboard: this.hasKeyboard(),
      accelerometer: this.hasAccelerometer(),
      gyroscope: this.hasGyroscope()
    };
  }

  private hasTouch(): boolean {
    if ('ontouchstart' in window) return true;
    if (navigator.maxTouchPoints > 0) return true;
    const msMaxTouchPoints = (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints;
    if (msMaxTouchPoints && msMaxTouchPoints > 0) return true;
    return false;
  }

  private hasPen(): boolean {
    if ('PointerEvent' in window) {
      return (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints !== undefined;
    }
    return false;
  }

  private hasMouse(): boolean {
    return window.matchMedia('(pointer: fine)').matches;
  }

  private hasKeyboard(): boolean {
    return typeof navigator.keyboard !== 'undefined' || !('ontouchstart' in window);
  }

  private hasAccelerometer(): boolean {
    return 'Accelerometer' in window;
  }

  private hasGyroscope(): boolean {
    return 'Gyroscope' in window;
  }

  private getScreenInfo(): DeviceInfo['screen'] {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      physicalWidth: this.getPhysicalDimension(width),
      physicalHeight: this.getPhysicalDimension(height),
      pixelRatio: window.devicePixelRatio || 1,
      touchPoints: navigator.maxTouchPoints || 0
    };
  }

  private getPhysicalDimension(pixels: number): number | null {
    const dpi = 96;
    const ratio = window.devicePixelRatio || 1;
    return (pixels / dpi) * ratio;
  }

  private determineDeviceType(capabilities: DeviceCapability, screen: DeviceInfo['screen']): DeviceType {
    const ua = navigator.userAgent.toLowerCase();
    const isIPad = /ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidTablet = /android(?!.*mobile)/i.test(ua);
    const isPhone = /iphone|ipod|android.*mobile|windows phone/i.test(ua);

    if (isPhone) return 'phone';

    if (isIPad || isAndroidTablet) return 'tablet';

    if (capabilities.touch && screen.width >= 1024 && screen.width <= 1366) {
      if (capabilities.mouse || capabilities.keyboard) {
        return 'twoInOne';
      }
      return 'tablet';
    }

    if (capabilities.touch && screen.touchPoints > 0) {
      return 'twoInOne';
    }

    return 'desktop';
  }

  private determineInputMode(capabilities: DeviceCapability): InputMode {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    if (coarsePointer && capabilities.touch) {
      return 'touch';
    }

    if (capabilities.pen && !finePointer) {
      return 'pen';
    }

    return 'mouse';
  }

  private checkConvertible(capabilities: DeviceCapability, screen: DeviceInfo['screen']): boolean {
    if (screen.touchPoints > 0 && capabilities.mouse) {
      return true;
    }
    if (capabilities.touch && capabilities.keyboard) {
      return true;
    }
    return false;
  }

  private checkTabletMode(capabilities: DeviceCapability, type: DeviceType): boolean {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (type === 'tablet') return true;
    if (type === 'phone') return true;
    if (type === 'twoInOne' && coarsePointer) return true;

    return false;
  }

  private setupListeners(): void {
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('orientationchange', () => this.handleOrientationChange());

    const coarseQuery = window.matchMedia('(pointer: coarse)');
    coarseQuery.addEventListener('change', () => this.handlePointerChange());

    const fineQuery = window.matchMedia('(pointer: fine)');
    fineQuery.addEventListener('change', () => this.handlePointerChange());

    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', () => this.handleResize());
    }
  }

  private handleResize(): void {
    this.updateInfo();
  }

  private handleOrientationChange(): void {
    setTimeout(() => this.updateInfo(), 100);
  }

  private handlePointerChange(): void {
    this.updateInfo();
  }

  private updateInfo(): void {
    const oldType = this.info.type;
    const oldTabletMode = this.info.isTabletMode;
    this.info = this.detect();

    if (oldType !== this.info.type || oldTabletMode !== this.info.isTabletMode) {
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.info));
  }

  getInfo(): DeviceInfo {
    return { ...this.info };
  }

  getType(): DeviceType {
    return this.info.type;
  }

  isTablet(): boolean {
    return this.info.type === 'tablet' || this.info.type === 'twoInOne';
  }

  isPhone(): boolean {
    return this.info.type === 'phone';
  }

  isDesktop(): boolean {
    return this.info.type === 'desktop';
  }

  isTouchDevice(): boolean {
    return this.info.capabilities.touch;
  }

  isConvertibleDevice(): boolean {
    return this.info.isConvertible;
  }

  isInTabletMode(): boolean {
    return this.info.isTabletMode;
  }

  getInputMode(): InputMode {
    return this.info.inputMode;
  }

  getOrientation(): 'portrait' | 'landscape' {
    return this.info.orientation;
  }

  onChange(callback: (info: DeviceInfo) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const deviceDetector = new DeviceDetector();
