type SidebarNavigationProps = {
  wrapperId: string;
  buttonId: string;
  mainContent: string;
};
export const initSideBarNavigation = (
  props: Partial<SidebarNavigationProps> = {},
) => {
  const { wrapperId = 'side-nav-wrapper', buttonId = 'side-nav-btn' } = props;

  const sidebarWrapper = document.getElementById(wrapperId);
  const btnSidebar = document.getElementById(buttonId);
  let isOpen = document.cookie;

  if (!btnSidebar) return;

  const SideBarAction = () => {
    btnSidebar?.classList.toggle('active');
    sidebarWrapper?.classList.toggle('w-72');
    sidebarWrapper?.classList.toggle('w-0');
  };

  if (!isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  btnSidebar.addEventListener('click', () => {
    const cookieValue = isOpen ? '' : '1';
    const cookieMaxAge = isOpen ? 0 : 604800;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    document.cookie = `sidebarCookie=${cookieValue}; max-age=${cookieMaxAge};`;
    isOpen = document.cookie;
    SideBarAction();
  });
};
