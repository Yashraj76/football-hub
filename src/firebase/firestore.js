// ============================================
// FIRESTORE SERVICE — FootballHub
// ============================================

import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot
} from 'firebase/firestore';
import { db } from './config.js';

// ── Collection names ──────────────────────────────────────────────────────────
const COLLECTIONS = {
  TEAMS:       'teams',
  PLAYERS:     'players',
  MATCHES:     'matches',
  TOURNAMENTS: 'tournaments',
  STANDINGS:   'standings',
};

// ── Generic helpers ───────────────────────────────────────────────────────────

async function getAll(colName) {
  const snap = await getDocs(collection(db, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getById(colName, id) {
  const snap = await getDoc(doc(db, colName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function create(colName, data, customId = null) {
  if (customId) {
    await setDoc(doc(db, colName, customId), data);
    return customId;
  }
  const ref = await addDoc(collection(db, colName), data);
  return ref.id;
}

async function update(colName, id, data) {
  await updateDoc(doc(db, colName, id), data);
}

async function remove(colName, id) {
  await deleteDoc(doc(db, colName, id));
}

// ── TEAMS ─────────────────────────────────────────────────────────────────────

export const teamsService = {
  getAll:    ()       => getAll(COLLECTIONS.TEAMS),
  getById:   (id)     => getById(COLLECTIONS.TEAMS, id),
  create:    (data)   => create(COLLECTIONS.TEAMS, data, data.id),
  update:    (id, d)  => update(COLLECTIONS.TEAMS, id, d),
  delete:    (id)     => remove(COLLECTIONS.TEAMS, id),
};

// ── PLAYERS ───────────────────────────────────────────────────────────────────

export const playersService = {
  getAll:        ()       => getAll(COLLECTIONS.PLAYERS),
  getById:       (id)     => getById(COLLECTIONS.PLAYERS, id),
  create:        (data)   => create(COLLECTIONS.PLAYERS, data, data.id),
  update:        (id, d)  => update(COLLECTIONS.PLAYERS, id, d),
  delete:        (id)     => remove(COLLECTIONS.PLAYERS, id),

  async getByTeam(teamId) {
    const q = query(
      collection(db, COLLECTIONS.PLAYERS),
      where('teamId', '==', teamId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getTopScorers(lim = 5) {
    const q = query(
      collection(db, COLLECTIONS.PLAYERS),
      orderBy('stats.goals', 'desc'),
      limit(lim)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getTopAssists(lim = 5) {
    const q = query(
      collection(db, COLLECTIONS.PLAYERS),
      orderBy('stats.assists', 'desc'),
      limit(lim)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

// ── MATCHES ───────────────────────────────────────────────────────────────────

export const matchesService = {
  getAll:   ()       => getAll(COLLECTIONS.MATCHES),
  getById:  (id)     => getById(COLLECTIONS.MATCHES, id),
  create:   (data)   => create(COLLECTIONS.MATCHES, data, data.id),
  update:   (id, d)  => update(COLLECTIONS.MATCHES, id, d),
  delete:   (id)     => remove(COLLECTIONS.MATCHES, id),

  async getByStatus(status) {
    const q = query(
      collection(db, COLLECTIONS.MATCHES),
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getByTeam(teamId) {
    const homeQ = query(collection(db, COLLECTIONS.MATCHES), where('homeTeam', '==', teamId));
    const awayQ = query(collection(db, COLLECTIONS.MATCHES), where('awayTeam', '==', teamId));
    const [homeSnap, awaySnap] = await Promise.all([getDocs(homeQ), getDocs(awayQ)]);
    const home = homeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const away = awaySnap.docs.map(d => ({ id: d.id, ...d.data() }));
    return [...home, ...away].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getByTournament(tournamentId) {
    const q = query(
      collection(db, COLLECTIONS.MATCHES),
      where('tournamentId', '==', tournamentId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  subscribeToLive(callback) {
    const q = query(
      collection(db, COLLECTIONS.MATCHES),
      where('status', '==', 'live')
    );
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
};

// ── TOURNAMENTS ───────────────────────────────────────────────────────────────

export const tournamentsService = {
  getAll:   ()       => getAll(COLLECTIONS.TOURNAMENTS),
  getById:  (id)     => getById(COLLECTIONS.TOURNAMENTS, id),
  create:   (data)   => create(COLLECTIONS.TOURNAMENTS, data, data.id),
  update:   (id, d)  => update(COLLECTIONS.TOURNAMENTS, id, d),
  delete:   (id)     => remove(COLLECTIONS.TOURNAMENTS, id),

  async getByStatus(status) {
    const q = query(
      collection(db, COLLECTIONS.TOURNAMENTS),
      where('status', '==', status)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

// ── STANDINGS ─────────────────────────────────────────────────────────────────

export const standingsService = {
  getAll:   ()       => getAll(COLLECTIONS.STANDINGS),
  create:   (data)   => create(COLLECTIONS.STANDINGS, data, `${data.tournamentId}_${data.teamId}`),
  update:   (id, d)  => update(COLLECTIONS.STANDINGS, id, d),
  delete:   (id)     => remove(COLLECTIONS.STANDINGS, id),

  async getByTournament(tournamentId) {
    const q = query(
      collection(db, COLLECTIONS.STANDINGS),
      where('tournamentId', '==', tournamentId),
      orderBy('points', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Recalculate standings for a tournament based on completed matches
   */
  async recalculateForTournament(tournamentId) {
    const tournament = await tournamentsService.getById(tournamentId);
    if (!tournament || !tournament.teams) return;

    const matches = await matchesService.getByTournament(tournamentId);
    const completedMatches = matches.filter(m => m.status === 'completed');

    const table = {};
    tournament.teams.forEach(teamId => {
      table[teamId] = {
        tournamentId,
        teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: [],
      };
    });

    completedMatches.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => {
      const home = table[m.homeTeam];
      const away = table[m.awayTeam];
      if (!home || !away) return;

      const hScore = Number(m.homeScore) || 0;
      const aScore = Number(m.awayScore) || 0;

      home.played += 1;
      away.played += 1;
      home.goalsFor += hScore;
      home.goalsAgainst += aScore;
      away.goalsFor += aScore;
      away.goalsAgainst += hScore;

      if (hScore > aScore) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
        home.form.push('W');
        away.form.push('L');
      } else if (hScore < aScore) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
        home.form.push('L');
        away.form.push('W');
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
        home.form.push('D');
        away.form.push('D');
      }
    });

    // Save standings to Firestore
    await Promise.all(Object.values(table).map(entry => {
      entry.form = entry.form.slice(-5); // keep last 5 matches form
      return standingsService.create(entry);
    }));

    // Update matchesPlayed on tournament
    await tournamentsService.update(tournamentId, {
      matchesPlayed: completedMatches.length,
    });
  }
};

