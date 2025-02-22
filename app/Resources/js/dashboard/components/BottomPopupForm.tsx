import { useEffect } from 'react';
import { PopupProps, PopupWrapperProps } from '../utils/props';

const BottomPopupForm = ({ onReady }: PopupProps) => {
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
        className="popup-container bg-white w-11/12 md:w-8/12 rounded-t-3xl p-5 shadow-lg transform translate-y-full transition-transform duration-500 overflow-y"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-wrapper bg-primary p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white">Popup Form</h2>
          <p className="text-sm text-white">Your form elements go here.</p>
          <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg">
            Submit
          </button>
          <h2 className="text-lg font-semibold text-white">Popup Form</h2>
          <p className="text-sm text-white">Your form elements go here.</p>
          <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomPopupForm;
