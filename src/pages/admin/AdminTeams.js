// ============================================
// ADMIN TEAMS MANAGEMENT PAGE
// ============================================

import { getCurrentUser } from './AdminAuth.js';
import { renderAdminHeader, attachAdminHeaderEvents } from './AdminLayout.js';
import { getTeams, teamsService } from '../../data/dataService.js';
import { createTeamLogo } from '../../components/UIComponents.js';
import { createImagePicker } from '../../services/imageUpload.js';

export async function renderAdminTeams(container) {
  const user = getCurrentUser();
  if (!user) {
    window.location.hash = '#/admin/login';
    return;
  }

  container.innerHTML = `
    ${renderAdminHeader('teams')}
    <div class="container section animate-fade-in-up">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);">
        <div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--weight-bold);">Teams Management</h2>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">Create, edit, and configure team profiles & colors</p>
        </div>
        <button id="add-team-btn" class="btn btn-primary">➕ Add New Team</button>
      </div>

      <div id="teams-loading" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state">
          <div class="empty-state-icon">🛡️</div>
          <h3>Loading teams from Firestore...</h3>
        </div>
      </div>

      <div id="teams-content" style="display: none;">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Team Name</th>
                <th>Short</th>
                <th>Home Ground</th>
                <th>Manager</th>
                <th>Record (W-D-L)</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="teams-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Modal Container -->
      <div id="team-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: var(--space-4);">
        <div class="card" style="width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; padding: var(--space-8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h3 id="modal-title">Create Team</h3>
            <button id="modal-close" style="background: none; border: none; font-size: 1.5rem; color: var(--text-tertiary); cursor: pointer;">✕</button>
          </div>

          <form id="team-form" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <input type="hidden" id="team-id" />

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Team Name *</label>
                <input type="text" id="team-name" class="input" placeholder="e.g. Phoenix FC" required />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Short Code *</label>
                <input type="text" id="team-short" class="input" placeholder="e.g. PHX" maxlength="4" required />
              </div>
            </div>

            <div id="logo-picker-slot"></div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Emoji Icon</label>
                <input type="text" id="team-emoji" class="input" placeholder="🔥" value="⚽" />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Primary Color</label>
                <input type="color" id="team-color1" class="input" style="height: 42px; padding: 2px;" value="#4361ee" />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Secondary Color</label>
                <input type="color" id="team-color2" class="input" style="height: 42px; padding: 2px;" value="#3a0ca3" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Home Ground</label>
                <input type="text" id="team-ground" class="input" placeholder="e.g. Phoenix Arena" />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Manager</label>
                <input type="text" id="team-manager" class="input" placeholder="e.g. Carlos Rivera" />
              </div>
            </div>

            <div>
              <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Description / History</label>
              <textarea id="team-desc" class="input" rows="2" placeholder="Brief info about the squad..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
              <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" id="modal-submit">Save Team</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  attachAdminHeaderEvents(container);

  let teams = await getTeams();
  const loading = container.querySelector('#teams-loading');
  const content = container.querySelector('#teams-content');
  const tbody = container.querySelector('#teams-tbody');
  const modal = container.querySelector('#team-modal');
  const form = container.querySelector('#team-form');
  const logoSlot = container.querySelector('#logo-picker-slot');
  let currentLogoUrl = '';

  let logoPicker = createImagePicker({
    label: 'Team Logo / Badge (Upload or URL)',
    currentUrl: '',
    onSelect: (url) => { currentLogoUrl = url; }
  });
  logoSlot.appendChild(logoPicker);

  function renderTable() {
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    if (teams.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:var(--space-8);color:var(--text-tertiary);">No teams found. Click "Add New Team" to create one!</td></tr>`;
      return;
    }

    tbody.innerHTML = teams.map(t => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            ${t.logoUrl ? `<img src="${t.logoUrl}" style="width:36px;height:36px;border-radius:var(--radius-md);object-fit:cover;" />` : createTeamLogo(t, 'sm')}
          </div>
        </td>
        <td style="font-weight: var(--weight-semibold);">${t.name}</td>
        <td><span class="badge badge-blue">${t.shortName || '—'}</span></td>
        <td>📍 ${t.homeGround || '—'}</td>
        <td>👔 ${t.manager || '—'}</td>
        <td>${t.wins || 0}W - ${t.draws || 0}D - ${t.losses || 0}L</td>
        <td style="text-align: right;">
          <button class="btn btn-ghost btn-sm edit-team-btn" data-id="${t.id}">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm delete-team-btn" data-id="${t.id}" style="color: var(--accent-red);">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Attach row events
    tbody.querySelectorAll('.edit-team-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.delete-team-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const target = teams.find(t => t.id === id);
        if (confirm(`Are you sure you want to delete ${target?.name || 'this team'}?`)) {
          btn.textContent = '...';
          await teamsService.delete(id);
          teams = teams.filter(t => t.id !== id);
          renderTable();
        }
      });
    });
  }

  function openModal(teamId = null) {
    modal.style.display = 'flex';
    form.reset();
    currentLogoUrl = '';

    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      container.querySelector('#modal-title').textContent = 'Edit Team';
      container.querySelector('#team-id').value = team.id;
      container.querySelector('#team-name').value = team.name || '';
      container.querySelector('#team-short').value = team.shortName || '';
      container.querySelector('#team-emoji').value = team.emoji || '⚽';
      container.querySelector('#team-color1').value = team.colors?.[0] || '#4361ee';
      container.querySelector('#team-color2').value = team.colors?.[1] || '#3a0ca3';
      container.querySelector('#team-ground').value = team.homeGround || '';
      container.querySelector('#team-manager').value = team.manager || '';
      container.querySelector('#team-desc').value = team.description || '';
      currentLogoUrl = team.logoUrl || '';
    } else {
      container.querySelector('#modal-title').textContent = 'Create New Team';
      container.querySelector('#team-id').value = '';
    }

    // Refresh logo picker
    logoSlot.innerHTML = '';
    logoPicker = createImagePicker({
      label: 'Team Logo / Badge (Upload or URL)',
      currentUrl: currentLogoUrl,
      onSelect: (url) => { currentLogoUrl = url; }
    });
    logoSlot.appendChild(logoPicker);
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  container.querySelector('#add-team-btn').addEventListener('click', () => openModal());
  container.querySelector('#modal-close').addEventListener('click', closeModal);
  container.querySelector('#modal-cancel').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = container.querySelector('#team-id').value;
    const name = container.querySelector('#team-name').value.trim();
    const shortName = container.querySelector('#team-short').value.trim().toUpperCase();
    const emoji = container.querySelector('#team-emoji').value.trim() || '⚽';
    const c1 = container.querySelector('#team-color1').value;
    const c2 = container.querySelector('#team-color2').value;
    const homeGround = container.querySelector('#team-ground').value.trim();
    const manager = container.querySelector('#team-manager').value.trim();
    const description = container.querySelector('#team-desc').value.trim();

    const teamData = {
      name,
      shortName,
      emoji,
      colors: [c1, c2],
      gradientColor: `linear-gradient(135deg, ${c1}, ${c2})`,
      homeGround: homeGround || 'Stadium Ground',
      manager: manager || 'Head Coach',
      founded: new Date().getFullYear().toString(),
      description,
      logoUrl: currentLogoUrl || '',
      wins: 0,
      draws: 0,
      losses: 0,
      updatedAt: new Date().toISOString()
    };

    try {
      if (id) {
        await teamsService.update(id, teamData);
        const idx = teams.findIndex(t => t.id === id);
        if (idx !== -1) teams[idx] = { ...teams[idx], ...teamData };
      } else {
        const newId = `team-${Date.now()}`;
        teamData.id = newId;
        teamData.createdAt = new Date().toISOString();
        await teamsService.create(teamData);
        teams.push(teamData);
      }

      closeModal();
      renderTable();
    } catch (err) {
      alert('Failed to save team: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Team';
    }
  });

  renderTable();
}
