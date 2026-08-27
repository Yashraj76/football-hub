// ============================================
// SEED SCRIPT — Push mock data to Firestore
// Run once: node scripts/seed.js
// ============================================

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD7DHA4wHgi4Xugvvs1bJtf0iiAFnr0MUM",
  authDomain: "footballhub-15fc1.firebaseapp.com",
  projectId: "footballhub-15fc1",
  storageBucket: "footballhub-15fc1.firebasestorage.app",
  messagingSenderId: "441629768828",
  appId: "1:441629768828:web:6b16dfde370e24586a5df9",
  measurementId: "G-E8BDSC6SME"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Data ─────────────────────────────────────────────────────────────────────

const teams = [
  { id: 'team-1', name: 'Phoenix FC', shortName: 'PHX', colors: ['#ff6b35', '#1a1a2e'], gradientColor: 'linear-gradient(135deg, #ff6b35, #e63946)', founded: '2019', homeGround: 'Phoenix Arena', captain: 'player-1', manager: 'Carlos Rivera', description: 'Rising from the ashes, Phoenix FC brings fiery passion to every match.', emoji: '🔥', playerCount: 15, wins: 18, draws: 4, losses: 3 },
  { id: 'team-2', name: 'Blue Thunder', shortName: 'BTH', colors: ['#4361ee', '#3a0ca3'], gradientColor: 'linear-gradient(135deg, #4361ee, #3a0ca3)', founded: '2018', homeGround: 'Thunder Park', captain: 'player-4', manager: 'James Wilson', description: 'The thunder never strikes twice — except in our attack.', emoji: '⚡', playerCount: 14, wins: 15, draws: 5, losses: 5 },
  { id: 'team-3', name: 'Green Vipers', shortName: 'GVP', colors: ['#2d6a4f', '#40916c'], gradientColor: 'linear-gradient(135deg, #2d6a4f, #40916c)', founded: '2020', homeGround: 'Serpent Ground', captain: 'player-7', manager: 'David Okonkwo', description: 'Quick, cunning, and lethal — the Vipers strike with precision.', emoji: '🐍', playerCount: 13, wins: 12, draws: 7, losses: 6 },
  { id: 'team-4', name: 'Golden Lions', shortName: 'GLN', colors: ['#e9c46a', '#e76f51'], gradientColor: 'linear-gradient(135deg, #e9c46a, #e76f51)', founded: '2017', homeGround: 'Lions Den', captain: 'player-10', manager: 'Ahmad Hassan', description: 'The pride of the league — majestic and unstoppable.', emoji: '🦁', playerCount: 14, wins: 20, draws: 3, losses: 2 },
  { id: 'team-5', name: 'Shadow Wolves', shortName: 'SHW', colors: ['#6c757d', '#343a40'], gradientColor: 'linear-gradient(135deg, #6c757d, #343a40)', founded: '2021', homeGround: 'Wolf Valley', captain: 'player-13', manager: 'Max Sterling', description: 'Silent but deadly. The Wolves hunt in packs.', emoji: '🐺', playerCount: 12, wins: 10, draws: 6, losses: 9 },
  { id: 'team-6', name: 'Red Dragons', shortName: 'RDG', colors: ['#dc2626', '#991b1b'], gradientColor: 'linear-gradient(135deg, #dc2626, #991b1b)', founded: '2019', homeGround: 'Dragon Fortress', captain: 'player-16', manager: 'Lee Joon-ho', description: 'Breathing fire on every pitch they play.', emoji: '🐉', playerCount: 13, wins: 14, draws: 4, losses: 7 },
];

