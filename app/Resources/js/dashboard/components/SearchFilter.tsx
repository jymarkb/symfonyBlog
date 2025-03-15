import React, { useEffect, useState } from 'react';
import { Filters } from './Filters';
import { FiltersType } from '../utils/props';
import { SearchFilterAction } from './action/SearchFilterAction';
import { TableRenderAction } from './action/TableRenderAction';

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
    TableRenderAction({ fetchData });

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

    const handleSearch = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== 'Backspace') return;
      handleApplyFilter(null);
    };

    const handleSearchInput = () => {
      const value = searchBar.value.trim();

      setFilter((prevFilters) => ({
        ...prevFilters,
        title: value,
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

      handleApplyFilter(null);
    };

    const handleSearchClick = () => handleApplyFilter(null);
    const handleInputType = (ev: KeyboardEvent) => handleSearch(ev);

    onLoad?.();
    onFail?.();

    btnClear?.addEventListener('click', handleClear);
    searchBar?.addEventListener('keydown', handleInputType);
    searchBar?.addEventListener('input', handleSearchInput);
    btnSearch?.addEventListener('click', handleSearchClick);
    return () => {
      btnSearch?.removeEventListener('click', handleSearchClick);
      btnClear?.removeEventListener('click', handleClear);
      searchBar?.removeEventListener('keydown', handleInputType);
      searchBar?.removeEventListener('input', handleSearchInput);
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
