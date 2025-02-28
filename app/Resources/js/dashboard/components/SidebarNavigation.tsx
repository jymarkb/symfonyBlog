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
    mainContent = 'main-content',
  } = props;

  const sidebarWrapper = document.getElementById(wrapperId);
  const mainContentWrapper = document.getElementById(mainContent);
  const btnSidebar = document.getElementById(buttonId);

  if (btnSidebar) {
    btnSidebar.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        btnSidebar?.classList.toggle('active')
        sidebarWrapper?.classList.toggle('w-72');
        sidebarWrapper?.classList.toggle('w-0');
        // mainContentWrapper?.classList.toggle('ml-72');
      } else {
        btnSidebar?.classList.toggle('active')
        sidebarWrapper?.classList.toggle('w-72');
        sidebarWrapper?.classList.toggle('w-0');
        // mainContentWrapper?.classList.toggle('ml-72');
      }
    });
  }
};
