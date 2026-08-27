// ============================================
// ADMIN PLAYERS MANAGEMENT PAGE
// ============================================

import { getCurrentUser } from './AdminAuth.js';
import { renderAdminHeader, attachAdminHeaderEvents } from './AdminLayout.js';
import { getPlayers, getTeams, playersService, getPositionFull } from '../../data/dataService.js';
import { createImagePicker } from '../../services/imageUpload.js';

export async function renderAdminPlayers(container) {
  const user = getCurrentUser();
  if (!user) {
    window.location.hash = '#/admin/login';
    return;
  }

  container.innerHTML = `
    ${renderAdminHeader('players')}
    <div class="container section animate-fade-in-up">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);">
        <div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--weight-bold);">Players Management</h2>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">Register footballers, assign squads, and update match statistics</p>
        </div>
        <button id="add-player-btn" class="btn btn-primary">➕ Register New Player</button>
      </div>

      <!-- Filters & Search -->
      <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap;">
        <input type="text" id="admin-player-search" class="input" placeholder="Search by player or team..." style="flex: 1; min-width: 200px;" />
        <select id="admin-team-filter" class="input" style="width: auto;">
          <option value="All">All Squads</option>
        </select>
        <select id="admin-pos-filter" class="input" style="width: auto;">
          <option value="All">All Positions</option>
          <option value="FWD">Forward (FWD)</option>
          <option value="MID">Midfielder (MID)</option>
          <option value="DEF">Defender (DEF)</option>
          <option value="GK">Goalkeeper (GK)</option>
        </select>
      </div>

      <div id="players-loading" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state">
          <div class="empty-state-icon">👤</div>
          <h3>Loading players from Firestore...</h3>
        </div>
      </div>

      <div id="players-content" style="display: none;">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Player Name</th>
                <th>Team</th>
                <th>Pos</th>
                <th>#</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Apps</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="players-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Player Modal -->
      <div id="player-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: var(--space-4);">
        <div class="card" style="width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: var(--space-8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h3 id="player-modal-title">Register Player</h3>
            <button id="player-modal-close" style="background: none; border: none; font-size: 1.5rem; color: var(--text-tertiary); cursor: pointer;">✕</button>
          </div>

          <form id="player-form" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <input type="hidden" id="player-id" />

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Full Name *</label>
                <input type="text" id="player-name" class="input" placeholder="e.g. Marco Silva" required />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Jersey Number *</label>
                <input type="number" id="player-jersey" class="input" placeholder="9" min="1" max="99" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Assigned Team *</label>
                <select id="player-team" class="input" required></select>
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Position *</label>
                <select id="player-pos" class="input" required>
                  <option value="FWD">Forward (FWD)</option>
                  <option value="MID">Midfielder (MID)</option>
                  <option value="DEF">Defender (DEF)</option>
                  <option value="GK">Goalkeeper (GK)</option>
                </select>
              </div>
            </div>

            <div id="player-photo-slot"></div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Nationality / Flag</label>
                <input type="text" id="player-nat" class="input" placeholder="🇧🇷 Brazil" value="⚽" />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Preferred Foot</label>
                <select id="player-foot" class="input">
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Avatar Emoji</label>
                <input type="text" id="player-avatar" class="input" placeholder="⚽" value="⚽" />
              </div>
            </div>

            <div>
              <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Player Bio</label>
              <textarea id="player-bio" class="input" rows="2" placeholder="Skills, playstyle, accolades..."></textarea>
            </div>

            <!-- Stats Section -->
            <div style="padding: var(--space-4); background: var(--bg-tertiary); border-radius: var(--radius-lg);">
              <h4 style="margin-bottom: var(--space-3); font-size: var(--text-sm);">📊 Match Performance Statistics</h4>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);">
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">Goals</label>
                  <input type="number" id="stat-goals" class="input" value="0" min="0" />
                </div>
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">Assists</label>
                  <input type="number" id="stat-assists" class="input" value="0" min="0" />
                </div>
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">Appearances</label>
                  <input type="number" id="stat-apps" class="input" value="0" min="0" />
                </div>
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">Clean Sheets</label>
                  <input type="number" id="stat-clean" class="input" value="0" min="0" />
                </div>
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">🟨 Yellows</label>
                  <input type="number" id="stat-yellow" class="input" value="0" min="0" />
                </div>
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">🟥 Reds</label>
                  <input type="number" id="stat-red" class="input" value="0" min="0" />
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
              <button type="button" class="btn btn-ghost" id="player-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" id="player-modal-submit">Save Player</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  attachAdminHeaderEvents(container);

  const [players, teams] = await Promise.all([getPlayers(), getTeams()]);
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  const loading = container.querySelector('#players-loading');
  const content = container.querySelector('#players-content');
  const tbody = container.querySelector('#players-tbody');
  const modal = container.querySelector('#player-modal');
  const form = container.querySelector('#player-form');
  const teamSelect = container.querySelector('#player-team');
  const teamFilter = container.querySelector('#admin-team-filter');
  const posFilter = container.querySelector('#admin-pos-filter');
  const searchInput = container.querySelector('#admin-player-search');

  // Populate team dropdowns
  teamSelect.innerHTML = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    teamFilter.appendChild(opt);
  });

  const photoSlot = container.querySelector('#player-photo-slot');
  let currentPhotoUrl = '';
  let photoPicker = createImagePicker({
    label: 'Player Photo (Upload or Paste URL)',
    currentUrl: '',
    onSelect: (url) => { currentPhotoUrl = url; }
  });
  photoSlot.appendChild(photoPicker);

  let playerList = [...players];

  function renderTable() {
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    const q = searchInput.value.trim().toLowerCase();
    const selTeam = teamFilter.value;
    const selPos = posFilter.value;

    let filtered = playerList.filter(p => {
      const team = teamMap[p.teamId] || {};
      const matchQ = !q || p.name.toLowerCase().includes(q) || (team.name && team.name.toLowerCase().includes(q));
      const matchTeam = selTeam === 'All' || p.teamId === selTeam;
      const matchPos = selPos === 'All' || p.position === selPos;
      return matchQ && matchTeam && matchPos;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:var(--space-8);color:var(--text-tertiary);">No players matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const team = teamMap[p.teamId] || { name: '—', shortName: '—' };
      const stats = p.stats || { goals: 0, assists: 0, appearances: 0 };
      const posBadgeClass = (p.position || 'fwd').toLowerCase();

      return `
        <tr>
          <td>
            <div style="width:36px;height:36px;border-radius:var(--radius-full);background:var(--bg-tertiary);overflow:hidden;display:flex;align-items:center;justify-content:center;">
              ${p.photoUrl ? `<img src="${p.photoUrl}" style="width:100%;height:100%;object-fit:cover;" />` : (p.avatar || '⚽')}
            </div>
          </td>
          <td style="font-weight: var(--weight-semibold);">${p.name}</td>
          <td>${team.name}</td>
          <td><span class="position-badge ${posBadgeClass}">${p.position}</span></td>
          <td>#${p.jerseyNumber || 10}</td>
          <td style="font-weight: var(--weight-bold); color: var(--accent-green);">${stats.goals || 0}</td>
          <td style="font-weight: var(--weight-bold); color: var(--accent-blue);">${stats.assists || 0}</td>
          <td>${stats.appearances || 0}</td>
          <td style="text-align: right;">
            <button class="btn btn-ghost btn-sm edit-player-btn" data-id="${p.id}">✏️ Edit</button>
            <button class="btn btn-ghost btn-sm delete-player-btn" data-id="${p.id}" style="color: var(--accent-red);">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-player-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.delete-player-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const target = playerList.find(p => p.id === id);
        if (confirm(`Are you sure you want to delete ${target?.name || 'this player'}?`)) {
          btn.textContent = '...';
          await playersService.delete(id);
          playerList = playerList.filter(p => p.id !== id);
          renderTable();
        }
      });
    });
  }

  function openModal(playerId = null) {
    modal.style.display = 'flex';
    form.reset();
    currentPhotoUrl = '';

    if (playerId) {
      const p = playerList.find(x => x.id === playerId);
      if (!p) return;

      container.querySelector('#player-modal-title').textContent = 'Edit Player Profile';
      container.querySelector('#player-id').value = p.id;
      container.querySelector('#player-name').value = p.name || '';
      container.querySelector('#player-jersey').value = p.jerseyNumber || 10;
      container.querySelector('#player-team').value = p.teamId || '';
      container.querySelector('#player-pos').value = p.position || 'FWD';
      container.querySelector('#player-nat').value = p.nationality || '🇧🇷';
      container.querySelector('#player-foot').value = p.preferredFoot || 'Right';
      container.querySelector('#player-avatar').value = p.avatar || '⚽';
      container.querySelector('#player-bio').value = p.bio || '';
      currentPhotoUrl = p.photoUrl || '';

      const s = p.stats || {};
      container.querySelector('#stat-goals').value = s.goals || 0;
      container.querySelector('#stat-assists').value = s.assists || 0;
      container.querySelector('#stat-apps').value = s.appearances || 0;
      container.querySelector('#stat-clean').value = s.cleanSheets || 0;
      container.querySelector('#stat-yellow').value = s.yellowCards || 0;
      container.querySelector('#stat-red').value = s.redCards || 0;
    } else {
      container.querySelector('#player-modal-title').textContent = 'Register New Player';
      container.querySelector('#player-id').value = '';
    }

    photoSlot.innerHTML = '';
    photoPicker = createImagePicker({
      label: 'Player Photo (Upload or Paste URL)',
      currentUrl: currentPhotoUrl,
      onSelect: (url) => { currentPhotoUrl = url; }
    });
    photoSlot.appendChild(photoPicker);
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  searchInput.addEventListener('input', renderTable);
  teamFilter.addEventListener('change', renderTable);
  posFilter.addEventListener('change', renderTable);

  container.querySelector('#add-player-btn').addEventListener('click', () => openModal());
  container.querySelector('#player-modal-close').addEventListener('click', closeModal);
  container.querySelector('#player-modal-cancel').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#player-modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = container.querySelector('#player-id').value;
    const name = container.querySelector('#player-name').value.trim();
    const jerseyNumber = Number(container.querySelector('#player-jersey').value) || 10;
    const teamId = container.querySelector('#player-team').value;
    const position = container.querySelector('#player-pos').value;
    const nationality = container.querySelector('#player-nat').value.trim();
    const preferredFoot = container.querySelector('#player-foot').value;
    const avatar = container.querySelector('#player-avatar').value.trim() || '⚽';
    const bio = container.querySelector('#player-bio').value.trim();

    const stats = {
      goals: Number(container.querySelector('#stat-goals').value) || 0,
      assists: Number(container.querySelector('#stat-assists').value) || 0,
      appearances: Number(container.querySelector('#stat-apps').value) || 0,
      cleanSheets: Number(container.querySelector('#stat-clean').value) || 0,
      yellowCards: Number(container.querySelector('#stat-yellow').value) || 0,
      redCards: Number(container.querySelector('#stat-red').value) || 0,
      minutesPlayed: (Number(container.querySelector('#stat-apps').value) || 0) * 90,
    };

    const playerData = {
      name,
      jerseyNumber,
      teamId,
      position,
      nationality,
      preferredFoot,
      avatar,
      bio,
      photoUrl: currentPhotoUrl || '',
      stats,
      updatedAt: new Date().toISOString()
    };

    try {
      if (id) {
        await playersService.update(id, playerData);
        const idx = playerList.findIndex(p => p.id === id);
        if (idx !== -1) playerList[idx] = { ...playerList[idx], ...playerData };
      } else {
        const newId = `player-${Date.now()}`;
        playerData.id = newId;
        playerData.createdAt = new Date().toISOString();
        await playersService.create(playerData);
        playerList.push(playerData);
      }

      closeModal();
      renderTable();
    } catch (err) {
      alert('Failed to save player: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Player';
    }
  });

  renderTable();
}
