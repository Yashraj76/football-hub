// ============================================
// PLAYERS PAGE
// ============================================
import { players, getTeamById, getPlayerById, getMatchesByTeam, getPositionFull } from '../data/mockData.js';
import { createPlayerCard, createTeamLogo, createSectionHeader, animateCounters } from '../components/UIComponents.js';

export function renderPlayers(container, params) {
  // If viewing a specific player
  if (params && params.id) {
    renderPlayerDetail(container, params.id);
    return;
  }

  const positions = ['All', 'FWD', 'MID', 'DEF', 'GK'];

  container.innerHTML = `
    <div class="page-header">
      <div class="container page-header-content">
        <h1 class="page-title animate-fade-in-up">Players</h1>
        <p class="page-description animate-fade-in-up" style="animation-delay: 0.1s;">
          Discover the talented footballers competing across all teams.
        </p>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <!-- Controls -->
        <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-8);flex-wrap:wrap;align-items:center;" class="animate-fade-in-up">
          <div class="input-group" style="flex:1;min-width:250px;">
            <span class="input-icon">🔍</span>
            <input type="text" class="input" id="player-search" placeholder="Search players by name...">
          </div>
          <div class="filter-chips" id="position-filters">
            ${positions.map(pos => `
              <button class="chip ${pos === 'All' ? 'active' : ''}" data-position="${pos}">${pos === 'All' ? '👥 All' : getPositionFull(pos)}</button>
            `).join('')}
          </div>
        </div>

        <!-- Sort Options -->
        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-6);flex-wrap:wrap;" class="animate-fade-in-up">
          <span style="font-size:var(--text-sm);color:var(--text-tertiary);padding:var(--space-2) 0;">Sort by:</span>
          <button class="chip active" data-sort="goals">🎯 Goals</button>
          <button class="chip" data-sort="assists">🅰️ Assists</button>
          <button class="chip" data-sort="appearances">📋 Appearances</button>
          <button class="chip" data-sort="name">🔤 Name</button>
        </div>

        <!-- Players Grid -->
        <div class="grid-3 stagger-children" id="players-grid">
          ${getSortedPlayers(players, 'goals').map(p => createPlayerCard(p)).join('')}
        </div>

        <div id="no-results" style="display:none;" class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No players found</h3>
          <p style="color:var(--text-tertiary);">Try adjusting your search or filters.</p>
        </div>
      </div>
    </section>
  `;

  // Search & Filter Logic
  const searchInput = container.querySelector('#player-search');
  const positionChips = container.querySelectorAll('#position-filters .chip');
  const sortChips = container.querySelectorAll('[data-sort]');
  let currentPosition = 'All';
  let currentSort = 'goals';
  let searchQuery = '';

  function updateGrid() {
    let filtered = [...players];

    // Position filter
    if (currentPosition !== 'All') {
      filtered = filtered.filter(p => p.position === currentPosition);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        getTeamById(p.teamId).name.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = getSortedPlayers(filtered, currentSort);

    const grid = container.querySelector('#players-grid');
    const noResults = container.querySelector('#no-results');

    if (filtered.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'flex';
    } else {
      grid.style.display = '';
      noResults.style.display = 'none';
      grid.innerHTML = filtered.map(p => createPlayerCard(p)).join('');
    }
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    updateGrid();
  });

  positionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      positionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentPosition = chip.dataset.position;
      updateGrid();
    });
  });

  sortChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sortChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentSort = chip.dataset.sort;
      updateGrid();
    });
  });
}

