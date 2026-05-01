import { initSideBarNavigation } from './components/SidebarNavigation';

class Dashboard {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
  }
}

new Dashboard();
