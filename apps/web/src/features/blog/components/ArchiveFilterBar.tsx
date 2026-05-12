import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostTag, PostYear } from '../blogTypes';

type Props = {
  tags: PostTag[];
  years: PostYear[];
  activeTag: string | null;
  activeYear: number | null;
  searchValue: string;
  onTagChange: (slug: string | null) => void;
  onYearChange: (year: number | null) => void;
  onSearchChange: (value: string) => void;
  suggestedTags?: PostTag[];
};

// ---------------------------------------------------------------------------
// Helper: FilterMenuList
// Renders the <li> items (the "All …" entry + mapped items) for a filter menu.
// The caller provides the wrapping <ul role="listbox">.
// ---------------------------------------------------------------------------
type FilterItem = {
  value: string | number | null;
  label: string;
  count?: number;
  pill?: boolean;
};

function FilterMenuList<T extends string | number>({
  items,
  activeValue,
  onSelect,
}: {
  items: FilterItem[];
  activeValue: T | null;
  onSelect: (value: T | null) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        const baseClass = `filter-item${item.pill ? ' filter-item--pill' : ''}`;
        return (
          <li key={item.value ?? '__all__'}>
            <button
              role="option"
              aria-selected={isActive}
              className={`${baseClass}${isActive ? ' active' : ''}`}
              onClick={() => onSelect(item.value as T | null)}
            >
              <span className="filter-item-name">{item.label}</span>
              <span className="filter-item-check" aria-hidden="true">
                {isActive ? '✓' : ''}
              </span>
              {item.count != null && (
                <span className="filter-item-count">{item.count}</span>
              )}
            </button>
          </li>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Helper: FilterDropdown
// Renders the desktop pill-button + conditional listbox dropdown wrapper.
// ---------------------------------------------------------------------------
function FilterDropdown({
  label,
  isOpen,
  isActive,
  ariaLabel,
  onToggle,
  dropdownRef,
  menuClassName,
  children,
}: {
  label: React.ReactNode;
  isOpen: boolean;
  isActive: boolean;
  ariaLabel: string;
  onToggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  menuClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className={`filter-btn filter-btn--pill${isActive ? ' active' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {label}
        <span className="filter-caret" aria-hidden="true">▾</span>
      </button>
      {isOpen && (
        <ul className={menuClassName} role="listbox" aria-label={ariaLabel}>
          {children}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ArchiveFilterBar({
  tags,
  years,
  activeTag,
  activeYear,
  searchValue,
  onTagChange,
  onYearChange,
  onSearchChange,
  suggestedTags = [],
}: Props) {
  const [inputValue, setInputValue] = useState(searchValue);
  const [tagOpen, setTagOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // C-1: refs for focus management
  const comboTriggerRef = useRef<HTMLButtonElement>(null);
  const comboMenuRef = useRef<HTMLDivElement>(null);
  const hasOpenedCombo = useRef(false);

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setInputValue(value);
      if (debounceTimer.current !== null) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => onSearchChange(value), 300);
    },
    [onSearchChange],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!tagOpen && !yearOpen && !comboOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setTagOpen(false); setYearOpen(false); setComboOpen(false); }
    };
    const handleClick = (e: MouseEvent) => {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) setTagOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
      if (comboMenuRef.current && comboTriggerRef.current &&
          !comboMenuRef.current.contains(e.target as Node) &&
          !comboTriggerRef.current.contains(e.target as Node)) {
        setComboOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [tagOpen, yearOpen, comboOpen]);

  // C-1: move focus into drawer on open, restore to trigger on close
  useEffect(() => {
    if (comboOpen) {
      hasOpenedCombo.current = true;
      const menu = comboMenuRef.current;
      if (menu) {
        const focusable = menu.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        focusable?.focus();
      }
    } else if (hasOpenedCombo.current) {
      comboTriggerRef.current?.focus();
    }
  }, [comboOpen]);

  const activeTagData = activeTag != null ? tags.find((t) => t.slug === activeTag) : null;
  const activeCount = (activeTag !== null ? 1 : 0) + (activeYear !== null ? 1 : 0);

  const handleTagSelect = useCallback(
    (slug: string | null) => { onTagChange(slug); setTagOpen(false); setComboOpen(false); },
    [onTagChange],
  );

  const handleYearSelect = useCallback(
    (year: number | null) => { onYearChange(year); setYearOpen(false); setComboOpen(false); },
    [onYearChange],
  );

  // Build item arrays for FilterMenuList
  const tagFilterItems: FilterItem[] = [
    { value: null, label: 'All topics' },
    ...tags.map((tag) => ({ value: tag.slug, label: tag.name, count: tag.posts_count ?? undefined })),
  ];

  const yearFilterItems: FilterItem[] = [
    { value: null, label: 'All years' },
    ...years.map(({ year, count }) => ({ value: year, label: String(year), count, pill: true })),
  ];

  return (
    <div className="toolbar-wrap">
      <div className="toolbar">
        <label className="search">
          <span className="search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="8.8" y1="8.8" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="search"
            aria-label="Search essays"
            placeholder="Search essays…"
            value={inputValue}
            onChange={handleInputChange}
          />
        </label>

        {/* Desktop: separate pill dropdowns */}
        <div className="filter-pills">
          <FilterDropdown
            label={activeTagData != null ? activeTagData.name : 'Topic'}
            isOpen={tagOpen}
            isActive={activeTag !== null}
            ariaLabel="Filter by topic"
            onToggle={() => { setTagOpen((o) => !o); setYearOpen(false); }}
            dropdownRef={tagRef}
            menuClassName="filter-menu"
          >
            <FilterMenuList<string>
              items={tagFilterItems}
              activeValue={activeTag}
              onSelect={handleTagSelect}
            />
          </FilterDropdown>

          {years.length > 0 && (
            <FilterDropdown
              label={activeYear != null ? activeYear : 'Year'}
              isOpen={yearOpen}
              isActive={activeYear !== null}
              ariaLabel="Filter by year"
              onToggle={() => { setYearOpen((o) => !o); setTagOpen(false); }}
              dropdownRef={yearRef}
              menuClassName="filter-menu filter-menu--year"
            >
              <FilterMenuList<number>
                items={yearFilterItems}
                activeValue={activeYear}
                onSelect={handleYearSelect}
              />
            </FilterDropdown>
          )}
        </div>

        {/* Mobile: combined icon button + bottom drawer */}
        <div className="filter-combo">
          {/* M-1: dynamic aria-label includes active count */}
          <button
            ref={comboTriggerRef}
            className={`filter-btn filter-btn--icon${activeCount > 0 ? ' active' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={comboOpen}
            aria-label={activeCount > 0 ? `Filters (${activeCount} active)` : 'Filters'}
            onClick={() => setComboOpen((o) => !o)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="5" cy="4" r="2" fill="var(--paper)" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="8" r="2" fill="var(--paper)" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="6" cy="12" r="2" fill="var(--paper)" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            {/* M-1: badge span no longer needs its own aria-label */}
            {activeCount > 0 && (
              <span className="filter-badge" aria-hidden="true">{activeCount}</span>
            )}
          </button>
          {comboOpen && (
            <>
              <div className="filter-drawer-backdrop" onClick={() => setComboOpen(false)} aria-hidden="true" />
              {/* C-1: aria-modal="true" added; ref attached for focus management */}
              <div
                ref={comboMenuRef}
                className="filter-combo-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
              >
                <div className="filter-drawer-handle" aria-hidden="true" />
                <p className="filter-section-label">Topic</p>
                <ul role="listbox" aria-label="Filter by topic">
                  <FilterMenuList<string>
                    items={tagFilterItems}
                    activeValue={activeTag}
                    onSelect={handleTagSelect}
                  />
                </ul>
                {years.length > 0 && (
                  <>
                    <div className="filter-combo-divider" />
                    <p className="filter-section-label">Year</p>
                    <ul role="listbox" aria-label="Filter by year">
                      <FilterMenuList<number>
                        items={yearFilterItems}
                        activeValue={activeYear}
                        onSelect={handleYearSelect}
                      />
                    </ul>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {suggestedTags.length > 0 && (
        <div className="suggested-tags">
          <span className="suggested-tags-label">Suggested topics:</span>
          {suggestedTags.map((tag) => (
            <button
              key={tag.slug}
              className="filter-btn filter-btn--pill"
              onClick={() => handleTagSelect(tag.slug)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
