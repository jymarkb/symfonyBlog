import React from 'react';
import { toast } from 'sonner';
const ContactFormAction = () => {
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
            Thank you! We& apos;ll be in touch soon.
          </p>
        ),
      });

      form.reset();
    } catch (error) {
      toast.error('Error: Form Submit', {
        description: (
          <div>
            <p className="text-red-900"> Cannot submit form at the moment.</p>
            <p> {`${error}`} </p>
          </div>
        ),
      });
    }
  });
};

export default ContactFormAction;
