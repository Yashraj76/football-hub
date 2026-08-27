// ============================================
// ADMIN DASHBOARD PAGE
// ============================================

import { getCurrentUser } from './AdminAuth.js';
import { renderAdminHeader, attachAdminHeaderEvents } from './AdminLayout.js';
import { getTeams, getPlayers, getMatches, getTournaments, standingsService } from '../../data/dataService.js';

export async function renderAdminDashboard(container) {
  const user = getCurrentUser();
  if (!user) {
    window.location.hash = '#/admin/login';
    return;
  }

  container.innerHTML = `
    ${renderAdminHeader('dashboard')}
    <div class="container section animate-fade-in-up">
      <div style="min-height: 200px; display: flex; align-items: center; justify-content: center;" id="dash-loading">
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3>Loading dashboard analytics...</h3>
        </div>
      </div>
      <div id="dash-content" style="display: none;"></div>
    </div>
  `;

  attachAdminHeaderEvents(container);

  const [teams, players, matches, tournaments] = await Promise.all([
    getTeams(),
    getPlayers(),
    getMatches(),
    getTournaments()
  ]);

  const completedMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const liveMatches = matches.filter(m => m.status === 'live');
  const totalGoals = completedMatches.reduce((s, m) => s + (Number(m.homeScore) || 0) + (Number(m.awayScore) || 0), 0);

  const loading = container.querySelector('#dash-loading');
  const content = container.querySelector('#dash-content');
  if (loading) loading.style.display = 'none';
  if (content) {
    content.style.display = 'block';
    content.innerHTML = `
      <!-- Stats Grid -->
      <div class="grid-4 stagger-children" style="margin-bottom: var(--space-8);">
        <div class="card" style="display: flex; align-items: center; gap: var(--space-4);">
          <div style="font-size: 2.5rem; background: rgba(var(--accent-primary-rgb, 67, 97, 238), 0.1); padding: var(--space-3); border-radius: var(--radius-lg);">🛡️</div>
          <div>
            <div style="font-size: var(--text-2xl); font-weight: var(--weight-extrabold);">${teams.length}</div>
            <div style="color: var(--text-tertiary); font-size: var(--text-sm);">Total Teams</div>
          </div>
        </div>

        <div class="card" style="display: flex; align-items: center; gap: var(--space-4);">
          <div style="font-size: 2.5rem; background: rgba(var(--accent-green-rgb, 16, 185, 129), 0.1); padding: var(--space-3); border-radius: var(--radius-lg);">👤</div>
          <div>
            <div style="font-size: var(--text-2xl); font-weight: var(--weight-extrabold);">${players.length}</div>
            <div style="color: var(--text-tertiary); font-size: var(--text-sm);">Registered Players</div>
          </div>
        </div>

        <div class="card" style="display: flex; align-items: center; gap: var(--space-4);">
          <div style="font-size: 2.5rem; background: rgba(255, 184, 0, 0.1); padding: var(--space-3); border-radius: var(--radius-lg);">⚽</div>
          <div>
            <div style="font-size: var(--text-2xl); font-weight: var(--weight-extrabold);">${matches.length}</div>
            <div style="color: var(--text-tertiary); font-size: var(--text-sm);">Total Matches (${liveMatches.length} Live)</div>
          </div>
        </div>

        <div class="card" style="display: flex; align-items: center; gap: var(--space-4);">
          <div style="font-size: 2.5rem; background: rgba(231, 111, 81, 0.1); padding: var(--space-3); border-radius: var(--radius-lg);">🏆</div>
          <div>
            <div style="font-size: var(--text-2xl); font-weight: var(--weight-extrabold);">${tournaments.length}</div>
            <div style="color: var(--text-tertiary); font-size: var(--text-sm);">Tournaments</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card gradient-border" style="margin-bottom: var(--space-8); padding: var(--space-6);">
        <h3 style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
          ⚡ Quick Database Actions
        </h3>
        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <a href="#/admin/teams" class="btn btn-primary">➕ Create New Team</a>
          <a href="#/admin/players" class="btn btn-primary">➕ Add Player</a>
          <a href="#/admin/matches" class="btn btn-secondary">📅 Schedule Match</a>
          <a href="#/admin/tournaments" class="btn btn-secondary">🏆 Create Tournament</a>
          <button id="recalculate-all-btn" class="btn btn-ghost">🔄 Recalculate Standings</button>
        </div>
        <div id="action-msg" style="margin-top: var(--space-3); font-size: var(--text-sm);"></div>
      </div>

      <!-- Cloudinary / Free Image Hosting Settings -->
      <div class="card" style="margin-bottom: var(--space-8);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-4);">
          <div>
            <h3 style="display: flex; align-items: center; gap: var(--space-2);">
              🖼️ Free Image Hosting Setup (Cloudinary)
            </h3>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-1);">
              Photos upload directly to Cloudinary without requiring paid Firebase Storage.
            </p>
          </div>
          <span class="badge badge-green">25 GB Free Monthly Tier</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4);">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Cloud Name</label>
            <input type="text" id="cloud-name-input" class="input" placeholder="e.g. your_cloud_name" value="${localStorage.getItem('cloudinary_cloud_name') || 'dq7c5o99v'}" />
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Unsigned Upload Preset</label>
            <input type="text" id="preset-input" class="input" placeholder="e.g. football_hub" value="${localStorage.getItem('cloudinary_preset') || 'football_hub'}" />
          </div>
          <div style="display: flex; align-items: flex-end;">
            <button id="save-cloudinary-btn" class="btn btn-secondary" style="width: 100%;">💾 Save Image Settings</button>
          </div>
        </div>
      </div>

      <!-- Recent Matches Summary -->
      <div class="grid-2">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
            <h3>🔥 Live & Upcoming Matches</h3>
            <a href="#/admin/matches" class="btn btn-ghost btn-sm">Manage All →</a>
          </div>
          ${(liveMatches.length + upcomingMatches.length) === 0 ? '<p style="color:var(--text-tertiary);">No upcoming fixtures scheduled.</p>' : `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${[...liveMatches, ...upcomingMatches].slice(0, 5).map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                  <div>
                    <div style="font-weight: var(--weight-bold); font-size: var(--text-sm);">${m.homeTeam} vs ${m.awayTeam}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-tertiary);">📅 ${m.date} at ${m.time || '18:00'} · 📍 ${m.venue || 'Stadium'}</div>
                  </div>
                  <span class="badge ${m.status === 'live' ? 'badge-red' : 'badge-amber'}">${m.status}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
            <h3>🏆 Active Tournaments</h3>
            <a href="#/admin/tournaments" class="btn btn-ghost btn-sm">Manage All →</a>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${tournaments.map(t => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-lg);">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  <span style="font-size: 1.5rem;">${t.emoji || '🏆'}</span>
                  <div>
                    <div style="font-weight: var(--weight-bold); font-size: var(--text-sm);">${t.name}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-tertiary);">${(t.teams && t.teams.length) || 0} Teams · ${t.matchesPlayed || 0}/${t.totalMatches || 0} Matches</div>
                  </div>
                </div>
                <span class="badge ${t.status === 'ongoing' ? 'badge-green' : t.status === 'completed' ? 'badge-blue' : 'badge-amber'}">${t.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Recalculate button handler
    const recalcBtn = content.querySelector('#recalculate-all-btn');
    const actionMsg = content.querySelector('#action-msg');
    recalcBtn.addEventListener('click', async () => {
      recalcBtn.disabled = true;
      actionMsg.textContent = '⏳ Recalculating league standings from match results...';
      actionMsg.style.color = 'var(--accent-amber)';

      try {
        for (const t of tournaments) {
          await standingsService.recalculateForTournament(t.id);
        }
        actionMsg.textContent = '✅ All tournament standings updated successfully!';
        actionMsg.style.color = 'var(--accent-green)';
      } catch (err) {
        actionMsg.textContent = '❌ Failed: ' + err.message;
        actionMsg.style.color = 'var(--accent-red)';
      } finally {
        recalcBtn.disabled = false;
      }
    });

    // Save Cloudinary settings
    const saveCloudinaryBtn = content.querySelector('#save-cloudinary-btn');
    saveCloudinaryBtn.addEventListener('click', () => {
      const cName = content.querySelector('#cloud-name-input').value.trim();
      const preset = content.querySelector('#preset-input').value.trim();
      if (cName) localStorage.setItem('cloudinary_cloud_name', cName);
      if (preset) localStorage.setItem('cloudinary_preset', preset);
      alert('✅ Image Hosting settings saved!');
    });
  }
}
