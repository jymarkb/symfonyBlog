import React from 'react';
import ReactDOM from 'react-dom/client';
import { CarouselDemo } from './CarouselSize';
import { initSideBarNavigation } from '../dashboard/components/SidebarNavigation';
import { Popup } from '../dashboard/components/Popup';
import { MobileHeader } from './component/MobileHeader';

class Home {
  constructor() {
    this.init();
  }

  init() {
    this.initProfileBG();
    this.initCarousel();
    initSideBarNavigation();

    Popup({
      btnTrigger: 'headerBtn',
      isFilter: false,
      popUpdata: <MobileHeader />,
    });
  }

  initCarousel() {
    const containerDiv = document.querySelector('#carousel');
    if (containerDiv) {
      ReactDOM.createRoot(containerDiv).render(<CarouselDemo />);
    }
  }

  initProfileBG() {
    const headerProfile = document.querySelector('.randomBg');
    if (headerProfile instanceof HTMLElement) {
      const color = localStorage.getItem('profileBG');
      headerProfile.style.backgroundColor = color ?? this.randomProfileBG();
    }
  }

  randomProfileBG() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    localStorage.setItem('profileBG', color);
    return color;
  }
}

new Home();
