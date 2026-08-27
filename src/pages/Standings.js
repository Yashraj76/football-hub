// ============================================
// STANDINGS PAGE
// ============================================
import { standings, tournaments, players, getTeamById, getTopScorers, getTopAssists } from '../data/mockData.js';
import { createStandingsTable, createTeamLogo } from '../components/UIComponents.js';

export function renderStandings(container) {
  const activeTournaments = tournaments.filter(t => t.status === 'ongoing' || t.status === 'completed');
  const topScorers = getTopScorers(10);
  const topAssists = getTopAssists(10);

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
        <!-- Tournament Selector Tabs -->
        <div class="tabs animate-fade-in-up" style="margin-bottom:var(--space-8);" id="standings-tabs">
          ${activeTournaments.map((t, i) => `
            <button class="tab ${i === 0 ? 'active' : ''}" data-tournament="${t.id}">${t.emoji} ${t.name}</button>
          `).join('')}
        </div>

        <!-- Standings Table -->
        <div class="animate-fade-in-up" id="standings-container">
          ${standings.length > 0 ? createStandingsTable(standings) : '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>No standings available</h3></div>'}
        </div>

        <!-- Player Rankings -->
        <div class="grid-2" style="margin-top:var(--space-12);">
          <!-- Top Scorers -->
          <div class="card animate-fade-in-up">
            <h3 style="margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-2);">
              🎯 Top Scorers
            </h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-1);">
              ${topScorers.map((p, i) => {
                const team = getTeamById(p.teamId);
                return `
                  <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);cursor:pointer;transition:background 0.2s;" 
                       onmouseover="this.style.background='var(--bg-card-hover)'" 
                       onmouseout="this.style.background='transparent'"
                       onclick="window.location.hash='#/players/${p.id}'">
                    <span style="width:24px;font-weight:var(--weight-bold);color:${i < 3 ? 'var(--accent-green)' : 'var(--text-tertiary)'};font-size:var(--text-sm);">${i + 1}</span>
                    <div style="width:36px;height:36px;border-radius:var(--radius-full);background:${team.gradientColor};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
                      ${p.avatar}
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${team.shortName}</div>
                    </div>
                    <div style="font-family:var(--font-heading);font-size:var(--text-xl);font-weight:var(--weight-extrabold);color:var(--accent-green);">${p.stats.goals}</div>
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
                const team = getTeamById(p.teamId);
                return `
                  <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);cursor:pointer;transition:background 0.2s;"
                       onmouseover="this.style.background='var(--bg-card-hover)'"
                       onmouseout="this.style.background='transparent'"
                       onclick="window.location.hash='#/players/${p.id}'">
                    <span style="width:24px;font-weight:var(--weight-bold);color:${i < 3 ? 'var(--accent-blue)' : 'var(--text-tertiary)'};font-size:var(--text-sm);">${i + 1}</span>
                    <div style="width:36px;height:36px;border-radius:var(--radius-full);background:${team.gradientColor};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
                      ${p.avatar}
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${team.shortName}</div>
                    </div>
                    <div style="font-family:var(--font-heading);font-size:var(--text-xl);font-weight:var(--weight-extrabold);color:var(--accent-blue);">${p.stats.assists}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Team Stats Comparison -->
        <div style="margin-top:var(--space-12);">
          <h3 style="margin-bottom:var(--space-6);">Team Overview</h3>
          <div class="grid-3 stagger-children">
            ${standings.map(s => {
              const team = getTeamById(s.teamId);
              const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
              return `
                <div class="card" style="cursor:pointer;" onclick="window.location.hash='#/teams/${team.id}'">
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
                    ${s.form.map(f => {
                      const cls = f === 'W' ? 'win' : f === 'D' ? 'draw' : 'loss';
                      return `<span class="form-dot ${cls}">${f}</span>`;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </section>
  `;

  // Tab switching
  const tabs = container.querySelectorAll('#standings-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tournamentId = tab.dataset.tournament;
      const filtered = standings.filter(s => s.tournamentId === tournamentId);
      const standingsContainer = container.querySelector('#standings-container');
      if (filtered.length > 0) {
        standingsContainer.innerHTML = createStandingsTable(filtered);
      } else {
        standingsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>No standings for this tournament</h3></div>';
      }
    });
  });
}
