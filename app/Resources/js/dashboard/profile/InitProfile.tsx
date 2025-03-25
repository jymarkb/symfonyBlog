import ToastMessage from "../components/ToastMessage";
import { initSideBarNavigation } from "../components/SidebarNavigation";

class InitProfile{
    constructor(){
        this.init();
    }

    init(){
        initSideBarNavigation();
        ToastMessage();
    }

}

new InitProfile;