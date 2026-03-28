/**
 * WebOS UI Framework - Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ========== useDebounce ==========
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ========== useThrottle ==========
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// ========== useClickOutside ==========
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}

// ========== useHotkey ==========
export function useHotkey(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchCtrl = options.ctrl ? event.ctrlKey || event.metaKey : true;
      const matchShift = options.shift ? event.shiftKey : true;
      const matchAlt = options.alt ? event.altKey : true;
      const matchKey = event.key.toLowerCase() === key.toLowerCase();

      if (matchCtrl && matchShift && matchAlt && matchKey) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, options]);
}

// ========== useDrag ==========
interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export function useDrag<T extends HTMLElement>(
  onDragEnd?: (state: DragState) => void
): {
  ref: React.RefObject<T>;
  state: DragState;
} {
  const ref = useRef<T>(null);
  const [state, setState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      setState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: rect.left,
        offsetY: rect.top,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const deltaX = e.clientX - state.startX;
      const deltaY = e.clientY - state.startY;
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const deltaX = e.clientX - state.startX;
      const deltaY = e.clientY - state.startY;
      const newState: DragState = {
        ...state,
        isDragging: false,
        offsetX: state.offsetX + deltaX,
        offsetY: state.offsetY + deltaY,
      };
      setState(newState);
      element.style.transform = '';
      onDragEnd?.(newState);
    };

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state, onDragEnd]);

  return { ref, state };
}

// ========== useLocalStorage ==========
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// ========== useMediaQuery ==========
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// ========== useWindowSize ==========
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ========== useScrollLock ==========
export function useScrollLock(lock: boolean): void {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lock]);
}

// ========== useFocusTrap ==========
export function useFocusTrap<T extends HTMLElement>(
  active: boolean
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [active]);

  return ref;
}
