// ============================================
// TEAMS PAGE
// ============================================
import { getTeams, getTeamById, getPlayersByTeam } from '../data/dataService.js';
import { createTeamCard, createTeamLogo, createPlayerCard, createSectionHeader } from '../components/UIComponents.js';

export async function renderTeams(container, params) {
  // If viewing a specific team
  if (params && params.id) {
    await renderTeamDetail(container, params.id);
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="container page-header-content">
        <h1 class="page-title animate-fade-in-up">Teams</h1>
        <p class="page-description animate-fade-in-up" style="animation-delay: 0.1s;">
          Meet the competing squads battling for glory on the pitch.
        </p>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div style="min-height: 200px; display: flex; align-items: center; justify-content: center;" id="teams-loading">
          <div class="empty-state">
            <div class="empty-state-icon">🛡️</div>
            <h3>Loading teams...</h3>
          </div>
        </div>
        <div class="grid-3 stagger-children" id="teams-grid" style="display:none;"></div>
      </div>
    </section>
  `;

  const teams = await getTeams();
  const loading = container.querySelector('#teams-loading');
  const grid = container.querySelector('#teams-grid');

  if (loading) loading.style.display = 'none';
  if (grid) {
    grid.style.display = 'grid';
    grid.innerHTML = teams.map(t => createTeamCard(t)).join('');
  }
}

async function renderTeamDetail(container, teamId) {
  container.innerHTML = `
    <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
      <div class="empty-state">
        <div class="empty-state-icon">🛡️</div>
        <h3>Loading team details...</h3>
      </div>
    </div>
  `;

  const [team, teamPlayers] = await Promise.all([
    getTeamById(teamId),
    getPlayersByTeam(teamId)
  ]);

  if (!team) {
    container.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Team not found</h3></div></div>`;
    return;
  }

  const totalGoals = teamPlayers.reduce((sum, p) => sum + ((p.stats && p.stats.goals) || 0), 0);

  container.innerHTML = `
    <div class="page-header" style="padding-bottom: var(--space-16);">
      <div class="container page-header-content">
        <a href="#/teams" class="btn btn-ghost animate-fade-in-up" style="margin-bottom:var(--space-4);">← Back to Teams</a>
        <div style="display:flex;align-items:center;gap:var(--space-6);flex-wrap:wrap;" class="animate-fade-in-up" style="animation-delay:0.1s;">
          ${createTeamLogo(team, 'xl')}
          <div>
            <h1 class="page-title">${team.name}</h1>
            <p class="page-description">${team.description || ''}</p>
            <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);flex-wrap:wrap;">
              <span class="badge badge-green">📍 ${team.homeGround || 'Home Ground'}</span>
              <span class="badge badge-blue">📅 Est. ${team.founded || '2020'}</span>
              <span class="badge badge-amber">👔 ${team.manager || 'Manager'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Stats -->
    <section class="section">
      <div class="container">
        <div class="grid-4 stagger-children" style="margin-bottom:var(--space-12);">
          <div class="card" style="text-align:center;">
            <div class="stat-value">${team.wins || 0}</div>
            <div class="stat-label">Wins</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value">${team.draws || 0}</div>
            <div class="stat-label">Draws</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value">${team.losses || 0}</div>
            <div class="stat-label">Losses</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value">${totalGoals}</div>
            <div class="stat-label">Total Goals</div>
          </div>
        </div>

        ${createSectionHeader('Squad', `${teamPlayers.length} players`)}
        <div class="grid-3 stagger-children">
          ${teamPlayers.map(p => createPlayerCard(p)).join('')}
        </div>
      </div>
    </section>
  `;
}

