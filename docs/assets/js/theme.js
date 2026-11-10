const page = document.documentElement;
const preferenceKey = '3s-design-theme';

try {
  if (localStorage.getItem(preferenceKey) === 'day') page.dataset.theme = 'day';
} catch {
  // The switch still works when storage is unavailable.
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.theme-switch');
  button.setAttribute('aria-pressed', String(page.dataset.theme === 'day'));
  button.hidden = false;
  button.addEventListener('click', () => {
    const nextTheme = page.dataset.theme === 'day' ? 'night' : 'day';
    page.dataset.theme = nextTheme;
    button.setAttribute('aria-pressed', String(nextTheme === 'day'));
    try {
      localStorage.setItem(preferenceKey, nextTheme);
    } catch {
      // Keep the selected theme for the current page.
    }
  });
});
