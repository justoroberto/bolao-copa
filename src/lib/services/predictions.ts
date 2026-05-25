import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { Prediction } from '../firebase/models';

export async function savePrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  // O ID único da prediction é uma combinação de userId e matchId 
  // Isso garante que o mesmo usuário não crie 2 predições pro mesmo jogo
  const predictionId = `${userId}_${matchId}`;
  
  const predictionRef = doc(db, 'predictions', predictionId);
  await setDoc(predictionRef, {
    id: predictionId,
    userId,
    matchId,
    homeScore,
    awayScore,
    updatedAt: new Date(),
  }, { merge: true }); // Salva ou sobrescreve mantendo resto caso tenha
}
