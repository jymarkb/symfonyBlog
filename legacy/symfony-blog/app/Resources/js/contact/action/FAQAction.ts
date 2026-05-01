const FAQAction = () => {
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

export default FAQAction;

