import React from 'react';
import { Popup } from '../dashboard/components/Popup';
import { MobileHeader } from '../home/component/MobileHeader';
import FAQAction from '../contact/action/FAQAction';

class About {
  constructor() {
    this.init();
  }

  init() {
    Popup({
      btnTrigger: 'headerBtn',
      isFilter: false,
      popUpdata: <MobileHeader />,
    });
    FAQAction();
  }
}

new About();
