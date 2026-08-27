// ============================================
// NAVBAR COMPONENT
// ============================================
import { themeManager } from '../theme.js';

export function renderNavbar() {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  navbar.id = 'main-navbar';

  navbar.innerHTML = `
    <div class="navbar-inner">
      <a href="#/" class="navbar-brand">
        <div class="navbar-brand-icon">⚽</div>
        <span>FootballHub</span>
      </a>

      <div class="navbar-links" id="navbar-links">
        <a href="#/" class="nav-link" data-page="home">Home</a>
        <a href="#/teams" class="nav-link" data-page="teams">Teams</a>
        <a href="#/players" class="nav-link" data-page="players">Players</a>
        <a href="#/matches" class="nav-link" data-page="matches">Matches</a>
        <a href="#/tournaments" class="nav-link" data-page="tournaments">Tournaments</a>
        <a href="#/standings" class="nav-link" data-page="standings">Standings</a>
      </div>

      <div class="navbar-actions">
        <a href="#/admin" class="btn btn-ghost btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: var(--weight-semibold); border: 1px solid var(--border-primary); padding: var(--space-2) var(--space-3);">
          <span>⚙️</span>
          <span>Admin</span>
        </a>
        <button class="theme-toggle" id="theme-toggle" title="Toggle theme">
          ${themeManager.isDark() ? '☀️' : '🌙'}
        </button>
        <button class="mobile-menu-btn" id="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <div class="mobile-nav" id="mobile-nav">
      <a href="#/" class="nav-link" data-page="home">🏠 Home</a>
      <a href="#/teams" class="nav-link" data-page="teams">👥 Teams</a>
      <a href="#/players" class="nav-link" data-page="players">⚽ Players</a>
      <a href="#/matches" class="nav-link" data-page="matches">📅 Matches</a>
      <a href="#/tournaments" class="nav-link" data-page="tournaments">🏆 Tournaments</a>
      <a href="#/standings" class="nav-link" data-page="standings">📊 Standings</a>
      <a href="#/admin" class="nav-link" data-page="admin">⚙️ Admin Panel</a>
    </div>
  `;

  // Theme toggle
  const themeBtn = navbar.querySelector('#theme-toggle');
  themeBtn.addEventListener('click', () => {
    themeManager.toggle();
    themeBtn.textContent = themeManager.isDark() ? '☀️' : '🌙';
  });

  // Also update when theme changes externally
  themeManager.onChange((theme) => {
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });

  // Mobile menu
  const menuBtn = navbar.querySelector('#mobile-menu-btn');
  const mobileNav = navbar.querySelector('#mobile-nav');
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  return navbar;
}
