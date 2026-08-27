// ============================================
// DATA SERVICE — Firestore-first, mock fallback
// ============================================
// All pages should import from here instead of mockData.js

import { teamsService, playersService, matchesService, tournamentsService, standingsService } from '../firebase/firestore.js';
import * as mock from './mockData.js';

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function getTeams() {
  try {
    const data = await teamsService.getAll();
    return data.length ? data : mock.teams;
  } catch { return mock.teams; }
}

export async function getTeamById(id) {
  try {
    const data = await teamsService.getById(id);
    return data || mock.teams.find(t => t.id === id);
  } catch { return mock.teams.find(t => t.id === id); }
}

// ── Players ───────────────────────────────────────────────────────────────────

export async function getPlayers() {
  try {
    const data = await playersService.getAll();
    return data.length ? data : mock.players;
  } catch { return mock.players; }
}

export async function getPlayerById(id) {
  try {
    const data = await playersService.getById(id);
    return data || mock.players.find(p => p.id === id);
  } catch { return mock.players.find(p => p.id === id); }
}

export async function getPlayersByTeam(teamId) {
  try {
    const data = await playersService.getByTeam(teamId);
    return data.length ? data : mock.players.filter(p => p.teamId === teamId);
  } catch { return mock.players.filter(p => p.teamId === teamId); }
}

export async function getTopScorers(limit = 5) {
  try {
    const data = await playersService.getAll();
    if (data.length) return [...data].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, limit);
    return mock.getTopScorers(limit);
  } catch { return mock.getTopScorers(limit); }
}

export async function getTopAssists(limit = 5) {
  try {
    const data = await playersService.getAll();
    if (data.length) return [...data].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, limit);
    return mock.getTopAssists(limit);
  } catch { return mock.getTopAssists(limit); }
}

// ── Matches ───────────────────────────────────────────────────────────────────

export async function getMatches() {
  try {
    const data = await matchesService.getAll();
    return data.length ? data : mock.matches;
  } catch { return mock.matches; }
}

export async function getRecentMatches(limit = 5) {
  try {
    const data = await matchesService.getAll();
    if (data.length) {
      return data
        .filter(m => m.status === 'completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    }
    return mock.getRecentMatches(limit);
  } catch { return mock.getRecentMatches(limit); }
}

export async function getUpcomingMatches(limit = 5) {
  try {
    const data = await matchesService.getAll();
    if (data.length) {
      return data
        .filter(m => m.status === 'upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, limit);
    }
    return mock.getUpcomingMatches(limit);
  } catch { return mock.getUpcomingMatches(limit); }
}

// ── Tournaments ───────────────────────────────────────────────────────────────

export async function getTournaments() {
  try {
    const data = await tournamentsService.getAll();
    return data.length ? data : mock.tournaments;
  } catch { return mock.tournaments; }
}

export async function getTournamentById(id) {
  try {
    const data = await tournamentsService.getById(id);
    return data || mock.tournaments.find(t => t.id === id);
  } catch { return mock.tournaments.find(t => t.id === id); }
}

// ── Standings ─────────────────────────────────────────────────────────────────

export async function getStandings(tournamentId = 'tournament-1') {
  try {
    const data = await standingsService.getByTournament(tournamentId);
    return data.length ? data : mock.standings.filter(s => s.tournamentId === tournamentId);
  } catch { return mock.standings.filter(s => s.tournamentId === tournamentId); }
}

// ── Platform stats ────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  try {
    const [teams, players, matches] = await Promise.all([
      getTeams(), getPlayers(), getMatches()
    ]);
    const completedMatches = matches.filter(m => m.status === 'completed');
    return {
      totalTeams:   teams.length,
      totalPlayers: players.length,
      totalMatches: matches.length,
      totalGoals:   completedMatches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0),
    };
  } catch { return mock.platformStats; }
}

// ── Re-export sync helpers from mock (date formatting, etc.) ─────────────────
export { formatDate, formatShortDate, getPositionFull } from './mockData.js';
