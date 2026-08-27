// ============================================
// ADMIN LAYOUT HELPER — Navigation bar & wrapper
// ============================================

import { getCurrentUser, adminLogout } from './AdminAuth.js';

export function renderAdminHeader(activeTab = 'dashboard') {
  const user = getCurrentUser();
  const email = user ? (user.email || 'Admin') : 'Admin';

  const tabs = [
    { id: 'dashboard', label: '📊 Overview', hash: '#/admin' },
    { id: 'teams', label: '🛡️ Teams', hash: '#/admin/teams' },
    { id: 'players', label: '👤 Players', hash: '#/admin/players' },
    { id: 'matches', label: '⚽ Match Center', hash: '#/admin/matches' },
    { id: 'tournaments', label: '🏆 Tournaments', hash: '#/admin/tournaments' },
  ];

  return `
    <div style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-primary); padding: var(--space-4) 0; margin-bottom: var(--space-8);">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <span style="font-size: 1.5rem;">⚙️</span>
          <div>
            <div style="font-weight: var(--weight-extrabold); font-size: var(--text-lg); display: flex; align-items: center; gap: var(--space-2);">
              FootballHub Admin
              <span class="badge badge-purple" style="font-size: var(--text-xs);">Live Firestore</span>
            </div>
            <div style="font-size: var(--text-xs); color: var(--text-tertiary);">Logged in as: <strong style="color: var(--text-secondary);">${email}</strong></div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <a href="#/" class="btn btn-ghost btn-sm" target="_blank">🌐 View Public Site ↗</a>
          <button id="admin-logout-btn" class="btn btn-danger btn-sm">🚪 Logout</button>
        </div>
      </div>

      <div class="container" style="margin-top: var(--space-4);">
        <div class="tabs" style="margin: 0;">
          ${tabs.map(t => `
            <a href="${t.hash}" class="tab ${activeTab === t.id ? 'active' : ''}" style="text-decoration: none;">
              ${t.label}
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function attachAdminHeaderEvents(container) {
  const logoutBtn = container.querySelector('#admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await adminLogout();
    });
  }
}
