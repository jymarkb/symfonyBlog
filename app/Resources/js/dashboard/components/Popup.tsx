import ReactDOM from 'react-dom/client';
import BottomPopupForm from './BottomPopupForm';
import { PopupProps, PopupWrapperProps } from '../utils/props';
import React, { JSX } from 'react';

export const Popup = (
  btnActionTrigger: string,
  updatePopupData: () => Promise<{
    openModal: boolean;
    data: JSX.Element | null;
  }>,
) => {
  const popDivContainer = document.getElementById(
    'popup-container',
  ) as HTMLElement | null;
  if (!popDivContainer) return;

  const root = ReactDOM.createRoot(popDivContainer);
  let popupData: JSX.Element | null = null;

  const renderPopup = ({ containerEl, onReady }: PopupProps) => {
    if (!containerEl) return;

    root.render(
      <BottomPopupForm onReady={onReady}>{popupData}</BottomPopupForm>,
    );
  };

  const handlePopupReady = () => {
    const btnAction = document.getElementById(btnActionTrigger);
    if (!btnAction) return;

    // Ensure the event listener is only attached once
    btnAction.removeEventListener('click', handleClick);
    btnAction.addEventListener('click', handleClick);
  };

  const handleClick = async () => {
    const popupResponse = await updatePopupData();

    if (!popupResponse.openModal) return;

    popupData = popupResponse.data;

    renderPopup({
      containerEl: popDivContainer,
      onReady: ({ popup, popupContainer }) =>
        showPopup({ popup, popupContainer }),
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

  renderPopup({
    containerEl: popDivContainer,
    onReady: () => handlePopupReady(),
  });
};
