import { waitForAuth, renderAdminAuth } from './AdminAuth.js';
import { renderAdminHeader, attachAdminHeaderEvents } from './AdminLayout.js';
import { getTournaments, getTeams, tournamentsService, standingsService, formatDate } from '../../data/dataService.js';

export async function renderAdminTournaments(container) {
  const user = await waitForAuth();
  if (!user) {
    await renderAdminAuth(container);
    return;
  }

  container.innerHTML = `
    ${renderAdminHeader('tournaments')}
    <div class="container section animate-fade-in-up">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);">
        <div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--weight-bold);">Tournaments & Leagues</h2>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">Create competitions, select participating squads, and generate league tables</p>
        </div>
        <button id="add-tourney-btn" class="btn btn-primary">➕ Create Tournament</button>
      </div>

      <div id="tourney-loading" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state">
          <div class="empty-state-icon">🏆</div>
          <h3>Loading tournaments from Firestore...</h3>
        </div>
      </div>

      <div id="tourney-content" style="display: none;">
        <div style="display: flex; flex-direction: column; gap: var(--space-6);" id="tourneys-list"></div>
      </div>

      <!-- Tournament Modal -->
      <div id="tourney-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: var(--space-4);">
        <div class="card" style="width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: var(--space-8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h3 id="tourney-modal-title">Create Competition</h3>
            <button id="tourney-modal-close" style="background: none; border: none; font-size: 1.5rem; color: var(--text-tertiary); cursor: pointer;">✕</button>
          </div>

          <form id="tourney-form" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <input type="hidden" id="tourney-id" />

            <div style="display: grid; grid-template-columns: 3fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Tournament Name *</label>
                <input type="text" id="tourney-name" class="input" placeholder="e.g. Champions Cup 2026" required />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Emoji Icon</label>
                <input type="text" id="tourney-emoji" class="input" placeholder="🏆" value="🏆" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Format</label>
                <select id="tourney-type" class="input">
                  <option value="league">📊 Round Robin League</option>
                  <option value="knockout">⚔️ Single Elimination Knockout</option>
                </select>
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Status</label>
                <select id="tourney-status" class="input">
                  <option value="ongoing">🔴 Ongoing / Live</option>
                  <option value="upcoming">📅 Upcoming</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Start Date</label>
                <input type="date" id="tourney-start" class="input" required />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">End Date</label>
                <input type="date" id="tourney-end" class="input" required />
              </div>
            </div>

            <div>
              <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase; margin-bottom: var(--space-2); display: block;">Participating Teams</label>
              <div id="teams-checkboxes" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-2); max-height: 160px; overflow-y: auto; padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-lg);"></div>
            </div>

            <div>
              <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Description</label>
              <textarea id="tourney-desc" class="input" rows="2" placeholder="Rules, prize, summary..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
              <button type="button" class="btn btn-ghost" id="tourney-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" id="tourney-modal-submit">Save Tournament</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  attachAdminHeaderEvents(container);

  const [tournaments, teams] = await Promise.all([getTournaments(), getTeams()]);
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  const loading = container.querySelector('#tourney-loading');
  const content = container.querySelector('#tourney-content');
  const list = container.querySelector('#tourneys-list');
  const modal = container.querySelector('#tourney-modal');
  const form = container.querySelector('#tourney-form');
  const checkboxes = container.querySelector('#teams-checkboxes');

  let tourneyList = [...tournaments];

  // Render team checkboxes
  checkboxes.innerHTML = teams.map(t => `
    <label style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); cursor: pointer;">
      <input type="checkbox" value="${t.id}" class="team-cb" />
      <span>${t.name}</span>
    </label>
  `).join('');

  function renderList() {
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    if (tourneyList.length === 0) {
      list.innerHTML = `<div class="empty-state"><h3>No tournaments yet. Click "Create Tournament" to start!</h3></div>`;
      return;
    }

    list.innerHTML = tourneyList.map(t => {
      const pTeams = (t.teams || []).map(id => teamMap[id]?.name || id);

      return `
        <div class="card" style="padding: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
            <div style="display: flex; align-items: center; gap: var(--space-4);">
              <div style="font-size: 2.5rem;">${t.emoji || '🏆'}</div>
              <div>
                <h3 style="font-size: var(--text-xl); font-weight: var(--weight-bold);">${t.name}</h3>
                <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-1);">${t.description || ''}</p>
                <div style="display: flex; gap: var(--space-3); margin-top: var(--space-3); font-size: var(--text-xs); color: var(--text-tertiary);">
                  <span>📅 ${formatDate(t.startDate)} - ${formatDate(t.endDate)}</span>
                  <span>👥 ${pTeams.length} Squads</span>
                  <span>📊 ${t.type === 'league' ? 'League' : 'Knockout'}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm recalc-btn" data-id="${t.id}">🔄 Sync Standings</button>
              <button class="btn btn-ghost btn-sm edit-tourney-btn" data-id="${t.id}">✏️ Edit</button>
              <button class="btn btn-ghost btn-sm delete-tourney-btn" data-id="${t.id}" style="color: var(--accent-red);">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.recalc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Syncing...';
        await standingsService.recalculateForTournament(btn.dataset.id);
        btn.textContent = '✅ Synced!';
        setTimeout(() => { btn.disabled = false; btn.textContent = '🔄 Sync Standings'; }, 2000);
      });
    });

    list.querySelectorAll('.edit-tourney-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });

    list.querySelectorAll('.delete-tourney-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Delete this tournament?')) {
          btn.textContent = '...';
          await tournamentsService.delete(id);
          tourneyList = tourneyList.filter(t => t.id !== id);
          renderList();
        }
      });
    });
  }

  function openModal(tourneyId = null) {
    modal.style.display = 'flex';
    form.reset();
    checkboxes.querySelectorAll('.team-cb').forEach(cb => { cb.checked = false; });

    if (tourneyId) {
      const t = tourneyList.find(x => x.id === tourneyId);
      if (!t) return;

      container.querySelector('#tourney-modal-title').textContent = 'Edit Tournament';
      container.querySelector('#tourney-id').value = t.id;
      container.querySelector('#tourney-name').value = t.name || '';
      container.querySelector('#tourney-emoji').value = t.emoji || '🏆';
      container.querySelector('#tourney-type').value = t.type || 'league';
      container.querySelector('#tourney-status').value = t.status || 'ongoing';
      container.querySelector('#tourney-start').value = t.startDate || '';
      container.querySelector('#tourney-end').value = t.endDate || '';
      container.querySelector('#tourney-desc').value = t.description || '';

      (t.teams || []).forEach(teamId => {
        const cb = checkboxes.querySelector(`.team-cb[value="${teamId}"]`);
        if (cb) cb.checked = true;
      });
    } else {
      container.querySelector('#tourney-modal-title').textContent = 'Create New Tournament';
      container.querySelector('#tourney-id').value = '';
      container.querySelector('#tourney-start').value = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 2);
      container.querySelector('#tourney-end').value = nextMonth.toISOString().split('T')[0];
      checkboxes.querySelectorAll('.team-cb').forEach(cb => { cb.checked = true; });
    }
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  container.querySelector('#add-tourney-btn').addEventListener('click', () => openModal());
  container.querySelector('#tourney-modal-close').addEventListener('click', closeModal);
  container.querySelector('#tourney-modal-cancel').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#tourney-modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = container.querySelector('#tourney-id').value;
    const name = container.querySelector('#tourney-name').value.trim();
    const emoji = container.querySelector('#tourney-emoji').value.trim() || '🏆';
    const type = container.querySelector('#tourney-type').value;
    const status = container.querySelector('#tourney-status').value;
    const startDate = container.querySelector('#tourney-start').value;
    const endDate = container.querySelector('#tourney-end').value;
    const description = container.querySelector('#tourney-desc').value.trim();

    const selectedTeams = Array.from(checkboxes.querySelectorAll('.team-cb:checked')).map(cb => cb.value);

    const tourneyData = {
      name,
      emoji,
      type,
      status,
      startDate,
      endDate,
      description,
      teams: selectedTeams,
      totalMatches: selectedTeams.length * (selectedTeams.length - 1),
      matchesPlayed: 0,
      updatedAt: new Date().toISOString()
    };

    try {
      if (id) {
        await tournamentsService.update(id, tourneyData);
        const idx = tourneyList.findIndex(t => t.id === id);
        if (idx !== -1) tourneyList[idx] = { ...tourneyList[idx], ...tourneyData };
      } else {
        const newId = `tournament-${Date.now()}`;
        tourneyData.id = newId;
        tourneyData.createdAt = new Date().toISOString();
        await tournamentsService.create(tourneyData);
        tourneyList.push(tourneyData);
      }

      await standingsService.recalculateForTournament(id || tourneyData.id);

      closeModal();
      renderList();
    } catch (err) {
      alert('Failed to save tournament: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Tournament';
    }
  });

  renderList();
}
