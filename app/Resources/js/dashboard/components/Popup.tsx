import React, { JSX } from 'react';
import ReactDOM from 'react-dom/client';
import { PopupWrapper } from './PopupWrapper';

let root: ReactDOM.Root | null;

export const Popup = ({
  btnTrigger,
  popUpdata,
  isFilter
}: {
  isFilter:boolean;
  btnTrigger: string;
  popUpdata: JSX.Element | null;
}) => {
  const popDivContainer = document.getElementById('popup-container');
  const btnAction = document.getElementById(btnTrigger);
  if (!popDivContainer || !btnAction || !popUpdata) return;

  const renderPop = (isOpen: boolean, renderAgain: boolean) => {
    if (!root) {
      root = ReactDOM.createRoot(popDivContainer);
    } else if (!isOpen && !renderAgain) {
      root.unmount();
      root = null;
      return;
    }

    root.render(
      <PopupWrapper openWrapper={isOpen} onClose={() => renderPop(false, isFilter)}>
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
            renderPop(true, isFilter);
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

  renderPop(false, isFilter); // todo: on edit/create

  btnAction.removeEventListener('click', handleClick);
  btnAction.addEventListener('click', handleClick);
};
