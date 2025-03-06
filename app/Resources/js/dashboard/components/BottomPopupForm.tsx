import React, { useEffect } from 'react';
import { PopupProps, PopupWrapperProps } from '../utils/props';
import { ReactNode } from 'react';

const BottomPopupForm = ({
  onReady,
  children,
}: PopupProps & { children: ReactNode }) => {
  const handleClickOutside = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const { popup, popupContainer } = getPopupElements();

    if (!popup || !popupContainer) return;
    if (popupContainer.contains(e.target as Node)) {
      return;
    }

    popup.classList.replace('opacity-100', 'opacity-0');
    popup.classList.add('pointer-events-none');
    popupContainer.classList.replace('translate-y-0', 'translate-y-full');
  };

  const getPopupElements = (): PopupWrapperProps => {
    return {
      popup: document.querySelector('.wrapper-popup') as HTMLElement | null,
      popupContainer: document.querySelector(
        '.popup-container',
      ) as HTMLElement | null,
    };
  };

  useEffect(() => {
    if (onReady) {
      onReady(getPopupElements());
    }
  }, [onReady]);

  return (
    <div
      className="wrapper-popup fixed inset-0 bg-gray-700/70 z-50 flex justify-center items-end opacity-0 pointer-events-none transition-opacity duration-300"
      onClick={handleClickOutside}
    >
      <div
        className="popup-container bg-white w-11/12 md:w-8/12 rounded-t-3xl p-5 shadow-lg transform translate-y-full transition-transform duration-500 max-h-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-wrapper p-4 pb-36 rounded-lg max-h-[100vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomPopupForm;