function getSortedPlayers(playerList, sort) {
  return [...playerList].sort((a, b) => {
    switch (sort) {
      case 'goals': return b.stats.goals - a.stats.goals;
      case 'assists': return b.stats.assists - a.stats.assists;
      case 'appearances': return b.stats.appearances - a.stats.appearances;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });
}

function renderPlayerDetail(container, playerId) {
  const player = getPlayerById(playerId);
  if (!player) {
    container.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Player not found</h3></div></div>`;
    return;
  }

  const team = getTeamById(player.teamId);
  const posClass = player.position.toLowerCase();
  const goalsPerGame = player.stats.appearances > 0 ? (player.stats.goals / player.stats.appearances).toFixed(2) : '0.00';
  const minsPerGoal = player.stats.goals > 0 ? Math.round(player.stats.minutesPlayed / player.stats.goals) : '—';

  // Goal contribution
  const totalContributions = player.stats.goals + player.stats.assists;

  // Stat bars - relative to max
  const maxGoals = Math.max(...players.map(p => p.stats.goals));
  const maxAssists = Math.max(...players.map(p => p.stats.assists));
  const maxApps = Math.max(...players.map(p => p.stats.appearances));

  container.innerHTML = `
    <div class="page-header" style="padding-bottom: var(--space-16);">
      <div class="container page-header-content">
        <a href="#/players" class="btn btn-ghost animate-fade-in-up" style="margin-bottom:var(--space-4);">← Back to Players</a>
        <div style="display:flex;align-items:center;gap:var(--space-8);flex-wrap:wrap;" class="animate-fade-in-up">
          <div style="width:140px;height:140px;border-radius:var(--radius-2xl);background:${team.gradientColor};display:flex;align-items:center;justify-content:center;font-size:4rem;position:relative;flex-shrink:0;">
            ${player.avatar}
            <span style="position:absolute;bottom:-4px;right:-4px;width:40px;height:40px;border-radius:var(--radius-lg);background:var(--bg-primary);border:2px solid var(--border-primary);display:flex;align-items:center;justify-content:center;font-size:var(--text-sm);font-weight:var(--weight-bold);">#${player.jerseyNumber}</span>
          </div>
          <div>
            <h1 class="page-title">${player.name}</h1>
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-top:var(--space-2);flex-wrap:wrap;">
              <span class="position-badge ${posClass}" style="font-size:var(--text-sm);padding:var(--space-2) var(--space-4);">${getPositionFull(player.position)}</span>
              <span style="font-size:var(--text-lg);">${player.nationality}</span>
              <span style="display:flex;align-items:center;gap:var(--space-2);">
                ${createTeamLogo(team, 'sm')}
                <span style="font-weight:var(--weight-semibold);">${team.name}</span>
              </span>
            </div>
            <p style="margin-top:var(--space-3);color:var(--text-secondary);max-width:500px;">${player.bio}</p>
            <div style="display:flex;gap:var(--space-3);margin-top:var(--space-3);flex-wrap:wrap;">
              <span class="badge badge-blue">🦶 ${player.preferredFoot} foot</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <section class="section">
      <div class="container">
        <!-- Key Stats Grid -->
        <div class="grid-4 stagger-children" style="margin-bottom:var(--space-12);">
          <div class="card" style="text-align:center;">
            <div class="stat-value" data-count="${player.stats.goals}">0</div>
            <div class="stat-label">Goals</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value" data-count="${player.stats.assists}">0</div>
            <div class="stat-label">Assists</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value" data-count="${player.stats.appearances}">0</div>
            <div class="stat-label">Appearances</div>
          </div>
          <div class="card" style="text-align:center;">
            <div class="stat-value" data-count="${totalContributions}">0</div>
            <div class="stat-label">G + A</div>
          </div>
        </div>

        <!-- Detailed Stats -->
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-bottom:var(--space-6);">Performance Stats</h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-5);">
              ${createStatBar('Goals', player.stats.goals, maxGoals)}
              ${createStatBar('Assists', player.stats.assists, maxAssists)}
              ${createStatBar('Appearances', player.stats.appearances, maxApps)}
              <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;">
                <span style="color:var(--text-secondary);">Goals / Game</span>
                <span style="font-weight:var(--weight-bold);">${goalsPerGame}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;">
                <span style="color:var(--text-secondary);">Mins / Goal</span>
                <span style="font-weight:var(--weight-bold);">${minsPerGoal}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;">
                <span style="color:var(--text-secondary);">Minutes Played</span>
                <span style="font-weight:var(--weight-bold);">${player.stats.minutesPlayed.toLocaleString()}'</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="margin-bottom:var(--space-6);">Discipline</h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-5);">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:rgba(255,184,0,0.08);border-radius:var(--radius-lg);">
                <span style="display:flex;align-items:center;gap:var(--space-2);">🟨 Yellow Cards</span>
                <span style="font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--accent-amber);">${player.stats.yellowCards}</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:rgba(255,71,87,0.08);border-radius:var(--radius-lg);">
                <span style="display:flex;align-items:center;gap:var(--space-2);">🟥 Red Cards</span>
                <span style="font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--accent-red);">${player.stats.redCards}</span>
              </div>
              ${player.position === 'GK' || player.position === 'DEF' ? `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:rgba(var(--accent-green-rgb),0.08);border-radius:var(--radius-lg);">
                  <span style="display:flex;align-items:center;gap:var(--space-2);">🧤 Clean Sheets</span>
                  <span style="font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--accent-green);">${player.stats.cleanSheets}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="divider"></div>
            <h4 style="margin-bottom:var(--space-4);">Player Info</h4>
            <div style="display:flex;flex-direction:column;gap:var(--space-3);">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-tertiary);">Position</span>
                <span style="font-weight:var(--weight-semibold);">${getPositionFull(player.position)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-tertiary);">Jersey</span>
                <span style="font-weight:var(--weight-semibold);">#${player.jerseyNumber}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-tertiary);">Preferred Foot</span>
                <span style="font-weight:var(--weight-semibold);">${player.preferredFoot}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-tertiary);">Team</span>
                <span style="font-weight:var(--weight-semibold);">${team.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Animate counters
  setTimeout(() => animateCounters(container), 300);
}

function createStatBar(label, value, max) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-1);">
        <span style="font-size:var(--text-sm);color:var(--text-secondary);">${label}</span>
        <span style="font-size:var(--text-sm);font-weight:var(--weight-bold);">${value}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percentage}%;"></div>
      </div>
    </div>
  `;
}
