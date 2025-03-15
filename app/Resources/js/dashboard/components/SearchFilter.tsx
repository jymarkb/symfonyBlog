import React, { useEffect, useState } from 'react';
import { Filters } from './Filters';
import { FiltersType } from '../utils/props';
import { SearchFilterAction } from './action/SearchFilterAction';

export const SearchFilter = ({
  onLoad,
  onFail,
}: {
  onLoad?: () => void;
  onFail?: () => void;
}) => {
  const [filters, setFilter] = useState<FiltersType>({});

  const dataFilter: Record<string, string[]> = {
    status: ['drafted', 'published'],
    category: ['article', 'news', 'information'],
  };

  const handleApplyFilter = async (
    e: React.MouseEvent<HTMLButtonElement> | null,
  ) => {
    const targetBtn = e?.target as HTMLButtonElement;

    const fetchData = await SearchFilterAction({ filters: filters });
    console.log(fetchData);

    if (targetBtn?.id !== 'applyFilter') return;

    const closeWrapper = document.getElementById('closePopupWrapper');
    if (!closeWrapper) return;

    closeWrapper.click();
  };

  useEffect(() => {
    const searchBar = document.getElementById('pageSearch') as HTMLInputElement;
    const btnClear = document.getElementById(
      'clearSearch',
    ) as HTMLButtonElement;
    const btnSearch = document.getElementById('btnSearch') as HTMLButtonElement;

    if (!searchBar) return;

    const handleSearch = () => {
      const value = searchBar.value.trim();
      setFilter((prevFilters) => ({
        ...prevFilters,
        title: value || prevFilters.title,
      }));
      btnClear?.classList.toggle('opacity-0', !value);
    };

    const handleClear = () => {
      setFilter((prevFilters) => {
        const updatedFilters = { ...prevFilters };
        delete updatedFilters.title;
        return updatedFilters;
      });
      searchBar.value = '';
      btnClear?.classList.add('opacity-0');
    };

    const handleSearchClick = () => handleApplyFilter(null);
    btnSearch?.addEventListener('click', handleSearchClick);

    onLoad?.();
    onFail?.();

    btnClear?.addEventListener('click', handleClear);
    searchBar?.addEventListener('input', handleSearch);

    return () => {
      btnSearch?.removeEventListener('click', handleSearchClick);
      btnClear?.removeEventListener('click', handleClear);
      searchBar?.removeEventListener('input', handleSearch);
    };
  }, [onLoad, onFail, filters]); // Ensures latest filter state

  const handleFilterChange = (updatedFilter: FiltersType) => {
    setFilter((prevFilters) => ({
      ...prevFilters,
      ...updatedFilter,
    }));
  };

  return (
    <div className="text-xl w-[350px] flex flex-col gap-2">
      <Filters dataFilter={dataFilter} onFilterChange={handleFilterChange} />
      <button
        id="applyFilter"
        className="bg-primaryTheme hover:bg-primaryTheme-900 duration-500 transition px-4 py-2 mt-2 text-white rounded-md"
        onClick={(e) => handleApplyFilter(e)} // React's event handling
      >
        Apply
      </button>
    </div>
  );
};
