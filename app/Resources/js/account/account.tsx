import React from 'react';
import { Popup } from '../dashboard/components/Popup';
import { MobileHeader } from '../home/component/MobileHeader';
import ShowPassword from '../component/ShowPassword';
import ToastMessage from '../dashboard/components/ToastMessage';
import { toast } from 'sonner';

class Account {
  constructor() {
    this.init();
  }
  init() {
    ShowPassword('btnShowPass', '.inputPassword');
    ToastMessage();
    Popup({
      btnTrigger: 'headerBtn',
      isFilter: false,
      popUpdata: <MobileHeader />,
    });
    this.initGoogle();
  }

  initGoogle() {
    const btnGoogle = document.querySelector('.btn-google');

    btnGoogle?.addEventListener('click', () => {
      toast.error('Not Working:', {
        description: (
          <p className="text-red-900">
            <strong>Sign in</strong> or <strong>Sign up</strong> with Google
            does not work at the moment.
          </p>
        ),
        duration: 1500,
      });
    });
  }
}

new Account();
