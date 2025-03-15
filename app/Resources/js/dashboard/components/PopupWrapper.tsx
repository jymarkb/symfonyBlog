import React, { ReactNode, useEffect, useState } from 'react';

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
    if (openWrapper) {
      const timer = setTimeout(() => {
        setWrapperVisible(true);
        setContainerVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [openWrapper]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWrapperVisible(false);
    setContainerVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`wrapper-popup fixed inset-0 bg-gray-700/70 z-50 flex justify-center items-end 
      ${wrapperVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} 
      transition-opacity duration-300`}
      onClick={handleClose}
    >
      <div className="flex flex-col max-h-[90%] max-w-[90%] md:max-w-[70%]">
        <div className=" z-[100] w-fit ml-auto">
          <button
          id='closePopupWrapper'
            className="text-red-600 text-3xl font-bold ml-auto w-fit"
            onClick={handleClose}
          >
            <i className="icon-x"></i>
          </button>
        </div>

        <div
          className={`popup-container bg-white rounded-t-3xl p-5 shadow-lg transform 
          ${containerVisible ? 'translate-y-0' : 'translate-y-full'} 
          transition-transform duration-500`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="form-wrapper p-4 rounded-lg max-h-[100vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
