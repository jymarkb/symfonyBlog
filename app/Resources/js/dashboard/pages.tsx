import { initSideBarNavigation } from './components/SidebarNavigation';
// import { initPopup } from './pages/Popup';
// import { initEditor } from './pages/Editor';

class Pages {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    // initPopup();
    // initEditor('htmlEditor');
    this.initSearchBar();
  }

  initSearchBar(){
    const searchBar = document.getElementById("pageSearch");

    if(!searchBar) return;

    searchBar.addEventListener('change', async (e:any) =>{
      let value = e.target.value;

      let data =  await fetch(`https://localhost/blog/search/${value}`).then((data) =>{
        return data.json();
      })
      console.log(data);
    })

  
  }
}

new Pages();
