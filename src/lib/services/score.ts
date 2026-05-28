import { Match, Prediction } from '../firebase/models';

/**
 * Calcula os pontos de um palpite para uma partida finalizada.
 * 
 * Regras:
 * - Acertar placar exato -> 3 pontos
 * - Acertar resultado (vitória/empate) -> 1 ponto
 * - Errar -> 0 pontos
 */
export function calculatePoints(match: Match, prediction: Prediction | null): number {
  if (!prediction) return 0;
  
  if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) {
    return 0; // Jogo ainda não acabou ou não tem placar final
  }

  const { homeScore: realHome, awayScore: realAway } = match;
  const { homeScore: predHome, awayScore: predAway } = prediction;

  // Acertou o placar exato
  if (realHome === predHome && realAway === predAway) {
    return 3;
  }

  // Descobrindo quem ganhou
  const realResult = realHome > realAway ? 'home' : realHome < realAway ? 'away' : 'draw';
  const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';

  // Acertou apenas o resultado da partida (vitória/empate)
  if (realResult === predResult) {
    return 1;
  }

  // Errou tudo
  return 0;
}

/**
 * Verifica se um palpite pode ser editado.
 * Regra: Palpites podem ser editados até 1 hora antes da partida.
 */
export function canEditPrediction(matchStartTime: Date): boolean {
  const now = new Date();
  const oneHourInMs = 1 * 60 * 60 * 1000;
  const timeDifferenceOptions = matchStartTime.getTime() - now.getTime();
  
  return timeDifferenceOptions > oneHourInMs;
}
