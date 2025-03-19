import React, { useEffect } from 'react';
import { CustomEventListener } from '../action/HomeEventListener';

export const MobileHeader = ({
  onLoad,
  onFail,
}: {
  onLoad?: () => void;
  onFail?: () => void;
}) => {
  useEffect(() => {
    const targetBody = document.getElementById('bodyWrapper');
    const mainBody = document.getElementById('mainBody');

    if (!targetBody) {
      onFail?.();
      return;
    }
    onLoad?.();

    mainBody?.classList.add('bg-black');
    setTimeout(() => {
      targetBody.classList.add('-translate-y-24');
    }, 100);

    CustomEventListener('close-toast', closePopup);
  }, []);

  const closePopup = () => {
    const targetBody = document.getElementById('bodyWrapper');
    if (!targetBody) return;

    targetBody.classList.remove('-translate-y-24');

    const mainBody = document.getElementById('mainBody');
    mainBody?.classList.remove('bg-black');
  };

  return (
    <div className="w-[85vw]" id="homeHeader">
      {/* <div className="mx-auto mt-[-20px] mb-[20px] h-2 w-[100px] rounded-full bg-muted"></div> */}
      <ul className="text-2xl mb-8 flex flex-col gap-2">
        <li className="flex gap-4">
          <i className="icon-house"></i>
          <a href="/">Home</a>
        </li>
        <li className="flex gap-4">
          <i className="icon-swatch-book"></i>
          <a href="/blog">Blogs</a>
        </li>
        <li className="flex gap-4">
          <i className="icon-shell"></i>
          <a href="/">About</a>
        </li>
        <li className="flex gap-4">
          <i className="icon-send"></i>
          <a href="/">Contact Us</a>
        </li>
      </ul>
    </div>
  );
};
