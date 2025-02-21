type SidebarNavigationProps = {
  wrapperId: string;
  buttonId: string;
  navItems: string;
  mainContent: string;
};

export const SidebarNavigation = (props: SidebarNavigationProps) => {
  const { wrapperId, buttonId, navItems, mainContent } = props;

  const sidebarWrapper = document.getElementById(wrapperId);
  const mainContentWrapper = document.querySelector(mainContent);
  const btnSidebar = document.getElementById(buttonId);
  const navigationItems = document.querySelectorAll(navItems);

  btnSidebar?.addEventListener('click', () => {
    if (window.innerWidth < 1024) {
      // Mobile & Tablet
      sidebarWrapper?.classList.toggle('w-72');
      sidebarWrapper?.classList.toggle('w-0');
      // sidebarWrapper?.classList.toggle('fixed');
      mainContentWrapper?.classList.toggle('blur-md'); // Blur effect on content
    } else {
      // Larger Screens
      // sidebarWrapper?.classList.toggle('w-screen');
      sidebarWrapper?.classList.toggle('w-72');
      sidebarWrapper?.classList.toggle('w-0');
    }
  });
};

SidebarNavigation({
  wrapperId: 'side-nav-wrapper',
  buttonId: 'side-nav-btn',
  navItems: '.nav-item',
  mainContent: 'main-content',
});
