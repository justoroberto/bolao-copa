import { WORLD_CUP_MATCHES } from './src/lib/data/worldCup2026';
import { calculateGroupStandings } from './src/lib/services/simulator';
import fs from 'fs';

const resultsRaw = JSON.parse(fs.readFileSync('dbResults.json', 'utf8'));
const scores: Record<string, any> = {};
for (const key in resultsRaw) {
  scores[key] = { home: resultsRaw[key].homeScore, away: resultsRaw[key].awayScore };
}

const standings = calculateGroupStandings(WORLD_CUP_MATCHES, scores);

for (const group in standings) {
  console.log(`\nGroup ${group}`);
  standings[group].forEach(t => {
    console.log(`${t.team} - Pts: ${t.points}, Pl: ${t.played}, GD: ${t.goalDifference}`);
  });
}
