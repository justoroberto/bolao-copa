'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PredictionCard from '@/components/PredictionCard';
import { Match, Prediction } from '@/lib/firebase/models';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { WORLD_CUP_MATCHES } from '@/lib/data/worldCup2026';

import { doc, setDoc } from 'firebase/firestore';

export default function PredictionsPage() {
  const { user } = useAuth();
  const t = useTranslations('Navigation');
  const [matches, setMatches] = useState<Match[]>(WORLD_CUP_MATCHES);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loadingPreds, setLoadingPreds] = useState(true);

  const handleSeedDB = async () => {
    try {
      for (const match of WORLD_CUP_MATCHES) {
        await setDoc(doc(db, 'matches', match.id), match);
      }
      alert("Banco populado com sucesso! Recarregue a página.");
    } catch (e) {
      alert("Erro ao popular: " + e);
    }
  };

  // Busca os palpites que o usuário já fez no Firestore
  useEffect(() => {
    async function fetchPredictions() {
      if (!user) return;
      
      try {
        const q = query(collection(db, 'predictions'), where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        
        const predsMap: Record<string, Prediction> = {};
        snapshot.forEach((doc) => {
          const data = doc.data() as Prediction;
          predsMap[data.matchId] = data;
        });
        
        setPredictions(predsMap);
      } catch (error) {
        console.error("Erro ao carregar previsões: ", error);
      } finally {
        setLoadingPreds(false);
      }
    }

    fetchPredictions();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="predictions-container">
        <header className="page-header">
          <h1>{t('predictions')}</h1>
          <p>Dê seus palpites nos jogos abaixo. Você tem até 1 dia (24 horas) antes de cada partida para editar.</p>
          <button onClick={handleSeedDB} style={{ marginTop: '10px', background: 'blue', color: 'white', padding: '10px' }}>
            [DEV] Preencher Banco com Jogos
          </button>
        </header>

        {loadingPreds ? (
          <div className="loading-state">Carregando seus palpites...</div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <PredictionCard 
                key={match.id} 
                match={match} 
                prediction={predictions[match.id]} 
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
