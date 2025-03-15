import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchPreview } from '../components/action/PopupPreviewAction';
import { executeScripts } from '../components/action/PreviewPopupAction';
import { ValidateFields } from '../components/action/PreviewPopupAction';
import { PageFormData } from './props';

const PreviewPopUpData = ({
  onLoad,
  onFail,
}: {
  onLoad?: () => void;
  onFail?: () => void;
}) => {
  const [popupData, setPopupData] = useState<string | null>(null);
  const form = document.getElementById('blogForm') as HTMLFormElement | null;

  useEffect(() => {
    if (!form) {
      onFail?.(); // Notify failure safely inside useEffect
      return;
    }

    const formData = new FormData(form);
    const fields = ValidateFields({ formData });
    if (fields.hasEmptyFields) {
      toast.error('Form Submission Error', {
        description: 'Please fill in all required fields.',
        duration: 1500,
      });
      onFail?.();
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchPreview(fields.formJson as PageFormData);
        setPopupData(data);

        if (data) {
          onLoad?.(); // Call onLoad safely inside useEffect
        } else {
          onFail?.();
        }
      } catch (error) {
        console.error('Error fetching preview:', error);
        onFail?.();
      }
    };

    fetchData();
  }, []);

  return popupData ? (
    <div
      dangerouslySetInnerHTML={{ __html: popupData }}
      ref={(el) => {
        if (el) executeScripts(el);
      }}
    />
  ) : null;
};
export default PreviewPopUpData;
