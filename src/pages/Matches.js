// ============================================
// MATCHES PAGE
// ============================================
import { getMatches, getPlayers, getTeams, getTeamById, getPlayerById, formatDate } from '../data/dataService.js';
import { createMatchCard, createTeamLogo } from '../components/UIComponents.js';

export async function renderMatches(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="container page-header-content">
        <h1 class="page-title animate-fade-in-up">Matches</h1>
        <p class="page-description animate-fade-in-up" style="animation-delay: 0.1s;">
          All results and upcoming fixtures in one place.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div style="min-height: 200px; display: flex; align-items: center; justify-content: center;" id="matches-loading">
          <div class="empty-state">
            <div class="empty-state-icon">⚽</div>
            <h3>Loading fixtures & results...</h3>
          </div>
        </div>

        <div id="matches-content" style="display:none;">
          <!-- Tabs -->
          <div class="tabs animate-fade-in-up" style="margin-bottom:var(--space-8);" id="match-tabs">
            <button class="tab active" data-tab="all">All (<span id="count-all">0</span>)</button>
            <button class="tab" data-tab="results">Results (<span id="count-results">0</span>)</button>
            <button class="tab" data-tab="upcoming">Upcoming (<span id="count-upcoming">0</span>)</button>
            <button class="tab" data-tab="friendly">Friendlies</button>
            <button class="tab" data-tab="tournament">Tournament</button>
          </div>

          <!-- Match List -->
          <div class="grid-auto stagger-children" id="matches-grid"></div>
        </div>
      </div>
    </section>
  `;

  const [matches, players, teams] = await Promise.all([getMatches(), getPlayers(), getTeams()]);
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));

  const completed = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));
  const upcoming = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));

  const loading = container.querySelector('#matches-loading');
  const content = container.querySelector('#matches-content');
  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'block';

  const countAll = container.querySelector('#count-all');
  const countResults = container.querySelector('#count-results');
  const countUpcoming = container.querySelector('#count-upcoming');
  if (countAll) countAll.textContent = matches.length;
  if (countResults) countResults.textContent = completed.length;
  if (countUpcoming) countUpcoming.textContent = upcoming.length;

  const grid = container.querySelector('#matches-grid');
  if (grid) {
    grid.innerHTML = matches.sort((a, b) => new Date(b.date) - new Date(a.date)).map(m => createMatchCardExpanded(m, teamMap, playerMap)).join('');
  }

  // Tab switching
  const tabs = container.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.tab;
      let filtered;

      switch (filter) {
        case 'results':
          filtered = completed;
          break;
        case 'upcoming':
          filtered = upcoming;
          break;
        case 'friendly':
          filtered = matches.filter(m => m.type === 'friendly').sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'tournament':
          filtered = matches.filter(m => m.type === 'tournament').sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        default:
          filtered = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      if (grid) {
        grid.innerHTML = filtered.map(m => createMatchCardExpanded(m, teamMap, playerMap)).join('');
      }
    });
  });
}

function createMatchCardExpanded(match, teamMap = {}, playerMap = {}) {
  const homeTeam = teamMap[match.homeTeam] || getTeamById(match.homeTeam) || { name: 'Home Team', emoji: '⚽', gradientColor: 'linear-gradient(135deg, #333, #666)' };
  const awayTeam = teamMap[match.awayTeam] || getTeamById(match.awayTeam) || { name: 'Away Team', emoji: '⚽', gradientColor: 'linear-gradient(135deg, #333, #666)' };
  const isCompleted = match.status === 'completed';

  const statusBadge = isCompleted
    ? `<span class="badge badge-green">Full Time</span>`
    : `<span class="badge badge-amber">Upcoming</span>`;

  const typeBadge = match.type === 'tournament'
    ? `<span class="badge badge-purple">🏆 Tournament</span>`
    : `<span class="badge badge-blue">🤝 Friendly</span>`;

  // Scorers list for completed matches
  let scorersList = '';
  if (isCompleted && match.scorers && match.scorers.length > 0) {
    const homeScorers = match.scorers
      .filter(s => {
        const player = playerMap[s.playerId] || getPlayerById(s.playerId);
        return player && player.teamId === match.homeTeam;
      })
      .map(s => {
        const player = playerMap[s.playerId] || getPlayerById(s.playerId);
        return `${player.name} ${s.minute}'`;
      });

    const awayScorers = match.scorers
      .filter(s => {
        const player = playerMap[s.playerId] || getPlayerById(s.playerId);
        return player && player.teamId === match.awayTeam;
      })
      .map(s => {
        const player = playerMap[s.playerId] || getPlayerById(s.playerId);
        return `${player.name} ${s.minute}'`;
      });

    scorersList = `
      <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-secondary);display:flex;justify-content:space-between;gap:var(--space-4);">
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-align:left;">
          ${homeScorers.map(s => `<div>⚽ ${s}</div>`).join('')}
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-align:right;">
          ${awayScorers.map(s => `<div>${s} ⚽</div>`).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="match-card">
      <div class="match-card-header">
        ${typeBadge}
        ${statusBadge}
      </div>
      <div class="match-card-body">
        <div class="match-team">
          ${createTeamLogo(homeTeam)}
          <span class="match-team-name">${homeTeam.name}</span>
        </div>
        <div class="match-score-section">
          ${isCompleted
            ? `<div class="match-score">
                <span style="color:${match.homeScore > match.awayScore ? 'var(--accent-green)' : match.homeScore < match.awayScore ? 'var(--accent-red)' : 'var(--text-primary)'}">${match.homeScore}</span>
                <span class="match-score-divider">-</span>
                <span style="color:${match.awayScore > match.homeScore ? 'var(--accent-green)' : match.awayScore < match.homeScore ? 'var(--accent-red)' : 'var(--text-primary)'}">${match.awayScore}</span>
              </div>`
            : `<div style="text-align:center;">
                <div style="font-size:var(--text-2xl);font-weight:800;color:var(--text-primary);font-family:var(--font-heading);">VS</div>
                <div style="font-size:var(--text-sm);color:var(--accent-amber);font-weight:var(--weight-semibold);">${match.time || '18:00'}</div>
              </div>`
          }
        </div>
        <div class="match-team">
          ${createTeamLogo(awayTeam)}
          <span class="match-team-name">${awayTeam.name}</span>
        </div>
      </div>
      ${scorersList}
      <div class="match-card-footer">
        <span>📅 ${formatDate(match.date)}</span>
        <span>📍 ${match.venue || 'Stadium'}</span>
      </div>
    </div>
  `;
}

