const fileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
const ThumbnailUploader = () => {
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

  const handleDrag = (e: DragEvent, add: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    fileUploadLabel.classList.toggle('border-solid', add);
    fileUploadLabel.classList.toggle('border-dashed', !add);
  };

  const handleFileValidation = (file: File | null): file is File => {
    if (!file || !fileTypes.includes(file.type)) {
      // showToastError();
      return false;
    }
    return true;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e?.dataTransfer?.files[0] ?? null;
    if (!handleFileValidation(file)) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    showImage(file);
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    if (!handleFileValidation(file)) {
      target.value = '';
      return;
    }
    showImage(file);
  };

  const showImage = (file: File) => {
    if (!imgViewer || !imgContainer || !fileUploadLabel) return;
    imgViewer.src = URL.createObjectURL(file);
    imgContainer.classList.remove('hidden');
    fileUploadLabel.classList.add('hidden');
  };

  const removeImage = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!imgViewer || !imgContainer || !fileUploadLabel || !fileInput) return;
    imgViewer.src = '';
    imgContainer.classList.add('hidden');
    fileUploadLabel.classList.remove('hidden');
    fileInput.value = '';
  };

  fileUploadLabel.addEventListener('dragenter', (e) => handleDrag(e, true));
  fileUploadLabel.addEventListener('dragleave', (e) => handleDrag(e, false));
  fileUploadLabel.addEventListener('dragover', (e) => e.preventDefault());
  fileUploadLabel.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileChange);
  removeUpload.addEventListener('click', removeImage);
};

export default ThumbnailUploader;
