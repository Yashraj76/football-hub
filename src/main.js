// ============================================
// MAIN ENTRY POINT — Football Platform
// ============================================

// Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/layout.css';

// Firebase
import { initFirebase } from './firebase/config.js';

// Core
import { router } from './router.js';
import { themeManager } from './theme.js';

// Components
import { renderNavbar } from './components/Navbar.js';
import { renderFooter } from './components/Footer.js';

// Pages
import { renderHome } from './pages/Home.js';
import { renderTeams } from './pages/Teams.js';
import { renderPlayers } from './pages/Players.js';
import { renderMatches } from './pages/Matches.js';
import { renderTournaments } from './pages/Tournaments.js';
import { renderStandings } from './pages/Standings.js';

// Admin Pages & Auth
import { initAuthListener } from './pages/admin/AdminAuth.js';
import { renderAdminAuth } from './pages/admin/AdminAuth.js';
import { renderAdminDashboard } from './pages/admin/AdminDashboard.js';
import { renderAdminTeams } from './pages/admin/AdminTeams.js';
import { renderAdminPlayers } from './pages/admin/AdminPlayers.js';
import { renderAdminMatches } from './pages/admin/AdminMatches.js';
import { renderAdminTournaments } from './pages/admin/AdminTournaments.js';

// Initialize
function init() {
  // Initialize Firebase
  initFirebase();

  // Listen to Auth State
  initAuthListener();

  // Initialize theme
  themeManager.init();

  // Build app shell
  const app = document.getElementById('app');
  app.innerHTML = '';

  // Navbar
  app.appendChild(renderNavbar());

  // Main content area
  const main = document.createElement('main');
  main.className = 'main-content';
  main.id = 'page-content';
  app.appendChild(main);

  // Footer
  app.appendChild(renderFooter());

  // Setup routes
  router
    .addRoute('/', renderHome)
    .addRoute('/teams', renderTeams)
    .addRoute('/players', renderPlayers)
    .addRoute('/matches', renderMatches)
    .addRoute('/tournaments', renderTournaments)
    .addRoute('/standings', renderStandings)
    // Admin routes
    .addRoute('/admin', renderAdminDashboard)
    .addRoute('/admin/login', renderAdminAuth)
    .addRoute('/admin/teams', renderAdminTeams)
    .addRoute('/admin/players', renderAdminPlayers)
    .addRoute('/admin/matches', renderAdminMatches)
    .addRoute('/admin/tournaments', renderAdminTournaments);

  // Initialize router
  router.init();
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
