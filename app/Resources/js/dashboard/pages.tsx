import React from 'react';
import { initSideBarNavigation } from './components/SidebarNavigation';
import TableAction from './components/TableAction';
import ToastMessage from './components/ToastMessage';
import { Popup } from './components/Popup';
import { SearchFilter } from './components/SearchFilter';

class Pages {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    ToastMessage();
    TableAction();
    Popup({ btnTrigger: 'btnFilter', popUpdata: <SearchFilter /> });
  }
}

new Pages();
