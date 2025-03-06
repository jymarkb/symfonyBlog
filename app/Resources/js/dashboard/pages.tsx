import SearchBar from './components/SearchBar';
import { initSideBarNavigation } from './components/SidebarNavigation';
// import TableAction from './components/TableAction';
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
    SearchBar();
    // TableAction();
  }
}

new Pages();
