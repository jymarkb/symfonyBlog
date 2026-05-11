import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostTag } from '../blogTypes';

type Props = {
  tags: PostTag[];
  activeTag: string | null;
  searchValue: string;
  total: number;
  onTagChange: (slug: string | null) => void;
  onSearchChange: (value: string) => void;
};

export function ArchiveFilterBar({
  tags,
  activeTag,
  searchValue,
  onTagChange,
  onSearchChange,
}: Props) {
  const [inputValue, setInputValue] = useState(searchValue);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync inputValue if searchValue prop is reset externally (e.g. cleared by parent)
  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleAllClick = useCallback(() => {
    onTagChange(null);
  }, [onTagChange]);

  const handleTagClick = useCallback(
    (slug: string) => {
      onTagChange(slug);
    },
    [onTagChange],
  );

  return (
    <div className="toolbar">
      <label className="search">
        <input
          type="search"
          placeholder="Search essays…"
          value={inputValue}
          onChange={handleInputChange}
        />
      </label>
      <div className="filter-chips">
        <button
          className={`chip${activeTag === null ? ' active' : ''}`}
          onClick={handleAllClick}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag.slug}
            className={`chip${activeTag === tag.slug ? ' active' : ''}`}
            onClick={() => handleTagClick(tag.slug)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
