import { toast } from 'sonner';

const fetchPreview = async (data: Record<string, any>): Promise<string> => {
  try {
    const response = await fetch('https://localhost/dashboard/pages/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    return response.text();
  } catch (error) {
    console.error('Failed to fetch preview:', error);
    return '';
  }
};

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

    oldScript.replaceWith(newScript);
  });
};

const PreviewPopUpData = async () => {
  const form = document.getElementById('blogForm') as HTMLFormElement | null;
  if (!form) return;

  const formData = new FormData(form);
  const excludeFields = new Set([
    'create_new_page[status]',
    'create_new_page[htmlStyle]',
    'create_new_page[htmlScript]',
  ]);

  const formJson: Record<string, any> = {};
  const emptyFields: string[] = [];

  formData.forEach((value, key) => {
    if (
      !excludeFields.has(key) &&
      (!value || (typeof value === 'string' && value.trim() === ''))
    ) {
      emptyFields.push(key);
    }
    formJson[key] = value;
  });

  if (emptyFields.length) {
    toast.error('Form Submission Error: Missing Required Fields', {
      description:
        'Please fill in the required fields: Title, Category, Summary, Body Content',
    });
    return { openModal: false, data: null };
  }

  const popupData = await fetchPreview(formJson);

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
