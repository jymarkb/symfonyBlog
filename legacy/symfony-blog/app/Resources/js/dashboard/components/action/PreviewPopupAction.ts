import { PageFormData } from "../../utils/props";
// Function to execute script inside the popup
export const executeScripts = (element: HTMLElement) => {
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


export const ValidateFields = ({ formData }: { formData: FormData }): { hasEmptyFields: boolean, formJson: PageFormData } => {
  const formJson: Partial<PageFormData> = {};

  const excludeFields = new Set([
    'create_new_page[status]',
    'create_new_page[htmlStyle]',
    'create_new_page[htmlScript]',
  ]);


  let hasEmptyFields = false;

  formData.forEach((value, key) => {
    if (excludeFields.has(key) && !value) {
      return;
    }

    const match = key.match(/^create_new_page\[(.*?)\]$/);
    if (match) {
      const fieldName = match[1] as keyof PageFormData;

      if (fieldName === 'htmlThumbnail') {
        formJson[fieldName] = value instanceof File ? value : {};
      } else {
        formJson[fieldName] = value as string;
      }

      if (!excludeFields.has(key) && (value === null || value === '')) {
        hasEmptyFields = true;
        return;
      }
    }
  });

  return { hasEmptyFields, formJson };
};
