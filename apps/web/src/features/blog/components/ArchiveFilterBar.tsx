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

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
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
      // Focus first focusable element inside the drawer
      const menu = comboMenuRef.current;
      if (menu) {
        const focusable = menu.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        focusable?.focus();
      }
    } else {
      // Restore focus to the trigger button when drawer closes
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

  // C-2: role="option" and aria-selected moved from <li> to <button>
  const tagItems = (
    <>
      <li>
        <button
          role="option"
          aria-selected={activeTag === null}
          className={`filter-item${activeTag === null ? ' active' : ''}`}
          onClick={() => handleTagSelect(null)}
        >
          <span className="filter-item-name">All topics</span>
          <span className="filter-item-check" aria-hidden="true">{activeTag === null ? '✓' : ''}</span>
        </button>
      </li>
      {tags.map((tag) => (
        <li key={tag.slug}>
          <button
            role="option"
            aria-selected={activeTag === tag.slug}
            className={`filter-item${activeTag === tag.slug ? ' active' : ''}`}
            onClick={() => handleTagSelect(tag.slug)}
          >
            <span className="filter-item-name">{tag.name}</span>
            <span className="filter-item-check" aria-hidden="true">{activeTag === tag.slug ? '✓' : ''}</span>
            {tag.posts_count != null && <span className="filter-item-count">{tag.posts_count}</span>}
          </button>
        </li>
      ))}
    </>
  );

  const yearItems = (
    <>
      <li>
        <button
          role="option"
          aria-selected={activeYear === null}
          className={`filter-item${activeYear === null ? ' active' : ''}`}
          onClick={() => handleYearSelect(null)}
        >
          <span className="filter-item-name">All years</span>
          <span className="filter-item-check" aria-hidden="true">{activeYear === null ? '✓' : ''}</span>
        </button>
      </li>
      {years.map(({ year, count }) => (
        <li key={year}>
          <button
            role="option"
            aria-selected={activeYear === year}
            className={`filter-item filter-item--pill${activeYear === year ? ' active' : ''}`}
            onClick={() => handleYearSelect(year)}
          >
            <span className="filter-item-name">{year}</span>
            <span className="filter-item-check" aria-hidden="true">{activeYear === year ? '✓' : ''}</span>
            <span className="filter-item-count">{count}</span>
          </button>
        </li>
      ))}
    </>
  );

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
          <div className="filter-dropdown" ref={tagRef}>
            <button
              className={`filter-btn filter-btn--pill${activeTag !== null ? ' active' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={tagOpen}
              onClick={() => { setTagOpen((o) => !o); setYearOpen(false); }}
            >
              {activeTagData != null ? activeTagData.name : 'Topic'}
              <span className="filter-caret" aria-hidden="true">▾</span>
            </button>
            {tagOpen && (
              <ul className="filter-menu" role="listbox" aria-label="Filter by topic">{tagItems}</ul>
            )}
          </div>

          {years.length > 0 && (
            <div className="filter-dropdown" ref={yearRef}>
              <button
                className={`filter-btn filter-btn--pill${activeYear !== null ? ' active' : ''}`}
                aria-haspopup="listbox"
                aria-expanded={yearOpen}
                onClick={() => { setYearOpen((o) => !o); setTagOpen(false); }}
              >
                {activeYear != null ? activeYear : 'Year'}
                <span className="filter-caret" aria-hidden="true">▾</span>
              </button>
              {yearOpen && (
                <ul className="filter-menu filter-menu--year" role="listbox" aria-label="Filter by year">{yearItems}</ul>
              )}
            </div>
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
                <ul role="listbox" aria-label="Filter by topic">{tagItems}</ul>
                {years.length > 0 && (
                  <>
                    <div className="filter-combo-divider" />
                    <p className="filter-section-label">Year</p>
                    <ul role="listbox" aria-label="Filter by year">{yearItems}</ul>
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
              onClick={() => onTagChange(tag.slug)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
