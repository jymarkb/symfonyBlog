import SearchBar from './components/SearchBar';
import { initSideBarNavigation } from './components/SidebarNavigation';
import TableAction from './components/TableAction';
import ToastMessage from './components/ToastMessage';

class Pages {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    SearchBar();
    ToastMessage();
    TableAction();
  }
}

new Pages();
