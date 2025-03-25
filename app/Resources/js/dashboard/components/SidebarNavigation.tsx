type SidebarNavigationProps = {
  wrapperId: string;
  buttonId: string;
  mainContent: string;
};
export const initSideBarNavigation = (
  props: Partial<SidebarNavigationProps> = {},
) => {
  const {
    wrapperId = 'side-nav-wrapper',
    buttonId = 'side-nav-btn',
    // mainContent = 'main-content',
  } = props;

  const sidebarWrapper = document.getElementById(wrapperId);
  // const mainContentWrapper = document.getElementById(mainContent);
  const btnSidebar = document.getElementById(buttonId);
  const isOpen = document.cookie;

  if (!btnSidebar) return;

  const SideBarAction = () => {
    btnSidebar?.classList.toggle('active');
    sidebarWrapper?.classList.toggle('w-72');
    sidebarWrapper?.classList.toggle('w-0');
    // if (window.innerWidth < 1024) {
   
    // } else {
    //   btnSidebar?.classList.toggle('active');
    //   sidebarWrapper?.classList.toggle('w-72');
    //   sidebarWrapper?.classList.toggle('w-0');
    // }
  };

  btnSidebar.addEventListener('click', () => {
    console.log(isOpen);

    if (!isOpen) {
      document.cookie = 'sidebarCookie=1; max-age=31536000;';
    } else {
      document.cookie = 'sidebarCookie=; max-age=0;';
    }

    SideBarAction();
  });
};
