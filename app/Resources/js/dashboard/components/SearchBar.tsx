const SearchBar = () => {
  const searchBar = document.getElementById('pageSearch') as HTMLInputElement;
  const btnSearch = document.getElementById('btnSearch') as HTMLButtonElement;
  const btnClear = document.getElementById('clearSearch') as HTMLButtonElement;

  if (!searchBar) return;

  const fetchData = async (value: string) => {
    if (!value.trim()) return;
    try {
      const response = await fetch(`https://localhost/blog/search/${value}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = debounce(async () => {
    const value = searchBar.value.trim();
    if (value) {
      btnClear?.classList.remove('opacity-0');
      await fetchData(value);
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
    if (value) await fetchData(value);
  });
};

export default SearchBar;
