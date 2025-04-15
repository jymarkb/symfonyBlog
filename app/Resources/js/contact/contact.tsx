import React from 'react';
import { Popup } from '../dashboard/components/Popup';
import { MobileHeader } from '../home/component/MobileHeader';
import ToastMessage from '../dashboard/components/ToastMessage';
import { toast } from 'sonner';
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

    this.initSubmitForm();
    this.initFAQbutton();
  }

  initSubmitForm() {
    const form = document.getElementById('google-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      try {
        fetch(form.action, {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        });

        toast.success('Success: Form Submit', {
          description: (
            <p className="text-sm font-semibold text-green-900">
              Thank you! We&apos;ll be in touch soon.
            </p>
          ),
        });

        form.reset();
      } catch (error) {
        toast.error('Error: Form Submit', {
          description: (
            <div>
              <p className="text-red-900">Cannot submit form at the moment.</p>
              <p>{`${error}`}</p>
            </div>
          ),
        });
      }
    });
  }

  initFAQbutton() {
    const faqWrapper = document.getElementById(
      'faq-row-wrapper',
    ) as HTMLElement;

    faqWrapper.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btnTarget = target.closest('button');

      if (!btnTarget) {
        return;
      }

      const targetP = btnTarget.parentElement
        ?.nextElementSibling as HTMLElement;

      if (!targetP) {
        return;
      }

      target.classList.toggle('icon-chevron-down');
      target.classList.toggle('icon-chevron-up');
      targetP.classList.toggle('show');
    });
  }
}

new Contact();
