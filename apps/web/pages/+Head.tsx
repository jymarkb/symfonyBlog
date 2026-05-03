const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme-mode');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
    document.documentElement.dataset.mode = mode;
  } catch(e) {}
})();
`.trim();

export default function Head() {
  return (
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  );
}
