import React, { JSX } from 'react';
import ReactDOM from 'react-dom/client';
import { PopupWrapper } from './PopupWrapper';

export const Popup = ({
  btnTrigger,
  popUpdata,
}: {
  btnTrigger: string;
  popUpdata: JSX.Element | null;
}) => {
  const popDivContainer = document.getElementById('popup-container');
  const btnAction = document.getElementById(btnTrigger);
  if (!popDivContainer || !btnAction || !popUpdata) return;

  const root = ReactDOM.createRoot(popDivContainer);

  const renderPop = (isOpen: boolean) => {
    root.render(
      <PopupWrapper openWrapper={isOpen} onClose={() => renderPop(false)}>
        {popUpdata}
      </PopupWrapper>,
    );
  };

  const handleClick = () => {
    const tempContainer = document.createElement('div');
    const tempRoot = ReactDOM.createRoot(tempContainer);

    tempRoot.render(
      React.cloneElement(popUpdata, {
        onLoad: () => {
          //trigger on next tick
          setTimeout(() => {
            renderPop(true);
            tempRoot.unmount();
          }, 0);
        },
        onFail: () => {
          // prevent unmount while rendering, trigger on next tick
          setTimeout(() => {
            tempRoot.unmount();
          }, 0);
        },
      }),
    );

    
  };

  renderPop(false); // todo: on edit/create

  btnAction.removeEventListener('click', handleClick);
  btnAction.addEventListener('click', handleClick);
};
