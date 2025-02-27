import { initSideBarNavigation } from './components/SidebarNavigation';
// import { initPopup } from './pages/Popup';
import { initEditor } from './pages/Editor';

class Pages {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    // initPopup();
    initEditor('htmlEditor');
  }
}

new Pages();
