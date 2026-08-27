// ============================================
// ADMIN MATCH CENTER & SCORE UPDATER
// ============================================

import { getCurrentUser } from './AdminAuth.js';
import { renderAdminHeader, attachAdminHeaderEvents } from './AdminLayout.js';
import { getMatches, getTeams, getPlayers, getTournaments, matchesService, standingsService, formatDate } from '../../data/dataService.js';

export async function renderAdminMatches(container) {
  const user = getCurrentUser();
  if (!user) {
    window.location.hash = '#/admin/login';
    return;
  }

  container.innerHTML = `
    ${renderAdminHeader('matches')}
    <div class="container section animate-fade-in-up">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);">
        <div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--weight-bold);">Match Center & Live Scores</h2>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">Schedule fixtures, enter live scores, and log goal scorers</p>
        </div>
        <button id="add-match-btn" class="btn btn-primary">➕ Schedule New Match</button>
      </div>

      <div id="matches-loading" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state">
          <div class="empty-state-icon">⚽</div>
          <h3>Loading matches from Firestore...</h3>
        </div>
      </div>

      <div id="matches-content" style="display: none;">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Home Team</th>
                <th>Score</th>
                <th>Away Team</th>
                <th>Date & Time</th>
                <th>Competition</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="matches-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Match Modal -->
      <div id="match-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: var(--space-4);">
        <div class="card" style="width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; padding: var(--space-8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h3 id="match-modal-title">Schedule Fixture</h3>
            <button id="match-modal-close" style="background: none; border: none; font-size: 1.5rem; color: var(--text-tertiary); cursor: pointer;">✕</button>
          </div>

          <form id="match-form" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <input type="hidden" id="match-id" />

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Home Team *</label>
                <select id="match-home-team" class="input" required></select>
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Away Team *</label>
                <select id="match-away-team" class="input" required></select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Date *</label>
                <input type="date" id="match-date" class="input" required />
              </div>
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Kickoff Time</label>
                <input type="time" id="match-time" class="input" value="18:00" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div>
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Match Type</label>
                <select id="match-type" class="input">
                  <option value="tournament">Tournament Match</option>
                  <option value="friendly">Friendly Match</option>
                </select>
              </div>
              <div id="tourney-select-group">
                <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Tournament</label>
                <select id="match-tourney" class="input"></select>
              </div>
            </div>

            <div>
              <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Venue / Stadium</label>
              <input type="text" id="match-venue" class="input" placeholder="e.g. Phoenix Arena" />
            </div>

            <!-- Result & Score Section -->
            <div style="padding: var(--space-4); background: var(--bg-tertiary); border-radius: var(--radius-lg);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                <h4 style="font-size: var(--text-sm);">⚽ Match Result & Status</h4>
                <select id="match-status" class="input" style="width: auto; padding: var(--space-1) var(--space-3); font-size: var(--text-xs);">
                  <option value="upcoming">Upcoming</option>
                  <option value="live">🔴 Live Now</option>
                  <option value="completed">Full Time (Completed)</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">Home Score</label>
                  <input type="number" id="match-home-score" class="input" placeholder="0" min="0" />
                </div>
                <div>
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary);">Away Score</label>
                  <input type="number" id="match-away-score" class="input" placeholder="0" min="0" />
                </div>
              </div>

              <div style="margin-top: var(--space-4);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                  <label style="font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Goal Scorers</label>
                  <button type="button" class="btn btn-ghost btn-sm" id="add-scorer-btn">➕ Add Goal</button>
                </div>
                <div id="scorers-container" style="display: flex; flex-direction: column; gap: var(--space-2);"></div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
              <button type="button" class="btn btn-ghost" id="match-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" id="match-modal-submit">Save Match & Update Standings</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  attachAdminHeaderEvents(container);

  const [matches, teams, players, tournaments] = await Promise.all([
    getMatches(),
    getTeams(),
    getPlayers(),
    getTournaments()
  ]);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));
  const tourneyMap = Object.fromEntries(tournaments.map(t => [t.id, t]));

  const loading = container.querySelector('#matches-loading');
  const content = container.querySelector('#matches-content');
  const tbody = container.querySelector('#matches-tbody');
  const modal = container.querySelector('#match-modal');
  const form = container.querySelector('#match-form');
  const homeSelect = container.querySelector('#match-home-team');
  const awaySelect = container.querySelector('#match-away-team');
  const tourneySelect = container.querySelector('#match-tourney');
  const scorersContainer = container.querySelector('#scorers-container');

  // Populate options
  const teamOptions = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  homeSelect.innerHTML = teamOptions;
  awaySelect.innerHTML = teamOptions;
  if (teams.length > 1) awaySelect.selectedIndex = 1;

  tourneySelect.innerHTML = tournaments.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

  let matchList = [...matches];

  function renderTable() {
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    if (matchList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:var(--space-8);color:var(--text-tertiary);">No matches recorded. Click "Schedule New Match" to create one.</td></tr>`;
      return;
    }

    matchList.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = matchList.map(m => {
      const home = teamMap[m.homeTeam] || { name: m.homeTeam };
      const away = teamMap[m.awayTeam] || { name: m.awayTeam };
      const tourney = tourneyMap[m.tournamentId] || {};

      let statusBadge = `<span class="badge badge-amber">Upcoming</span>`;
      if (m.status === 'live') statusBadge = `<span class="badge badge-red">🔴 Live</span>`;
      if (m.status === 'completed') statusBadge = `<span class="badge badge-green">Full Time</span>`;

      return `
        <tr>
          <td>${statusBadge}</td>
          <td style="font-weight: var(--weight-bold);">${home.name}</td>
          <td style="font-family: var(--font-heading); font-size: var(--text-lg); font-weight: var(--weight-extrabold);">
            ${m.status === 'upcoming' ? 'VS' : `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`}
          </td>
          <td style="font-weight: var(--weight-bold);">${away.name}</td>
          <td>📅 ${formatDate(m.date)} ${m.time ? `(${m.time})` : ''}</td>
          <td>${m.type === 'tournament' ? `🏆 ${tourney.name || 'Tournament'}` : '🤝 Friendly'}</td>
          <td style="text-align: right;">
            <button class="btn btn-ghost btn-sm edit-match-btn" data-id="${m.id}">✏️ Edit / Score</button>
            <button class="btn btn-ghost btn-sm delete-match-btn" data-id="${m.id}" style="color: var(--accent-red);">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-match-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.delete-match-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Delete this match fixture?')) {
          btn.textContent = '...';
          await matchesService.delete(id);
          matchList = matchList.filter(m => m.id !== id);
          renderTable();
        }
      });
    });
  }

  function addScorerRow(selectedPlayerId = '', minute = '') {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: var(--space-2); align-items: center;';

    const playerOpts = players.map(p => `
      <option value="${p.id}" ${p.id === selectedPlayerId ? 'selected' : ''}>${p.name} (#${p.jerseyNumber}) - ${teamMap[p.teamId]?.shortName || ''}</option>
    `).join('');

    row.innerHTML = `
      <select class="input scorer-player" style="flex: 2; padding: var(--space-2); font-size: var(--text-xs);">
        <option value="">Select Scorer...</option>
        ${playerOpts}
      </select>
      <input type="number" class="input scorer-min" placeholder="Min (e.g. 45)" value="${minute}" min="1" max="120" style="flex: 1; padding: var(--space-2); font-size: var(--text-xs);" />
      <button type="button" class="btn btn-ghost btn-sm remove-scorer-btn" style="color: var(--accent-red); padding: var(--space-2);">✕</button>
    `;

    row.querySelector('.remove-scorer-btn').addEventListener('click', () => row.remove());
    scorersContainer.appendChild(row);
  }

  container.querySelector('#add-scorer-btn').addEventListener('click', () => addScorerRow());

  function openModal(matchId = null) {
    modal.style.display = 'flex';
    form.reset();
    scorersContainer.innerHTML = '';

    if (matchId) {
      const m = matchList.find(x => x.id === matchId);
      if (!m) return;

      container.querySelector('#match-modal-title').textContent = 'Edit Match & Record Result';
      container.querySelector('#match-id').value = m.id;
      homeSelect.value = m.homeTeam || '';
      awaySelect.value = m.awayTeam || '';
      container.querySelector('#match-date').value = m.date || '';
      container.querySelector('#match-time').value = m.time || '18:00';
      container.querySelector('#match-type').value = m.type || 'tournament';
      tourneySelect.value = m.tournamentId || tournaments[0]?.id || '';
      container.querySelector('#match-venue').value = m.venue || '';
      container.querySelector('#match-status').value = m.status || 'upcoming';
      container.querySelector('#match-home-score').value = m.homeScore ?? '';
      container.querySelector('#match-away-score').value = m.awayScore ?? '';

      if (m.scorers && Array.isArray(m.scorers)) {
        m.scorers.forEach(s => addScorerRow(s.playerId, s.minute));
      }
    } else {
      container.querySelector('#match-modal-title').textContent = 'Schedule New Match';
      container.querySelector('#match-id').value = '';
      container.querySelector('#match-date').value = new Date().toISOString().split('T')[0];
    }
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  container.querySelector('#add-match-btn').addEventListener('click', () => openModal());
  container.querySelector('#match-modal-close').addEventListener('click', closeModal);
  container.querySelector('#match-modal-cancel').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#match-modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = container.querySelector('#match-id').value;
    const homeTeam = homeSelect.value;
    const awayTeam = awaySelect.value;

    if (homeTeam === awayTeam) {
      alert('Home team and Away team cannot be the same!');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Match & Update Standings';
      return;
    }

    const date = container.querySelector('#match-date').value;
    const time = container.querySelector('#match-time').value;
    const type = container.querySelector('#match-type').value;
    const tournamentId = type === 'tournament' ? tourneySelect.value : null;
    const venue = container.querySelector('#match-venue').value.trim() || 'Arena';
    const status = container.querySelector('#match-status').value;
    const homeScore = status === 'upcoming' ? null : Number(container.querySelector('#match-home-score').value) || 0;
    const awayScore = status === 'upcoming' ? null : Number(container.querySelector('#match-away-score').value) || 0;

    // Collect scorers
    const scorers = [];
    scorersContainer.querySelectorAll('div').forEach(row => {
      const pId = row.querySelector('.scorer-player')?.value;
      const min = Number(row.querySelector('.scorer-min')?.value) || 1;
      if (pId) {
        scorers.push({ playerId: pId, minute: min });
      }
    });

    const matchData = {
      homeTeam,
      awayTeam,
      date,
      time,
      type,
      tournamentId,
      venue,
      status,
      homeScore,
      awayScore,
      scorers,
      updatedAt: new Date().toISOString()
    };

    try {
      if (id) {
        await matchesService.update(id, matchData);
        const idx = matchList.findIndex(m => m.id === id);
        if (idx !== -1) matchList[idx] = { ...matchList[idx], ...matchData };
      } else {
        const newId = `match-${Date.now()}`;
        matchData.id = newId;
        matchData.createdAt = new Date().toISOString();
        await matchesService.create(matchData);
        matchList.push(matchData);
      }

      // If tournament match and completed, automatically update standings table!
      if (tournamentId) {
        await standingsService.recalculateForTournament(tournamentId);
      }

      closeModal();
      renderTable();
    } catch (err) {
      alert('Failed to save match: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Match & Update Standings';
    }
  });

  renderTable();
}
