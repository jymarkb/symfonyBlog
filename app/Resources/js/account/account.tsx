import React from 'react';
import { Popup } from '../dashboard/components/Popup';
import { MobileHeader } from '../home/component/MobileHeader';

class Account {
    constructor (){
        this.init();
    }

    init(){
        Popup({
            btnTrigger: 'headerBtn',
            isFilter: false,
            popUpdata: <MobileHeader />,
          });
    }

}

new Account;