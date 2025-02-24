import ReactDOM from 'react-dom/client';
import { initSideBarNavigation } from './components/SidebarNavigation';
import BottomPopupForm from './components/BottomPopupForm';
import { PopupProps, PopupWrapperProps } from './utils/props';

class Pages {
  constructor() {
    this.init();
  }

  init() {
    //disable popup
    // this.initPopupFormRender();
    initSideBarNavigation();
  }

  initPopupFormRender() {
    const popDivContainer = document.getElementById(
      'popup-container',
    ) as HTMLElement | null;
    if (!popDivContainer) return;

    this.renderPopup({
      containerEl: popDivContainer,
      onReady: ({ popup, popupContainer }) =>
        this.handlePopupReady(popup, popupContainer),
    });
  }

  handlePopupReady(
    popup: HTMLElement | null,
    popupContainer: HTMLElement | null,
  ) {
    const btnAction = document.getElementById('btn-add');
    btnAction?.addEventListener('click', () => {
      if (popup && popupContainer) {
        this.showPopup({ popup: popup, popupContainer: popupContainer });
      }
    });
  }

  renderPopup({ containerEl, onReady }: PopupProps) {
    if (!containerEl) return;
    ReactDOM.createRoot(containerEl).render(
      <BottomPopupForm onReady={onReady} />,
    );
  }

  showPopup({ popup, popupContainer }: PopupWrapperProps) {
    if (!popup || !popupContainer) return;

    popup.classList.remove('pointer-events-none');
    setTimeout(() => {
      popup.classList.replace('opacity-0', 'opacity-100');
      popupContainer.classList.replace('translate-y-full', 'translate-y-0');
    }, 50);
  }
}

new Pages();
