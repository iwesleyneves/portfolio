(function () {
  const STORAGE_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    const html = document.documentElement;
    const isLight = theme === 'light';
    if (isLight) {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute(
        'aria-label',
        isLight ? 'Ativar modo escuro' : 'Ativar modo claro'
      );
      toggleBtn.setAttribute(
        'title',
        isLight ? 'Ativar modo escuro' : 'Ativar modo claro'
      );
    }

    const folderRoot = document.querySelector('#certificates-folder.folder-root');
    if (folderRoot) {
      folderRoot.dataset.theme = isLight ? 'light' : 'dark';
    }

    window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme: isLight ? 'light' : 'dark' } }));
  }

  window.initThemeToggle = function initThemeToggle() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}

    const initialTheme = saved === 'light' ? 'light' : 'dark';
    applyTheme(initialTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const currentIsLight = document.documentElement.getAttribute('data-theme') === 'light';
      const nextTheme = currentIsLight ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {}
      applyTheme(nextTheme);
    });
  };
})();
