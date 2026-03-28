/**
 * @fileoverview Control Panel Component
 * @module @ui/desktop/ControlPanel
 *
 * A settings/control panel with:
 * - Settings groups
 * - Search functionality
 * - Category navigation
 */

import React, { useState, useCallback, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SettingItem {
  /** Setting ID */
  id: string;
  /** Display label */
  label: string;
  /** Description */
  description?: string;
  /** Icon */
  icon?: React.ReactNode;
  /** Category ID */
  categoryId: string;
  /** Keywords for search */
  keywords?: string[];
  /** Click handler */
  onClick?: () => void;
}

export interface SettingCategory {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Category icon */
  icon?: React.ReactNode;
  /** Category description */
  description?: string;
}

export interface ControlPanelProps {
  /** Setting categories */
  categories: SettingCategory[];
  /** All settings items */
  settings: SettingItem[];
  /** Currently selected category */
  selectedCategoryId?: string;
  /** Called when category is selected */
  onCategorySelect?: (categoryId: string) => void;
  /** Called when setting is selected */
  onSettingSelect?: (settingId: string) => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const DefaultIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const ControlPanel: React.FC<ControlPanelProps> = ({
  categories,
  settings,
  selectedCategoryId,
  onCategorySelect,
  onSettingSelect,
  className = '',
}) => {
  // ========================================
  // State
  // ========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(
    selectedCategoryId || (categories[0]?.id ?? null)
  );

  // ========================================
  // Computed Values
  // ========================================
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    return settings.filter(
      (setting) =>
        setting.label.toLowerCase().includes(query) ||
        setting.description?.toLowerCase().includes(query) ||
        setting.keywords?.some((k) => k.toLowerCase().includes(query))
    );
  }, [searchQuery, settings]);

  const categorySettings = useMemo(() => {
    if (filteredSettings) return null;
    if (!activeCategory) return settings;
    return settings.filter((s) => s.categoryId === activeCategory);
  }, [filteredSettings, activeCategory, settings]);

  const activeCategoryInfo = useMemo(
    () => categories.find((c) => c.id === activeCategory),
    [categories, activeCategory]
  );

  // ========================================
  // Handlers
  // ========================================
  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      setSearchQuery('');
      onCategorySelect?.(categoryId);
    },
    [onCategorySelect]
  );

  const handleSettingClick = useCallback(
    (settingId: string) => {
      onSettingSelect?.(settingId);
    },
    [onSettingSelect]
  );

  // ========================================
  // Render
  // ========================================
  return (
    <div className={`desktop-control-panel ${className}`}>
      {/* Acrylic Background */}
      <div className="desktop-control-panel-acrylic" />

      {/* Sidebar */}
      <div className="desktop-control-panel-sidebar">
        {/* Search */}
        <div className="desktop-control-panel-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Find a setting"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="desktop-control-panel-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`desktop-control-panel-category ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="desktop-control-panel-category-icon">
                {category.icon || <DefaultIcon />}
              </span>
              <span className="desktop-control-panel-category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="desktop-control-panel-content">
        {/* Header */}
        <div className="desktop-control-panel-header">
          {searchQuery ? (
            <h2>Search Results</h2>
          ) : activeCategoryInfo ? (
            <>
              <span className="desktop-control-panel-header-icon">
                {activeCategoryInfo.icon || <DefaultIcon />}
              </span>
              <div className="desktop-control-panel-header-text">
                <h2>{activeCategoryInfo.name}</h2>
                {activeCategoryInfo.description && (
                  <p>{activeCategoryInfo.description}</p>
                )}
              </div>
            </>
          ) : (
            <h2>All Settings</h2>
          )}
        </div>

        {/* Settings List */}
        <div className="desktop-control-panel-settings">
          {(filteredSettings || categorySettings || []).map((setting) => (
            <button
              key={setting.id}
              className="desktop-control-panel-setting"
              onClick={() => handleSettingClick(setting.id)}
            >
              {setting.icon && (
                <span className="desktop-control-panel-setting-icon">{setting.icon}</span>
              )}
              <div className="desktop-control-panel-setting-content">
                <div className="desktop-control-panel-setting-label">{setting.label}</div>
                {setting.description && (
                  <div className="desktop-control-panel-setting-description">
                    {setting.description}
                  </div>
                )}
              </div>
              <ChevronRightIcon />
            </button>
          ))}

          {(filteredSettings || categorySettings || []).length === 0 && (
            <div className="desktop-control-panel-empty">
              {searchQuery ? 'No settings found' : 'No settings in this category'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
