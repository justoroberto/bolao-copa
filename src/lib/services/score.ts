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

  const realHome = Number(match.homeScore);
  const realAway = Number(match.awayScore);
  const predHome = Number(prediction.homeScore);
  const predAway = Number(prediction.awayScore);

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
 * Regra: Palpites podem ser editados até 15 minutos antes da partida.
 */
export function canEditPrediction(matchStartTime: Date): boolean {
  const now = new Date();
  const lockTimeInMs = 15 * 60 * 1000; // 15 minutos
  const timeDifferenceOptions = matchStartTime.getTime() - now.getTime();
  
  return timeDifferenceOptions > lockTimeInMs;
}
