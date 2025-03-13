import React, { JSX } from 'react';
import { toast } from 'sonner';
import { fetchPreview } from '../components/action/PopupPreviewAction';
import { PageFormData } from './props';

// Function to execute script inside the popup
const executeScripts = (element: HTMLElement) => {
  element.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script');

    if (oldScript.src) {
      newScript.src = oldScript.src;
      newScript.async = true;
    } else {
      newScript.textContent = oldScript.textContent;
    }

    oldScript.parentNode?.removeChild(oldScript); // Remove safely
    element.appendChild(newScript); // Append new script
  });
};

const PreviewPopUpData = async (): Promise<{
  openModal: boolean;
  data: JSX.Element | null;
}> => {
  const form = document.getElementById('blogForm') as HTMLFormElement | null;
  if (!form) return { openModal: false, data: null };

  const formData = new FormData(form);
  const excludeFields = new Set([
    'create_new_page[status]',
    'create_new_page[htmlStyle]',
    'create_new_page[htmlScript]',
  ]);

  const formJson: Partial<PageFormData> = {}; // Fix: Ensuring compatibility
  const emptyFields: string[] = [];

  formData.forEach((value, key) => {
    if (excludeFields.has(key) && !value) return;

    const match = key.match(/^create_new_page\[(.*?)\]$/);

    if (match) {
      const fieldName = match[1] as keyof PageFormData;

      if (fieldName === 'htmlThumbnail') {
        formJson[fieldName] = value instanceof File ? value : {};
      } else {
        formJson[fieldName] = value as string;
      }

      if (typeof value === 'string' && value.trim() === '') {
        emptyFields.push(fieldName);
      }
    }
  });

  if (emptyFields.length) {
    toast.error('Form Submission Error: Missing Required Fields', {
      description:
        'Please fill in the required fields: ' + emptyFields.join(', '),
      duration: 1500,
    });
    return { openModal: false, data: null };
  }

  const popupData = await fetchPreview(formJson as PageFormData);

  return {
    openModal: true,
    data: (
      <div
        dangerouslySetInnerHTML={{ __html: popupData }}
        ref={(el) => {
          if (el) executeScripts(el);
        }}
      />
    ),
  };
};

export default PreviewPopUpData;
