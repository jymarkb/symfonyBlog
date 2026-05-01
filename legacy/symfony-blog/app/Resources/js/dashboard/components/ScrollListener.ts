const ScrollListener = () => {
  const title = document.getElementById('createTitle');
  let scrolled = false;

  window.addEventListener('scroll', () => {
    const headerBg = document.getElementById('header-bg');
    if (!scrolled && window.scrollY > 0 && headerBg && title) {
      headerBg.classList.toggle('hidden');
      title.classList.toggle('hidden');
      scrolled = true;
    } else if (window.scrollY === 0 && headerBg && title) {
      headerBg.classList.toggle('hidden');
      title.classList.toggle('hidden');
      scrolled = false;
    }
  });
};

export default ScrollListener;
