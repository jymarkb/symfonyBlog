import {
  handleFileValidation,
  showImage,
  removeImage,
} from './action/FileuploadAction';

const ThumbnailUploader = ({
  isEditPage,
  targetField,
}: {
  isEditPage: boolean;
  targetField: string;
}) => {
  const fileInput = document.getElementById(
    'create_new_page_htmlThumbnail',
  ) as HTMLInputElement | null;
  const fileUploadLabel = document.getElementById(
    'dragLabel',
  ) as HTMLLabelElement | null;
  const imgContainer = document.getElementById(
    'viewThumbnail',
  ) as HTMLElement | null;
  const imgViewer = document.getElementById(
    'imgViewer',
  ) as HTMLImageElement | null;
  const removeUpload = document.getElementById(
    'removeUpload',
  ) as HTMLButtonElement | null;

  if (
    !fileInput ||
    !fileUploadLabel ||
    !imgContainer ||
    !imgViewer ||
    !removeUpload
  )
    return;

  if (isEditPage) {
    // preload the image from storage
    const targetInput = document.getElementById(
      targetField,
    ) as HTMLInputElement;
    const imgPath = targetInput?.getAttribute('data-src');

    if (imgPath) {
      imgViewer.src = imgPath;
      imgContainer.classList.remove('hidden');
      fileUploadLabel.classList.add('hidden');
    }
  }

  const handleDrag = (e: DragEvent, add: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    fileUploadLabel.classList.toggle('border-solid', add);
    fileUploadLabel.classList.toggle('border-dashed', !add);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e?.dataTransfer?.files[0] ?? null;
    if (!file || !handleFileValidation(file)) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    showImage(file, imgViewer, imgContainer, fileUploadLabel);
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    if (!file || !handleFileValidation(file)) {
      target.value = '';
      return;
    }
    showImage(file, imgViewer, imgContainer, fileUploadLabel);
  };

  const handleRemoveImage = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    removeImage(imgViewer, imgContainer, fileUploadLabel, fileInput);
  };

  fileUploadLabel.addEventListener('dragenter', (e) => handleDrag(e, true));
  fileUploadLabel.addEventListener('dragleave', (e) => handleDrag(e, false));
  fileUploadLabel.addEventListener('dragover', (e) => e.preventDefault());
  fileUploadLabel.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileChange);
  removeUpload.addEventListener('click', handleRemoveImage);
};

export default ThumbnailUploader;
