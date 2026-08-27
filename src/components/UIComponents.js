// ============================================
// SHARED UI COMPONENTS
// ============================================
import { getTeamById as getMockTeamById, getPositionFull, formatDate, formatShortDate } from '../data/mockData.js';

// Safe Team fallback helper
function getSafeTeam(teamOrId) {
  if (typeof teamOrId === 'object' && teamOrId !== null) return teamOrId;
  return getMockTeamById(teamOrId) || {
    name: teamOrId || 'Team',
    shortName: teamOrId || 'TM',
    gradientColor: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
    emoji: '⚽'
  };
}

// Team Logo
export function createTeamLogo(teamInput, size = '') {
  const team = getSafeTeam(teamInput);
  const sizeClass = size ? `team-logo-${size}` : 'team-logo';

  if (team.logoUrl) {
    return `<div class="${sizeClass}" style="overflow:hidden;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;"><img src="${team.logoUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='${team.emoji || '⚽'}'" /></div>`;
  }
  return `<div class="${sizeClass}" style="background: ${team.gradientColor || 'linear-gradient(135deg, #4361ee, #3a0ca3)'};">${team.emoji || '⚽'}</div>`;
}

// Player Card
export function createPlayerCard(player, optionalTeam = null) {
  const team = optionalTeam || getSafeTeam(player.teamId);
  const posClass = (player.position || 'fwd').toLowerCase();
  const stats = player.stats || { goals: 0, assists: 0, appearances: 0 };

  const photoHtml = player.photoUrl
    ? `<img src="${player.photoUrl}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" onerror="this.style.display='none'" />`
    : `<span style="font-size:4rem;position:relative;z-index:1;">${player.avatar || '⚽'}</span>`;

  return `
    <div class="player-card gradient-border" onclick="window.location.hash='#/players/${player.id}'" data-player-id="${player.id}">
      <div class="player-card-image" style="background: ${team.gradientColor || 'linear-gradient(135deg, #4361ee, #3a0ca3)'}; position:relative; overflow:hidden;">
        ${photoHtml}
        <span class="player-card-jersey">#${player.jerseyNumber || 10}</span>
      </div>
      <div class="player-card-info">
        <div class="player-card-name">${player.name}</div>
        <div class="player-card-meta">
          <span class="position-badge ${posClass}">${player.position || 'FWD'}</span>
          <span style="font-size:var(--text-sm);color:var(--text-tertiary);">${player.nationality || ''} ${team.shortName || team.name}</span>
        </div>
        <div class="player-card-stats">
          <div class="player-stat-mini">
            <div class="player-stat-mini-value">${stats.goals || 0}</div>
            <div class="player-stat-mini-label">Goals</div>
          </div>
          <div class="player-stat-mini">
            <div class="player-stat-mini-value">${stats.assists || 0}</div>
            <div class="player-stat-mini-label">Assists</div>
          </div>
          <div class="player-stat-mini">
            <div class="player-stat-mini-value">${stats.appearances || 0}</div>
            <div class="player-stat-mini-label">Apps</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Match Card
export function createMatchCard(match, optionalHomeTeam = null, optionalAwayTeam = null) {
  const homeTeam = optionalHomeTeam || getSafeTeam(match.homeTeam);
  const awayTeam = optionalAwayTeam || getSafeTeam(match.awayTeam);
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';

  let statusBadge = `<span class="badge badge-amber">Upcoming</span>`;
  if (isLive) statusBadge = `<span class="badge badge-red">🔴 Live</span>`;
  if (isCompleted) statusBadge = `<span class="badge badge-green">FT</span>`;

  const typeBadge = match.type === 'tournament'
    ? `<span class="badge badge-purple">Tournament</span>`
    : `<span class="badge badge-blue">Friendly</span>`;

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
          ${isCompleted || isLive
            ? `<div class="match-score">
                <span>${match.homeScore ?? 0}</span>
                <span class="match-score-divider">-</span>
                <span>${match.awayScore ?? 0}</span>
              </div>`
            : `<div style="font-size:var(--text-sm);color:var(--text-tertiary);">
                <div style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary);">VS</div>
                <div>${match.time || '18:00'}</div>
              </div>`
          }
        </div>
        <div class="match-team">
          ${createTeamLogo(awayTeam)}
          <span class="match-team-name">${awayTeam.name}</span>
        </div>
      </div>
      <div class="match-card-footer">
        <span>📅 ${formatShortDate(match.date)}</span>
        <span>📍 ${match.venue || 'Stadium'}</span>
      </div>
    </div>
  `;
}

// Standings Table
export function createStandingsTable(standingsData, teamMap = {}) {
  const rows = standingsData.map((s, i) => {
    const team = teamMap[s.teamId] || getSafeTeam(s.teamId);
    const gd = (s.goalsFor || 0) - (s.goalsAgainst || 0);
    const formDots = (s.form || []).map(f => {
      const cls = f === 'W' ? 'win' : f === 'D' ? 'draw' : 'loss';
      return `<span class="form-dot ${cls}">${f}</span>`;
    }).join('');

    return `
      <tr>
        <td style="font-weight:var(--weight-bold);color:${i < 2 ? 'var(--accent-green)' : 'var(--text-primary)'};">${i + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            ${createTeamLogo(team, 'sm')}
            <span style="font-weight:var(--weight-semibold);">${team.name}</span>
          </div>
        </td>
        <td>${s.played || 0}</td>
        <td>${s.won || 0}</td>
        <td>${s.drawn || 0}</td>
        <td>${s.lost || 0}</td>
        <td>${s.goalsFor || 0}</td>
        <td>${s.goalsAgainst || 0}</td>
        <td style="color:${gd > 0 ? 'var(--accent-green)' : gd < 0 ? 'var(--accent-red)' : 'var(--text-secondary)'};">${gd > 0 ? '+' : ''}${gd}</td>
        <td style="font-weight:var(--weight-extrabold);font-size:var(--text-lg);">${s.points || 0}</td>
        <td>
          <div style="display:flex;gap:var(--space-1);">${formDots}</div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Stat counter with animation
export function animateCounters(container) {
  const counters = container.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'));
    let current = 0;
    const increment = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = current;
      }
    }, 30);
  });
}

// Team Card
export function createTeamCard(team) {
  const playerCount = team.playerCount || 0;

  return `
    <div class="team-card gradient-border" onclick="window.location.hash='#/teams/${team.id}'">
      <div class="team-card-logo">
        ${createTeamLogo(team, 'lg')}
      </div>
      <div class="team-card-name">${team.name}</div>
      <div class="team-card-meta">Est. ${team.founded} · ${team.homeGround}</div>
      <div class="team-card-stats">
        <div class="player-stat-mini">
          <div class="player-stat-mini-value">${team.wins}</div>
          <div class="player-stat-mini-label">Wins</div>
        </div>
        <div class="player-stat-mini">
          <div class="player-stat-mini-value">${team.draws}</div>
          <div class="player-stat-mini-label">Draws</div>
        </div>
        <div class="player-stat-mini">
          <div class="player-stat-mini-value">${team.losses}</div>
          <div class="player-stat-mini-label">Losses</div>
        </div>
      </div>
    </div>
  `;
}

// Section header
export function createSectionHeader(title, subtitle, actionText, actionLink) {
  return `
    <div class="section-header" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4);">
      <div>
        <h2 class="section-title">${title}</h2>
        ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
      </div>
      ${actionText ? `<a href="${actionLink}" class="btn btn-ghost">${actionText} →</a>` : ''}
    </div>
  `;
}
