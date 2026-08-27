// ============================================
// TOURNAMENTS PAGE
// ============================================
import { tournaments, getTeamById, standings, matches, formatDate } from '../data/mockData.js';
import { createTeamLogo, createStandingsTable, createMatchCard } from '../components/UIComponents.js';

export function renderTournaments(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="container page-header-content">
        <h1 class="page-title animate-fade-in-up">Tournaments</h1>
        <p class="page-description animate-fade-in-up" style="animation-delay: 0.1s;">
          Organized competitions, from league formats to knockout thrillers.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <!-- Tournament Cards -->
        <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-8);">
          ${tournaments.map(t => createTournamentSection(t)).join('')}
        </div>
      </div>
    </section>
  `;
}

function createTournamentSection(tournament) {
  const statusColor = tournament.status === 'ongoing' ? 'green' : tournament.status === 'completed' ? 'blue' : 'amber';
  const statusText = tournament.status === 'ongoing' ? '🔴 Live' : tournament.status === 'completed' ? '✅ Completed' : '📅 Upcoming';

  // Get tournament matches
  const tournamentMatches = matches.filter(m => m.tournamentId === tournament.id);
  const completedMatches = tournamentMatches.filter(m => m.status === 'completed');
  const upcomingMatches = tournamentMatches.filter(m => m.status === 'upcoming');

  // Get standings for this tournament
  const tournamentStandings = standings.filter(s => s.tournamentId === tournament.id);

  // Progress calculation
  const progress = tournament.totalMatches > 0 ? Math.round((tournament.matchesPlayed / tournament.totalMatches) * 100) : 0;

  let winnerSection = '';
  if (tournament.winner) {
    const winnerTeam = getTeamById(tournament.winner);
    winnerSection = `
      <div class="card" style="background:linear-gradient(135deg, rgba(233,196,106,0.15), rgba(231,111,81,0.1));border-color:rgba(233,196,106,0.3);text-align:center;padding:var(--space-8);">
        <div style="font-size:3rem;margin-bottom:var(--space-3);">🏆</div>
        <div style="font-size:var(--text-sm);color:var(--accent-amber);text-transform:uppercase;letter-spacing:0.1em;font-weight:var(--weight-bold);margin-bottom:var(--space-2);">Champion</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-3);">
          ${createTeamLogo(winnerTeam)}
          <span style="font-size:var(--text-2xl);font-weight:var(--weight-extrabold);">${winnerTeam.name}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="card" style="padding:var(--space-8);">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4);margin-bottom:var(--space-6);">
        <div style="display:flex;align-items:center;gap:var(--space-4);">
          <div style="font-size:3rem;">${tournament.emoji}</div>
          <div>
            <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-1);">${tournament.name}</h2>
            <p style="color:var(--text-secondary);font-size:var(--text-sm);">${tournament.description}</p>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
          <span class="badge badge-${statusColor}">${statusText}</span>
          <span class="badge badge-blue">${tournament.type === 'league' ? '📊 League' : '⚔️ Knockout'}</span>
        </div>
      </div>

      <!-- Tournament Info Row -->
      <div style="display:flex;gap:var(--space-6);flex-wrap:wrap;margin-bottom:var(--space-6);padding:var(--space-4);background:var(--bg-tertiary);border-radius:var(--radius-lg);">
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;">Start Date</div>
          <div style="font-weight:var(--weight-semibold);">${formatDate(tournament.startDate)}</div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;">End Date</div>
          <div style="font-weight:var(--weight-semibold);">${formatDate(tournament.endDate)}</div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;">Teams</div>
          <div style="font-weight:var(--weight-semibold);">${tournament.teams.length}</div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;">Matches</div>
          <div style="font-weight:var(--weight-semibold);">${tournament.matchesPlayed} / ${tournament.totalMatches}</div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;margin-bottom:var(--space-1);">Progress</div>
          <div class="progress-bar" style="height:8px;">
            <div class="progress-fill" style="width:${progress}%;"></div>
          </div>
        </div>
      </div>

      <!-- Participating Teams -->
      <div style="margin-bottom:var(--space-6);">
        <h4 style="margin-bottom:var(--space-3);font-size:var(--text-sm);color:var(--text-tertiary);text-transform:uppercase;">Participating Teams</h4>
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
          ${tournament.teams.map(tId => {
            const team = getTeamById(tId);
            return `
              <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-full);cursor:pointer;" onclick="window.location.hash='#/teams/${tId}'">
                ${createTeamLogo(team, 'sm')}
                <span style="font-size:var(--text-sm);font-weight:var(--weight-medium);">${team.shortName}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${winnerSection}

      <!-- Standings (for league type and ongoing/completed) -->
      ${tournament.type === 'league' && tournamentStandings.length > 0 ? `
        <div style="margin-top:var(--space-6);">
          <h4 style="margin-bottom:var(--space-4);">Standings</h4>
          ${createStandingsTable(tournamentStandings)}
        </div>
      ` : ''}

      <!-- Recent Tournament Matches -->
      ${completedMatches.length > 0 ? `
        <div style="margin-top:var(--space-6);">
          <h4 style="margin-bottom:var(--space-4);">Recent Matches</h4>
          <div class="grid-auto">
            ${completedMatches.slice(0, 3).map(m => createMatchCard(m)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Upcoming Tournament Matches -->
      ${upcomingMatches.length > 0 ? `
        <div style="margin-top:var(--space-6);">
          <h4 style="margin-bottom:var(--space-4);">Upcoming Matches</h4>
          <div class="grid-auto">
            ${upcomingMatches.slice(0, 3).map(m => createMatchCard(m)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
