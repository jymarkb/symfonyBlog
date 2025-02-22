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
  const mainContentWrapper = document.querySelector(mainContent);
  const btnSidebar = document.getElementById(buttonId);

  if (btnSidebar) {
    btnSidebar.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        sidebarWrapper?.classList.toggle('w-72');
        sidebarWrapper?.classList.toggle('w-0');
        mainContentWrapper?.classList.toggle('blur-md');
      } else {
        sidebarWrapper?.classList.toggle('w-72');
        sidebarWrapper?.classList.toggle('w-0');
      }
    });
  }
};
