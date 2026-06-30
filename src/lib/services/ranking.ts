import { db } from '../firebase/config';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { Prediction, MatchResult, User, Ranking } from '../firebase/models';

/**
 * Recalcula a pontuação de todos os usuários baseando-se nos resultados oficiais salvos no banco.
 * - Acerto Exato: 3 pontos
 * - Acerto do Vencedor (ou empate): 1 ponto
 * - Erro: 0 pontos
 */
export async function calculateAndSaveRankings(): Promise<void> {
  // 1. Busca os resultados reais
  const resultsSnap = await getDocs(collection(db, 'matchResults'));
  const results: Record<string, MatchResult> = {};
  resultsSnap.forEach(doc => {
    const data = doc.data() as MatchResult;
    const matchId = data.matchId || doc.id;
    if (data.status === 'finished') {
      results[matchId] = data;
    }
  });

  // 2. Busca todos os palpites
  const predsSnap = await getDocs(collection(db, 'predictions'));
  const userPreds: Record<string, Prediction[]> = {};
  predsSnap.forEach(doc => {
    const data = doc.data() as Prediction;
    if (!userPreds[data.userId]) userPreds[data.userId] = [];
    userPreds[data.userId].push(data);
  });

  // 3. Busca todos os usuários
  const usersSnap = await getDocs(collection(db, 'users'));
  const users: Record<string, User> = {};
  usersSnap.forEach(doc => {
    const data = doc.data() as User;
    data.id = data.id || doc.id;
    users[data.id] = data;
  });

  // 4. Calcula o ranking
  const rankings: Ranking[] = [];

  for (const userId of Object.keys(users)) {
    const user = users[userId];
    let totalPoints = 0;
    let exactScores = 0;
    let correctWinners = 0;

    const preds = userPreds[userId] || [];

    for (const pred of preds) {
      const result = results[pred.matchId];
      if (!result) continue; // Jogo ainda não aconteceu/não tem resultado oficial

      const predHome = pred.homeScore;
      const predAway = pred.awayScore;
      const resHome = result.homeScore;
      const resAway = result.awayScore;

      const predOutcome = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'tie';
      const resOutcome = resHome > resAway ? 'home' : resHome < resAway ? 'away' : 'tie';

      if (predHome === resHome && predAway === resAway) {
        exactScores += 1;
        totalPoints += 3;
      } else if (predOutcome === resOutcome) {
        correctWinners += 1;
        totalPoints += 1;
      }
    }

    rankings.push({
      userId: user.id,
      nickname: user.nickname,
      totalPoints,
      exactScores,
      correctWinners
    });
  }

  // 5. Salva os rankings em lote
  // Firestore Batch Write suporta no máximo 500 operações
  const chunks = [];
  let i = 0;
  while (i < rankings.length) {
    chunks.push(rankings.slice(i, i + 490));
    i += 490;
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const rank of chunk) {
      const ref = doc(db, 'rankings', rank.userId);
      batch.set(ref, rank);
    }
    await batch.commit();
  }
}

/**
 * Salva o resultado oficial de uma partida e atualiza o ranking de todos os usuários.
 */
export async function saveMatchResult(matchId: string, homeScore: number, awayScore: number, penaltyWinner?: 'home' | 'away'): Promise<void> {
  const result: MatchResult = {
    matchId,
    homeScore,
    awayScore,
    status: 'finished'
  };
  if (penaltyWinner) {
    result.penaltyWinner = penaltyWinner;
  }
  const ref = doc(db, 'matchResults', matchId);
  const batch = writeBatch(db);
  batch.set(ref, result);
  await batch.commit();
  
  // Logo após salvar o resultado, roda o motor para calcular os pontos de todos
  await calculateAndSaveRankings();
}

/**
 * Salva o resultado temporário (ao vivo) de uma partida.
 * Não recalcula o ranking geral definitivo, apenas atualiza o estado para que os componentes ao vivo reajam.
 */
export async function setLiveMatchScore(matchId: string, homeScore: number, awayScore: number, penaltyWinner?: 'home' | 'away'): Promise<void> {
  const result: MatchResult = {
    matchId,
    homeScore,
    awayScore,
    status: 'live'
  };
  if (penaltyWinner) {
    result.penaltyWinner = penaltyWinner;
  }
  const ref = doc(db, 'matchResults', matchId);
  const batch = writeBatch(db);
  batch.set(ref, result);
  await batch.commit();
}

/**
 * Remove o resultado oficial de uma partida e recalcula o ranking.
 */
export async function deleteMatchResult(matchId: string): Promise<void> {
  const ref = doc(db, 'matchResults', matchId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
  
  // Recalcula o ranking sem esse resultado
  await calculateAndSaveRankings();
}
