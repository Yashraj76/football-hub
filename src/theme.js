// ============================================
// THEME MANAGER — Dark/Light Toggle
// ============================================

class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || this.getSystemTheme();
    this.listeners = [];
  }

  init() {
    this.applyTheme(this.theme);
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('football-theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  getStoredTheme() {
    return localStorage.getItem('football-theme');
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('football-theme', theme);
    this.listeners.forEach(fn => fn(theme));
  }

  toggle() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  isDark() {
    return this.theme === 'dark';
  }

  onChange(fn) {
    this.listeners.push(fn);
  }
}

export const themeManager = new ThemeManager();
