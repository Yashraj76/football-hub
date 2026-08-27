// ============================================
// STANDINGS PAGE
// ============================================
import { getStandings, getTournaments, getPlayers, getTeams, getTopScorers, getTopAssists, getTeamById } from '../data/dataService.js';
import { createStandingsTable, createTeamLogo } from '../components/UIComponents.js';

export async function renderStandings(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="container page-header-content">
        <h1 class="page-title animate-fade-in-up">Standings</h1>
        <p class="page-description animate-fade-in-up" style="animation-delay: 0.1s;">
          Live league tables and top performer rankings.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div style="min-height: 200px; display: flex; align-items: center; justify-content: center;" id="standings-loading">
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <h3>Loading standings & rankings...</h3>
          </div>
        </div>

        <div id="standings-content" style="display:none;">
          <!-- Tournament Selector Tabs -->
          <div class="tabs animate-fade-in-up" style="margin-bottom:var(--space-8);" id="standings-tabs"></div>

          <!-- Standings Table -->
          <div class="animate-fade-in-up" id="standings-container"></div>

          <!-- Player Rankings -->
          <div class="grid-2" style="margin-top:var(--space-12);" id="rankings-container"></div>

          <!-- Team Stats Comparison -->
          <div style="margin-top:var(--space-12);" id="overview-container"></div>
        </div>
      </div>
    </section>
  `;

  const [tournaments, topScorers, topAssists, teams] = await Promise.all([
    getTournaments(),
    getTopScorers(10),
    getTopAssists(10),
    getTeams()
  ]);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const activeTournaments = tournaments.filter(t => t.status === 'ongoing' || t.status === 'completed');
  const initialTourneyId = activeTournaments.length > 0 ? activeTournaments[0].id : 'tournament-1';
  let initialStandings = await getStandings(initialTourneyId);

  const loading = container.querySelector('#standings-loading');
  const content = container.querySelector('#standings-content');
  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'block';

  // Render Tabs
  const tabsContainer = container.querySelector('#standings-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = activeTournaments.map((t, i) => `
      <button class="tab ${i === 0 ? 'active' : ''}" data-tournament="${t.id}">${t.emoji || '🏆'} ${t.name}</button>
    `).join('');
  }

  // Render Standings Table
  const standingsContainer = container.querySelector('#standings-container');
  if (standingsContainer) {
    standingsContainer.innerHTML = initialStandings.length > 0 
      ? createStandingsTable(initialStandings) 
      : '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>No standings available</h3></div>';
  }

  // Render Rankings
  const rankingsContainer = container.querySelector('#rankings-container');
  if (rankingsContainer) {
    rankingsContainer.innerHTML = `
      <!-- Top Scorers -->
      <div class="card animate-fade-in-up">
        <h3 style="margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-2);">
          🎯 Top Scorers
        </h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-1);">
          ${topScorers.map((p, i) => {
            const team = teamMap[p.teamId] || getTeamById(p.teamId) || { name: 'Team', shortName: 'TM', gradientColor: 'linear-gradient(135deg, #333, #666)' };
            return `
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);cursor:pointer;transition:background 0.2s;" 
                   onmouseover="this.style.background='var(--bg-card-hover)'" 
                   onmouseout="this.style.background='transparent'"
                   onclick="window.location.hash='#/players/${p.id}'">
                <span style="width:24px;font-weight:var(--weight-bold);color:${i < 3 ? 'var(--accent-green)' : 'var(--text-tertiary)'};font-size:var(--text-sm);">${i + 1}</span>
                <div style="width:36px;height:36px;border-radius:var(--radius-full);background:${team.gradientColor};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
                  ${p.avatar || '⚽'}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${team.shortName || team.name}</div>
                </div>
                <div style="font-family:var(--font-heading);font-size:var(--text-xl);font-weight:var(--weight-extrabold);color:var(--accent-green);">${(p.stats && p.stats.goals) || 0}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Top Assists -->
      <div class="card animate-fade-in-up" style="animation-delay:0.15s;">
        <h3 style="margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-2);">
          🅰️ Top Assists
        </h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-1);">
          ${topAssists.map((p, i) => {
            const team = teamMap[p.teamId] || getTeamById(p.teamId) || { name: 'Team', shortName: 'TM', gradientColor: 'linear-gradient(135deg, #333, #666)' };
            return `
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);cursor:pointer;transition:background 0.2s;"
                   onmouseover="this.style.background='var(--bg-card-hover)'"
                   onmouseout="this.style.background='transparent'"
                   onclick="window.location.hash='#/players/${p.id}'">
                <span style="width:24px;font-weight:var(--weight-bold);color:${i < 3 ? 'var(--accent-blue)' : 'var(--text-tertiary)'};font-size:var(--text-sm);">${i + 1}</span>
                <div style="width:36px;height:36px;border-radius:var(--radius-full);background:${team.gradientColor};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
                  ${p.avatar || '⚽'}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${team.shortName || team.name}</div>
                </div>
                <div style="font-family:var(--font-heading);font-size:var(--text-xl);font-weight:var(--weight-extrabold);color:var(--accent-blue);">${(p.stats && p.stats.assists) || 0}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Render Team Overview
  function renderOverview(standingsList) {
    const overviewContainer = container.querySelector('#overview-container');
    if (!overviewContainer) return;
    overviewContainer.innerHTML = `
      <h3 style="margin-bottom:var(--space-6);">Team Overview</h3>
      <div class="grid-3 stagger-children">
        ${standingsList.map(s => {
          const team = teamMap[s.teamId] || getTeamById(s.teamId) || { name: 'Team', emoji: '⚽', gradientColor: 'linear-gradient(135deg, #333, #666)' };
          const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
          return `
            <div class="card" style="cursor:pointer;" onclick="window.location.hash='#/teams/${team.id || s.teamId}'">
              <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
                ${createTeamLogo(team)}
                <div>
                  <div style="font-weight:var(--weight-bold);">${team.name}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.points} points</div>
                </div>
              </div>
              <div style="margin-bottom:var(--space-3);">
                <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-1);">
                  <span>Win Rate</span>
                  <span style="font-weight:var(--weight-bold);color:var(--text-primary);">${winRate}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${winRate}%;"></div>
                </div>
              </div>
              <div style="display:flex;gap:var(--space-2);justify-content:center;">
                ${(s.form || []).map(f => {
                  const cls = f === 'W' ? 'win' : f === 'D' ? 'draw' : 'loss';
                  return `<span class="form-dot ${cls}">${f}</span>`;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderOverview(initialStandings);

  // Tab switching
  const tabs = container.querySelectorAll('#standings-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tournamentId = tab.dataset.tournament;
      const filtered = await getStandings(tournamentId);
      if (standingsContainer) {
        if (filtered.length > 0) {
          standingsContainer.innerHTML = createStandingsTable(filtered);
        } else {
          standingsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>No standings for this tournament</h3></div>';
        }
      }
      renderOverview(filtered);
    });
  });
}

