/**
 * Anchor Component - 锚点链接组件
 * 支持平滑滚动、高亮当前
 */

import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

// ========== Types ==========
export interface AnchorLinkItem {
  key: string;
  href: string;
  title: React.ReactNode;
  target?: string;
  children?: AnchorLinkItem[];
}

export interface AnchorProps {
  items: AnchorLinkItem[];
  container?: HTMLElement | (() => HTMLElement | Window);
  offsetTop?: number;
  bounds?: number;
  smooth?: boolean;
  currentAnchor?: string;
  onChange?: (currentAnchor: string) => void;
  onClick?: (e: React.MouseEvent, item: AnchorLinkItem) => void;
  className?: string;
  style?: React.CSSProperties;
  acrylic?: boolean;
  affix?: boolean;
  direction?: 'vertical' | 'horizontal';
}

interface AnchorContextType {
  currentAnchor: string;
  onClick: (e: React.MouseEvent, item: AnchorLinkItem) => void;
  smooth: boolean;
}

const AnchorContext = createContext<AnchorContextType | null>(null);

// ========== Anchor Link Component ==========
interface AnchorLinkProps {
  item: AnchorLinkItem;
  level: number;
}

const AnchorLink: React.FC<AnchorLinkProps> = ({ item, level }) => {
  const context = useContext(AnchorContext);
  if (!context) return null;

  const { currentAnchor, onClick, smooth } = context;
  const isActive = currentAnchor === item.href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(e, item);

    // Smooth scroll to target
    if (smooth) {
      const target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  return (
    <li className="nav-anchor-link-wrapper" role="listitem">
      <a
        className={`
          nav-anchor-link
          ${isActive ? 'nav-anchor-link-active' : ''}
          nav-anchor-link-level-${level}
        `.trim()}
        href={item.href}
        title={typeof item.title === 'string' ? item.title : undefined}
        target={item.target}
        onClick={handleClick}
        aria-current={isActive ? 'location' : undefined}
      >
        {isActive && <span className="nav-anchor-link-dot" />}
        <span className="nav-anchor-link-title">{item.title}</span>
      </a>
      {item.children && item.children.length > 0 && (
        <ul className="nav-anchor-links" role="list">
          {item.children.map((child) => (
            <AnchorLink key={child.key} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

// ========== Main Anchor Component ==========
export const Anchor: React.FC<AnchorProps> = ({
  items,
  container,
  offsetTop = 0,
  bounds = 5,
  smooth = true,
  currentAnchor: controlledCurrentAnchor,
  onChange,
  onClick,
  className = '',
  style,
  acrylic = true,
  affix = true,
  direction = 'vertical',
}) => {
  const [internalCurrentAnchor, setInternalCurrentAnchor] = useState('');
  const [inkTop, setInkTop] = useState(0);

  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);

  const currentAnchor = controlledCurrentAnchor ?? internalCurrentAnchor;

  // Get scroll container
  useEffect(() => {
    if (!container) {
      scrollContainerRef.current = window;
    } else if (typeof container === 'function') {
      scrollContainerRef.current = container();
    } else {
      scrollContainerRef.current = container;
    }
  }, [container]);

  // Handle scroll and highlight current anchor
  useEffect(() => {
    const containerEl = scrollContainerRef.current;
    if (!containerEl) return;

    const handleScroll = () => {
      const containerTop = containerEl === window
        ? 0
        : (containerEl as HTMLElement).getBoundingClientRect().top;

      // Get all anchor targets
      const hrefs = getAllHrefs(items);
      const positions: { href: string; top: number }[] = [];

      hrefs.forEach((href) => {
        const target = document.querySelector(href);
        if (target) {
          const rect = target.getBoundingClientRect();
          positions.push({
            href,
            top: rect.top - containerTop - offsetTop - bounds,
          });
        }
      });

      // Find the current active anchor
      let active = '';
      for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i].top <= 0) {
          active = positions[i].href;
          break;
        }
      }

      // Default to first item if all are above
      if (!active && positions.length > 0) {
        active = positions[0].href;
      }

      if (active && active !== currentAnchor) {
        setInternalCurrentAnchor(active);
        onChange?.(active);
      }
    };

    // Get all hrefs from items recursively
    function getAllHrefs(anchorItems: AnchorLinkItem[]): string[] {
      const result: string[] = [];
      anchorItems.forEach((item) => {
        result.push(item.href);
        if (item.children) {
          result.push(...getAllHrefs(item.children));
        }
      });
      return result;
    }

    containerEl.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      containerEl.removeEventListener('scroll', handleScroll);
    };
  }, [items, offsetTop, bounds, currentAnchor, onChange]);

  // Update ink position
  useEffect(() => {
    const anchorEl = anchorRef.current;
    if (!anchorEl) return;

    const activeLink = anchorEl.querySelector('.nav-anchor-link-active');
    if (activeLink) {
      const linkRect = activeLink.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();
      setInkTop(linkRect.top - anchorRect.top + linkRect.height / 2);
    }
  }, [currentAnchor]);

  const handleClick = useCallback((e: React.MouseEvent, item: AnchorLinkItem) => {
    onClick?.(e, item);
    setInternalCurrentAnchor(item.href);
    onChange?.(item.href);
  }, [onClick, onChange]);

  // Keyboard navigation
  useEffect(() => {
    const anchorEl = anchorRef.current;
    if (!anchorEl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const links = anchorEl.querySelectorAll<HTMLAnchorElement>('.nav-anchor-link');
      const currentIndex = Array.from(links).findIndex(
        (link) => link.classList.contains('nav-anchor-link-active')
      );

      let nextIndex: number;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = links.length - 1;
          break;
        default:
          return;
      }

      links[nextIndex]?.focus();
      links[nextIndex]?.click();
    };

    anchorEl.addEventListener('keydown', handleKeyDown);
    return () => anchorEl.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue: AnchorContextType = {
    currentAnchor,
    onClick: handleClick,
    smooth,
  };

  return (
    <AnchorContext.Provider value={contextValue}>
      <div
        ref={anchorRef}
        className={`
          nav-anchor
          nav-anchor-${direction}
          ${acrylic ? 'nav-anchor-acrylic' : ''}
          ${affix ? 'nav-anchor-affix' : ''}
          ${className}
        `.trim()}
        style={style}
        role="navigation"
        aria-label="Anchor navigation"
      >
        {/* Ink indicator */}
        <div className="nav-anchor-ink">
          <div
            className="nav-anchor-ink-ball"
            style={{ top: inkTop }}
          />
        </div>

        {/* Links */}
        <ul className="nav-anchor-links" role="list">
          {items.map((item) => (
            <AnchorLink key={item.key} item={item} level={0} />
          ))}
        </ul>
      </div>
    </AnchorContext.Provider>
  );
};

// ========== Anchor Link Item Component (for standalone usage) ==========
export interface AnchorLinkItemProps {
  href: string;
  title: React.ReactNode;
  target?: string;
  children?: React.ReactNode;
}

export const AnchorLinkItem: React.FC<AnchorLinkItemProps> = ({
  href,
  title,
  target,
  children,
}) => {
  const context = useContext(AnchorContext);
  const isActive = context?.currentAnchor === href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    context?.onClick(e, { key: href, href, title, target });
  };

  return (
    <li className="nav-anchor-link-wrapper" role="listitem">
      <a
        className={`nav-anchor-link ${isActive ? 'nav-anchor-link-active' : ''}`}
        href={href}
        target={target}
        onClick={handleClick}
      >
        {isActive && <span className="nav-anchor-link-dot" />}
        <span className="nav-anchor-link-title">{title}</span>
      </a>
      {children && <ul className="nav-anchor-links" role="list">{children}</ul>}
    </li>
  );
};

export default Anchor;
