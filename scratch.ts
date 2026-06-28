import { WORLD_CUP_MATCHES, TEAMS } from './src/lib/data/worldCup2026';
import { generateKnockoutBracket, calculateGroupStandings, getQualifiedTeams } from './src/lib/services/simulator';

// Mocar os resultados
const scores = {};
WORLD_CUP_MATCHES.forEach(m => {
  if (m.stage === 'group') {
    // vamos colocar empates 0x0
    scores[m.id] = { home: 0, away: 0 };
  }
});
// Isso nao vai dar a tabela real.
// Pq eu nao puxo os dados reais do Firestore para ver como ficou no simulador?

