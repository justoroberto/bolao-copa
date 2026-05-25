import { db } from '../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc, increment, getDoc, setDoc } from 'firebase/firestore';
import { Match, Prediction } from '../firebase/models';
import { calculatePoints } from './score';

/**
 * Esta função simula um Webhook ou uma Cloud Function/Server Action 
 * disparada assim que o juiz apita o final do jogo (Match status = 'finished').
 * 
 * Ela aplica a matemática complexa de pontuação para o Bolão:
 * 1. Pega todas as predições feitas para o matchId.
 * 2. Calcula os ganhos de cada apostador (0, 1 ou 3 pontos).
 * 3. Cria um WriteBatch (operação atômica) para atualizar em tempo real:
 *    a) O documento do palpite (registrando os pontos conquistados).
 *    b) O documento de Ranking do usuário (somando no Placar Geral).
 */
export async function processMatchResults(match: Match) {
  if (match.status !== 'finished') {
    throw new Error('Apenas partidas finalizadas podem ser processadas.');
  }

  // 1. Busca todos os palpites para o jogo finalizado
  const predictionsRef = collection(db, 'predictions');
  const q = query(predictionsRef, where('matchId', '==', match.id));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log(`Nenhum palpite encontrado para o jogo ${match.id}`);
    return;
  }

  // 2. Inicia um Batch para atualizar os dados de forma atômica
  const batch = writeBatch(db);

  for (const predictionDoc of snapshot.docs) {
    const prediction = predictionDoc.data() as Prediction;
    
    // Matemática de pontuação: 3pts (Gabarito), 1pt (Acertou Vencedor/Empate), 0pts (Errou)
    const earnedPoints = calculatePoints(match, prediction);
    const exactScoresIncrement = earnedPoints === 3 ? 1 : 0;
    const correctWinnersIncrement = earnedPoints >= 1 ? 1 : 0;
    
    // A) Atualizamos o palpite do usuário marcando quantos pontos ele levou
    batch.update(predictionDoc.ref, { points: earnedPoints });

    // B) Atualizamos o Ranking Global do usuário atomisticamente
    if (earnedPoints > 0) {
      const rankingRef = doc(db, 'rankings', prediction.userId);
      const rankingSnapshot = await getDoc(rankingRef);

      if (!rankingSnapshot.exists()) {
        // Se ainda não existir registro no ranking, buscamos o nickname dele para criar
        const userSnapshot = await getDoc(doc(db, 'users', prediction.userId));
        const nickname = userSnapshot.exists() ? userSnapshot.data().nickname : 'Anonimo';
        
        // Em um batch, se formos CRIAR ao invés de atualizar, usamos batch.set
        batch.set(rankingRef, {
          userId: prediction.userId,
          nickname: nickname,
          totalPoints: earnedPoints,
          exactScores: exactScoresIncrement,
          correctWinners: correctWinnersIncrement
        });
      } else {
        // Usa o Increment do Firestore para somar aos pontos correntes a prova de falhas de concorrência
        batch.update(rankingRef, {
          totalPoints: increment(earnedPoints),
          exactScores: increment(exactScoresIncrement),
          correctWinners: increment(correctWinnersIncrement)
        });
      }
    }
  }

  // 3. Executa as multíplas gravações simultaneamente! O Snapshot do frontend reagirá instantaneamente.
  await batch.commit();
  console.log(`Ranking atualizado com sucesso! ${snapshot.size} apostas processadas para o Match ${match.id}.`);
}
