import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, deleteDoc, documentId } from 'firebase/firestore';
import { League, Ranking } from '@/lib/firebase/models';

export const MAX_LEAGUES_PER_USER = 3;
export const MAX_CREATED_LEAGUES_PER_USER = 1;

export async function getUserLeagues(userId: string): Promise<League[]> {
  const q = query(collection(db, 'leagues'), where('participantIds', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date()
    } as League;
  });
}

export async function getAllLeagues(): Promise<League[]> {
  const snapshot = await getDocs(collection(db, 'leagues'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date()
    } as League;
  });
}

export async function createLeague(name: string, userId: string): Promise<League> {
  const nameLower = name.trim().toLowerCase();
  if (!nameLower) throw new Error('Nome da liga não pode ser vazio');

  const userLeagues = await getUserLeagues(userId);
  if (userLeagues.length >= MAX_LEAGUES_PER_USER) {
    throw new Error(`Você já atingiu o limite máximo de ligas (${MAX_LEAGUES_PER_USER})`);
  }

  const createdLeagues = userLeagues.filter(l => l.adminId === userId);
  if (createdLeagues.length >= MAX_CREATED_LEAGUES_PER_USER) {
    throw new Error(`Você já atingiu o limite de criação de ligas (${MAX_CREATED_LEAGUES_PER_USER})`);
  }

  const nameDocRef = doc(db, 'leagueNames', nameLower);
  const nameDoc = await getDoc(nameDocRef);
  if (nameDoc.exists()) {
    throw new Error('Este nome de liga já está em uso.');
  }

  const leagueRef = doc(collection(db, 'leagues'));
  const leagueId = leagueRef.id;

  const newLeague: League = {
    id: leagueId,
    name: name.trim(),
    nameLower,
    adminId: userId,
    participantIds: [userId],
    createdAt: new Date(),
  };

  await setDoc(nameDocRef, { leagueId });
  await setDoc(leagueRef, newLeague);

  return newLeague;
}

export async function joinLeague(leagueId: string, userId: string): Promise<void> {
  const userLeagues = await getUserLeagues(userId);
  if (userLeagues.length >= MAX_LEAGUES_PER_USER) {
    throw new Error(`Você já está no limite máximo de ligas (${MAX_LEAGUES_PER_USER})`);
  }

  const leagueRef = doc(db, 'leagues', leagueId);
  const snap = await getDoc(leagueRef);
  if (!snap.exists()) throw new Error('Liga não encontrada');
  
  const data = snap.data() as League;
  if (data.participantIds.includes(userId)) return;

  await updateDoc(leagueRef, {
    participantIds: [...data.participantIds, userId]
  });
}

export async function leaveLeague(leagueId: string, userId: string): Promise<void> {
  const leagueRef = doc(db, 'leagues', leagueId);
  const snap = await getDoc(leagueRef);
  if (!snap.exists()) throw new Error('Liga não encontrada');
  
  const data = snap.data() as League;
  const newParticipants = data.participantIds.filter(id => id !== userId);

  await updateDoc(leagueRef, {
    participantIds: newParticipants
  });
}

export async function removeParticipant(leagueId: string, adminId: string, participantIdToRemove: string): Promise<void> {
  const leagueRef = doc(db, 'leagues', leagueId);
  const snap = await getDoc(leagueRef);
  if (!snap.exists()) throw new Error('Liga não encontrada');
  
  const data = snap.data() as League;
  if (data.adminId !== adminId) throw new Error('Apenas o admin pode remover participantes');

  const newParticipants = data.participantIds.filter(id => id !== participantIdToRemove);

  await updateDoc(leagueRef, {
    participantIds: newParticipants
  });
}

export async function deleteLeague(leagueId: string, adminId: string): Promise<void> {
  const leagueRef = doc(db, 'leagues', leagueId);
  const snap = await getDoc(leagueRef);
  if (!snap.exists()) return;
  
  const data = snap.data() as League;
  if (data.adminId !== adminId) throw new Error('Apenas o admin pode deletar a liga');

  await deleteDoc(doc(db, 'leagueNames', data.nameLower));
  await deleteDoc(leagueRef);
}

export async function getLeagueRankings(participantIds: string[]): Promise<Ranking[]> {
  if (!participantIds || participantIds.length === 0) return [];

  const chunkSize = 30;
  const chunks: string[][] = [];
  for (let i = 0; i < participantIds.length; i += chunkSize) {
    chunks.push(participantIds.slice(i, i + chunkSize));
  }

  const rankingPromises = chunks.map(async (chunk) => {
    const q = query(collection(db, 'rankings'), where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Ranking);
  });

  const resultsArray = await Promise.all(rankingPromises);
  const allRankings = resultsArray.flat();

  allRankings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if ((b.exactScores || 0) !== (a.exactScores || 0)) return (b.exactScores || 0) - (a.exactScores || 0);
    return (b.correctWinners || 0) - (a.correctWinners || 0);
  });

  return allRankings;
}
