import { toast } from 'sonner';

export const showToastError = (message: string = 'Invalid File') => {
  toast.error(message, {
    description: 'Please upload a valid image file (JPG, JPEG, PNG, or WEBP).',
    duration: 1500,
  });
};

export const fileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

export const handleFileValidation = (file: File | null): boolean => {
  if (!file || !fileTypes.includes(file.type)) {
    showToastError();
    return false;
  }
  return true;
};

export const showImage = (
  file: File,
  imgViewer: HTMLImageElement | null,
  imgContainer: HTMLElement | null,
  fileUploadLabel: HTMLLabelElement | null,
) => {
  if (!imgViewer || !imgContainer || !fileUploadLabel) return;
  imgViewer.src = URL.createObjectURL(file);
  imgContainer.classList.remove('hidden');
  fileUploadLabel.classList.add('hidden');
};

export const removeImage = (
  imgViewer: HTMLImageElement | null,
  imgContainer: HTMLElement | null,
  fileUploadLabel: HTMLLabelElement | null,
  fileInput: HTMLInputElement | null,
) => {
  if (!imgViewer || !imgContainer || !fileUploadLabel || !fileInput) return;
  imgViewer.src = '';
  imgContainer.classList.add('hidden');
  fileUploadLabel.classList.remove('hidden');
  fileInput.value = '';
};
