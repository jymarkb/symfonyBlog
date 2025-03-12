import { Popup } from './components/Popup';
import SearchBar from './components/SearchBar';
import SearchFilter from './components/SearchFilter';
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
    Popup('btnFilter', () => SearchFilter()); // popup filter
  }
}

new Pages();