const players = [
  { id: 'player-1',  name: 'Marco Silva',     teamId: 'team-1', position: 'FWD', jerseyNumber: 9,  nationality: '🇧🇷', preferredFoot: 'Right', dateOfBirth: '1995-03-15', bio: 'A clinical striker with an eye for goal.',                stats: { goals: 24, assists: 8,  appearances: 25, cleanSheets: 0,  yellowCards: 3, redCards: 0, minutesPlayed: 2180 }, avatar: '⚽' },
  { id: 'player-2',  name: 'Raj Patel',        teamId: 'team-1', position: 'MID', jerseyNumber: 8,  nationality: '🇮🇳', preferredFoot: 'Right', dateOfBirth: '1997-07-22', bio: 'Engine of the midfield with incredible vision.',           stats: { goals: 7,  assists: 15, appearances: 24, cleanSheets: 0,  yellowCards: 5, redCards: 1, minutesPlayed: 2050 }, avatar: '🎯' },
  { id: 'player-3',  name: 'Alex Turner',      teamId: 'team-1', position: 'DEF', jerseyNumber: 4,  nationality: '🇬🇧', preferredFoot: 'Left',  dateOfBirth: '1994-11-08', bio: 'Rock-solid defender with great aerial ability.',          stats: { goals: 2,  assists: 3,  appearances: 23, cleanSheets: 12, yellowCards: 6, redCards: 0, minutesPlayed: 2070 }, avatar: '🛡️' },
  { id: 'player-4',  name: 'Kenji Tanaka',     teamId: 'team-2', position: 'MID', jerseyNumber: 10, nationality: '🇯🇵', preferredFoot: 'Both',  dateOfBirth: '1996-05-12', bio: 'Maestro of the midfield, dictates the tempo.',           stats: { goals: 12, assists: 18, appearances: 25, cleanSheets: 0,  yellowCards: 2, redCards: 0, minutesPlayed: 2200 }, avatar: '✨' },
  { id: 'player-5',  name: 'Omar Hassan',      teamId: 'team-2', position: 'FWD', jerseyNumber: 11, nationality: '🇪🇬', preferredFoot: 'Left',  dateOfBirth: '1998-01-30', bio: 'Pace and power, a nightmare for defenders.',              stats: { goals: 19, assists: 6,  appearances: 24, cleanSheets: 0,  yellowCards: 4, redCards: 0, minutesPlayed: 1950 }, avatar: '💨' },
  { id: 'player-6',  name: 'Thomas Weber',     teamId: 'team-2', position: 'GK',  jerseyNumber: 1,  nationality: '🇩🇪', preferredFoot: 'Right', dateOfBirth: '1993-09-17', bio: 'The wall between the posts. Shot-stopping specialist.',  stats: { goals: 0,  assists: 1,  appearances: 25, cleanSheets: 14, yellowCards: 1, redCards: 0, minutesPlayed: 2250 }, avatar: '🧤' },
  { id: 'player-7',  name: 'Luis Mendez',      teamId: 'team-3', position: 'DEF', jerseyNumber: 5,  nationality: '🇦🇷', preferredFoot: 'Right', dateOfBirth: '1995-12-03', bio: 'Captain and defensive general.',                         stats: { goals: 3,  assists: 4,  appearances: 25, cleanSheets: 10, yellowCards: 7, redCards: 1, minutesPlayed: 2250 }, avatar: '🔰' },
  { id: 'player-8',  name: 'Samuel Osei',      teamId: 'team-3', position: 'FWD', jerseyNumber: 7,  nationality: '🇬🇭', preferredFoot: 'Right', dateOfBirth: '1999-04-25', bio: 'Young talent with explosive speed.',                     stats: { goals: 16, assists: 9,  appearances: 23, cleanSheets: 0,  yellowCards: 2, redCards: 0, minutesPlayed: 1800 }, avatar: '🚀' },
  { id: 'player-9',  name: 'Viktor Petrov',    teamId: 'team-3', position: 'MID', jerseyNumber: 6,  nationality: '🇺🇦', preferredFoot: 'Right', dateOfBirth: '1996-08-14', bio: 'Tireless runner with a cannon for a left foot.',        stats: { goals: 8,  assists: 11, appearances: 24, cleanSheets: 0,  yellowCards: 4, redCards: 0, minutesPlayed: 2100 }, avatar: '💪' },
  { id: 'player-10', name: 'Diego Morales',    teamId: 'team-4', position: 'FWD', jerseyNumber: 10, nationality: '🇲🇽', preferredFoot: 'Right', dateOfBirth: '1994-06-20', bio: 'The Golden Boot favorite. Lethal in the box.',          stats: { goals: 28, assists: 5,  appearances: 25, cleanSheets: 0,  yellowCards: 3, redCards: 0, minutesPlayed: 2200 }, avatar: '👑' },
  { id: 'player-11', name: 'Yuki Nakamura',    teamId: 'team-4', position: 'MID', jerseyNumber: 14, nationality: '🇯🇵', preferredFoot: 'Both',  dateOfBirth: '1997-02-11', bio: 'Creative force, key passes are his trademark.',        stats: { goals: 6,  assists: 20, appearances: 25, cleanSheets: 0,  yellowCards: 1, redCards: 0, minutesPlayed: 2150 }, avatar: '🎨' },
  { id: 'player-12', name: "James O'Brien",    teamId: 'team-4', position: 'GK',  jerseyNumber: 1,  nationality: '🇮🇪', preferredFoot: 'Right', dateOfBirth: '1992-10-05', bio: 'Veteran keeper with incredible reflexes.',              stats: { goals: 0,  assists: 0,  appearances: 25, cleanSheets: 16, yellowCards: 0, redCards: 0, minutesPlayed: 2250 }, avatar: '🧱' },
  { id: 'player-13', name: 'André Dubois',     teamId: 'team-5', position: 'DEF', jerseyNumber: 3,  nationality: '🇫🇷', preferredFoot: 'Left',  dateOfBirth: '1995-07-08', bio: 'Elegant defender with excellent passing range.',        stats: { goals: 1,  assists: 7,  appearances: 25, cleanSheets: 8,  yellowCards: 5, redCards: 0, minutesPlayed: 2250 }, avatar: '🎩' },
  { id: 'player-14', name: 'Ibrahim Diallo',   teamId: 'team-5', position: 'FWD', jerseyNumber: 9,  nationality: '🇸🇳', preferredFoot: 'Right', dateOfBirth: '2000-03-18', bio: 'Young prodigy with silky skills.',                      stats: { goals: 14, assists: 7,  appearances: 22, cleanSheets: 0,  yellowCards: 1, redCards: 0, minutesPlayed: 1750 }, avatar: '⭐' },
  { id: 'player-15', name: 'Chen Wei',         teamId: 'team-5', position: 'MID', jerseyNumber: 8,  nationality: '🇨🇳', preferredFoot: 'Right', dateOfBirth: '1997-11-30', bio: 'Box-to-box midfielder with relentless energy.',         stats: { goals: 5,  assists: 9,  appearances: 24, cleanSheets: 0,  yellowCards: 8, redCards: 0, minutesPlayed: 2100 }, avatar: '🔋' },
  { id: 'player-16', name: 'Park Min-jun',     teamId: 'team-6', position: 'MID', jerseyNumber: 7,  nationality: '🇰🇷', preferredFoot: 'Right', dateOfBirth: '1996-09-22', bio: 'Captain fantastic, leads from the front of midfield.',  stats: { goals: 10, assists: 14, appearances: 25, cleanSheets: 0,  yellowCards: 3, redCards: 0, minutesPlayed: 2200 }, avatar: '🔥' },
  { id: 'player-17', name: "Liam O'Connor",   teamId: 'team-6', position: 'FWD', jerseyNumber: 11, nationality: '🇮🇪', preferredFoot: 'Left',  dateOfBirth: '1998-04-07', bio: 'Tricky winger with an eye for spectacular goals.',     stats: { goals: 15, assists: 10, appearances: 24, cleanSheets: 0,  yellowCards: 2, redCards: 0, minutesPlayed: 1900 }, avatar: '🌟' },
  { id: 'player-18', name: 'Ali Reza',         teamId: 'team-6', position: 'DEF', jerseyNumber: 2,  nationality: '🇮🇷', preferredFoot: 'Right', dateOfBirth: '1994-01-15', bio: 'Commanding center-back, marshals the defense.',         stats: { goals: 4,  assists: 2,  appearances: 25, cleanSheets: 11, yellowCards: 6, redCards: 1, minutesPlayed: 2250 }, avatar: '🏔️' },
];

