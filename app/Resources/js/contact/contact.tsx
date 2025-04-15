import React from 'react';
import { Popup } from '../dashboard/components/Popup';
import { MobileHeader } from '../home/component/MobileHeader';
import ToastMessage from '../dashboard/components/ToastMessage';
import ContactFormAction from './action/ContactFormAction';
import FAQAction from './action/FAQAction';

class Contact {
  constructor() {
    this.init();
  }

  init() {
    Popup({
      btnTrigger: 'headerBtn',
      isFilter: false,
      popUpdata: <MobileHeader />,
    });
    ToastMessage();
    ContactFormAction();
    FAQAction();
  }
}

new Contact();
