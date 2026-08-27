// ============================================
// HOME PAGE
// ============================================
import { getTeams, getTopScorers, getRecentMatches, getUpcomingMatches, getPlatformStats, getStandings } from '../data/dataService.js';
import { createMatchCard, createPlayerCard, createStandingsTable, createTeamLogo, createSectionHeader, animateCounters } from '../components/UIComponents.js';

export async function renderHome(container) {
  // Show loading skeleton / shell initially if empty
  container.innerHTML = `
    <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
      <div class="empty-state animate-fade-in-up">
        <div class="empty-state-icon">⚽</div>
        <h3>Loading FootballHub...</h3>
      </div>
    </div>
  `;

  const [platformStats, recentMatches, upcomingMatches, topScorers, standings, teams] = await Promise.all([
    getPlatformStats(),
    getRecentMatches(3),
    getUpcomingMatches(3),
    getTopScorers(6),
    getStandings('tournament-1'),
    getTeams()
  ]);

  container.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-bg-gradient"></div>
        <div class="hero-bg-pattern"></div>
        <div class="hero-bg-orb hero-bg-orb-1"></div>
        <div class="hero-bg-orb hero-bg-orb-2"></div>
      </div>
      <div class="hero-content">
        <div class="hero-inner">
          <div class="animate-fade-in-up">
            <div class="hero-badge">
              <span class="live-dot"></span>
              Summer Cup 2026 — Live Now
            </div>
            <h1 class="hero-title">
              The Beautiful Game,<br>
              <span class="text-accent">Organized.</span>
            </h1>
            <p class="hero-subtitle">
              Your complete platform for managing local football — teams, players, matches, tournaments, and more. All in one place.
            </p>
            <div class="hero-actions">
              <a href="#/matches" class="btn btn-primary btn-lg">View Matches</a>
              <a href="#/teams" class="btn btn-secondary btn-lg">Explore Teams</a>
            </div>
          </div>
          <div class="hero-stats-grid stagger-children">
            <div class="hero-stat-card">
              <div class="hero-stat-value" data-count="${platformStats.totalTeams}">0</div>
              <div class="hero-stat-label">Teams</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-value" data-count="${platformStats.totalPlayers}">0</div>
              <div class="hero-stat-label">Players</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-value" data-count="${platformStats.totalMatches}">0</div>
              <div class="hero-stat-label">Matches</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-value" data-count="${platformStats.totalGoals}">0</div>
              <div class="hero-stat-label">Goals Scored</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Match / Latest Result -->
    <section class="section">
      <div class="container">
        ${createSectionHeader('Latest Results', 'See how the recent matches unfolded', 'All Matches', '#/matches')}
        <div class="grid-auto stagger-children">
          ${recentMatches.map(m => createMatchCard(m)).join('')}
        </div>
      </div>
    </section>

    <!-- Upcoming Fixtures -->
    <section class="section" style="background: var(--bg-secondary);">
      <div class="container">
        ${createSectionHeader('Upcoming Fixtures', "Don't miss the action", 'Full Schedule', '#/matches')}
        <div class="grid-auto stagger-children">
          ${upcomingMatches.map(m => createMatchCard(m)).join('')}
        </div>
      </div>
    </section>

    <!-- Top Scorers -->
    <section class="section">
      <div class="container">
        ${createSectionHeader('Top Scorers', 'The sharpest shooters in the league', 'All Players', '#/players')}
        <div class="grid-auto stagger-children">
          ${topScorers.map(p => createPlayerCard(p)).join('')}
        </div>
      </div>
    </section>

    <!-- Mini Standings -->
    <section class="section" style="background: var(--bg-secondary);">
      <div class="container">
        ${createSectionHeader('Summer Cup Standings', 'Current league positions', 'Full Table', '#/standings')}
        <div class="animate-fade-in-up">
          ${createStandingsTable(standings)}
        </div>
      </div>
    </section>

    <!-- Teams Preview -->
    <section class="section">
      <div class="container">
        ${createSectionHeader('Teams', 'Meet the competing squads', 'All Teams', '#/teams')}
        <div class="grid-3 stagger-children">
          ${teams.slice(0, 3).map(t => `
            <div class="team-card gradient-border" onclick="window.location.hash='#/teams/${t.id}'">
              <div class="team-card-logo">
                ${createTeamLogo(t, 'lg')}
              </div>
              <div class="team-card-name">${t.name}</div>
              <div class="team-card-meta">Est. ${t.founded} · ${t.homeGround}</div>
              <div class="team-card-stats">
                <div class="player-stat-mini">
                  <div class="player-stat-mini-value">${t.wins}</div>
                  <div class="player-stat-mini-label">Wins</div>
                </div>
                <div class="player-stat-mini">
                  <div class="player-stat-mini-value">${t.draws}</div>
                  <div class="player-stat-mini-label">Draws</div>
                </div>
                <div class="player-stat-mini">
                  <div class="player-stat-mini-value">${t.losses}</div>
                  <div class="player-stat-mini-label">Losses</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  // Animate counters
  setTimeout(() => animateCounters(container), 300);

  // Intersection observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}
