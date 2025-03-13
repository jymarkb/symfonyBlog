import React from 'react';
import ReactDOM from 'react-dom/client';
import { CarouselDemo } from './CarouselSize';
import { initSideBarNavigation } from '../dashboard/components/SidebarNavigation';

class Home {
  constructor() {
    this.init();
  }

  init() {
    const containerDiv = document.querySelector('#carousel');
    if (containerDiv) {
      ReactDOM.createRoot(containerDiv).render(<CarouselDemo />);
    }

    const headerProfile = document.querySelector('.randomBg');
    if (headerProfile instanceof HTMLElement) {
      headerProfile.style.backgroundColor = this.initRandomProfileBG();
    }

    initSideBarNavigation();
  }

  initRandomProfileBG() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

new Home();