const matches = [
  { id: 'match-1',  homeTeam: 'team-4', awayTeam: 'team-1', homeScore: 3,    awayScore: 2,    date: '2026-08-20', time: '18:00', venue: 'Lions Den',      type: 'friendly',    status: 'completed', scorers: [{ playerId: 'player-10', minute: 12 }, { playerId: 'player-10', minute: 45 }, { playerId: 'player-11', minute: 67 }, { playerId: 'player-1', minute: 34 }, { playerId: 'player-1', minute: 78 }] },
  { id: 'match-2',  homeTeam: 'team-2', awayTeam: 'team-3', homeScore: 1,    awayScore: 1,    date: '2026-08-18', time: '19:00', venue: 'Thunder Park',   type: 'friendly',    status: 'completed', scorers: [{ playerId: 'player-5', minute: 55 }, { playerId: 'player-8', minute: 72 }] },
  { id: 'match-3',  homeTeam: 'team-5', awayTeam: 'team-6', homeScore: 0,    awayScore: 2,    date: '2026-08-15', time: '17:30', venue: 'Wolf Valley',    type: 'tournament',  tournamentId: 'tournament-1', status: 'completed', scorers: [{ playerId: 'player-17', minute: 23 }, { playerId: 'player-16', minute: 81 }] },
  { id: 'match-4',  homeTeam: 'team-1', awayTeam: 'team-3', homeScore: 4,    awayScore: 1,    date: '2026-08-12', time: '18:30', venue: 'Phoenix Arena',  type: 'tournament',  tournamentId: 'tournament-1', status: 'completed', scorers: [{ playerId: 'player-1', minute: 10 }, { playerId: 'player-1', minute: 35 }, { playerId: 'player-2', minute: 60 }, { playerId: 'player-1', minute: 88 }, { playerId: 'player-8', minute: 44 }] },
  { id: 'match-5',  homeTeam: 'team-4', awayTeam: 'team-2', homeScore: 2,    awayScore: 0,    date: '2026-08-10', time: '16:00', venue: 'Lions Den',      type: 'tournament',  tournamentId: 'tournament-1', status: 'completed', scorers: [{ playerId: 'player-10', minute: 29 }, { playerId: 'player-10', minute: 65 }] },
  { id: 'match-6',  homeTeam: 'team-6', awayTeam: 'team-1', homeScore: 1,    awayScore: 3,    date: '2026-08-08', time: '18:00', venue: 'Dragon Fortress',type: 'friendly',    status: 'completed', scorers: [{ playerId: 'player-16', minute: 40 }, { playerId: 'player-1', minute: 15 }, { playerId: 'player-2', minute: 52 }, { playerId: 'player-1', minute: 70 }] },
  { id: 'match-7',  homeTeam: 'team-3', awayTeam: 'team-5', homeScore: 2,    awayScore: 2,    date: '2026-08-05', time: '17:00', venue: 'Serpent Ground', type: 'friendly',    status: 'completed', scorers: [{ playerId: 'player-8', minute: 18 }, { playerId: 'player-9', minute: 63 }, { playerId: 'player-14', minute: 30 }, { playerId: 'player-14', minute: 77 }] },
  { id: 'match-8',  homeTeam: 'team-1', awayTeam: 'team-2', homeScore: null, awayScore: null, date: '2026-09-01', time: '18:00', venue: 'Phoenix Arena',  type: 'tournament',  tournamentId: 'tournament-1', status: 'upcoming' },
  { id: 'match-9',  homeTeam: 'team-3', awayTeam: 'team-4', homeScore: null, awayScore: null, date: '2026-09-03', time: '19:00', venue: 'Serpent Ground', type: 'tournament',  tournamentId: 'tournament-1', status: 'upcoming' },
  { id: 'match-10', homeTeam: 'team-5', awayTeam: 'team-1', homeScore: null, awayScore: null, date: '2026-09-05', time: '17:30', venue: 'Wolf Valley',    type: 'friendly',    status: 'upcoming' },
  { id: 'match-11', homeTeam: 'team-6', awayTeam: 'team-2', homeScore: null, awayScore: null, date: '2026-09-08', time: '18:00', venue: 'Dragon Fortress',type: 'friendly',    status: 'upcoming' },
  { id: 'match-12', homeTeam: 'team-4', awayTeam: 'team-5', homeScore: null, awayScore: null, date: '2026-09-10', time: '16:00', venue: 'Lions Den',      type: 'tournament',  tournamentId: 'tournament-1', status: 'upcoming' },
];

