const ShowPassword = (targetBtn: string, targetField: string) => {
  const btnPass = document.getElementById(targetBtn) as HTMLButtonElement;
  const inputPass = document.querySelector(targetField) as HTMLInputElement;
  const icon = btnPass?.querySelector('i') as HTMLElement;

  if (!btnPass && !inputPass && !icon) {
    return;
  }

  btnPass.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle password visibility and icon
    if (inputPass.type === 'password') {
      inputPass.type = 'text';
      icon.classList.replace('icon-eye-off', 'icon-eye');
    } else {
      inputPass.type = 'password';
      icon.classList.replace('icon-eye', 'icon-eye-off');
    }
  });
};

export default ShowPassword;
