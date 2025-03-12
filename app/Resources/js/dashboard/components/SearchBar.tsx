import { fetchData, debounce } from "./action/SearchBarAction";

const SearchBar = () => {
  const searchBar = document.getElementById('pageSearch') as HTMLInputElement;
  const btnSearch = document.getElementById('btnSearch') as HTMLButtonElement;
  const btnClear = document.getElementById('clearSearch') as HTMLButtonElement;

  if (!searchBar) return;

  const handleSearch = debounce(async () => {
    const value = searchBar.value.trim();
    if (value) {
      btnClear?.classList.remove('opacity-0');
      await fetchData({value: value, status:[], category:[]});
    } else {
      btnClear?.classList.add('opacity-0');
    }
  }, 500);

  searchBar.addEventListener('input', handleSearch);

  btnClear?.addEventListener('click', () => {
    searchBar.value = '';
    btnClear.classList.add('opacity-0');
  });

  btnSearch?.addEventListener('click', async () => {
    const value = searchBar.value.trim();
    if (value) await fetchData({value: value, status:[], category:[]});
  });
};

export default SearchBar;
