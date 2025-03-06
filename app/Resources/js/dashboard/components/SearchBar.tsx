const SearchBar = () => {
  const searchBar = document.getElementById('pageSearch');

  if (!searchBar) return;

  searchBar.addEventListener('change', async (e: any) => {
    let value = e.target.value;

    let data = await fetch(`https://localhost/blog/search/${value}`).then(
      (data) => {
        return data.json();
      },
    );
    console.log(data);
  });
};

export default SearchBar;
