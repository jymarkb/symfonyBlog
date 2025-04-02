import React, { ReactNode, useEffect, useState } from 'react';
import { CustomEventDispatch } from '../../home/action/HomeEventListener';

export const PopupWrapper = ({
  openWrapper,
  children,
  onClose,
}: {
  openWrapper: boolean;
  children: ReactNode;
  onClose: () => void;
}) => {
  const [wrapperVisible, setWrapperVisible] = useState(false);
  const [containerVisible, setContainerVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // it should disable body to scroll when popup is visible

    if (openWrapper) {
      const timer = setTimeout(() => {
        setWrapperVisible(true);
        setContainerVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [openWrapper]);

  const handleClose = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.id !== 'wrapperPopup') return;

    document.body.style.overflow = ''; // revert body scroll behaviour

    e.stopPropagation();
    setWrapperVisible(false);
    setContainerVisible(false);
    CustomEventDispatch({ eventTitle: 'close-toast', message: true });
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      id="wrapperPopup"
      className={`wrapper-popup fixed inset-0 bg-gray-700/70 z-50
      ${wrapperVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} 
      transition-opacity duration-300`}
      onClickCapture={handleClose}
    >
      <div
        className={`bg-white rounded-t-3xl max-h-[90%] popup-data-wrapper absolute bottom-0 left-1/2 -translate-x-1/2 transform ${containerVisible ? 'translate-y-0' : 'translate-y-full'} 
          transition-transform duration-300`}
      >
        <div
          className={`popup-container bg-white rounded-t-3xl p-5 shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="form-wrapper p-4 rounded-lg max-h-[100vh] overflow-y-auto">
            <div className="mx-auto mt-[-20px] mb-[20px] h-2 w-[100px] rounded-full bg-muted"></div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
