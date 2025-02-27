import ReactDOM from 'react-dom/client';
import BottomPopupForm from '../components/BottomPopupForm';
import { PopupProps, PopupWrapperProps } from '../utils/props';

export const initPopup = () => {
  const popDivContainer = document.getElementById(
    'popup-container',
  ) as HTMLElement | null;
  if (!popDivContainer) return;

  
  const renderPopup = ({ containerEl, onReady }: PopupProps) => {
    if (!containerEl) return;
    ReactDOM.createRoot(containerEl).render(
      <BottomPopupForm onReady={onReady} />,
    );
  };

  renderPopup({
    containerEl: popDivContainer,
    onReady: ({ popup, popupContainer }) =>
      handlePopupReady(popup, popupContainer),
  });

  const handlePopupReady = (
    popup: HTMLElement | null,
    popupContainer: HTMLElement | null,
  ) => {
    const btnAction = document.getElementById('btn-add');
    btnAction?.addEventListener('click', () => {
      if (popup && popupContainer) {
        showPopup({ popup: popup, popupContainer: popupContainer });
      }
    });
  };


  const showPopup = ({ popup, popupContainer }: PopupWrapperProps) => {
    if (!popup || !popupContainer) return;

    popup.classList.remove('pointer-events-none');
    setTimeout(() => {
      popup.classList.replace('opacity-0', 'opacity-100');
      popupContainer.classList.replace('translate-y-full', 'translate-y-0');
    }, 50);
  };
};