const tournaments = [
  { id: 'tournament-1', name: 'Summer Cup 2026',     type: 'league',    startDate: '2026-08-01', endDate: '2026-10-30', status: 'ongoing',   description: 'The ultimate summer showdown. All 6 teams battle it out in a league format.',      teams: ['team-1','team-2','team-3','team-4','team-5','team-6'], totalMatches: 30, matchesPlayed: 5, emoji: '🏆' },
  { id: 'tournament-2', name: 'Spring Knockout 2026', type: 'knockout',  startDate: '2026-04-01', endDate: '2026-05-15', status: 'completed', description: 'Single elimination knockout tournament with dramatic finishes.',                    teams: ['team-1','team-2','team-3','team-4','team-5','team-6'], totalMatches: 5,  matchesPlayed: 5, winner: 'team-4', emoji: '⚔️' },
  { id: 'tournament-3', name: 'Winter League 2027',   type: 'league',    startDate: '2027-01-10', endDate: '2027-03-30', status: 'upcoming',  description: 'Brace for the cold. The winter league promises heated rivalries.',                teams: ['team-1','team-2','team-3','team-4','team-5','team-6'], totalMatches: 30, matchesPlayed: 0, emoji: '❄️' },
];

const standings = [
  { teamId: 'team-4', tournamentId: 'tournament-1', played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 12, goalsAgainst: 4,  points: 12, form: ['W','W','L','W','W'] },
  { teamId: 'team-1', tournamentId: 'tournament-1', played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 14, goalsAgainst: 8,  points: 10, form: ['W','D','W','L','W'] },
  { teamId: 'team-6', tournamentId: 'tournament-1', played: 5, won: 3, drawn: 0, lost: 2, goalsFor: 8,  goalsAgainst: 7,  points: 9,  form: ['W','L','W','W','L'] },
  { teamId: 'team-2', tournamentId: 'tournament-1', played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 6,  goalsAgainst: 7,  points: 7,  form: ['D','L','W','L','W'] },
  { teamId: 'team-3', tournamentId: 'tournament-1', played: 5, won: 1, drawn: 2, lost: 2, goalsFor: 7,  goalsAgainst: 10, points: 5,  form: ['L','W','D','D','L'] },
  { teamId: 'team-5', tournamentId: 'tournament-1', played: 5, won: 0, drawn: 2, lost: 3, goalsFor: 4,  goalsAgainst: 9,  points: 2,  form: ['D','L','L','D','L'] },
];

// ── Seed function ─────────────────────────────────────────────────────────────

async function seedCollection(colName, items) {
  // Firestore batch limit is 500 ops
  const BATCH_SIZE = 490;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    items.slice(i, i + BATCH_SIZE).forEach(item => {
      const { id, ...data } = item;
      const docId = id || `${colName}-${Date.now()}-${Math.random()}`;
      batch.set(doc(db, colName, docId), data);
    });
    await batch.commit();
    console.log(`  ✅ Seeded ${Math.min(i + BATCH_SIZE, items.length)} / ${items.length} ${colName}`);
  }
}

async function seed() {
  console.log('\n🌱 Seeding Firestore for footballhub-15fc1...\n');

  await seedCollection('teams',       teams);
  await seedCollection('players',     players);
  await seedCollection('matches',     matches);
  await seedCollection('tournaments', tournaments);

  // Standings use composite IDs
  const batch = writeBatch(db);
  standings.forEach(s => {
    const docId = `${s.tournamentId}_${s.teamId}`;
    const { ...data } = s;
    batch.set(doc(db, 'standings', docId), data);
  });
  await batch.commit();
  console.log(`  ✅ Seeded ${standings.length} / ${standings.length} standings`);

  console.log('\n🎉 All data seeded successfully!\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
