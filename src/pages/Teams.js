// ============================================
// TEAMS PAGE
// ============================================
import { teams, getPlayersByTeam, getTeamById } from '../data/mockData.js';
import { createTeamCard, createTeamLogo, createPlayerCard, createSectionHeader } from '../components/UIComponents.js';

export function renderTeams(container, params) {
  // If viewing a specific team
  if (params && params.id) {
    renderTeamDetail(container, params.id);
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
        <div class="grid-3 stagger-children" id="teams-grid">
          ${teams.map(t => createTeamCard(t)).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderTeamDetail(container, teamId) {
  const team = getTeamById(teamId);
  if (!team) {
    container.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Team not found</h3></div></div>`;
    return;
  }

  const teamPlayers = getPlayersByTeam(teamId);
  const totalGoals = teamPlayers.reduce((sum, p) => sum + p.stats.goals, 0);
  const totalAssists = teamPlayers.reduce((sum, p) => sum + p.stats.assists, 0);

  container.innerHTML = `
    <div class="page-header" style="padding-bottom: var(--space-16);">
      <div class="container page-header-content">
        <a href="#/teams" class="btn btn-ghost animate-fade-in-up" style="margin-bottom:var(--space-4);">← Back to Teams</a>
        <div style="display:flex;align-items:center;gap:var(--space-6);flex-wrap:wrap;" class="animate-fade-in-up" style="animation-delay:0.1s;">
          ${createTeamLogo(team, 'xl')}
          <div>
            <h1 class="page-title">${team.name}</h1>
            <p class="page-description">${team.description}</p>
            <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);flex-wrap:wrap;">
              <span class="badge badge-green">📍 ${team.homeGround}</span>
              <span class="badge badge-blue">📅 Est. ${team.founded}</span>
              <span class="badge badge-amber">👔 ${team.manager}</span>
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
            <div class="stat-value">${team.wins}</div>
            <div class="stat-label">Wins</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value">${team.draws}</div>
            <div class="stat-label">Draws</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value">${team.losses}</div>
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
