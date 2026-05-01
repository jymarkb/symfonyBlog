import ToastMessage from '../components/ToastMessage';
import { initSideBarNavigation } from '../components/SidebarNavigation';
import ShowPassword from '../../component/ShowPassword';

class Profile {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    ToastMessage();
    this.initShowPassword();
  }

  initShowPassword() {
    ShowPassword('btnOldPass', '.inputOldPass');
    ShowPassword('btnNewPass', '.inputNewPass');
  }
}

new Profile();
