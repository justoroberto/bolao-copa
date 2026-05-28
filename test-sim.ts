import { TEAMS, WORLD_CUP_MATCHES } from './src/lib/data/worldCup2026';
import { calculateGroupStandings, generateKnockoutBracket } from './src/lib/services/simulator';

const scores = {};
const standings = calculateGroupStandings(WORLD_CUP_MATCHES, scores);
const knockout = generateKnockoutBracket(standings, scores);
console.log(knockout.length);
